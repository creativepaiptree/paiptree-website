#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { buildKstReportDateFromNow } from '../src/lib/cctvup-daily-report.js';

const execFileAsync = promisify(execFile);

const DEFAULT_BASE_URL = 'http://localhost:3002';
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_MAX_CHECK_AGE_MINUTES = 8;
const DEFAULT_MIN_CHECK_RUNS = 5;
const EXPECTED_EXCLUDED_FARM_IDS = new Set(['FA0000', 'FA0001']);
const EXPECTED_INCLUDED_FARM_ID = 'FA0014';
const ACTIVE_STATE_STATUSES = new Set(['watching', 'open', 'recovering']);

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

function minutesBetween(left, right) {
  const leftDate = left instanceof Date ? left : new Date(left);
  const rightDate = right instanceof Date ? right : new Date(right);
  if (Number.isNaN(leftDate.getTime()) || Number.isNaN(rightDate.getTime())) return null;
  return Math.round((leftDate.getTime() - rightDate.getTime()) / 60000);
}

function normalizeError(error) {
  if (!error || typeof error !== 'object') return String(error);
  return [error.name, error.code, error.message].filter(Boolean).join(': ');
}

function toStatus(ok, required = true) {
  if (ok) return 'pass';
  return required ? 'fail' : 'warn';
}

function stateLine(step) {
  const label = step.status.toUpperCase().padEnd(4, ' ');
  return `[${label}] ${step.name}${step.message ? ` - ${step.message}` : ''}`;
}

function createStep(name, ok, message = '', detail = undefined, required = true) {
  return {
    name,
    status: toStatus(ok, required),
    message,
    detail,
  };
}

async function fetchText(url, timeoutMs, init = {}) {
  const response = await fetch(url, {
    cache: 'no-store',
    ...init,
    signal: init.signal ?? createTimeoutSignal(timeoutMs),
  });
  const text = await response.text();
  return { response, text };
}

async function fetchJson(url, timeoutMs, init = {}) {
  const { response, text } = await fetchText(url, timeoutMs, init);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(`${url} ${response.status}: JSON 대신 ${contentType || '알 수 없는 형식'} 응답을 반환했습니다. ${text.trim().slice(0, 120)}`);
  }

  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch (error) {
    const parseError = new Error(`JSON parse failed: ${text.slice(0, 120)}`);
    parseError.cause = error;
    throw parseError;
  }

  if (!response.ok) {
    throw new Error(`${url} ${response.status}: ${text.slice(0, 180) || response.statusText}`);
  }

  return payload;
}

async function getLaunchd(label) {
  if (typeof process.getuid !== 'function') return { ok: false, message: 'process.getuid unavailable' };
  try {
    const { stdout } = await execFileAsync('launchctl', ['print', `gui/${process.getuid()}/${label}`], { timeout: 5000 });
    return { ok: true, stdout };
  } catch (error) {
    return { ok: false, message: normalizeError(error), stdout: error.stdout || '', stderr: error.stderr || '' };
  }
}

function parseCheckRuns(historyPayload) {
  const runs = Array.isArray(historyPayload?.checkRuns) ? historyPayload.checkRuns : [];
  return runs.map((run, index) => {
    const checkedAt = run.checkedAt || run.checked_at;
    const previous = runs[index + 1];
    const previousCheckedAt = previous?.checkedAt || previous?.checked_at;
    return {
      checkedAt,
      source: run.source,
      note: run.note,
      intervalMinutes: previousCheckedAt ? minutesBetween(checkedAt, previousCheckedAt) : null,
    };
  });
}

function countBy(rows, keyFn) {
  const counts = {};
  for (const row of rows) {
    const key = keyFn(row);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function hasDailyReportLaunchdSchedule(stdout = '') {
  return /"Hour" => 0/.test(stdout) && /"Minute" => 5/.test(stdout);
}

function kstMinutesSinceMidnight(date) {
  const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kstDate.getUTCHours() * 60 + kstDate.getUTCMinutes();
}

function expectedLatestDailyReportDate(nowDate) {
  const afterDailyReportWindow = kstMinutesSinceMidnight(nowDate) >= 10;
  return buildKstReportDateFromNow(nowDate, afterDailyReportWindow ? -1 : -2);
}

async function runOptionalCheck(baseUrl, timeoutMs) {
  const secret = process.env.CCTVUP_CRON_TRIGGER_SECRET?.trim();
  if (!secret) {
    return createStep('--run-check', false, 'CCTVUP_CRON_TRIGGER_SECRET 설정이 없어 체크 실행을 건너뜁니다.');
  }

  const payload = await fetchJson(`${baseUrl}/api/cctvup/check/`, timeoutMs * 6, {
    headers: {
      'x-cctvup-cron-secret': secret,
      'x-cctvup-runner': 'local-smoke',
    },
  });

  return createStep(
    '--run-check',
    payload.ok === true,
    `run ${payload.runId ? payload.runId.slice(0, 8) : '-'} · state ${payload.stateCount ?? 0} · stale ${payload.archivedStaleStateCount ?? 0} · event ${payload.eventCount ?? 0}`,
    payload,
  );
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const args = new Set(process.argv.slice(2));
const shouldRunCheck = args.has('--run-check');
const baseUrl = (process.env.CCTVUP_SMOKE_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
const timeoutMs = Number(process.env.CCTVUP_SMOKE_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
const maxCheckAgeMinutes = Number(process.env.CCTVUP_SMOKE_MAX_CHECK_AGE_MINUTES || DEFAULT_MAX_CHECK_AGE_MINUTES);
const minCheckRuns = Number(process.env.CCTVUP_SMOKE_MIN_CHECK_RUNS || DEFAULT_MIN_CHECK_RUNS);
const now = new Date();
const steps = [];

try {
  if (shouldRunCheck) {
    steps.push(await runOptionalCheck(baseUrl, timeoutMs));
  }

  const websiteLaunchd = await getLaunchd('com.paiptree.website-dev');
  steps.push(createStep(
    'launchd website-dev',
    websiteLaunchd.ok && /state = running/.test(websiteLaunchd.stdout),
    websiteLaunchd.ok ? 'state=running' : websiteLaunchd.message,
    undefined,
    false,
  ));

  const checkLaunchd = await getLaunchd('com.paiptree.cctvup-check');
  steps.push(createStep(
    'launchd cctvup-check',
    checkLaunchd.ok && /run interval = 300 seconds/.test(checkLaunchd.stdout) && /last exit code = 0/.test(checkLaunchd.stdout),
    checkLaunchd.ok ? 'interval=300s · last_exit=0' : checkLaunchd.message,
    undefined,
    false,
  ));

  const dailyReportLaunchd = await getLaunchd('com.paiptree.cctvup-daily-report');
  steps.push(createStep(
    'launchd cctvup-daily-report',
    dailyReportLaunchd.ok && hasDailyReportLaunchdSchedule(dailyReportLaunchd.stdout) && /last exit code = 0/.test(dailyReportLaunchd.stdout),
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

  const currentPayload = await fetchJson(`${baseUrl}/api/cctvup/`, timeoutMs * 3);
  const farmIds = new Set(currentPayload.rows?.map((row) => row.farm) || []);
  const excludedFound = [...farmIds].filter((farmId) => EXPECTED_EXCLUDED_FARM_IDS.has(farmId));
  const haniRows = (currentPayload.rows || []).filter((row) => row.farm === EXPECTED_INCLUDED_FARM_ID);

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
    { excludedFound, haniRows: haniRows.map((row) => ({ id: row.id, status: row.status, scope: row.monitorScopeCode })) },
  ));

  try {
    const registryPayload = await fetchJson(`${baseUrl}/api/cctvup/registry/`, timeoutMs);
    const registryItems = Array.isArray(registryPayload?.items) ? registryPayload.items : [];
    steps.push(createStep(
      'api /api/cctvup/registry JSON',
      Array.isArray(registryPayload?.items),
      `${registryPayload?.source || 'unknown'} · items ${registryItems.length}`,
      {
        source: registryPayload?.source,
        itemCount: registryItems.length,
        message: registryPayload?.message,
      },
    ));
  } catch (error) {
    steps.push(createStep('api /api/cctvup/registry JSON', false, normalizeError(error)));
  }

  try {
    const dailyReportPayload = await fetchJson(`${baseUrl}/api/cctvup/daily-reports/`, timeoutMs);
    const reports = Array.isArray(dailyReportPayload?.reports) ? dailyReportPayload.reports : [];
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

  const historyPayload = await fetchJson(`${baseUrl}/api/cctvup/history/?limit=50&days=30&issueEventLimit=20000`, timeoutMs * 2);
  const checkRuns = parseCheckRuns(historyPayload);
  const latestRun = checkRuns[0];
  const latestAgeMinutes = latestRun?.checkedAt ? minutesBetween(now, latestRun.checkedAt) : null;
  const intervalWarnings = checkRuns
    .filter((run) => run.intervalMinutes !== null)
    .filter((run) => run.intervalMinutes < 4 || run.intervalMinutes > 7);

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

  const activeKeys = new Set((currentPayload.rows || []).filter((row) => (row.monitorScopeCode || 'active') === 'active').map((row) => row.id));
  const cameraStates = Array.isArray(historyPayload.cameraStates) ? historyPayload.cameraStates : [];
  const activeStates = cameraStates.filter((state) => ACTIVE_STATE_STATUSES.has(state.status || state.stateStatus));
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

const failures = steps.filter((step) => step.status === 'fail');
const warnings = steps.filter((step) => step.status === 'warn');
const report = {
  ok: failures.length === 0,
  checkedAt: now.toISOString(),
  baseUrl,
  mode: shouldRunCheck ? 'read-write-check' : 'read-only',
  failureCount: failures.length,
  warningCount: warnings.length,
  steps,
};

console.log(`CCTVUP local smoke (${report.mode})`);
for (const step of steps) {
  console.log(stateLine(step));
}
console.log(JSON.stringify(report, null, 2));

process.exit(report.ok ? 0 : 1);
