import { NextResponse } from 'next/server';
import { buildCctvUpReadDeniedPayload, getCctvUpReadAccessState } from '@/lib/cctvup-access';
import { fetchCctvUpCurrentPayload } from '@/lib/cctvup-current';
import { buildCctvUpManagedFarmsPayload } from '@/lib/cctvup-managed-farms';
import { fetchCctvUpFarmRegistry, type CctvUpFarmRegistryPayload } from '@/lib/cctvup-registry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 1000;

export async function GET(request: Request) {
  const access = await getCctvUpReadAccessState(request);
  if (!access.ok) {
    return NextResponse.json(
      {
        ...buildCctvUpReadDeniedPayload(access),
        farms: [],
      },
      { status: access.status, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || DEFAULT_LIMIT), 1), DEFAULT_LIMIT);
  const [{ payload, status }, registryPayload] = await Promise.all([
    fetchCctvUpCurrentPayload(limit, { preferSupabaseLatest: false }),
    fetchCctvUpFarmRegistry(),
  ]);
  const registry = registryPayload ?? ({
    source: 'unavailable',
    items: [],
    message: 'SUPABASE_URL 또는 SUPABASE_SERVICE_KEY 설정이 없어 registry를 읽지 못했습니다.',
  } satisfies CctvUpFarmRegistryPayload);
  const managedPayload = buildCctvUpManagedFarmsPayload(payload, registry);

  return NextResponse.json(managedPayload, {
    status: managedPayload.ok ? 200 : status,
    headers: { 'Cache-Control': 'no-store' },
  });
}
