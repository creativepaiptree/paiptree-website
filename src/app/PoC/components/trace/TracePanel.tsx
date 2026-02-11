'use client';

import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Link2, X } from 'lucide-react';
import type { DataSourceReference, TraceabilityPayload } from '@/types/traceability';

type TracePanelProps = {
  lang: 'ko' | 'en';
  open: boolean;
  trace: TraceabilityPayload | null;
  onClose: () => void;
};

type TraceTab = 'summary' | 'logic' | 'sources' | 'history' | 'cctv';
type CctvView = 'frame' | 'pipeline' | 'raw';
type SourceContext = 'current' | 'target' | 'base';

const SOURCE_TYPE_LABEL: Record<DataSourceReference['type'], { ko: string; en: string }> = {
  file: { ko: '파일', en: 'File' },
  db: { ko: 'DB', en: 'DB' },
  slack: { ko: '슬랙', en: 'Slack' },
  email: { ko: '이메일', en: 'Email' },
  jira: { ko: 'Jira', en: 'Jira' },
  drive: { ko: 'Drive', en: 'Drive' },
  api: { ko: 'API', en: 'API' },
};

const t = {
  title: { ko: '데이터 추적', en: 'Data Trace' },
  summary: { ko: '요약', en: 'Summary' },
  logic: { ko: '로직', en: 'Logic' },
  sources: { ko: '원본', en: 'Sources' },
  originHuman: { ko: 'Human / Legacy', en: 'Human / Legacy' },
  originAi: { ko: 'AI Generated', en: 'AI Generated' },
  displayValue: { ko: '표시 값', en: 'Display value' },
  traceId: { ko: '추적 ID', en: 'Trace ID' },
  snapshotAt: { ko: '스냅샷 시각', en: 'Snapshot at' },
  version: { ko: '소스 버전', en: 'Source version' },
  confidence: { ko: '신뢰도', en: 'Confidence' },
  logicSummary: { ko: '로직 요약', en: 'Logic summary' },
  formula: { ko: '계산식', en: 'Formula' },
  noFormula: { ko: '등록된 계산식 없음', en: 'No formula provided' },
  sourceList: { ko: '출처 목록', en: 'Source list' },
  sourceContext: { ko: '출처 컨텍스트', en: 'Source context' },
  sourceCurrent: { ko: '현재', en: 'Current' },
  sourceTarget: { ko: '비교 기준', en: 'Target' },
  sourceBase: { ko: '비교 대상', en: 'Base' },
  sourceOpenHint: { ko: '클릭 시 Sources 탭으로 이동', en: 'Click to open in Sources tab' },
  sourceDetail: { ko: '출처 상세', en: 'Source detail' },
  page: { ko: '페이지', en: 'Page' },
  row: { ko: '행', en: 'Row' },
  highlight: { ko: '하이라이트', en: 'Highlight' },
  anchor: { ko: '앵커', en: 'Anchor' },
  openSource: { ko: '원본 열기', en: 'Open source' },
  copyLink: { ko: '출처 체인 링크 복사', en: 'Copy trace URL' },
  copied: { ko: '복사 완료', en: 'Copied' },
  history: { ko: '히스토리', en: 'History' },
  compare: { ko: '시점 비교', en: 'Snapshot compare' },
  targetSnapshot: { ko: '비교 기준(현재)', en: 'Target (current)' },
  baseSnapshot: { ko: '비교 대상(과거)', en: 'Base (past)' },
  valueDelta: { ko: '값 변화', en: 'Value delta' },
  confidenceDelta: { ko: '신뢰도 변화', en: 'Confidence delta' },
  sameSummary: { ko: '요약 동일', en: 'Summary unchanged' },
  changedSummary: { ko: '요약 변경', en: 'Summary changed' },
  notEnoughHistory: { ko: '비교할 히스토리 스냅샷이 부족합니다.', en: 'Not enough snapshots to compare.' },
  chooseSnapshot: { ko: '스냅샷 선택', en: 'Select snapshot' },
  historyTrend: { ko: '버전 추이', en: 'Version trend' },
  minValue: { ko: '최소값', en: 'Min' },
  maxValue: { ko: '최대값', en: 'Max' },
  sourceDiff: { ko: '출처 변경', en: 'Source diff' },
  addedSources: { ko: '추가된 출처', en: 'Added sources' },
  removedSources: { ko: '제거된 출처', en: 'Removed sources' },
  sharedSources: { ko: '공통 출처', en: 'Shared sources' },
  none: { ko: '-', en: '-' },
  cctv: { ko: 'CCTV', en: 'CCTV' },
  frame: { ko: 'Frame', en: 'Frame' },
  pipeline: { ko: 'Pipeline', en: 'Pipeline' },
  raw: { ko: 'Raw', en: 'Raw' },
  frameInfo: { ko: '프레임 정보', en: 'Frame info' },
  pipelineInfo: { ko: '파이프라인 정보', en: 'Pipeline info' },
  rawInfo: { ko: '원본 링크', en: 'Raw links' },
};

const BASE_TAB_ORDER: TraceTab[] = ['summary', 'logic', 'sources'];

const toNumberFromDisplayValue = (value?: string): number | null => {
  if (!value) return null;
  const matched = value.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  if (!matched) return null;
  const num = Number(matched[0]);
  return Number.isFinite(num) ? num : null;
};

const getDeltaClassName = (delta: number | null): string => {
  if (delta === null) return 'text-gray-300';
  if (delta > 0) return 'text-[#3fb950]';
  if (delta < 0) return 'text-[#f85149]';
  return 'text-gray-100';
};

const TracePanel = ({ lang, open, trace, onClose }: TracePanelProps) => {
  const [tab, setTab] = useState<TraceTab>('summary');
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);
  const [sourceContext, setSourceContext] = useState<SourceContext>('current');
  const [isCopied, setIsCopied] = useState(false);
  const [cctvView, setCctvView] = useState<CctvView>('frame');
  const [targetHistoryIndex, setTargetHistoryIndex] = useState(0);
  const [baseHistoryIndex, setBaseHistoryIndex] = useState(1);
  const isCctvTrace = trace?.trace_id.startsWith('cctv:') ?? false;
  const normalizedHistory = useMemo(() => {
    if (!trace) return [];

    const timeline = [...(trace.version_history ?? [])];
    if (trace.source_version || trace.snapshot_at) {
      timeline.unshift({
        source_version: trace.source_version ?? '-',
        snapshot_at: trace.snapshot_at ?? '-',
        display_value: trace.display_value,
        logic_summary: trace.logic_summary,
        confidence: trace.confidence,
        data_source: trace.data_source,
      });
    }

    const deduped = timeline.filter((item, idx) => {
      const key = `${item.source_version}::${item.snapshot_at}`;
      return (
        timeline.findIndex((candidate) => `${candidate.source_version}::${candidate.snapshot_at}` === key) === idx
      );
    });

    return deduped;
  }, [trace]);
  const hasVersionHistory = normalizedHistory.length > 0;
  const tabOrder = useMemo<TraceTab[]>(
    () => [
      ...BASE_TAB_ORDER,
      ...(hasVersionHistory ? (['history'] as TraceTab[]) : []),
      ...(isCctvTrace ? (['cctv'] as TraceTab[]) : []),
    ],
    [hasVersionHistory, isCctvTrace]
  );

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    setTab('summary');
    setSelectedSourceIndex(0);
    setSourceContext('current');
    setIsCopied(false);
    setCctvView('frame');
    setTargetHistoryIndex(0);
    setBaseHistoryIndex(1);
  }, [trace?.trace_id, open]);
  const selectedTargetHistory = normalizedHistory[targetHistoryIndex] ?? null;
  const selectedBaseHistory = normalizedHistory[baseHistoryIndex] ?? null;
  const sourceContextMap = useMemo<Record<SourceContext, DataSourceReference[]>>(
    () => ({
      current: trace?.data_source ?? [],
      target: selectedTargetHistory?.data_source ?? [],
      base: selectedBaseHistory?.data_source ?? [],
    }),
    [selectedBaseHistory, selectedTargetHistory, trace]
  );
  const activeSourceContext: SourceContext =
    sourceContextMap[sourceContext].length > 0 ? sourceContext : 'current';
  const activeSourceList = sourceContextMap[activeSourceContext];
  const selectedSource = useMemo(() => {
    if (activeSourceList.length === 0) return null;
    return activeSourceList[Math.min(selectedSourceIndex, activeSourceList.length - 1)] ?? null;
  }, [activeSourceList, selectedSourceIndex]);
  const selectedCctvSource = selectedSource ?? trace?.data_source[0] ?? null;

  useEffect(() => {
    if (activeSourceList.length === 0) {
      if (selectedSourceIndex !== 0) {
        setSelectedSourceIndex(0);
      }
      return;
    }

    if (selectedSourceIndex >= activeSourceList.length) {
      setSelectedSourceIndex(0);
    }
  }, [activeSourceList.length, selectedSourceIndex]);

  const traceShareUrl = useMemo(() => {
    if (!trace || typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('trace', trace.trace_id);
    return url.toString();
  }, [trace]);
  const targetValueNumber = toNumberFromDisplayValue(selectedTargetHistory?.display_value);
  const baseValueNumber = toNumberFromDisplayValue(selectedBaseHistory?.display_value);
  const canCompareNumeric = targetValueNumber !== null && baseValueNumber !== null;
  const valueDelta = canCompareNumeric ? targetValueNumber - baseValueNumber : null;
  const targetConfidence = selectedTargetHistory?.confidence;
  const baseConfidence = selectedBaseHistory?.confidence;
  const confidenceDelta =
    typeof targetConfidence === 'number' && typeof baseConfidence === 'number'
      ? targetConfidence - baseConfidence
      : null;
  const isPercentComparison =
    selectedTargetHistory?.display_value?.includes('%') && selectedBaseHistory?.display_value?.includes('%');
  const isGramComparison =
    selectedTargetHistory?.display_value?.includes('g') || selectedBaseHistory?.display_value?.includes('g');
  const valueDeltaSuffix = isPercentComparison ? 'pp' : isGramComparison ? 'g' : '';
  const sourceDiff = useMemo(() => {
    const targetSources = selectedTargetHistory?.data_source ?? [];
    const baseSources = selectedBaseHistory?.data_source ?? [];

    const targetMap = new Map(targetSources.map((source) => [source.source_id, source] as const));
    const baseMap = new Map(baseSources.map((source) => [source.source_id, source] as const));

    const added = targetSources.filter((source) => !baseMap.has(source.source_id));
    const removed = baseSources.filter((source) => !targetMap.has(source.source_id));
    const shared = targetSources.filter((source) => baseMap.has(source.source_id));

    return { added, removed, shared };
  }, [selectedBaseHistory, selectedTargetHistory]);
  const historyChartData = useMemo(() => {
    const timeline = [...normalizedHistory].reverse();
    const width = 300;
    const height = 64;
    const padding = 8;

    const numericTimeline = timeline.map((item, idx) => ({
      idx,
      value: toNumberFromDisplayValue(item.display_value),
      sourceVersion: item.source_version,
    }));
    const numericPoints = numericTimeline.filter(
      (point): point is typeof point & { value: number } => point.value !== null
    );

    if (timeline.length < 2 || numericPoints.length < 2) {
      return null;
    }

    const min = Math.min(...numericPoints.map((point) => point.value));
    const max = Math.max(...numericPoints.map((point) => point.value));
    const range = Math.max(max - min, 1);
    const xStep = (width - padding * 2) / Math.max(timeline.length - 1, 1);

    const points = numericTimeline
      .map((point) => {
        if (point.value === null) return null;
        const x = padding + point.idx * xStep;
        const y = padding + ((max - point.value) / range) * (height - padding * 2);
        return {
          x: Number(x.toFixed(2)),
          y: Number(y.toFixed(2)),
          value: point.value,
          sourceVersion: point.sourceVersion,
        };
      })
      .filter((point): point is { x: number; y: number; value: number; sourceVersion: string } => point !== null);

    if (points.length < 2) {
      return null;
    }

    const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(' ');
    return { width, height, points, polylinePoints, min, max };
  }, [normalizedHistory]);

  const handleOpenSourceFromHistory = (source: DataSourceReference, preferredContext: SourceContext) => {
    const preferredList = sourceContextMap[preferredContext];
    const preferredIndex = preferredList.findIndex((item) => item.source_id === source.source_id);
    if (preferredIndex >= 0) {
      setSourceContext(preferredContext);
      setSelectedSourceIndex(preferredIndex);
      setTab('sources');
      return;
    }

    const currentIndex = sourceContextMap.current.findIndex((item) => item.source_id === source.source_id);
    setSourceContext('current');
    setSelectedSourceIndex(currentIndex >= 0 ? currentIndex : 0);
    setTab('sources');
  };

  const handleCopyTraceUrl = async () => {
    if (!traceShareUrl || !navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(traceShareUrl);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1500);
    } catch {
      setIsCopied(false);
    }
  };

  if (!open || !trace) {
    return null;
  }

  const originClass = trace.is_ai_generated
    ? 'border-[#8b5cf6] text-[#ddd6fe] bg-[#8b5cf6]/10'
    : 'border-[#4da3ff] text-[#bfdbfe] bg-[#4da3ff]/10';

  return (
    <>
      <button
        type="button"
        aria-label="trace overlay"
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />
      <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-[760px] border-l border-[#30363d] bg-[#0d1117] text-gray-200 shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between border-b border-[#30363d] px-4 py-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">{t.title[lang]}</h2>
                <span className={`rounded-[2px] border px-2 py-0.5 text-[10px] font-semibold ${originClass}`}>
                  {trace.is_ai_generated ? t.originAi[lang] : t.originHuman[lang]}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                {t.traceId[lang]}: {trace.trace_id}
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 border border-[#30363d] px-2 py-1 text-xs text-gray-300 hover:bg-[#21262d]"
              onClick={onClose}
            >
              <X className="h-3.5 w-3.5" />
              Close
            </button>
          </div>

          <div className="flex items-center gap-1 border-b border-[#30363d] px-4 py-2">
            {tabOrder.map((item) => {
              const isActive = tab === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={`border px-3 py-1 text-xs transition-colors ${
                    isActive
                      ? 'border-[#3fb950] bg-[#3fb950]/10 text-[#3fb950]'
                      : 'border-[#30363d] text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {t[item][lang]}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                void handleCopyTraceUrl();
              }}
              className="ml-auto inline-flex items-center gap-1 border border-[#30363d] px-2 py-1 text-xs text-gray-300 hover:bg-[#21262d]"
            >
              <Link2 className="h-3.5 w-3.5" />
              {isCopied ? t.copied[lang] : t.copyLink[lang]}
            </button>
          </div>

          <div className="flex-1 overflow-auto px-4 py-3 text-sm">
            {tab === 'summary' && (
              <div className="space-y-3">
                <div className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-3">
                  <p className="text-[11px] text-gray-500">{t.displayValue[lang]}</p>
                  <p className="mt-1 text-lg font-semibold text-gray-100">{trace.display_value}</p>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs text-gray-300 md:grid-cols-2">
                  <div className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-3">
                    <p className="text-gray-500">{t.snapshotAt[lang]}</p>
                    <p className="mt-1">{trace.snapshot_at ?? '-'}</p>
                  </div>
                  <div className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-3">
                    <p className="text-gray-500">{t.version[lang]}</p>
                    <p className="mt-1">{trace.source_version ?? '-'}</p>
                  </div>
                </div>
                <div className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-3">
                  <p className="text-[11px] text-gray-500">{t.logicSummary[lang]}</p>
                  <p className="mt-1 text-sm text-gray-200">{trace.logic_summary}</p>
                </div>
                <div className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-3 text-xs">
                  <p className="text-gray-500">{t.confidence[lang]}</p>
                  <p className="mt-1 text-gray-200">{trace.confidence !== undefined ? `${Math.round(trace.confidence * 100)}%` : '-'}</p>
                </div>
              </div>
            )}

            {tab === 'logic' && (
              <div className="space-y-3">
                <div className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-3">
                  <p className="text-[11px] text-gray-500">{t.logicSummary[lang]}</p>
                  <p className="mt-1 text-sm text-gray-200">{trace.logic_summary}</p>
                </div>
                <div className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-3">
                  <p className="text-[11px] text-gray-500">{t.formula[lang]}</p>
                  <pre className="mt-1 whitespace-pre-wrap text-xs text-gray-300">
                    {trace.logic_formula ?? t.noFormula[lang]}
                  </pre>
                </div>
                <div className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-3 text-xs text-gray-300">
                  <p className="text-gray-500">{t.sourceList[lang]}</p>
                  <ul className="mt-1 space-y-1">
                    {trace.data_source.map((source) => (
                      <li key={source.source_id}>
                        - [{SOURCE_TYPE_LABEL[source.type][lang]}] {source.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {tab === 'sources' && (
              <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">{t.sourceList[lang]}</p>
                  <div className="flex flex-wrap gap-1">
                    {(['current', 'target', 'base'] as SourceContext[]).map((context) => {
                      const isActive = activeSourceContext === context;
                      const sourceCount = sourceContextMap[context].length;
                      return (
                        <button
                          key={context}
                          type="button"
                          onClick={() => {
                            setSourceContext(context);
                            setSelectedSourceIndex(0);
                          }}
                          disabled={sourceCount === 0}
                          className={`border px-2 py-1 text-[11px] transition-colors ${
                            isActive
                              ? 'border-[#3fb950] bg-[#3fb950]/10 text-[#3fb950]'
                              : 'border-[#30363d] text-gray-400 hover:text-gray-200 disabled:cursor-not-allowed disabled:opacity-40'
                          }`}
                        >
                          {context === 'current'
                            ? t.sourceCurrent[lang]
                            : context === 'target'
                              ? t.sourceTarget[lang]
                              : t.sourceBase[lang]}{' '}
                          ({sourceCount})
                        </button>
                      );
                    })}
                  </div>
                  {activeSourceList.map((source, index) => {
                    const active = index === selectedSourceIndex;
                    return (
                      <button
                        key={source.source_id}
                        type="button"
                        onClick={() => setSelectedSourceIndex(index)}
                        className={`w-full border px-2 py-2 text-left text-xs transition-colors ${
                          active
                            ? 'border-[#3fb950] bg-[#3fb950]/10 text-[#3fb950]'
                            : 'border-[#30363d] text-gray-300 hover:bg-[#1f2937]'
                        }`}
                      >
                        <p className="font-semibold">{source.name}</p>
                        <p className="text-[11px] text-gray-500">{SOURCE_TYPE_LABEL[source.type][lang]}</p>
                      </button>
                    );
                  })}
                  {activeSourceList.length === 0 && (
                    <p className="text-xs text-gray-500">{t.none[lang]}</p>
                  )}
                </div>

                <div className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-3">
                  <p className="text-xs text-gray-500">{t.sourceDetail[lang]}</p>
                  {selectedSource ? (
                    <div className="mt-2 space-y-2 text-xs text-gray-300">
                      <div className="rounded-[2px] border border-[#30363d] bg-[#0d1117] p-2">
                        <p className="text-[11px] text-gray-500">{SOURCE_TYPE_LABEL[selectedSource.type][lang]}</p>
                        <p className="mt-1 text-sm text-gray-100">{selectedSource.name}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-[2px] border border-[#30363d] bg-[#0d1117] p-2">
                          <p className="text-gray-500">{t.page[lang]}</p>
                          <p className="mt-1">{selectedSource.page ?? '-'}</p>
                        </div>
                        <div className="rounded-[2px] border border-[#30363d] bg-[#0d1117] p-2">
                          <p className="text-gray-500">{t.row[lang]}</p>
                          <p className="mt-1">{selectedSource.row_id ?? '-'}</p>
                        </div>
                      </div>

                      <div className="rounded-[2px] border border-[#30363d] bg-[#0d1117] p-2">
                        <p className="text-gray-500">{t.highlight[lang]}</p>
                        <p className="mt-1 whitespace-pre-wrap text-gray-200">{selectedSource.highlight_text ?? '-'}</p>
                      </div>

                      <div className="rounded-[2px] border border-[#30363d] bg-[#0d1117] p-2">
                        <p className="text-gray-500">{t.anchor[lang]}</p>
                        <p className="mt-1 text-gray-200">{selectedSource.highlight_anchor ?? '-'}</p>
                      </div>

                      <a
                        href={selectedSource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 border border-[#30363d] px-2 py-1 text-xs text-gray-200 hover:bg-[#21262d]"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {t.openSource[lang]}
                      </a>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-gray-500">-</p>
                  )}
                </div>
              </div>
            )}

            {tab === 'history' && (
              <div className="space-y-3">
                {normalizedHistory.length < 2 ? (
                  <div className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-3 text-xs text-gray-400">
                    {t.notEnoughHistory[lang]}
                  </div>
                ) : (
                  <>
                    {historyChartData && (
                      <div className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-3">
                        <p className="text-[11px] text-gray-500">{t.historyTrend[lang]}</p>
                        <div className="mt-2 overflow-x-auto">
                          <svg width={historyChartData.width} height={historyChartData.height} role="img" aria-label={t.historyTrend[lang]}>
                            <polyline
                              points={historyChartData.polylinePoints}
                              fill="none"
                              stroke="#58a6ff"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {historyChartData.points.map((point, idx) => (
                              <circle
                                key={`${point.sourceVersion}-${idx}`}
                                cx={point.x}
                                cy={point.y}
                                r={2.6}
                                fill={idx === historyChartData.points.length - 1 ? '#3fb950' : '#c9d1d9'}
                              />
                            ))}
                          </svg>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                          <span>
                            {t.minValue[lang]}: {historyChartData.min.toLocaleString()}
                          </span>
                          <span>
                            {t.maxValue[lang]}: {historyChartData.max.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <label className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-3 text-xs text-gray-300">
                        <p className="text-gray-500">{t.targetSnapshot[lang]}</p>
                        <select
                          value={targetHistoryIndex}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            setTargetHistoryIndex(next);
                            if (next === baseHistoryIndex) {
                              const fallback = next + 1 < normalizedHistory.length ? next + 1 : Math.max(next - 1, 0);
                              setBaseHistoryIndex(fallback);
                            }
                          }}
                          className="mt-2 w-full border border-[#30363d] bg-[#0d1117] px-2 py-1 text-xs text-gray-200 outline-none"
                          aria-label={t.chooseSnapshot[lang]}
                        >
                          {normalizedHistory.map((item, idx) => (
                            <option key={`${item.source_version}-${item.snapshot_at}-${idx}`} value={idx}>
                              {item.source_version} @ {item.snapshot_at}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-3 text-xs text-gray-300">
                        <p className="text-gray-500">{t.baseSnapshot[lang]}</p>
                        <select
                          value={baseHistoryIndex}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            setBaseHistoryIndex(next);
                            if (next === targetHistoryIndex) {
                              const fallback = next - 1 >= 0 ? next - 1 : Math.min(next + 1, normalizedHistory.length - 1);
                              setTargetHistoryIndex(fallback);
                            }
                          }}
                          className="mt-2 w-full border border-[#30363d] bg-[#0d1117] px-2 py-1 text-xs text-gray-200 outline-none"
                          aria-label={t.chooseSnapshot[lang]}
                        >
                          {normalizedHistory.map((item, idx) => (
                            <option key={`${item.source_version}-${item.snapshot_at}-${idx}`} value={idx}>
                              {item.source_version} @ {item.snapshot_at}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-3">
                      <p className="text-[11px] text-gray-500">{t.compare[lang]}</p>
                      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-4">
                        <div className="rounded-[2px] border border-[#30363d] bg-[#0d1117] p-2 text-xs text-gray-300">
                          <p className="text-gray-500">{t.targetSnapshot[lang]}</p>
                          <p className="mt-1 text-gray-100">{selectedTargetHistory?.display_value ?? '-'}</p>
                          <p className="mt-1 text-[11px] text-gray-500">
                            {selectedTargetHistory?.source_version ?? '-'} / {selectedTargetHistory?.snapshot_at ?? '-'}
                          </p>
                        </div>
                        <div className="rounded-[2px] border border-[#30363d] bg-[#0d1117] p-2 text-xs text-gray-300">
                          <p className="text-gray-500">{t.baseSnapshot[lang]}</p>
                          <p className="mt-1 text-gray-100">{selectedBaseHistory?.display_value ?? '-'}</p>
                          <p className="mt-1 text-[11px] text-gray-500">
                            {selectedBaseHistory?.source_version ?? '-'} / {selectedBaseHistory?.snapshot_at ?? '-'}
                          </p>
                        </div>
                        <div className="rounded-[2px] border border-[#30363d] bg-[#0d1117] p-2 text-xs text-gray-300">
                          <p className="text-gray-500">{t.valueDelta[lang]}</p>
                          <p className={`mt-1 text-sm ${getDeltaClassName(valueDelta)}`}>
                            {valueDelta === null
                              ? '-'
                              : `${valueDelta >= 0 ? '+' : ''}${valueDelta.toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })}${valueDeltaSuffix}`}
                          </p>
                        </div>
                        <div className="rounded-[2px] border border-[#30363d] bg-[#0d1117] p-2 text-xs text-gray-300">
                          <p className="text-gray-500">{t.confidenceDelta[lang]}</p>
                          <p className={`mt-1 text-sm ${getDeltaClassName(confidenceDelta)}`}>
                            {confidenceDelta === null
                              ? '-'
                              : `${confidenceDelta >= 0 ? '+' : ''}${(confidenceDelta * 100).toFixed(1)}pp`}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 rounded-[2px] border border-[#30363d] bg-[#0d1117] p-2 text-xs text-gray-300">
                        <p className="text-gray-500">{t.sourceDiff[lang]}</p>
                        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                          <div className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-2">
                            <p className="text-[#3fb950]">{t.addedSources[lang]}</p>
                            <ul className="mt-1 space-y-1 text-gray-200">
                              {sourceDiff.added.length > 0 ? (
                                sourceDiff.added.map((source) => (
                                  <li key={`added-${source.source_id}`}>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenSourceFromHistory(source, 'target')}
                                      className="w-full truncate text-left hover:text-[#58a6ff]"
                                      title={t.sourceOpenHint[lang]}
                                    >
                                      + [{SOURCE_TYPE_LABEL[source.type][lang]}] {source.name}
                                    </button>
                                  </li>
                                ))
                              ) : (
                                <li>{t.none[lang]}</li>
                              )}
                            </ul>
                          </div>
                          <div className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-2">
                            <p className="text-[#f85149]">{t.removedSources[lang]}</p>
                            <ul className="mt-1 space-y-1 text-gray-200">
                              {sourceDiff.removed.length > 0 ? (
                                sourceDiff.removed.map((source) => (
                                  <li key={`removed-${source.source_id}`}>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenSourceFromHistory(source, 'base')}
                                      className="w-full truncate text-left hover:text-[#58a6ff]"
                                      title={t.sourceOpenHint[lang]}
                                    >
                                      - [{SOURCE_TYPE_LABEL[source.type][lang]}] {source.name}
                                    </button>
                                  </li>
                                ))
                              ) : (
                                <li>{t.none[lang]}</li>
                              )}
                            </ul>
                          </div>
                          <div className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-2">
                            <p className="text-gray-400">{t.sharedSources[lang]}</p>
                            <ul className="mt-1 space-y-1 text-gray-200">
                              {sourceDiff.shared.length > 0 ? (
                                sourceDiff.shared.map((source) => (
                                  <li key={`shared-${source.source_id}`}>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenSourceFromHistory(source, 'target')}
                                      className="w-full truncate text-left hover:text-[#58a6ff]"
                                      title={t.sourceOpenHint[lang]}
                                    >
                                      = [{SOURCE_TYPE_LABEL[source.type][lang]}] {source.name}
                                    </button>
                                  </li>
                                ))
                              ) : (
                                <li>{t.none[lang]}</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 rounded-[2px] border border-[#30363d] bg-[#0d1117] p-2 text-xs text-gray-300">
                        <p className="text-gray-500">
                          {selectedTargetHistory?.logic_summary === selectedBaseHistory?.logic_summary
                            ? t.sameSummary[lang]
                            : t.changedSummary[lang]}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-gray-200">
                          {selectedTargetHistory?.logic_summary ?? trace.logic_summary}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === 'cctv' && isCctvTrace && (
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {(['frame', 'pipeline', 'raw'] as CctvView[]).map((view) => {
                    const active = cctvView === view;
                    return (
                      <button
                        key={view}
                        type="button"
                        onClick={() => setCctvView(view)}
                        className={`border px-3 py-1 text-xs transition-colors ${
                          active
                            ? 'border-[#3fb950] bg-[#3fb950]/10 text-[#3fb950]'
                            : 'border-[#30363d] text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        {t[view][lang]}
                      </button>
                    );
                  })}
                </div>

                {cctvView === 'frame' && (
                  <div className="space-y-2">
                    <div className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-3">
                      <p className="text-[11px] text-gray-500">{t.frameInfo[lang]}</p>
                      <p className="mt-1 text-sm text-gray-100">{trace.display_value}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {t.snapshotAt[lang]}: {trace.snapshot_at ?? '-'}
                      </p>
                    </div>
                    <div className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-3 text-xs text-gray-300">
                      <p className="text-gray-500">{t.highlight[lang]}</p>
                      <p className="mt-1 whitespace-pre-wrap text-gray-200">
                        {selectedCctvSource?.highlight_text ?? '-'}
                      </p>
                      <p className="mt-2 text-gray-500">{t.anchor[lang]}</p>
                      <p className="mt-1 text-gray-200">{selectedCctvSource?.highlight_anchor ?? '-'}</p>
                    </div>
                  </div>
                )}

                {cctvView === 'pipeline' && (
                  <div className="space-y-2">
                    <div className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-3">
                      <p className="text-[11px] text-gray-500">{t.pipelineInfo[lang]}</p>
                      <p className="mt-1 text-sm text-gray-200">{trace.logic_summary}</p>
                    </div>
                    <div className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-3">
                      <p className="text-[11px] text-gray-500">{t.formula[lang]}</p>
                      <pre className="mt-1 whitespace-pre-wrap text-xs text-gray-300">
                        {trace.logic_formula ?? t.noFormula[lang]}
                      </pre>
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <div className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-3 text-xs">
                        <p className="text-gray-500">{t.version[lang]}</p>
                        <p className="mt-1 text-gray-200">{trace.source_version ?? '-'}</p>
                      </div>
                      <div className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-3 text-xs">
                        <p className="text-gray-500">{t.confidence[lang]}</p>
                        <p className="mt-1 text-gray-200">
                          {trace.confidence !== undefined ? `${Math.round(trace.confidence * 100)}%` : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {cctvView === 'raw' && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">{t.rawInfo[lang]}</p>
                    {trace.data_source.map((source) => (
                      <div key={source.source_id} className="rounded-[2px] border border-[#30363d] bg-[#11161d] p-3">
                        <p className="text-sm font-semibold text-gray-100">{source.name}</p>
                        <p className="mt-1 text-[11px] text-gray-500">
                          [{SOURCE_TYPE_LABEL[source.type][lang]}] {source.source_id}
                        </p>
                        <p className="mt-2 text-xs text-gray-300 break-all">{source.url}</p>
                        <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-gray-300 md:grid-cols-2">
                          <div>
                            <p className="text-gray-500">{t.highlight[lang]}</p>
                            <p className="mt-1 whitespace-pre-wrap">{source.highlight_text ?? '-'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">{t.anchor[lang]}</p>
                            <p className="mt-1">{source.highlight_anchor ?? '-'}</p>
                          </div>
                        </div>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1 border border-[#30363d] px-2 py-1 text-xs text-gray-200 hover:bg-[#21262d]"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          {t.openSource[lang]}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default TracePanel;
