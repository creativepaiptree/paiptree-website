import type { CctvUpCheckRun } from '@/lib/cctvup';
import mysql from 'mysql2/promise';
import type { ExecuteValues, QueryOptions, RowDataPacket } from 'mysql2';
import { fetchCctvUpCurrentPayload } from '@/lib/cctvup-current';
import { CCTVUP_EXCLUDED_FARM_IDS } from '@/lib/cctvup-exclusions';
import { getCctvUpSupabaseConfig } from '@/lib/cctvup-history';
import { fetchCctvUpFarmRegistry } from '@/lib/cctvup-registry';
import {
  fetchCctvUpActiveCameraStates,
  fetchCctvUpFarmScopeEvents,
  fetchCctvUpIssueEvents,
} from '@/lib/cctvup-state';
import {
  buildCctvUpDailyReportDocument,
  buildFarmMetadataFromRows,
  buildKstReportRange,
  normalizeCctvUpReportDate,
  writeCctvUpDailyReportFiles,
} from '@/lib/cctvup-daily-report.js';

type SupabaseCheckRunRow = {
  id: string;
  source: CctvUpCheckRun['source'];
  checked_at: string;
  table_name: string;
  farm_count: number;
  camera_count: number;
  ok_count: number;
  late_count: number;
  missing_count: number;
  critical_count: number;
  paused_count: number;
  issue_count?: number | null;
};

type GenerateCctvUpDailyReportOptions = {
  date?: string;
  rootDir?: string;
  now?: Date;
};

const DAILY_REPORT_FETCH_TIMEOUT_MS = Number(process.env.CCTVUP_DAILY_REPORT_FETCH_TIMEOUT_MS || 8000);
const DAILY_REPORT_EVENT_LIMIT = Number(process.env.CCTVUP_DAILY_REPORT_EVENT_LIMIT || 1000);
const DAILY_REPORT_CHECK_RUN_LIMIT = Number(process.env.CCTVUP_DAILY_REPORT_CHECK_RUN_LIMIT || 500);
const DAILY_REPORT_DB_QUERY_TIMEOUT_MS = Number(process.env.CCTVUP_DAILY_REPORT_DB_QUERY_TIMEOUT_MS || process.env.CCTVUP_DB_QUERY_TIMEOUT_MS || 10000);
const READ_ONLY_SQL_PATTERN = /^(?:select|with)\b/i;
const LOCKING_READ_PATTERN = /\b(?:for\s+update|lock\s+in\s+share\s+mode)\b/i;
const EXCLUDED_FARM_SQL_PLACEHOLDERS = CCTVUP_EXCLUDED_FARM_IDS.map(() => '?').join(', ');

type CctvUpFlockMovementDbRow = RowDataPacket & {
  movement_kind: 'placement' | 'shipment';
  report_bucket: 'actual_date' | 'registered_late';
  create_time: string | Date | null;
  actual_at: string | Date | null;
  actual_date: string | Date | null;
  farm_id: string;
  farm_name: string | null;
  farm_alias: string | null;
  farm_affiliates: string | null;
  country: string | null;
  house_id: string;
  house_name: string | null;
  parts_year: string | null;
  parts_seq: string | null;
  movement_type: string | null;
  bird_count: number | string | null;
  average_weight: number | string | null;
  source: string | null;
  breed_kind: string | null;
  memo: string | null;
  input_count: number | string | null;
  output_count: number | string | null;
  dead_count: number | string | null;
  kill_count: number | string | null;
};

function createTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return undefined;
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(timeoutMs);
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

function getDbConfig() {
  const host = process.env.CCTVUP_DB_HOST?.trim();
  const user = process.env.CCTVUP_DB_USER?.trim();
  const password = process.env.CCTVUP_DB_PASSWORD;
  const database = process.env.CCTVUP_DB_DATABASE?.trim() || 'paip';
  const port = Number(process.env.CCTVUP_DB_PORT || 3306);

  if (!host || !user || !password || !Number.isFinite(port)) return null;

  return { host, user, password, database, port };
}

function assertReadOnlySql(sql: string) {
  const normalizedSql = sql.trim().replace(/\s+/g, ' ');
  if (!READ_ONLY_SQL_PATTERN.test(normalizedSql) || normalizedSql.includes(';') || LOCKING_READ_PATTERN.test(normalizedSql)) {
    throw new Error('CCTVUP 일일 브리핑 원장 조회는 read-only SELECT/WITH 문만 허용합니다.');
  }
}

async function executeReadOnlyDbQuery<T extends RowDataPacket[]>(
  connection: mysql.Connection,
  query: QueryOptions,
  values?: ExecuteValues,
) {
  assertReadOnlySql(String(query.sql || ''));
  return connection.query<T>(query, values);
}

function mapCheckRun(row: SupabaseCheckRunRow): CctvUpCheckRun {
  const fallbackIssueCount = Number(row.late_count ?? 0) + Number(row.missing_count ?? 0) + Number(row.critical_count ?? 0);
  return {
    id: row.id,
    source: row.source,
    checkedAt: row.checked_at,
    tableName: row.table_name,
    farmCount: Number(row.farm_count ?? 0),
    cameraCount: Number(row.camera_count ?? 0),
    okCount: Number(row.ok_count ?? 0),
    lateCount: Number(row.late_count ?? 0),
    missingCount: Number(row.missing_count ?? 0),
    criticalCount: Number(row.critical_count ?? 0),
    pausedCount: Number(row.paused_count ?? 0),
    issueCount: Number(row.issue_count ?? fallbackIssueCount),
    note: '',
  };
}

function buildNextLocalDate(reportDate: string) {
  const [year, month, day] = reportDate.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}-${String(next.getUTCDate()).padStart(2, '0')}`;
}

function formatDbDate(value: string | Date | null | undefined) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function formatDbDateTime(value: string | Date | null | undefined) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const text = String(value).trim();
  if (!text) return null;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(text)) {
    return new Date(`${text.replace(' ', 'T')}+09:00`).toISOString();
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? text : parsed.toISOString();
}

function numberOrZero(value: unknown) {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function mapFlockMovementRow(row: CctvUpFlockMovementDbRow) {
  const inputCount = numberOrZero(row.input_count);
  const outputCount = numberOrZero(row.output_count);
  const deadCount = numberOrZero(row.dead_count);
  const killCount = numberOrZero(row.kill_count);
  return {
    id: [
      row.movement_kind,
      row.report_bucket,
      row.farm_id,
      row.house_id,
      formatDbDateTime(row.actual_at) || formatDbDate(row.actual_date) || '',
      formatDbDateTime(row.create_time) || '',
    ].join(':'),
    movementKind: row.movement_kind,
    reportBucket: row.report_bucket,
    registeredAt: formatDbDateTime(row.create_time),
    actualAt: formatDbDateTime(row.actual_at),
    actualDate: formatDbDate(row.actual_date),
    farmId: row.farm_id,
    farmName: row.farm_name,
    farmAlias: row.farm_alias,
    farmAffiliates: row.farm_affiliates,
    country: row.country,
    houseId: row.house_id,
    houseName: row.house_name,
    partsYear: row.parts_year,
    partsSeq: row.parts_seq,
    movementType: row.movement_type,
    birdCount: numberOrZero(row.bird_count),
    averageWeight: numberOrZero(row.average_weight),
    source: row.source,
    breedKind: row.breed_kind,
    memo: row.memo,
    inputCount,
    outputCount,
    deadCount,
    killCount,
    remainingEstimate: Math.max(0, inputCount - outputCount - deadCount - killCount),
  };
}

async function fetchCctvUpFlockMovementEvents(reportDate: string) {
  const dbConfig = getDbConfig();
  if (!dbConfig) return [];

  const nextDate = buildNextLocalDate(reportDate);
  const fromLocal = `${reportDate} 00:00:00`;
  const toLocal = `${nextDate} 00:00:00`;
  const values = [
    ...CCTVUP_EXCLUDED_FARM_IDS,
    fromLocal,
    toLocal,
    fromLocal,
    toLocal,
    fromLocal,
    toLocal,
    fromLocal,
    toLocal,
    fromLocal,
    toLocal,
    fromLocal,
    toLocal,
    fromLocal,
    toLocal,
    fromLocal,
    toLocal,
    toLocal,
    toLocal,
    nextDate,
    nextDate,
  ];

  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection({
      ...dbConfig,
      connectTimeout: 3000,
      supportBigNumbers: true,
      dateStrings: true,
    });

    const [rows] = await executeReadOnlyDbQuery<CctvUpFlockMovementDbRow[]>(
      connection,
      {
        sql: `
          WITH scoped_farms AS (
            SELECT DISTINCT c.farm_id
            FROM tbl_farm_cctv c
            WHERE c.applied = 1
              AND c.display = 'YES'
              AND c.is_working = 'Y'
              AND c.farm_id NOT IN (${EXCLUDED_FARM_SQL_PLACEHOLDERS})
          ),
          movements AS (
            SELECT
              'shipment' AS movement_kind,
              CASE
                WHEN o.out_date >= ? AND o.out_date < ? THEN 'actual_date'
                ELSE 'registered_late'
              END AS report_bucket,
              o.create_time,
              o.out_date AS actual_at,
              DATE(o.out_date) AS actual_date,
              o.farm_id,
              s.farm_name,
              s.farm_alias,
              s.affiliates AS farm_affiliates,
              s.country,
              o.house_id,
              h.house_name,
              o.parts_year,
              o.parts_seq,
              o.output_type AS movement_type,
              o.output_count AS bird_count,
              o.average_weight,
              o.source,
              NULL AS breed_kind,
              o.memo
            FROM tbl_farm_diary_output o
            JOIN scoped_farms sf ON sf.farm_id = o.farm_id
            LEFT JOIN tbl_farm_service s ON s.farm_id = o.farm_id
            LEFT JOIN tbl_farm_house h ON h.farm_id = o.farm_id AND h.house_id = o.house_id
            WHERE (
              o.out_date >= ? AND o.out_date < ?
              OR (
                o.create_time >= ? AND o.create_time < ?
                AND NOT (o.out_date >= ? AND o.out_date < ?)
              )
            )

            UNION ALL

            SELECT
              'placement' AS movement_kind,
              CASE
                WHEN i.in_date >= ? AND i.in_date < ? THEN 'actual_date'
                ELSE 'registered_late'
              END AS report_bucket,
              i.create_time,
              i.in_date AS actual_at,
              DATE(i.in_date) AS actual_date,
              i.farm_id,
              s.farm_name,
              s.farm_alias,
              s.affiliates AS farm_affiliates,
              s.country,
              i.house_id,
              h.house_name,
              i.parts_year,
              i.parts_seq,
              NULL AS movement_type,
              i.input_count AS bird_count,
              NULL AS average_weight,
              'ERP' AS source,
              i.kind AS breed_kind,
              i.memo
            FROM tbl_farm_diary_input i
            JOIN scoped_farms sf ON sf.farm_id = i.farm_id
            LEFT JOIN tbl_farm_service s ON s.farm_id = i.farm_id
            LEFT JOIN tbl_farm_house h ON h.farm_id = i.farm_id AND h.house_id = i.house_id
            WHERE (
              i.in_date >= ? AND i.in_date < ?
              OR (
                i.create_time >= ? AND i.create_time < ?
                AND NOT (i.in_date >= ? AND i.in_date < ?)
              )
            )
          )
          SELECT
            m.*,
            COALESCE((
              SELECT SUM(i2.input_count)
              FROM tbl_farm_diary_input i2
              WHERE i2.farm_id = m.farm_id
                AND i2.house_id = m.house_id
                AND i2.parts_year = m.parts_year
                AND i2.parts_seq = m.parts_seq
                AND i2.in_date < ?
            ), 0) AS input_count,
            COALESCE((
              SELECT SUM(o2.output_count)
              FROM tbl_farm_diary_output o2
              WHERE o2.farm_id = m.farm_id
                AND o2.house_id = m.house_id
                AND o2.parts_year = m.parts_year
                AND o2.parts_seq = m.parts_seq
                AND o2.out_date < ?
            ), 0) AS output_count,
            COALESCE((
              SELECT SUM(d.chick_dead)
              FROM tbl_farm_diary_dead_kill d
              WHERE d.farm_id = m.farm_id
                AND d.house_id = m.house_id
                AND d.diary_date >= (
                  SELECT MIN(i3.in_date)
                  FROM tbl_farm_diary_input i3
                  WHERE i3.farm_id = m.farm_id
                    AND i3.house_id = m.house_id
                    AND i3.parts_year = m.parts_year
                    AND i3.parts_seq = m.parts_seq
                )
                AND d.diary_date < ?
            ), 0) AS dead_count,
            COALESCE((
              SELECT SUM(d.chick_kill)
              FROM tbl_farm_diary_dead_kill d
              WHERE d.farm_id = m.farm_id
                AND d.house_id = m.house_id
                AND d.diary_date >= (
                  SELECT MIN(i3.in_date)
                  FROM tbl_farm_diary_input i3
                  WHERE i3.farm_id = m.farm_id
                    AND i3.house_id = m.house_id
                    AND i3.parts_year = m.parts_year
                    AND i3.parts_seq = m.parts_seq
                )
                AND d.diary_date < ?
            ), 0) AS kill_count
          FROM movements m
          ORDER BY m.report_bucket, m.movement_kind, m.actual_at, m.farm_id, m.house_id
        `,
        timeout: DAILY_REPORT_DB_QUERY_TIMEOUT_MS,
      },
      values,
    );

    return rows.map(mapFlockMovementRow);
  } catch (error) {
    console.error('[cctvup-daily-report] flock movement fetch failed', error);
    return [];
  } finally {
    await connection?.end();
  }
}

async function fetchCctvUpCheckRunsForRange(fromIso: string, toIso: string): Promise<CctvUpCheckRun[]> {
  const config = getCctvUpSupabaseConfig();
  if (!config) return [];

  const endpoint = new URL('/rest/v1/tbl_cctvup_check_runs', config.supabaseUrl);
  endpoint.searchParams.set('select', 'id,source,checked_at,table_name,farm_count,camera_count,ok_count,late_count,missing_count,critical_count,paused_count');
  endpoint.searchParams.append('checked_at', `gte.${fromIso}`);
  endpoint.searchParams.append('checked_at', `lt.${toIso}`);
  endpoint.searchParams.set('order', 'checked_at.desc');
  endpoint.searchParams.set('limit', String(Math.min(Math.max(Math.trunc(DAILY_REPORT_CHECK_RUN_LIMIT), 1), 1000)));

  const response = await fetch(endpoint.toString(), {
    method: 'GET',
    cache: 'no-store',
    signal: createTimeoutSignal(DAILY_REPORT_FETCH_TIMEOUT_MS),
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      Accept: 'application/json',
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`tbl_cctvup_check_runs 일일 조회 실패 (${response.status}): ${text.slice(0, 240)}`);
  }

  let rows: unknown = [];
  try {
    rows = text ? JSON.parse(text) : [];
  } catch {
    rows = [];
  }

  return Array.isArray(rows)
    ? rows
        .filter((row): row is SupabaseCheckRunRow => typeof row === 'object' && row !== null)
        .map(mapCheckRun)
    : [];
}

async function fetchFarmMetadata() {
  try {
    const [currentResult, registryPayload] = await Promise.all([
      fetchCctvUpCurrentPayload(1000, { preferSupabaseLatest: false, includePersistedState: false }),
      fetchCctvUpFarmRegistry(),
    ]);
    return buildFarmMetadataFromRows(
      Array.isArray(currentResult.payload.rows) ? currentResult.payload.rows : [],
      Array.isArray(registryPayload?.items) ? registryPayload.items : [],
    );
  } catch {
    return [];
  }
}

export async function generateCctvUpDailyReport(options: GenerateCctvUpDailyReportOptions = {}) {
  const date = normalizeCctvUpReportDate(options.date, options.now ?? new Date());
  const range = buildKstReportRange(date);
  const generatedAt = (options.now ?? new Date()).toISOString();
  const eventLimit = Math.min(Math.max(Math.trunc(DAILY_REPORT_EVENT_LIMIT), 1), 1000);

  const [
    issueEvents,
    farmScopeEvents,
    cameraStates,
    checkRuns,
    farmMetadata,
    flockMovementEvents,
  ] = await Promise.all([
    fetchCctvUpIssueEvents({ limit: eventLimit, since: range.fromIso, timeoutMs: DAILY_REPORT_FETCH_TIMEOUT_MS }).then((rows) => rows ?? []),
    fetchCctvUpFarmScopeEvents({ limit: eventLimit, since: range.fromIso, timeoutMs: DAILY_REPORT_FETCH_TIMEOUT_MS }).then((rows) => rows ?? []).catch(() => []),
    fetchCctvUpActiveCameraStates(1000, { timeoutMs: DAILY_REPORT_FETCH_TIMEOUT_MS }).then((rows) => rows ?? []),
    fetchCctvUpCheckRunsForRange(range.fromIso, range.toIso).catch(() => []),
    fetchFarmMetadata(),
    fetchCctvUpFlockMovementEvents(date),
  ]);

  const report = buildCctvUpDailyReportDocument({
    date,
    generatedAt,
    issueEvents,
    farmScopeEvents,
    cameraStates,
    checkRuns,
    farmMetadata,
    flockMovementEvents,
  });
  const writeResult = await writeCctvUpDailyReportFiles(report, options.rootDir ?? process.cwd());

  return {
    ok: true as const,
    date,
    report,
    manifest: writeResult.manifest,
    paths: writeResult.paths,
  };
}
