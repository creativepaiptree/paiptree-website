import { NextResponse } from 'next/server';
import { buildCctvUpReadDeniedPayload, getCctvUpReadAccessState } from '@/lib/cctvup-access';
import { fetchCctvUpImageEvidencePayload } from '@/lib/cctvup-images';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function readRequiredParam(url: URL, key: string) {
  return url.searchParams.get(key)?.trim() || '';
}

function readOptionalParam(url: URL, key: string) {
  return url.searchParams.get(key)?.trim() || null;
}

export async function GET(request: Request) {
  const access = await getCctvUpReadAccessState(request);
  if (!access.ok) {
    return NextResponse.json(
      {
        ...buildCctvUpReadDeniedPayload(access),
        items: [],
      },
      { status: access.status, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const url = new URL(request.url);
  const farmId = readRequiredParam(url, 'farmId');
  const houseId = readRequiredParam(url, 'houseId');
  const moduleId = readRequiredParam(url, 'moduleId');

  if (!farmId || !houseId || !moduleId) {
    return NextResponse.json(
      {
        source: 'unavailable',
        message: 'farmId, houseId, moduleId가 필요합니다.',
      },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const payload = await fetchCctvUpImageEvidencePayload({
    farmId,
    houseId,
    moduleId,
    firstMissedAt: readOptionalParam(url, 'firstMissedAt'),
    openedAt: readOptionalParam(url, 'openedAt'),
    resolvedAt: readOptionalParam(url, 'resolvedAt'),
  });

  return NextResponse.json(payload, {
    status: payload.source === 'unavailable' ? 503 : 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}
