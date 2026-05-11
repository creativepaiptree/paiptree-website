import mysql from 'mysql2/promise';
import type { ExecuteValues, QueryOptions, RowDataPacket } from 'mysql2';
import {
  buildPayload,
  mapDbSummaryRows,
  mockCctvUpRows,
  type CctvUpDbSummaryRow,
  type CctvUpPayload,
} from '@/lib/cctvup';
import { CCTVUP_EXCLUDED_FARM_IDS } from '@/lib/cctvup-exclusions';
import { mergeCctvUpPayloadWithPersistedState } from '@/lib/cctvup-state';

type DbSummaryResultRow = CctvUpDbSummaryRow & RowDataPacket;

type CurrentPayloadResult = {
  payload: CctvUpPayload;
  status: number;
};

type SafeDbError = {
  name: string;
  code?: string;
  errno?: number;
  sqlState?: string;
  fatal?: boolean;
  message: string;
};

export type CctvUpDbHealthResult = {
  ok: boolean;
  checkedAt: string;
  elapsedMs: number;
  env: {
    hostConfigured: boolean;
    portConfigured: boolean;
    userConfigured: boolean;
    passwordConfigured: boolean;
    databaseConfigured: boolean;
  };
  connection: {
    ok: boolean;
    error?: SafeDbError;
  };
  query: {
    ok: boolean;
    activeFarmCount?: number;
    activeCameraCount?: number;
    error?: SafeDbError;
  };
};

type FetchCctvUpCurrentPayloadOptions = {
  preferSupabaseLatest?: boolean;
  includePersistedState?: boolean;
};

type SupabaseConfig = {
  supabaseUrl: string;
  serviceKey: string;
};

type SupabaseLatestCheckRunRow = {
  id: string;
  source: 'db' | 'mock' | 'unavailable';
  checked_at: string;
  table_name: string;
  payload: CctvUpPayload | null;
  note?: string | null;
};

const SUPABASE_FETCH_TIMEOUT_MS = Number(process.env.CCTVUP_SUPABASE_FETCH_TIMEOUT_MS || 2000);
const DB_QUERY_TIMEOUT_MS = Number(process.env.CCTVUP_DB_QUERY_TIMEOUT_MS || 10000);
const READ_ONLY_SQL_PATTERN = /^(?:select|with)\b/i;
const LOCKING_READ_PATTERN = /\b(?:for\s+update|lock\s+in\s+share\s+mode)\b/i;
const EXCLUDED_FARM_SQL_PLACEHOLDERS = CCTVUP_EXCLUDED_FARM_IDS.map(() => '?').join(', ');

function shouldUseMockFallback() {
  return process.env.CCTVUP_ALLOW_MOCK_FALLBACK === '1' || process.env.NODE_ENV !== 'production';
}

function getDbEnvState(): CctvUpDbHealthResult['env'] {
  return {
    hostConfigured: Boolean(process.env.CCTVUP_DB_HOST?.trim()),
    portConfigured: Boolean(process.env.CCTVUP_DB_PORT?.trim()),
    userConfigured: Boolean(process.env.CCTVUP_DB_USER?.trim()),
    passwordConfigured: Boolean(process.env.CCTVUP_DB_PASSWORD),
    databaseConfigured: Boolean(process.env.CCTVUP_DB_DATABASE?.trim()),
  };
}

function sanitizeDbError(error: unknown): SafeDbError {
  if (!error || typeof error !== 'object') {
    return {
      name: 'UnknownError',
      message: error instanceof Error ? error.message : 'Unknown DB error',
    };
  }

  const record = error as Record<string, unknown>;
  const message = error instanceof Error ? error.message : String(record.message || 'Unknown DB error');

  return {
    name: error instanceof Error ? error.name : String(record.name || 'Error'),
    code: typeof record.code === 'string' ? record.code : undefined,
    errno: typeof record.errno === 'number' ? record.errno : undefined,
    sqlState: typeof record.sqlState === 'string' ? record.sqlState : undefined,
    fatal: typeof record.fatal === 'boolean' ? record.fatal : undefined,
    message: message.slice(0, 240),
  };
}

function assertReadOnlySql(sql: string) {
  const normalizedSql = sql
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--.*$/gm, ' ')
    .trim()
    .replace(/;+$/g, '')
    .trim();

  if (!READ_ONLY_SQL_PATTERN.test(normalizedSql) || normalizedSql.includes(';') || LOCKING_READ_PATTERN.test(normalizedSql)) {
    throw new Error('CCTVUP 원본 DB 연결은 SELECT/WITH 조회만 허용합니다.');
  }
}

async function executeReadOnlyDbQuery<T extends RowDataPacket[]>(
  connection: mysql.Connection,
  query: QueryOptions,
  values?: ExecuteValues,
) {
  assertReadOnlySql(query.sql);
  return connection.execute<T>(query, values);
}

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

function getSupabaseConfig(): SupabaseConfig | null {
  const supabaseUrl = process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceKey) return null;

  return {
    supabaseUrl: supabaseUrl.endsWith('/') ? supabaseUrl : `${supabaseUrl}/`,
    serviceKey,
  };
}

function buildEndpoint(config: SupabaseConfig, table: string) {
  return new URL(`/rest/v1/${table}`, config.supabaseUrl);
}

async function requestSupabase<T>(
  config: SupabaseConfig,
  table: string,
  init: RequestInit,
): Promise<{ data: T | null; error: string | null; status: number }> {
  const response = await fetch(buildEndpoint(config, table).toString(), {
    cache: 'no-store',
    ...init,
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      Accept: 'application/json',
      ...(init.headers ?? {}),
    },
    signal: init.signal ?? createTimeoutSignal(SUPABASE_FETCH_TIMEOUT_MS),
  });

  const text = await response.text();
  let data: T | null = null;
  try {
    data = text ? (JSON.parse(text) as T) : null;
  } catch {
    data = null;
  }

  return {
    data,
    error: response.ok ? null : text || `Supabase request failed (${response.status})`,
    status: response.status,
  };
}

function normalizeSupabasePayload(payload: CctvUpPayload): CctvUpPayload {
  return {
    ...payload,
    checkedAt: payload.checkedAt || new Date().toISOString(),
    rows: Array.isArray(payload.rows) ? payload.rows : [],
    incidents: Array.isArray(payload.incidents) ? payload.incidents : [],
    currentIssues: Array.isArray(payload.currentIssues) ? payload.currentIssues : [],
    summary: {
      farms: Number(payload.summary?.farms ?? 0),
      cameras: Number(payload.summary?.cameras ?? 0),
      ok: Number(payload.summary?.ok ?? 0),
      late: Number(payload.summary?.late ?? 0),
      missing: Number(payload.summary?.missing ?? 0),
      critical: Number(payload.summary?.critical ?? 0),
      paused: Number(payload.summary?.paused ?? 0),
      issueCount: Number(payload.summary?.issueCount ?? 0),
      watching: Number(payload.summary?.watching ?? 0),
      open: Number(payload.summary?.open ?? 0),
      recovering: Number(payload.summary?.recovering ?? 0),
      resolved: Number(payload.summary?.resolved ?? 0),
    },
    stateSync: payload.stateSync,
  };
}

async function fetchSupabaseLatestCurrentPayload(): Promise<CurrentPayloadResult | null> {
  const config = getSupabaseConfig();
  if (!config) return null;

  try {
    const result = await requestSupabase<SupabaseLatestCheckRunRow[]>(
      config,
      'tbl_cctvup_check_runs?select=id,source,checked_at,table_name,payload,note&source=eq.db&order=checked_at.desc&limit=1',
      { method: 'GET' },
    );

    const row = Array.isArray(result.data) ? result.data[0] : null;
    if (!row?.payload || !Array.isArray(row.payload.rows) || row.payload.rows.length === 0) return null;

    const payload = normalizeSupabasePayload(row.payload);
    return {
      payload: {
        ...payload,
        message: payload.message || row.note || 'Supabase history에서 최신 체크 결과를 불러왔습니다.',
      },
      status: 200,
    };
  } catch (error) {
    console.error('[cctvup] Supabase current payload load failed', error);
    return null;
  }
}

export async function diagnoseCctvUpDb(): Promise<CctvUpDbHealthResult> {
  const startedAt = Date.now();
  const checkedAt = new Date().toISOString();
  const env = getDbEnvState();
  const dbConfig = getDbConfig();

  if (!dbConfig) {
    return {
      ok: false,
      checkedAt,
      elapsedMs: Date.now() - startedAt,
      env,
      connection: {
        ok: false,
        error: {
          name: 'ConfigurationError',
          code: 'CCTVUP_DB_CONFIG_MISSING',
          message: 'CCTVUP_DB_* 환경변수가 완전하지 않습니다.',
        },
      },
      query: { ok: false },
    };
  }

  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection({
      ...dbConfig,
      connectTimeout: 3000,
      supportBigNumbers: true,
      dateStrings: false,
    });
  } catch (error) {
    return {
      ok: false,
      checkedAt,
      elapsedMs: Date.now() - startedAt,
      env,
      connection: {
        ok: false,
        error: sanitizeDbError(error),
      },
      query: { ok: false },
    };
  }

  try {
    const [rows] = await executeReadOnlyDbQuery<RowDataPacket[]>(
      connection,
      {
        sql: `
          SELECT
            COUNT(DISTINCT c.farm_id) AS activeFarmCount,
            COUNT(*) AS activeCameraCount
          FROM tbl_farm_cctv c
          WHERE c.applied = 1
            AND c.display = 'YES'
            AND c.is_working = 'Y'
            AND c.farm_id NOT IN (${EXCLUDED_FARM_SQL_PLACEHOLDERS})
        `,
        timeout: DB_QUERY_TIMEOUT_MS,
      },
      [...CCTVUP_EXCLUDED_FARM_IDS],
    );
    const row = rows[0] || {};

    return {
      ok: true,
      checkedAt,
      elapsedMs: Date.now() - startedAt,
      env,
      connection: { ok: true },
      query: {
        ok: true,
        activeFarmCount: Number(row.activeFarmCount ?? 0),
        activeCameraCount: Number(row.activeCameraCount ?? 0),
      },
    };
  } catch (error) {
    return {
      ok: false,
      checkedAt,
      elapsedMs: Date.now() - startedAt,
      env,
      connection: { ok: true },
      query: {
        ok: false,
        error: sanitizeDbError(error),
      },
    };
  } finally {
    await connection.end().catch(() => undefined);
  }
}

export async function fetchCctvUpCurrentPayload(
  limit = 1000,
  options: FetchCctvUpCurrentPayloadOptions = {},
): Promise<CurrentPayloadResult> {
  const preferSupabaseLatest = options.preferSupabaseLatest ?? true;
  const includePersistedState = options.includePersistedState ?? true;
  if (preferSupabaseLatest) {
    const supabasePayload = await fetchSupabaseLatestCurrentPayload();
    if (supabasePayload) return supabasePayload;
  }

  const dbConfig = getDbConfig();
  if (!dbConfig) {
    if (!shouldUseMockFallback()) {
      return {
        payload: buildPayload([], 'unavailable', 'CCTVUP_DB_* 환경변수가 없어 실제 농장 목록을 표시하지 못합니다.'),
        status: 503,
      };
    }

    return {
      payload: buildPayload(mockCctvUpRows, 'mock', 'CCTVUP_DB_* 환경변수가 없어 mock 데이터로 표시합니다.'),
      status: 200,
    };
  }

  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection({
      ...dbConfig,
      connectTimeout: 3000,
      supportBigNumbers: true,
      dateStrings: false,
    });

    const [rows] = await executeReadOnlyDbQuery<DbSummaryResultRow[]>(
      connection,
      {
        sql: `
      SELECT
        c.farm_id,
        s.farm_name,
        s.farm_alias,
        s.affiliates AS farm_affiliates,
        s.country,
        s.poultry_type,
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
        DATEDIFF(latest.out_date, NOW()) AS days_until_out,
        c.house_id,
        h.house_name,
        COALESCE(img.module_id, CONCAT(c.cctv_id, ',1')) AS module_id,
        c.cctv_name AS camera_name,
        img.latest_at,
        COALESCE(img.cnt_1h, 0) AS cnt_1h,
        COALESCE(img.cnt_24h, 0) AS cnt_24h
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
      LEFT JOIN (
        SELECT
          i.FARM_ID AS farm_id,
          i.HOUSE_ID AS house_id,
          REPLACE(i.MODULE_ID, ',1', '') AS cctv_id,
          MAX(i.MODULE_ID) AS module_id,
          MAX(i.CREATE_TIME) AS latest_at,
          SUM(i.CREATE_TIME >= DATE_SUB(NOW(), INTERVAL 1 HOUR)) AS cnt_1h,
          SUM(i.CREATE_TIME >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) AS cnt_24h
        FROM tbl_farm_image i FORCE INDEX (idx_farm_house_module_createtime)
        WHERE i.CREATE_TIME >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
          AND i.CREATE_TIME <= NOW()
        GROUP BY i.FARM_ID, i.HOUSE_ID, REPLACE(i.MODULE_ID, ',1', '')
      ) img
        ON img.farm_id = c.farm_id
        AND img.house_id = c.house_id
        AND img.cctv_id = c.cctv_id
      WHERE c.applied = 1
        AND c.display = 'YES'
        AND c.is_working = 'Y'
        AND c.farm_id NOT IN (${EXCLUDED_FARM_SQL_PLACEHOLDERS})
      ORDER BY img.latest_at IS NULL DESC, img.latest_at ASC, c.farm_id, c.house_id, c.cctv_id
      LIMIT ?
      `,
        timeout: DB_QUERY_TIMEOUT_MS,
      },
      [...CCTVUP_EXCLUDED_FARM_IDS, limit],
    );

    const mappedRows = mapDbSummaryRows(rows);
    const livePayload = buildPayload(mappedRows, 'db', '운영 DB의 활성 CCTV 농장 전체를 감시합니다.');
    const payload = includePersistedState
      ? await mergeCctvUpPayloadWithPersistedState(livePayload).catch((error) => {
          console.warn('[cctvup] persisted camera state merge failed', error);
          return livePayload;
        })
      : livePayload;

    return {
      payload,
      status: 200,
    };
  } catch (error) {
    console.error('[cctvup] read-only DB query failed', error);

    return {
      payload: buildPayload([], 'unavailable', '운영 DB 조회 실패로 실제 농장 목록을 표시하지 못합니다.'),
      status: 503,
    };
  } finally {
    await connection?.end().catch(() => undefined);
  }
}
