#!/usr/bin/env node

import { createHmac } from 'node:crypto';
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

async function readJsonResponse(response, label) {
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`${label} JSON 파싱 실패: ${text.slice(0, 160)}`);
  }

  if (!response.ok) {
    throw new Error(payload?.message || `${label} HTTP ${response.status}`);
  }

  return payload;
}

function assertCurrentPayload(payload) {
  if (!payload || payload.source !== 'db' || !Array.isArray(payload.rows) || payload.rows.length === 0) {
    throw new Error(`로컬 현재 목록이 source=db 전체 payload가 아닙니다. source=${payload?.source || '-'} rows=${Array.isArray(payload?.rows) ? payload.rows.length : '-'}`);
  }
  if (!payload.summary || Number(payload.summary.farms ?? 0) <= 0 || Number(payload.summary.cameras ?? 0) <= 0) {
    throw new Error('로컬 현재 목록 summary가 비어 있습니다.');
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const localBaseUrl = (process.env.CCTVUP_LOCAL_BASE_URL || 'http://localhost:3002').replace(/\/+$/, '');
const localCurrentUrl = process.env.CCTVUP_LOCAL_CURRENT_URL || `${localBaseUrl}/api/cctvup/`;
const publishUrl = process.env.CCTVUP_CURRENT_CACHE_URL || 'http://52.79.116.76/api/cctvup/current-cache/';
const secret = process.env.CCTVUP_CRON_TRIGGER_SECRET;
const hmacSecret = process.env.CCTVUP_CURRENT_CACHE_HMAC_SECRET || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const timeoutMs = Number(process.env.CCTVUP_CURRENT_CACHE_TIMEOUT_MS || 120000);

if (!secret) {
  console.error(JSON.stringify({
    ok: false,
    message: 'CCTVUP_CRON_TRIGGER_SECRET 환경변수가 필요합니다.',
  }, null, 2));
  process.exit(2);
}

const startedAt = Date.now();

function buildCurrentCacheHeaders(body) {
  const headers = {
    'Content-Type': 'application/json',
    'x-cctvup-cron-secret': secret,
  };
  if (hmacSecret) {
    const timestamp = String(Date.now());
    headers['x-cctvup-cache-timestamp'] = timestamp;
    headers['x-cctvup-cache-signature'] = `sha256=${createHmac('sha256', hmacSecret).update(`${timestamp}.${body}`).digest('hex')}`;
  }
  return headers;
}

try {
  const currentResponse = await fetch(localCurrentUrl, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'x-cctvup-admin-secret': secret,
    },
    signal: createTimeoutSignal(timeoutMs),
  });
  const currentPayload = await readJsonResponse(currentResponse, '로컬 CCTVUP 현재 목록');
  assertCurrentPayload(currentPayload);

  const publishBody = JSON.stringify(currentPayload);
  const publishResponse = await fetch(publishUrl, {
    method: 'POST',
    cache: 'no-store',
    headers: buildCurrentCacheHeaders(publishBody),
    body: publishBody,
    signal: createTimeoutSignal(timeoutMs),
  });
  const publishPayload = await readJsonResponse(publishResponse, 'CCTVUP current cache publish');

  console.log(JSON.stringify({
    ok: true,
    elapsedMs: Date.now() - startedAt,
    localCurrentUrl,
    publishUrl,
    checkedAt: currentPayload.checkedAt,
    source: currentPayload.source,
    summary: currentPayload.summary,
    publish: {
      savedAt: publishPayload.savedAt,
      summary: publishPayload.summary,
    },
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({
    ok: false,
    elapsedMs: Date.now() - startedAt,
    localCurrentUrl,
    publishUrl,
    message: error instanceof Error ? error.message : 'CCTVUP current cache publish failed',
  }, null, 2));
  process.exit(1);
}
