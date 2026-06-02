import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getCctvUpCronAuthState } from '@/lib/cctvup-check-core.js';
import {
  isValidCctvUpCurrentCachePayload,
  readCctvUpCurrentCachePayload,
  writeCctvUpCurrentCachePayload,
} from '@/lib/cctvup-current-cache';
import type { CctvUpPayload } from '@/lib/cctvup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CRON_SECRET_HEADER = 'x-cctvup-cron-secret';
const HMAC_TIMESTAMP_HEADER = 'x-cctvup-cache-timestamp';
const HMAC_SIGNATURE_HEADER = 'x-cctvup-cache-signature';
const HMAC_MAX_SKEW_MS = 5 * 60 * 1000;

function readCronSecret(request: Request) {
  const expectedSecret = process.env.CCTVUP_CRON_TRIGGER_SECRET?.trim();
  const providedSecret = request.headers.get(CRON_SECRET_HEADER)?.trim() || '';
  return getCctvUpCronAuthState({ expectedSecret, providedSecret });
}

function getCacheHmacSecret() {
  return (
    process.env.CCTVUP_CURRENT_CACHE_HMAC_SECRET?.trim()
    || process.env.SUPABASE_SERVICE_KEY?.trim()
    || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    || ''
  );
}

function safeCompareHex(expectedHex: string, providedHex: string) {
  if (!/^[a-f0-9]{64}$/i.test(expectedHex) || !/^[a-f0-9]{64}$/i.test(providedHex)) return false;
  const expected = Buffer.from(expectedHex, 'hex');
  const provided = Buffer.from(providedHex, 'hex');
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

function verifyHmacSignature(request: Request, body: string) {
  const secret = getCacheHmacSecret();
  const timestamp = request.headers.get(HMAC_TIMESTAMP_HEADER)?.trim() || '';
  const rawSignature = request.headers.get(HMAC_SIGNATURE_HEADER)?.trim() || '';
  const signature = rawSignature.replace(/^sha256=/i, '');
  const timestampMs = Number(timestamp);

  if (!secret || !timestamp || !signature || !Number.isFinite(timestampMs)) {
    return {
      ok: false as const,
      status: secret ? 401 : 503,
      mode: secret ? 'cache-hmac-missing' : 'cache-hmac-unconfigured',
      message: secret
        ? 'CCTVUP current cache HMAC signature is missing.'
        : 'CCTVUP current cache HMAC secret is not configured.',
    };
  }

  if (Math.abs(Date.now() - timestampMs) > HMAC_MAX_SKEW_MS) {
    return {
      ok: false as const,
      status: 401,
      mode: 'cache-hmac-stale',
      message: 'CCTVUP current cache HMAC timestamp is stale.',
    };
  }

  const expected = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
  if (!safeCompareHex(expected, signature)) {
    return {
      ok: false as const,
      status: 401,
      mode: 'cache-hmac-mismatch',
      message: 'CCTVUP current cache HMAC signature mismatch.',
    };
  }

  return {
    ok: true as const,
    status: 200,
    mode: 'cache-hmac',
    message: 'CCTVUP current cache HMAC signature accepted.',
  };
}

function readWriteAuth(request: Request, body: string) {
  const cronAuth = readCronSecret(request);
  if (cronAuth.ok) return cronAuth;

  const hmacAuth = verifyHmacSignature(request, body);
  if (hmacAuth.ok) return hmacAuth;

  return hmacAuth.status === 503 ? hmacAuth : cronAuth;
}

export async function GET(request: Request) {
  const auth = readCronSecret(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, message: auth.message, mode: auth.mode },
      { status: auth.status, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const payload = await readCctvUpCurrentCachePayload();
  return NextResponse.json(
    {
      ok: Boolean(payload),
      source: payload ? 'cache' : 'unavailable',
      checkedAt: payload?.checkedAt ?? null,
      summary: payload?.summary ?? null,
      message: payload ? payload.message : 'CCTVUP current cache가 없거나 만료되었습니다.',
    },
    { status: payload ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const auth = readWriteAuth(request, body);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, message: auth.message, mode: auth.mode },
      { status: auth.status, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  let payload: CctvUpPayload;
  try {
    payload = JSON.parse(body) as CctvUpPayload;
  } catch {
    return NextResponse.json(
      { ok: false, message: 'JSON payload를 읽지 못했습니다.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  if (!isValidCctvUpCurrentCachePayload(payload)) {
    return NextResponse.json(
      { ok: false, message: 'source=db이고 rows/summary가 있는 CCTVUP 전체 현재 목록만 저장할 수 있습니다.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const result = await writeCctvUpCurrentCachePayload(payload);
    return NextResponse.json(
      {
        ok: true,
        source: 'cache',
        savedAt: result.savedAt,
        summary: result.summary,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : 'CCTVUP current cache 저장에 실패했습니다.',
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
