import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { buildKstReportDateFromNow } from '@/lib/cctvup-daily-report.js';

const execFileAsync = promisify(execFile);

const DEFAULT_BASE_URL = 'http://localhost:3002';
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_MAX_CHECK_AGE_MINUTES = 8;
const DEFAULT_MIN_CHECK_RUNS = 5;
const EXPECTED_EXCLUDED_FARM_IDS = new Set(['FA0000', 'FA0001']);
const EXPECTED_INCLUDED_FARM_ID = 'FA0014';
const ACTIVE_STATE_STATUSES = new Set(['watching', 'open', 'recovering']);

export type CctvUpSmokeStepStatus = 'pass' | 'warn' | 'fail';

export type CctvUpSmokeStep = {
  name: string;
  status: CctvUpSmokeStepStatus;
  message: string;
  detail?: unknown;
};

export type CctvUpSmokePayload = {
  ok: boolean;
  checkedAt: string;
  baseUrl: string;
  mode: 'read-only';
  failureCount: number;
  warningCount: number;
  message: string;
  steps: CctvUpSmokeStep[];
};

type CctvUpSmokeOptions = {
  baseUrl?: string;
  readSecret?: string;
  timeoutMs?: number;
  maxCheckAgeMinutes?: number;
  minCheckRuns?: number;
  now?: Date;
};

type CctvUpSmokeCurrentRow = {
  id?: string;
  farm?: string;
  status?: string;
  monitorScopeCode?: string;
};

type CctvUpSmokeCurrentPayload = {
  source?: string;
  rows?: CctvUpSmokeCurrentRow[];
  stateSync?: {
    status?: string;
    stateCount?: number;
  };
  summary?: {
    farms?: number;
    cameras?: number;
    monitorActive?: number;
    open?: number;
  };
};

type CctvUpSmokeHistoryRun = {
  checkedAt?: string;
  checked_at?: string;
  source?: string;
  note?: string;
};

type CctvUpSmokeHistoryState = {
  cameraKey?: string;
  camera_key?: string;
  status?: string;
  stateStatus?: string;
};

type CctvUpSmokeIssueEvent = {
  eventKind?: string;
  event_kind?: string;
  eventAt?: string;
  event_at?: string;
  farmId?: string;
  farm_id?: string;
};

type CctvUpSmokeFarmScopeEvent = {
  eventKind?: string;
  event_kind?: string;
  eventAt?: string;
  event_at?: string;
  farmId?: string;
  farm_id?: string;
};

type CctvUpSmokeHistoryPayload = {
  checkRuns?: CctvUpSmokeHistoryRun[];
  cameraStates?: CctvUpSmokeHistoryState[];
  issueEvents?: CctvUpSmokeIssueEvent[];
  farmScopeEvents?: CctvUpSmokeFarmScopeEvent[];
};

type CctvUpSmokeRegistryPayload = {
  source?: string;
  items?: unknown[];
  message?: string;
};

type CctvUpSmokeDailyReportPayload = {
  reports?: Array<{
    date?: string;
    generatedAt?: string;
    issueEventCount?: number;
    farmScopeEventCount?: number;
    activeIssueCount?: number;
  }>;
};

type CheckRunSummary = {
  checkedAt?: string;
  source?: string;
  note?: string;
  intervalMinutes: number | null;
};

type LaunchdResult = {
  ok: boolean;
  message?: string;
  stdout?: string;
  stderr?: string;
};

type ErrorWithProcessOutput = Error & {
  code?: string;
  stdout?: string;
  stderr?: string;
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

function minutesBetween(left: string | Date, right: string | Date): number | null {
  const leftDate = left instanceof Date ? left : new Date(left);
  const rightDate = right instanceof Date ? right : new Date(right);
  if (Number.isNaN(leftDate.getTime()) || Number.isNaN(rightDate.getTime())) return null;
  return Math.round((leftDate.getTime() - rightDate.getTime()) / 60000);
}

function normalizeError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const detail = error as ErrorWithProcessOutput;
  return [error.name, detail.code, error.message].filter(Boolean).join(': ');
}

function toStatus(ok: boolean, required = true): CctvUpSmokeStepStatus {
  if (ok) return 'pass';
  return required ? 'fail' : 'warn';
}

function createStep(name: string, ok: boolean, message = '', detail?: unknown, required = true): CctvUpSmokeStep {
  return {
    name,
    status: toStatus(ok, required),
    message,
    detail,
  };
}

function buildProtectedReadInit(secret: string | undefined): RequestInit {
  const trimmedSecret = (secret || '').trim();
  return trimmedSecret ? { headers: { 'x-cctvup-admin-secret': trimmedSecret } } : {};
}

async function fetchText(url: string, timeoutMs: number, init: RequestInit = {}) {
  const response = await fetch(url, {
    cache: 'no-store',
    ...init,
    signal: init.signal ?? createTimeoutSignal(timeoutMs),
  });
  const text = await response.text();
  return { response, text };
}

async function fetchJson<T>(url: string, timeoutMs: number, init: RequestInit = {}): Promise<T> {
  const { response, text } = await fetchText(url, timeoutMs, init);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(`${url} ${response.status}: JSON 대신 ${contentType || '알 수 없는 형식'} 응답을 반환했습니다. ${text.trim().slice(0, 120)}`);
  }

  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch (error) {
    const parseError = new Error(`JSON parse failed: ${text.slice(0, 120)}`) as Error & { cause?: unknown };
    parseError.cause = error;
    throw parseError;
  }

  if (!response.ok) {
    throw new Error(`${url} ${response.status}: ${text.slice(0, 180) || response.statusText}`);
  }

  return payload as T;
}

async function getLaunchd(label: string): Promise<LaunchdResult> {
  if (typeof process.getuid !== 'function') return { ok: false, message: 'process.getuid unavailable' };
  try {
    const { stdout } = await execFileAsync('launchctl', ['print', `gui/${process.getuid()}/${label}`], { timeout: 5000 });
    return { ok: true, stdout: String(stdout) };
  } catch (error) {
    const detail = error as ErrorWithProcessOutput;
    return {
      ok: false,
      message: normalizeError(error),
      stdout: detail.stdout ? String(detail.stdout) : '',
      stderr: detail.stderr ? String(detail.stderr) : '',
    };
  }
}

function parseCheckRuns(historyPayload: CctvUpSmokeHistoryPayload): CheckRunSummary[] {
  const runs = Array.isArray(historyPayload.checkRuns) ? historyPayload.checkRuns : [];
  return runs.map((run, index) => {
    const checkedAt = run.checkedAt || run.checked_at;
    const previous = runs[index + 1];
    const previousCheckedAt = previous?.checkedAt || previous?.checked_at;
    return {
      checkedAt,
      source: run.source,
      note: run.note,
      intervalMinutes: checkedAt && previousCheckedAt ? minutesBetween(checkedAt, previousCheckedAt) : null,
    };
  });
}

function countBy<T>(rows: T[], keyFn: (row: T) => string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const key = keyFn(row);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function hasDailyReportLaunchdSchedule(stdout = ''): boolean {
  return /"Hour" => 0/.test(stdout) && /"Minute" => 5/.test(stdout);
}

function kstMinutesSinceMidnight(date: Date): number {
  const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kstDate.getUTCHours() * 60 + kstDate.getUTCMinutes();
}

function expectedLatestDailyReportDate(now: Date): string {
  const afterDailyReportWindow = kstMinutesSinceMidnight(now) >= 10;
  return buildKstReportDateFromNow(now, afterDailyReportWindow ? -1 : -2);
}

function buildSmokeMessage(failureCount: number, warningCount: number) {
  if (failureCount > 0) return `운영 점검 실패 ${failureCount}건, 확인 필요 ${warningCount}건입니다.`;
  if (warningCount > 0) return `운영 핵심은 통과했고 확인 필요 ${warningCount}건이 있습니다.`;
  return '운영 핵심 점검이 정상입니다.';
}

export async function runCctvUpSmokeCheck(options: CctvUpSmokeOptions = {}): Promise<CctvUpSmokePayload> {
  const baseUrl = (options.baseUrl || process.env.CCTVUP_SMOKE_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const timeoutMs = options.timeoutMs ?? Number(process.env.CCTVUP_SMOKE_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
  const maxCheckAgeMinutes = options.maxCheckAgeMinutes ?? Number(process.env.CCTVUP_SMOKE_MAX_CHECK_AGE_MINUTES || DEFAULT_MAX_CHECK_AGE_MINUTES);
  const minCheckRuns = options.minCheckRuns ?? Number(process.env.CCTVUP_SMOKE_MIN_CHECK_RUNS || DEFAULT_MIN_CHECK_RUNS);
  const now = options.now ?? new Date();
  const protectedReadInit = buildProtectedReadInit(options.readSecret);
  const steps: CctvUpSmokeStep[] = [];

  try {
    const websiteLaunchd = await getLaunchd('com.paiptree.website-dev');
    steps.push(createStep(
      'launchd website-dev',
      websiteLaunchd.ok && /state = running/.test(websiteLaunchd.stdout || ''),
      websiteLaunchd.ok ? 'state=running' : websiteLaunchd.message,
      undefined,
      false,
    ));

    const checkLaunchd = await getLaunchd('com.paiptree.cctvup-check');
    steps.push(createStep(
      'launchd cctvup-check',
      checkLaunchd.ok && /run interval = 300 seconds/.test(checkLaunchd.stdout || '') && /last exit code = 0/.test(checkLaunchd.stdout || ''),
      checkLaunchd.ok ? 'interval=300s · last_exit=0' : checkLaunchd.message,
      undefined,
      false,
    ));

    const dailyReportLaunchd = await getLaunchd('com.paiptree.cctvup-daily-report');
    steps.push(createStep(
      'launchd cctvup-daily-report',
      dailyReportLaunchd.ok && hasDailyReportLaunchdSchedule(dailyReportLaunchd.stdout || '') && /last exit code = 0/.test(dailyReportLaunchd.stdout || ''),
      dailyReportLaunchd.ok ? 'calendar 00:05 · last_exit=0' : dailyReportLaunchd.message,
      undefined,
      false,
    ));

    const { response: pageResponse, text: pageText } = await fetchText(`${baseUrl}/cctvup/`, timeoutMs);
    steps.push(createStep(
      'page /cctvup',
      pageResponse.ok && pageText.includes('CCTVUP'),
      `${pageResponse.status} · ${pageText.includes('CCTVUP') ? 'CCTVUP markup found' : 'CCTVUP markup missing'}`,
    ));

    const currentPayload = await fetchJson<CctvUpSmokeCurrentPayload>(`${baseUrl}/api/cctvup/`, timeoutMs * 3, protectedReadInit);
    const rows = Array.isArray(currentPayload.rows) ? currentPayload.rows : [];
    const excludedFound: string[] = [];
    for (const row of rows) {
      if (row.farm && EXPECTED_EXCLUDED_FARM_IDS.has(row.farm) && !excludedFound.includes(row.farm)) {
        excludedFound.push(row.farm);
      }
    }
    const haniRows = rows.filter((row) => row.farm === EXPECTED_INCLUDED_FARM_ID);

    steps.push(createStep(
      'api /api/cctvup source',
      currentPayload.source === 'db',
      `source=${currentPayload.source}`,
      currentPayload.source,
    ));
    steps.push(createStep(
      'stateSync',
      currentPayload.stateSync?.status === 'applied',
      `${currentPayload.stateSync?.status || 'none'} · active ${currentPayload.stateSync?.stateCount ?? 0}`,
      currentPayload.stateSync,
    ));
    steps.push(createStep(
      'summary',
      Number(currentPayload.summary?.cameras || 0) > 0 && Number(currentPayload.summary?.monitorActive || 0) > 0,
      `farms ${currentPayload.summary?.farms ?? 0} · cameras ${currentPayload.summary?.cameras ?? 0} · active ${currentPayload.summary?.monitorActive ?? 0} · open ${currentPayload.summary?.open ?? 0}`,
      currentPayload.summary,
    ));
    steps.push(createStep(
      'farm scope exceptions',
      excludedFound.length === 0 && haniRows.length > 0,
      `excluded ${excludedFound.length ? excludedFound.join(',') : 'none'} · FA0014 rows ${haniRows.length}`,
      {
        excludedFound,
        haniRows: haniRows.map((row) => ({ id: row.id, status: row.status, scope: row.monitorScopeCode })),
      },
    ));

    try {
      const registryPayload = await fetchJson<CctvUpSmokeRegistryPayload>(`${baseUrl}/api/cctvup/registry/`, timeoutMs, protectedReadInit);
      const registryItems = Array.isArray(registryPayload.items) ? registryPayload.items : [];
      steps.push(createStep(
        'api /api/cctvup/registry JSON',
        Array.isArray(registryPayload.items),
        `${registryPayload.source || 'unknown'} · items ${registryItems.length}`,
        {
          source: registryPayload.source,
          itemCount: registryItems.length,
          message: registryPayload.message,
        },
      ));
    } catch (error) {
      steps.push(createStep('api /api/cctvup/registry JSON', false, normalizeError(error)));
    }

    try {
      const dailyReportPayload = await fetchJson<CctvUpSmokeDailyReportPayload>(`${baseUrl}/api/cctvup/daily-reports/`, timeoutMs, protectedReadInit);
      const reports = Array.isArray(dailyReportPayload.reports) ? dailyReportPayload.reports : [];
      const latestReport = reports[0] || null;
      const expectedDate = expectedLatestDailyReportDate(now);
      steps.push(createStep(
        'daily report manifest',
        reports.some((report) => report.date === expectedDate),
        `expected ${expectedDate} · latest ${latestReport?.date || 'none'} · reports ${reports.length}`,
        {
          expectedDate,
          latestReport,
        },
        false,
      ));
    } catch (error) {
      steps.push(createStep('daily report manifest', false, normalizeError(error), undefined, false));
    }

    const historyPayload = await fetchJson<CctvUpSmokeHistoryPayload>(`${baseUrl}/api/cctvup/history/?limit=50&days=30&issueEventLimit=20000`, timeoutMs * 2, protectedReadInit);
    const checkRuns = parseCheckRuns(historyPayload);
    const latestRun = checkRuns[0];
    const latestAgeMinutes = latestRun?.checkedAt ? minutesBetween(now, latestRun.checkedAt) : null;
    const intervalWarnings = checkRuns
      .filter((run) => run.intervalMinutes !== null)
      .filter((run) => Number(run.intervalMinutes) < 4 || Number(run.intervalMinutes) > 7);

    steps.push(createStep(
      'history checkRuns',
      checkRuns.length >= Math.min(minCheckRuns, 5) && latestAgeMinutes !== null && latestAgeMinutes <= maxCheckAgeMinutes,
      `runs ${checkRuns.length} · latest ${latestAgeMinutes ?? '-'}m ago`,
      checkRuns.slice(0, 5),
    ));
    steps.push(createStep(
      'check interval',
      intervalWarnings.length === 0,
      intervalWarnings.length
        ? intervalWarnings.map((run) => `${run.intervalMinutes}m @ ${run.checkedAt}`).join(' / ')
        : 'latest intervals are within 4-7m',
      checkRuns.slice(0, 5),
      false,
    ));

    const activeKeys = new Set(rows.filter((row) => (row.monitorScopeCode || 'active') === 'active').map((row) => row.id).filter(Boolean));
    const cameraStates = Array.isArray(historyPayload.cameraStates) ? historyPayload.cameraStates : [];
    const activeStates = cameraStates.filter((state) => ACTIVE_STATE_STATUSES.has(state.status || state.stateStatus || ''));
    const staleStates = activeStates.filter((state) => !activeKeys.has(state.cameraKey || state.camera_key));
    steps.push(createStep(
      'active camera_states',
      staleStates.length === 0,
      `states ${cameraStates.length} · active ${activeStates.length} · stale ${staleStates.length}`,
      {
        byStatus: countBy(cameraStates, (state) => state.status || state.stateStatus || 'unknown'),
        stale: staleStates.slice(0, 10).map((state) => state.cameraKey || state.camera_key),
      },
    ));

    const issueEvents = Array.isArray(historyPayload.issueEvents) ? historyPayload.issueEvents : [];
    steps.push(createStep(
      'history issueEvents',
      issueEvents.length > 0,
      `events ${issueEvents.length}`,
      issueEvents.slice(0, 5).map((event) => ({
        kind: event.eventKind || event.event_kind,
        at: event.eventAt || event.event_at,
        farm: event.farmId || event.farm_id,
      })),
      false,
    ));

    const farmScopeEvents = Array.isArray(historyPayload.farmScopeEvents) ? historyPayload.farmScopeEvents : [];
    steps.push(createStep(
      'history farmScopeEvents',
      Array.isArray(historyPayload.farmScopeEvents),
      `events ${farmScopeEvents.length}`,
      farmScopeEvents.slice(0, 5).map((event) => ({
        kind: event.eventKind || event.event_kind,
        at: event.eventAt || event.event_at,
        farm: event.farmId || event.farm_id,
      })),
      false,
    ));
  } catch (error) {
    steps.push(createStep('smoke fatal', false, normalizeError(error)));
  }

  const failureCount = steps.filter((step) => step.status === 'fail').length;
  const warningCount = steps.filter((step) => step.status === 'warn').length;

  return {
    ok: failureCount === 0,
    checkedAt: now.toISOString(),
    baseUrl,
    mode: 'read-only',
    failureCount,
    warningCount,
    message: buildSmokeMessage(failureCount, warningCount),
    steps,
  };
}
