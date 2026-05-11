import type {
  CctvUpCameraState,
  CctvUpIssueEvent,
  CctvUpPayload,
  CctvUpRow,
  CctvUpSlotStatus,
  CctvUpStateSync,
  CctvUpStateStatus,
} from '@/lib/cctvup';
import {
  buildPayload,
  getCctvUpStateLabel,
  isCctvUpActiveStateStatus,
  isCctvUpMonitorActive,
  mapCctvUpStateStatusToLegacyStatus,
} from '@/lib/cctvup';
import { buildCctvUpExcludedFarmIdFilterParam, isCctvUpExcludedFarmId } from '@/lib/cctvup-exclusions';

type SupabaseConfig = {
  supabaseUrl: string;
  serviceKey: string;
};

type SupabaseResponse<T> = {
  data: T | null;
  error: string | null;
  status: number;
};

type SupabaseCameraStateRow = {
  id?: string;
  run_id?: string | null;
  camera_key: string;
  farm_id: string;
  house_id: string;
  module_id: string;
  farm_name?: string | null;
  house_name?: string | null;
  camera_name?: string | null;
  status: CctvUpStateStatus;
  latest_image_at?: string | null;
  last_checked_at: string;
  miss_count: number;
  first_missed_at?: string | null;
  opened_at?: string | null;
  resolved_at?: string | null;
  recent_slots: CctvUpSlotStatus[] | null;
  age_minutes: number;
  message: string;
};

type SupabaseIssueEventRow = {
  id?: string;
  run_id?: string | null;
  camera_key: string;
  farm_id: string;
  house_id: string;
  module_id: string;
  farm_name?: string | null;
  house_name?: string | null;
  camera_name?: string | null;
  event_kind: CctvUpIssueEvent['eventKind'];
  previous_status?: CctvUpStateStatus | null;
  next_status: CctvUpStateStatus;
  event_at: string;
  latest_image_at?: string | null;
  miss_count: number;
  message: string;
};

type SupabaseCheckRunInsertRow = {
  source: CctvUpPayload['source'];
  checked_at: string;
  table_name: string;
  farm_count: number;
  camera_count: number;
  ok_count: number;
  late_count: number;
  missing_count: number;
  critical_count: number;
  paused_count: number;
  payload: Record<string, never>;
  note: string;
};

type CctvUpStatePersistOptions = {
  noteSuffix?: string;
};

export type CctvUpStatePersistResult = {
  ok: boolean;
  message?: string;
  runId?: string;
  stateCount: number;
  archivedStaleStateCount?: number;
  eventCount: number;
  openedCount: number;
  recoveringCount: number;
  resolvedCount: number;
  checkRunCount: number;
  snapshotCount: number;
  incidentCount: number;
  currentIssueCount: number;
  resolvedIssueCount: number;
  summary: CctvUpPayload['summary'];
};

type FetchCameraStatesOptions = {
  limit?: number;
  statuses?: CctvUpStateStatus[];
  cameraKey?: string;
  timeoutMs?: number;
};

type FetchIssueEventsOptions = {
  limit?: number;
  cameraKey?: string;
  timeoutMs?: number;
};

type NormalizedCameraStateOptions = {
  limit: number;
  statuses?: CctvUpStateStatus[];
  cameraKey?: string;
  timeoutMs?: number;
};

type NormalizedIssueEventOptions = {
  limit: number;
  cameraKey?: string;
  timeoutMs?: number;
};

const STATE_READ_TIMEOUT_MS = Number(process.env.CCTVUP_SUPABASE_STATE_FETCH_TIMEOUT_MS || process.env.CCTVUP_SUPABASE_FETCH_TIMEOUT_MS || 1500);
const STATE_WRITE_TIMEOUT_MS = Number(process.env.CCTVUP_SUPABASE_WRITE_TIMEOUT_MS || 8000);
const RECENT_SLOT_COUNT = 12;
const OPEN_MISS_COUNT = 3;
const OK_GRACE_MINUTES = 7;
const ACTIVE_STATE_STATUSES: CctvUpStateStatus[] = ['watching', 'open', 'recovering'];
const CAMERA_STATE_SELECT = [
  'id',
  'run_id',
  'camera_key',
  'farm_id',
  'house_id',
  'module_id',
  'farm_name',
  'house_name',
  'camera_name',
  'status',
  'latest_image_at',
  'last_checked_at',
  'miss_count',
  'first_missed_at',
  'opened_at',
  'resolved_at',
  'recent_slots',
  'age_minutes',
  'message',
].join(',');
const ISSUE_EVENT_SELECT = [
  'id',
  'run_id',
  'camera_key',
  'farm_id',
  'house_id',
  'module_id',
  'farm_name',
  'house_name',
  'camera_name',
  'event_kind',
  'previous_status',
  'next_status',
  'event_at',
  'latest_image_at',
  'miss_count',
  'message',
].join(',');

function createTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return undefined;
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(timeoutMs);
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

export function getCctvUpStateReadTimeoutMs() {
  return STATE_READ_TIMEOUT_MS;
}

function formatStateFetchError(error: unknown) {
  if (error instanceof Error && error.name === 'TimeoutError') {
    return `Supabase camera_state 조회가 ${STATE_READ_TIMEOUT_MS}ms 안에 끝나지 않았습니다.`;
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return `Supabase camera_state 조회가 ${STATE_READ_TIMEOUT_MS}ms 안에 중단되었습니다.`;
  }
  return error instanceof Error ? error.message : 'Supabase camera_state 조회에 실패했습니다.';
}

function buildStateSync(status: CctvUpStateSync['status'], stateCount: number, message: string): CctvUpStateSync {
  return {
    status,
    applied: status === 'applied',
    stateCount,
    checkedAt: new Date().toISOString(),
    timeoutMs: STATE_READ_TIMEOUT_MS,
    message,
  };
}

function getSupabaseConfig(): SupabaseConfig | null {
  const supabaseUrl = process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceKey) return null;

  return {
    supabaseUrl: supabaseUrl.endsWith('/') ? supabaseUrl : `${supabaseUrl}/`,
    serviceKey,
  };
}

function buildEndpoint(config: SupabaseConfig, table: string) {
  return new URL(`/rest/v1/${table}`, config.supabaseUrl);
}

async function requestSupabase<T>(
  config: SupabaseConfig,
  table: string,
  init: RequestInit,
): Promise<SupabaseResponse<T>> {
  const timeoutMs = init.method?.toUpperCase() === 'GET' ? STATE_READ_TIMEOUT_MS : STATE_WRITE_TIMEOUT_MS;
  const response = await fetch(buildEndpoint(config, table).toString(), {
    cache: 'no-store',
    ...init,
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      Accept: 'application/json',
      ...(init.headers ?? {}),
    },
    signal: init.signal ?? createTimeoutSignal(timeoutMs),
  });

  const text = await response.text();
  let data: T | null = null;
  try {
    data = text ? (JSON.parse(text) as T) : null;
  } catch {
    data = null;
  }

  return {
    data,
    error: response.ok ? null : text || `Supabase request failed (${response.status})`,
    status: response.status,
  };
}

function normalizeRecentSlots(value: unknown): CctvUpSlotStatus[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((slot) => (slot === 'ok' || slot === 'late' || slot === 'missing' || slot === 'paused' ? slot : 'missing'))
    .slice(-RECENT_SLOT_COUNT);
}

function toIso(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function mapCameraStateFromSupabase(row: SupabaseCameraStateRow): CctvUpCameraState {
  return {
    id: row.id,
    runId: row.run_id,
    cameraKey: row.camera_key,
    farmId: row.farm_id,
    houseId: row.house_id,
    moduleId: row.module_id,
    farmName: row.farm_name,
    houseName: row.house_name,
    cameraName: row.camera_name,
    status: row.status,
    latestImageAt: row.latest_image_at,
    lastCheckedAt: row.last_checked_at,
    missCount: Number(row.miss_count ?? 0),
    firstMissedAt: row.first_missed_at,
    openedAt: row.opened_at,
    resolvedAt: row.resolved_at,
    recentSlots: normalizeRecentSlots(row.recent_slots),
    ageMinutes: Number(row.age_minutes ?? 0),
    message: row.message || '',
  };
}

function mapCameraStateToSupabase(state: CctvUpCameraState): SupabaseCameraStateRow {
  return {
    run_id: state.runId,
    camera_key: state.cameraKey,
    farm_id: state.farmId,
    house_id: state.houseId,
    module_id: state.moduleId,
    farm_name: state.farmName,
    house_name: state.houseName,
    camera_name: state.cameraName,
    status: state.status,
    latest_image_at: state.latestImageAt,
    last_checked_at: state.lastCheckedAt,
    miss_count: state.missCount,
    first_missed_at: state.firstMissedAt,
    opened_at: state.openedAt,
    resolved_at: state.resolvedAt,
    recent_slots: state.recentSlots,
    age_minutes: state.ageMinutes,
    message: state.message,
  };
}

function mapIssueEventFromSupabase(row: SupabaseIssueEventRow): CctvUpIssueEvent {
  return {
    id: row.id,
    runId: row.run_id,
    cameraKey: row.camera_key,
    farmId: row.farm_id,
    houseId: row.house_id,
    moduleId: row.module_id,
    farmName: row.farm_name,
    houseName: row.house_name,
    cameraName: row.camera_name,
    eventKind: row.event_kind,
    previousStatus: row.previous_status,
    nextStatus: row.next_status,
    eventAt: row.event_at,
    latestImageAt: row.latest_image_at,
    missCount: Number(row.miss_count ?? 0),
    message: row.message || '',
  };
}

function mapIssueEventToSupabase(event: CctvUpIssueEvent): SupabaseIssueEventRow {
  return {
    run_id: event.runId,
    camera_key: event.cameraKey,
    farm_id: event.farmId,
    house_id: event.houseId,
    module_id: event.moduleId,
    farm_name: event.farmName,
    house_name: event.houseName,
    camera_name: event.cameraName,
    event_kind: event.eventKind,
    previous_status: event.previousStatus,
    next_status: event.nextStatus,
    event_at: event.eventAt,
    latest_image_at: event.latestImageAt,
    miss_count: event.missCount,
    message: event.message,
  };
}

function normalizeCameraStateOptions(optionsOrLimit?: number | FetchCameraStatesOptions): NormalizedCameraStateOptions {
  if (typeof optionsOrLimit === 'number') return { limit: optionsOrLimit };
  return {
    limit: optionsOrLimit?.limit ?? 1000,
    statuses: optionsOrLimit?.statuses,
    cameraKey: optionsOrLimit?.cameraKey,
    timeoutMs: optionsOrLimit?.timeoutMs,
  };
}

function normalizeIssueEventOptions(optionsOrLimit?: number | FetchIssueEventsOptions): NormalizedIssueEventOptions {
  if (typeof optionsOrLimit === 'number') return { limit: optionsOrLimit };
  return {
    limit: optionsOrLimit?.limit ?? 200,
    cameraKey: optionsOrLimit?.cameraKey,
    timeoutMs: optionsOrLimit?.timeoutMs,
  };
}

function buildCameraStatesQuery(optionsOrLimit?: number | FetchCameraStatesOptions) {
  const options = normalizeCameraStateOptions(optionsOrLimit);
  const safeLimit = Math.min(Math.max(Math.trunc(options.limit), 1), 5000);
  const params = new URLSearchParams({
    select: CAMERA_STATE_SELECT,
    order: 'last_checked_at.desc',
    limit: String(safeLimit),
    farm_id: buildCctvUpExcludedFarmIdFilterParam(),
  });

  if (options.statuses?.length) {
    params.set('status', `in.(${options.statuses.join(',')})`);
  }
  if (options.cameraKey) {
    params.set('camera_key', `eq.${options.cameraKey}`);
  }

  return `tbl_cctvup_camera_states?${params.toString()}`;
}

function buildIssueEventsQuery(optionsOrLimit?: number | FetchIssueEventsOptions) {
  const options = normalizeIssueEventOptions(optionsOrLimit);
  const safeLimit = Math.min(Math.max(Math.trunc(options.limit), 1), 500);
  const params = new URLSearchParams({
    select: ISSUE_EVENT_SELECT,
    order: 'event_at.desc',
    limit: String(safeLimit),
    farm_id: buildCctvUpExcludedFarmIdFilterParam(),
  });

  if (options.cameraKey) {
    params.set('camera_key', `eq.${options.cameraKey}`);
  }

  return `tbl_cctvup_issue_events?${params.toString()}`;
}

function getInitialMissCount(row: CctvUpRow, slotOk: boolean) {
  if (slotOk) return 0;
  if (!Number.isFinite(row.ageMinutes) || row.ageMinutes >= 999) return OPEN_MISS_COUNT;
  return Math.max(1, Math.min(OPEN_MISS_COUNT, Math.floor(row.ageMinutes / 5)));
}

function appendRecentSlot(previous: CctvUpCameraState | undefined, slot: CctvUpSlotStatus) {
  return [...(previous?.recentSlots ?? []), slot].slice(-RECENT_SLOT_COUNT);
}

function hasRecovered(recentSlots: CctvUpSlotStatus[]) {
  return recentSlots.length >= RECENT_SLOT_COUNT && recentSlots.every((slot) => slot === 'ok');
}

function buildStateMessage(status: CctvUpStateStatus, missCount: number, latestImageAt?: string | null) {
  if (status === 'watching') return `${missCount}/3회 미수집 관찰 중입니다.`;
  if (status === 'open') return '15분 이상 새 이미지가 감지되지 않아 문제로 확정했습니다.';
  if (status === 'recovering') return '이미지는 다시 들어왔지만 최근 1시간 슬롯에 문제 이력이 남아 회복 중입니다.';
  if (status === 'resolved') return '최근 1시간 슬롯이 정상으로 채워져 해결 처리했습니다.';
  return latestImageAt ? '이미지 정상 수신 중입니다.' : '이미지 수신 기준 정상입니다.';
}

function buildStaleCameraStateArchive(
  previous: CctvUpCameraState,
  checkedAt: string,
  runId?: string,
): CctvUpCameraState {
  return {
    ...previous,
    runId,
    status: 'resolved',
    lastCheckedAt: checkedAt,
    resolvedAt: checkedAt,
    message: '현재 감시중 범위에서 제외되어 상태머신 활성 목록에서 정리했습니다. 카메라 회복 이벤트로 보지 않습니다.',
  };
}

export function computeNextCctvUpCameraState(
  row: CctvUpRow,
  previous: CctvUpCameraState | undefined,
  checkedAt: string,
): { state: CctvUpCameraState; event?: CctvUpIssueEvent } {
  const slotOk = Number.isFinite(row.ageMinutes) && row.ageMinutes <= OK_GRACE_MINUTES;
  const latestImageAt = toIso(row.latestAtIso) ?? previous?.latestImageAt ?? null;
  const recentSlots = appendRecentSlot(previous, slotOk ? 'ok' : 'missing');
  const previousStatus = previous?.status;
  const wasActive = previousStatus === 'open' || previousStatus === 'recovering';

  const missCount = slotOk ? 0 : previous ? Math.max(1, previous.missCount + 1) : getInitialMissCount(row, slotOk);
  let status: CctvUpStateStatus;
  let firstMissedAt: string | null = previous?.firstMissedAt ?? null;
  let openedAt: string | null = previous?.openedAt ?? null;
  let resolvedAt: string | null = previous?.resolvedAt ?? null;

  if (slotOk) {
    firstMissedAt = null;
    if (wasActive && !hasRecovered(recentSlots)) {
      status = 'recovering';
      resolvedAt = null;
    } else if (wasActive && hasRecovered(recentSlots)) {
      status = 'resolved';
      resolvedAt = checkedAt;
    } else {
      status = 'ok';
      openedAt = null;
      resolvedAt = null;
    }
  } else {
    firstMissedAt = firstMissedAt ?? checkedAt;
    resolvedAt = null;
    if (missCount >= OPEN_MISS_COUNT) {
      status = 'open';
      openedAt = openedAt ?? checkedAt;
    } else {
      status = 'watching';
      openedAt = null;
    }
  }

  const message = buildStateMessage(status, missCount, latestImageAt);
  const state: CctvUpCameraState = {
    runId: undefined,
    cameraKey: row.id,
    farmId: row.farm,
    houseId: row.house,
    moduleId: row.camera,
    farmName: row.farmName ?? null,
    houseName: row.houseName ?? null,
    cameraName: row.cameraName ?? null,
    status,
    latestImageAt,
    lastCheckedAt: checkedAt,
    missCount,
    firstMissedAt,
    openedAt,
    resolvedAt,
    recentSlots,
    ageMinutes: row.ageMinutes,
    message,
  };

  let eventKind: CctvUpIssueEvent['eventKind'] | null = null;
  if (status === 'open' && previousStatus !== 'open') {
    eventKind = previousStatus === 'recovering' || previousStatus === 'resolved' ? 'reopened' : 'opened';
  } else if (status === 'recovering' && previousStatus === 'open') {
    eventKind = 'recovering';
  } else if (status === 'resolved' && previousStatus === 'recovering') {
    eventKind = 'resolved';
  }

  const event = eventKind
    ? {
        cameraKey: state.cameraKey,
        farmId: state.farmId,
        houseId: state.houseId,
        moduleId: state.moduleId,
        farmName: state.farmName,
        houseName: state.houseName,
        cameraName: state.cameraName,
        eventKind,
        previousStatus: previousStatus ?? null,
        nextStatus: status,
        eventAt: checkedAt,
        latestImageAt,
        missCount,
        message,
      }
    : undefined;

  return { state, event };
}

export function applyCctvUpCameraStatesToRows(rows: CctvUpRow[], states: CctvUpCameraState[]) {
  const stateMap = new Map(states.map((state) => [state.cameraKey, state]));

  return rows.map((row) => {
    const state = stateMap.get(row.id);
    if (!state || !isCctvUpMonitorActive(row)) return row;

    const status = mapCctvUpStateStatusToLegacyStatus(state.status);
    const slots = state.recentSlots.length ? state.recentSlots : row.slots;
    const okSlots = slots.filter((slot) => slot === 'ok').length;
    return {
      ...row,
      status,
      slots,
      consecutiveMiss: state.missCount,
      rate1h: `${okSlots}/${RECENT_SLOT_COUNT}`,
      reason: state.message || row.reason,
      stateStatus: state.status,
      stateLabel: getCctvUpStateLabel(state.status),
      stateMessage: state.message,
      missCount: state.missCount,
      firstMissedAt: state.firstMissedAt,
      openedAt: state.openedAt,
      resolvedAt: state.resolvedAt,
      lastCheckedAt: state.lastCheckedAt,
      confirmedIssue: state.status === 'open' || state.status === 'recovering',
    } satisfies CctvUpRow;
  });
}

export function buildStateBackedCctvUpPayload(payload: CctvUpPayload, states: CctvUpCameraState[]) {
  const activeRowKeys = new Set(
    payload.rows
      .filter(isCctvUpMonitorActive)
      .map((row) => row.id),
  );
  const applicableStates = states.filter((state) => activeRowKeys.has(state.cameraKey));
  const stateBackedPayload = buildPayload(
    applyCctvUpCameraStatesToRows(payload.rows, applicableStates),
    payload.source,
    applicableStates.length
      ? 'Supabase camera_state 기준으로 감시중 카메라의 15분 확정 장애와 회복 상태를 반영했습니다.'
      : payload.message,
  );

  return {
    ...stateBackedPayload,
    stateSync: buildStateSync(
      'applied',
      applicableStates.length,
      applicableStates.length
        ? `Supabase camera_state 활성 ${applicableStates.length}건을 현재 감시중 목록에 반영했습니다.`
        : 'Supabase camera_state는 연결됐지만 현재 반영할 활성 상태가 없습니다.',
    ),
  };
}

export async function fetchCctvUpCameraStates(optionsOrLimit: number | FetchCameraStatesOptions = 1000): Promise<CctvUpCameraState[] | null> {
  const config = getSupabaseConfig();
  if (!config) return null;
  const options = normalizeCameraStateOptions(optionsOrLimit);

  const result = await requestSupabase<SupabaseCameraStateRow[]>(
    config,
    buildCameraStatesQuery(options),
    {
      method: 'GET',
      signal: options.timeoutMs ? createTimeoutSignal(options.timeoutMs) : undefined,
    },
  );

  if (result.error) throw new Error(`tbl_cctvup_camera_states 조회 실패: ${result.error}`);
  return Array.isArray(result.data)
    ? result.data
        .map(mapCameraStateFromSupabase)
        .filter((state) => !isCctvUpExcludedFarmId(state.farmId))
    : [];
}

export async function fetchCctvUpActiveCameraStates(limit = 1000, options: Omit<FetchCameraStatesOptions, 'limit' | 'statuses'> = {}): Promise<CctvUpCameraState[] | null> {
  return fetchCctvUpCameraStates({ limit, statuses: ACTIVE_STATE_STATUSES, ...options });
}

export async function fetchCctvUpIssueEvents(optionsOrLimit: number | FetchIssueEventsOptions = 200): Promise<CctvUpIssueEvent[] | null> {
  const config = getSupabaseConfig();
  if (!config) return null;
  const options = normalizeIssueEventOptions(optionsOrLimit);

  const result = await requestSupabase<SupabaseIssueEventRow[]>(
    config,
    buildIssueEventsQuery(options),
    {
      method: 'GET',
      signal: options.timeoutMs ? createTimeoutSignal(options.timeoutMs) : undefined,
    },
  );

  if (result.error) throw new Error(`tbl_cctvup_issue_events 조회 실패: ${result.error}`);
  return Array.isArray(result.data)
    ? result.data
        .map(mapIssueEventFromSupabase)
        .filter((event) => !isCctvUpExcludedFarmId(event.farmId))
    : [];
}

function buildStateSummary(states: CctvUpCameraState[], payload: CctvUpPayload): CctvUpPayload['summary'] {
  const stateMap = new Map(states.map((state) => [state.cameraKey, state]));
  const appliedRows = payload.rows.map((row) => {
    const state = stateMap.get(row.id);
    return state ? { ...row, stateStatus: state.status, status: mapCctvUpStateStatusToLegacyStatus(state.status) } : row;
  });
  return buildPayload(appliedRows, payload.source).summary;
}

function buildCheckRunInsert(
  payload: CctvUpPayload,
  states: CctvUpCameraState[],
  options: CctvUpStatePersistOptions = {},
): SupabaseCheckRunInsertRow {
  const summary = buildStateSummary(states, payload);
  const summaryNote = `state-machine summary: watching=${summary.watching ?? 0}, open=${summary.open ?? 0}, recovering=${summary.recovering ?? 0}, resolved=${summary.resolved ?? 0}`;
  const noteSuffix = options.noteSuffix?.trim();
  return {
    source: payload.source,
    checked_at: payload.checkedAt,
    table_name: payload.table,
    farm_count: summary.farms,
    camera_count: summary.cameras,
    ok_count: summary.ok,
    late_count: summary.watching ?? 0,
    missing_count: summary.recovering ?? 0,
    critical_count: summary.open ?? 0,
    paused_count: summary.paused,
    payload: {},
    note: noteSuffix ? `${summaryNote}; ${noteSuffix}` : summaryNote,
  };
}

export async function mergeCctvUpPayloadWithPersistedState(payload: CctvUpPayload): Promise<CctvUpPayload> {
  const config = getSupabaseConfig();
  if (!config) {
    return {
      ...payload,
      stateSync: buildStateSync('disabled', 0, 'Supabase 설정이 없어 camera_state 상태머신을 반영하지 않았습니다.'),
    };
  }

  try {
    const states = await fetchCctvUpActiveCameraStates(1000);
    if (!states?.length) {
      return {
        ...payload,
        stateSync: buildStateSync('applied', 0, 'Supabase camera_state는 연결됐지만 현재 반영할 활성 상태가 없습니다.'),
      };
    }
    return buildStateBackedCctvUpPayload(payload, states);
  } catch (error) {
    const message = formatStateFetchError(error);
    console.warn(`[cctvup-state] ${message}`);
    return {
      ...payload,
      stateSync: buildStateSync('unavailable', 0, message),
    };
  }
}

export async function persistCctvUpStateCheck(
  payload: CctvUpPayload,
  options: CctvUpStatePersistOptions = {},
): Promise<CctvUpStatePersistResult> {
  const config = getSupabaseConfig();
  if (!config) {
    return {
      ok: false,
      message: 'SUPABASE_URL / SUPABASE_SERVICE_KEY 설정이 필요합니다.',
      stateCount: 0,
      eventCount: 0,
      openedCount: 0,
      recoveringCount: 0,
      resolvedCount: 0,
      checkRunCount: 0,
      snapshotCount: 0,
      incidentCount: 0,
      currentIssueCount: 0,
      resolvedIssueCount: 0,
      summary: payload.summary,
    };
  }

  let previousStates: CctvUpCameraState[] | null = null;
  try {
    previousStates = await fetchCctvUpActiveCameraStates(1000);
  } catch (error) {
    return {
      ok: false,
      message: formatStateFetchError(error),
      stateCount: 0,
      eventCount: 0,
      openedCount: 0,
      recoveringCount: 0,
      resolvedCount: 0,
      checkRunCount: 0,
      snapshotCount: 0,
      incidentCount: 0,
      currentIssueCount: 0,
      resolvedIssueCount: 0,
      summary: payload.summary,
    };
  }

  if (previousStates === null) {
    return {
      ok: false,
      message: 'tbl_cctvup_camera_states 조회에 실패했습니다. docs/sql/supabase/020_cctvup_state_machine.sql 적용이 필요합니다.',
      stateCount: 0,
      eventCount: 0,
      openedCount: 0,
      recoveringCount: 0,
      resolvedCount: 0,
      checkRunCount: 0,
      snapshotCount: 0,
      incidentCount: 0,
      currentIssueCount: 0,
      resolvedIssueCount: 0,
      summary: payload.summary,
    };
  }

  const previousMap = new Map(previousStates.map((state) => [state.cameraKey, state]));
  const monitoredRows = payload.rows.filter(isCctvUpMonitorActive);
  const monitoredKeys = new Set(monitoredRows.map((row) => row.id));
  const staleStates = previousStates.filter((state) => !monitoredKeys.has(state.cameraKey));
  const computed = monitoredRows.map((row) => computeNextCctvUpCameraState(row, previousMap.get(row.id), payload.checkedAt));
  const nextStates = computed.map((entry) => entry.state);
  const events = computed.flatMap((entry) => (entry.event ? [entry.event] : []));
  const summary = buildStateSummary(nextStates, payload);
  const noteSuffix = staleStates.length
    ? [options.noteSuffix, `stale_archived=${staleStates.length}`].filter(Boolean).join('; ')
    : options.noteSuffix;

  const runResponse = await requestSupabase<Array<{ id: string }>>(config, 'tbl_cctvup_check_runs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify([buildCheckRunInsert(payload, nextStates, { ...options, noteSuffix })]),
  });

  if (!runResponse.data || !Array.isArray(runResponse.data) || runResponse.data.length === 0) {
    return {
      ok: false,
      message: runResponse.error || 'check run insert failed',
      stateCount: 0,
      eventCount: 0,
      openedCount: 0,
      recoveringCount: 0,
      resolvedCount: 0,
      checkRunCount: 0,
      snapshotCount: 0,
      incidentCount: 0,
      currentIssueCount: 0,
      resolvedIssueCount: 0,
      summary,
    };
  }

  const runId = runResponse.data[0].id;
  const statesWithRun = nextStates.map((state) => ({ ...state, runId }));
  const staleStatesWithRun = staleStates.map((state) => buildStaleCameraStateArchive(state, payload.checkedAt, runId));
  const stateResponse = await requestSupabase<unknown>(config, 'tbl_cctvup_camera_states?on_conflict=camera_key', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify([...statesWithRun, ...staleStatesWithRun].map(mapCameraStateToSupabase)),
  });

  if (stateResponse.error) {
    return {
      ok: false,
      message: stateResponse.error,
      runId,
      stateCount: 0,
      eventCount: 0,
      openedCount: 0,
      recoveringCount: 0,
      resolvedCount: 0,
      checkRunCount: 1,
      snapshotCount: 0,
      incidentCount: 0,
      currentIssueCount: 0,
      resolvedIssueCount: 0,
      summary,
    };
  }

  const eventsWithRun = events.map((event) => ({ ...event, runId }));
  if (eventsWithRun.length > 0) {
    const eventResponse = await requestSupabase<unknown>(config, 'tbl_cctvup_issue_events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(eventsWithRun.map(mapIssueEventToSupabase)),
    });

    if (eventResponse.error) {
      return {
        ok: false,
        message: eventResponse.error,
        runId,
        stateCount: statesWithRun.length,
        eventCount: 0,
        openedCount: 0,
        recoveringCount: 0,
        resolvedCount: 0,
        checkRunCount: 1,
        snapshotCount: 0,
        incidentCount: 0,
        currentIssueCount: statesWithRun.filter((state) => isCctvUpActiveStateStatus(state.status)).length,
        resolvedIssueCount: 0,
        summary,
      };
    }
  }

  return {
    ok: true,
    runId,
    stateCount: statesWithRun.length,
    archivedStaleStateCount: staleStatesWithRun.length,
    eventCount: eventsWithRun.length,
    openedCount: eventsWithRun.filter((event) => event.eventKind === 'opened' || event.eventKind === 'reopened').length,
    recoveringCount: eventsWithRun.filter((event) => event.eventKind === 'recovering').length,
    resolvedCount: eventsWithRun.filter((event) => event.eventKind === 'resolved').length,
    checkRunCount: 1,
    snapshotCount: 0,
    incidentCount: eventsWithRun.filter((event) => event.eventKind === 'opened' || event.eventKind === 'reopened').length,
    currentIssueCount: statesWithRun.filter((state) => isCctvUpActiveStateStatus(state.status)).length,
    resolvedIssueCount: eventsWithRun.filter((event) => event.eventKind === 'resolved').length,
    summary,
  };
}
