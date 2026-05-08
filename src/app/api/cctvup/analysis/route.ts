import { NextResponse } from 'next/server';
import { fetchCctvUpAnalysisPayload } from '@/lib/cctvup-analysis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function readRequiredParam(url: URL, key: string) {
  return url.searchParams.get(key)?.trim() || '';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const farmId = readRequiredParam(url, 'farmId');
  const houseId = readRequiredParam(url, 'houseId');
  const moduleId = readRequiredParam(url, 'moduleId');
  const latestImageAt = url.searchParams.get('latestImageAt')?.trim() || null;
  const windowHours = Number(url.searchParams.get('windowHours') || 2);
  const limit = Number(url.searchParams.get('limit') || 12);

  if (!farmId || !houseId || !moduleId) {
    return NextResponse.json(
      {
        source: 'unavailable',
        message: 'farmId, houseId, moduleId가 필요합니다.',
      },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const payload = await fetchCctvUpAnalysisPayload({
    farmId,
    houseId,
    moduleId,
    latestImageAt,
    windowHours,
    limit,
  });

  return NextResponse.json(payload, {
    status: payload.source === 'unavailable' ? 503 : 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}
