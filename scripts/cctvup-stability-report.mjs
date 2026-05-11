#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeSensitiveBundle } from './lib/sensitive-output.mjs';

const DEFAULT_BASE_URL = 'http://localhost:3002';
const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_SUPABASE_TIMEOUT_MS = 8000;
const ACTIVE_STATE_STATUSES = new Set(['watching', 'open', 'recovering']);
const EXCLUDED_FARM_IDS = new Set(['FA0000', 'FA0001']);
const EXCLUDED_FARM_ID_FILTER = 'not.in.(FA0000,FA0001)';

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

function createTimeoutSignal(timeoutMs) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return undefined;
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(timeoutMs);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

async function fetchJson(url, options = {}) {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
    headers: options.headers,
    signal: createTimeoutSignal(timeoutMs),
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(`${url} ${response.status}: ${text.slice(0, 180) || response.statusText}`);
  }

  return payload;
}

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !serviceKey) return null;
  return {
    supabaseUrl: supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl,
    serviceKey,
  };
}

function buildSupabaseUrl(config, tableAndQuery) {
  return `${config.supabaseUrl}/rest/v1/${tableAndQuery}`;
}

async function fetchSupabaseRows(config, tableAndQuery) {
  return fetchJson(buildSupabaseUrl(config, tableAndQuery), {
    timeoutMs: Number(process.env.CCTVUP_STABILITY_SUPABASE_TIMEOUT_MS || DEFAULT_SUPABASE_TIMEOUT_MS),
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      Accept: 'application/json',
    },
  });
}

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function minutesBetween(left, right) {
  const leftDate = toDate(left);
  const rightDate = toDate(right);
  if (!leftDate || !rightDate) return null;
  return Math.round((leftDate.getTime() - rightDate.getTime()) / 60000);
}

function formatMinutes(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-';
  return `${value}분`;
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

function markdownTable(rows, columns, limit = 80) {
  const visibleRows = rows.slice(0, limit);
  if (!visibleRows.length) return '_해당 없음_';
  const header = `| ${columns.map((column) => column.label).join(' | ')} |`;
  const divider = `| ${columns.map(() => '---').join(' | ')} |`;
  const body = visibleRows.map((row) => `| ${columns.map((column) => String(row[column.key] ?? '').replace(/\|/g, '/')).join(' | ')} |`);
  const suffix = rows.length > limit ? `\n\n_외 ${rows.length - limit}건은 CSV 전체 목록 확인._` : '';
  return [header, divider, ...body].join('\n') + suffix;
}

function countBy(rows, keyFn) {
  const counts = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => String(a).localeCompare(String(b), 'ko-KR')));
}

function classifyRunInterval(minutes) {
  if (minutes === null) return '기준';
  if (minutes < 4) return '수동/재기동';
  if (minutes <= 7) return '정상';
  return '지연';
}

function parseNoteField(note, key) {
  const parts = String(note || '').split(';').map((part) => part.trim());
  const prefix = `${key}=`;
  const match = parts.find((part) => part.startsWith(prefix));
  return match ? match.slice(prefix.length) : '';
}

function buildRunIntervals(checkRuns) {
  return checkRuns.map((run, index) => {
    const previous = checkRuns[index + 1];
    const intervalMinutes = previous ? minutesBetween(run.checked_at, previous.checked_at) : null;
    const note = run.note || '';
    return {
      id: run.id,
      checkedAt: run.checked_at,
      source: run.source,
      caller: parseNoteField(note, 'caller') || 'unknown',
      method: parseNoteField(note, 'method'),
      host: parseNoteField(note, 'host'),
      issueCount: Number(run.issue_count ?? Number(run.late_count ?? 0) + Number(run.missing_count ?? 0) + Number(run.critical_count ?? 0)),
      okCount: Number(run.ok_count ?? 0),
      lateCount: Number(run.late_count ?? 0),
      missingCount: Number(run.missing_count ?? 0),
      criticalCount: Number(run.critical_count ?? 0),
      pausedCount: Number(run.paused_count ?? 0),
      intervalMinutes,
      intervalLabel: classifyRunInterval(intervalMinutes),
      note,
    };
  });
}

function normalizeState(row) {
  return {
    id: row.id,
    runId: row.run_id,
    cameraKey: row.camera_key,
    farmId: row.farm_id,
    houseId: row.house_id,
    moduleId: row.module_id,
    farmName: row.farm_name || '',
    houseName: row.house_name || '',
    cameraName: row.camera_name || '',
    status: row.status,
    latestImageAt: row.latest_image_at || '',
    lastCheckedAt: row.last_checked_at || '',
    missCount: Number(row.miss_count ?? 0),
    openedAt: row.opened_at || '',
    message: row.message || '',
  };
}

function isExcludedFarmId(farmId) {
  return EXCLUDED_FARM_IDS.has(String(farmId || '').trim().toUpperCase());
}

function getStateScope(state, rowById, activeKeys, nonActiveKeys) {
  if (activeKeys.has(state.cameraKey)) return '현재 감시중';
  if (nonActiveKeys.has(state.cameraKey)) return `현재 ${rowById.get(state.cameraKey)?.monitorScopeLabel || '비감시범위'}`;
  return '현재 목록 없음';
}

function buildStaleRows(states, rowById, activeKeys, nonActiveKeys) {
  return states
    .filter((state) => !activeKeys.has(state.cameraKey))
    .map((state) => {
      const currentRow = rowById.get(state.cameraKey);
      return {
        cameraKey: state.cameraKey,
        staleKind: nonActiveKeys.has(state.cameraKey) ? '비감시범위에 남은 state' : '현재 목록에 없는 state',
        currentScope: getStateScope(state, rowById, activeKeys, nonActiveKeys),
        stateStatus: state.status,
        farmId: state.farmId,
        farmName: currentRow?.farmName || state.farmName,
        houseId: state.houseId,
        houseName: currentRow?.houseName || state.houseName,
        moduleId: state.moduleId,
        cameraName: currentRow?.cameraName || state.cameraName,
        lastCheckedAt: state.lastCheckedAt,
        openedAt: state.openedAt,
        missCount: state.missCount,
        currentReason: currentRow?.reason || '',
        message: state.message,
      };
    })
    .sort((a, b) => a.staleKind.localeCompare(b.staleKind, 'ko-KR') || a.farmId.localeCompare(b.farmId) || a.cameraKey.localeCompare(b.cameraKey));
}

function buildNeedsReviewRows(rows) {
  return rows
    .filter((row) => row.monitorScopeCode === 'needs_review')
    .map((row) => ({
      farmId: row.farm,
      farmName: row.farmName || row.farm,
      affiliates: row.farmAffiliates || '',
      country: row.country || '',
      houseId: row.house,
      houseName: row.houseName || '',
      moduleId: row.camera,
      cameraName: row.cameraName || '',
      cycleBucket: row.cycleBucketLabel || '',
      gateway: row.gatewayStatuses || '',
      latestAt: row.latestAtIso || row.latestAt || '',
      ageMinutes: Number(row.ageMinutes ?? 0),
      rate1h: row.rate1h || '',
      rate24h: row.rate24h || '',
      reason: row.reason || '',
    }))
    .sort((a, b) => a.farmName.localeCompare(b.farmName, 'ko-KR') || a.houseId.localeCompare(b.houseId) || a.moduleId.localeCompare(b.moduleId));
}

function summarizeNeedsReviewByFarm(rows) {
  const groups = new Map();
  for (const row of rows) {
    const current = groups.get(row.farmId) ?? {
      farmId: row.farmId,
      farmName: row.farmName,
      affiliates: row.affiliates,
      country: row.country,
      cameraCount: 0,
      cycleBuckets: new Set(),
      gateways: new Set(),
      latestAt: '',
      reasons: new Set(),
    };
    current.cameraCount += 1;
    if (row.cycleBucket) current.cycleBuckets.add(row.cycleBucket);
    if (row.gateway) current.gateways.add(row.gateway);
    if (row.reason) current.reasons.add(row.reason);
    if (String(row.latestAt) > String(current.latestAt)) current.latestAt = row.latestAt;
    groups.set(row.farmId, current);
  }

  return [...groups.values()]
    .map((row) => ({
      ...row,
      cycleBuckets: [...row.cycleBuckets].join(' / '),
      gateways: [...row.gateways].join(' / '),
      reasons: [...row.reasons].slice(0, 3).join(' / '),
    }))
    .sort((a, b) => b.cameraCount - a.cameraCount || a.farmName.localeCompare(b.farmName, 'ko-KR'));
}

function createMarkdownReport({
  checkedAt,
  baseUrl,
  payload,
  checkRuns,
  runIntervals,
  allStates,
  activeStates,
  applicableStates,
  staleRows,
  needsReviewRows,
  needsReviewFarmRows,
  output,
}) {
  const latestRun = checkRuns[0];
  const latestRunAgeMinutes = latestRun ? minutesBetween(checkedAt, latestRun.checked_at) : null;
  const intervalCounts = countBy(runIntervals, (row) => row.intervalLabel);
  const staleCounts = countBy(staleRows, (row) => row.staleKind);
  const scopeCounts = countBy(payload.rows, (row) => row.monitorScopeLabel || row.monitorScopeCode || 'unknown');
  const stateCounts = countBy(allStates, (row) => row.status);
  const activeIssueRows = payload.rows.filter((row) => (row.monitorScopeCode || 'active') === 'active' && row.status !== 'ok' && row.status !== 'paused');
  const nonActiveIssueRows = payload.rows.filter((row) => (row.monitorScopeCode || 'active') !== 'active' && row.status !== 'paused');
  const healthFlags = [
    payload.source === 'db' ? '현재 목록 DB 연결 정상' : `현재 목록 source=${payload.source}`,
    payload.stateSync?.status === 'applied' ? '상태머신 반영' : `상태머신 ${payload.stateSync?.status || '없음'}`,
    latestRunAgeMinutes !== null && latestRunAgeMinutes <= 10 ? '최근 check run 10분 이내' : `최근 check run ${formatMinutes(latestRunAgeMinutes)}`,
    nonActiveIssueRows.length === 0 ? '비감시범위 문제 표시 없음' : `비감시범위 문제 표시 ${nonActiveIssueRows.length}건`,
    staleRows.length ? `stale state ${staleRows.length}건 보관 중` : 'stale state 없음',
  ];
  const runColumns = [
    { key: 'checkedAt', label: 'checked_at' },
    { key: 'intervalLabel', label: '간격판정' },
    { key: 'intervalMinutes', label: '간격분' },
    { key: 'caller', label: 'caller' },
    { key: 'host', label: 'host' },
    { key: 'issueCount', label: 'issue' },
    { key: 'lateCount', label: 'watch' },
    { key: 'criticalCount', label: 'open' },
    { key: 'missingCount', label: 'recovering' },
    { key: 'pausedCount', label: 'paused' },
  ];
  const staleColumns = [
    { key: 'staleKind', label: '구분' },
    { key: 'currentScope', label: '현재범위' },
    { key: 'stateStatus', label: 'state' },
    { key: 'farmId', label: '농장ID' },
    { key: 'farmName', label: '농장명' },
    { key: 'houseId', label: '축사' },
    { key: 'moduleId', label: '카메라' },
    { key: 'lastCheckedAt', label: '마지막체크' },
    { key: 'missCount', label: 'miss' },
  ];
  const needsReviewColumns = [
    { key: 'farmId', label: '농장ID' },
    { key: 'farmName', label: '농장명' },
    { key: 'cameraCount', label: '카메라' },
    { key: 'affiliates', label: '소속' },
    { key: 'country', label: '국가' },
    { key: 'cycleBuckets', label: '사육판정' },
    { key: 'gateways', label: 'gateway' },
    { key: 'latestAt', label: '최근이미지' },
    { key: 'reasons', label: '사유' },
  ];

  return `---
title: CCTVUP 안정화 점검 리포트
author: Codex
last_updated: 26.05.07
---

# CCTVUP 안정화 점검 리포트

## 1. 실행 정보
- 생성 시각: ${checkedAt}
- 기준 URL: ${baseUrl}
- 원본 운영 DB 접근: /api/cctvup 경유 읽기 전용
- Supabase 접근: REST GET 읽기 전용
- 상세 JSON: \`${output.jsonFileName}\`
- stale CSV: \`${output.staleCsvFileName}\`
- 대상확인 CSV: \`${output.needsReviewCsvFileName}\`

## 2. 현재 결론
${healthFlags.map((item) => `- ${item}`).join('\n')}

## 3. 현재 화면 요약
- source: ${payload.source}
- farms/cameras: ${payload.summary?.farms ?? 0} / ${payload.summary?.cameras ?? 0}
- 감시범위: ${JSON.stringify(scopeCounts)}
- 상태 요약: ok=${payload.summary?.ok ?? 0}, watching=${payload.summary?.watching ?? 0}, open=${payload.summary?.open ?? 0}, recovering=${payload.summary?.recovering ?? 0}, paused=${payload.summary?.paused ?? 0}
- issueCount: ${payload.summary?.issueCount ?? 0}
- stateSync: ${payload.stateSync?.status || '없음'} / ${payload.stateSync?.stateCount ?? 0}건 / ${payload.stateSync?.message || ''}

## 4. 5분 루프 최근 실행
- 최신 check run: ${latestRun?.checked_at || '-'}
- 최신 check run 경과: ${formatMinutes(latestRunAgeMinutes)}
- 최근 간격 판정: ${JSON.stringify(intervalCounts)}

${markdownTable(runIntervals, runColumns, 12)}

## 5. Supabase camera_state 비교
- 전체 camera_state: ${allStates.length}
- active status state(watching/open/recovering): ${activeStates.length}
- 현재 감시중 row에 매칭되는 state: ${applicableStates.length}
- stale state: ${staleRows.length}
- stale 구분: ${JSON.stringify(staleCounts)}
- Supabase state status: ${JSON.stringify(stateCounts)}

${markdownTable(staleRows, staleColumns, 40)}

## 6. 대상확인 목록
- 대상확인 카메라: ${needsReviewRows.length}
- 대상확인 농장: ${needsReviewFarmRows.length}

${markdownTable(needsReviewFarmRows, needsReviewColumns, 80)}

## 7. 운영 판단
- 지금 구조는 문제로그/상태머신을 감시중에만 적용하도록 동작한다.
- stale 활성 state는 화면에서 무시되며, 다음 체크 때 camera_state만 resolved로 닫혀 활성 조회에서 빠진다.
- 대상확인 농장은 사육정보 보완 또는 감시 제외 판단이 필요하다.
- 이 리포트는 삭제/수정 없이 읽기만 수행했다.
`;
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const baseUrl = (process.env.CCTVUP_STABILITY_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
const checkedAt = new Date().toISOString();
const currentPayload = await fetchJson(`${baseUrl}/api/cctvup/`, { timeoutMs: DEFAULT_TIMEOUT_MS });
const rowById = new Map(currentPayload.rows.map((row) => [row.id, row]));
const activeKeys = new Set(currentPayload.rows.filter((row) => (row.monitorScopeCode || 'active') === 'active').map((row) => row.id));
const nonActiveKeys = new Set(currentPayload.rows.filter((row) => (row.monitorScopeCode || 'active') !== 'active').map((row) => row.id));

const supabaseConfig = getSupabaseConfig();
if (!supabaseConfig) {
  throw new Error('SUPABASE_URL / SUPABASE_SERVICE_KEY 설정이 필요합니다.');
}

const checkRuns = await fetchSupabaseRows(
  supabaseConfig,
  'tbl_cctvup_check_runs?select=id,source,checked_at,table_name,farm_count,camera_count,ok_count,late_count,missing_count,critical_count,paused_count,note&source=eq.db&order=checked_at.desc&limit=12',
);
const allStateRows = await fetchSupabaseRows(
  supabaseConfig,
  `tbl_cctvup_camera_states?select=id,run_id,camera_key,farm_id,house_id,module_id,farm_name,house_name,camera_name,status,latest_image_at,last_checked_at,miss_count,opened_at,message&farm_id=${EXCLUDED_FARM_ID_FILTER}&order=last_checked_at.desc&limit=5000`,
);

const allStates = allStateRows.map(normalizeState).filter((state) => !isExcludedFarmId(state.farmId));
const activeStates = allStates.filter((state) => ACTIVE_STATE_STATUSES.has(state.status));
const applicableStates = activeStates.filter((state) => activeKeys.has(state.cameraKey));
const staleRows = buildStaleRows(activeStates, rowById, activeKeys, nonActiveKeys);
const needsReviewRows = buildNeedsReviewRows(currentPayload.rows);
const needsReviewFarmRows = summarizeNeedsReviewByFarm(needsReviewRows);
const runIntervals = buildRunIntervals(checkRuns);

const reportDate = checkedAt.slice(0, 10);
const mdFileName = `cctvup-stability-${reportDate}.md`;
const jsonFileName = `cctvup-stability-${reportDate}.json`;
const staleCsvFileName = `cctvup-stale-camera-states-${reportDate}.csv`;
const needsReviewCsvFileName = `cctvup-needs-review-${reportDate}.csv`;

const staleColumns = [
  { key: 'staleKind', label: '구분' },
  { key: 'currentScope', label: '현재범위' },
  { key: 'stateStatus', label: 'state' },
  { key: 'cameraKey', label: 'camera_key' },
  { key: 'farmId', label: '농장ID' },
  { key: 'farmName', label: '농장명' },
  { key: 'houseId', label: '축사ID' },
  { key: 'houseName', label: '축사명' },
  { key: 'moduleId', label: '카메라ID' },
  { key: 'cameraName', label: '카메라명' },
  { key: 'lastCheckedAt', label: '마지막체크' },
  { key: 'openedAt', label: '문제확정' },
  { key: 'missCount', label: 'miss' },
  { key: 'currentReason', label: '현재사유' },
  { key: 'message', label: 'state메시지' },
];
const needsReviewColumns = [
  { key: 'farmId', label: '농장ID' },
  { key: 'farmName', label: '농장명' },
  { key: 'affiliates', label: '소속' },
  { key: 'country', label: '국가' },
  { key: 'houseId', label: '축사ID' },
  { key: 'houseName', label: '축사명' },
  { key: 'moduleId', label: '카메라ID' },
  { key: 'cameraName', label: '카메라명' },
  { key: 'cycleBucket', label: '사육판정' },
  { key: 'gateway', label: 'gateway' },
  { key: 'latestAt', label: '최근이미지' },
  { key: 'ageMinutes', label: '지연분' },
  { key: 'rate1h', label: '1h' },
  { key: 'rate24h', label: '24h' },
  { key: 'reason', label: '사유' },
];

const output = { mdFileName, jsonFileName, staleCsvFileName, needsReviewCsvFileName };
const report = {
  ok: true,
  checkedAt,
  baseUrl,
  current: {
    source: currentPayload.source,
    summary: currentPayload.summary,
    stateSync: currentPayload.stateSync,
  },
  checkRuns: runIntervals,
  supabaseStates: {
    all: allStates.length,
    active: activeStates.length,
    applicableToCurrentActiveRows: applicableStates.length,
    stale: staleRows.length,
    byStatus: countBy(allStates, (row) => row.status),
    staleByKind: countBy(staleRows, (row) => row.staleKind),
  },
  needsReview: {
    cameraCount: needsReviewRows.length,
    farmCount: needsReviewFarmRows.length,
    byCycle: countBy(needsReviewRows, (row) => row.cycleBucket || 'unknown'),
    byAffiliates: countBy(needsReviewRows, (row) => row.affiliates || 'unknown'),
  },
};

const staleCsvContent = `${toCsv(staleRows, staleColumns)}\n`;
const needsReviewCsvContent = `${toCsv(needsReviewRows, needsReviewColumns)}\n`;
const mdContent = createMarkdownReport({
  checkedAt,
  baseUrl,
  payload: currentPayload,
  checkRuns,
  runIntervals,
  allStates,
  activeStates,
  applicableStates,
  staleRows,
  needsReviewRows,
  needsReviewFarmRows,
  output,
});
const encryptedOutput = writeSensitiveBundle({
  bundleName: `cctvup-stability-${reportDate}`,
  metadata: {
    kind: 'cctvup-stability-report',
    checkedAt,
    baseUrl,
    fileNames: [mdFileName, jsonFileName, staleCsvFileName, needsReviewCsvFileName],
  },
  files: [
    { name: mdFileName, contentType: 'text/markdown; charset=utf-8', content: mdContent },
    { name: jsonFileName, contentType: 'application/json; charset=utf-8', content: `${JSON.stringify(report, null, 2)}\n` },
    { name: staleCsvFileName, contentType: 'text/csv; charset=utf-8', content: staleCsvContent },
    { name: needsReviewCsvFileName, contentType: 'text/csv; charset=utf-8', content: needsReviewCsvContent },
  ],
});

console.log(JSON.stringify({ ...report, output: encryptedOutput }, null, 2));
