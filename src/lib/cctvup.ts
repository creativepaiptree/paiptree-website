export type CctvUpStatus = 'ok' | 'late' | 'missing' | 'critical' | 'paused';

export type CctvUpSlotStatus = 'ok' | 'late' | 'missing' | 'paused';

export type CctvUpStateStatus = 'ok' | 'watching' | 'open' | 'recovering' | 'resolved';

export type CctvUpIssueEventKind = 'opened' | 'recovering' | 'resolved' | 'reopened';

export type CctvUpStateSyncStatus = 'applied' | 'unavailable' | 'disabled';

export type CctvUpMonitorScopeCode = 'active' | 'resting' | 'needs_review' | 'uninstalled';

export type CctvUpCycleBucketCode = 'current_rearing' | 'resting' | 'long_idle' | 'no_cycle_info' | 'pre_placement' | 'unknown_cycle';

export type CctvUpStateSync = {
  status: CctvUpStateSyncStatus;
  applied: boolean;
  stateCount: number;
  checkedAt: string;
  timeoutMs: number;
  message: string;
};

export type CctvUpRow = {
  id: string;
  farm: string;
  farmName?: string;
  farmAlias?: string;
  farmAffiliates?: string;
  country?: string;
  poultryType?: string;
  gatewayInstalledCount?: number;
  gatewayStatuses?: string;
  gatewayTypes?: string;
  cycleBucketCode?: CctvUpCycleBucketCode;
  cycleBucketLabel?: string;
  monitorScopeCode?: CctvUpMonitorScopeCode;
  monitorScopeLabel?: string;
  house: string;
  houseName?: string;
  camera: string;
  cameraName?: string;
  latestAt: string;
  latestAtIso?: string;
  ageMinutes: number;
  consecutiveMiss: number;
  rate1h: string;
  rate24h: string;
  reason: string;
  status: CctvUpStatus;
  slots: CctvUpSlotStatus[];
  stateStatus?: CctvUpStateStatus;
  stateLabel?: string;
  stateMessage?: string;
  missCount?: number;
  firstMissedAt?: string | null;
  openedAt?: string | null;
  resolvedAt?: string | null;
  lastCheckedAt?: string | null;
  confirmedIssue?: boolean;
};

export type CctvUpIncident = {
  id: string;
  rowId?: string;
  farm: string;
  camera: string;
  startedAt: string;
  duration: string;
  lastSeenAt: string;
  alertSent: boolean;
  status: Exclude<CctvUpStatus, 'ok' | 'paused'>;
};

export type CctvUpCurrentIssue = {
  id: string;
  runId?: string | null;
  cameraKey: string;
  farmId: string;
  houseId: string;
  moduleId: string;
  farmName?: string | null;
  houseName?: string | null;
  cameraName?: string | null;
  issueKind: Exclude<CctvUpStatus, 'ok' | 'paused'>;
  issueStatus: 'open' | 'resolved';
  firstSeenAt: string;
  lastSeenAt: string;
  resolvedAt?: string | null;
  latestAt?: string | null;
  ageMinutes: number;
  message: string;
  expiresAt: string;
};

export type CctvUpPayload = {
  source: 'db' | 'mock' | 'unavailable';
  checkedAt: string;
  table: string;
  rows: CctvUpRow[];
  incidents: CctvUpIncident[];
  currentIssues: CctvUpCurrentIssue[];
  summary: {
    farms: number;
    cameras: number;
    ok: number;
    late: number;
    missing: number;
    critical: number;
    paused: number;
    issueCount: number;
    watching?: number;
    open?: number;
    recovering?: number;
    resolved?: number;
    monitorActive?: number;
    monitorResting?: number;
    monitorNeedsReview?: number;
    monitorUninstalled?: number;
  };
  message?: string;
  stateSync?: CctvUpStateSync;
};

export type CctvUpDbSummaryRow = {
  farm_id: string;
  farm_name?: string | null;
  farm_alias?: string | null;
  farm_affiliates?: string | null;
  country?: string | null;
  poultry_type?: string | null;
  gateway_installed_count?: number | string | null;
  gateway_statuses?: string | null;
  gateway_types?: string | null;
  parts_status?: string | null;
  parts_year?: number | string | null;
  parts_seq?: number | string | null;
  in_date?: Date | string | null;
  out_date?: Date | string | null;
  days_since_in?: number | string | null;
  days_until_in?: number | string | null;
  days_since_out?: number | string | null;
  days_until_out?: number | string | null;
  house_id: string;
  house_name?: string | null;
  module_id: string;
  camera_name?: string | null;
  latest_at?: Date | string | null;
  cnt_1h: number | string;
  cnt_24h: number | string;
};

export type CctvUpCheckRun = {
  id: string;
  source: 'db' | 'mock' | 'unavailable';
  checkedAt: string;
  tableName: string;
  farmCount: number;
  cameraCount: number;
  okCount: number;
  lateCount: number;
  missingCount: number;
  criticalCount: number;
  pausedCount: number;
  issueCount: number;
  note: string;
  watchingCount?: number;
  openCount?: number;
  recoveringCount?: number;
  resolvedCount?: number;
};

export type CctvUpCameraSnapshot = {
  id: string;
  runId?: string | null;
  cameraKey: string;
  farmId: string;
  houseId: string;
  moduleId: string;
  farmName?: string | null;
  houseName?: string | null;
  cameraName?: string | null;
  snapshotAt: string;
  slotStatus: CctvUpSlotStatus;
  ageMinutes: number;
  cnt1h: number;
  cnt24h: number;
  reason: string;
  expiresAt: string;
};

export type CctvUpIncidentLog = {
  id: string;
  runId?: string | null;
  cameraKey: string;
  farmId: string;
  houseId: string;
  moduleId: string;
  farmName?: string | null;
  houseName?: string | null;
  cameraName?: string | null;
  incidentKind: Exclude<CctvUpStatus, 'ok' | 'paused'>;
  incidentStatus: 'open' | 'resolved';
  firstSeenAt: string;
  lastSeenAt: string;
  resolvedAt?: string | null;
  expiresAt: string;
  message: string;
};

export type CctvUpCameraState = {
  id?: string;
  runId?: string | null;
  cameraKey: string;
  farmId: string;
  houseId: string;
  moduleId: string;
  farmName?: string | null;
  houseName?: string | null;
  cameraName?: string | null;
  status: CctvUpStateStatus;
  latestImageAt?: string | null;
  lastCheckedAt: string;
  missCount: number;
  firstMissedAt?: string | null;
  openedAt?: string | null;
  resolvedAt?: string | null;
  recentSlots: CctvUpSlotStatus[];
  ageMinutes: number;
  message: string;
};

export type CctvUpIssueEvent = {
  id?: string;
  runId?: string | null;
  cameraKey: string;
  farmId: string;
  houseId: string;
  moduleId: string;
  farmName?: string | null;
  houseName?: string | null;
  cameraName?: string | null;
  eventKind: CctvUpIssueEventKind;
  previousStatus?: CctvUpStateStatus | null;
  nextStatus: CctvUpStateStatus;
  eventAt: string;
  latestImageAt?: string | null;
  missCount: number;
  message: string;
};

export const CCTVUP_TABLE = 'paip.tbl_farm_image';
export const CCTVUP_HISTORY_CHECK_RUNS_TABLE = 'public.tbl_cctvup_check_runs';
export const CCTVUP_HISTORY_CAMERA_SNAPSHOTS_TABLE = 'public.tbl_cctvup_camera_snapshots';
export const CCTVUP_HISTORY_INCIDENT_LOGS_TABLE = 'public.tbl_cctvup_incident_logs';
export const CCTVUP_HISTORY_CURRENT_ISSUES_TABLE = 'public.tbl_cctvup_current_issues';
export const CCTVUP_CAMERA_STATES_TABLE = 'public.tbl_cctvup_camera_states';
export const CCTVUP_ISSUE_EVENTS_TABLE = 'public.tbl_cctvup_issue_events';
export const CCTVUP_EXPECTED_1H = 12;
export const CCTVUP_EXPECTED_24H = 288;

export function getCctvUpStatus(ageMinutes: number, cnt1h: number): CctvUpStatus {
  if (!Number.isFinite(ageMinutes) || ageMinutes >= 999) return 'paused';
  if (ageMinutes <= 7) return 'ok';
  if (ageMinutes < 12) return 'late';
  if (ageMinutes >= 30 || cnt1h <= 6) return 'critical';
  return 'missing';
}

export function isCctvUpLoggableIssueStatus(status: CctvUpStatus): status is 'missing' | 'critical' {
  return status === 'missing' || status === 'critical';
}

export function isCctvUpActiveStateStatus(status?: CctvUpStateStatus) {
  return status === 'watching' || status === 'open' || status === 'recovering';
}

export function isCctvUpMonitorActive(row: Pick<CctvUpRow, 'monitorScopeCode'>) {
  return (row.monitorScopeCode ?? 'active') === 'active';
}

export function mapCctvUpStateStatusToLegacyStatus(status: CctvUpStateStatus): CctvUpStatus {
  if (status === 'watching') return 'late';
  if (status === 'open') return 'critical';
  if (status === 'recovering') return 'missing';
  return 'ok';
}

export function getCctvUpStateLabel(status?: CctvUpStateStatus) {
  if (status === 'watching') return '관찰중';
  if (status === 'open') return '문제확정';
  if (status === 'recovering') return '회복중';
  if (status === 'resolved') return '해결';
  return '정상';
}

export function buildSlots(ageMinutes: number, status: CctvUpStatus): CctvUpSlotStatus[] {
  if (status === 'paused') return Array.from({ length: CCTVUP_EXPECTED_1H }, () => 'paused');

  const missedSlots = Math.max(0, Math.min(CCTVUP_EXPECTED_1H, Math.floor(ageMinutes / 5)));
  const received = CCTVUP_EXPECTED_1H - missedSlots;
  return Array.from({ length: CCTVUP_EXPECTED_1H }, (_, index) => {
    if (index < received) return 'ok';
    return status === 'late' ? 'late' : 'missing';
  });
}

export function normalizeModuleId(moduleId: string): string {
  return moduleId.replace(/,1$/, '');
}

function numberOrNull(value: unknown): number | null {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function hasDateValue(value: unknown) {
  return value !== null && value !== undefined && String(value).trim() !== '';
}

function getCycleBucket(row: CctvUpDbSummaryRow): { code: CctvUpCycleBucketCode; label: string } {
  const daysSinceOut = numberOrNull(row.days_since_out);
  const daysUntilIn = numberOrNull(row.days_until_in);
  const daysUntilOut = numberOrNull(row.days_until_out);
  const hasCycleInfo = Boolean(row.parts_year || row.parts_seq || row.parts_status || hasDateValue(row.in_date) || hasDateValue(row.out_date));

  if (!hasCycleInfo) {
    return { code: 'no_cycle_info', label: '사육정보 없음' };
  }
  if (daysUntilIn !== null && daysUntilIn > 0) {
    return { code: 'pre_placement', label: '입추 예정' };
  }
  if (hasDateValue(row.in_date) && (!hasDateValue(row.out_date) || (daysUntilOut !== null && daysUntilOut >= 0))) {
    return { code: 'current_rearing', label: '현재 사육중' };
  }
  if (hasDateValue(row.out_date) && daysSinceOut !== null && daysSinceOut >= 0 && daysSinceOut <= 35) {
    return { code: 'resting', label: `휴지기 D+${daysSinceOut}` };
  }
  if (hasDateValue(row.out_date) && daysSinceOut !== null && daysSinceOut > 35) {
    return { code: 'long_idle', label: `출하후 ${daysSinceOut}일` };
  }
  return { code: 'unknown_cycle', label: '사육판정 불명' };
}

function getMonitorScope(row: CctvUpDbSummaryRow, cycleBucket: { code: CctvUpCycleBucketCode }): { code: CctvUpMonitorScopeCode; label: string } {
  const gatewayInstalledCount = Number(row.gateway_installed_count ?? 0);
  if (gatewayInstalledCount <= 0) {
    return { code: 'uninstalled', label: '미설치' };
  }
  if (cycleBucket.code === 'current_rearing') {
    return { code: 'active', label: '감시중' };
  }
  if (cycleBucket.code === 'resting') {
    return { code: 'resting', label: '휴지기' };
  }
  return { code: 'needs_review', label: '대상확인' };
}

export function formatTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  }).format(date);
}

export function minutesBetween(now: Date, then: Date | string): number {
  const thenDate = then instanceof Date ? then : new Date(then);
  if (Number.isNaN(thenDate.getTime())) return 999;
  return Math.max(0, Math.floor((now.getTime() - thenDate.getTime()) / 60000));
}

export function mapDbSummaryRows(rows: CctvUpDbSummaryRow[], checkedAt = new Date()): CctvUpRow[] {
  return rows.map((row) => {
    const cnt1h = Number(row.cnt_1h ?? 0);
    const cnt24h = Number(row.cnt_24h ?? 0);
    const latestDate = row.latest_at ? new Date(row.latest_at) : null;
    const hasLatestImage = Boolean(latestDate && !Number.isNaN(latestDate.getTime()));
    const ageMinutes = hasLatestImage && latestDate ? minutesBetween(checkedAt, latestDate) : 999;
    const cycleBucket = getCycleBucket(row);
    const monitorScope = getMonitorScope(row, cycleBucket);
    const activeStatus = hasLatestImage ? getCctvUpStatus(ageMinutes, cnt1h) : 'critical';
    const status = monitorScope.code === 'active' ? activeStatus : 'paused';
    const camera = normalizeModuleId(row.module_id);
    const reason = monitorScope.code !== 'active'
      ? `${monitorScope.label}: ${cycleBucket.label}`
      : !hasLatestImage
      ? '최근 24시간 이미지 저장 이력 없음'
      : status === 'ok'
        ? '이미지 정상 수신'
        : status === 'late'
          ? '1회 수집 지연 가능성'
          : status === 'missing'
            ? '2회 이상 이미지 미수집'
            : status === 'critical'
              ? '30분 초과 또는 최근 1시간 수신 급감'
              : '점검 제외';

    return {
      id: `${row.farm_id}-${row.house_id}-${row.module_id}`,
      farm: row.farm_id,
      farmName: row.farm_name ?? undefined,
      farmAlias: row.farm_alias ?? undefined,
      farmAffiliates: row.farm_affiliates ?? undefined,
      country: row.country ?? undefined,
      poultryType: row.poultry_type ?? undefined,
      gatewayInstalledCount: Number(row.gateway_installed_count ?? 0),
      gatewayStatuses: row.gateway_statuses ?? undefined,
      gatewayTypes: row.gateway_types ?? undefined,
      cycleBucketCode: cycleBucket.code,
      cycleBucketLabel: cycleBucket.label,
      monitorScopeCode: monitorScope.code,
      monitorScopeLabel: monitorScope.label,
      house: row.house_id,
      houseName: row.house_name ?? undefined,
      camera,
      cameraName: row.camera_name ?? undefined,
      latestAt: hasLatestImage && latestDate ? formatTime(latestDate) : '--:--',
      latestAtIso: hasLatestImage && latestDate ? latestDate.toISOString() : undefined,
      ageMinutes,
      consecutiveMiss: status === 'paused' ? 0 : Math.max(0, Math.min(CCTVUP_EXPECTED_1H, Math.floor(ageMinutes / 5))),
      rate1h: `${cnt1h}/${CCTVUP_EXPECTED_1H}`,
      rate24h: `${cnt24h}/${CCTVUP_EXPECTED_24H}`,
      reason,
      status,
      slots: buildSlots(ageMinutes, status),
    };
  }).sort((a, b) => {
    const order: Record<CctvUpStatus, number> = { critical: 0, missing: 1, late: 2, ok: 3, paused: 4 };
    return order[a.status] - order[b.status] || a.farm.localeCompare(b.farm) || a.camera.localeCompare(b.camera);
  });
}

export function buildIncidents(rows: CctvUpRow[]): CctvUpIncident[] {
  return rows
    .filter((row): row is CctvUpRow & { status: 'missing' | 'critical' } => isCctvUpLoggableIssueStatus(row.status))
    .slice(0, 10)
    .map((row, index) => ({
      id: `cctvup-inc-${index + 1}`,
      rowId: row.id,
      farm: row.farm,
      camera: row.camera,
      startedAt: row.latestAt,
      duration: row.ageMinutes >= 999 ? '-' : `${row.ageMinutes}m`,
      lastSeenAt: row.latestAt,
      alertSent: row.status === 'critical' || row.status === 'missing',
      status: row.status,
    }));
}

export function buildCurrentIssues(rows: CctvUpRow[], checkedAt = new Date().toISOString()): CctvUpCurrentIssue[] {
  return rows
    .filter((row): row is CctvUpRow & { status: 'missing' | 'critical' } => isCctvUpLoggableIssueStatus(row.status))
    .map((row, index) => ({
      id: `cctvup-current-${index + 1}`,
      cameraKey: row.id,
      farmId: row.farm,
      houseId: row.house,
      moduleId: row.camera,
      farmName: row.farmName ?? null,
      houseName: row.houseName ?? null,
      cameraName: row.cameraName ?? null,
      issueKind: row.status,
      issueStatus: 'open',
      firstSeenAt: checkedAt,
      lastSeenAt: checkedAt,
      resolvedAt: null,
      latestAt: row.latestAtIso ?? null,
      ageMinutes: row.ageMinutes,
      message: row.reason,
      expiresAt: new Date(Date.parse(checkedAt) + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }));
}

export function buildPayload(rows: CctvUpRow[], source: CctvUpPayload['source'], message?: string): CctvUpPayload {
  const farms = new Set(rows.map((row) => row.farm));
  const currentIssues = buildCurrentIssues(rows);
  const watching = rows.filter((row) => row.stateStatus === 'watching').length;
  const open = rows.filter((row) => row.stateStatus === 'open').length;
  const recovering = rows.filter((row) => row.stateStatus === 'recovering').length;
  const resolved = rows.filter((row) => row.stateStatus === 'resolved').length;
  const monitorActive = rows.filter((row) => row.monitorScopeCode === 'active' || !row.monitorScopeCode).length;
  const monitorResting = rows.filter((row) => row.monitorScopeCode === 'resting').length;
  const monitorNeedsReview = rows.filter((row) => row.monitorScopeCode === 'needs_review').length;
  const monitorUninstalled = rows.filter((row) => row.monitorScopeCode === 'uninstalled').length;
  return {
    source,
    checkedAt: new Date().toISOString(),
    table: CCTVUP_TABLE,
    rows,
    incidents: buildIncidents(rows),
    currentIssues,
    summary: {
      farms: farms.size,
      cameras: rows.length,
      ok: rows.filter((row) => row.status === 'ok').length,
      late: rows.filter((row) => row.status === 'late').length,
      missing: rows.filter((row) => row.status === 'missing').length,
      critical: rows.filter((row) => row.status === 'critical').length,
      paused: rows.filter((row) => row.status === 'paused').length,
      issueCount: currentIssues.length,
      watching,
      open,
      recovering,
      resolved,
      monitorActive,
      monitorResting,
      monitorNeedsReview,
      monitorUninstalled,
    },
    message,
  };
}

export const mockCctvUpRows: CctvUpRow[] = [
  {
    id: 'mock-fa0001-h01-ct01',
    farm: 'FA0001',
    house: 'H01',
    camera: 'CT01',
    latestAt: '16:29',
    ageMinutes: 4,
    consecutiveMiss: 0,
    rate1h: '12/12',
    rate24h: '286/288',
    reason: '이미지 정상 수신',
    status: 'ok',
    slots: ['ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok'],
  },
  {
    id: 'mock-fa0001-h01-ct02',
    farm: 'FA0001',
    house: 'H01',
    camera: 'CT02',
    latestAt: '16:19',
    ageMinutes: 14,
    consecutiveMiss: 2,
    rate1h: '10/12',
    rate24h: '281/288',
    reason: '최근 5분 이미지 누락',
    status: 'missing',
    slots: ['ok', 'ok', 'ok', 'ok', 'ok', 'missing', 'ok', 'ok', 'ok', 'ok', 'missing', 'missing'],
  },
  {
    id: 'mock-fa0318-h02-ct12',
    farm: 'FA0318',
    house: 'H02',
    camera: 'CT12',
    latestAt: '15:47',
    ageMinutes: 46,
    consecutiveMiss: 8,
    rate1h: '4/12',
    rate24h: '244/288',
    reason: '30분 초과 또는 최근 1시간 수신 급감',
    status: 'critical',
    slots: ['ok', 'missing', 'missing', 'missing', 'ok', 'missing', 'missing', 'ok', 'missing', 'missing', 'missing', 'missing'],
  },
];
