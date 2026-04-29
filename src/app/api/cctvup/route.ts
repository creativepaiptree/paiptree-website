import { NextResponse } from 'next/server';
import { fetchCctvUpCurrentPayload } from '@/lib/cctvup-current';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 1000;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || DEFAULT_LIMIT), 1), 1000);
  const { payload, status } = await fetchCctvUpCurrentPayload(limit);

  return NextResponse.json(payload, {
    status,
      headers: { 'Cache-Control': 'no-store' },
    });
}
