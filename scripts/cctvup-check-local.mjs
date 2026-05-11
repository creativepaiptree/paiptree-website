#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFile(fileName) {
  const filePath = resolve(process.cwd(), fileName);
  if (!existsSync(filePath)) return;

  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
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

function parseJson(text) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const checkUrl = process.env.CCTVUP_LOCAL_CHECK_URL || 'http://localhost:3002/api/cctvup/check/';
const secret = process.env.CCTVUP_CRON_TRIGGER_SECRET;
const timeoutMs = Number(process.env.CCTVUP_LOCAL_CHECK_TIMEOUT_MS || 120000);

if (!secret) {
  console.error(JSON.stringify({
    ok: false,
    message: 'CCTVUP_CRON_TRIGGER_SECRET 환경변수가 필요합니다.',
  }));
  process.exit(2);
}

const startedAt = Date.now();

try {
  const response = await fetch(checkUrl, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'x-cctvup-cron-secret': secret,
      'x-cctvup-runner': 'local-launchd',
    },
    signal: createTimeoutSignal(timeoutMs),
  });

  const text = await response.text();
  const payload = parseJson(text);
  const result = {
    ok: response.ok && payload?.ok !== false,
    httpStatus: response.status,
    elapsedMs: Date.now() - startedAt,
    checkedAt: payload?.checkedAt,
    source: payload?.source,
    runId: payload?.runId,
    stateCount: payload?.stateCount,
    archivedStaleStateCount: payload?.archivedStaleStateCount,
    eventCount: payload?.eventCount,
    openedCount: payload?.openedCount,
    recoveringCount: payload?.recoveringCount,
    resolvedCount: payload?.resolvedCount,
    message: payload?.message || response.statusText,
  };

  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exit(1);
} catch (error) {
  const message = error instanceof Error ? error.message : 'CCTVUP local check failed';
  const causeMessage = error instanceof Error && error.cause instanceof Error ? error.cause.message : '';
  const isLocalConnectionError = /fetch failed|ECONNREFUSED|ECONNRESET|ENOTFOUND|ETIMEDOUT/i.test(`${message} ${causeMessage}`);

  console.error(JSON.stringify({
    ok: false,
    elapsedMs: Date.now() - startedAt,
    checkUrl,
    message,
    hint: isLocalConnectionError
      ? '로컬 Next 서버가 떠 있는지 확인하세요. launchd com.paiptree.website-dev 또는 http://localhost:3002/cctvup/ 상태를 먼저 점검해야 합니다.'
      : undefined,
  }, null, 2));
  process.exit(1);
}
