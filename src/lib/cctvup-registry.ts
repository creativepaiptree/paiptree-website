import { getCctvUpSupabaseConfig } from '@/lib/cctvup-history';

export const CCTVUP_FARM_REGISTRY_TABLE = 'tbl_cctvup_farm_registry';

export type CctvUpFarmCategory = 'overseas' | 'shinwoo' | 'cheriburo' | 'other';
export type CctvUpFarmCategorySource = 'auto' | 'legacy' | 'manual';

export type CctvUpFarmRegistryEntry = {
  farmId: string;
  displayName?: string;
  category?: CctvUpFarmCategory;
  categorySource?: CctvUpFarmCategorySource;
  tags: string[];
  memo?: string;
  aliases: string[];
  updatedAt?: string;
  updatedBy?: string;
  isActive?: boolean;
};

type SupabaseRegistryRow = {
  farm_id: string;
  display_name?: string | null;
  category?: CctvUpFarmCategory | null;
  category_source?: CctvUpFarmCategorySource | null;
  tags?: string[] | string | null;
  memo?: string | null;
  aliases?: string[] | string | null;
  updated_at?: string | null;
  updated_by?: string | null;
  is_active?: boolean | null;
};

export type CctvUpFarmRegistryPayload = {
  source: 'supabase' | 'unavailable';
  items: CctvUpFarmRegistryEntry[];
  message?: string;
};

const CATEGORY_SET = new Set<CctvUpFarmCategory>(['overseas', 'shinwoo', 'cheriburo', 'other']);
const CATEGORY_SOURCE_SET = new Set<CctvUpFarmCategorySource>(['auto', 'legacy', 'manual']);
const SUPABASE_REGISTRY_READ_TIMEOUT_MS = Number(process.env.CCTVUP_SUPABASE_FETCH_TIMEOUT_MS || 2000);
const SUPABASE_REGISTRY_WRITE_TIMEOUT_MS = Number(process.env.CCTVUP_SUPABASE_WRITE_TIMEOUT_MS || 8000);

function createTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return undefined;
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(timeoutMs);
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

function formatRegistryFetchError(error: unknown) {
  if (error instanceof Error && error.name === 'TimeoutError') {
    return `Supabase farm registry 조회가 ${SUPABASE_REGISTRY_READ_TIMEOUT_MS}ms 안에 끝나지 않았습니다.`;
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return `Supabase farm registry 조회가 ${SUPABASE_REGISTRY_READ_TIMEOUT_MS}ms 안에 중단되었습니다.`;
  }
  return error instanceof Error ? error.message : 'CCTVUP farm registry fetch failed';
}

const asList = (value: SupabaseRegistryRow['tags'] | SupabaseRegistryRow['aliases']): string[] => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const buildEndpoint = (table: string) => {
  const config = getCctvUpSupabaseConfig();
  if (!config) return null;
  return new URL(`/rest/v1/${table}`, config.supabaseUrl);
};

export function normalizeCctvUpFarmCategory(value: unknown): CctvUpFarmCategory | undefined {
  if (typeof value !== 'string') return undefined;
  const compact = value.trim().toLowerCase();
  if (!compact) return undefined;
  if (compact === '해외' || compact === 'overseas') return 'overseas';
  if (compact === '신우' || compact === 'shinwoo') return 'shinwoo';
  if (compact === '체리부로' || compact === 'cheriburo') return 'cheriburo';
  if (compact === '기타' || compact === 'other') return 'other';
  return undefined;
}

export function normalizeCctvUpFarmCategorySource(value: unknown): CctvUpFarmCategorySource | undefined {
  if (typeof value !== 'string') return undefined;
  const compact = value.trim().toLowerCase();
  if (compact === 'auto' || compact === '자동') return 'auto';
  if (compact === 'legacy' || compact === '기존') return 'legacy';
  if (compact === 'manual' || compact === '수동') return 'manual';
  return undefined;
}

export function normalizeCctvUpFarmRegistryEntry(row: SupabaseRegistryRow): CctvUpFarmRegistryEntry {
  const category = normalizeCctvUpFarmCategory(row.category) ?? 'other';
  const categorySource = normalizeCctvUpFarmCategorySource(row.category_source) ?? 'legacy';
  return {
    farmId: row.farm_id,
    displayName: row.display_name?.trim() || undefined,
    category: CATEGORY_SET.has(category) ? category : 'other',
    categorySource: CATEGORY_SOURCE_SET.has(categorySource) ? categorySource : 'legacy',
    tags: asList(row.tags),
    memo: row.memo?.trim() || undefined,
    aliases: asList(row.aliases),
    updatedAt: row.updated_at || undefined,
    updatedBy: row.updated_by || undefined,
    isActive: row.is_active ?? true,
  };
}

export function splitRegistryList(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinRegistryList(items: string[]): string {
  return items.join(', ');
}

export async function fetchCctvUpFarmRegistry(): Promise<CctvUpFarmRegistryPayload | null> {
  const endpoint = buildEndpoint(CCTVUP_FARM_REGISTRY_TABLE);
  const config = getCctvUpSupabaseConfig();
  if (!endpoint || !config) return null;

  const fetchRows = async (select: string) => {
    endpoint.searchParams.set('select', select);
    endpoint.searchParams.set('order', 'farm_id.asc');
    endpoint.searchParams.set('limit', '1000');

    const response = await fetch(endpoint.toString(), {
      method: 'GET',
      cache: 'no-store',
      signal: createTimeoutSignal(SUPABASE_REGISTRY_READ_TIMEOUT_MS),
      headers: {
        apikey: config.serviceKey,
        Authorization: `Bearer ${config.serviceKey}`,
        Accept: 'application/json',
      },
    });

    const body = await response.text();
    return { response, body };
  };

  const selectWithCategorySource = 'farm_id,display_name,category,category_source,tags,memo,aliases,updated_at,updated_by,is_active';
  const legacySelect = 'farm_id,display_name,category,tags,memo,aliases,updated_at,updated_by,is_active';

  endpoint.searchParams.set('select', selectWithCategorySource);
  endpoint.searchParams.set('order', 'farm_id.asc');
  endpoint.searchParams.set('limit', '1000');

  try {
    let { response, body } = await fetchRows(selectWithCategorySource);
    if (!response.ok && body.includes('category_source')) {
      ({ response, body } = await fetchRows(legacySelect));
    }

    if (!response.ok) {
      return {
        source: 'unavailable',
        items: [],
        message: `Supabase farm registry 조회 실패 (${response.status}): ${body}`,
      };
    }

    let rows: unknown[] = [];
    try {
      rows = JSON.parse(body) as unknown[];
    } catch {
      rows = [];
    }
    if (!Array.isArray(rows)) {
      return {
        source: 'unavailable',
        items: [],
        message: 'Supabase farm registry 응답이 배열이 아닙니다.',
      };
    }

    return {
      source: 'supabase',
      items: rows
        .filter((row): row is SupabaseRegistryRow => typeof row === 'object' && row !== null)
        .map(normalizeCctvUpFarmRegistryEntry),
    };
  } catch (error) {
    return {
      source: 'unavailable',
      items: [],
      message: formatRegistryFetchError(error),
    };
  }
}

export type CctvUpFarmRegistryUpsertPayload = {
  items: Array<{
    farmId: string;
    displayName?: string;
    category?: CctvUpFarmCategory;
    categorySource?: CctvUpFarmCategorySource;
    tags?: string[];
    memo?: string;
    aliases?: string[];
    isActive?: boolean;
  }>;
};

export async function upsertCctvUpFarmRegistry(payload: CctvUpFarmRegistryUpsertPayload) {
  const config = getCctvUpSupabaseConfig();
  if (!config) {
    return { ok: false as const, message: 'SUPABASE_URL / SUPABASE_SERVICE_KEY 설정이 필요합니다.' };
  }

  const rows = payload.items
    .filter((item) => item && typeof item.farmId === 'string' && item.farmId.trim())
    .map((item) => ({
      farm_id: item.farmId.trim(),
      display_name: item.displayName?.trim() || null,
      category: item.category || null,
      category_source: item.categorySource || (item.category ? 'manual' : 'legacy'),
      tags: Array.isArray(item.tags) ? item.tags : [],
      memo: item.memo?.trim() || '',
      aliases: Array.isArray(item.aliases) ? item.aliases : [],
      is_active: item.isActive ?? true,
      updated_at: new Date().toISOString(),
    }));

  if (!rows.length) {
    return { ok: true as const, count: 0 };
  }

  const endpoint = new URL(`/rest/v1/${CCTVUP_FARM_REGISTRY_TABLE}`, config.supabaseUrl);
  endpoint.searchParams.set('on_conflict', 'farm_id');

  const postRows = (nextRows: Array<Record<string, unknown>>) => fetch(endpoint.toString(), {
    method: 'POST',
    cache: 'no-store',
    signal: createTimeoutSignal(SUPABASE_REGISTRY_WRITE_TIMEOUT_MS),
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(nextRows),
  });

  let response = await postRows(rows);
  let body = response.ok ? '' : await response.text();
  if (!response.ok && body.includes('category_source')) {
    const fallbackRows = rows.map(({ category_source: _categorySource, ...row }) => row);
    response = await postRows(fallbackRows);
    body = response.ok ? '' : await response.text();
  }

  if (!response.ok) {
    return { ok: false as const, message: `Supabase farm registry 저장 실패 (${response.status}): ${body}` };
  }

  return { ok: true as const, count: rows.length };
}
