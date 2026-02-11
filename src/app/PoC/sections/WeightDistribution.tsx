'use client';

import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
  Cell,
} from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';
import TraceableValue from '../components/trace/TraceableValue';
import type { TraceabilityPayload } from '@/types/traceability';

type Lang = 'ko' | 'en';
type Zone = 'under' | 'target' | 'over';

interface WeightDistributionProps {
  lang: Lang;
  onOpenTrace: (trace: TraceabilityPayload) => void;
}

type RawPoint = { x: number; y: number };

type BinRow = {
  center: number;
  rangeStart: number;
  rangeEnd: number;
  rangeLabel: string;
  count: number;
  prevCount: number;
  percentage: number;
  cumulative: number;
  zone: Zone;
};

const DISTRIBUTION_STAT_TIME = '2026-01-28 03:00:00';
const DIST_Y_AXIS_WIDTH = 28;
// International heavy-broiler processing standard: mean ± 10% (deboning category 2,500-3,200g+).
// Ross 308 mixed-sex ~40d ≈ 2,981g mean → band 2,700-3,300g.
const DEFAULT_TARGET_MIN = 2820;
const DEFAULT_TARGET_MAX = 3300;

const RAW_POINTS: RawPoint[] = [
  { x: 2258.8, y: 21 },
  { x: 2267.3, y: 24 },
  { x: 2275.9, y: 28 },
  { x: 2284.5, y: 31 },
  { x: 2293.1, y: 34 },
  { x: 2301.6, y: 37 },
  { x: 2310.2, y: 40 },
  { x: 2318.8, y: 43 },
  { x: 2327.3, y: 46 },
  { x: 2335.9, y: 49 },
  { x: 2344.5, y: 51 },
  { x: 2353.0, y: 54 },
  { x: 2361.6, y: 56 },
  { x: 2370.2, y: 58 },
  { x: 2378.7, y: 60 },
  { x: 2387.3, y: 62 },
  { x: 2395.9, y: 65 },
  { x: 2404.4, y: 67 },
  { x: 2413.0, y: 69 },
  { x: 2421.6, y: 71 },
  { x: 2430.1, y: 72 },
  { x: 2438.7, y: 74 },
  { x: 2447.3, y: 76 },
  { x: 2455.8, y: 78 },
  { x: 2464.4, y: 80 },
  { x: 2473.0, y: 82 },
  { x: 2481.5, y: 83 },
  { x: 2490.1, y: 85 },
  { x: 2498.7, y: 87 },
  { x: 2507.3, y: 88 },
  { x: 2515.8, y: 89 },
  { x: 2524.4, y: 90 },
  { x: 2533.0, y: 91 },
  { x: 2541.5, y: 92 },
  { x: 2550.1, y: 93 },
  { x: 2558.7, y: 94 },
  { x: 2567.2, y: 95 },
  { x: 2575.8, y: 95 },
  { x: 2584.4, y: 96 },
  { x: 2592.9, y: 98 },
  { x: 2601.5, y: 99 },
  { x: 2610.1, y: 100 },
  { x: 2618.6, y: 102 },
  { x: 2627.2, y: 105 },
  { x: 2635.8, y: 107 },
  { x: 2644.3, y: 110 },
  { x: 2652.9, y: 113 },
  { x: 2661.5, y: 116 },
  { x: 2670.0, y: 119 },
  { x: 2678.6, y: 122 },
  { x: 2687.2, y: 125 },
  { x: 2695.7, y: 127 },
  { x: 2704.3, y: 130 },
  { x: 2712.9, y: 133 },
  { x: 2721.4, y: 135 },
  { x: 2730.0, y: 137 },
  { x: 2738.6, y: 139 },
  { x: 2747.2, y: 141 },
  { x: 2755.7, y: 144 },
  { x: 2764.3, y: 146 },
  { x: 2772.9, y: 148 },
  { x: 2781.4, y: 151 },
  { x: 2790.0, y: 153 },
  { x: 2798.6, y: 156 },
  { x: 2807.1, y: 159 },
  { x: 2815.7, y: 162 },
  { x: 2824.3, y: 165 },
  { x: 2832.8, y: 168 },
  { x: 2841.4, y: 171 },
  { x: 2850.0, y: 174 },
  { x: 2858.5, y: 177 },
  { x: 2867.1, y: 180 },
  { x: 2875.7, y: 182 },
  { x: 2884.2, y: 185 },
  { x: 2892.8, y: 187 },
  { x: 2901.4, y: 189 },
  { x: 2909.9, y: 190 },
  { x: 2918.5, y: 192 },
  { x: 2927.1, y: 193 },
  { x: 2935.6, y: 195 },
  { x: 2944.2, y: 196 },
  { x: 2952.8, y: 197 },
  { x: 2961.4, y: 199 },
  { x: 2969.9, y: 200 },
  { x: 2978.5, y: 201 },
  { x: 2987.1, y: 202 },
  { x: 2995.6, y: 204 },
  { x: 3004.2, y: 205 },
  { x: 3012.8, y: 206 },
  { x: 3021.3, y: 208 },
  { x: 3029.9, y: 209 },
  { x: 3038.5, y: 210 },
  { x: 3047.0, y: 211 },
  { x: 3055.6, y: 212 },
  { x: 3064.2, y: 214 },
  { x: 3072.7, y: 215 },
  { x: 3081.3, y: 216 },
  { x: 3089.9, y: 217 },
  { x: 3098.4, y: 219 },
  { x: 3107.0, y: 220 },
  { x: 3115.6, y: 221 },
  { x: 3124.1, y: 222 },
  { x: 3132.7, y: 222 },
  { x: 3141.3, y: 223 },
  { x: 3149.8, y: 223 },
  { x: 3158.4, y: 222 },
  { x: 3167.0, y: 221 },
  { x: 3175.6, y: 220 },
  { x: 3184.1, y: 219 },
  { x: 3192.7, y: 217 },
  { x: 3201.3, y: 215 },
  { x: 3209.8, y: 213 },
  { x: 3218.4, y: 210 },
  { x: 3227.0, y: 207 },
  { x: 3235.5, y: 204 },
  { x: 3244.1, y: 201 },
  { x: 3252.7, y: 197 },
  { x: 3261.2, y: 194 },
  { x: 3269.8, y: 190 },
  { x: 3278.4, y: 185 },
  { x: 3286.9, y: 181 },
  { x: 3295.5, y: 176 },
  { x: 3304.1, y: 171 },
  { x: 3312.6, y: 166 },
  { x: 3321.2, y: 161 },
  { x: 3329.8, y: 156 },
  { x: 3338.3, y: 150 },
  { x: 3346.9, y: 145 },
  { x: 3355.5, y: 140 },
  { x: 3364.0, y: 134 },
  { x: 3372.6, y: 129 },
  { x: 3381.2, y: 123 },
  { x: 3389.7, y: 118 },
  { x: 3398.3, y: 112 },
  { x: 3406.9, y: 107 },
  { x: 3415.5, y: 102 },
  { x: 3424.0, y: 96 },
  { x: 3432.6, y: 91 },
  { x: 3441.2, y: 86 },
  { x: 3449.7, y: 81 },
  { x: 3458.3, y: 76 },
  { x: 3466.9, y: 71 },
  { x: 3475.4, y: 66 },
  { x: 3484.0, y: 62 },
  { x: 3492.6, y: 58 },
  { x: 3501.1, y: 54 },
  { x: 3509.7, y: 50 },
  { x: 3518.3, y: 46 },
  { x: 3526.8, y: 43 },
  { x: 3535.4, y: 40 },
  { x: 3544.0, y: 37 },
  { x: 3552.5, y: 35 },
  { x: 3561.1, y: 32 },
  { x: 3569.7, y: 30 },
  { x: 3578.2, y: 27 },
  { x: 3586.8, y: 25 },
  { x: 3595.4, y: 23 },
  { x: 3603.9, y: 21 },
  { x: 3612.5, y: 18 },
  { x: 3621.1, y: 16 },
  { x: 3629.7, y: 14 },
  { x: 3638.2, y: 12 },
];

const ZONE_COLORS = {
  under: 'rgba(248, 81, 73, 0.7)',
  target: 'rgba(63, 185, 80, 0.85)',
  over: 'rgba(255, 119, 0, 0.7)',
} as const;

const TONE_COLORS = {
  good: '#3fb950',
  medium: '#ff7700',
  bad: '#f85149',
} as const;

const OP_CRITERIA = {
  bandCoverage: {
    ko: '양호 ≥ 78% / 보통 65.0~77.9% / 불량 < 65.0%',
    en: 'Good ≥ 78% / Normal 65.0~77.9% / Poor < 65.0%',
  },
  cv: {
    ko: '양호 ≤ 8.5% / 보통 8.6~10.5% / 불량 > 10.5%',
    en: 'Good ≤ 8.5% / Normal 8.6~10.5% / Poor > 10.5%',
  },
  spread: {
    ko: '양호 ≤ 18.0% / 보통 18.1~24.0% / 불량 > 24.0%',
    en: 'Good ≤ 18.0% / Normal 18.1~24.0% / Poor > 24.0%',
  },
  delta: {
    ko: '양호: Fit≥0.0%p & Under≤0.0%p / 보통: Fit≥-1.5%p & Under≤+1.5%p / 불량: 기타',
    en: 'Good: Fit≥0.0%p & Under≤0.0%p / Normal: Fit≥-1.5%p & Under≤+1.5%p / Poor: Others',
  },
} as const;

const t = {
  title: { ko: '체중 분포', en: 'WEIGHT DISTRIBUTION' },
  snapshot: { ko: '체중 측정 시각', en: 'Weights at' },
  compareD1: { ko: '전일 비교(D-1)', en: 'Compare D-1' },
  avgWeight: { ko: '평균체중', en: 'Avg Weight' },
  cv: { ko: 'CV', en: 'CV' },
  uniformity: { ko: 'Uniformity', en: 'Uniformity' },
  targetFit: { ko: '타겟 적합률', en: 'Target Fit' },
  targetRange: { ko: '목표범위', en: 'Target Range' },
  under: { ko: 'Under', en: 'Under' },
  over: { ko: 'Over', en: 'Over' },
  summaryUnder: { ko: '규격 미달 예상', en: 'Expected Under-spec' },
  detailOpen: { ko: '상세보기', en: 'Show Details' },
  detailClose: { ko: '상세닫기', en: 'Hide Details' },
  range: { ko: '체중구간', en: 'Weight Range' },
  count: { ko: '마릿수', en: 'Count' },
  ratio: { ko: '비율', en: 'Ratio' },
  cumulative: { ko: '누적비율', en: 'Cumulative' },
  targetZone: { ko: '타겟 존', en: 'Target Zone' },
  standardLine: { ko: '표준체중선', en: 'Standard' },
  meanLine: { ko: '평균선', en: 'Mean' },
  opBandCoverage: { ko: '밴드 커버리지', en: 'Band Coverage' },
  opCvGrade: { ko: 'CV 등급', en: 'CV Grade' },
  opPercentile: { ko: 'P10/P50/P90', en: 'P10/P50/P90' },
  opDelta: { ko: '전일 대비 변화', en: 'vs D-1 Delta' },
  opDescBandCoverage: { ko: '목표범위 내 예상 마릿수', en: 'Expected birds in target band' },
  opDescCvGrade: { ko: '변동성 기준 운영 등급', en: 'Operational variability grade' },
  opDescPercentile: { ko: '분포 분위수 요약', en: 'Distribution percentile summary' },
  opDescDelta: { ko: '적합률/미달률 일일 변화', en: 'Daily change of fit/under rates' },
  opKpiGroup: { ko: '운영 KPI', en: 'Operational KPI' },
  cvGood: { ko: '양호', en: 'Good' },
  cvMedium: { ko: '보통', en: 'Normal' },
  cvBad: { ko: '불량', en: 'Poor' },
  expectedShip: { ko: '예상 출하 가능', en: 'Expected Shipment Ready' },
  researchMetrics: { ko: '상세 지표', en: 'Detail Metrics' },
  legendUnder: { ko: '미달', en: 'Under' },
  legendTarget: { ko: '목표', en: 'Target' },
  legendOver: { ko: '초과', en: 'Over' },
  metricDescAvg: { ko: '전체 평균 체중', en: 'Overall average weight' },
  metricDescCv: { ko: '체중 변동성', en: 'Weight variability' },
  metricDescUniformity: { ko: '평균±10% 비율', en: 'Share within mean±10%' },
  metricDescTargetFit: { ko: '목표 구간 비율', en: 'Share in target range' },
  metricDescUnder: { ko: '목표 미달 비율', en: 'Share below target' },
  metricDescOver: { ko: '목표 초과 비율', en: 'Share above target' },
  metricDescTargetRange: { ko: '기업 출하 목표 밴드', en: 'Company shipment target band' },
  metricDescUnderCount: { ko: '즉시 대응 필요한 미달군', en: 'Under-spec birds requiring action' },
  metricDescExpectedShip: { ko: '현재 기준 출하 가능 추정', en: 'Estimated shipment-ready birds now' },
  judgmentReady: { ko: '출하가능', en: 'Ready' },
  judgmentCaution: { ko: '주의', en: 'Caution' },
  judgmentHold: { ko: '보류', en: 'Hold' },
  sampleCount: { ko: '표본수', en: 'Sample' },
} as const;

const formatPct = (v: number) => `${v.toFixed(1)}%`;
const formatCount = (v: number) => v.toLocaleString();
const formatSignedPp = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%p`;
const formatSigned = (v: number) => `${v >= 0 ? '+' : ''}${Math.round(v)}`;

const OP_THRESHOLDS = {
  bandCoverage: { goodMin: 78, mediumMin: 65 },
  cv: { goodMax: 8.5, mediumMax: 10.5 },
  spreadRatio: { goodMax: 18, mediumMax: 24 },
  delta: { targetDropMedium: -1.5, underRiseMedium: 1.5 },
} as const;

const weightedPercentile = (rows: BinRow[], p: number, total: number): number => {
  if (rows.length === 0 || total <= 0) return 0;
  const target = total * p;
  let acc = 0;
  for (const row of rows) {
    acc += row.count;
    if (acc >= target) return row.center;
  }
  return rows[rows.length - 1].center;
};

const getPoultryTone = (
  metric: 'cv' | 'uniformity' | 'targetFit' | 'under' | 'over',
  value: number,
): 'good' | 'medium' | 'bad' => {
  if (metric === 'cv') {
    if (value < 8) return 'good';
    if (value <= 12) return 'medium';
    return 'bad';
  }
  if (metric === 'uniformity') {
    if (value > 80) return 'good';
    if (value >= 60) return 'medium';
    return 'bad';
  }
  if (metric === 'targetFit') {
    if (value > 75) return 'good';
    if (value >= 50) return 'medium';
    return 'bad';
  }
  if (value < 5) return 'good';
  if (value <= 15) return 'medium';
  return 'bad';
};

const getBandCoverageTone = (fitPct: number): 'good' | 'medium' | 'bad' => {
  if (fitPct >= OP_THRESHOLDS.bandCoverage.goodMin) return 'good';
  if (fitPct >= OP_THRESHOLDS.bandCoverage.mediumMin) return 'medium';
  return 'bad';
};

const getCvOperationalTone = (cvPct: number): 'good' | 'medium' | 'bad' => {
  if (cvPct <= OP_THRESHOLDS.cv.goodMax) return 'good';
  if (cvPct <= OP_THRESHOLDS.cv.mediumMax) return 'medium';
  return 'bad';
};

const getSpreadTone = (spreadRatioPct: number): 'good' | 'medium' | 'bad' => {
  if (spreadRatioPct <= OP_THRESHOLDS.spreadRatio.goodMax) return 'good';
  if (spreadRatioPct <= OP_THRESHOLDS.spreadRatio.mediumMax) return 'medium';
  return 'bad';
};

const getDeltaTone = (deltaTargetPp: number, deltaUnderPp: number): 'good' | 'medium' | 'bad' => {
  if (deltaTargetPp >= 0 && deltaUnderPp <= 0) return 'good';
  if (deltaTargetPp >= OP_THRESHOLDS.delta.targetDropMedium && deltaUnderPp <= OP_THRESHOLDS.delta.underRiseMedium) return 'medium';
  return 'bad';
};

const buildRows = (
  points: RawPoint[],
  targetMinInput: number,
  targetMaxInput: number,
): { rows: BinRow[]; mean: number; std: number; targetMin: number; targetMax: number; totalCount: number } => {
  const sorted = [...points].sort((a, b) => a.x - b.x);
  const totalCount = sorted.reduce((acc, p) => acc + p.y, 0);

  const weightedMean = sorted.reduce((acc, p) => acc + p.x * p.y, 0) / totalCount;
  const variance = sorted.reduce((acc, p) => acc + ((p.x - weightedMean) ** 2) * p.y, 0) / totalCount;
  const std = Math.sqrt(variance);

  const targetMin = Math.min(targetMinInput, targetMaxInput);
  const targetMax = Math.max(targetMinInput, targetMaxInput);

  let cumulative = 0;
  const baseRows = sorted.map((point, index) => {
    const left = index === 0 ? point.x - (sorted[index + 1].x - point.x) / 2 : (sorted[index - 1].x + point.x) / 2;
    const right = index === sorted.length - 1 ? point.x + (point.x - sorted[index - 1].x) / 2 : (point.x + sorted[index + 1].x) / 2;
    const pct = (point.y / totalCount) * 100;
    cumulative += pct;

    const zone: Zone = point.x < targetMin ? 'under' : point.x > targetMax ? 'over' : 'target';

    // Mock D-1: keep overall counts slightly higher than today.
    const prevFactor = zone === 'target'
      ? 1.10 + Math.sin(index * 0.25) * 0.02
      : 1.08 + Math.sin(index * 0.25) * 0.02;
    const prevCountBase = Math.max(0, Math.round(point.y * prevFactor));

    return {
      center: Number(point.x.toFixed(1)),
      rangeStart: Number(left.toFixed(1)),
      rangeEnd: Number(right.toFixed(1)),
      rangeLabel: `${Math.round(left)}-${Math.round(right)}`,
      count: point.y,
      prevCountBase,
      percentage: pct,
      cumulative,
      zone,
    };
  });

  // Force "today vs D-1" target-fit delta to about -1.7%p.
  const currentTargetCount = baseRows.filter((row) => row.zone === 'target').reduce((acc, row) => acc + row.count, 0);
  const currentTargetRatio = totalCount > 0 ? currentTargetCount / totalCount : 0;
  const desiredPrevTargetRatio = Math.min(0.99, Math.max(0.01, currentTargetRatio + 0.017));

  const prevTargetBase = baseRows.filter((row) => row.zone === 'target').reduce((acc, row) => acc + row.prevCountBase, 0);
  const prevNonTargetBase = baseRows.filter((row) => row.zone !== 'target').reduce((acc, row) => acc + row.prevCountBase, 0);
  const targetBoost = prevTargetBase > 0
    ? (desiredPrevTargetRatio * prevNonTargetBase) / (prevTargetBase * (1 - desiredPrevTargetRatio))
    : 1;

  const rows = baseRows.map((row) => ({
    center: row.center,
    rangeStart: row.rangeStart,
    rangeEnd: row.rangeEnd,
    rangeLabel: row.rangeLabel,
    count: row.count,
    prevCount: Math.max(0, Math.round(row.prevCountBase * (row.zone === 'target' ? targetBoost : 1))),
    percentage: row.percentage,
    cumulative: row.cumulative,
    zone: row.zone,
  }));

  return {
    rows,
    mean: weightedMean,
    std,
    targetMin,
    targetMax,
    totalCount,
  };
};

const CustomTooltip = ({ active, payload, label, lang }: { active?: boolean; payload?: Array<{ payload: BinRow }>; label?: number; lang: Lang }) => {
  if (!active || !payload || payload.length === 0 || typeof label !== 'number') return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-[#0d1117] border border-[#30363d] p-3 shadow-xl text-xs">
      <p className="text-gray-200 font-semibold mb-2">{label.toFixed(1)}g</p>
      <p className="text-gray-300">{lang === 'ko' ? '마릿수' : 'Count'}: {formatCount(data.count)}</p>
      <p className="text-gray-400">{lang === 'ko' ? '비율' : 'Ratio'}: {formatPct(data.percentage)}</p>
      <p className="text-gray-500">{lang === 'ko' ? '누적' : 'Cumulative'}: {formatPct(data.cumulative)}</p>
    </div>
  );
};

const WeightDistribution = ({ lang, onOpenTrace }: WeightDistributionProps) => {
  const [showComparison, setShowComparison] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [tableExpanded, setTableExpanded] = useState(false);
  const [targetMinInput, setTargetMinInput] = useState<number>(DEFAULT_TARGET_MIN);
  const [targetMaxInput, setTargetMaxInput] = useState<number>(DEFAULT_TARGET_MAX);

  const model = useMemo(
    () => buildRows(RAW_POINTS, targetMinInput, targetMaxInput),
    [targetMinInput, targetMaxInput],
  );

  const stats = useMemo(() => {
    const cv = (model.std / model.mean) * 100;
    const uniformityLow = model.mean * 0.9;
    const uniformityHigh = model.mean * 1.1;

    const inUniformCount = model.rows
      .filter((row) => row.center >= uniformityLow && row.center <= uniformityHigh)
      .reduce((acc, row) => acc + row.count, 0);

    const targetCount = model.rows.filter((row) => row.zone === 'target').reduce((acc, row) => acc + row.count, 0);
    const underCount = model.rows.filter((row) => row.zone === 'under').reduce((acc, row) => acc + row.count, 0);
    const overCount = model.rows.filter((row) => row.zone === 'over').reduce((acc, row) => acc + row.count, 0);

    return {
      cv,
      uniformity: (inUniformCount / model.totalCount) * 100,
      targetFit: (targetCount / model.totalCount) * 100,
      under: (underCount / model.totalCount) * 100,
      over: (overCount / model.totalCount) * 100,
      targetCount,
      underCount,
      overCount,
      p10: weightedPercentile(model.rows, 0.1, model.totalCount),
      p50: weightedPercentile(model.rows, 0.5, model.totalCount),
      p90: weightedPercentile(model.rows, 0.9, model.totalCount),
    };
  }, [model]);

  const prevStats = useMemo(() => {
    const prevTotal = model.rows.reduce((acc, row) => acc + row.prevCount, 0);
    if (prevTotal <= 0) return { targetFit: 0, under: 0 };
    const prevTargetCount = model.rows.filter((row) => row.zone === 'target').reduce((acc, row) => acc + row.prevCount, 0);
    const prevUnderCount = model.rows.filter((row) => row.zone === 'under').reduce((acc, row) => acc + row.prevCount, 0);
    return {
      targetFit: (prevTargetCount / prevTotal) * 100,
      under: (prevUnderCount / prevTotal) * 100,
    };
  }, [model.rows]);

  const cvTone = getCvOperationalTone(stats.cv);
  const cvLabel = cvTone === 'good' ? t.cvGood[lang] : cvTone === 'medium' ? t.cvMedium[lang] : t.cvBad[lang];
  const deltaTarget = stats.targetFit - prevStats.targetFit;
  const deltaUnder = stats.under - prevStats.under;
  const spreadRatio = ((stats.p90 - stats.p10) / model.mean) * 100;
  const spreadTone = getSpreadTone(spreadRatio);
  const standardWeight = (model.targetMin + model.targetMax) / 2;

  const judgmentLabel =
    stats.targetFit >= 75 ? t.judgmentReady[lang]
    : stats.targetFit >= 50 ? t.judgmentCaution[lang]
    : t.judgmentHold[lang];
  const judgmentTone: 'good' | 'medium' | 'bad' =
    stats.targetFit >= 75 ? 'good' : stats.targetFit >= 50 ? 'medium' : 'bad';

  const buildKpiTrace = ({
    key,
    value,
    logicSummary,
    logicFormula,
    isAiGenerated,
    highlightText,
    confidence,
  }: {
    key: string;
    value: string;
    logicSummary: string;
    logicFormula: string;
    isAiGenerated: boolean;
    highlightText: string;
    confidence?: number;
  }): TraceabilityPayload => ({
    trace_id: `weight-distribution:${key}`,
    display_value: value,
    logic_summary: logicSummary,
    logic_formula: logicFormula,
    data_source: [
      {
        source_id: 'db:weight_histogram:2026-01-28-03',
        type: 'db',
        name: 'weight_histogram_daily',
        url: 'https://p-root.local/db/weight_histogram_daily?batch=2026-01-28T03:00:00',
        row_id: 'house=H01,batch=2026-01-28T03:00:00',
        highlight_text: highlightText,
        highlight_anchor: `metric=${key}`,
      },
      {
        source_id: isAiGenerated ? 'file:model_weight_ops_20260207' : 'db:weight_distribution_ops',
        type: isAiGenerated ? 'file' : 'db',
        name: isAiGenerated ? 'weight_ops_model_report_20260207.json' : 'weight_distribution_ops_snapshot',
        url: isAiGenerated
          ? 'https://p-root.local/files/weight_ops_model_report_20260207.json'
          : 'https://p-root.local/db/weight_distribution_ops_snapshot?batch=2026-01-28T03:00:00',
        highlight_text: logicFormula,
        highlight_anchor: isAiGenerated ? '$.metrics' : `ops_metric=${key}`,
      },
    ],
    is_ai_generated: isAiGenerated,
    source_version: isAiGenerated ? 'model-2.4.1' : 'v2026.02.11',
    snapshot_at: DISTRIBUTION_STAT_TIME,
    confidence,
    version_history: isAiGenerated
      ? [
          {
            source_version: 'model-2.4.0',
            snapshot_at: '2026-01-27 03:00:00',
            display_value: value,
            logic_summary:
              lang === 'ko'
                ? '이전 버전 대비 분포 가중치가 보수적으로 적용되었습니다.'
                : 'Previous version applied a more conservative distribution weight.',
            confidence: confidence !== undefined ? Math.max(confidence - 0.04, 0) : undefined,
            data_source: [
              {
                source_id: 'file:model_weight_ops_20260127',
                type: 'file',
                name: 'weight_ops_model_report_20260127.json',
                url: 'https://p-root.local/files/weight_ops_model_report_20260127.json',
                highlight_text: logicFormula,
                highlight_anchor: '$.metrics',
              },
              {
                source_id: 'db:weight_histogram:2026-01-27-03',
                type: 'db',
                name: 'weight_histogram_daily',
                url: 'https://p-root.local/db/weight_histogram_daily?batch=2026-01-27T03:00:00',
                row_id: 'house=H01,batch=2026-01-27T03:00:00',
                highlight_text: highlightText,
                highlight_anchor: `metric=${key}`,
              },
            ],
          },
          {
            source_version: 'model-2.3.9',
            snapshot_at: '2026-01-26 03:00:00',
            display_value: value,
            logic_summary:
              lang === 'ko'
                ? '기준선 산출 시 D-2 영향도를 더 크게 반영한 버전입니다.'
                : 'Older baseline used stronger D-2 influence.',
            confidence: confidence !== undefined ? Math.max(confidence - 0.07, 0) : undefined,
            data_source: [
              {
                source_id: 'file:model_weight_ops_20260126',
                type: 'file',
                name: 'weight_ops_model_report_20260126.json',
                url: 'https://p-root.local/files/weight_ops_model_report_20260126.json',
                highlight_text: logicFormula,
                highlight_anchor: '$.metrics',
              },
            ],
          },
        ]
      : undefined,
  });

  const topKpis: Array<{
    label: string;
    desc: string;
    value: string;
    sub: string;
    tone: 'good' | 'medium' | 'bad';
    trace: TraceabilityPayload;
  }> = [
    {
      label: t.avgWeight[lang],
      desc: lang === 'ko' ? 'Σ(체중×마릿수) / N' : 'Σ(weight×count) / N',
      value: `${Math.round(model.mean).toLocaleString()}g`,
      sub: `vs${lang === 'ko' ? '표준' : 'Std'} ${formatSigned(model.mean - standardWeight)}g`,
      tone: 'good',
      trace: buildKpiTrace({
        key: 'avg_weight',
        value: `${Math.round(model.mean).toLocaleString()}g`,
        logicSummary:
          lang === 'ko'
            ? '구간별 체중 중심값과 마릿수를 가중 평균해 평균 체중을 계산했습니다.'
            : 'Mean weight is calculated by weighted average of bin center and counts.',
        logicFormula:
          lang === 'ko'
            ? '평균체중 = Σ(체중중심값×마릿수) / 총마릿수'
            : 'mean = Σ(bin_center×count) / total_count',
        isAiGenerated: false,
        highlightText: `mean=${Math.round(model.mean)}, total=${model.totalCount}`,
      }),
    },
    {
      label: t.cv[lang],
      desc: lang === 'ko' ? '표준편차 / 평균 × 100' : 'StdDev / Mean × 100',
      value: formatPct(stats.cv),
      sub: cvLabel,
      tone: cvTone,
      trace: buildKpiTrace({
        key: 'cv',
        value: formatPct(stats.cv),
        logicSummary:
          lang === 'ko'
            ? '체중 분포 산포도를 표준편차 대비 평균 비율로 계산했습니다.'
            : 'CV is calculated as the ratio between standard deviation and mean.',
        logicFormula: lang === 'ko' ? 'CV = (표준편차 / 평균) × 100' : 'CV = (std_dev / mean) × 100',
        isAiGenerated: false,
        highlightText: `cv=${stats.cv.toFixed(2)}%`,
      }),
    },
    {
      label: t.targetFit[lang],
      desc: lang === 'ko' ? '목표범위 내 비율' : 'Share in target range',
      value: formatPct(stats.targetFit),
      sub: `${formatCount(stats.targetCount)}${lang === 'ko' ? '마리' : ''}`,
      tone: getPoultryTone('targetFit', stats.targetFit),
      trace: buildKpiTrace({
        key: 'target_fit',
        value: formatPct(stats.targetFit),
        logicSummary:
          lang === 'ko'
            ? '타겟 체중 구간에 포함된 마릿수 비율을 계산했습니다.'
            : 'Target fit is the share of birds within target weight band.',
        logicFormula:
          lang === 'ko'
            ? `적합률 = (${stats.targetCount} / ${model.totalCount}) × 100`
            : `fit_rate = (${stats.targetCount} / ${model.totalCount}) × 100`,
        isAiGenerated: false,
        highlightText: `target_count=${stats.targetCount}, fit=${stats.targetFit.toFixed(2)}%`,
      }),
    },
    {
      label: t.under[lang],
      desc: lang === 'ko' ? '목표 미달 비율' : 'Below target range',
      value: formatPct(stats.under),
      sub: `${formatCount(stats.underCount)}${lang === 'ko' ? '마리' : ''}`,
      tone: getPoultryTone('under', stats.under),
      trace: buildKpiTrace({
        key: 'under_ratio',
        value: formatPct(stats.under),
        logicSummary:
          lang === 'ko'
            ? '목표 하한 미만 마릿수 비율을 계산했습니다.'
            : 'Under ratio is the share of birds below target minimum.',
        logicFormula:
          lang === 'ko'
            ? `미달률 = (${stats.underCount} / ${model.totalCount}) × 100`
            : `under_ratio = (${stats.underCount} / ${model.totalCount}) × 100`,
        isAiGenerated: false,
        highlightText: `under_count=${stats.underCount}, under_ratio=${stats.under.toFixed(2)}%`,
      }),
    },
    {
      label: t.expectedShip[lang],
      desc: lang === 'ko' ? 'N − Under 마릿수' : 'N − Under count',
      value: `${formatCount(model.totalCount - stats.underCount)}${lang === 'ko' ? '마리' : ''}`,
      sub: formatPct(100 - stats.under),
      tone: stats.targetFit >= 75 ? 'good' : stats.targetFit >= 50 ? 'medium' : 'bad',
      trace: buildKpiTrace({
        key: 'expected_ship',
        value: `${formatCount(model.totalCount - stats.underCount)}${lang === 'ko' ? '마리' : ''}`,
        logicSummary:
          lang === 'ko'
            ? '목표 하한 미달 마릿수를 제외해 출하 가능 마릿수를 추정했습니다.'
            : 'Expected shipment count is estimated by excluding under-spec birds.',
        logicFormula:
          lang === 'ko'
            ? `${model.totalCount} - ${stats.underCount} = ${model.totalCount - stats.underCount}`
            : `${model.totalCount} - ${stats.underCount} = ${model.totalCount - stats.underCount}`,
        isAiGenerated: true,
        highlightText: `expected_ship=${model.totalCount - stats.underCount}`,
        confidence: 0.81,
      }),
    },
    {
      label: t.opDelta[lang],
      desc: lang === 'ko' ? '적합률·미달률 일일 변화' : 'Daily fit/under change',
      value: `Fit ${formatSignedPp(deltaTarget)}`,
      sub: `Under ${formatSignedPp(deltaUnder)}`,
      tone: getDeltaTone(deltaTarget, deltaUnder),
      trace: buildKpiTrace({
        key: 'op_delta',
        value: `Fit ${formatSignedPp(deltaTarget)} | Under ${formatSignedPp(deltaUnder)}`,
        logicSummary:
          lang === 'ko'
            ? '오늘 지표와 D-1 분포를 비교해 적합률/미달률 증감을 계산했습니다.'
            : 'Delta is computed by comparing today metrics with D-1 distribution.',
        logicFormula:
          lang === 'ko'
            ? `ΔFit=${formatSignedPp(deltaTarget)}, ΔUnder=${formatSignedPp(deltaUnder)}`
            : `ΔFit=${formatSignedPp(deltaTarget)}, ΔUnder=${formatSignedPp(deltaUnder)}`,
        isAiGenerated: true,
        highlightText: `delta_fit=${deltaTarget.toFixed(2)}, delta_under=${deltaUnder.toFixed(2)}`,
        confidence: 0.76,
      }),
    },
  ];

  const bottomKpis = [
    { label: t.uniformity[lang], desc: lang === 'ko' ? '평균±10% 내 비율' : 'Within mean±10%', value: formatPct(stats.uniformity), sub: `${Math.round(model.mean * 0.9).toLocaleString()}~${Math.round(model.mean * 1.1).toLocaleString()}g`, tone: getPoultryTone('uniformity', stats.uniformity) },
    { label: t.over[lang], desc: lang === 'ko' ? '목표 초과 비율' : 'Above target range', value: formatPct(stats.over), sub: `${formatCount(stats.overCount)}${lang === 'ko' ? '마리' : ''}`, tone: getPoultryTone('over', stats.over) },
    { label: t.opPercentile[lang], desc: lang === 'ko' ? '분포 10/50/90번째 백분위' : '10th/50th/90th percentile', value: `${Math.round(stats.p10)}/${Math.round(stats.p50)}/${Math.round(stats.p90)}g`, sub: `Spread ${formatPct(spreadRatio)}`, tone: spreadTone },
    { label: t.opBandCoverage[lang], desc: lang === 'ko' ? '목표범위 내 마릿수' : 'Birds in target band', value: `${formatCount(stats.targetCount)}${lang === 'ko' ? '마리' : ''}`, sub: formatPct(stats.targetFit), tone: getBandCoverageTone(stats.targetFit) },
  ];

  return (
    <div className="bg-[#161b22] p-4 border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-gray-400 font-medium">{t.title[lang]}</h3>
          <span className="text-[11px] text-gray-500 bg-[#0d1117] border border-[#30363d] px-2 py-0.5">
            N={formatCount(model.totalCount)} ({lang === 'ko' ? '총 측정 마릿수' : 'Total birds weighed'})
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="border border-[#30363d] min-h-[30px] pl-[8px] pr-[4px] py-[4px] flex items-center gap-1.5">
            <span className="text-gray-400 text-[12px] font-bold mr-1">{t.targetRange[lang]}</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-14 h-5 bg-[#0d1117] px-1 text-gray-300 border-0 outline-none text-center"
              value={targetMinInput}
              onChange={(e) => setTargetMinInput(Number(e.target.value) || 0)}
            />
            <span className="text-gray-500">~</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-14 h-5 bg-[#0d1117] px-1 text-gray-300 border-0 outline-none text-center"
              value={targetMaxInput}
              onChange={(e) => setTargetMaxInput(Number(e.target.value) || 0)}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowComparison((v) => !v)}
            className={`border min-h-[30px] px-[10px] py-[4px] text-[12px] font-bold transition-colors flex items-center gap-1 border-[#30363d] ${
              showComparison ? 'text-[#3fb950]' : 'text-gray-400'
            }`}
          >
            {t.compareD1[lang]}
          </button>
        </div>
      </div>

      {/* Top KPI — 6 cards, 4-line layout: label / desc / value / sub */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
        {topKpis.map((kpi) => (
          <div key={kpi.label} className="bg-[#0d1117] border border-[#30363d] px-2 py-2">
            <p className={`${lang === 'en' && kpi.label === t.expectedShip.en ? 'text-[10px]' : 'text-[12px]'} text-gray-500`}>{kpi.label}</p>
            <p className="text-[10px] text-gray-600">({kpi.desc})</p>
            <TraceableValue
              value={<span style={{ color: TONE_COLORS[kpi.tone] }}>{kpi.value}</span>}
              trace={kpi.trace}
              onOpenTrace={onOpenTrace}
              align="right"
              className="justify-end px-0"
              valueClassName="text-[17px] font-semibold"
            />
            <p className="text-[10px] text-gray-500 text-right">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="relative h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={model.rows} margin={{ top: 12, right: 12, left: 0, bottom: 18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2f37" vertical={false} />
            <ReferenceArea
              x1={model.targetMin}
              x2={model.targetMax}
              y1={0}
              y2="auto"
              ifOverflow="extendDomain"
              fill="rgba(63,185,80,0.08)"
            />
            <XAxis
              type="number"
              dataKey="center"
              domain={['dataMin', 'dataMax']}
              tickCount={8}
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#374151' }}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
              width={DIST_Y_AXIS_WIDTH}
              axisLine={{ stroke: '#374151' }}
            />
            <Tooltip content={<CustomTooltip lang={lang} />} />

            {showComparison && (
              <Bar dataKey="prevCount" fill="rgba(139, 148, 158, 0.28)" radius={[0, 0, 0, 0]} barSize={7} />
            )}

            <Bar dataKey="count" radius={[0, 0, 0, 0]} barSize={11}>
              {model.rows.map((row) => (
                <Cell key={row.rangeLabel} fill={ZONE_COLORS[row.zone]} />
              ))}
            </Bar>

            <ReferenceLine x={model.mean} stroke="#ffffff" strokeDasharray="6 4" strokeWidth={2} />
            <ReferenceLine x={(model.targetMin + model.targetMax) / 2} stroke="#4da3ff" strokeDasharray="4 4" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>

        <div className="absolute top-2 right-2 text-[10px]">
          <div className="flex flex-col items-start gap-1 text-gray-400">
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2" style={{ backgroundColor: ZONE_COLORS.under }} />
              <span>{t.legendUnder[lang]}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2" style={{ backgroundColor: ZONE_COLORS.target }} />
              <span>{t.legendTarget[lang]}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2" style={{ backgroundColor: ZONE_COLORS.over }} />
              <span>{t.legendOver[lang]}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2" style={{ backgroundColor: '#4da3ff' }} />
              <span>{t.standardLine[lang]}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2" style={{ backgroundColor: '#ffffff' }} />
              <span>{t.meanLine[lang]}</span>
            </div>
          </div>
        </div>

        <div
          className="absolute top-[15px] px-2 py-1 text-[10px] text-gray-500 space-y-0.5 pointer-events-none"
          style={{ left: `calc(${DIST_Y_AXIS_WIDTH}px + 6px)` }}
        >
          <p>{lang === 'ko' ? '*평균선: Σ(체중 × 마릿수) / 총마릿수' : '*Mean Line: Σ(weight × count) / total count'}</p>
          <p>{lang === 'ko' ? '**표준체중선: (targetMin + targetMax) / 2' : '**Standard Line: (targetMin + targetMax) / 2'}</p>
        </div>
      </div>

      <div className="-mt-4 flex justify-end">
        <p className="text-[10px] text-gray-500">{t.snapshot[lang]} {DISTRIBUTION_STAT_TIME}</p>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-[#30363d] pt-3">
        <h3 className="text-gray-400 font-medium">{lang === 'ko' ? '상세지표' : t.researchMetrics.en}</h3>
        <div className="flex items-center gap-2">
          <div className="border border-[#30363d] bg-[rgba(0,0,0,0.3)] min-h-[30px] px-[10px] py-[4px] text-[12px] flex items-center gap-1 text-gray-400">
            <span>{t.summaryUnder[lang]}:</span>
            <span className="font-semibold text-[#f85149]">{formatCount(stats.underCount)}{lang === 'ko' ? '마리' : ''}</span>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className={`border min-h-[30px] px-[10px] py-[4px] text-[12px] font-bold transition-colors flex items-center gap-1 ${
              expanded
                ? 'border-[#3fb950] text-[#3fb950] bg-[#3fb950]/10'
                : 'border-[#30363d] text-gray-400 hover:text-gray-200'
            }`}
          >
            {expanded ? t.detailClose[lang] : t.detailOpen[lang]}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3">
          <div className="border border-[#30363d] p-3 bg-[#0d1117]">
            <p className="text-xs text-gray-400 mb-2">{t.researchMetrics[lang]}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {bottomKpis.map((kpi) => (
                <div key={`detail-${kpi.label}`} className="border border-[#30363d] px-2 py-1.5">
                  <p className="text-[10px] text-gray-500">{kpi.label}</p>
                  <p className="text-[9px] text-gray-600">({kpi.desc})</p>
                  <p className="text-xs font-semibold" style={{ color: TONE_COLORS[kpi.tone] }}>{kpi.value}</p>
                  <p className="text-[10px] text-gray-500">{kpi.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${tableExpanded ? '' : 'max-h-[180px]'} overflow-auto border border-[#30363d]`}>
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 bg-[#161b22]">
              <tr className="border-b border-[#30363d] text-gray-400">
                <th className="text-left px-2 py-2">{t.range[lang]}</th>
                <th className="text-right px-2 py-2">{t.count[lang]}</th>
                <th className="text-right px-2 py-2">{t.ratio[lang]}</th>
                <th className="text-right px-2 py-2">{t.cumulative[lang]}</th>
              </tr>
            </thead>
            <tbody>
              {model.rows.map((row) => (
                <tr key={`row-${row.rangeLabel}`} className="border-b border-[#21262d] text-gray-300" style={{ backgroundColor: ZONE_COLORS[row.zone].replace(/0\.[0-9]+\)/, '0.08)') }}>
                  <td className="px-2 py-1.5">{row.rangeLabel}g</td>
                  <td className="px-2 py-1.5 text-right">{formatCount(row.count)}</td>
                  <td className="px-2 py-1.5 text-right">{formatPct(row.percentage)}</td>
                  <td className="px-2 py-1.5 text-right">{formatPct(row.cumulative)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <button
            type="button"
            onClick={() => setTableExpanded((v) => !v)}
            className="mt-1 w-full text-[11px] text-gray-400 hover:text-gray-200 bg-[#0d1117] border border-[#30363d] px-2 py-1.5 flex items-center justify-center gap-1"
          >
            {tableExpanded
              ? (lang === 'ko' ? '테이블 접기' : 'Collapse Table')
              : (lang === 'ko' ? '전체보기' : 'Show All')}
            {tableExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      )}
    </div>
  );
};

export default WeightDistribution;
