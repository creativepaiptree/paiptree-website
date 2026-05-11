#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import mysql from 'mysql2/promise';
import { writeSensitiveBundle } from './lib/sensitive-output.mjs';

const DEFAULT_REST_DAYS = 35;
const DEFAULT_QUERY_TIMEOUT_MS = 30000;
const REST_DAYS = Number(process.env.CCTVUP_AUDIT_REST_DAYS || DEFAULT_REST_DAYS);
const QUERY_TIMEOUT_MS = Number(process.env.CCTVUP_AUDIT_QUERY_TIMEOUT_MS || DEFAULT_QUERY_TIMEOUT_MS);
const DETAIL_LIMIT = Number(process.env.CCTVUP_AUDIT_DETAIL_LIMIT || 60);
const EXCLUDED_FARM_IDS = ['FA0000', 'FA0001'];
const EXCLUDED_FARM_SQL_PLACEHOLDERS = EXCLUDED_FARM_IDS.map(() => '?').join(',');
const READ_ONLY_SQL_PATTERN = /^(?:select|with|show)\b/i;
const LOCKING_READ_PATTERN = /\b(?:for\s+update|lock\s+in\s+share\s+mode)\b/i;

function loadEnvFile(fileName) {
  const filePath = resolve(process.cwd(), fileName);
  if (!existsSync(filePath)) return;

  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;

    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

function assertReadOnlySql(sql) {
  const normalizedSql = sql
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--.*$/gm, ' ')
    .trim()
    .replace(/;+$/g, '')
    .trim();

  if (!READ_ONLY_SQL_PATTERN.test(normalizedSql) || normalizedSql.includes(';') || LOCKING_READ_PATTERN.test(normalizedSql)) {
    throw new Error('CCTVUP audit는 원본 DB에 SELECT/WITH/SHOW 조회만 허용합니다.');
  }
}

async function executeReadOnly(connection, sql, values = []) {
  assertReadOnlySql(sql);
  const [rows] = await connection.execute({ sql, timeout: QUERY_TIMEOUT_MS }, values);
  return rows;
}

function getDbConfig() {
  const host = process.env.CCTVUP_DB_HOST?.trim();
  const user = process.env.CCTVUP_DB_USER?.trim();
  const password = process.env.CCTVUP_DB_PASSWORD;
  const database = process.env.CCTVUP_DB_DATABASE?.trim() || 'paip';
  const port = Number(process.env.CCTVUP_DB_PORT || 3306);

  if (!host || !user || !password || !Number.isFinite(port)) {
    throw new Error('CCTVUP_DB_HOST / CCTVUP_DB_USER / CCTVUP_DB_PASSWORD 설정이 필요합니다.');
  }

  return { host, user, password, database, port };
}

function toIso(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString();
}

function toLocalDate(value) {
  const iso = toIso(value);
  return iso ? iso.slice(0, 10) : '';
}

function numberValue(value) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function normalizeText(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function csvCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(rows, columns) {
  return [
    columns.map((column) => csvCell(column.label)).join(','),
    ...rows.map((row) => columns.map((column) => csvCell(row[column.key])).join(',')),
  ].join('\n');
}

function groupBy(rows, keyFn) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    const current = map.get(key) ?? [];
    current.push(row);
    map.set(key, current);
  }
  return map;
}

function summarizeRows(rows, keyFn) {
  const groups = groupBy(rows, keyFn);
  return [...groups.entries()]
    .map(([key, groupRows]) => ({
      key,
      farmCount: new Set(groupRows.map((row) => row.farmId)).size,
      houseCount: new Set(groupRows.map((row) => `${row.farmId}/${row.houseId}`)).size,
      cameraCount: groupRows.length,
      noImage24h: groupRows.filter((row) => row.imageCount24h === 0).length,
      sensorAlive24h: groupRows.filter((row) => row.sensorCount24h > 0).length,
    }))
    .sort((a, b) => b.cameraCount - a.cameraCount || a.key.localeCompare(b.key));
}

function getCycleBucket(row) {
  const inDate = row.in_date;
  const outDate = row.out_date;
  const daysSinceOut = Number(row.days_since_out);
  const daysUntilIn = Number(row.days_until_in);

  if (!row.parts_year && !row.parts_seq && !row.parts_status && !inDate && !outDate) {
    return { code: 'no_cycle_info', label: '사육정보 없음' };
  }
  if (Number.isFinite(daysUntilIn) && daysUntilIn > 0) {
    return { code: 'pre_placement', label: '입추 예정' };
  }
  if (inDate && (outDate === null || outDate === undefined || String(outDate) === '' || Number(row.days_until_out) >= 0)) {
    return { code: 'current_rearing', label: '현재 사육중' };
  }
  if (outDate && Number.isFinite(daysSinceOut) && daysSinceOut >= 0 && daysSinceOut <= REST_DAYS) {
    return { code: 'resting', label: `휴지기 D+${daysSinceOut}` };
  }
  if (outDate && Number.isFinite(daysSinceOut) && daysSinceOut > REST_DAYS) {
    return { code: 'long_idle', label: `출하후 ${daysSinceOut}일` };
  }
  return { code: 'unknown_cycle', label: '사육판정 불명' };
}

function getMonitorScope(row, cycleBucket) {
  if (row.gatewayInstalledCount <= 0) {
    return { code: 'uninstalled', label: '미설치' };
  }
  if (cycleBucket.code === 'current_rearing') {
    return { code: 'active', label: '감시중' };
  }
  if (cycleBucket.code === 'resting') {
    return { code: 'resting', label: '휴지기' };
  }
  return { code: 'needs_review', label: '대상확인' };
}

function getRecommendation(row) {
  if (row.monitorScopeCode === 'active' && row.imageCount24h === 0 && row.sensorCount24h > 0) {
    return '감시중 유지_CCTV확인';
  }
  if (row.monitorScopeCode === 'active' && row.imageCount24h === 0) {
    return '감시중 유지_수집망확인';
  }
  if (row.monitorScopeCode === 'active') {
    return '감시중 유지';
  }
  if (row.monitorScopeCode === 'resting') {
    return '휴지기 제외';
  }
  if (row.monitorScopeCode === 'uninstalled') {
    return '미설치 제외/확인';
  }
  return '대상확인 필요';
}

function createFarmSummary(rows) {
  const groups = groupBy(rows, (row) => row.farmId);
  return [...groups.values()]
    .map((groupRows) => {
      const first = groupRows[0];
      const recommendations = summarizeRows(groupRows, (row) => row.recommendation)
        .map((summary) => `${summary.key} ${summary.cameraCount}`)
        .join(' / ');
      const scopes = summarizeRows(groupRows, (row) => row.monitorScopeLabel)
        .map((summary) => `${summary.key} ${summary.cameraCount}`)
        .join(' / ');
      const latestImageAt = groupRows
        .map((row) => row.latestImageAt)
        .filter(Boolean)
        .sort()
        .at(-1) || '';
      const latestSensorAt = groupRows
        .map((row) => row.latestSensorAt)
        .filter(Boolean)
        .sort()
        .at(-1) || '';

      return {
        farmId: first.farmId,
        farmName: first.farmName,
        affiliates: first.affiliates,
        country: first.country,
        cameraCount: groupRows.length,
        noImage24h: groupRows.filter((row) => row.imageCount24h === 0).length,
        sensorAlive24h: groupRows.filter((row) => row.sensorCount24h > 0).length,
        scopes,
        recommendations,
        latestImageAt,
        latestSensorAt,
      };
    })
    .sort((a, b) => {
      const priority = (summary) => {
        if (summary.recommendations.includes('감시중 유지_CCTV확인')) return 0;
        if (summary.recommendations.includes('감시중 유지_수집망확인')) return 1;
        if (summary.recommendations.includes('대상확인 필요')) return 2;
        if (summary.recommendations.includes('휴지기 제외')) return 3;
        if (summary.recommendations.includes('미설치 제외/확인')) return 4;
        return 5;
      };
      return priority(a) - priority(b) || b.noImage24h - a.noImage24h || a.farmName.localeCompare(b.farmName);
    });
}

function markdownTable(rows, columns, limit = DETAIL_LIMIT) {
  const visibleRows = rows.slice(0, limit);
  if (!visibleRows.length) return '_해당 없음_';

  const header = `| ${columns.map((column) => column.label).join(' | ')} |`;
  const divider = `| ${columns.map(() => '---').join(' | ')} |`;
  const body = visibleRows.map((row) => `| ${columns.map((column) => String(row[column.key] ?? '').replace(/\|/g, '/')).join(' | ')} |`);
  const suffix = rows.length > limit ? `\n\n_외 ${rows.length - limit}건은 CSV 전체 목록을 확인._` : '';
  return [header, divider, ...body].join('\n') + suffix;
}

function createMarkdownReport({ checkedAt, dbNow, rows, farmSummary, csvFileName }) {
  const byScope = summarizeRows(rows, (row) => row.monitorScopeLabel);
  const byRecommendation = summarizeRows(rows, (row) => row.recommendation);
  const byCycle = summarizeRows(rows, (row) => row.cycleBucketLabel);
  const activeNoImage = farmSummary.filter((row) => row.recommendations.includes('감시중 유지_CCTV확인') || row.recommendations.includes('감시중 유지_수집망확인'));
  const resting = farmSummary.filter((row) => row.recommendations.includes('휴지기 제외'));
  const needsReview = farmSummary.filter((row) => row.recommendations.includes('대상확인 필요'));
  const uninstalled = farmSummary.filter((row) => row.recommendations.includes('미설치 제외/확인'));

  const summaryColumns = [
    { key: 'key', label: '구분' },
    { key: 'farmCount', label: '농장' },
    { key: 'houseCount', label: '축사' },
    { key: 'cameraCount', label: '카메라' },
    { key: 'noImage24h', label: '24h 이미지 0' },
    { key: 'sensorAlive24h', label: '24h 센서 있음' },
  ];
  const farmColumns = [
    { key: 'farmId', label: '농장ID' },
    { key: 'farmName', label: '농장명' },
    { key: 'cameraCount', label: '카메라' },
    { key: 'noImage24h', label: '이미지0' },
    { key: 'sensorAlive24h', label: '센서있음' },
    { key: 'scopes', label: '감시범위' },
    { key: 'recommendations', label: '추천처리' },
    { key: 'latestImageAt', label: '최근이미지' },
    { key: 'latestSensorAt', label: '최근센서' },
  ];

  return `---
title: CCTVUP 감시대상 자동 전수조사 리포트
author: Codex
last_updated: 26.05.09
---

# CCTVUP 감시대상 자동 전수조사 리포트

## 1. 실행 정보
- 생성 시각: ${checkedAt}
- DB 기준 시각: ${dbNow}
- 휴지기 기준: 출하 후 ${REST_DAYS}일 이내
- 원본 DB 접근: SELECT/WITH/SHOW 읽기 전용
- 전체 상세 CSV: \`${csvFileName}\`

## 2. 판정 기준
- 감시중: gateway 설치 + 현재 사육중
- 휴지기: gateway 설치 + 출하 후 ${REST_DAYS}일 이내
- 대상확인: gateway 설치 + 사육정보 없음/출하 후 ${REST_DAYS}일 초과/판정 불명
- 미설치: gateway 설치 상태가 설치가 아님
- 문제로그 후보는 감시중 중 이미지 수집이 멈춘 카메라로 제한한다.
- 센서 수집 여부는 장애 확정 기준이 아니라 원인 분류 보조 근거로만 쓴다.

## 3. 감시범위 요약
${markdownTable(byScope, summaryColumns, 20)}

## 4. 추천처리 요약
${markdownTable(byRecommendation, summaryColumns, 20)}

## 5. 사육/휴지 판정 요약
${markdownTable(byCycle, summaryColumns, 20)}

## 6. 감시중인데 이미지 0건인 농장
${markdownTable(activeNoImage, farmColumns)}

## 7. 휴지기 제외 후보
${markdownTable(resting, farmColumns)}

## 8. 대상확인 필요 후보
${markdownTable(needsReview, farmColumns)}

## 9. 미설치 제외/확인 후보
${markdownTable(uninstalled, farmColumns)}

## 10. 적용 전 체크
- 이 리포트는 원본 운영 DB를 읽기 전용으로 조사하며, 자체적으로 원본 DB나 Supabase 상태를 변경하지 않는다.
- 현재 /cctvup 로직은 감시중만 상태머신/issue event 대상으로 본다.
- 휴지기/대상확인/미설치로 빠진 카메라의 과거 opened state는 다음 체크 때 camera_state만 resolved로 닫아 활성 목록에서 제외한다.
- 이 정리는 감시범위 변경 처리이며 카메라 회복 이벤트로 보지 않으므로 issue_events에는 새 이벤트를 남기지 않는다.
`;
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const dbConfig = getDbConfig();
const connection = await mysql.createConnection({
  ...dbConfig,
  connectTimeout: 5000,
  supportBigNumbers: true,
  dateStrings: false,
});

try {
  const startedAt = Date.now();
  const [{ db_now: dbNow }] = await executeReadOnly(connection, 'SELECT NOW() AS db_now');
  const activeRows = await executeReadOnly(connection, `
    SELECT
      c.farm_id,
      COALESCE(NULLIF(TRIM(s.farm_name), ''), c.farm_id) AS farm_name,
      COALESCE(NULLIF(TRIM(s.affiliates), ''), '') AS affiliates,
      COALESCE(NULLIF(TRIM(s.country), ''), '') AS country,
      c.house_id,
      COALESCE(NULLIF(TRIM(h.house_name), ''), c.house_id) AS house_name,
      c.cctv_id,
      c.cctv_name,
      COALESCE(g.installed_count, 0) AS gateway_installed_count,
      COALESCE(g.gateway_statuses, 'gateway 없음') AS gateway_statuses,
      COALESCE(g.gateway_types, '') AS gateway_types,
      latest.parts_status,
      latest.parts_year,
      latest.parts_seq,
      latest.in_date,
      latest.out_date,
      DATEDIFF(NOW(), latest.in_date) AS days_since_in,
      DATEDIFF(latest.in_date, NOW()) AS days_until_in,
      DATEDIFF(NOW(), latest.out_date) AS days_since_out,
      DATEDIFF(latest.out_date, NOW()) AS days_until_out
    FROM tbl_farm_cctv c
    LEFT JOIN tbl_farm_service s
      ON s.farm_id = c.farm_id
    LEFT JOIN tbl_farm_house h
      ON h.farm_id = c.farm_id AND h.house_id = c.house_id
    LEFT JOIN (
      SELECT
        farm_id,
        SUM(install_status = '설치') AS installed_count,
        GROUP_CONCAT(DISTINCT install_status ORDER BY install_status SEPARATOR ',') AS gateway_statuses,
        GROUP_CONCAT(DISTINCT gateway_type ORDER BY gateway_type SEPARATOR ',') AS gateway_types
      FROM tbl_farm_gateway
      GROUP BY farm_id
    ) g
      ON g.farm_id = c.farm_id
    LEFT JOIN (
      SELECT bh.*
      FROM tbl_farm_house_breed_hist bh
      JOIN (
        SELECT farm_id, house_id, MAX(seq) AS max_seq
        FROM tbl_farm_house_breed_hist
        GROUP BY farm_id, house_id
      ) latest_key
        ON latest_key.farm_id = bh.farm_id
        AND latest_key.house_id = bh.house_id
        AND latest_key.max_seq = bh.seq
    ) latest
      ON latest.farm_id = c.farm_id AND latest.house_id = c.house_id
    WHERE c.applied = 1
      AND c.display = 'YES'
      AND c.is_working = 'Y'
      AND c.farm_id NOT IN (${EXCLUDED_FARM_SQL_PLACEHOLDERS})
    ORDER BY c.farm_id, c.house_id, c.cctv_id
  `, EXCLUDED_FARM_IDS);

  const farmIds = [...new Set(activeRows.map((row) => row.farm_id))];
  const placeholders = farmIds.map(() => '?').join(',');
  const imageRows = farmIds.length
    ? await executeReadOnly(connection, `
      SELECT
        i.FARM_ID AS farm_id,
        i.HOUSE_ID AS house_id,
        REPLACE(i.MODULE_ID, ',1', '') AS cctv_id,
        MAX(i.MODULE_ID) AS module_id,
        MAX(i.CREATE_TIME) AS latest_image_at,
        SUM(i.CREATE_TIME >= DATE_SUB(NOW(), INTERVAL 1 HOUR)) AS image_count_1h,
        COUNT(*) AS image_count_24h
      FROM tbl_farm_image i FORCE INDEX (idx_farm_house_module_createtime)
      WHERE i.FARM_ID IN (${placeholders})
        AND i.CREATE_TIME >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        AND i.CREATE_TIME <= NOW()
      GROUP BY i.FARM_ID, i.HOUSE_ID, REPLACE(i.MODULE_ID, ',1', '')
    `, farmIds)
    : [];
  const sensorRows = farmIds.length
    ? await executeReadOnly(connection, `
      SELECT
        FARM_ID AS farm_id,
        HOUSE_ID AS house_id,
        MAX(CREATE_TIME) AS latest_sensor_at,
        COUNT(*) AS sensor_count_24h,
        COUNT(DISTINCT SENSOR_TYPE) AS sensor_type_count,
        GROUP_CONCAT(DISTINCT SENSOR_TYPE ORDER BY SENSOR_TYPE SEPARATOR ',') AS sensor_types
      FROM tbl_farm_sensor FORCE INDEX (idx_tbl_farm_sensor_01)
      WHERE FARM_ID IN (${placeholders})
        AND CREATE_TIME >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        AND CREATE_TIME <= NOW()
      GROUP BY FARM_ID, HOUSE_ID
    `, farmIds)
    : [];

  const imageMap = new Map(imageRows.map((row) => [`${row.farm_id}/${row.house_id}/${row.cctv_id}`, row]));
  const sensorMap = new Map(sensorRows.map((row) => [`${row.farm_id}/${row.house_id}`, row]));
  const rows = activeRows.map((row) => {
    const image = imageMap.get(`${row.farm_id}/${row.house_id}/${row.cctv_id}`) ?? {};
    const sensor = sensorMap.get(`${row.farm_id}/${row.house_id}`) ?? {};
    const cycleBucket = getCycleBucket(row);
    const base = {
      farmId: normalizeText(row.farm_id),
      farmName: normalizeText(row.farm_name, row.farm_id),
      affiliates: normalizeText(row.affiliates),
      country: normalizeText(row.country),
      houseId: normalizeText(row.house_id),
      houseName: normalizeText(row.house_name, row.house_id),
      cctvId: normalizeText(row.cctv_id),
      cctvName: normalizeText(row.cctv_name),
      gatewayInstalledCount: numberValue(row.gateway_installed_count),
      gatewayStatuses: normalizeText(row.gateway_statuses, 'gateway 없음'),
      gatewayTypes: normalizeText(row.gateway_types),
      partsStatus: normalizeText(row.parts_status),
      partsYear: normalizeText(row.parts_year),
      partsSeq: normalizeText(row.parts_seq),
      inDate: toLocalDate(row.in_date),
      outDate: toLocalDate(row.out_date),
      daysSinceIn: row.days_since_in ?? '',
      daysSinceOut: row.days_since_out ?? '',
      cycleBucketCode: cycleBucket.code,
      cycleBucketLabel: cycleBucket.label,
      latestImageAt: toIso(image.latest_image_at),
      imageCount1h: numberValue(image.image_count_1h),
      imageCount24h: numberValue(image.image_count_24h),
      latestSensorAt: toIso(sensor.latest_sensor_at),
      sensorCount24h: numberValue(sensor.sensor_count_24h),
      sensorTypeCount: numberValue(sensor.sensor_type_count),
      sensorTypes: normalizeText(sensor.sensor_types),
    };
    const monitorScope = getMonitorScope(base, cycleBucket);
    const withScope = {
      ...base,
      monitorScopeCode: monitorScope.code,
      monitorScopeLabel: monitorScope.label,
    };
    return {
      ...withScope,
      recommendation: getRecommendation(withScope),
    };
  });

  const reportDate = new Date().toISOString().slice(0, 10);
  const csvFileName = `cctvup-monitor-scope-audit-${reportDate}.csv`;
  const mdFileName = `cctvup-monitor-scope-audit-${reportDate}.md`;
  const jsonFileName = `cctvup-monitor-scope-audit-${reportDate}.summary.json`;
  const checkedAt = new Date().toISOString();
  const farmSummary = createFarmSummary(rows);
  const csvColumns = [
    { key: 'recommendation', label: '추천처리' },
    { key: 'monitorScopeLabel', label: '감시범위' },
    { key: 'cycleBucketLabel', label: '사육판정' },
    { key: 'farmId', label: '농장ID' },
    { key: 'farmName', label: '농장명' },
    { key: 'affiliates', label: '소속' },
    { key: 'country', label: '국가' },
    { key: 'houseId', label: '축사ID' },
    { key: 'houseName', label: '축사명' },
    { key: 'cctvId', label: 'CCTV ID' },
    { key: 'cctvName', label: 'CCTV명' },
    { key: 'gatewayStatuses', label: 'gateway 상태' },
    { key: 'gatewayTypes', label: 'gateway 타입' },
    { key: 'partsStatus', label: 'parts_status' },
    { key: 'partsYear', label: 'parts_year' },
    { key: 'partsSeq', label: 'parts_seq' },
    { key: 'inDate', label: '입추일' },
    { key: 'outDate', label: '출하일' },
    { key: 'daysSinceIn', label: '입추후일수' },
    { key: 'daysSinceOut', label: '출하후일수' },
    { key: 'imageCount1h', label: '이미지1h' },
    { key: 'imageCount24h', label: '이미지24h' },
    { key: 'latestImageAt', label: '최근이미지' },
    { key: 'sensorCount24h', label: '센서24h' },
    { key: 'latestSensorAt', label: '최근센서' },
    { key: 'sensorTypes', label: '센서타입' },
  ];

  const csvContent = `${toCsv(rows, csvColumns)}\n`;
  const mdContent = createMarkdownReport({
    checkedAt,
    dbNow: toIso(dbNow),
    rows,
    farmSummary,
    csvFileName,
  });
  const summary = {
    ok: true,
    checkedAt,
    dbNow: toIso(dbNow),
    restDays: REST_DAYS,
    elapsedMs: Date.now() - startedAt,
    activeFarmCount: new Set(rows.map((row) => row.farmId)).size,
    activeHouseCount: new Set(rows.map((row) => `${row.farmId}/${row.houseId}`)).size,
    activeCameraCount: rows.length,
    byScope: summarizeRows(rows, (row) => row.monitorScopeLabel),
    byRecommendation: summarizeRows(rows, (row) => row.recommendation),
    byCycle: summarizeRows(rows, (row) => row.cycleBucketLabel),
  };
  const encryptedOutput = writeSensitiveBundle({
    bundleName: `cctvup-monitor-scope-audit-${reportDate}`,
    metadata: {
      kind: 'cctvup-monitor-scope-audit',
      checkedAt,
      dbNow: toIso(dbNow),
      restDays: REST_DAYS,
      elapsedMs: Date.now() - startedAt,
      fileNames: [mdFileName, csvFileName, jsonFileName],
    },
    files: [
      { name: mdFileName, contentType: 'text/markdown; charset=utf-8', content: mdContent },
      { name: csvFileName, contentType: 'text/csv; charset=utf-8', content: csvContent },
      { name: jsonFileName, contentType: 'application/json; charset=utf-8', content: `${JSON.stringify(summary, null, 2)}\n` },
    ],
  });

  console.log(JSON.stringify({
    ...summary,
    output: encryptedOutput,
  }, null, 2));
} finally {
  await connection.end().catch(() => undefined);
}
