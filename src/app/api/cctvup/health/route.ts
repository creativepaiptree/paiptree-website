import { NextResponse } from 'next/server';
import { getCctvUpCronAuthState } from '@/lib/cctvup-check-core.js';
import { diagnoseCctvUpDb } from '@/lib/cctvup-current';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CRON_SECRET_HEADER = 'x-cctvup-cron-secret';

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

  const health = await diagnoseCctvUpDb();

  return NextResponse.json(
    {
      ...health,
      auth: auth.mode,
    },
    {
      status: health.ok ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
