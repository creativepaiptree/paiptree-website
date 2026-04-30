'use client';

import { useEffect, useMemo, useState } from 'react';
import { type CctvUpPayload, type CctvUpRow, type CctvUpSlotStatus, type CctvUpStatus, minutesBetween } from '@/lib/cctvup';
import { type CctvUpHistoryPayload } from '@/lib/cctvup-history';
import {
  type CctvUpFarmCategory,
  type CctvUpFarmRegistryEntry,
  type CctvUpFarmRegistryPayload,
  joinRegistryList,
  normalizeCctvUpFarmCategory,
  splitRegistryList,
} from '@/lib/cctvup-registry';
import { buildCctvUpFarmGroups, compareCctvUpFarmGroups } from '@/lib/cctvup-farm-groups';

type ThemeMode = 'dark' | 'light';
type CameraStatus = CctvUpStatus;
type MonitorFilter = 'all' | 'issue';
type FarmSortMode = 'issue' | 'severity' | 'category' | 'name';

type DisplayRow = CctvUpRow & {
  displayFarmName: string;
  displayHouseName: string;
  displayCameraName: string;
  displayCategory: CctvUpFarmCategory;
  displayTags: string[];
  displayMemo?: string;
};

type FarmGroup = ReturnType<typeof buildCctvUpFarmGroups>[number];

const REGISTRY_EMPTY_ENTRY = (): CctvUpFarmRegistryEntry => ({
  farmId: '',
  displayName: '',
  category: 'other',
  tags: [],
  memo: '',
  aliases: [],
  isActive: true,
});

const initialRegistryState: CctvUpFarmRegistryPayload = {
  source: 'unavailable',
  items: [],
};

const FarmBadgeLabels: Record<CctvUpFarmCategory, string> = {
  overseas: '해외',
  shinwoo: '신우',
  cheriburo: '체리부로',
  other: '기타',
};

const statusTone: Record<CameraStatus, { label: string; badge: string; dot: string }> = {
  ok: { label: '정상', badge: 'border-sky-500/30 bg-sky-500/10 text-sky-200', dot: 'bg-sky-400' },
  late: { label: '지연', badge: 'border-red-500/30 bg-red-500/10 text-red-200', dot: 'bg-red-400' },
  missing: { label: '누락', badge: 'border-red-500/30 bg-red-500/10 text-red-200', dot: 'bg-red-400' },
  critical: { label: '장기중단', badge: 'border-red-500/30 bg-red-500/10 text-red-200', dot: 'bg-red-400' },
  paused: { label: '점검제외', badge: 'border-slate-500/30 bg-slate-500/10 text-slate-200', dot: 'bg-slate-400' },
};

const slotTone: Record<'ok' | 'late' | 'missing' | 'paused', string> = {
  ok: 'bg-emerald-400',
  late: 'bg-amber-400',
  missing: 'bg-rose-500',
  paused: 'bg-slate-500',
};

function SlotEnergyBar({ slots, theme }: { slots: CctvUpSlotStatus[]; theme: ThemeMode }) {
  const displaySlots = useMemo(() => {
    if (slots.length === 24) return slots;
    if (slots.length === 12) return slots.flatMap((slot) => [slot, slot]);
    return slots;
  }, [slots]);

  return (
    <div
      className={`rounded-sm border p-1.5 ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-[#243041] bg-[#0a1019]'}`}
      title="24칸 에너지바"
    >
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
        {displaySlots.map((slot, idx) => (
          <div
            key={`slot-energy-${idx}`}
            className={`h-4 rounded-[1px] ${slotTone[slot]} ${slot === 'paused' ? 'opacity-70' : ''}`}
            title={`슬롯 ${idx + 1}: ${slot}`}
          />
        ))}
      </div>
    </div>
  );
}

const initialPayload: CctvUpPayload = {
  source: 'mock',
  checkedAt: '',
  table: 'paip.tbl_farm_image',
  rows: [],
  incidents: [],
  currentIssues: [],
  summary: { farms: 0, cameras: 0, ok: 0, late: 0, missing: 0, critical: 0, paused: 0, issueCount: 0 },
  message: '운영 DB 조회 대기 중입니다.',
};

const alertPolicy = [
  '5분 주기 기준, 7분 이내는 정상으로 본다.',
  '7~12분 지연은 노란불로 표시하고 재수신을 기다린다.',
  '12분 초과 또는 연속 2슬롯 누락 시 빨간불로 올린다.',
  '30분 초과는 장기중단으로 분리하고 담당자 알림을 보낸다.',
];


function formatCheckedAt(value: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  }).format(date);
}

function formatClock(value: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  }).format(date);
}

function slotCompletionPercent(slots: CctvUpSlotStatus[]) {
  if (!slots.length) return 0;
  const okCount = slots.filter((slot) => slot === 'ok').length;
  return Math.round((okCount / slots.length) * 100);
}

function formatEventTime(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  }).format(date);
}

function shellBg(theme: ThemeMode) {
  return theme === 'light' ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#0b1220] text-slate-100';
}

function panelBg(theme: ThemeMode) {
  return theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0f1722] border-[#243041]';
}

function softBg(theme: ThemeMode) {
  return theme === 'light' ? 'bg-[#f1f5f9]' : 'bg-[#0a1019]';
}

function inputClass(theme: ThemeMode) {
  return theme === 'light'
    ? 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-sky-500'
    : 'border-[#314056] bg-[#0a1019] text-slate-100 placeholder:text-slate-500 focus:border-[#4D7CFF]';
}

function cleanName(value: string) {
  return value.trim();
}

function classifyFarmBadge(row: Pick<CctvUpRow, 'farm' | 'farmName'> & { displayFarmName?: string }) {
  const text = [row.farmName, row.displayFarmName, row.farm].filter(Boolean).join(' ');
  const compact = text.replace(/\s+/g, '');
  if (/체리부로/i.test(text)) return 'cheriburo' as const;
  if (/신우/i.test(text)) return 'shinwoo' as const;
  if (/해외/i.test(text)) return 'overseas' as const;
  if (/[A-Za-z]/.test(text) || /[^가-힣0-9A-Za-z()&\-· ]/.test(text)) return 'overseas' as const;
  if (/체리/.test(compact)) return 'cheriburo' as const;
  return 'other' as const;
}

const farmBadgeTone: Record<CctvUpFarmCategory, { label: string; className: string }> = {
  overseas: { label: '해외', className: 'border-sky-500/20 bg-sky-500/10 text-sky-200' },
  shinwoo: { label: '신우', className: 'border-teal-500/20 bg-teal-500/10 text-teal-100' },
  cheriburo: { label: '체리부로', className: 'border-rose-500/20 bg-rose-500/10 text-rose-100' },
  other: { label: '기타', className: 'border-slate-500/20 bg-slate-500/10 text-slate-200' },
};

const farmBadgeOrder: Record<CctvUpFarmCategory, number> = {
  overseas: 0,
  shinwoo: 1,
  cheriburo: 2,
  other: 3,
};

const statusOrder: Record<Exclude<CctvUpStatus, 'paused'>, number> = {
  critical: 0,
  missing: 1,
  late: 2,
  ok: 3,
};

const CHRONIC_AGE_MINUTES = 180;

function getRowSortBucket(row: Pick<DisplayRow, 'status' | 'ageMinutes'>) {
  if (row.status === 'paused') return 3;
  if (row.status !== 'ok' && row.ageMinutes >= CHRONIC_AGE_MINUTES) return 2;
  if (row.status === 'ok') return 1;
  return 0;
}

function getGroupSortBucket(group: Pick<FarmGroup, 'status' | 'issueAgeMinutes' | 'isProblem'>) {
  if (group.status === 'paused') return 3;
  if (group.isProblem && Number.isFinite(group.issueAgeMinutes) && group.issueAgeMinutes >= CHRONIC_AGE_MINUTES) return 2;
  if (!group.isProblem) return 1;
  return 0;
}

function compareDisplayRows(a: DisplayRow, b: DisplayRow) {
  const bucketDiff = getRowSortBucket(a) - getRowSortBucket(b);
  if (bucketDiff !== 0) return bucketDiff;

  const statusDiff = statusOrder[a.status === 'paused' ? 'ok' : a.status] - statusOrder[b.status === 'paused' ? 'ok' : b.status];
  if (statusDiff !== 0) return statusDiff;

  const badgeDiff = farmBadgeOrder[a.displayCategory] - farmBadgeOrder[b.displayCategory];
  if (badgeDiff !== 0) return badgeDiff;

  const farmDiff = a.displayFarmName.localeCompare(b.displayFarmName, 'ko-KR');
  if (farmDiff !== 0) return farmDiff;

  const houseDiff = a.displayHouseName.localeCompare(b.displayHouseName, 'ko-KR');
  if (houseDiff !== 0) return houseDiff;

  const cameraDiff = a.displayCameraName.localeCompare(b.displayCameraName, 'ko-KR');
  if (cameraDiff !== 0) return cameraDiff;

  return a.id.localeCompare(b.id);
}

function FarmBadgePill({ badge }: { badge: CctvUpFarmCategory }) {
  const tone = farmBadgeTone[badge];
  return (
    <span className={`inline-flex h-5 shrink-0 items-center rounded-sm border px-1.5 text-[10px] font-semibold leading-none tracking-[0.06em] ${tone.className}`}>
      {tone.label}
    </span>
  );
}

function mergeRegistryEntry(row: CctvUpRow, entry?: CctvUpFarmRegistryEntry): DisplayRow {
  const category = entry?.category ?? classifyFarmBadge(row);
  return {
    ...row,
    displayFarmName: cleanName(entry?.displayName || row.farmName || row.farm),
    displayHouseName: row.houseName || row.house,
    displayCameraName: row.cameraName || row.camera,
    displayCategory: category,
    displayTags: entry?.tags ?? [],
    displayMemo: entry?.memo?.trim() || undefined,
  };
}

function buildRegistrySeed(row: CctvUpRow): CctvUpFarmRegistryEntry {
  return {
    farmId: row.farm,
    displayName: row.farmName || row.farm,
    category: classifyFarmBadge(row),
    tags: [],
    memo: '',
    aliases: [],
    isActive: true,
  };
}

function emptyRegistryForFarm(farmId: string): CctvUpFarmRegistryEntry {
  return {
    farmId,
    displayName: '',
    category: 'other',
    tags: [],
    memo: '',
    aliases: [],
    isActive: true,
  };
}

function normalizeRegistryDraft(entry: CctvUpFarmRegistryEntry): CctvUpFarmRegistryEntry {
  return {
    farmId: entry.farmId,
    displayName: entry.displayName?.trim() || '',
    category: normalizeCctvUpFarmCategory(entry.category) ?? 'other',
    tags: entry.tags.map((item) => item.trim()).filter(Boolean),
    memo: entry.memo?.trim() || '',
    aliases: entry.aliases.map((item) => item.trim()).filter(Boolean),
    updatedAt: entry.updatedAt,
    updatedBy: entry.updatedBy,
    isActive: entry.isActive ?? true,
  };
}

export default function CctvUpClient() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MonitorFilter>('all');
  const [farmSortMode, setFarmSortMode] = useState<FarmSortMode>('issue');
  const [expandedFarmIds, setExpandedFarmIds] = useState<Record<string, boolean>>({});
  const [payload, setPayload] = useState<CctvUpPayload>(initialPayload);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [historyPayload, setHistoryPayload] = useState<CctvUpHistoryPayload>({
    source: 'supabase',
    checkRuns: [],
    snapshots: [],
    incidents: [],
    currentIssues: [],
  });
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [registryPayload, setRegistryPayload] = useState<CctvUpFarmRegistryPayload>(initialRegistryState);
  const [registryDraft, setRegistryDraft] = useState<Record<string, CctvUpFarmRegistryEntry>>({});
  const [registryBaseline, setRegistryBaseline] = useState<Record<string, CctvUpFarmRegistryEntry>>({});
  const [isRegistryLoading, setIsRegistryLoading] = useState(true);
  const [isRegistrySaving, setIsRegistrySaving] = useState(false);
  const [registryError, setRegistryError] = useState('');
  const monitorRows = payload.rows;
  useEffect(() => {
    const controller = new AbortController();
    const refreshIntervalMs = 5 * 60 * 1000;
    let intervalId: number | null = null;

    async function loadCctvUp() {
      setIsLoading(true);
      setIsHistoryLoading(true);
      setIsRegistryLoading(true);
      setLoadError('');
      setRegistryError('');
      try {
        const [payloadResponse, historyResponse, registryResponse] = await Promise.all([
          fetch('/api/cctvup', { cache: 'no-store', signal: controller.signal }),
          fetch('/api/cctvup/history/?limit=200', { cache: 'no-store', signal: controller.signal }),
          fetch('/api/cctvup/registry/', { cache: 'no-store', signal: controller.signal }),
        ]);

        const nextPayload = (await payloadResponse.json()) as CctvUpPayload;
        setPayload(nextPayload);
        setSelectedId((current) => (nextPayload.rows.some((row) => row.id === current) ? current : ''));
        if (!payloadResponse.ok) {
          setLoadError(nextPayload.message || `조회 실패: ${payloadResponse.status}`);
        }

        const nextHistory = (await historyResponse.json()) as CctvUpHistoryPayload;
        setHistoryPayload({
          source: nextHistory.source || 'unavailable',
          checkRuns: Array.isArray(nextHistory.checkRuns) ? nextHistory.checkRuns : [],
          snapshots: Array.isArray(nextHistory.snapshots) ? nextHistory.snapshots : [],
          incidents: Array.isArray(nextHistory.incidents) ? nextHistory.incidents : [],
          currentIssues: Array.isArray(nextHistory.currentIssues) ? nextHistory.currentIssues : [],
          message: nextHistory.message,
        });

        const nextRegistry = (await registryResponse.json()) as CctvUpFarmRegistryPayload;
        if (registryResponse.ok && nextRegistry?.items) {
          const nextDraft = Object.fromEntries(nextRegistry.items.map((entry) => [entry.farmId, entry]));
          setRegistryPayload(nextRegistry);
          setRegistryDraft(nextDraft);
          setRegistryBaseline(nextDraft);
        } else {
          setRegistryPayload({ source: 'unavailable', items: [], message: nextRegistry?.message || `registry 조회 실패: ${registryResponse.status}` });
          setRegistryError(nextRegistry?.message || `registry 조회 실패: ${registryResponse.status}`);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(error instanceof Error ? error.message : 'CCTVUP 조회 실패');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsHistoryLoading(false);
          setIsRegistryLoading(false);
        }
      }
    }

    void loadCctvUp();
    intervalId = window.setInterval(() => {
      void loadCctvUp();
    }, refreshIntervalMs);

    return () => {
      controller.abort();
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, []);

  const displayRows = useMemo<DisplayRow[]>(() => {
    return monitorRows.map((row) => mergeRegistryEntry(row, registryDraft[row.farm]));
  }, [monitorRows, registryDraft]);

  const sortedRows = useMemo(() => {
    return displayRows.slice().sort(compareDisplayRows);
  }, [displayRows]);

  const farmGroups = useMemo<FarmGroup[]>(() => {
    return buildCctvUpFarmGroups(displayRows).slice().sort((a, b) => compareCctvUpFarmGroups(a, b, farmSortMode));
  }, [displayRows, farmSortMode]);

  const selected = useMemo(() => sortedRows.find((row) => row.id === selectedId), [sortedRows, selectedId]);

  const selectedTone = statusTone[selected?.status ?? 'ok'];
  const selectedRegistry = selected ? registryDraft[selected.farm] ?? buildRegistrySeed(selected) : null;

  const matchesRowQuery = (row: DisplayRow, q: string) => {
    if (!q) return true;
    return [
      row.farm,
      row.farmName,
      row.displayFarmName,
      row.house,
      row.houseName,
      row.displayHouseName,
      row.camera,
      row.cameraName,
      row.displayCameraName,
      row.displayMemo,
      row.displayTags.join(' '),
      row.reason,
    ]
      .filter(Boolean)
      .some((item) => String(item).toLowerCase().includes(q));
  };

  const matchesGroupQuery = (group: FarmGroup, q: string) => {
    if (!q) return true;
    return [
      group.farmId,
      group.farmName,
      group.category,
      group.status,
      group.rows.map((row: DisplayRow) => row.displayTags.join(' ')).join(' '),
      group.rows.map((row: DisplayRow) => row.displayMemo || '').join(' '),
    ]
      .filter(Boolean)
      .some((item) => String(item).toLowerCase().includes(q));
  };

  const filteredFarmGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return farmGroups
      .filter((group) => (statusFilter === 'issue' ? group.isProblem : true))
      .filter((group) => matchesGroupQuery(group, q) || group.rows.some((row: DisplayRow) => matchesRowQuery(row, q)) || group.farmId === selected?.farm)
      .map((group) => ({
        ...group,
        rows: q ? group.rows.filter((row: DisplayRow) => matchesRowQuery(row, q)) : group.rows,
      }))
      .filter((group) => group.rows.length > 0 || group.farmId === selected?.farm);
  }, [farmGroups, query, selected?.farm, statusFilter]);

  const problemRows = useMemo(() => {
    return sortedRows.filter((row) => row.status !== 'ok' && row.status !== 'paused');
  }, [sortedRows]);

  const freshProblemRows = useMemo(() => {
    return problemRows.filter((row) => row.ageMinutes < CHRONIC_AGE_MINUTES);
  }, [problemRows]);

  const chronicProblemRows = useMemo(() => {
    return problemRows.filter((row) => row.ageMinutes >= CHRONIC_AGE_MINUTES);
  }, [problemRows]);

  const counts = useMemo(
    () => ({
      ok: payload.summary.ok,
      late: payload.summary.late,
      missing: payload.summary.missing,
      critical: payload.summary.critical,
      paused: payload.summary.paused,
    }),
    [payload.summary],
  );

  const selectedSnapshots = useMemo(() => {
    if (!selected) return [];
    return historyPayload.snapshots
      .filter((snapshot) => snapshot.cameraKey === selected.id)
      .slice()
      .sort((a, b) => b.snapshotAt.localeCompare(a.snapshotAt))
      .slice(0, 6);
  }, [historyPayload.snapshots, selected]);

  const selectedIncidents = useMemo(() => {
    if (!selected) return [];
    return historyPayload.incidents
      .filter((incident) => incident.cameraKey === selected.id)
      .slice()
      .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt))
      .slice(0, 6);
  }, [historyPayload.incidents, selected]);

  const latestCheckRun = historyPayload.checkRuns[0];
  const latestIssueCount = latestCheckRun?.issueCount ?? historyPayload.currentIssues.length;
  const latestCheckAgeMinutes = latestCheckRun?.checkedAt ? minutesBetween(new Date(), latestCheckRun.checkedAt) : 999;
  const isStale = latestCheckAgeMinutes >= 15;

  const updateRegistryField = (farmId: string, field: keyof CctvUpFarmRegistryEntry, value: string | string[] | boolean | CctvUpFarmCategory) => {
    setRegistryDraft((current) => {
      const sourceRow = monitorRows.find((row) => row.farm === farmId);
      const base = current[farmId] ?? (sourceRow ? buildRegistrySeed(sourceRow) : emptyRegistryForFarm(farmId));
      const next: CctvUpFarmRegistryEntry = {
        ...base,
        farmId,
      };

      if (field === 'displayName' || field === 'memo' || field === 'updatedBy') {
        next[field] = String(value);
      } else if (field === 'category') {
        next.category = normalizeCctvUpFarmCategory(value) ?? 'other';
      } else if (field === 'tags' || field === 'aliases') {
        next[field] = Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : splitRegistryList(String(value));
      } else if (field === 'isActive') {
        next.isActive = Boolean(value);
      }

      return {
        ...current,
        [farmId]: normalizeRegistryDraft(next),
      };
    });
  };
  const resetRegistryForFarm = (farmId: string) => {
    setRegistryDraft((current) => {
      const next = { ...current };
      const baseline = registryBaseline[farmId];
      if (baseline) next[farmId] = baseline;
      else delete next[farmId];
      return next;
    });
  };

  const saveRegistryForFarm = async (farmId: string) => {
    const entry = registryDraft[farmId];
    if (!entry) return;

    setIsRegistrySaving(true);
    setRegistryError('');
    try {
      const response = await fetch('/api/cctvup/registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              farmId,
              displayName: entry.displayName,
              category: entry.category,
              tags: entry.tags,
              memo: entry.memo,
              aliases: entry.aliases,
              isActive: entry.isActive ?? true,
            },
          ],
        }),
      });

      const result = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || result.ok === false) {
        throw new Error(result.message || `registry 저장 실패: ${response.status}`);
      }

      const normalized = normalizeRegistryDraft(entry);
      setRegistryBaseline((current) => ({ ...current, [farmId]: normalized }));
      setRegistryDraft((current) => ({ ...current, [farmId]: normalized }));
    } catch (error) {
      setRegistryError(error instanceof Error ? error.message : 'registry 저장 실패');
    } finally {
      setIsRegistrySaving(false);
    }
  };

  const resetRegistryAll = () => {
    setRegistryDraft(registryBaseline);
  };


  return (
    <div className={`min-h-screen ${shellBg(theme)} selection:bg-sky-500/30 selection:text-white`} data-cctvup-theme={theme}>
      <header className={`border-b ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-[#243041] bg-[#0f1722]'}`}>
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className={`text-[11px] uppercase tracking-[0.18em] ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>FMS / CCTVUP</p>
            <h1 className="mt-1 flex flex-wrap items-end gap-2 text-2xl font-semibold leading-tight">
              <span>5분 CCTV 데이터 수신 모니터</span>
              <span className={`text-sm font-normal ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                (운영 DB · 농장 {payload.summary.farms}개 · 카메라 {payload.summary.cameras}개 · 확인 {formatClock(payload.checkedAt)} · 문제 {payload.summary.issueCount}개)
              </span>
            </h1>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              className={`border px-3 py-2 text-sm transition ${theme === 'light' ? 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50' : 'border-[#314056] bg-[#0a1019] text-slate-200 hover:bg-white/5'}`}
            >
              {theme === 'dark' ? '라이트' : '다크'}
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setStatusFilter('all');
                setFarmSortMode('issue');
                setSelectedId('');
              }}
              className={`border px-3 py-2 text-sm transition ${theme === 'light' ? 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50' : 'border-[#314056] bg-[#0a1019] text-slate-200 hover:bg-white/5'}`}
            >
              초기화
            </button>
            <button
              type="button"
              onClick={resetRegistryAll}
              className={`border px-3 py-2 text-sm transition ${theme === 'light' ? 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50' : 'border-[#314056] bg-[#0a1019] text-slate-200 hover:bg-white/5'}`}
            >
              등록값 초기화
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4">
        {(isLoading || isHistoryLoading || loadError) && (
          <div className={`border px-4 py-3 text-sm ${theme === 'light' ? 'border-slate-200 bg-white text-slate-700' : 'border-[#243041] bg-[#0f1722] text-slate-300'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>
                {loadError
                  ? `조회 상태: ${loadError}`
                  : isLoading
                    ? '운영 DB와 history를 함께 읽는 중입니다.'
                    : '운영 DB와 history 스냅샷을 함께 반영했습니다.'}
              </span>
              <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                history {isHistoryLoading ? '동기화 중' : historyPayload.source} · last check {formatEventTime(latestCheckRun?.checkedAt)} · issue {latestIssueCount}{isStale ? ` · stale ${latestCheckAgeMinutes}m` : ''}
              </span>
            </div>
          </div>
        )}
        <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <article className={`border ${panelBg(theme)}`}>
            <div className={`border-b px-4 py-3 ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-[#243041] bg-[#0a1019]'}`}>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">농장 그룹 리스트</h2>
                    <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      농장 {filteredFarmGroups.length}개 · 카메라 {displayRows.length}대
                    </span>
                  </div>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="농장 / 축사 / 카메라 / 이름 검색"
                    className={`mt-2 h-8 w-full border px-3 py-1.5 text-sm outline-none ${inputClass(theme)}`}
                  />
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      {([
                        ['all', '전체 농장'],
                        ['issue', '문제 농장'],
                      ] as const).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setStatusFilter(key)}
                          className={`inline-flex h-8 w-auto items-center justify-center border px-3 py-1.5 text-center transition ${
                            statusFilter === key
                              ? 'border-sky-500 bg-sky-500/10 text-white'
                              : theme === 'light'
                                ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                                : 'border-[#314056] bg-[#0a1019] text-slate-200 hover:bg-white/5'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={farmSortMode}
                        onChange={(event) => setFarmSortMode(event.target.value as FarmSortMode)}
                        className={`h-8 border px-2 text-xs outline-none ${inputClass(theme)}`}
                        aria-label="농장 정렬"
                      >
                        <option value="issue">문제농장 우선</option>
                        <option value="severity">심각도별</option>
                        <option value="category">카테고리별</option>
                        <option value="name">가나다순</option>
                      </select>
                      <span className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>{payload.table}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-px">
              {filteredFarmGroups.map((group) => {
                const tone = statusTone[group.status as CameraStatus];
                const isExpanded = expandedFarmIds[group.farmId] || selected?.farm === group.farmId;
                const latestRow = sortedRows.find((row) => row.id === group.latestRowId) ?? group.rows[0];
                const tagsLabel = latestRow?.displayTags.length ? latestRow.displayTags.slice(0, 3).join(' · ') : '';
                return (
                  <div key={group.farmId} className={`border-b ${theme === 'light' ? 'border-slate-100' : 'border-[#1b2636]'}`}>
                    <button
                      type="button"
                      onClick={() => setExpandedFarmIds((current) => ({ ...current, [group.farmId]: !isExpanded }))}
                      className={`w-full px-3 py-3 text-left transition ${theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-[#0f1722]'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                            <span className={`inline-flex h-5 items-center rounded-sm border px-1.5 text-[10px] font-semibold ${tone.badge}`}>
                              {tone.label}
                            </span>
                            <FarmBadgePill badge={group.category as CctvUpFarmCategory} />
                            <span className="min-w-0 truncate text-sm font-semibold leading-5">{group.farmName}</span>
                            <span className={`text-[11px] tabular-nums ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{group.farmId}</span>
                            <span className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{isExpanded ? '접기 ▲' : '펼치기 ▼'}</span>
                          </div>
                          <div className={`mt-1 flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0 text-[11px] leading-4 tabular-nums ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            <span>카메라 {group.cameraCount}대</span>
                            <span>·</span>
                            <span>문제 {group.problemCount}대</span>
                            <span>·</span>
                            <span>정상 {group.okCount}대</span>
                            <span>·</span>
                            <span>최신 {group.latestAt}</span>
                            {tagsLabel ? <><span>·</span><span>{tagsLabel}</span></> : null}
                            {latestRow?.displayMemo ? <><span>·</span><span className="truncate">{latestRow.displayMemo}</span></> : null}
                          </div>
                        </div>
                        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`} title={tone.label} aria-label={tone.label} />
                      </div>
                    </button>

                    {isExpanded ? (
                      <div className={`${theme === 'light' ? 'bg-slate-50/70' : 'bg-[#0a1019]'}`}>
                        {group.rows.map((row: DisplayRow) => {
                          const isSelected = row.id === selected?.id;
                          const percent = slotCompletionPercent(row.slots);
                          return (
                            <button
                              key={row.id}
                              type="button"
                              onClick={() => setSelectedId(row.id)}
                              className={`flex w-full items-start justify-between gap-3 border-t px-5 py-2 text-left transition ${
                                theme === 'light' ? 'border-slate-100 hover:bg-white' : 'border-[#1b2636] hover:bg-[#0f1722]'
                              } ${isSelected ? (theme === 'light' ? 'bg-sky-50' : 'bg-[#13213a]') : ''}`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                                  <span className={`inline-flex h-5 min-w-[48px] items-center justify-center rounded-sm border px-1.5 text-[10px] font-semibold tabular-nums ${percent === 100 ? 'border-emerald-500/40 bg-emerald-500 text-white' : 'border-red-500/40 bg-red-500 text-white'}`}>
                                    {percent}%
                                  </span>
                                  <span className={`min-w-0 truncate text-xs font-medium leading-5 ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>
                                    {row.displayHouseName} / {row.displayCameraName}
                                  </span>
                                  <span className={`text-[11px] tabular-nums ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                                    {row.house} / {row.camera}
                                  </span>
                                  <span className={`inline-flex items-center gap-1 text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${statusTone[row.status].dot}`} />
                                    {statusTone[row.status].label}
                                  </span>
                                </div>
                                <div className={`mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1 text-[11px] leading-4 tabular-nums ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                                  <span>최신 {row.latestAt}</span>
                                  <span>/</span>
                                  <span>지연 {row.ageMinutes >= 999 ? '-' : `${row.ageMinutes}m`}</span>
                                  <span>/</span>
                                  <span>누락 {row.consecutiveMiss}</span>
                                  <span>/</span>
                                  <span>{row.reason}</span>
                                </div>
                              </div>
                              <div className="w-full max-w-[170px] shrink-0 self-center">
                                <SlotEnergyBar slots={row.slots} theme={theme} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </article>

          <aside className="flex flex-col gap-3">
            <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {[
                { label: '정상', value: counts.ok, tone: 'ok' },
                { label: '지연', value: counts.late, tone: 'late' },
                { label: '누락', value: counts.missing, tone: 'missing' },
                { label: '장기중단', value: counts.critical, tone: 'critical' },
              ].map((item) => {
                const toneClass =
                  item.tone === 'ok'
                    ? 'border-emerald-500/30 bg-emerald-500/12 text-emerald-100'
                    : item.tone === 'late'
                      ? 'border-amber-500/30 bg-amber-500/12 text-amber-100'
                      : item.tone === 'missing'
                        ? theme === 'light'
                          ? 'border-slate-300 bg-slate-50 text-slate-700'
                          : 'border-slate-500/30 bg-slate-500/12 text-slate-200'
                        : 'border-red-500/30 bg-red-500/12 text-red-100';
                const accent =
                  item.tone === 'ok'
                    ? 'bg-emerald-400'
                    : item.tone === 'late'
                      ? 'bg-amber-400'
                      : item.tone === 'missing'
                        ? theme === 'light'
                          ? 'bg-slate-300'
                          : 'bg-slate-500'
                        : 'bg-red-400';
                return (
                  <article
                    key={item.label}
                    className={`min-h-[92px] border px-4 py-4 ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-[#243041] bg-[#0f1722]'} ${toneClass}`}
                  >
                    <div className={`h-1 w-16 rounded-full ${accent}`} />
                    <p className="mt-3 text-[11px] uppercase tracking-[0.18em] opacity-90">{item.label}</p>
                    <p className="mt-1 text-3xl font-semibold tabular-nums">{item.value}</p>
                    <p className={`mt-2 text-xs leading-5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      {item.tone === 'ok' ? '정상 수신 중' : item.tone === 'late' ? '지연 감지' : item.tone === 'missing' ? '비어 있음 / 주의' : '즉시 확인 필요'}
                    </p>
                  </article>
                );
              })}
            </section>

            {selected ? (
              <article className={`border ${panelBg(theme)}`}>
                <div className={`border-b px-5 py-4 ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-[#243041] bg-[#0a1019]'}`}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">{selected.displayFarmName} / {selected.displayHouseName} / {selected.displayCameraName}</h2>
                      <p className={`mt-1 text-xs font-mono ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                        {selected.farm} / {selected.house} / {selected.camera}
                      </p>
                      <p className={`mt-2 text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                        {payload.table} · 최근 수신 {formatEventTime(selected.latestAtIso)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedId('')}
                        className={`border px-3 py-2 text-xs transition ${theme === 'light' ? 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50' : 'border-[#314056] bg-[#0a1019] text-slate-200 hover:bg-white/5'}`}
                      >
                        선택 해제
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 px-5 py-5">
                  <section className={`border p-4 ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-[#243041] bg-[#0a1019]'}`}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className={`mb-2 flex items-center justify-between text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                          <span>60m ago</span>
                          <span>now</span>
                        </div>
                        <div className="grid grid-cols-12 gap-1">
                          {selected.slots.map((slot, idx) => (
                            <div
                              key={`${selected.id}-kuma-slot-${idx}`}
                              className={`h-9 rounded-sm border ${theme === 'light' ? 'border-slate-200' : 'border-[#243041]'} ${softBg(theme)}`}
                              title={`${idx * 5}분 슬롯`}
                            >
                              <div className={`h-full w-full rounded-sm ${slotTone[slot]}`} />
                            </div>
                          ))}
                        </div>
                        <p className={`mt-3 text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>5분마다 CCTV/분석 이미지 수신을 확인합니다.</p>
                      </div>
                      <div className="flex items-center justify-center px-1 py-1" title={selectedTone.label} aria-label={selectedTone.label}>
                        <span className={`h-3 w-3 rounded-full ${selectedTone.dot}`} />
                      </div>
                    </div>
                  </section>

                  <section className={`grid gap-px border ${theme === 'light' ? 'border-slate-200 bg-slate-200 md:grid-cols-2 xl:grid-cols-4' : 'border-[#243041] bg-[#243041] md:grid-cols-2 xl:grid-cols-4'}`}>
                    {[
                      ['최신 수신', selected.latestAt, '현재'],
                      ['지연 시간', selected.ageMinutes >= 999 ? '-' : `${selected.ageMinutes}m`, '현재'],
                      ['1시간 수신율', selected.rate1h, '12 슬롯 기준'],
                      ['24시간 수신율', selected.rate24h, '288 슬롯 기준'],
                    ].map(([label, value, hint]) => (
                      <div key={label} className={`${theme === 'light' ? 'bg-white' : 'bg-[#0f1722]'} px-4 py-4`}>
                        <p className={`text-[11px] uppercase tracking-[0.16em] ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>{label}</p>
                        <p className="mt-2 text-xl font-semibold tabular-nums">{value}</p>
                        <p className={`mt-1 text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{hint}</p>
                      </div>
                    ))}
                  </section>

                  <section className={`border ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-[#314056] bg-[#0a1019]'}`}>
                    <div className={`border-b px-4 py-3 ${theme === 'light' ? 'border-slate-200' : 'border-[#243041]'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold">분류 / 메모</h3>
                        <span className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                          {registryPayload.source} · {isRegistryLoading ? '불러오는 중' : '편집 가능'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3 px-4 py-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="block text-xs">
                          <span className={`mb-1 block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>표시명</span>
                          <input
                            value={selectedRegistry?.displayName ?? ''}
                            onChange={(event) => selected && updateRegistryField(selected.farm, 'displayName', event.target.value)}
                            className={`h-8 w-full border px-3 py-1.5 text-sm outline-none ${inputClass(theme)}`}
                          />
                        </label>
                        <label className="block text-xs">
                          <span className={`mb-1 block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>분류</span>
                          <select
                            value={selectedRegistry?.category ?? 'other'}
                            onChange={(event) => selected && updateRegistryField(selected.farm, 'category', event.target.value as CctvUpFarmCategory)}
                            className={`h-8 w-full border px-3 py-1.5 text-sm outline-none ${inputClass(theme)}`}
                          >
                            {Object.entries(FarmBadgeLabels).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="block text-xs">
                          <span className={`mb-1 block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>태그</span>
                          <input
                            value={joinRegistryList(selectedRegistry?.tags ?? [])}
                            onChange={(event) => selected && updateRegistryField(selected.farm, 'tags', event.target.value)}
                            placeholder="전북, 권역A, 실증"
                            className={`h-8 w-full border px-3 py-1.5 text-sm outline-none ${inputClass(theme)}`}
                          />
                        </label>
                        <label className="block text-xs">
                          <span className={`mb-1 block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>별칭</span>
                          <input
                            value={joinRegistryList(selectedRegistry?.aliases ?? [])}
                            onChange={(event) => selected && updateRegistryField(selected.farm, 'aliases', event.target.value)}
                            placeholder="예전명, 약칭"
                            className={`h-8 w-full border px-3 py-1.5 text-sm outline-none ${inputClass(theme)}`}
                          />
                        </label>
                      </div>

                      <label className="block text-xs">
                        <span className={`mb-1 block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>메모</span>
                        <textarea
                          value={selectedRegistry?.memo ?? ''}
                          onChange={(event) => selected && updateRegistryField(selected.farm, 'memo', event.target.value)}
                          rows={3}
                          placeholder="운영 메모, 확인 포인트"
                          className={`w-full border px-3 py-2 text-sm outline-none ${inputClass(theme)}`}
                        />
                      </label>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => selected && saveRegistryForFarm(selected.farm)}
                          className={`border px-3 py-2 transition ${theme === 'light' ? 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50' : 'border-[#314056] bg-[#0a1019] text-slate-200 hover:bg-white/5'}`}
                        >
                          {isRegistrySaving ? '저장 중' : '저장'}
                        </button>
                        <button
                          type="button"
                          onClick={() => selected && resetRegistryForFarm(selected.farm)}
                          className={`border px-3 py-2 transition ${theme === 'light' ? 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50' : 'border-[#314056] bg-[#0a1019] text-slate-200 hover:bg-white/5'}`}
                        >
                          되돌리기
                        </button>
                        <span className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                          {selectedRegistry?.isActive === false ? '비활성' : '활성'} · {selectedRegistry?.tags?.length ?? 0} tags
                        </span>
                      </div>

                      {registryPayload.source === 'unavailable' ? (
                        <p className={`text-[11px] leading-5 ${theme === 'light' ? 'text-amber-600' : 'text-amber-300'}`}>
                          Supabase registry 테이블이 없거나 읽지 못해 현재는 화면에서 수정만 유지됩니다.
                        </p>
                      ) : null}

                      {registryError ? <p className="text-xs text-red-400">{registryError}</p> : null}
                    </div>
                  </section>

                  <section className={`border ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-[#314056] bg-[#0a1019]'}`}>
                    <div className={`border-b px-4 py-3 ${theme === 'light' ? 'border-slate-200' : 'border-[#243041]'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold">스냅샷 / 히스토리</h3>
                        <span className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                          {historyPayload.source} · run {historyPayload.checkRuns.length} · snapshot {historyPayload.snapshots.length} · incident {historyPayload.incidents.length}
                        </span>
                      </div>
                    </div>
                    <div className={`border-b px-4 py-3 ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-[#243041] bg-[#0a1019]'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] uppercase tracking-[0.16em]">문제로그 · 30일 누적</span>
                        <span className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>{selectedIncidents.length}건</span>
                      </div>
                      <p className={`mt-1 text-xs leading-5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Supabase incident_log에 쌓인 최근 30일 기록을 보여줍니다.
                      </p>
                      {selectedIncidents.length ? (
                        <div className="mt-3 space-y-2">
                          {selectedIncidents.map((incident) => (
                            <div key={incident.id} className={`border px-3 py-2 text-xs leading-5 ${theme === 'light' ? 'border-slate-200 bg-white text-slate-700' : 'border-[#243041] bg-[#0a1019] text-slate-300'}`}>
                              <div className="flex items-center justify-between gap-3">
                                <span className="font-medium">{incident.incidentKind} · {incident.incidentStatus}</span>
                                <span className="tabular-nums">{formatEventTime(incident.lastSeenAt)}</span>
                              </div>
                              <p className="mt-1 line-clamp-2">{incident.message}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={`mt-3 text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          이 카메라의 최근 30일 문제로그가 없습니다.
                        </p>
                      )}
                    </div>
                    <div className="grid gap-px md:grid-cols-2">
                      <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#0f1722]'} p-4`}>
                        <p className={`text-[11px] uppercase tracking-[0.16em] ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>최근 스냅샷</p>
                        {selectedSnapshots.length ? (
                          <div className="mt-3 space-y-2">
                            {selectedSnapshots.map((snapshot) => (
                              <div key={snapshot.id} className={`border px-3 py-2 text-xs leading-5 ${theme === 'light' ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-[#243041] bg-[#0a1019] text-slate-300'}`}>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="font-medium">{snapshot.slotStatus}</span>
                                  <span className="tabular-nums">{formatEventTime(snapshot.snapshotAt)}</span>
                                </div>
                                <p className="mt-1 line-clamp-2">{snapshot.reason}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className={`mt-3 text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            아직 이 카메라의 스냅샷 기록이 없습니다.
                          </p>
                        )}
                      </div>
                      <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#0f1722]'} p-4`}>
                        <p className={`text-[11px] uppercase tracking-[0.16em] ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>최근 인시던트</p>
                        {selectedIncidents.length ? (
                          <div className="mt-3 space-y-2">
                            {selectedIncidents.map((incident) => (
                              <div key={incident.id} className={`border px-3 py-2 text-xs leading-5 ${theme === 'light' ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-[#243041] bg-[#0a1019] text-slate-300'}`}>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="font-medium">{incident.incidentKind} · {incident.incidentStatus}</span>
                                  <span className="tabular-nums">{formatEventTime(incident.lastSeenAt)}</span>
                                </div>
                                <p className="mt-1 line-clamp-2">{incident.message}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className={`mt-3 text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            아직 이 카메라의 인시던트 기록이 없습니다.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`border-t px-4 py-3 text-xs ${theme === 'light' ? 'border-slate-200 text-slate-500' : 'border-[#243041] text-slate-500'}`}>
                      현재 상세는 운영 DB에서 읽은 최신 상태이며, 기록은 별도 Supabase history/incidents에 누적되는 구조다.
                    </div>
                  </section>

                  <section className={`grid gap-px border ${theme === 'light' ? 'border-slate-200 bg-slate-200' : 'border-[#243041] bg-[#243041]'}`}>
                    {alertPolicy.map((line) => (
                      <div key={line} className={`${theme === 'light' ? 'bg-white' : 'bg-[#0a1019]'} px-3 py-3 text-sm leading-6 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                        {line}
                      </div>
                    ))}
                  </section>
                </div>
              </article>
            ) : (
              <article className={`border ${panelBg(theme)}`}>
                <div className={`border-b px-4 py-3 ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-[#243041] bg-[#0a1019]'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">문제 로그</h2>
                      <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                        최근 문제를 먼저 보여주고, 오래된 문제는 아래 장기 문제로 분리합니다.
                      </p>
                    </div>
                    <span className={`text-xs tabular-nums ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      최근 {freshProblemRows.length} · 장기 {chronicProblemRows.length}
                    </span>
                  </div>
                </div>

                <div className={`border-b px-4 py-3 ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-[#243041] bg-[#0f1722]'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold">최근 문제</h3>
                      <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        지금 확인해야 할 항목만 먼저 노출합니다.
                      </p>
                    </div>
                    <span className={`text-xs tabular-nums ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{freshProblemRows.length}개</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead className={theme === 'light' ? 'bg-slate-50 text-slate-500' : 'bg-[#111a27] text-slate-400'}>
                      <tr>
                        {['이름', '상태', '날짜', '메시지'].map((head) => (
                          <th key={head} className={`border-b px-4 py-3 font-medium whitespace-nowrap ${theme === 'light' ? 'border-slate-200' : 'border-[#243041]'}`}>
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {freshProblemRows.length ? (
                        freshProblemRows.map((row) => {
                          const tone = statusTone[row.status];
                          return (
                            <tr
                              key={row.id}
                              onClick={() => setSelectedId(row.id)}
                              className={`cursor-pointer border-b ${theme === 'light' ? 'border-slate-100 hover:bg-slate-50' : 'border-[#1b2636] hover:bg-[#0f1722]'}`}
                            >
                              <td className="px-3 py-2 align-top">
                                <div className="flex min-w-0 items-center gap-2">
                                  <div className="shrink-0 truncate text-[12px] font-medium leading-4">
                                    {row.displayFarmName}
                                  </div>
                                  <div className={`min-w-0 truncate text-[10px] leading-4 ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                                    {row.displayHouseName} / {row.displayCameraName} ({row.farm} / {row.house} / {row.camera})
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap align-top">
                                <span className="inline-flex items-center gap-1 text-[10px] leading-4">
                                  <span className={`h-2 w-2 rounded-full ${tone.dot}`} title={tone.label} aria-label={tone.label} />
                                  <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>{tone.label}</span>
                                </span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap align-top tabular-nums text-[11px] leading-4" title={row.latestAtIso || row.latestAt}>
                                {formatEventTime(row.latestAtIso || row.latestAt)}
                              </td>
                              <td className="px-3 py-2 align-top">
                                <div className="max-w-[240px] text-[11px] leading-4 text-slate-200">{row.reason}</div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className={`px-4 py-10 text-center text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            최근 확인할 문제는 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {chronicProblemRows.length ? (
                  <details className={`border-t ${theme === 'light' ? 'border-slate-200 bg-slate-50/70' : 'border-[#243041] bg-[#0a1019]'}`}>
                    <summary className={`cursor-pointer list-none px-4 py-3 text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>
                      장기 문제 보기 <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>({chronicProblemRows.length}개)</span>
                    </summary>
                    <div className="overflow-x-auto border-t">
                      <table className="min-w-full border-collapse text-left text-sm">
                        <thead className={theme === 'light' ? 'bg-slate-50 text-slate-500' : 'bg-[#111a27] text-slate-400'}>
                          <tr>
                            {['이름', '상태', '날짜', '메시지'].map((head) => (
                              <th key={head} className={`border-b px-4 py-3 font-medium whitespace-nowrap ${theme === 'light' ? 'border-slate-200' : 'border-[#243041]'}`}>
                                {head}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {chronicProblemRows.map((row) => {
                            const tone = statusTone[row.status];
                            return (
                              <tr
                                key={row.id}
                                onClick={() => setSelectedId(row.id)}
                                className={`cursor-pointer border-b ${theme === 'light' ? 'border-slate-100 hover:bg-slate-50' : 'border-[#1b2636] hover:bg-[#0f1722]'}`}
                              >
                                <td className="px-3 py-2 align-top">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <div className="shrink-0 truncate text-[12px] font-medium leading-4">
                                      {row.displayFarmName}
                                    </div>
                                    <div className={`min-w-0 truncate text-[10px] leading-4 ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                                      {row.displayHouseName} / {row.displayCameraName} ({row.farm} / {row.house} / {row.camera})
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap align-top">
                                  <span className="inline-flex items-center gap-1 text-[10px] leading-4">
                                    <span className={`h-2 w-2 rounded-full ${tone.dot}`} title={tone.label} aria-label={tone.label} />
                                    <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>{tone.label}</span>
                                  </span>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap align-top tabular-nums text-[11px] leading-4" title={row.latestAtIso || row.latestAt}>
                                  {formatEventTime(row.latestAtIso || row.latestAt)}
                                </td>
                                <td className="px-3 py-2 align-top">
                                  <div className="max-w-[240px] text-[11px] leading-4 text-slate-200">{row.reason}</div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </details>
                ) : null}
              </article>
            )}
          </aside>

        </section>
      </main>
    </div>
  );
}
