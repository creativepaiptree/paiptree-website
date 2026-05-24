import type { CctvUpCheckRun } from '@/lib/cctvup';
import { fetchCctvUpCurrentPayload } from '@/lib/cctvup-current';
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

function createTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return undefined;
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(timeoutMs);
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
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
  ] = await Promise.all([
    fetchCctvUpIssueEvents({ limit: eventLimit, since: range.fromIso, timeoutMs: DAILY_REPORT_FETCH_TIMEOUT_MS }).then((rows) => rows ?? []),
    fetchCctvUpFarmScopeEvents({ limit: eventLimit, since: range.fromIso, timeoutMs: DAILY_REPORT_FETCH_TIMEOUT_MS }).then((rows) => rows ?? []).catch(() => []),
    fetchCctvUpActiveCameraStates(1000, { timeoutMs: DAILY_REPORT_FETCH_TIMEOUT_MS }).then((rows) => rows ?? []),
    fetchCctvUpCheckRunsForRange(range.fromIso, range.toIso).catch(() => []),
    fetchFarmMetadata(),
  ]);

  const report = buildCctvUpDailyReportDocument({
    date,
    generatedAt,
    issueEvents,
    farmScopeEvents,
    cameraStates,
    checkRuns,
    farmMetadata,
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
