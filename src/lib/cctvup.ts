export type CctvUpStatus = 'ok' | 'late' | 'missing' | 'critical' | 'paused';

export type CctvUpSlotStatus = 'ok' | 'late' | 'missing' | 'paused';

export type CctvUpRow = {
  id: string;
  farm: string;
  farmName?: string;
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

export type CctvUpPayload = {
  source: 'db' | 'mock' | 'unavailable';
  checkedAt: string;
  table: string;
  rows: CctvUpRow[];
  incidents: CctvUpIncident[];
  summary: {
    farms: number;
    cameras: number;
    ok: number;
    late: number;
    missing: number;
    critical: number;
    paused: number;
  };
  message?: string;
};

export type CctvUpDbSummaryRow = {
  farm_id: string;
  farm_name?: string | null;
  house_id: string;
  house_name?: string | null;
  module_id: string;
  camera_name?: string | null;
  latest_at: Date | string;
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
  note: string;
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

export const CCTVUP_TABLE = 'paip.tbl_farm_image';
export const CCTVUP_HISTORY_CHECK_RUNS_TABLE = 'public.tbl_cctvup_check_runs';
export const CCTVUP_HISTORY_CAMERA_SNAPSHOTS_TABLE = 'public.tbl_cctvup_camera_snapshots';
export const CCTVUP_HISTORY_INCIDENT_LOGS_TABLE = 'public.tbl_cctvup_incident_logs';
export const CCTVUP_EXPECTED_1H = 12;
export const CCTVUP_EXPECTED_24H = 288;

export function getCctvUpStatus(ageMinutes: number, cnt1h: number): CctvUpStatus {
  if (!Number.isFinite(ageMinutes) || ageMinutes >= 999) return 'paused';
  if (ageMinutes <= 7) return 'ok';
  if (ageMinutes <= 12) return 'late';
  if (ageMinutes > 30 || cnt1h <= 6) return 'critical';
  return 'missing';
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
    const ageMinutes = minutesBetween(checkedAt, row.latest_at);
    const status = getCctvUpStatus(ageMinutes, cnt1h);
    const camera = normalizeModuleId(row.module_id);
    const reason = status === 'ok'
      ? '이미지 정상 수신'
      : status === 'late'
        ? '5분 슬롯 지연 가능성'
        : status === 'missing'
          ? '최근 5분 이미지 누락'
          : status === 'critical'
            ? '30분 초과 또는 최근 1시간 수신 급감'
            : '점검 제외';

    return {
      id: `${row.farm_id}-${row.house_id}-${row.module_id}`,
      farm: row.farm_id,
      farmName: row.farm_name ?? undefined,
      house: row.house_id,
      houseName: row.house_name ?? undefined,
      camera,
      cameraName: row.camera_name ?? undefined,
      latestAt: formatTime(row.latest_at),
      latestAtIso: new Date(row.latest_at).toISOString(),
      ageMinutes,
      consecutiveMiss: Math.max(0, Math.min(CCTVUP_EXPECTED_1H, Math.floor(ageMinutes / 5))),
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
    .filter((row): row is CctvUpRow & { status: 'late' | 'missing' | 'critical' } => ['late', 'missing', 'critical'].includes(row.status))
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

export function buildPayload(rows: CctvUpRow[], source: CctvUpPayload['source'], message?: string): CctvUpPayload {
  const farms = new Set(rows.map((row) => row.farm));
  return {
    source,
    checkedAt: new Date().toISOString(),
    table: CCTVUP_TABLE,
    rows,
    incidents: buildIncidents(rows),
    summary: {
      farms: farms.size,
      cameras: rows.length,
      ok: rows.filter((row) => row.status === 'ok').length,
      late: rows.filter((row) => row.status === 'late').length,
      missing: rows.filter((row) => row.status === 'missing').length,
      critical: rows.filter((row) => row.status === 'critical').length,
      paused: rows.filter((row) => row.status === 'paused').length,
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
