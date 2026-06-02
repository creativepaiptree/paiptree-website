import { NextResponse } from 'next/server';
import { buildCctvUpReadDeniedPayload, getCctvUpReadAccessState } from '@/lib/cctvup-access';
import { fetchCctvUpCurrentPayload } from '@/lib/cctvup-current';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 1000;

export async function GET(request: Request) {
  const access = await getCctvUpReadAccessState(request);
  if (!access.ok) {
    return NextResponse.json(
      buildCctvUpReadDeniedPayload(access),
      { status: access.status, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || DEFAULT_LIMIT), 1), 1000);
  const { payload, status } = await fetchCctvUpCurrentPayload(limit, { preferSupabaseLatest: false });

  return NextResponse.json(payload, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}
