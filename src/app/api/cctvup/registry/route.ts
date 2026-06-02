import { NextResponse } from 'next/server';
import { buildCctvUpReadDeniedPayload, getCctvUpReadAccessState } from '@/lib/cctvup-access';
import { getCctvUpCronAuthState } from '@/lib/cctvup-check-core.js';
import {
  fetchCctvUpFarmRegistry,
  upsertCctvUpFarmRegistry,
  type CctvUpFarmRegistryUpsertPayload,
} from '@/lib/cctvup-registry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CRON_SECRET_HEADER = 'x-cctvup-cron-secret';
const ADMIN_SECRET_HEADER = 'x-cctvup-admin-secret';

function isLocalHost(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === '::1' || normalized.startsWith('[::1]')) return true;

  const host = normalized.split(':')[0];
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

function isLocalRegistryMutation(request: Request) {
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) return false;

  const url = new URL(request.url);
  const host = request.headers.get('host') || url.host;
  return isLocalHost(url.hostname) || isLocalHost(host);
}

function readMutationSecret(request: Request) {
  if (isLocalRegistryMutation(request)) {
    return {
      ok: true,
      status: 200,
      mode: 'local-registry',
      message: '로컬 CCTVUP registry 저장 요청을 허용했습니다.',
    };
  }

  const expectedSecret = (
    process.env.CCTVUP_REGISTRY_ADMIN_SECRET || process.env.CCTVUP_CRON_TRIGGER_SECRET
  )?.trim();
  const providedSecret = (
    request.headers.get(ADMIN_SECRET_HEADER) || request.headers.get(CRON_SECRET_HEADER) || ''
  ).trim();
  const auth = getCctvUpCronAuthState({ expectedSecret, providedSecret });
  if (auth.ok) return auth;

  const detail =
    auth.mode === 'unconfigured'
      ? '서버 관리 secret이 설정되어 있지 않습니다.'
      : providedSecret
        ? '관리 secret이 서버 값과 일치하지 않습니다.'
        : '관리 secret이 요청에 포함되지 않았습니다.';

  return {
    ...auth,
    message: `CCTVUP registry 저장 권한이 없습니다: ${detail}`,
  };
}

export async function GET(request: Request) {
  const access = await getCctvUpReadAccessState(request);
  if (!access.ok) {
    return NextResponse.json(
      {
        ...buildCctvUpReadDeniedPayload(access),
        items: [],
      },
      { status: access.status, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const payload = await fetchCctvUpFarmRegistry();
  if (!payload) {
    return NextResponse.json(
      {
        source: 'unavailable',
        items: [],
        message: 'SUPABASE_URL 또는 SUPABASE_SERVICE_KEY 설정이 없어 registry를 읽지 못했습니다.',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  return NextResponse.json(payload, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(req: Request) {
  const auth = readMutationSecret(req);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, message: auth.message, mode: auth.mode },
      { status: auth.status, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const payload = (await req.json()) as CctvUpFarmRegistryUpsertPayload;
    if (!payload || !Array.isArray(payload.items)) {
      return NextResponse.json(
        {
          ok: false,
          message: '요청 payload 형식이 올바르지 않습니다.',
        },
        { status: 400 },
      );
    }

    const result = await upsertCctvUpFarmRegistry(payload);
    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: result.message,
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        count: result.count,
        auth: auth.mode,
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : 'CCTVUP registry 저장에 실패했습니다.',
      },
      { status: 500 },
    );
  }
}
