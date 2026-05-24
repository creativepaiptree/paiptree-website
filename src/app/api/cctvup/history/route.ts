import { NextResponse } from 'next/server';
import { getCctvUpCronAuthState } from '@/lib/cctvup-check-core.js';
import { fetchCctvUpHistory, persistCctvUpHistory } from '@/lib/cctvup-history';
import type { CctvUpPayload } from '@/lib/cctvup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CRON_SECRET_HEADER = 'x-cctvup-cron-secret';

function readMutationSecret(request: Request) {
  const expectedSecret = process.env.CCTVUP_CRON_TRIGGER_SECRET?.trim();
  const providedSecret = request.headers.get(CRON_SECRET_HEADER)?.trim() || '';
  return getCctvUpCronAuthState({ expectedSecret, providedSecret });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 50), 1), 500);
  const issueEventDays = Math.min(Math.max(Number(url.searchParams.get('days') || 30), 1), 30);
  const issueEventLimit = Math.min(Math.max(Number(url.searchParams.get('issueEventLimit') || 20000), 1), 30000);
  const payload = await fetchCctvUpHistory(limit, { issueEventDays, issueEventLimit });

  if (!payload) {
    return NextResponse.json(
      {
        source: 'unavailable',
        checkRuns: [],
        snapshots: [],
        incidents: [],
        currentIssues: [],
        cameraStates: [],
        issueEvents: [],
        farmScopeEvents: [],
        message: 'SUPABASE_URL 또는 SUPABASE_SERVICE_KEY 설정이 없어 history를 읽지 못했습니다.',
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
    const payload = (await req.json()) as CctvUpPayload;
    if (!payload || !Array.isArray(payload.rows) || !payload.summary || !payload.checkedAt) {
      return NextResponse.json(
        {
          ok: false,
          message: '요청 payload 형식이 올바르지 않습니다.',
        },
        { status: 400 },
      );
    }

    const result = await persistCctvUpHistory(payload);
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
        runId: result.runId,
        snapshotCount: result.snapshotCount,
        incidentCount: result.incidentCount,
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : 'CCTVUP history 저장에 실패했습니다.',
      },
      { status: 500 },
    );
  }
}
