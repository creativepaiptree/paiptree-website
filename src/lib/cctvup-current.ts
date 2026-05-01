import mysql from 'mysql2/promise';
import type { RowDataPacket } from 'mysql2';
import {
  buildPayload,
  mapDbSummaryRows,
  mockCctvUpRows,
  type CctvUpDbSummaryRow,
  type CctvUpPayload,
} from '@/lib/cctvup';

type DbSummaryResultRow = CctvUpDbSummaryRow & RowDataPacket;

type CurrentPayloadResult = {
  payload: CctvUpPayload;
  status: number;
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
    },
  };
}

async function fetchSupabaseLatestCurrentPayload(): Promise<CurrentPayloadResult | null> {
  const config = getSupabaseConfig();
  if (!config) return null;

  try {
    const result = await requestSupabase<SupabaseLatestCheckRunRow[]>(
      config,
      'tbl_cctvup_check_runs?select=id,source,checked_at,table_name,payload,note&order=checked_at.desc&limit=1',
      { method: 'GET' },
    );

    const row = Array.isArray(result.data) ? result.data[0] : null;
    if (!row?.payload) return null;

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

export async function fetchCctvUpCurrentPayload(limit = 1000): Promise<CurrentPayloadResult> {
  const supabasePayload = await fetchSupabaseLatestCurrentPayload();
  if (supabasePayload) return supabasePayload;

  const dbConfig = getDbConfig();
  if (!dbConfig) {
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

    const [rows] = await connection.execute<DbSummaryResultRow[]>(
      `
      SELECT
        i.FARM_ID AS farm_id,
        s.farm_name,
        i.HOUSE_ID AS house_id,
        h.house_name,
        i.MODULE_ID AS module_id,
        c.cctv_name AS camera_name,
        MAX(i.CREATE_TIME) AS latest_at,
        SUM(i.CREATE_TIME >= DATE_SUB(NOW(), INTERVAL 1 HOUR)) AS cnt_1h,
        COUNT(*) AS cnt_24h
      FROM tbl_farm_image i FORCE INDEX (idx_farm_house_module_createtime)
      LEFT JOIN tbl_farm_service s
        ON s.farm_id = i.FARM_ID
      LEFT JOIN tbl_farm_house h
        ON h.farm_id = i.FARM_ID AND h.house_id = i.HOUSE_ID
      INNER JOIN tbl_farm_cctv c
        ON c.farm_id = i.FARM_ID
        AND c.house_id = i.HOUSE_ID
        AND c.cctv_id = REPLACE(i.MODULE_ID, ',1', '')
        AND c.applied = 1
        AND c.display = 'YES'
        AND c.is_working = 'Y'
      WHERE i.CREATE_TIME >= DATE_SUB(NOW(), INTERVAL 90 DAY)
        AND i.CREATE_TIME <= NOW()
      GROUP BY i.FARM_ID, s.farm_name, i.HOUSE_ID, h.house_name, i.MODULE_ID, c.cctv_name
      ORDER BY latest_at DESC
      LIMIT ?
      `,
      [limit],
    );

    const mappedRows = mapDbSummaryRows(rows);

    return {
      payload: buildPayload(mappedRows, 'db'),
      status: 200,
    };
  } catch (error) {
    console.error('[cctvup] read-only DB query failed', error);

    return {
      payload: buildPayload(mockCctvUpRows, 'unavailable', 'DB 조회 실패로 mock 데이터로 표시합니다.'),
      status: 503,
    };
  } finally {
    await connection?.end().catch(() => undefined);
  }
}
