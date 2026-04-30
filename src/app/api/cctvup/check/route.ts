import { NextResponse } from 'next/server';
import { createCctvUpCheckRunner, getCctvUpCronAuthState } from '@/lib/cctvup-check-core.js';
import { fetchCctvUpCurrentPayload } from '@/lib/cctvup-current';
import { persistCctvUpHistory } from '@/lib/cctvup-history';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CRON_SECRET_HEADER = 'x-cctvup-cron-secret';

const runCctvUpCheck = createCctvUpCheckRunner({
  loadCurrentPayload: async () => {
    const { payload } = await fetchCctvUpCurrentPayload();
    return payload;
  },
  persistHistory: persistCctvUpHistory,
});

function readCronSecret(request: Request) {
  const expectedSecret = process.env.CCTVUP_CRON_TRIGGER_SECRET?.trim();
  const providedSecret = request.headers.get(CRON_SECRET_HEADER)?.trim() || '';
  return getCctvUpCronAuthState({ expectedSecret, providedSecret });
}

export async function GET(request: Request) {
  const auth = readCronSecret(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, message: auth.message, mode: auth.mode },
      { status: auth.status, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const result = await runCctvUpCheck();
  if (result.payload.source !== 'db') {
    return NextResponse.json(
      {
        ok: false,
        message: '운영 DB 데이터가 아니라서 history 적재를 건너뜁니다.',
        payload: result.payload,
        auth: auth.mode,
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  if (!result.persistResult.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: result.persistResult.message,
        payload: result.payload,
        auth: auth.mode,
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      auth: auth.mode,
      checkedAt: result.payload.checkedAt,
      source: result.payload.source,
      runId: result.persistResult.runId,
      snapshotCount: result.persistResult.snapshotCount,
      incidentCount: result.persistResult.incidentCount,
      currentIssueCount: result.persistResult.currentIssueCount,
      resolvedIssueCount: result.persistResult.resolvedIssueCount,
      summary: result.payload.summary,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(request: Request) {
  return GET(request);
}