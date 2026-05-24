const SCOPE_PRIORITY = {
  active: 0,
  resting: 1,
  needs_review: 2,
  uninstalled: 3,
};

function normalizeScopeCode(value) {
  if (value === 'active' || value === 'resting' || value === 'needs_review' || value === 'uninstalled') {
    return value;
  }
  return 'active';
}

function normalizeCycleBucketCode(value) {
  if (
    value === 'current_rearing'
    || value === 'resting'
    || value === 'long_idle'
    || value === 'no_cycle_info'
    || value === 'pre_placement'
    || value === 'unknown_cycle'
  ) {
    return value;
  }
  return 'unknown_cycle';
}

function numberOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function pickRepresentativeRow(rows) {
  return rows
    .slice()
    .sort((a, b) => SCOPE_PRIORITY[normalizeScopeCode(a.monitorScopeCode)] - SCOPE_PRIORITY[normalizeScopeCode(b.monitorScopeCode)])[0];
}

function buildScopeMessage(state) {
  if (state.monitorScopeCode === 'active') return '입추/현재 사육 판정으로 감시중에 진입했습니다.';
  if (state.monitorScopeCode === 'resting') return '출하/휴지기 판정으로 감시를 보류했습니다.';
  if (state.monitorScopeCode === 'uninstalled') return 'gateway 미설치로 감시 대상에서 제외됐습니다.';
  return '사육정보 기준이 불명확해 대상확인이 필요합니다.';
}

export function formatCctvUpFarmScopeEventKind(kind) {
  if (kind === 'activated') return '입추/감시 시작';
  if (kind === 'resting_started') return '출하/휴지기 진입';
  if (kind === 'uninstalled') return '미설치 전환';
  if (kind === 'scope_changed') return '감시범위 변경';
  return '대상확인 전환';
}

export function getCctvUpFarmScopeEventKind(previousScopeCode, nextScopeCode) {
  if (nextScopeCode === 'active') return 'activated';
  if (nextScopeCode === 'resting') return 'resting_started';
  if (nextScopeCode === 'uninstalled') return 'uninstalled';
  if (nextScopeCode === 'needs_review') return 'review_needed';
  return 'scope_changed';
}

export function buildCctvUpFarmScopeStates(rows, checkedAt) {
  const byFarm = new Map();

  for (const row of rows) {
    if (!row?.farm) continue;
    const current = byFarm.get(row.farm);
    if (current) {
      current.rows.push(row);
    } else {
      byFarm.set(row.farm, { farmId: row.farm, rows: [row] });
    }
  }

  return Array.from(byFarm.values()).map((group) => {
    const representative = pickRepresentativeRow(group.rows);
    const monitorScopeCode = normalizeScopeCode(representative?.monitorScopeCode);
    const cycleBucketCode = normalizeCycleBucketCode(representative?.cycleBucketCode);
    const state = {
      farmId: group.farmId,
      farmName: representative?.farmName || representative?.farmAlias || group.farmId,
      monitorScopeCode,
      monitorScopeLabel: representative?.monitorScopeLabel || monitorScopeCode,
      cycleBucketCode,
      cycleBucketLabel: representative?.cycleBucketLabel || cycleBucketCode,
      gatewayInstalledCount: Math.max(...group.rows.map((row) => numberOrZero(row.gatewayInstalledCount))),
      cameraCount: group.rows.length,
      activeCameraCount: group.rows.filter((row) => normalizeScopeCode(row.monitorScopeCode) === 'active').length,
      lastCheckedAt: checkedAt,
      message: '',
    };
    return {
      ...state,
      message: buildScopeMessage(state),
    };
  });
}

export function buildCctvUpFarmScopeEvent(current, previous, checkedAt) {
  const previousScopeCode = normalizeScopeCode(previous?.monitorScopeCode);
  const nextScopeCode = normalizeScopeCode(current.monitorScopeCode);
  const eventKind = getCctvUpFarmScopeEventKind(previousScopeCode, nextScopeCode);
  const previousLabel = previous?.monitorScopeLabel || previousScopeCode;
  const nextLabel = current.monitorScopeLabel || nextScopeCode;

  return {
    farmId: current.farmId,
    farmName: current.farmName,
    eventKind,
    previousScopeCode,
    nextScopeCode,
    previousCycleBucketCode: previous?.cycleBucketCode || null,
    nextCycleBucketCode: current.cycleBucketCode,
    previousCycleBucketLabel: previous?.cycleBucketLabel || null,
    nextCycleBucketLabel: current.cycleBucketLabel,
    eventAt: checkedAt,
    cameraCount: current.cameraCount,
    activeCameraCount: current.activeCameraCount,
    gatewayInstalledCount: current.gatewayInstalledCount,
    message: `${previousLabel}에서 ${nextLabel}으로 감시범위가 바뀌었습니다. ${buildScopeMessage(current)}`,
  };
}

export function computeCctvUpFarmScopeChanges(rows, previousStates = [], checkedAt = new Date().toISOString()) {
  const states = buildCctvUpFarmScopeStates(rows, checkedAt);
  const previousMap = new Map(previousStates.map((state) => [state.farmId, state]));
  const events = [];

  for (const state of states) {
    const previous = previousMap.get(state.farmId);
    if (!previous) continue;
    if (normalizeScopeCode(previous.monitorScopeCode) === normalizeScopeCode(state.monitorScopeCode)) continue;
    events.push(buildCctvUpFarmScopeEvent(state, previous, checkedAt));
  }

  return { states, events };
}
