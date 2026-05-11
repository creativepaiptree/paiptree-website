export const CCTVUP_EXCLUDED_FARM_IDS = ['FA0000', 'FA0001'] as const;

const CCTVUP_EXCLUDED_FARM_ID_SET = new Set<string>(CCTVUP_EXCLUDED_FARM_IDS);

export function isCctvUpExcludedFarmId(farmId?: string | null) {
  return Boolean(farmId && CCTVUP_EXCLUDED_FARM_ID_SET.has(farmId.trim().toUpperCase()));
}

export function buildCctvUpExcludedFarmIdFilterParam() {
  return `not.in.(${CCTVUP_EXCLUDED_FARM_IDS.join(',')})`;
}
