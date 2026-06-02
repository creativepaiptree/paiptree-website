import { NextResponse } from 'next/server';
import { buildCctvUpReadDeniedPayload, getCctvUpReadAccessState } from '@/lib/cctvup-access';
import { runCctvUpSmokeCheck } from '@/lib/cctvup-smoke';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const access = await getCctvUpReadAccessState(request);
  if (!access.ok) {
    return NextResponse.json(
      {
        ...buildCctvUpReadDeniedPayload(access),
        steps: [],
      },
      { status: access.status, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const requestUrl = new URL(request.url);
  const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
  const readSecret = request.headers.get('x-cctvup-admin-secret')?.trim()
    || request.headers.get('x-cctvup-cron-secret')?.trim()
    || '';
  const result = await runCctvUpSmokeCheck({ baseUrl, readSecret });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
