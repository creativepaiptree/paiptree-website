import type { CctvUpMonitorScopeCode, CctvUpPayload, CctvUpRow, CctvUpStatus } from '@/lib/cctvup';
import {
  type CctvUpFarmCategory,
  type CctvUpFarmRegistryEntry,
  type CctvUpFarmRegistryPayload,
  normalizeCctvUpFarmCategory,
  normalizeCctvUpFarmCategorySource,
} from '@/lib/cctvup-registry';

export type CctvUpManagedFarmVendorCode = 'shinwoo' | 'cheriburo' | 'cpf' | 'prifoods' | 'overseas' | 'other';

export type CctvUpManagedFarm = {
  farmId: string;
  farmName: string;
  vendorCode: CctvUpManagedFarmVendorCode;
  vendorLabel: string;
  category: CctvUpFarmCategory;
  monitorScopeCode: CctvUpMonitorScopeCode;
  monitorScopeLabel: string;
  status: CctvUpStatus;
  isProblem: boolean;
  cameraCount: number;
  problemCount: number;
  okCount: number;
  latestAt: string;
  latestAtIso: string | null;
  tags: string[];
  hasPocTag: boolean;
  memo: string;
  sourceAffiliates: string | null;
  sourceCountry: string | null;
  source: 'current' | 'registry';
};

export type CctvUpManagedFarmsPayload = {
  ok: boolean;
  source: 'current-plus-registry' | 'registry-only' | 'unavailable';
  checkedAt: string;
  registrySource: CctvUpFarmRegistryPayload['source'];
  farms: CctvUpManagedFarm[];
  summary: {
    farms: number;
    cameras: number;
    issueFarms: number;
    activeFarms: number;
    pocTaggedFarms: number;
    vendorCounts: Record<CctvUpManagedFarmVendorCode, number>;
  };
  message?: string;
};

const VENDOR_LABELS: Record<CctvUpManagedFarmVendorCode, string> = {
  shinwoo: '신우',
  cheriburo: '체리부로',
  cpf: 'CPF',
  prifoods: 'PRIFOODS',
  overseas: '해외',
  other: '기타',
};

const VENDOR_ORDER: Record<CctvUpManagedFarmVendorCode, number> = {
  shinwoo: 0,
  cheriburo: 1,
  cpf: 2,
  prifoods: 3,
  overseas: 4,
  other: 5,
};

const STATUS_ORDER: Record<CctvUpStatus, number> = {
  critical: 0,
  missing: 1,
  late: 2,
  ok: 3,
  paused: 4,
};

const CATEGORY_ORDER: Record<CctvUpFarmCategory, number> = {
  overseas: 0,
  shinwoo: 1,
  cheriburo: 2,
  other: 3,
};

function cleanText(value: unknown) {
  return String(value || '').trim();
}

function normalizeText(value: unknown) {
  return cleanText(value).toLowerCase();
}

function classifyFarmCategory(row: Pick<CctvUpRow, 'farmName' | 'farmAlias' | 'farmAffiliates' | 'country'>): CctvUpFarmCategory {
  const affiliates = normalizeText(row.farmAffiliates);
  const country = cleanText(row.country).toUpperCase();
  if (/cherry|체리/.test(affiliates)) return 'cheriburo';
  if (/shinwoo|신우/.test(affiliates)) return 'shinwoo';
  if (country && country !== 'KR') return 'overseas';
  if (/taiwan|indonesia|madagascar|cpgroup|prifoods|laos|overseas|global/.test(affiliates)) return 'overseas';

  const nameText = [row.farmName, row.farmAlias].map(cleanText).filter(Boolean).join(' ');
  const compact = nameText.replace(/\s+/g, '');
  if (/체리부로/i.test(nameText) || /체리/.test(compact)) return 'cheriburo';
  if (/신우/i.test(nameText)) return 'shinwoo';
  if (/해외/i.test(nameText)) return 'overseas';
  if (!/[가-힣]/.test(nameText) && /[A-Za-z\u3400-\u9fff]/.test(nameText)) return 'overseas';
  return 'other';
}

function resolveCategory(row: CctvUpRow, entry?: CctvUpFarmRegistryEntry): CctvUpFarmCategory {
  const autoCategory = classifyFarmCategory(row);
  const registryCategory = normalizeCctvUpFarmCategory(entry?.category);
  if (!registryCategory) return autoCategory;

  const categorySource = normalizeCctvUpFarmCategorySource(entry?.categorySource) ?? 'legacy';
  if (categorySource === 'manual') return registryCategory;
  if (autoCategory !== 'other') return autoCategory;
  return registryCategory;
}

function getGroupMonitorScope(rows: CctvUpRow[]): CctvUpMonitorScopeCode {
  const scopes = new Set(rows.map((row) => row.monitorScopeCode ?? 'active'));
  if (scopes.has('active')) return 'active';
  if (scopes.has('needs_review')) return 'needs_review';
  if (scopes.has('resting')) return 'resting';
  return 'uninstalled';
}

function getMonitorScopeLabel(scope: CctvUpMonitorScopeCode) {
  if (scope === 'active') return '감시중';
  if (scope === 'resting') return '휴지기';
  if (scope === 'needs_review') return '대상확인';
  return '미설치';
}

function pickLatestRow(rows: CctvUpRow[]) {
  return rows.slice().sort((a, b) => String(b.latestAtIso || b.latestAt || '').localeCompare(String(a.latestAtIso || a.latestAt || '')))[0];
}

function getGroupStatus(rows: CctvUpRow[]): CctvUpStatus {
  const activeRows = rows.filter((row) => row.status !== 'paused');
  if (!activeRows.length) return 'paused';
  return activeRows.slice().sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])[0]?.status ?? 'ok';
}

function hasPocTag(tags: string[]) {
  return tags.some((tag) => /(^|\s|,)(poc|실증)($|\s|,)/i.test(tag));
}

function getVendorCode(params: {
  category: CctvUpFarmCategory;
  farmId: string;
  farmName: string;
  rows: CctvUpRow[];
  tags: string[];
}): CctvUpManagedFarmVendorCode {
  const text = [
    params.category,
    params.farmId,
    params.farmName,
    ...params.tags,
    ...params.rows.flatMap((row) => [row.farmName, row.farmAlias, row.farmAffiliates, row.country]),
  ].map(normalizeText).join(' ');
  const countries = params.rows.map((row) => cleanText(row.country).toUpperCase());

  if (/(^|\s)(shinwoo|신우)($|\s)/.test(text) || params.category === 'shinwoo') return 'shinwoo';
  if (/cherry|cheriburo|체리/.test(text) || params.category === 'cheriburo') return 'cheriburo';
  if (/(^|\s)(cpf|cpgroup|cp group|태국|thailand)($|\s)/.test(text) || countries.includes('TH')) return 'cpf';
  if (/prifoods|pri foods|일본|japan|tohzai/.test(text) || countries.includes('JP')) return 'prifoods';
  if (params.category === 'overseas') return 'overseas';
  return 'other';
}

function buildFarmFromRows(farmId: string, rows: CctvUpRow[], entry?: CctvUpFarmRegistryEntry): CctvUpManagedFarm {
  const latestRow = pickLatestRow(rows) ?? rows[0];
  const category = rows.reduce<CctvUpFarmCategory>((winner, row) => {
    const next = resolveCategory(row, entry);
    return CATEGORY_ORDER[next] < CATEGORY_ORDER[winner] ? next : winner;
  }, resolveCategory(latestRow, entry));
  const farmName = cleanText(entry?.displayName || latestRow.farmName || farmId);
  const tags = Array.from(new Set((entry?.tags ?? []).map(cleanText).filter(Boolean)));
  const vendorCode = getVendorCode({ category, farmId, farmName, rows, tags });
  const monitorScopeCode = getGroupMonitorScope(rows);
  const status = getGroupStatus(rows);
  const problemCount = rows.filter((row) => row.status !== 'ok' && row.status !== 'paused').length;

  return {
    farmId,
    farmName,
    vendorCode,
    vendorLabel: VENDOR_LABELS[vendorCode],
    category,
    monitorScopeCode,
    monitorScopeLabel: getMonitorScopeLabel(monitorScopeCode),
    status,
    isProblem: status !== 'ok' && status !== 'paused',
    cameraCount: rows.length,
    problemCount,
    okCount: rows.filter((row) => row.status === 'ok').length,
    latestAt: latestRow.latestAt || '-',
    latestAtIso: latestRow.latestAtIso ?? null,
    tags,
    hasPocTag: hasPocTag(tags),
    memo: cleanText(entry?.memo),
    sourceAffiliates: latestRow.farmAffiliates ?? null,
    sourceCountry: latestRow.country ?? null,
    source: 'current',
  };
}

function buildRegistryOnlyFarm(entry: CctvUpFarmRegistryEntry): CctvUpManagedFarm {
  const category = normalizeCctvUpFarmCategory(entry.category) ?? 'other';
  const farmName = cleanText(entry.displayName || entry.farmId);
  const tags = Array.from(new Set((entry.tags ?? []).map(cleanText).filter(Boolean)));
  const vendorCode = getVendorCode({ category, farmId: entry.farmId, farmName, rows: [], tags });

  return {
    farmId: entry.farmId,
    farmName,
    vendorCode,
    vendorLabel: VENDOR_LABELS[vendorCode],
    category,
    monitorScopeCode: 'needs_review',
    monitorScopeLabel: getMonitorScopeLabel('needs_review'),
    status: 'paused',
    isProblem: false,
    cameraCount: 0,
    problemCount: 0,
    okCount: 0,
    latestAt: '-',
    latestAtIso: null,
    tags,
    hasPocTag: hasPocTag(tags),
    memo: cleanText(entry.memo),
    sourceAffiliates: null,
    sourceCountry: null,
    source: 'registry',
  };
}

export function buildCctvUpManagedFarmsPayload(
  currentPayload: CctvUpPayload,
  registryPayload: CctvUpFarmRegistryPayload,
): CctvUpManagedFarmsPayload {
  const registryByFarm = new Map(registryPayload.items.map((entry) => [entry.farmId, entry]));
  const rowsByFarm = currentPayload.rows.reduce<Map<string, CctvUpRow[]>>((map, row) => {
    const rows = map.get(row.farm) ?? [];
    rows.push(row);
    map.set(row.farm, rows);
    return map;
  }, new Map());

  const farms = Array.from(rowsByFarm.entries()).map(([farmId, rows]) => buildFarmFromRows(farmId, rows, registryByFarm.get(farmId)));
  for (const entry of registryPayload.items) {
    if (!rowsByFarm.has(entry.farmId)) farms.push(buildRegistryOnlyFarm(entry));
  }

  farms.sort((a, b) => (
    VENDOR_ORDER[a.vendorCode] - VENDOR_ORDER[b.vendorCode]
    || a.farmName.localeCompare(b.farmName, 'ko-KR')
    || a.farmId.localeCompare(b.farmId)
  ));

  const vendorCounts = farms.reduce<Record<CctvUpManagedFarmVendorCode, number>>(
    (counts, farm) => {
      counts[farm.vendorCode] += 1;
      return counts;
    },
    { shinwoo: 0, cheriburo: 0, cpf: 0, prifoods: 0, overseas: 0, other: 0 },
  );

  const hasCurrentRows = currentPayload.rows.length > 0;
  const hasRegistryRows = registryPayload.items.length > 0;

  return {
    ok: hasCurrentRows || hasRegistryRows,
    source: hasCurrentRows ? 'current-plus-registry' : hasRegistryRows ? 'registry-only' : 'unavailable',
    checkedAt: currentPayload.checkedAt,
    registrySource: registryPayload.source,
    farms,
    summary: {
      farms: farms.length,
      cameras: farms.reduce((total, farm) => total + farm.cameraCount, 0),
      issueFarms: farms.filter((farm) => farm.isProblem).length,
      activeFarms: farms.filter((farm) => farm.monitorScopeCode === 'active').length,
      pocTaggedFarms: farms.filter((farm) => farm.hasPocTag).length,
      vendorCounts,
    },
    message: hasCurrentRows
      ? '운영 DB 현재 목록과 Supabase registry를 합친 관리 농장 목록입니다.'
      : hasRegistryRows
        ? '운영 DB 현재 목록 없이 Supabase registry에 남은 농장만 표시합니다.'
        : currentPayload.message || registryPayload.message || '관리 농장 목록을 만들 수 없습니다.',
  };
}
