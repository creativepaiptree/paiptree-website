import type {
  CctvUpCameraSnapshot,
  CctvUpCheckRun,
  CctvUpCurrentIssue,
  CctvUpIncidentLog,
  CctvUpPayload,
  CctvUpStatus,
} from '@/lib/cctvup';
import { buildCurrentIssues } from '@/lib/cctvup';

export type CctvUpHistorySource = 'supabase' | 'unavailable';

export type CctvUpHistoryPayload = {
  source: CctvUpHistorySource;
  checkRuns: CctvUpCheckRun[];
  snapshots: CctvUpCameraSnapshot[];
  incidents: CctvUpIncidentLog[];
  currentIssues: CctvUpCurrentIssue[];
  message?: string;
};

type SupabaseConfig = {
  supabaseUrl: string;
  serviceKey: string;
};

type SupabaseResponse<T> = {
  data: T | null;
  error: string | null;
  status: number;
};

type SupabaseCheckRunRow = {
  id: string;
  source: CctvUpCheckRun['source'];
  checked_at: string;
  table_name: string;
  farm_count: number;
  camera_count: number;
  ok_count: number;
  late_count: number;
  missing_count: number;
  critical_count: number;
  paused_count: number;
  issue_count?: number;
  note: string;
};

type SupabaseCameraSnapshotRow = {
  id: string;
  run_id?: string | null;
  camera_key: string;
  farm_id: string;
  house_id: string;
  module_id: string;
  farm_name?: string | null;
  house_name?: string | null;
  camera_name?: string | null;
  snapshot_at: string;
  slot_status: CctvUpCameraSnapshot['slotStatus'];
  age_minutes: number;
  cnt_1h: number;
  cnt_24h: number;
  reason: string;
  expires_at: string;
};

type SupabaseIncidentLogRow = {
  id: string;
  run_id?: string | null;
  camera_key: string;
  farm_id: string;
  house_id: string;
  module_id: string;
  farm_name?: string | null;
  house_name?: string | null;
  camera_name?: string | null;
  incident_kind: CctvUpIncidentLog['incidentKind'];
  incident_status: CctvUpIncidentLog['incidentStatus'];
  first_seen_at: string;
  last_seen_at: string;
  resolved_at?: string | null;
  expires_at: string;
  message: string;
};

type SupabaseCurrentIssueRow = {
  id: string;
  run_id?: string | null;
  camera_key: string;
  farm_id: string;
  house_id: string;
  module_id: string;
  farm_name?: string | null;
  house_name?: string | null;
  camera_name?: string | null;
  issue_kind: CctvUpCurrentIssue['issueKind'];
  issue_status: CctvUpCurrentIssue['issueStatus'];
  first_seen_at: string;
  last_seen_at: string;
  resolved_at?: string | null;
  latest_at?: string | null;
  age_minutes: number;
  message: string;
  expires_at: string;
};

const HISTORY_KEEP_DAYS = 30;
const DEFAULT_LIMIT = 200;

export function getCctvUpSupabaseConfig(): SupabaseConfig | null {
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
  const response = await fetch(buildEndpoint(config, table).toString(), {
    cache: 'no-store',
    ...init,
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      Accept: 'application/json',
      ...(init.headers ?? {}),
    },
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

function mapCheckRunFromSupabase(row: SupabaseCheckRunRow): CctvUpCheckRun {
  return {
    id: row.id,
    source: row.source,
    checkedAt: row.checked_at,
    tableName: row.table_name,
    farmCount: row.farm_count,
    cameraCount: row.camera_count,
    okCount: row.ok_count,
    lateCount: row.late_count,
    missingCount: row.missing_count,
    criticalCount: row.critical_count,
    pausedCount: row.paused_count,
    issueCount: row.issue_count ?? (row.late_count + row.missing_count + row.critical_count),
    note: row.note,
  };
}

function mapSnapshotFromSupabase(row: SupabaseCameraSnapshotRow): CctvUpCameraSnapshot {
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
    snapshotAt: row.snapshot_at,
    slotStatus: row.slot_status,
    ageMinutes: row.age_minutes,
    cnt1h: row.cnt_1h,
    cnt24h: row.cnt_24h,
    reason: row.reason,
    expiresAt: row.expires_at,
  };
}

function mapIncidentFromSupabase(row: SupabaseIncidentLogRow): CctvUpIncidentLog {
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
    incidentKind: row.incident_kind,
    incidentStatus: row.incident_status,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    resolvedAt: row.resolved_at,
    expiresAt: row.expires_at,
    message: row.message,
  };
}

function mapCurrentIssueFromSupabase(row: SupabaseCurrentIssueRow): CctvUpCurrentIssue {
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
    issueKind: row.issue_kind,
    issueStatus: row.issue_status,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    resolvedAt: row.resolved_at,
    latestAt: row.latest_at,
    ageMinutes: row.age_minutes,
    message: row.message,
    expiresAt: row.expires_at,
  };
}

function mapCurrentIssueToSupabase(issue: CctvUpCurrentIssue) {
  return {
    run_id: issue.runId,
    camera_key: issue.cameraKey,
    farm_id: issue.farmId,
    house_id: issue.houseId,
    module_id: issue.moduleId,
    farm_name: issue.farmName,
    house_name: issue.houseName,
    camera_name: issue.cameraName,
    issue_kind: issue.issueKind,
    issue_status: issue.issueStatus,
    first_seen_at: issue.firstSeenAt,
    last_seen_at: issue.lastSeenAt,
    resolved_at: issue.resolvedAt,
    latest_at: issue.latestAt,
    age_minutes: issue.ageMinutes,
    message: issue.message,
    payload: issue,
    expires_at: issue.expiresAt,
  };
}

function mapRunToSupabase(run: Partial<CctvUpCheckRun>, payload: CctvUpPayload) {
  return {
    source: run.source,
    checked_at: run.checkedAt,
    table_name: run.tableName,
    farm_count: run.farmCount,
    camera_count: run.cameraCount,
    ok_count: run.okCount,
    late_count: run.lateCount,
    missing_count: run.missingCount,
    critical_count: run.criticalCount,
    paused_count: run.pausedCount,
    payload,
    note: run.note,
  };
}

function mapSnapshotToSupabase(snapshot: CctvUpCameraSnapshot) {
  return {
    run_id: snapshot.runId,
    camera_key: snapshot.cameraKey,
    farm_id: snapshot.farmId,
    house_id: snapshot.houseId,
    module_id: snapshot.moduleId,
    farm_name: snapshot.farmName,
    house_name: snapshot.houseName,
    camera_name: snapshot.cameraName,
    snapshot_at: snapshot.snapshotAt,
    slot_status: snapshot.slotStatus,
    age_minutes: snapshot.ageMinutes,
    cnt_1h: snapshot.cnt1h,
    cnt_24h: snapshot.cnt24h,
    reason: snapshot.reason,
    expires_at: snapshot.expiresAt,
  };
}

function mapIncidentToSupabase(incident: CctvUpIncidentLog) {
  return {
    run_id: incident.runId,
    camera_key: incident.cameraKey,
    farm_id: incident.farmId,
    house_id: incident.houseId,
    module_id: incident.moduleId,
    farm_name: incident.farmName,
    house_name: incident.houseName,
    camera_name: incident.cameraName,
    incident_kind: incident.incidentKind,
    incident_status: incident.incidentStatus,
    first_seen_at: incident.firstSeenAt,
    last_seen_at: incident.lastSeenAt,
    resolved_at: incident.resolvedAt,
    expires_at: incident.expiresAt,
    message: incident.message,
    snapshot_payload: incident,
  };
}

export function buildCctvUpCapturePayload(payload: CctvUpPayload) {
  const checkedAt = payload.checkedAt || new Date().toISOString();
  const expiresAt = new Date(Date.parse(checkedAt) + HISTORY_KEEP_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const run: Partial<CctvUpCheckRun> = {
    source: payload.source,
    checkedAt,
    tableName: payload.table,
    farmCount: payload.summary.farms,
    cameraCount: payload.summary.cameras,
    okCount: payload.summary.ok,
    lateCount: payload.summary.late,
    missingCount: payload.summary.missing,
    criticalCount: payload.summary.critical,
    pausedCount: payload.summary.paused,
    issueCount: payload.summary.issueCount,
    note: payload.message || '',
  };

  const snapshots = payload.rows.map((row) => ({
    runId: undefined,
    cameraKey: row.id,
    farmId: row.farm,
    houseId: row.house,
    moduleId: row.camera,
    farmName: row.farmName ?? null,
    houseName: row.houseName ?? null,
    cameraName: row.cameraName ?? null,
    snapshotAt: checkedAt,
    slotStatus: row.status === 'critical' ? 'missing' : row.status,
    ageMinutes: row.ageMinutes,
    cnt1h: row.slots.filter((slot) => slot === 'ok').length,
    cnt24h: Number.parseInt(row.rate24h.split('/')[0] || '0', 10) || 0,
    reason: row.reason,
    expiresAt,
  })) as CctvUpCameraSnapshot[];

  const incidents = payload.rows
    .filter((row) => row.status !== 'ok' && row.status !== 'paused')
    .map((row) => ({
      runId: undefined,
      cameraKey: row.id,
      farmId: row.farm,
      houseId: row.house,
      moduleId: row.camera,
      farmName: row.farmName ?? null,
      houseName: row.houseName ?? null,
      cameraName: row.cameraName ?? null,
      incidentKind: row.status as Exclude<CctvUpStatus, 'ok' | 'paused'>,
      incidentStatus: 'open' as const,
      firstSeenAt: checkedAt,
      lastSeenAt: checkedAt,
      resolvedAt: null,
      expiresAt,
      message: row.reason,
    })) as CctvUpIncidentLog[];

  const currentIssues = buildCurrentIssues(payload.rows, checkedAt);

  return { run, snapshots, incidents, currentIssues };
}

export async function fetchCctvUpHistory(limit = DEFAULT_LIMIT): Promise<CctvUpHistoryPayload | null> {
  const config = getCctvUpSupabaseConfig();
  if (!config) return null;

  try {
    const [checkRuns, snapshots, incidents, currentIssues] = await Promise.all([
      requestSupabase<SupabaseCheckRunRow[]>(config, 'tbl_cctvup_check_runs?order=checked_at.desc', {
        method: 'GET',
        headers: { Prefer: 'count=exact' },
      }).then((result) => Array.isArray(result.data) ? result.data.slice(0, limit).map(mapCheckRunFromSupabase) : []),
      requestSupabase<SupabaseCameraSnapshotRow[]>(config, 'tbl_cctvup_camera_snapshots?order=snapshot_at.desc', {
        method: 'GET',
        headers: { Prefer: 'count=exact' },
      }).then((result) => Array.isArray(result.data) ? result.data.slice(0, limit).map(mapSnapshotFromSupabase) : []),
      requestSupabase<SupabaseIncidentLogRow[]>(config, 'tbl_cctvup_incident_logs?order=last_seen_at.desc', {
        method: 'GET',
        headers: { Prefer: 'count=exact' },
      }).then((result) => Array.isArray(result.data) ? result.data.slice(0, limit).map(mapIncidentFromSupabase) : []),
      requestSupabase<SupabaseCurrentIssueRow[]>(config, 'tbl_cctvup_current_issues?order=last_seen_at.desc', {
        method: 'GET',
        headers: { Prefer: 'count=exact' },
      }).then((result) => Array.isArray(result.data) ? result.data.slice(0, limit).map(mapCurrentIssueFromSupabase) : []),
    ]);

    return {
      source: 'supabase',
      checkRuns,
      snapshots,
      incidents,
      currentIssues,
    };
  } catch (error) {
    console.error('[cctvup-history] Supabase fetch failed', error);
    return {
      source: 'unavailable',
      checkRuns: [],
      snapshots: [],
      incidents: [],
      currentIssues: [],
      message: error instanceof Error ? error.message : 'CCTVUP history fetch failed',
    };
  }
}

export async function persistCctvUpHistory(payload: CctvUpPayload) {
  const config = getCctvUpSupabaseConfig();
  if (!config) {
    return { ok: false as const, message: 'SUPABASE_URL / SUPABASE_SERVICE_KEY 설정이 필요합니다.' };
  }

  const capture = buildCctvUpCapturePayload(payload);
  const runResponse = await requestSupabase<Array<{ id: string }>>(config, 'tbl_cctvup_check_runs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify([mapRunToSupabase(capture.run, payload)]),
  });

  if (!runResponse.data || !Array.isArray(runResponse.data) || runResponse.data.length === 0) {
    return { ok: false as const, message: runResponse.error || 'check run insert failed' };
  }

  const runId = runResponse.data[0].id;
  const snapshots = capture.snapshots.map((snapshot) => ({ ...snapshot, runId }));
  const incidents = capture.incidents.map((incident) => ({ ...incident, runId }));

  const snapshotResponse = await requestSupabase<unknown>(
    config,
    'tbl_cctvup_camera_snapshots?on_conflict=camera_key,snapshot_at',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(snapshots.map(mapSnapshotToSupabase)),
    },
  );

  if (snapshotResponse.error) {
    return { ok: false as const, message: snapshotResponse.error };
  }

  if (incidents.length > 0) {
    const incidentResponse = await requestSupabase<unknown>(config, 'tbl_cctvup_incident_logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(incidents.map(mapIncidentToSupabase)),
    });

    if (incidentResponse.error) {
      return { ok: false as const, message: incidentResponse.error };
    }
  }

  const currentIssueLookupResponse = await requestSupabase<SupabaseCurrentIssueRow[]>(
    config,
    'tbl_cctvup_current_issues?select=id,camera_key,first_seen_at,issue_status',
    {
      method: 'GET',
      headers: { Prefer: 'count=exact' },
    },
  );

  const hasCurrentIssuesTable = !currentIssueLookupResponse.error?.includes('Could not find the table');
  const existingCurrentIssues = hasCurrentIssuesTable && Array.isArray(currentIssueLookupResponse.data) ? currentIssueLookupResponse.data : [];
  const existingCurrentIssueMap = new Map(existingCurrentIssues.map((row) => [row.camera_key, row]));
  const currentIssueKeys = new Set(capture.currentIssues.map((issue) => issue.cameraKey));
  const nextCurrentIssues = capture.currentIssues.map((issue) => {
    const existing = existingCurrentIssueMap.get(issue.cameraKey);
    return {
      ...issue,
      runId,
      firstSeenAt: existing?.first_seen_at ?? issue.firstSeenAt,
      lastSeenAt: issue.lastSeenAt,
      issueStatus: 'open' as const,
      resolvedAt: null,
    };
  });

  if (hasCurrentIssuesTable && nextCurrentIssues.length > 0) {
    const currentIssueResponse = await requestSupabase<unknown>(config, 'tbl_cctvup_current_issues?on_conflict=camera_key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(nextCurrentIssues.map(mapCurrentIssueToSupabase)),
    });

    if (currentIssueResponse.error) {
      return { ok: false as const, message: currentIssueResponse.error };
    }
  }

  const resolvedIds = hasCurrentIssuesTable
    ? existingCurrentIssues
        .filter((row) => row.issue_status === 'open' && !currentIssueKeys.has(row.camera_key))
        .map((row) => row.id)
    : [];

  if (hasCurrentIssuesTable && resolvedIds.length > 0) {
    const resolvedIssueResponse = await requestSupabase<unknown>(
      config,
      `tbl_cctvup_current_issues?id=in.(${resolvedIds.join(',')})`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          issue_status: 'resolved',
          resolved_at: capture.run.checkedAt,
          last_seen_at: capture.run.checkedAt,
        }),
      },
    );

    if (resolvedIssueResponse.error) {
      return { ok: false as const, message: resolvedIssueResponse.error };
    }
  }

  return { ok: true as const, runId, snapshotCount: snapshots.length, incidentCount: incidents.length, currentIssueCount: nextCurrentIssues.length, resolvedIssueCount: resolvedIds.length };
}
