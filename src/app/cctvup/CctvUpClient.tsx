'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { type CctvUpCheckRun, type CctvUpIssueEventKind, type CctvUpMonitorScopeCode, type CctvUpPayload, type CctvUpRow, type CctvUpSlotStatus, type CctvUpStatus, minutesBetween } from '@/lib/cctvup';
import { type CctvUpAnalysisPayload, type CctvUpAnalysisStatus } from '@/lib/cctvup-analysis';
import { type CctvUpHistoryPayload } from '@/lib/cctvup-history';
import { type CctvUpSupabaseDiagnosePayload, type CctvUpSupabaseDiagnoseStep } from '@/lib/cctvup-supabase-diagnose';
import {
  type CctvUpFarmCategory,
  type CctvUpFarmRegistryEntry,
  type CctvUpFarmRegistryPayload,
  joinRegistryList,
  normalizeCctvUpFarmCategory,
  normalizeCctvUpFarmCategorySource,
  splitRegistryList,
} from '@/lib/cctvup-registry';
import { buildCctvUpFarmGroups, compareCctvUpFarmGroups } from '@/lib/cctvup-farm-groups';

type ThemeMode = 'dark' | 'light';
type CameraStatus = CctvUpStatus;
type MonitorFilter = 'all' | 'ok' | 'issue';
type FarmSortMode = 'issue' | 'severity' | 'category' | 'name';
type InputReadinessTone = 'ok' | 'watch' | 'blocked' | 'pending';
type StatusSummaryTone = 'ok' | 'late' | 'missing' | 'critical';
type PredictionInputDiagnostic = {
  step: number;
  label: string;
  value: string;
  meta: string;
  tone: InputReadinessTone;
  evidence: Array<{ label: string; value: string }>;
  judgement: string;
  description: string;
};
type AnalysisLoadState = {
  payload: CctvUpAnalysisPayload | null;
  isLoading: boolean;
  error: string;
};
type SupabaseDiagnoseState = {
  payload: CctvUpSupabaseDiagnosePayload | null;
  isLoading: boolean;
  error: string;
};
type ManualCheckPayload = {
  ok?: boolean;
  message?: string;
  checkedAt?: string;
  source?: string;
  runId?: string;
  snapshotCount?: number;
  incidentCount?: number;
  currentIssueCount?: number;
  resolvedIssueCount?: number;
  stateCount?: number;
  eventCount?: number;
  openedCount?: number;
  recoveringCount?: number;
  resolvedCount?: number;
};
type ManualCheckState = {
  payload: ManualCheckPayload | null;
  isLoading: boolean;
  error: string;
  lastRanAt: string;
};
type CheckLoopHealth = {
  label: string;
  tone: InputReadinessTone;
  detail: string;
  meta: string;
};

type DisplayRow = CctvUpRow & {
  displayFarmName: string;
  displayHouseName: string;
  displayCameraName: string;
  displayCategory: CctvUpFarmCategory;
  displayTags: string[];
  displayMemo?: string;
};

type FarmGroup = ReturnType<typeof buildCctvUpFarmGroups>[number];

function getFarmGroupMonitorScope(group: FarmGroup): CctvUpMonitorScopeCode {
  const scopes = new Set(group.rows.map((row: DisplayRow) => row.monitorScopeCode ?? 'active'));
  if (scopes.has('active')) return 'active';
  if (scopes.has('needs_review')) return 'needs_review';
  if (scopes.has('resting')) return 'resting';
  return 'uninstalled';
}

const REGISTRY_EMPTY_ENTRY = (): CctvUpFarmRegistryEntry => ({
  farmId: '',
  displayName: '',
  category: 'other',
  categorySource: 'legacy',
  tags: [],
  memo: '',
  aliases: [],
  isActive: true,
});

const initialRegistryState: CctvUpFarmRegistryPayload = {
  source: 'unavailable',
  items: [],
};

const LOCAL_REGISTRY_STORAGE_KEY = 'cctvup-local-registry';

const FarmBadgeLabels: Record<CctvUpFarmCategory, string> = {
  overseas: '해외',
  shinwoo: '신우',
  cheriburo: '체리부로',
  other: '기타',
};

const FarmCategoryOptions = Object.entries(FarmBadgeLabels) as Array<[CctvUpFarmCategory, string]>;
const INITIAL_FARM_CATEGORY_FILTERS: Record<CctvUpFarmCategory, boolean> = {
  overseas: true,
  shinwoo: true,
  cheriburo: true,
  other: true,
};
const MonitorScopeLabels: Record<CctvUpMonitorScopeCode, string> = {
  active: '감시중',
  resting: '휴지기',
  needs_review: '대상확인',
  uninstalled: '미설치',
};
const MonitorScopeOptions = Object.entries(MonitorScopeLabels) as Array<[CctvUpMonitorScopeCode, string]>;
const INITIAL_MONITOR_SCOPE_FILTERS: Record<CctvUpMonitorScopeCode, boolean> = {
  active: true,
  resting: true,
  needs_review: true,
  uninstalled: true,
};

const statusTone: Record<CameraStatus, { label: string; badge: string; dot: string }> = {
  ok: { label: '정상', badge: 'border-sky-500/30 bg-sky-500/10 text-sky-200', dot: 'bg-sky-400' },
  late: { label: '관찰중', badge: 'border-amber-500/30 bg-amber-500/10 text-amber-100', dot: 'bg-amber-400' },
  missing: { label: '회복중', badge: 'border-amber-500/30 bg-amber-500/10 text-amber-100', dot: 'bg-amber-300' },
  critical: { label: '문제확정', badge: 'border-red-500/30 bg-red-500/10 text-red-200', dot: 'bg-red-400' },
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
  '5분 주기 체크에서 7분 이내 최신 이미지가 있으면 정상으로 본다.',
  '1~2회 미수집은 관찰중으로 두고 문제 로그를 남기지 않는다.',
  '3회 연속, 약 15분 동안 새 이미지가 없을 때 문제확정으로 issue event를 남긴다.',
  '문제확정 후 이미지가 다시 들어오면 회복중으로 두고, 최근 12칸이 정상으로 밀려 채워질 때 해결 처리한다.',
];

function inputReadinessToneClass(theme: ThemeMode, tone: InputReadinessTone) {
  if (tone === 'ok') {
    return theme === 'light'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100';
  }
  if (tone === 'watch') {
    return theme === 'light'
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : 'border-amber-500/25 bg-amber-500/10 text-amber-100';
  }
  if (tone === 'blocked') {
    return theme === 'light'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-red-500/25 bg-red-500/10 text-red-100';
  }
  return theme === 'light'
    ? 'border-slate-200 bg-slate-50 text-slate-600'
    : 'border-slate-500/25 bg-slate-500/10 text-slate-300';
}

function getImageInputTone(status: CameraStatus): InputReadinessTone {
  if (status === 'ok') return 'ok';
  if (status === 'critical') return 'blocked';
  if (status === 'late' || status === 'missing') return 'watch';
  return 'pending';
}

function getOperationalReadiness(row: DisplayRow, analysis?: CctvUpAnalysisPayload | null) {
  if (row.status === 'critical') {
    return {
      value: '불가',
      tone: 'blocked' as const,
      description: '15분 이상 이미지 입력이 비어 중량예측 입력으로 쓰기 어렵습니다.',
    };
  }
  if (row.status === 'late') {
    return {
      value: '관찰 필요',
      tone: 'watch' as const,
      description: '1~2회 미수집 구간이라 확정 문제 전까지 수신 재개 여부를 봅니다.',
    };
  }
  if (row.status === 'missing') {
    return {
      value: '제한적',
      tone: 'watch' as const,
      description: '이미지는 재수신됐지만 최근 1시간 슬롯에 문제 흔적이 남아 있습니다.',
    };
  }
  if (row.status === 'paused') {
    return {
      value: '점검제외',
      tone: 'pending' as const,
      description: '감시 제외 상태라 중량예측 입력 판단에서도 제외합니다.',
    };
  }

  if (analysis?.analysisStatus === 'ok') {
    return {
      value: '수신+분석 기준 가능',
      tone: 'ok' as const,
      description: '이미지 수신과 최근 분석 결과 기준으로는 입력 공백이 없습니다.',
    };
  }

  if (analysis?.analysisStatus === 'missing') {
    return {
      value: '분석 기준 불가',
      tone: 'blocked' as const,
      description: '이미지는 있으나 최근 분석 결과가 없어 중량예측 결과 생성 여부를 확인해야 합니다.',
    };
  }

  if (analysis?.analysisStatus === 'abnormal') {
    return {
      value: '제한적',
      tone: 'blocked' as const,
      description: '분석 결과가 생성됐지만 최근 상태가 정상 success가 아니라 운영 판단에 쓰기 어렵습니다.',
    };
  }

  if (analysis?.analysisStatus === 'late') {
    return {
      value: '관찰 필요',
      tone: 'watch' as const,
      description: '이미지 수신 대비 분석 결과가 늦어지고 있어 분석 파이프라인 지연을 봐야 합니다.',
    };
  }

  return {
    value: '수신 기준 가능',
    tone: 'ok' as const,
    description: '이미지 수신 기준으로는 중량예측 입력 공백이 없습니다.',
  };
}

function summarizeRecentSlots(slots: CctvUpSlotStatus[]) {
  const okCount = slots.filter((slot) => slot === 'ok').length;
  const issueCount = slots.filter((slot) => slot === 'late' || slot === 'missing').length;
  const pausedCount = slots.filter((slot) => slot === 'paused').length;
  return `정상 ${okCount}/12 · 문제 ${issueCount}/12${pausedCount ? ` · 제외 ${pausedCount}/12` : ''}`;
}

function formatMinuteValue(value?: number | null) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-';
  return `${value}분`;
}

function getAnalysisTone(status?: CctvUpAnalysisStatus): InputReadinessTone {
  if (status === 'ok') return 'ok';
  if (status === 'abnormal') return 'blocked';
  if (status === 'late' || status === 'missing') return 'watch';
  return 'pending';
}

function formatAnalysisStatusBreakdown(analysis: CctvUpAnalysisPayload) {
  const latestStatuses = analysis.records
    .slice(0, 5)
    .map((record) => record.status)
    .join(' / ');
  return latestStatuses || '최근 기록 없음';
}

function buildAnalysisDiagnostic(analysisState: AnalysisLoadState): PredictionInputDiagnostic {
  const analysis = analysisState.payload;

  if (analysisState.isLoading) {
    return {
      step: 2,
      label: '분석 결과',
      value: '조회 중',
      meta: 'Phase 3 실제 조회',
      tone: 'pending',
      evidence: [
        { label: '데이터 소스', value: 'tbl_farm_image_analysis_weight_v2' },
        { label: '조회 범위', value: '선택 카메라 최근 2시간' },
        { label: '저장 여부', value: '읽기 전용, Supabase 미저장' },
      ],
      judgement: '선택한 카메라의 중량 분석 결과를 조회하고 있습니다.',
      description: '분석 조회는 전체 목록이 아니라 선택 카메라 상세에서만 수행합니다.',
    };
  }

  if (!analysis || analysisState.error || analysis.source === 'unavailable') {
    const message = analysisState.error || analysis?.message || '분석 결과를 조회하지 못했습니다.';
    return {
      step: 2,
      label: '분석 결과',
      value: '확인 불가',
      meta: '조회 실패',
      tone: 'pending',
      evidence: [
        { label: '데이터 소스', value: 'tbl_farm_image_analysis_weight_v2' },
        { label: '오류', value: message },
        { label: '저장 여부', value: '읽기 전용, Supabase 미저장' },
      ],
      judgement: '분석 테이블을 읽지 못해 이미지 수신과 분석 파이프라인을 분리 판단할 수 없습니다.',
      description: '원본 DB 쓰기는 하지 않으며, 실패 시 이미지 수신 상태는 기존 기준대로 유지합니다.',
    };
  }

  const latest = analysis.records[0];
  return {
    step: 2,
    label: '분석 결과',
    value: analysis.statusLabel,
    meta: '실제 판정',
    tone: getAnalysisTone(analysis.analysisStatus),
    evidence: [
      { label: '데이터 소스', value: analysis.table },
      { label: '조회 범위', value: `최근 ${analysis.windowHours}시간 · ${analysis.recordCount}건` },
      { label: '최근 분석', value: analysis.latestAnalysisAt ? formatEventTime(analysis.latestAnalysisAt) : '최근 기록 없음' },
      { label: '분석 지연', value: formatMinuteValue(analysis.analysisAgeMinutes) },
      { label: '이미지-분석 차이', value: formatMinuteValue(analysis.imageAnalysisLagMinutes) },
      { label: '최근 상태', value: analysis.latestAnalysisStatus || '-' },
      { label: '상태 흐름', value: formatAnalysisStatusBreakdown(analysis) },
      { label: 'success / 비정상', value: `${analysis.successCount} / ${analysis.abnormalCount}` },
      { label: '분석 개체 수', value: latest?.predictionCount ?? '-' },
      { label: '모델 원천값', value: latest?.modelWeight === null || latest?.modelWeight === undefined ? '-' : `${latest.modelWeight}g` },
    ],
    judgement: analysis.message,
    description: '분석 결과는 이미지 수신 여부와 분리해 판단하며, 5분 raw 값은 운영 최종 중량으로 표시하지 않습니다.',
  };
}

function buildPredictionInputDiagnostics(row: DisplayRow, analysisState: AnalysisLoadState): PredictionInputDiagnostic[] {
  const imageTone = getImageInputTone(row.status);
  const operationalReadiness = getOperationalReadiness(row, analysisState.payload);
  const missCount = row.missCount ?? row.consecutiveMiss;
  const latestReceived = row.latestAtIso ? formatEventTime(row.latestAtIso) : '수신 이력 없음';
  const delayLabel = row.ageMinutes >= 999 ? '확인 불가' : `${row.ageMinutes}분`;
  const lastChecked = row.lastCheckedAt ? formatEventTime(row.lastCheckedAt) : '-';
  const firstMissed = row.firstMissedAt ? formatEventTime(row.firstMissedAt) : '-';
  const openedAt = row.openedAt ? formatEventTime(row.openedAt) : '-';

  return [
    {
      step: 1,
      label: '이미지 수신',
      value: row.stateLabel ?? statusTone[row.status].label,
      meta: '실제 판정',
      tone: imageTone,
      evidence: [
        { label: '최근 수신', value: latestReceived },
        { label: '지연 시간', value: delayLabel },
        { label: '미수집 카운트', value: `${missCount}/3` },
        { label: '최근 1시간', value: `${row.rate1h} · ${summarizeRecentSlots(row.slots)}` },
        { label: '마지막 체크', value: lastChecked },
        { label: '최초 미수집', value: firstMissed },
        { label: '문제 확정', value: openedAt },
      ],
      judgement: row.stateMessage || row.reason,
      description: '5분 이미지 수신 여부는 현재 CCTVUP의 1차 판정 기준입니다.',
    },
    buildAnalysisDiagnostic(analysisState),
    {
      step: 3,
      label: '카메라 보정',
      value: '확인 필요',
      meta: '데이터 미연동',
      tone: 'pending' as const,
      evidence: [
        { label: 'A4 calibration', value: '미연동' },
        { label: 'Pixel resolution', value: '미연동' },
        { label: 'Correction ratio', value: '미연동' },
      ],
      judgement: '보정 신뢰도는 아직 운영 판단 근거로 쓰지 않습니다.',
      description: 'A4 calibration, pixel resolution, correction ratio는 실제 데이터 위치와 카메라 키 매칭 확인 후 붙입니다.',
    },
    {
      step: 4,
      label: '예측 안정성',
      value: '미연동',
      meta: '1시간 대표값 전',
      tone: 'pending' as const,
      evidence: [
        { label: '5분 raw 예측값', value: '표시 안 함' },
        { label: '1시간 대표 중량', value: '미연동' },
        { label: '안정성 판단', value: '데이터 연결 전' },
      ],
      judgement: '현재 화면에서는 예측값 흔들림이나 대표값 생성 여부를 판정하지 않습니다.',
      description: '5분 raw 예측값은 운영 판단값이 아니며, 1시간 대표값 기준은 후속 단계에서 분리합니다.',
    },
    {
      step: 5,
      label: '운영 판단',
      value: operationalReadiness.value,
      meta: '이미지 입력 기준',
      tone: operationalReadiness.tone,
      evidence: [
        { label: '현재 수신 상태', value: row.stateLabel ?? statusTone[row.status].label },
        { label: '입력 공백', value: row.status === 'paused' ? '점검제외' : row.status === 'critical' ? '확정' : row.status === 'late' || row.status === 'missing' ? '주의' : '없음' },
        { label: '분석 상태', value: analysisState.payload?.statusLabel ?? (analysisState.isLoading ? '조회 중' : '확인 전') },
        { label: '판단 범위', value: analysisState.payload?.source === 'db' ? '이미지 입력 + 분석 결과' : '이미지 입력 기준' },
      ],
      judgement: operationalReadiness.description,
      description: '보정 상태와 예측 안정성을 포함한 최종 AI 신뢰도 판단은 아직 하지 않습니다.',
    },
  ];
}

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

function CollapseToggle({
  isOpen,
  label,
  onClick,
  theme,
}: {
  isOpen: boolean;
  label: string;
  onClick: () => void;
  theme: ThemeMode;
}) {
  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-label={`${label} ${isOpen ? '접기' : '펼치기'}`}
      onClick={onClick}
      className={`shrink-0 border px-2 py-1 text-xs font-semibold transition ${
        theme === 'light'
          ? 'border-slate-300 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50'
          : 'border-[#314056] bg-[#0a1019] text-slate-200 hover:border-[#4D7CFF] hover:bg-[#111a27]'
      }`}
    >
      {isOpen ? '접기' : '펼치기'}
    </button>
  );
}

function softBg(theme: ThemeMode) {
  return theme === 'light' ? 'bg-[#f1f5f9]' : 'bg-[#0a1019]';
}

function inputClass(theme: ThemeMode) {
  return theme === 'light'
    ? 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-sky-500'
    : 'border-[#314056] bg-[#0a1019] text-slate-100 placeholder:text-slate-500 focus:border-[#4D7CFF]';
}

function stateSyncPillClass(theme: ThemeMode, status?: NonNullable<CctvUpPayload['stateSync']>['status']) {
  if (status === 'applied') {
    return theme === 'light'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100';
  }
  if (status === 'unavailable') {
    return theme === 'light'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-red-500/25 bg-red-500/10 text-red-100';
  }
  return theme === 'light'
    ? 'border-slate-200 bg-slate-50 text-slate-600'
    : 'border-slate-500/25 bg-slate-500/10 text-slate-300';
}

function formatStateSyncLabel(stateSync?: CctvUpPayload['stateSync']) {
  if (!stateSync) return '상태머신 확인 전';
  if (stateSync.status === 'applied') return `상태머신 반영 · 활성 ${stateSync.stateCount}건`;
  if (stateSync.status === 'unavailable') return '상태머신 미반영';
  return '상태머신 미설정';
}

function supabaseDiagnosePillClass(theme: ThemeMode, state: SupabaseDiagnoseState) {
  if (state.isLoading) {
    return theme === 'light'
      ? 'border-sky-200 bg-sky-50 text-sky-700'
      : 'border-sky-500/25 bg-sky-500/10 text-sky-100';
  }
  if (state.payload?.ok) {
    return theme === 'light'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100';
  }
  return theme === 'light'
    ? 'border-red-200 bg-red-50 text-red-700'
    : 'border-red-500/25 bg-red-500/10 text-red-100';
}

function formatSupabaseDiagnoseLabel(state: SupabaseDiagnoseState) {
  if (state.isLoading) return 'Supabase 진단 중';
  if (state.payload?.ok) return 'Supabase 정상';
  return 'Supabase 확인 필요';
}

function getDiagnoseStep(payload: CctvUpSupabaseDiagnosePayload | null, name: string) {
  return payload?.steps.find((step) => step.name === name);
}

function formatDiagnoseStepMs(step?: CctvUpSupabaseDiagnoseStep) {
  if (!step) return '-';
  if (!step.ok) return '실패';
  return `${step.elapsedMs}ms`;
}

function formatDiagnoseFailure(payload: CctvUpSupabaseDiagnosePayload | null, error: string) {
  if (error) return error;
  const failed = payload?.steps.find((step) => !step.ok);
  if (!failed) return payload?.message ?? '';
  return `${failed.name}: ${failed.error?.message ?? '진단 실패'}`;
}

function manualCheckPillClass(theme: ThemeMode, state: ManualCheckState) {
  if (state.isLoading) {
    return theme === 'light'
      ? 'border-sky-200 bg-sky-50 text-sky-700'
      : 'border-sky-500/25 bg-sky-500/10 text-sky-100';
  }
  if (state.payload?.ok) {
    return theme === 'light'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100';
  }
  return theme === 'light'
    ? 'border-red-200 bg-red-50 text-red-700'
    : 'border-red-500/25 bg-red-500/10 text-red-100';
}

function formatManualCheckLabel(state: ManualCheckState) {
  if (state.isLoading) return '체크 실행 중';
  if (state.payload?.ok) return '체크 완료';
  return '체크 확인 필요';
}

function formatManualCheckMessage(state: ManualCheckState) {
  if (state.isLoading) return '원본 DB를 읽고 Supabase 상태머신에 반영하는 중입니다.';
  if (state.error) return state.error;
  if (!state.payload) return '';
  const eventCount = state.payload.eventCount ?? 0;
  const stateCount = state.payload.stateCount ?? 0;
  const openedCount = state.payload.openedCount ?? 0;
  const recoveringCount = state.payload.recoveringCount ?? 0;
  const resolvedCount = state.payload.resolvedCount ?? 0;
  return `state ${stateCount}건 · event ${eventCount}건 · opened ${openedCount} · recovering ${recoveringCount} · resolved ${resolvedCount}`;
}

function getCheckLoopHealth(latestRun: CctvUpCheckRun | undefined, isHistoryLoading: boolean, historySource: CctvUpHistoryPayload['source']): CheckLoopHealth {
  if (isHistoryLoading) {
    return {
      label: '자동 체크 동기화 중',
      tone: 'pending',
      detail: 'history 조회 중',
      meta: '최근 실행 확인 중',
    };
  }

  if (historySource === 'unavailable') {
    return {
      label: '자동 체크 확인 불가',
      tone: 'blocked',
      detail: 'Supabase history 미응답',
      meta: '진단 필요',
    };
  }

  if (!latestRun) {
    return {
      label: '자동 체크 없음',
      tone: 'blocked',
      detail: 'check run 기록 없음',
      meta: 'launchd 확인 필요',
    };
  }

  const ageMinutes = minutesBetween(new Date(), latestRun.checkedAt);
  const sourceLabel = latestRun.source === 'db' ? '운영 DB' : latestRun.source;

  if (latestRun.source !== 'db') {
    return {
      label: '자동 체크 소스 이상',
      tone: 'blocked',
      detail: `${sourceLabel} 기준`,
      meta: `${ageMinutes}분 전`,
    };
  }

  if (ageMinutes >= 15) {
    return {
      label: '자동 체크 멈춤 의심',
      tone: 'blocked',
      detail: `${ageMinutes}분 전 실행`,
      meta: '5분 루프 확인 필요',
    };
  }

  if (ageMinutes >= 10) {
    return {
      label: '자동 체크 지연 주의',
      tone: 'watch',
      detail: `${ageMinutes}분 전 실행`,
      meta: '다음 run 대기',
    };
  }

  return {
    label: '자동 체크 정상',
    tone: 'ok',
    detail: `${ageMinutes}분 전 실행`,
    meta: `카메라 ${latestRun.cameraCount}대`,
  };
}

function getCurrentSourceHealth(payload: CctvUpPayload, isLoading: boolean, loadError: string): CheckLoopHealth {
  if (isLoading) {
    return {
      label: '현재 목록 조회 중',
      tone: 'pending',
      detail: '운영 DB live 조회',
      meta: '대기',
    };
  }

  if (loadError || payload.source === 'unavailable') {
    return {
      label: '현재 목록 확인 필요',
      tone: 'blocked',
      detail: loadError || payload.message || '운영 DB 조회 실패',
      meta: payload.source,
    };
  }

  if (payload.source === 'db') {
    return {
      label: '현재 목록 정상',
      tone: 'ok',
      detail: `농장 ${payload.summary.farms}개 · 카메라 ${payload.summary.cameras}대`,
      meta: `조회 ${formatClock(payload.checkedAt)}`,
    };
  }

  return {
    label: '현재 목록 임시값',
    tone: 'watch',
    detail: payload.message || 'mock/fallback 기준',
    meta: payload.source,
  };
}

function getStateMachineHealth(stateSync?: CctvUpPayload['stateSync']): CheckLoopHealth {
  if (!stateSync) {
    return {
      label: '상태머신 확인 전',
      tone: 'pending',
      detail: 'camera_state 미확인',
      meta: '대기',
    };
  }

  if (stateSync.status === 'applied') {
    return {
      label: '상태머신 반영',
      tone: 'ok',
      detail: `활성 ${stateSync.stateCount}건`,
      meta: `timeout ${stateSync.timeoutMs}ms`,
    };
  }

  if (stateSync.status === 'unavailable') {
    return {
      label: '상태머신 미반영',
      tone: 'blocked',
      detail: stateSync.message,
      meta: `timeout ${stateSync.timeoutMs}ms`,
    };
  }

  return {
    label: '상태머신 비활성',
    tone: 'pending',
    detail: stateSync.message,
    meta: stateSync.status,
  };
}

function getHistoryHealth(historyPayload: CctvUpHistoryPayload, isHistoryLoading: boolean): CheckLoopHealth {
  if (isHistoryLoading) {
    return {
      label: '히스토리 조회 중',
      tone: 'pending',
      detail: 'check_runs / issue_events',
      meta: '대기',
    };
  }

  if (historyPayload.source === 'unavailable') {
    return {
      label: '히스토리 확인 필요',
      tone: 'blocked',
      detail: historyPayload.message || 'Supabase history 미응답',
      meta: '보조 정보 지연',
    };
  }

  if (historyPayload.message) {
    return {
      label: '히스토리 부분 지연',
      tone: 'watch',
      detail: historyPayload.message,
      meta: `run ${historyPayload.checkRuns.length}건`,
    };
  }

  return {
    label: '히스토리 정상',
    tone: 'ok',
    detail: `run ${historyPayload.checkRuns.length}건 · event ${historyPayload.issueEvents?.length ?? 0}건`,
    meta: historyPayload.source,
  };
}

function formatCheckRunGap(minutes?: number | null) {
  if (minutes === null || minutes === undefined || !Number.isFinite(minutes)) return '기준';
  if (minutes < 1) return `${Math.round(minutes * 60)}초`;
  return `${minutes.toFixed(1)}분`;
}

function getCheckRunCadence(current: CctvUpCheckRun, previous?: CctvUpCheckRun): CheckLoopHealth {
  if (!previous) {
    return {
      label: '기준 run',
      tone: 'pending',
      detail: '이전 run 없음',
      meta: '간격 기준점',
    };
  }

  const currentTime = new Date(current.checkedAt).getTime();
  const previousTime = new Date(previous.checkedAt).getTime();
  const gapMinutes = (currentTime - previousTime) / 60000;
  const gapLabel = formatCheckRunGap(gapMinutes);

  if (!Number.isFinite(gapMinutes) || gapMinutes < 0) {
    return {
      label: '간격 확인 필요',
      tone: 'watch',
      detail: `간격 ${gapLabel}`,
      meta: '시간값 확인',
    };
  }

  if (gapMinutes < 4) {
    return {
      label: '수동/재기동 추정',
      tone: 'pending',
      detail: `간격 ${gapLabel}`,
      meta: 'kickstart 또는 RunAtLoad',
    };
  }

  if (gapMinutes > 7) {
    return {
      label: '루프 지연',
      tone: 'watch',
      detail: `간격 ${gapLabel}`,
      meta: '5분 초과',
    };
  }

  return {
    label: '정상 루프',
    tone: 'ok',
    detail: `간격 ${gapLabel}`,
    meta: '5분 스케줄',
  };
}

function getCheckRunCadenceBadgeLabel(cadence: CheckLoopHealth) {
  if (cadence.label.includes('정상')) return '정상';
  if (cadence.label.includes('수동')) return '수동';
  if (cadence.label.includes('지연')) return '지연';
  if (cadence.label.includes('기준')) return '기준';
  return '확인';
}

function checkRunCadenceBadgeClass(theme: ThemeMode, cadence: CheckLoopHealth) {
  const label = getCheckRunCadenceBadgeLabel(cadence);

  if (label === '정상') {
    return theme === 'light'
      ? 'border-emerald-600 bg-emerald-500 text-white'
      : 'border-emerald-400 bg-emerald-500 text-white';
  }

  if (label === '수동') {
    return theme === 'light'
      ? 'border-sky-600 bg-sky-500 text-white'
      : 'border-sky-400 bg-sky-500 text-white';
  }

  if (label === '지연') {
    return theme === 'light'
      ? 'border-orange-600 bg-orange-500 text-white'
      : 'border-orange-400 bg-orange-500 text-white';
  }

  if (label === '기준') {
    return theme === 'light'
      ? 'border-indigo-600 bg-indigo-500 text-white'
      : 'border-indigo-400 bg-indigo-500 text-white';
  }

  return theme === 'light'
    ? 'border-fuchsia-600 bg-fuchsia-500 text-white'
    : 'border-fuchsia-400 bg-fuchsia-500 text-white';
}

function statusSummaryBadgeClass(theme: ThemeMode, tone: StatusSummaryTone) {
  if (tone === 'ok') {
    return theme === 'light'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100';
  }

  if (tone === 'late') {
    return theme === 'light'
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : 'border-amber-500/25 bg-amber-500/10 text-amber-100';
  }

  if (tone === 'missing') {
    return theme === 'light'
      ? 'border-sky-200 bg-sky-50 text-sky-800'
      : 'border-sky-500/25 bg-sky-500/10 text-sky-100';
  }

  return theme === 'light'
    ? 'border-red-200 bg-red-50 text-red-700'
    : 'border-red-500/25 bg-red-500/10 text-red-100';
}

function HealthStatusTile({ title, health, theme }: { title: string; health: CheckLoopHealth; theme: ThemeMode }) {
  return (
    <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#0f1722]'} px-4 py-3`}>
      <div className="flex items-center justify-between gap-3">
        <p className={`text-[11px] uppercase tracking-[0.16em] ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>{title}</p>
        <span className={`inline-flex shrink-0 border px-2 py-0.5 text-[10px] font-semibold ${inputReadinessToneClass(theme, health.tone)}`}>
          {health.label}
        </span>
      </div>
      <p className={`mt-2 truncate text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`} title={health.detail}>
        {health.detail}
      </p>
      <p className={`mt-1 text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>{health.meta}</p>
    </div>
  );
}

function formatIssueEventKind(kind: CctvUpIssueEventKind) {
  if (kind === 'opened') return '문제확정';
  if (kind === 'reopened') return '재확정';
  if (kind === 'recovering') return '회복중';
  return '해결';
}

function issueEventToneClass(theme: ThemeMode, kind: CctvUpIssueEventKind) {
  if (kind === 'resolved') {
    return theme === 'light'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100';
  }
  if (kind === 'recovering') {
    return theme === 'light'
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : 'border-amber-500/25 bg-amber-500/10 text-amber-100';
  }
  return theme === 'light'
    ? 'border-red-200 bg-red-50 text-red-700'
    : 'border-red-500/25 bg-red-500/10 text-red-100';
}

function cleanName(value: string) {
  return value.trim();
}

function classifyFarmBadge(row: Pick<CctvUpRow, 'farmName' | 'farmAlias' | 'farmAffiliates' | 'country'> & { displayFarmName?: string }) {
  const affiliates = row.farmAffiliates?.trim().toLowerCase() || '';
  const country = row.country?.trim().toUpperCase() || '';
  if (/cherry|체리/.test(affiliates)) return 'cheriburo' as const;
  if (/shinwoo|신우/.test(affiliates)) return 'shinwoo' as const;
  if (country && country !== 'KR') return 'overseas' as const;
  if (/taiwan|indonesia|madagascar|cpgroup|prifoods|laos|overseas|global/.test(affiliates)) return 'overseas' as const;

  const text = [row.farmName, row.displayFarmName, row.farmAlias].filter(Boolean).join(' ');
  const compact = text.replace(/\s+/g, '');
  if (/체리부로/i.test(text)) return 'cheriburo' as const;
  if (/신우/i.test(text)) return 'shinwoo' as const;
  if (/해외/i.test(text)) return 'overseas' as const;
  if (/체리/.test(compact)) return 'cheriburo' as const;
  const hasHangul = /[가-힣]/.test(text);
  const hasLatin = /[A-Za-z]/.test(text);
  const hasCjk = /[\u3400-\u9fff]/.test(text);
  if (!hasHangul && (hasLatin || hasCjk)) return 'overseas' as const;
  return 'other' as const;
}

function farmCategoryButtonClass(theme: ThemeMode, category: CctvUpFarmCategory, isActive: boolean) {
  if (isActive) {
    if (category === 'overseas') return theme === 'light'
      ? 'border-amber-300 bg-amber-50 text-amber-800'
      : 'border-amber-500/25 bg-amber-500/10 text-amber-100';
    if (category === 'shinwoo') return theme === 'light'
      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
      : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100';
    if (category === 'cheriburo') return theme === 'light'
      ? 'border-violet-300 bg-violet-50 text-violet-800'
      : 'border-violet-500/25 bg-violet-500/10 text-violet-100';
    return theme === 'light'
      ? 'border-slate-300 bg-slate-50 text-slate-700'
      : 'border-slate-500/30 bg-slate-500/10 text-slate-200';
  }

  return theme === 'light'
    ? 'border-transparent bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50'
    : 'border-transparent bg-[#0a1019] text-slate-300 hover:border-[#314056] hover:bg-white/5';
}

function farmCategoryMarkerClass(category: CctvUpFarmCategory) {
  if (category === 'overseas') return 'bg-amber-400';
  if (category === 'shinwoo') return 'bg-emerald-400';
  if (category === 'cheriburo') return 'bg-violet-400';
  return 'bg-slate-400';
}

function farmCategoryFilterButtonClass(theme: ThemeMode, category: CctvUpFarmCategory, isActive: boolean) {
  if (isActive) return farmCategoryButtonClass(theme, category, true);
  return theme === 'light'
    ? 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'
    : 'border-[#243041] bg-[#0a1019] text-slate-500 hover:border-[#314056] hover:text-slate-300';
}

function monitorScopeBadgeClass(theme: ThemeMode, scope: CctvUpMonitorScopeCode, isActive = true) {
  if (!isActive) {
    return theme === 'light'
      ? 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'
      : 'border-[#243041] bg-[#0a1019] text-slate-500 hover:border-[#314056] hover:text-slate-300';
  }
  if (scope === 'active') {
    return theme === 'light'
      ? 'border-sky-300 bg-sky-50 text-sky-800'
      : 'border-sky-500/25 bg-sky-500/10 text-sky-100';
  }
  if (scope === 'resting') {
    return theme === 'light'
      ? 'border-teal-300 bg-teal-50 text-teal-800'
      : 'border-teal-500/25 bg-teal-500/10 text-teal-100';
  }
  if (scope === 'needs_review') {
    return theme === 'light'
      ? 'border-amber-300 bg-amber-50 text-amber-800'
      : 'border-amber-500/25 bg-amber-500/10 text-amber-100';
  }
  return theme === 'light'
    ? 'border-slate-300 bg-slate-50 text-slate-700'
    : 'border-slate-500/30 bg-slate-500/10 text-slate-200';
}

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

function resolveFarmCategory(row: CctvUpRow, entry?: CctvUpFarmRegistryEntry): CctvUpFarmCategory {
  const autoCategory = classifyFarmBadge(row);
  const registryCategory = normalizeCctvUpFarmCategory(entry?.category);
  if (!registryCategory) return autoCategory;

  const categorySource = normalizeCctvUpFarmCategorySource(entry?.categorySource) ?? 'legacy';
  if (categorySource === 'manual') return registryCategory;

  // 2026-04-29에 일괄 생성된 registry category는 대부분 기본값 other로 저장되어
  // 원본 DB affiliates/country 기반 분류를 덮으면 안 된다.
  if (autoCategory !== 'other') return autoCategory;

  return registryCategory;
}

function mergeRegistryEntry(row: CctvUpRow, entry?: CctvUpFarmRegistryEntry): DisplayRow {
  const category = resolveFarmCategory(row, entry);
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
    categorySource: 'auto',
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
    categorySource: 'legacy',
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
    categorySource: normalizeCctvUpFarmCategorySource(entry.categorySource) ?? 'legacy',
    tags: entry.tags.map((item) => item.trim()).filter(Boolean),
    memo: entry.memo?.trim() || '',
    aliases: entry.aliases.map((item) => item.trim()).filter(Boolean),
    updatedAt: entry.updatedAt,
    updatedBy: entry.updatedBy,
    isActive: entry.isActive ?? true,
  };
}

function readLocalRegistryDraft(): Record<string, CctvUpFarmRegistryEntry> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_REGISTRY_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, CctvUpFarmRegistryEntry>) : {};
    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([farmId, entry]) => farmId && entry && typeof entry === 'object')
        .map(([farmId, entry]) => [farmId, normalizeRegistryDraft({ ...entry, farmId })]),
    );
  } catch {
    return {};
  }
}

function writeLocalRegistryEntry(entry: CctvUpFarmRegistryEntry) {
  if (typeof window === 'undefined') return;
  try {
    const current = readLocalRegistryDraft();
    window.localStorage.setItem(
      LOCAL_REGISTRY_STORAGE_KEY,
      JSON.stringify({
        ...current,
        [entry.farmId]: normalizeRegistryDraft(entry),
      }),
    );
  } catch {
    // Local persistence is only a UI fallback; server registry remains canonical.
  }
}

export default function CctvUpClient() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MonitorFilter>('all');
  const [farmCategoryFilters, setFarmCategoryFilters] = useState<Record<CctvUpFarmCategory, boolean>>(INITIAL_FARM_CATEGORY_FILTERS);
  const [monitorScopeFilters, setMonitorScopeFilters] = useState<Record<CctvUpMonitorScopeCode, boolean>>(INITIAL_MONITOR_SCOPE_FILTERS);
  const [farmSortMode, setFarmSortMode] = useState<FarmSortMode>('category');
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
  const [categoryMenuFarmId, setCategoryMenuFarmId] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [analysisState, setAnalysisState] = useState<AnalysisLoadState>({
    payload: null,
    isLoading: false,
    error: '',
  });
  const [supabaseDiagnose, setSupabaseDiagnose] = useState<SupabaseDiagnoseState>({
    payload: null,
    isLoading: false,
    error: '',
  });
  const [manualCheck, setManualCheck] = useState<ManualCheckState>({
    payload: null,
    isLoading: false,
    error: '',
    lastRanAt: '',
  });
  const [isOpsDetailsOpen, setIsOpsDetailsOpen] = useState(false);
  const [isFreshRiskOpen, setIsFreshRiskOpen] = useState(true);
  const [isIssueEventLogOpen, setIsIssueEventLogOpen] = useState(true);
  const [isChronicRiskOpen, setIsChronicRiskOpen] = useState(false);
  const monitorRows = payload.rows;

  useEffect(() => {
    const storedSecret = window.sessionStorage.getItem('cctvup-admin-secret') || '';
    if (storedSecret) setAdminSecret(storedSecret);
  }, []);

  const refreshCctvUp = useCallback(async (signal?: AbortSignal, options?: { includeRegistry?: boolean }) => {
    const includeRegistry = options?.includeRegistry ?? true;
    const isAborted = () => signal?.aborted === true;

    setIsLoading(true);
    setIsHistoryLoading(true);
    if (includeRegistry) setIsRegistryLoading(true);
    setLoadError('');
    if (includeRegistry) setRegistryError('');

    void (async () => {
      try {
        const historyResponse = await fetch('/api/cctvup/history/?limit=50', { cache: 'no-store', signal });
        const nextHistory = (await historyResponse.json()) as CctvUpHistoryPayload;
        if (isAborted()) return;

        setHistoryPayload({
          source: nextHistory.source || 'unavailable',
          checkRuns: Array.isArray(nextHistory.checkRuns) ? nextHistory.checkRuns : [],
          snapshots: Array.isArray(nextHistory.snapshots) ? nextHistory.snapshots : [],
          incidents: Array.isArray(nextHistory.incidents) ? nextHistory.incidents : [],
          currentIssues: Array.isArray(nextHistory.currentIssues) ? nextHistory.currentIssues : [],
          cameraStates: Array.isArray(nextHistory.cameraStates) ? nextHistory.cameraStates : [],
          issueEvents: Array.isArray(nextHistory.issueEvents) ? nextHistory.issueEvents : [],
          message: nextHistory.message,
        });
      } catch (error) {
        if (!isAborted()) {
          setHistoryPayload({
            source: 'unavailable',
            checkRuns: [],
            snapshots: [],
            incidents: [],
            currentIssues: [],
            cameraStates: [],
            issueEvents: [],
            message: error instanceof Error ? error.message : 'history 조회 실패',
          });
        }
      } finally {
        if (!isAborted()) setIsHistoryLoading(false);
      }
    })();

    if (includeRegistry) {
      void (async () => {
        try {
          const registryResponse = await fetch('/api/cctvup/registry/', { cache: 'no-store', signal });
          const nextRegistry = (await registryResponse.json()) as CctvUpFarmRegistryPayload;
          if (isAborted()) return;

          if (registryResponse.ok && nextRegistry?.items) {
            const nextDraft = {
              ...Object.fromEntries(nextRegistry.items.map((entry) => [entry.farmId, entry])),
              ...readLocalRegistryDraft(),
            };
            setRegistryPayload(nextRegistry);
            setRegistryDraft(nextDraft);
            setRegistryBaseline(nextDraft);
          } else {
            const localDraft = readLocalRegistryDraft();
            setRegistryPayload({ source: 'unavailable', items: [], message: nextRegistry?.message || `registry 조회 실패: ${registryResponse.status}` });
            setRegistryDraft(localDraft);
            setRegistryBaseline(localDraft);
            setRegistryError(nextRegistry?.message || `registry 조회 실패: ${registryResponse.status}`);
          }
        } catch (error) {
          if (!isAborted()) {
            const localDraft = readLocalRegistryDraft();
            const message = error instanceof Error ? error.message : 'registry 조회 실패';
            setRegistryPayload({ source: 'unavailable', items: [], message });
            setRegistryDraft(localDraft);
            setRegistryBaseline(localDraft);
            setRegistryError(message);
          }
        } finally {
          if (!isAborted()) setIsRegistryLoading(false);
        }
      })();
    }

    try {
      const payloadResponse = await fetch('/api/cctvup', { cache: 'no-store', signal });
      const nextPayload = (await payloadResponse.json()) as CctvUpPayload;
      if (isAborted()) return;

      setPayload(nextPayload);
      setSelectedId((current) => (nextPayload.rows.some((row) => row.id === current) ? current : ''));
      if (!payloadResponse.ok) {
        setLoadError(nextPayload.message || `조회 실패: ${payloadResponse.status}`);
      }
    } catch (error) {
      if (!isAborted()) {
        setLoadError(error instanceof Error ? error.message : 'CCTVUP 조회 실패');
      }
    } finally {
      if (!isAborted()) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const refreshIntervalMs = 5 * 60 * 1000;
    let intervalId: number | null = null;

    void refreshCctvUp(controller.signal, { includeRegistry: true });
    intervalId = window.setInterval(() => {
      void refreshCctvUp(controller.signal, { includeRegistry: true });
    }, refreshIntervalMs);

    return () => {
      controller.abort();
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, [refreshCctvUp]);

  const displayRows = useMemo<DisplayRow[]>(() => {
    return monitorRows.map((row) => mergeRegistryEntry(row, registryDraft[row.farm]));
  }, [monitorRows, registryDraft]);

  const sortedRows = useMemo(() => {
    return displayRows.slice().sort(compareDisplayRows);
  }, [displayRows]);

  const farmGroups = useMemo<FarmGroup[]>(() => {
    return buildCctvUpFarmGroups(displayRows).slice().sort((a, b) => compareCctvUpFarmGroups(a, b, farmSortMode));
  }, [displayRows, farmSortMode]);

  const farmCategoryCounts = useMemo(() => {
    return farmGroups.reduce<Record<CctvUpFarmCategory, number>>(
      (counts, group) => {
        const category = group.category as CctvUpFarmCategory;
        counts[category] += 1;
        return counts;
      },
      { overseas: 0, shinwoo: 0, cheriburo: 0, other: 0 },
    );
  }, [farmGroups]);

  const monitorScopeCounts = useMemo(() => {
    return farmGroups.reduce<Record<CctvUpMonitorScopeCode, number>>(
      (counts, group) => {
        const scope = getFarmGroupMonitorScope(group);
        counts[scope] += 1;
        return counts;
      },
      { active: 0, resting: 0, needs_review: 0, uninstalled: 0 },
    );
  }, [farmGroups]);

  const selected = useMemo(() => sortedRows.find((row) => row.id === selectedId), [sortedRows, selectedId]);

  const stateSync = payload.stateSync;
  const selectedTone = statusTone[selected?.status ?? 'ok'];
  const selectedRegistry = selected ? registryDraft[selected.farm] ?? buildRegistrySeed(selected) : null;

  useEffect(() => {
    if (!selected) {
      setAnalysisState({ payload: null, isLoading: false, error: '' });
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      farmId: selected.farm,
      houseId: selected.house,
      moduleId: selected.camera,
      windowHours: '2',
      limit: '12',
    });
    if (selected.latestAtIso) params.set('latestImageAt', selected.latestAtIso);

    setAnalysisState((current) => ({
      payload: current.payload?.cameraKey === `${selected.farm}-${selected.house}-${selected.camera}` ? current.payload : null,
      isLoading: true,
      error: '',
    }));

    void (async () => {
      try {
        const response = await fetch(`/api/cctvup/analysis/?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const nextAnalysis = (await response.json()) as CctvUpAnalysisPayload;
        if (controller.signal.aborted) return;

        setAnalysisState({
          payload: nextAnalysis,
          isLoading: false,
          error: response.ok ? '' : nextAnalysis.message || `분석 조회 실패: ${response.status}`,
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          setAnalysisState({
            payload: null,
            isLoading: false,
            error: error instanceof Error ? error.message : '분석 조회 실패',
          });
        }
      }
    })();

    return () => controller.abort();
  }, [selected]);

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

  const toggleFarmCategoryFilter = (category: CctvUpFarmCategory) => {
    setFarmCategoryFilters((current) => {
      const selectedCount = FarmCategoryOptions.filter(([key]) => current[key]).length;
      const isAllSelected = selectedCount === FarmCategoryOptions.length;
      if (isAllSelected) {
        return {
          overseas: category === 'overseas',
          shinwoo: category === 'shinwoo',
          cheriburo: category === 'cheriburo',
          other: category === 'other',
        };
      }

      if (selectedCount === 1 && current[category]) {
        return INITIAL_FARM_CATEGORY_FILTERS;
      }

      return {
        ...current,
        [category]: !current[category],
      };
    });
  };

  const toggleMonitorScopeFilter = (scope: CctvUpMonitorScopeCode) => {
    setMonitorScopeFilters((current) => {
      const selectedCount = MonitorScopeOptions.filter(([key]) => current[key]).length;
      const isAllSelected = selectedCount === MonitorScopeOptions.length;
      if (isAllSelected) {
        return {
          active: scope === 'active',
          resting: scope === 'resting',
          needs_review: scope === 'needs_review',
          uninstalled: scope === 'uninstalled',
        };
      }

      if (selectedCount === 1 && current[scope]) {
        return INITIAL_MONITOR_SCOPE_FILTERS;
      }

      return {
        ...current,
        [scope]: !current[scope],
      };
    });
  };

  const filteredFarmGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return farmGroups
      .filter((group) => farmCategoryFilters[group.category as CctvUpFarmCategory])
      .filter((group) => monitorScopeFilters[getFarmGroupMonitorScope(group)])
      .filter((group) => {
        if (statusFilter === 'ok') return group.status === 'ok';
        if (statusFilter === 'issue') return group.isProblem;
        return true;
      })
      .filter((group) => matchesGroupQuery(group, q) || group.rows.some((row: DisplayRow) => matchesRowQuery(row, q)) || group.farmId === selected?.farm)
      .map((group) => ({
        ...group,
        rows: q ? group.rows.filter((row: DisplayRow) => matchesRowQuery(row, q)) : group.rows,
      }))
      .filter((group) => group.rows.length > 0 || group.farmId === selected?.farm);
  }, [farmCategoryFilters, farmGroups, monitorScopeFilters, query, selected?.farm, statusFilter]);

  const filteredCameraCount = useMemo(() => {
    return filteredFarmGroups.reduce((total, group) => total + group.rows.length, 0);
  }, [filteredFarmGroups]);

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
  const statusSummaryItems = useMemo(
    () => [
      { label: '문제확정', value: counts.critical, tone: 'critical' as const, caption: '15분 확정' },
      { label: '회복', value: counts.missing, tone: 'missing' as const, caption: '12슬롯 대기' },
      { label: '관찰', value: counts.late, tone: 'late' as const, caption: '1~2회 미수집' },
      { label: '정상', value: counts.ok, tone: 'ok' as const, caption: '정상 수신' },
    ],
    [counts],
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

  const selectedInputDiagnostics = useMemo(() => {
    return selected ? buildPredictionInputDiagnostics(selected, analysisState) : [];
  }, [analysisState, selected]);

  const latestCheckRun = historyPayload.checkRuns[0];
  const latestIssueCount = latestCheckRun?.issueCount ?? problemRows.length;
  const latestCheckAgeMinutes = latestCheckRun?.checkedAt ? minutesBetween(new Date(), latestCheckRun.checkedAt) : 999;
  const isStale = latestCheckAgeMinutes >= 15;
  const checkLoopHealth = useMemo(
    () => getCheckLoopHealth(latestCheckRun, isHistoryLoading, historyPayload.source),
    [historyPayload.source, isHistoryLoading, latestCheckRun],
  );
  const currentSourceHealth = useMemo(
    () => getCurrentSourceHealth(payload, isLoading, loadError),
    [isLoading, loadError, payload],
  );
  const stateMachineHealth = useMemo(
    () => getStateMachineHealth(stateSync),
    [stateSync],
  );
  const historyHealth = useMemo(
    () => getHistoryHealth(historyPayload, isHistoryLoading),
    [historyPayload, isHistoryLoading],
  );
  const recentCheckRuns = useMemo(() => historyPayload.checkRuns.slice(0, 6), [historyPayload.checkRuns]);
  const recentIssueEvents = useMemo(() => {
    return (historyPayload.issueEvents ?? [])
      .slice()
      .sort((a, b) => b.eventAt.localeCompare(a.eventAt))
      .slice(0, 8);
  }, [historyPayload.issueEvents]);
  const recentIssueEventSummary = useMemo(() => ({
    opened: recentIssueEvents.filter((event) => event.eventKind === 'opened' || event.eventKind === 'reopened').length,
    recovering: recentIssueEvents.filter((event) => event.eventKind === 'recovering').length,
    resolved: recentIssueEvents.filter((event) => event.eventKind === 'resolved').length,
  }), [recentIssueEvents]);

  const postRegistryItems = async (items: CctvUpFarmRegistryEntry[]) => {
    const secret = adminSecret.trim();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (secret) headers['x-cctvup-admin-secret'] = secret;

    const response = await fetch('/api/cctvup/registry/', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        items: items.map((entry) => ({
          farmId: entry.farmId,
          displayName: entry.displayName,
          category: entry.category,
          categorySource: entry.categorySource,
          tags: entry.tags,
          memo: entry.memo,
          aliases: entry.aliases,
          isActive: entry.isActive ?? true,
        })),
      }),
    });

    const result = (await response.json()) as { ok?: boolean; message?: string };
    if (!response.ok || result.ok === false) {
      throw new Error(result.message || `registry 저장 실패: ${response.status}`);
    }

    if (secret) window.sessionStorage.setItem('cctvup-admin-secret', secret);
  };

  const runSupabaseDiagnose = async () => {
    const secret = adminSecret.trim();
    if (!secret) {
      setSupabaseDiagnose({
        payload: null,
        isLoading: false,
        error: '관리 secret을 입력해야 진단할 수 있습니다.',
      });
      return;
    }

    setSupabaseDiagnose({
      payload: null,
      isLoading: true,
      error: '',
    });

    try {
      const response = await fetch('/api/cctvup/supabase-diagnose/', {
        cache: 'no-store',
        headers: {
          'x-cctvup-cron-secret': secret,
          'x-cctvup-runner': 'browser-manual',
        },
      });
      const result = (await response.json()) as Partial<CctvUpSupabaseDiagnosePayload> & { message?: string };
      const payloadResult: CctvUpSupabaseDiagnosePayload = {
        ok: Boolean(result.ok),
        checkedAt: result.checkedAt ?? '',
        timeoutMs: result.timeoutMs ?? 0,
        message: result.message ?? `Supabase 진단 실패: ${response.status}`,
        steps: Array.isArray(result.steps) ? result.steps : [],
      };
      window.sessionStorage.setItem('cctvup-admin-secret', secret);
      setSupabaseDiagnose({
        payload: payloadResult,
        isLoading: false,
        error: !response.ok || payloadResult.ok === false ? payloadResult.message : '',
      });
    } catch (error) {
      setSupabaseDiagnose({
        payload: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Supabase 진단 실패',
      });
    }
  };

  const runManualCheck = async () => {
    const secret = adminSecret.trim();
    if (!secret) {
      setManualCheck({
        payload: null,
        isLoading: false,
        error: '관리 secret을 입력해야 체크를 실행할 수 있습니다.',
        lastRanAt: new Date().toISOString(),
      });
      return;
    }

    setManualCheck({
      payload: null,
      isLoading: true,
      error: '',
      lastRanAt: new Date().toISOString(),
    });

    try {
      const response = await fetch('/api/cctvup/check/', {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'x-cctvup-cron-secret': secret,
        },
      });
      const result = (await response.json()) as ManualCheckPayload;
      const payloadResult: ManualCheckPayload = {
        ...result,
        ok: Boolean(result.ok),
        message: result.message ?? (response.ok ? '체크 실행 완료' : `체크 실행 실패: ${response.status}`),
      };

      window.sessionStorage.setItem('cctvup-admin-secret', secret);
      setManualCheck({
        payload: payloadResult,
        isLoading: false,
        error: !response.ok || payloadResult.ok === false ? payloadResult.message ?? `체크 실행 실패: ${response.status}` : '',
        lastRanAt: new Date().toISOString(),
      });

      if (response.ok && payloadResult.ok) {
        void refreshCctvUp(undefined, { includeRegistry: false });
      }
    } catch (error) {
      setManualCheck({
        payload: null,
        isLoading: false,
        error: error instanceof Error ? error.message : '체크 실행 실패',
        lastRanAt: new Date().toISOString(),
      });
    }
  };

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
        next.categorySource = 'manual';
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
      const normalized = normalizeRegistryDraft(entry);
      writeLocalRegistryEntry(normalized);
      await postRegistryItems([normalized]);
      setRegistryBaseline((current) => ({ ...current, [farmId]: normalized }));
      setRegistryDraft((current) => ({ ...current, [farmId]: normalized }));
    } catch (error) {
      setRegistryError(error instanceof Error ? `서버 저장 실패: ${error.message} (브라우저 로컬에는 반영됨)` : '서버 저장 실패 (브라우저 로컬에는 반영됨)');
    } finally {
      setIsRegistrySaving(false);
    }
  };

  const resetRegistryAll = () => {
    setRegistryDraft(registryBaseline);
  };

  const saveFarmGroupCategory = async (group: FarmGroup, category: CctvUpFarmCategory) => {
    const existing = registryDraft[group.farmId] ?? emptyRegistryForFarm(group.farmId);
    const nextEntry = normalizeRegistryDraft({
      ...existing,
      farmId: group.farmId,
      displayName: existing.displayName || group.farmName,
      category,
      categorySource: 'manual',
      tags: existing.tags ?? [],
      memo: existing.memo ?? '',
      aliases: existing.aliases ?? [],
      isActive: existing.isActive ?? true,
    });

    setRegistryDraft((current) => ({ ...current, [group.farmId]: nextEntry }));
    writeLocalRegistryEntry(nextEntry);
    setIsRegistrySaving(true);
    setRegistryError('');
    try {
      await postRegistryItems([nextEntry]);
      setRegistryBaseline((current) => ({ ...current, [group.farmId]: nextEntry }));
    } catch (error) {
      setRegistryError(error instanceof Error ? `분류 서버 저장 실패: ${error.message} (브라우저 로컬에는 반영됨)` : '분류 서버 저장 실패 (브라우저 로컬에는 반영됨)');
    } finally {
      setIsRegistrySaving(false);
    }
  };


  return (
    <div className={`min-h-screen xl:flex xl:h-screen xl:flex-col xl:overflow-hidden ${shellBg(theme)} selection:bg-sky-500/30 selection:text-white`} data-cctvup-theme={theme}>
      <header className={`border-b xl:shrink-0 ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-[#243041] bg-[#0f1722]'}`}>
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className={`text-[11px] uppercase tracking-[0.18em] ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>FMS / CCTVUP</p>
            <h1 className="mt-1 flex flex-wrap items-end gap-2 text-2xl font-semibold leading-tight">
              <span>CCTVUP - AI 중량예측 입력 관제</span>
              <span className={`text-sm font-normal ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                (운영 DB · 농장 {payload.summary.farms}개 · 카메라 {payload.summary.cameras}개 · 확인 {formatClock(payload.checkedAt)} · 확정/회복 {payload.summary.issueCount}개)
              </span>
            </h1>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <input
              type="password"
              value={adminSecret}
              onChange={(event) => setAdminSecret(event.target.value)}
              placeholder="관리 secret"
              className={`h-10 w-40 border px-3 py-2 text-sm outline-none ${inputClass(theme)}`}
            />
            <button
              type="button"
              onClick={() => void runSupabaseDiagnose()}
              disabled={supabaseDiagnose.isLoading}
              className={`border px-3 py-2 text-sm transition disabled:cursor-wait disabled:opacity-60 ${theme === 'light' ? 'border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100' : 'border-sky-500/30 bg-sky-500/10 text-sky-100 hover:bg-sky-500/15'}`}
            >
              {supabaseDiagnose.isLoading ? '진단 중' : 'Supabase 진단'}
            </button>
            <button
              type="button"
              onClick={() => void runManualCheck()}
              disabled={manualCheck.isLoading}
              className={`border px-3 py-2 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${theme === 'light' ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15'}`}
            >
              {manualCheck.isLoading ? '체크 중' : '지금 체크'}
            </button>
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
                setFarmSortMode('category');
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

      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 xl:min-h-0 xl:flex-1 xl:overflow-hidden">
        {(isLoading || loadError) && (
          <div className={`border px-4 py-3 text-sm xl:shrink-0 ${theme === 'light' ? 'border-slate-200 bg-white text-slate-700' : 'border-[#243041] bg-[#0f1722] text-slate-300'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>
                {loadError
                  ? `조회 상태: ${loadError}`
                  : isLoading
                    ? '운영 DB와 camera_state를 함께 읽는 중입니다.'
                    : '운영 DB와 camera_state를 함께 반영했습니다.'}
              </span>
              <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                history {isHistoryLoading ? '동기화 중' : historyPayload.source} · last check {formatEventTime(latestCheckRun?.checkedAt)} · issue {latestIssueCount}{isStale ? ` · stale ${latestCheckAgeMinutes}m` : ''}
              </span>
            </div>
          </div>
        )}
        {(manualCheck.isLoading || manualCheck.payload || manualCheck.error) ? (
          <div className={`border px-4 py-3 text-sm xl:shrink-0 ${theme === 'light' ? 'border-slate-200 bg-white text-slate-700' : 'border-[#243041] bg-[#0f1722] text-slate-300'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center border px-2.5 py-1 text-xs font-semibold ${manualCheckPillClass(theme, manualCheck)}`}>
                  {formatManualCheckLabel(manualCheck)}
                </span>
                <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  run {manualCheck.payload?.runId ? manualCheck.payload.runId.slice(0, 8) : '-'} · checked {formatEventTime(manualCheck.payload?.checkedAt)}
                </span>
              </div>
              <span className={`text-xs ${manualCheck.payload?.ok ? (theme === 'light' ? 'text-emerald-700' : 'text-emerald-200') : theme === 'light' ? 'text-red-600' : 'text-red-300'}`}>
                {formatManualCheckMessage(manualCheck)}
              </span>
            </div>
          </div>
        ) : null}
        {(supabaseDiagnose.isLoading || supabaseDiagnose.payload || supabaseDiagnose.error) ? (
          <div className={`border px-4 py-3 text-sm xl:shrink-0 ${theme === 'light' ? 'border-slate-200 bg-white text-slate-700' : 'border-[#243041] bg-[#0f1722] text-slate-300'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center border px-2.5 py-1 text-xs font-semibold ${supabaseDiagnosePillClass(theme, supabaseDiagnose)}`}>
                  {formatSupabaseDiagnoseLabel(supabaseDiagnose)}
                </span>
                <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  DNS {formatDiagnoseStepMs(getDiagnoseStep(supabaseDiagnose.payload, 'dns.lookup'))} · TCP {formatDiagnoseStepMs(getDiagnoseStep(supabaseDiagnose.payload, 'tcp.443'))} · REST active {formatDiagnoseStepMs(getDiagnoseStep(supabaseDiagnose.payload, 'rest.camera_states.active'))}
                </span>
              </div>
              <span className={`text-xs ${supabaseDiagnose.payload?.ok ? (theme === 'light' ? 'text-emerald-700' : 'text-emerald-200') : theme === 'light' ? 'text-red-600' : 'text-red-300'}`}>
                {supabaseDiagnose.isLoading ? '환경, DNS, TCP, REST 핵심 테이블을 확인합니다.' : formatDiagnoseFailure(supabaseDiagnose.payload, supabaseDiagnose.error)}
              </span>
            </div>
          </div>
        ) : null}
        <section className={`border xl:shrink-0 ${panelBg(theme)}`}>
          <div className={`px-4 py-3 ${theme === 'light' ? 'bg-white' : 'bg-[#0f1722]'}`}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold">운영 상태</h2>
                  <span className={`text-xs tabular-nums ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    농장 {payload.summary.farms}개 · 카메라 {payload.summary.cameras}대 · 확인 {formatClock(payload.checkedAt)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  {statusSummaryItems.map((item) => (
                    <span
                      key={item.label}
                      className={`inline-flex h-7 items-center gap-1.5 border px-2 font-semibold ${statusSummaryBadgeClass(theme, item.tone)}`}
                      title={item.caption}
                    >
                      <span>{item.label}</span>
                      <span className="tabular-nums">{item.value}</span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`inline-flex h-7 items-center border px-2 font-semibold ${stateSyncPillClass(theme, stateSync?.status)}`}>
                  {formatStateSyncLabel(stateSync)}
                </span>
                <span
                  className={`inline-flex h-7 items-center border px-2 font-semibold ${inputReadinessToneClass(theme, checkLoopHealth.tone)}`}
                  title={`${checkLoopHealth.detail} · ${checkLoopHealth.meta}`}
                >
                  {checkLoopHealth.label} · {isHistoryLoading ? '동기화 중' : formatEventTime(latestCheckRun?.checkedAt)}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpsDetailsOpen((current) => !current)}
                  aria-expanded={isOpsDetailsOpen}
                  className={`inline-flex h-7 items-center border px-2 font-semibold transition ${theme === 'light' ? 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50' : 'border-[#314056] bg-[#0a1019] text-slate-100 hover:bg-white/5'}`}
                >
                  {isOpsDetailsOpen ? '상세 접기' : '상세 보기'}
                </button>
              </div>
            </div>
          </div>

          {isOpsDetailsOpen ? (
            <div className={`border-t ${theme === 'light' ? 'border-slate-200' : 'border-[#243041]'}`}>
              <div className={`grid gap-px ${theme === 'light' ? 'bg-slate-200' : 'bg-[#243041]'} md:grid-cols-2 xl:grid-cols-4`}>
                <HealthStatusTile title="현재 목록" health={currentSourceHealth} theme={theme} />
                <HealthStatusTile title="상태머신" health={stateMachineHealth} theme={theme} />
                <HealthStatusTile title="히스토리" health={historyHealth} theme={theme} />
                <HealthStatusTile title="5분 루프" health={checkLoopHealth} theme={theme} />
              </div>

              <div className={`grid gap-3 px-4 py-3 ${theme === 'light' ? 'bg-white' : 'bg-[#0f1722]'} lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]`}>
                <section className={`border px-3 py-3 ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-[#243041] bg-[#0a1019]'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold">최근 check run</h3>
                    <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      {recentCheckRuns.length}회
                    </span>
                  </div>
                  {recentCheckRuns.length ? (
                    <div className="mt-3 grid gap-2">
                      {recentCheckRuns.map((run, index) => {
                        const cadence = getCheckRunCadence(run, recentCheckRuns[index + 1]);
                        return (
                          <div
                            key={run.id}
                            className={`grid grid-cols-[auto_minmax(112px,0.75fr)_minmax(0,1.6fr)] items-center gap-2 border px-3 py-2 text-xs ${
                              theme === 'light' ? 'border-slate-200 bg-white text-slate-700' : 'border-[#243041] bg-[#0f1722] text-slate-300'
                            }`}
                          >
                            <span
                              className={`inline-flex h-5 w-fit shrink-0 items-center justify-center rounded-[3px] border px-1.5 text-[10px] font-bold leading-none ${checkRunCadenceBadgeClass(theme, cadence)}`}
                              title={`${cadence.label} · ${cadence.detail} · ${cadence.meta}`}
                            >
                              {getCheckRunCadenceBadgeLabel(cadence)}
                            </span>
                            <span className="tabular-nums">{formatEventTime(run.checkedAt)}</span>
                            <span className="min-w-0 truncate tabular-nums" title={`${cadence.detail} · ${run.note}`}>
                              {cadence.detail} · issue {run.issueCount} · ok {run.okCount} · watch {run.lateCount} · open {run.criticalCount} · recovering {run.missingCount}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className={`mt-3 text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      아직 check run 기록이 없습니다.
                    </p>
                  )}
                </section>

                <section className={`border px-3 py-3 ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-[#243041] bg-[#0a1019]'}`}>
                  <h3 className="text-sm font-semibold">상태 근거</h3>
                  <dl className="mt-3 grid gap-2 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <dt className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>상태머신 메시지</dt>
                      <dd className="min-w-0 truncate text-right" title={stateSync?.message ?? '현재 목록은 운영 DB live 조회를 기준으로 표시합니다.'}>
                        {stateSync?.message ?? '현재 목록은 운영 DB live 조회를 기준으로 표시합니다.'}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>최근 이벤트</dt>
                      <dd className="tabular-nums">확정 {recentIssueEventSummary.opened} · 회복 {recentIssueEventSummary.recovering} · 해결 {recentIssueEventSummary.resolved}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>열린 문제</dt>
                      <dd className="tabular-nums">open {payload.summary.open ?? payload.summary.critical} · recovering {payload.summary.recovering ?? payload.summary.missing} · resolved {payload.summary.resolved ?? 0}</dd>
                    </div>
                    {counts.paused ? (
                      <div className="flex items-center justify-between gap-3">
                        <dt className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>점검 제외</dt>
                        <dd className="tabular-nums">{counts.paused}대</dd>
                      </div>
                    ) : null}
                  </dl>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {statusSummaryItems.map((item) => (
                      <div key={`detail-${item.label}`} className={`border px-2 py-2 text-xs ${statusSummaryBadgeClass(theme, item.tone)}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span>{item.label}</span>
                          <span className="font-semibold tabular-nums">{item.value}</span>
                        </div>
                        <p className="mt-1 opacity-80">{item.caption}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          ) : null}
        </section>
        <section className="grid gap-4 xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <article className={`border xl:flex xl:min-h-0 xl:flex-col xl:overflow-hidden ${panelBg(theme)}`}>
            <div className={`border-b px-4 py-3 ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-[#243041] bg-[#0a1019]'}`}>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">농장 그룹 리스트</h2>
                    <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      농장 {filteredFarmGroups.length}개 · 카메라 {filteredCameraCount}대
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
                        ['ok', '정상 농장'],
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
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className={`mr-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>카테고리</span>
                    {FarmCategoryOptions.map(([category, label]) => {
                      const isActive = farmCategoryFilters[category];
                      return (
                        <button
                          key={`farm-category-filter-${category}`}
                          type="button"
                          onClick={() => toggleFarmCategoryFilter(category)}
                          aria-pressed={isActive}
                          className={`inline-flex h-7 items-center gap-1 rounded-sm border px-2 text-[11px] font-semibold transition ${farmCategoryFilterButtonClass(theme, category, isActive)}`}
                        >
                          <span className={`h-3 w-0.5 rounded-full ${farmCategoryMarkerClass(category)}`} aria-hidden="true" />
                          {label}
                          <span className="ml-0.5 text-[10px] opacity-70">{farmCategoryCounts[category]}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className={`mr-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>감시범위</span>
                    {MonitorScopeOptions.map(([scope, label]) => {
                      const isActive = monitorScopeFilters[scope];
                      return (
                        <button
                          key={`monitor-scope-filter-${scope}`}
                          type="button"
                          onClick={() => toggleMonitorScopeFilter(scope)}
                          aria-pressed={isActive}
                          className={`inline-flex h-7 items-center rounded-sm border px-2 text-[11px] font-semibold transition ${monitorScopeBadgeClass(theme, scope, isActive)}`}
                        >
                          {label}
                          <span className="ml-1 text-[10px] opacity-70">{monitorScopeCounts[scope]}</span>
                        </button>
                      );
                    })}
                  </div>
                  {registryError ? <p className="mt-2 text-xs text-red-400">{registryError}</p> : null}
                </div>
              </div>
            </div>

            <div className="space-y-px xl:min-h-0 xl:flex-1 xl:overflow-y-auto">
              {filteredFarmGroups.map((group) => {
                const tone = statusTone[group.status as CameraStatus];
                const isExpanded = expandedFarmIds[group.farmId] || selected?.farm === group.farmId;
                const latestRow = sortedRows.find((row) => row.id === group.latestRowId) ?? group.rows[0];
                const tagsLabel = latestRow?.displayTags.length ? latestRow.displayTags.slice(0, 3).join(' · ') : '';
                const groupCategory = group.category as CctvUpFarmCategory;
                const groupScope = getFarmGroupMonitorScope(group);
                return (
                  <div key={group.farmId} className={`border-b ${theme === 'light' ? 'border-slate-100' : 'border-[#1b2636]'}`}>
	                    <div className={`flex items-start justify-between gap-3 px-3 py-3 transition ${theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-[#0f1722]'}`}>
	                      <div className="min-w-0 flex-1">
	                        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
	                          <button
	                            type="button"
	                            onClick={() => setExpandedFarmIds((current) => ({ ...current, [group.farmId]: !isExpanded }))}
	                            className="inline-flex min-w-0 items-center gap-x-2 text-left"
	                          >
	                            <span className={`inline-flex h-5 shrink-0 items-center rounded-sm border px-1.5 text-[10px] font-semibold ${tone.badge}`}>
	                              {tone.label}
	                            </span>
	                            <span className="min-w-0 truncate text-sm font-semibold leading-5">{group.farmName}</span>
	                            </button>
	                          <span className={`inline-flex h-5 shrink-0 items-center rounded-sm border px-1.5 text-[10px] font-semibold ${monitorScopeBadgeClass(theme, groupScope)}`}>
	                            {MonitorScopeLabels[groupScope]}
	                          </span>
	                          <div className="relative shrink-0">
	                            <button
	                              type="button"
	                              onClick={() => setCategoryMenuFarmId((current) => (current === group.farmId ? '' : group.farmId))}
	                              disabled={isRegistrySaving}
	                              className={`inline-flex h-5 items-center gap-1 rounded-sm border px-1.5 text-[10px] font-semibold leading-none transition disabled:opacity-50 ${farmCategoryButtonClass(theme, groupCategory, true)}`}
	                              aria-haspopup="menu"
	                              aria-expanded={categoryMenuFarmId === group.farmId}
	                              aria-label={`${group.farmName} 현재 분류 ${FarmBadgeLabels[groupCategory]}`}
	                            >
	                              <span className={`h-3 w-0.5 rounded-full ${farmCategoryMarkerClass(groupCategory)}`} aria-hidden="true" />
	                              {FarmBadgeLabels[groupCategory]}
	                              <span className="text-[9px] opacity-60" aria-hidden="true">⌄</span>
	                            </button>
	                            {categoryMenuFarmId === group.farmId ? (
	                              <div
	                                role="menu"
	                                className={`absolute left-0 top-6 z-20 w-[96px] border p-1 shadow-lg ${
	                                  theme === 'light'
	                                    ? 'border-slate-200 bg-white shadow-slate-200/70'
	                                    : 'border-[#314056] bg-[#0a1019] shadow-black/30'
	                                }`}
	                              >
	                                {FarmCategoryOptions.map(([category, label]) => {
	                                  const isActive = groupCategory === category;
	                                  return (
	                                    <button
	                                      key={category}
	                                      type="button"
	                                      role="menuitemradio"
	                                      aria-checked={isActive}
	                                      onClick={() => {
	                                        setCategoryMenuFarmId('');
	                                        if (!isActive) void saveFarmGroupCategory(group, category);
	                                      }}
	                                      className={`mb-1 inline-flex h-6 w-full items-center gap-1 rounded-sm border px-1.5 text-left text-[10px] font-semibold transition last:mb-0 ${farmCategoryButtonClass(theme, category, isActive)}`}
	                                    >
	                                      <span className={`h-3 w-0.5 rounded-full ${farmCategoryMarkerClass(category)}`} aria-hidden="true" />
	                                      {label}
	                                    </button>
	                                  );
	                                })}
	                              </div>
	                            ) : null}
	                          </div>
	                          <button
	                            type="button"
	                            onClick={() => setExpandedFarmIds((current) => ({ ...current, [group.farmId]: !isExpanded }))}
	                            className={`text-[11px] tabular-nums ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}
	                          >
	                            {group.farmId}
	                          </button>
	                          <button
	                            type="button"
	                            onClick={() => setExpandedFarmIds((current) => ({ ...current, [group.farmId]: !isExpanded }))}
	                            className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}
	                          >
	                            {isExpanded ? '접기 ▲' : '펼치기 ▼'}
	                          </button>
	                        </div>
	                        <button
	                          type="button"
	                          onClick={() => setExpandedFarmIds((current) => ({ ...current, [group.farmId]: !isExpanded }))}
	                          className={`mt-1 flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0 text-left text-[11px] leading-4 tabular-nums ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}
	                        >
	                          <span>카메라 {group.cameraCount}대</span>
	                          <span>·</span>
                          <span>주의/문제 {group.problemCount}대</span>
	                          <span>·</span>
	                          <span>정상 {group.okCount}대</span>
	                          <span>·</span>
	                          <span>최신 {group.latestAt}</span>
	                          {latestRow?.farmAffiliates || latestRow?.country ? (
	                            <>
	                              <span>·</span>
	                              <span>원본 {latestRow.farmAffiliates || '-'} / {latestRow.country || '-'}</span>
	                            </>
	                          ) : null}
	                          {tagsLabel ? <><span>·</span><span>{tagsLabel}</span></> : null}
	                          {latestRow?.displayMemo ? <><span>·</span><span className="truncate">{latestRow.displayMemo}</span></> : null}
	                        </button>
	                      </div>
                      <div className="mt-1 flex shrink-0 items-center">
                        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`} title={tone.label} aria-label={tone.label} />
                      </div>
                    </div>

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
                                  <span>미수집 {row.missCount ?? row.consecutiveMiss}/3</span>
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

          <aside className="flex flex-col gap-3 xl:min-h-0 xl:overflow-y-auto xl:pr-1">
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
                        <p className={`mt-3 text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          5분마다 CCTV 이미지 수신을 확인하고, 예측 입력 공백 여부를 판단합니다.
                        </p>
                      </div>
                      <div className="flex items-center justify-center px-1 py-1" title={selectedTone.label} aria-label={selectedTone.label}>
                        <span className={`h-3 w-3 rounded-full ${selectedTone.dot}`} />
                      </div>
                    </div>
                  </section>

                  <section className={`grid gap-px border ${theme === 'light' ? 'border-slate-200 bg-slate-200 md:grid-cols-2 xl:grid-cols-4' : 'border-[#243041] bg-[#243041] md:grid-cols-2 xl:grid-cols-4'}`}>
                    {[
                      ['최신 수신', selected.latestAt, '현재'],
                      ['상태머신', selected.stateLabel ?? statusTone[selected.status].label, selected.stateMessage ?? '현재'],
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
                      <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-semibold">카메라별 무게예측 입력 자동 진단표</h3>
                        <p className={`text-xs leading-5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          이미지 입력과 분석 결과를 자동 판정하고, 보정/예측 안정성은 연동 전 상태를 명확히 분리합니다.
                        </p>
                      </div>
                    </div>
                    <div className={`divide-y ${theme === 'light' ? 'divide-slate-200' : 'divide-[#243041]'}`}>
                      {selectedInputDiagnostics.map((item) => (
                        <div key={item.label} className={`${theme === 'light' ? 'bg-white' : 'bg-[#0f1722]'} px-4 py-4`}>
                          <div className="grid gap-4 xl:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center border text-[11px] font-semibold tabular-nums ${inputReadinessToneClass(theme, item.tone)}`}>
                                  {item.step}
                                </span>
                                <div className="min-w-0">
                                  <p className={`text-[11px] uppercase tracking-[0.16em] ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>{item.label}</p>
                                  <p className="mt-1 text-lg font-semibold">{item.value}</p>
                                </div>
                              </div>
                              <span className={`mt-3 inline-flex border px-2 py-1 text-[10px] font-semibold ${inputReadinessToneClass(theme, item.tone)}`}>
                                {item.meta}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <dl className="grid gap-2 md:grid-cols-2">
                                {item.evidence.map((entry) => (
                                  <div key={`${item.label}-${entry.label}`} className={`min-w-0 border px-3 py-2 ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-[#243041] bg-[#0a1019]'}`}>
                                    <dt className={`text-[10px] uppercase tracking-[0.14em] ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>{entry.label}</dt>
                                    <dd className="mt-1 break-words text-xs font-medium leading-5">{entry.value}</dd>
                                  </div>
                                ))}
                              </dl>
                              <div className={`mt-3 border px-3 py-2 text-xs leading-5 ${inputReadinessToneClass(theme, item.tone)}`}>
                                <p className="font-semibold">{item.judgement}</p>
                                <p className="mt-1 opacity-80">{item.description}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className={`border ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-[#314056] bg-[#0a1019]'}`}>
                    <div className={`border-b px-4 py-3 ${theme === 'light' ? 'border-slate-200' : 'border-[#243041]'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold">표시 / 메모</h3>
                        <span className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                          {registryPayload.source} · {isRegistryLoading ? '불러오는 중' : '편집 가능'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3 px-4 py-4">
                      <div className="grid gap-3">
                        <label className="block text-xs">
                          <span className={`mb-1 block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>표시명</span>
                          <input
                            value={selectedRegistry?.displayName ?? ''}
                            onChange={(event) => selected && updateRegistryField(selected.farm, 'displayName', event.target.value)}
                            className={`h-8 w-full border px-3 py-1.5 text-sm outline-none ${inputClass(theme)}`}
                          />
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
                          {selectedRegistry?.tags?.length ?? 0} tags
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
                          {historyPayload.source} · run {historyPayload.checkRuns.length} · state {historyPayload.cameraStates?.length ?? 0} · event {historyPayload.issueEvents?.length ?? historyPayload.incidents.length}
                        </span>
                      </div>
                    </div>
                    <div className={`border-b px-4 py-3 ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-[#243041] bg-[#0a1019]'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] uppercase tracking-[0.16em]">문제로그 · 30일 누적</span>
                        <span className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>{selectedIncidents.length}건</span>
                      </div>
                      <p className={`mt-1 text-xs leading-5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Supabase issue_events에 쌓인 상태 전환 기록을 보여줍니다.
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
                      현재 상세는 운영 DB 최신 수신값과 Supabase camera_state 상태머신을 합쳐 표시한다.
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
                      <h2 className="text-lg font-semibold">최근 입력 리스크</h2>
                      <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                        중량예측에 영향을 줄 수 있는 CCTV 이미지 수신 지연, 문제확정, 회복중 상태를 보여줍니다.
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
                      <h3 className="text-sm font-semibold">지금 확인할 입력 공백</h3>
                      <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        1~2회 미수집은 관찰중, 3회 이상 미수집은 문제확정으로 분리합니다.
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`text-xs tabular-nums ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{freshProblemRows.length}개</span>
                      <CollapseToggle
                        isOpen={isFreshRiskOpen}
                        label="지금 확인할 입력 공백"
                        onClick={() => setIsFreshRiskOpen((value) => !value)}
                        theme={theme}
                      />
                    </div>
                  </div>
                </div>

                {isFreshRiskOpen ? (
                  <div className="max-h-[340px] overflow-auto">
                    <table className="min-w-full border-collapse text-left text-sm">
                      <thead className={`sticky top-0 z-10 ${theme === 'light' ? 'bg-slate-50 text-slate-500' : 'bg-[#111a27] text-slate-400'}`}>
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
                                className={`h-12 cursor-pointer border-b ${theme === 'light' ? 'border-slate-100 hover:bg-slate-50' : 'border-[#1b2636] hover:bg-[#0f1722]'}`}
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
                                  <div className={`max-w-[240px] text-[11px] leading-4 ${theme === 'light' ? 'text-slate-600' : 'text-slate-200'}`}>{row.reason}</div>
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
                ) : null}

                <section className={`border-t ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-[#243041] bg-[#0f1722]'}`}>
                  <div className={`border-b px-4 py-3 ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-[#243041] bg-[#0a1019]'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold">최근 상태전환 로그</h3>
                        <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          Supabase issue_events에 실제로 남은 확정, 회복, 해결 이벤트입니다.
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className={`text-xs tabular-nums ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          확정 {recentIssueEventSummary.opened} · 회복 {recentIssueEventSummary.recovering} · 해결 {recentIssueEventSummary.resolved}
                        </span>
                        <CollapseToggle
                          isOpen={isIssueEventLogOpen}
                          label="최근 상태전환 로그"
                          onClick={() => setIsIssueEventLogOpen((value) => !value)}
                          theme={theme}
                        />
                      </div>
                    </div>
                  </div>
                  {isIssueEventLogOpen ? (
                    recentIssueEvents.length ? (
                    <div className={`max-h-[360px] overflow-y-auto divide-y ${theme === 'light' ? 'divide-slate-200' : 'divide-[#243041]'}`}>
                      {recentIssueEvents.map((event) => (
                        <button
                          key={`${event.cameraKey}-${event.eventAt}-${event.eventKind}`}
                          type="button"
                          onClick={() => setSelectedId(event.cameraKey)}
                          className={`flex min-h-[58px] w-full items-start justify-between gap-3 px-4 py-3 text-left transition ${theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-[#0a1019]'}`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <span className={`inline-flex shrink-0 border px-2 py-0.5 text-[10px] font-semibold ${issueEventToneClass(theme, event.eventKind)}`}>
                                {formatIssueEventKind(event.eventKind)}
                              </span>
                              <span className="min-w-0 truncate text-xs font-medium">
                                {event.farmName || event.farmId} / {event.houseName || event.houseId} / {event.cameraName || event.moduleId}
                              </span>
                              <span className={`text-[10px] tabular-nums ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                                {event.farmId} / {event.houseId} / {event.moduleId}
                              </span>
                            </div>
                            <p className={`mt-1 line-clamp-2 text-[11px] leading-4 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                              {event.message}
                            </p>
                          </div>
                          <span className={`shrink-0 text-[11px] tabular-nums ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            {formatEventTime(event.eventAt)}
                          </span>
                        </button>
                      ))}
                    </div>
                    ) : (
                    <p className={`px-4 py-8 text-center text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      아직 상태전환 이벤트가 없습니다.
                    </p>
                    )
                  ) : null}
                </section>

                {chronicProblemRows.length ? (
                  <section className={`border-t ${theme === 'light' ? 'border-slate-200 bg-slate-50/70' : 'border-[#243041] bg-[#0a1019]'}`}>
                    <div className={`flex items-center justify-between gap-3 px-4 py-3 ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>
                      <div>
                        <h3 className="text-sm font-semibold">장기 문제 보기</h3>
                        <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          장기 미수신이나 점검이 필요한 항목은 기본 접힘 상태로 보관합니다.
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className={`text-xs tabular-nums ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{chronicProblemRows.length}개</span>
                        <CollapseToggle
                          isOpen={isChronicRiskOpen}
                          label="장기 문제 보기"
                          onClick={() => setIsChronicRiskOpen((value) => !value)}
                          theme={theme}
                        />
                      </div>
                    </div>
                    {isChronicRiskOpen ? (
                    <div className="max-h-[340px] overflow-auto border-t">
                      <table className="min-w-full border-collapse text-left text-sm">
                        <thead className={`sticky top-0 z-10 ${theme === 'light' ? 'bg-slate-50 text-slate-500' : 'bg-[#111a27] text-slate-400'}`}>
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
                                className={`h-12 cursor-pointer border-b ${theme === 'light' ? 'border-slate-100 hover:bg-slate-50' : 'border-[#1b2636] hover:bg-[#0f1722]'}`}
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
                                  <div className={`max-w-[240px] text-[11px] leading-4 ${theme === 'light' ? 'text-slate-600' : 'text-slate-200'}`}>{row.reason}</div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    ) : null}
                  </section>
                ) : null}
              </article>
            )}
          </aside>

        </section>
      </main>
    </div>
  );
}
