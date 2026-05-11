import { NextResponse } from 'next/server';
import { runCctvUpSmokeCheck } from '@/lib/cctvup-smoke';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
  const result = await runCctvUpSmokeCheck({ baseUrl });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
