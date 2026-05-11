import { NextResponse } from 'next/server';
import { createCctvUpCheckRunner, getCctvUpCronAuthState } from '@/lib/cctvup-check-core.js';
import { fetchCctvUpCurrentPayload } from '@/lib/cctvup-current';
import { persistCctvUpStateCheck } from '@/lib/cctvup-state';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CRON_SECRET_HEADER = 'x-cctvup-cron-secret';
const RUNNER_HEADER = 'x-cctvup-runner';

const runCctvUpCheck = createCctvUpCheckRunner({
  loadCurrentPayload: async () => {
    const liveResult = await fetchCctvUpCurrentPayload(1000, {
      preferSupabaseLatest: false,
      includePersistedState: false,
    });
    return liveResult.payload;
  },
  persistHistory: persistCctvUpStateCheck,
});

function readCronSecret(request: Request) {
  const expectedSecret = process.env.CCTVUP_CRON_TRIGGER_SECRET?.trim();
  const providedSecret = request.headers.get(CRON_SECRET_HEADER)?.trim() || '';
  return getCctvUpCronAuthState({ expectedSecret, providedSecret });
}

function cleanCallerPart(value: string | null, fallback = 'unknown') {
  const clean = (value || fallback)
    .replace(/[;\n\r\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return clean.slice(0, 80) || fallback;
}

function buildCheckCallerNote(request: Request) {
  const url = new URL(request.url);
  const runner = cleanCallerPart(request.headers.get(RUNNER_HEADER));
  const host = cleanCallerPart(request.headers.get('host') || url.host);
  const userAgent = cleanCallerPart(request.headers.get('user-agent'));
  const forwardedFor = cleanCallerPart(request.headers.get('x-forwarded-for'), 'none');
  return `caller=${runner}; method=${request.method}; host=${host}; ua=${userAgent}; xff=${forwardedFor}`;
}

export async function GET(request: Request) {
  const auth = readCronSecret(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, message: auth.message, mode: auth.mode },
      { status: auth.status, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const callerNote = buildCheckCallerNote(request);
  const result = await runCctvUpCheck({ noteSuffix: callerNote });
  if (result.payload.source !== 'db') {
    return NextResponse.json(
      {
        ok: false,
        message: '운영 DB 데이터가 아니라서 history 적재를 건너뜁니다.',
        checkedAt: result.payload.checkedAt,
        source: result.payload.source,
        summary: result.payload.summary,
        auth: auth.mode,
        caller: callerNote,
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  if (!result.persistResult.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: result.persistResult.message,
        checkedAt: result.payload.checkedAt,
        source: result.payload.source,
        summary: result.persistResult.summary ?? result.payload.summary,
        auth: auth.mode,
        caller: callerNote,
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      auth: auth.mode,
      caller: callerNote,
      checkedAt: result.payload.checkedAt,
      source: result.payload.source,
      runId: result.persistResult.runId,
      snapshotCount: result.persistResult.snapshotCount,
      incidentCount: result.persistResult.incidentCount,
      currentIssueCount: result.persistResult.currentIssueCount,
      resolvedIssueCount: result.persistResult.resolvedIssueCount,
      stateCount: result.persistResult.stateCount,
      archivedStaleStateCount: result.persistResult.archivedStaleStateCount ?? 0,
      eventCount: result.persistResult.eventCount,
      openedCount: result.persistResult.openedCount,
      recoveringCount: result.persistResult.recoveringCount,
      resolvedCount: result.persistResult.resolvedCount,
      summary: result.persistResult.summary ?? result.payload.summary,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(request: Request) {
  return GET(request);
}
