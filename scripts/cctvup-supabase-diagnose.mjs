#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import dns from 'node:dns/promises';
import net from 'node:net';
import { resolve } from 'node:path';

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

function elapsed(startedAt) {
  return Date.now() - startedAt;
}

function timeoutSignal(timeoutMs) {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(timeoutMs);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

function normalizeError(error) {
  if (!error || typeof error !== 'object') {
    return { name: 'UnknownError', message: String(error) };
  }
  return {
    name: error.name || 'Error',
    code: error.code,
    errno: error.errno,
    syscall: error.syscall,
    hostname: error.hostname,
    status: error.status,
    preview: error.preview,
    message: error.message,
  };
}

function decodeJwtPayload(token) {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

async function runStep(name, fn) {
  const startedAt = Date.now();
  try {
    const data = await fn();
    return { name, ok: true, elapsedMs: elapsed(startedAt), ...data };
  } catch (error) {
    return { name, ok: false, elapsedMs: elapsed(startedAt), error: normalizeError(error) };
  }
}

async function tcpConnect(host, port, timeoutMs) {
  return new Promise((resolveConnect, rejectConnect) => {
    const socket = net.createConnection({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      rejectConnect(new Error(`TCP ${host}:${port} timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    socket.once('connect', () => {
      clearTimeout(timer);
      socket.end();
      resolveConnect({ port });
    });
    socket.once('error', (error) => {
      clearTimeout(timer);
      rejectConnect(error);
    });
  });
}

async function fetchJson(url, serviceKey, timeoutMs) {
  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Accept: 'application/json',
    },
    signal: timeoutSignal(timeoutMs),
  });
  const text = await response.text();
  const preview = text.slice(0, 160);
  if (!response.ok) {
    const error = new Error(`Supabase REST ${response.status}: ${preview || response.statusText}`);
    error.status = response.status;
    error.preview = preview;
    throw error;
  }

  return {
    status: response.status,
    httpOk: response.ok,
    bytes: Buffer.byteLength(text),
    preview,
  };
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const timeoutMs = Number(process.env.CCTVUP_SUPABASE_DIAG_TIMEOUT_MS || 5000);

if (!supabaseUrl || !serviceKey) {
  console.log(JSON.stringify({
    ok: false,
    message: 'SUPABASE_URL / SUPABASE_SERVICE_KEY 설정이 필요합니다.',
  }, null, 2));
  process.exit(2);
}

const parsedUrl = new URL(supabaseUrl);
const jwtPayload = decodeJwtPayload(serviceKey);
const projectRef = parsedUrl.hostname.split('.')[0];

const steps = [];
steps.push(await runStep('env', async () => ({
  host: parsedUrl.hostname,
  projectRef,
  keyRole: jwtPayload?.role,
  keyRef: jwtPayload?.ref,
  keyExp: jwtPayload?.exp ? new Date(jwtPayload.exp * 1000).toISOString() : null,
  refMatches: jwtPayload?.ref === projectRef,
})));

steps.push(await runStep('dns.lookup', async () => ({
  addresses: await dns.lookup(parsedUrl.hostname, { all: true }),
})));

steps.push(await runStep('tcp.443', async () => tcpConnect(parsedUrl.hostname, 443, timeoutMs)));

steps.push(await runStep('https.root', async () => {
  const response = await fetch(parsedUrl.origin, {
    cache: 'no-store',
    signal: timeoutSignal(timeoutMs),
  });
  return {
    status: response.status,
    httpOk: response.ok,
    bytes: Buffer.byteLength(await response.text()),
  };
}));

const restChecks = [
  ['rest.check_runs', 'tbl_cctvup_check_runs?select=id,checked_at&order=checked_at.desc&limit=1'],
  ['rest.camera_states.any', 'tbl_cctvup_camera_states?select=id,camera_key,status,last_checked_at&limit=1'],
  ['rest.camera_states.active', 'tbl_cctvup_camera_states?select=id,camera_key,status,last_checked_at&status=in.(watching,open,recovering)&order=last_checked_at.desc&limit=1'],
  ['rest.issue_events', 'tbl_cctvup_issue_events?select=id,camera_key,event_kind,event_at&order=event_at.desc&limit=1'],
  ['rest.registry', 'tbl_cctvup_farm_registry?select=farm_id,category&limit=1'],
];

for (const [name, query] of restChecks) {
  steps.push(await runStep(name, async () => fetchJson(`${parsedUrl.origin}/rest/v1/${query}`, serviceKey, timeoutMs)));
}

console.log(JSON.stringify({
  ok: steps.every((step) => step.ok),
  timeoutMs,
  checkedAt: new Date().toISOString(),
  steps,
}, null, 2));
