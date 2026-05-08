import { NextResponse } from 'next/server';
import { getCctvUpCronAuthState } from '@/lib/cctvup-check-core.js';
import { diagnoseCctvUpSupabase } from '@/lib/cctvup-supabase-diagnose';

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

  const result = await diagnoseCctvUpSupabase();
  return NextResponse.json(
    {
      ...result,
      auth: auth.mode,
    },
    {
      status: result.ok ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
