import { NextResponse } from 'next/server';
import { fetchCctvUpHistory, persistCctvUpHistory } from '@/lib/cctvup-history';
import type { CctvUpPayload } from '@/lib/cctvup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 200), 1), 500);
  const payload = await fetchCctvUpHistory(limit);

  if (!payload) {
    return NextResponse.json(
      {
        source: 'unavailable',
        checkRuns: [],
        snapshots: [],
        incidents: [],
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
