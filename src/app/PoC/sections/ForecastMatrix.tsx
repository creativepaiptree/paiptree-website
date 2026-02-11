'use client';

/**
 * ForecastMatrix Component
 *
 * 닭의 체중 예측 시스템을 시각화하는 대시보드 컴포넌트.
 *
 * 구성:
 * - CCTV WEIGHT: 8~45일령 체중 변화 차트 (Chart.js)
 * - ROLLING FORECAST MATRIX: D-1/D-2/D-3 예측 정확도 테이블
 *
 * @see /docs/components/ForecastMatrix.blueprint.md
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import dashboardDataJson from '@/data/dashboard-data.json';
import { assertDashboardForecastData, type Point } from '@/contracts/dashboard-data';
import TraceableValue from '../components/trace/TraceableValue';
import type { TraceabilityPayload } from '@/types/traceability';
import {
  calcErrorClass,
  formatSigned,
  formatSignedPercentCeil,
  getAccuracyTone,
  getErrorColor,
} from '@/lib/forecast-metrics';

Chart.register(...registerables);

/**
 * 테이블 셀의 4가지 타입
 * @property prediction - D-1/D-2/D-3 예측값 (오차율 포함)
 * @property actual - 실측값 (전일대비 변화 포함)
 * @property future - 미래 예측값 (검증 불가)
 * @property empty - 데이터 없음
 */
type Cell =
  | { type: 'prediction'; value: string; error: string; errorClass: string; isToday: boolean }
  | { type: 'actual'; value: string; check: string; isToday: boolean }
  | { type: 'future'; value: string; label: string; isToday: boolean }
  | { type: 'empty'; value: string; isToday: boolean };

type TraceableMatrixCell = Exclude<Cell, { type: 'empty' }>;

/**
 * 전치 테이블의 열(X축) 정보
 * @description 전치 테이블에서 X축은 일령(age)을 나타냄
 * @property age - 일령 (25~45)
 * @property xIndex - 날짜 인덱스 (age + AGE_OFFSET)
 * @property isTodayAge - 오늘 일령 여부 (하이라이트용)
 */
type TransposedColumn = {
  age: number;
  xIndex: number;
  isTodayAge: boolean;
};

/**
 * 전치 테이블의 행(Y축) 정보
 * @description 전치 테이블에서 Y축은 날짜를 나타냄 (최신이 위, Gantt 스타일)
 * @property date - 날짜 표시 (예: "1/23(월)")
 * @property dateSub - 날짜 서브 라벨 (예: "오늘", "1일 전")
 * @property xIndex - 날짜 인덱스 (BASE_DATE 기준)
 * @property isToday - 오늘 날짜 여부
 * @property cells - 각 일령별 셀 데이터 배열
 */
type TransposedRow = {
  date: { ko: string; en: string };
  dateSub: { ko: string; en: string };
  xIndex: number;
  isToday: boolean;
  cells: Cell[];
};

const rawDashboardData: unknown = dashboardDataJson;
assertDashboardForecastData(rawDashboardData);
const dashboardData = rawDashboardData;
const traceCatalog = dashboardData.traceCatalog ?? {};

/**
 * 테이블 시작 날짜 인덱스
 * @constant {number}
 * @description 1/20 (25일령의 D-3 예측일부터)
 */
const TABLE_START_X = dashboardData.tableRange.startX;

/**
 * 테이블 종료 날짜 인덱스
 * @constant {number}
 * @description 2/12 (45일령 실측일까지)
 */
const TABLE_END_X = dashboardData.tableRange.endX;

/**
 * 테이블 시작 일령
 * @constant {number}
 * @description 예측 시스템이 적용되는 첫 일령
 */
const TABLE_START_AGE = dashboardData.tableRange.startAge;

/**
 * 테이블 종료 일령
 * @constant {number}
 * @description 출하 직전까지의 마지막 일령
 */
const TABLE_END_AGE = dashboardData.tableRange.endAge;

/**
 * 정확도 표시 색상 톤
 * @description good: 97%↑, medium: 95~97%, bad: 95%↓
 */
type AccuracyLineTone = 'good' | 'medium' | 'bad';

/**
 * 정확도 툴팁 라인 정보
 */
type AccuracyHoverLine = { text: string; tone: AccuracyLineTone };

/**
 * 정확도 호버 정보 (툴팁용)
 */
type AccuracyHoverInfo = { summary: string; lines: AccuracyHoverLine[] };
type PredictionCard = {
  key: string;
  label: string;
  value: string;
  errorText: string;
  isToday: boolean;
  tone: 'good' | 'medium' | 'bad' | 'forecast' | 'neutral';
  trace: TraceabilityPayload;
};

/**
 * 기준 날짜 (xIndex = 0)
 * @constant {Date}
 * @description 모든 날짜 계산의 기준점. 2025년 12월 27일.
 * @example
 * // xIndex=37의 실제 날짜 계산
 * const date = new Date(BASE_DATE);
 * date.setDate(BASE_DATE.getDate() + 37); // 2025-02-02
 */
const BASE_DATE = new Date(dashboardData.baseDate);

/**
 * 예측 시스템 시작 인덱스
 * @constant {number}
 * @description 1/23 = 25일령. 이 시점부터 D-1/D-2/D-3 예측이 시작됨.
 */
const FORECAST_START_INDEX = dashboardData.forecastStartIndex;

/**
 * 오늘 날짜 인덱스
 * @constant {number}
 * @description 2/2 = 35일령. 실제 운영 시 동적 계산 필요.
 * @example
 * // 실제 운영 시
 * const todayIndex = Math.floor((new Date() - BASE_DATE) / (1000 * 60 * 60 * 24));
 */
const TODAY_INDEX = dashboardData.todayIndex;

/**
 * 일령 오프셋 (날짜→일령 변환)
 * @constant {number}
 * @description age = xIndex - AGE_OFFSET
 * @example
 * const age = 37 - AGE_OFFSET; // 35일령
 * const xIndex = 35 + AGE_OFFSET; // 37 (2/2)
 */
const AGE_OFFSET = dashboardData.ageOffset;

/**
 * 차트 최소 인덱스
 * @constant {number}
 * @description 8일령에 해당. 차트 X축 시작점.
 */
const CHART_MIN_INDEX = dashboardData.chartRange.minIndex;

/**
 * 차트 최대 인덱스
 * @constant {number}
 * @description 45일령에 해당. 차트 X축 종료점.
 */
const CHART_MAX_INDEX = dashboardData.chartRange.maxIndex;
const MEASUREMENT_STAT_TIME = '2026-01-28 03:00:00';

/**
 * 과거 체중 기록 (8~24일령)
 * @description 예측 시스템 시작 전 히스토리 데이터. 차트에서 회색으로 표시.
 * @todo 실제 운영 시 weight_history 테이블에서 조회
 */
const HISTORY_POINTS: Point[] = dashboardData.series.history;

/**
 * 모델 예측값 (25일령~)
 * @description 예측 모델이 생성한 체중 예측. 차트의 기준선 역할.
 * @todo 실제 운영 시 weight_predictions 테이블에서 조회
 */
const MODEL_POINTS: Point[] = dashboardData.series.model;

/**
 * D-1 예측값 (1일 전 예측)
 * @description 현재 운영 화면 기준 확정된 예측값
 */
const D1_POINTS: Point[] = dashboardData.series.d1;

/**
 * D-2 예측값 (2일 전 예측)
 * @description 현재 운영 화면 기준 확정된 예측값
 */
const D2_POINTS: Point[] = dashboardData.series.d2;

/**
 * D-3 예측값 (3일 전 예측)
 * @description 현재 운영 화면 기준 확정된 예측값
 */
const D3_POINTS: Point[] = dashboardData.series.d3;

/**
 * 실측 체중 데이터
 * @description CCTV로 실제 측정된 체중값. 오늘(TODAY_INDEX)까지만 존재.
 * @todo 실제 운영 시 weight_actuals 테이블에서 조회
 */
const OBSERVED_ACTUAL_POINTS: Point[] = dashboardData.series.observedActual;

/**
 * 품종별 표준 체중 곡선
 * @description 비교 기준선으로 사용. 차트에서 파란색 점선으로 표시.
 * @todo 실제 운영 시 standard_weight 테이블에서 조회
 */
const STANDARD_WEIGHT_POINTS: Point[] = dashboardData.series.standardWeight;
const ERROR_THRESHOLDS = dashboardData.rules.thresholds;
const ERROR_COLORS = dashboardData.rules.colors;

/**
 * Point 배열을 Map으로 변환 (x → y 조회용)
 * @param points - Point 배열
 * @returns Map<xIndex, weight>
 * @example
 * const map = pointMap(OBSERVED_ACTUAL_POINTS);
 * const weight = map.get(37); // 2180 (35일령 체중)
 */
const pointMap = (points: Point[]) => new Map(points.map((point) => [point.x, point.y]));


/**
 * 체중 포맷팅 (천 단위 구분자 + g)
 * @param g - 체중 (그램)
 * @returns 포맷된 문자열 (예: "1,405g")
 */
const formatWeight = (g: number): string => `${g.toLocaleString()}g`;


/**
 * 날짜 차이에 따른 서브 라벨 생성
 * @param dayDiff - 오늘 기준 날짜 차이 (양수=미래, 음수=과거)
 * @param langParam - 언어 ('ko' | 'en')
 * @returns 라벨 문자열 (예: "오늘", "1일 전", "Tomorrow")
 */
const getDateSubLabel = (dayDiff: number, langParam: 'ko' | 'en') => {
  if (dayDiff === 0) return langParam === 'ko' ? '오늘' : 'Today';
  if (dayDiff === 1) return langParam === 'ko' ? '내일' : 'Tomorrow';
  if (dayDiff === 2) return langParam === 'ko' ? '모레' : 'In 2 days';
  if (dayDiff > 2) return langParam === 'ko' ? `${dayDiff}일 후` : `In ${dayDiff} days`;
  if (dayDiff === -1) return langParam === 'ko' ? '1일 전' : '1 day ago';
  return langParam === 'ko' ? `${Math.abs(dayDiff)}일 전` : `${Math.abs(dayDiff)} days ago`;
};

/**
 * 주어진 일령 범위에 대한 유효 날짜 범위 계산
 * @description 주간보기에서 해당 페이지에 표시할 날짜(행)를 필터링하는 데 사용
 * @param startAge - 시작 일령 (예: 25)
 * @param endAge - 종료 일령 (예: 31)
 * @returns 유효 날짜 xIndex 범위
 * @example
 * getRelevantDateRange(25, 31) // { minDateX: 27, maxDateX: 33 }
 * // 25일령 실측일(1/23=x27) ~ 31일령 실측일(1/29=x33)
 */
const getRelevantDateRange = (startAge: number, endAge: number) => {
  const minDateX = startAge + AGE_OFFSET;     // Measurement date for startAge
  const maxDateX = endAge + AGE_OFFSET;       // Actual measurement date for endAge
  return { minDateX, maxDateX };
};

/**
 * 전치 테이블 열(X축) 데이터 생성
 * @description X축에 일령(25~45d)을 배치하는 Gantt 스타일 구조
 * @returns TransposedColumn 배열 (21개 열)
 * @example
 * // 반환값 예시
 * [
 *   { age: 25, xIndex: 27, isTodayAge: false },
 *   ...
 *   { age: 35, xIndex: 37, isTodayAge: true },  // 오늘
 *   ...
 * ]
 */
const generateTransposedColumns = (): TransposedColumn[] => {
  const todayAge = TODAY_INDEX - AGE_OFFSET; // 35

  return Array.from({ length: TABLE_END_AGE - TABLE_START_AGE + 1 }, (_, i) => {
    const age = TABLE_START_AGE + i;
    return {
      age,
      xIndex: age + AGE_OFFSET,
      isTodayAge: age === todayAge,
    };
  });
};

/**
 * 전치 테이블 행(Y축) 데이터 생성
 * @description Y축에 날짜를 배치. 각 셀의 타입(actual/prediction/future/empty)을 계산.
 *
 * 셀 타입 결정 로직:
 * - horizon = ageX - dateX (일령의 xIndex - 날짜의 xIndex)
 * - horizon < 0: empty (아직 예측 불가)
 * - horizon = 0: actual (실측일) 또는 future (미래)
 * - horizon = 1~3: D-1/D-2/D-3 prediction
 * - horizon > 3: empty (예측 범위 초과)
 *
 * @param transposedCols - 열 정보 배열
 * @returns TransposedRow 배열 (날짜별 행)
 */
const generateTransposedRows = (transposedCols: TransposedColumn[]): TransposedRow[] => {
  const d1Map = pointMap(D1_POINTS);
  const d2Map = pointMap(D2_POINTS);
  const d3Map = pointMap(D3_POINTS);
  const obsMap = pointMap(OBSERVED_ACTUAL_POINTS);

  const weekdaysKo = ['일', '월', '화', '수', '목', '금', '토'];
  const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return Array.from({ length: TABLE_END_X - TABLE_START_X + 1 }, (_, i) => {
    const dateX = TABLE_START_X + i;
    const date = new Date(BASE_DATE);
    date.setDate(BASE_DATE.getDate() + dateX);
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const dayDiff = dateX - TODAY_INDEX;

    const cells: Cell[] = transposedCols.map(col => {
      const ageX = col.xIndex;
      const horizon = ageX - dateX; // Distance from prediction date to measurement date
      const isToday = dateX === TODAY_INDEX;

      // horizon < 0: Not yet predicted (date is after measurement day)
      if (horizon < 0) return { type: 'empty', value: '-', isToday };

      // horizon = 0: Measurement day
      if (horizon === 0) {
        const actual = obsMap.get(ageX);
        if (actual === undefined || dateX > TODAY_INDEX) {
          const pred = d1Map.get(ageX);
          if (pred === undefined) return { type: 'empty', value: '-', isToday };
          const daysFromToday = dateX - TODAY_INDEX;
          const dLabel = daysFromToday >= 1 && daysFromToday <= 3 ? `D-${daysFromToday}` : 'D-1';
          return { type: 'future', value: formatWeight(pred), label: dLabel, isToday };
        }
        const prev = obsMap.get(ageX - 1);
        const diff = prev ? actual - prev : 0;
        const pct = prev ? ((diff / prev) * 100) : 0;
        return {
          type: 'actual',
          value: formatWeight(actual),
          check: `✓ 실측(${formatSignedPercentCeil(pct)} ${diff}g)`,
          isToday,
        };
      }

      // horizon > 3: Outside prediction range
      if (horizon > 3) return { type: 'empty', value: '-', isToday };

      // D-1/D-2/D-3 predictions
      const predMap = horizon === 1 ? d1Map : horizon === 2 ? d2Map : d3Map;
      const pred = predMap.get(ageX);
      if (pred === undefined) return { type: 'empty', value: '-', isToday };

      const actual = obsMap.get(ageX);
      if (actual === undefined || ageX > TODAY_INDEX) {
        return { type: 'prediction', value: formatWeight(pred), error: '', errorClass: '', isToday };
      }

      const errPct = ((pred - actual) / actual) * 100;
      return {
        type: 'prediction',
        value: formatWeight(pred),
        error: formatSignedPercentCeil(errPct),
        errorClass: calcErrorClass(errPct),
        isToday,
      };
    });

    return {
      date: {
        ko: `${m}/${d}(${weekdaysKo[date.getDay()]})`,
        en: `${m}/${d}(${weekdaysEn[date.getDay()]})`,
      },
      dateSub: { ko: getDateSubLabel(dayDiff, 'ko'), en: getDateSubLabel(dayDiff, 'en') },
      xIndex: dateX,
      isToday: dateX === TODAY_INDEX,
      cells,
    };
  });
};

/**
 * 페이지 네비게이션용 일령 범위 라벨 생성
 * @description 3페이지 구성: 1=25~31d, 2=32~38d, 3=39~45d (각 7일령)
 * @returns 페이지별 라벨 객체
 */
const generateAgeRangeLabels = (): Record<number, { ko: string; en: string }> => ({
  1: { ko: '25~31일령', en: '25-31d' },
  2: { ko: '32~38일령', en: '32-38d' },
  3: { ko: '39~45일령', en: '39-45d' },
});

/**
 * 사전 생성된 테이블 데이터
 * @description 렌더링 성능을 위해 컴포넌트 외부에서 1회만 생성
 */
const transposedColumns = generateTransposedColumns();
const transposedRows = generateTransposedRows(transposedColumns);
const ageRangeLabels = generateAgeRangeLabels();

/**
 * ForecastMatrix 컴포넌트 Props
 */
interface ForecastMatrixProps {
  /** 표시 언어 */
  lang: 'ko' | 'en';
  onOpenTrace: (trace: TraceabilityPayload) => void;
}

/**
 * ForecastMatrix 메인 컴포넌트
 *
 * @description 닭 체중 예측 시스템 시각화 대시보드
 *
 * 구성:
 * 1. CCTV WEIGHT 차트 - 8~45일령 체중 변화 (Chart.js)
 * 2. ROLLING FORECAST MATRIX 테이블 - D-1/D-2/D-3 예측 정확도
 *
 * 상태:
 * - fitAll: 전체보기(true) vs 주간보기(false)
 * - week: 현재 페이지 (1=25~31d, 2=32~38d, 3=39~45d)
 * - hoveredDay: 차트에서 호버 중인 xIndex (테이블 열 하이라이트용)
 *
 * @see /docs/components/ForecastMatrix.blueprint.md
 */
const ForecastMatrix = ({ lang, onOpenTrace }: ForecastMatrixProps) => {
  /** 전체보기(true) vs 주간보기(false) */
  const [fitAll, setFitAll] = useState(false);
  /** 현재 페이지: 1=25~31d, 2=32~38d, 3=39~45d */
  const [week, setWeek] = useState<1 | 2 | 3>(2);
  /** 차트 호버 시 xIndex (테이블 열 하이라이트 연동) */
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  /** 차트 모드: 메인 차트 vs 예측 정확도 차트 */
  const [chartMode, setChartMode] = useState<'main' | 'accuracy'>('main');
  /** 3일예측 카드 접힘 상태 */
  const [isRollingCollapsed, setIsRollingCollapsed] = useState(true);
  const maxDay = CHART_MAX_INDEX;

  /**
   * D-1/D-2/D-3 평균 정확도 계산
   * @description 각 예측 호라이즌별 평균 정확도 (100 - 평균오차율)
   */
  const avgAccuracy = useMemo(() => {
    const observedMap = pointMap(OBSERVED_ACTUAL_POINTS);
    const calcAvgAccuracy = (predictions: Point[]) => {
      let totalAbsErrorPct = 0;
      let count = 0;
      predictions.forEach((pred) => {
        const actual = observedMap.get(pred.x);
        if (typeof actual === 'number') {
          const errorPct = Math.abs(((pred.y - actual) / actual) * 100);
          totalAbsErrorPct += errorPct;
          count++;
        }
      });
      const avgError = count > 0 ? totalAbsErrorPct / count : 0;
      return (Math.ceil(Math.max(0, 100 - avgError) * 10) / 10).toFixed(1);
    };

    return {
      d1: calcAvgAccuracy(D1_POINTS),
      d2: calcAvgAccuracy(D2_POINTS),
      d3: calcAvgAccuracy(D3_POINTS),
    };
  }, []);

  /**
   * 정확도 인디케이터 호버 정보 생성
   * @description 각 일령별 예측 오차 상세 정보 (툴팁용)
   */
  const accuracyHoverInfo = useMemo(() => {
    const observedMap = pointMap(OBSERVED_ACTUAL_POINTS);
    const getLineTone = (pct: number): AccuracyLineTone => {
      return calcErrorClass(pct, ERROR_THRESHOLDS);
    };
    const build = (predictions: Point[], horizonKo: string, horizonEn: string): AccuracyHoverInfo => {
      const terms: AccuracyHoverLine[] = [];
      let totalDiff = 0;
      let totalSignedPct = 0;
      let count = 0;

      predictions.forEach((pred) => {
        const actual = observedMap.get(pred.x);
        if (typeof actual !== 'number') return;
        const age = pred.x - AGE_OFFSET;
        const diff = actual - pred.y;
        const pct = (diff / actual) * 100;
        terms.push(
          {
            text:
              lang === 'ko'
                ? `${age}일령 ${horizonKo}: ${formatSigned(Number(diff.toFixed(1)), 'g')} (${formatSignedPercentCeil(pct)})`
                : `${age}d ${horizonEn}: ${formatSigned(Number(diff.toFixed(1)), 'g')} (${formatSignedPercentCeil(pct)})`,
            tone: getLineTone(pct),
          }
        );
        totalDiff += diff;
        totalSignedPct += pct;
        count += 1;
      });

      if (count === 0) return { summary: lang === 'ko' ? '데이터 없음' : 'No data', lines: [] };
      const avgDiff = totalDiff / count;
      const meanPct = totalSignedPct / count;
      return {
        summary:
          lang === 'ko'
            ? `총 ${count}일: ${formatSigned(Number(avgDiff.toFixed(1)), 'g')} (${formatSignedPercentCeil(meanPct)})`
            : `Total ${count}d: ${formatSigned(Number(avgDiff.toFixed(1)), 'g')} (${formatSignedPercentCeil(meanPct)})`,
        lines: terms,
      };
    };

    return {
      d1: build(D1_POINTS, '1일전', 'D-1'),
      d2: build(D2_POINTS, '2일전', 'D-2'),
      d3: build(D3_POINTS, '3일전', 'D-3'),
    };
  }, [lang]);

  const buildForecastVersionHistory = useCallback(
    (displayValue: string, summary: string, confidence?: number) => [
      {
        source_version: 'model-2.4.0',
        snapshot_at: '2026-01-27 03:00:00',
        display_value: displayValue,
        logic_summary:
          lang === 'ko'
            ? `${summary} (이전 버전, 피처 가중치 보수 적용)`
            : `${summary} (previous version, conservative feature weights)`,
        confidence: confidence !== undefined ? Math.max(confidence - 0.03, 0) : undefined,
        data_source: [
          {
            source_id: 'file:forecast_model_run_20260127',
            type: 'file' as const,
            name: 'forecast_model_run_20260127.json',
            url: 'https://p-root.local/files/forecast_model_run_20260127.json',
            highlight_text: `display_value=${displayValue}`,
            highlight_anchor: '$.forecast.daily',
          },
          {
            source_id: 'db:forecast_features:2026-01-27',
            type: 'db' as const,
            name: 'forecast_feature_snapshot',
            url: 'https://p-root.local/db/forecast_feature_snapshot?date=2026-01-27',
            row_id: 'house=H01,date=2026-01-27',
            highlight_text: 'feature_set=v2.4.0',
            highlight_anchor: 'house=H01,date=2026-01-27',
          },
        ],
      },
      {
        source_version: 'model-2.3.9',
        snapshot_at: '2026-01-26 03:00:00',
        display_value: displayValue,
        logic_summary:
          lang === 'ko'
            ? `${summary} (초기 버전, D-2 영향도 확대)`
            : `${summary} (older version, higher D-2 influence)`,
        confidence: confidence !== undefined ? Math.max(confidence - 0.06, 0) : undefined,
        data_source: [
          {
            source_id: 'file:forecast_model_run_20260126',
            type: 'file' as const,
            name: 'forecast_model_run_20260126.json',
            url: 'https://p-root.local/files/forecast_model_run_20260126.json',
            highlight_text: `display_value=${displayValue}`,
            highlight_anchor: '$.forecast.daily',
          },
        ],
      },
    ],
    [lang]
  );

  const accuracyTraces = useMemo<{
    d1: TraceabilityPayload;
    d2: TraceabilityPayload;
    d3: TraceabilityPayload;
  }>(() => {
    const buildAccuracyTrace = (
      horizon: 'd1' | 'd2' | 'd3',
      traceId: string,
      colorLabel: string
    ): TraceabilityPayload => {
      const catalogTrace = traceCatalog[traceId];
      if (catalogTrace) {
        const summary = accuracyHoverInfo[horizon].summary;
        const displayValue = `${avgAccuracy[horizon]}%`;
        return {
          ...catalogTrace,
          display_value: displayValue,
          logic_summary: summary,
          version_history:
            catalogTrace.version_history ?? buildForecastVersionHistory(displayValue, summary, catalogTrace.confidence),
        };
      }

      const sourceName = horizon.toUpperCase();
      const summary = accuracyHoverInfo[horizon].summary;
      const displayValue = `${avgAccuracy[horizon]}%`;
      const confidence = horizon === 'd1' ? 0.86 : horizon === 'd2' ? 0.82 : 0.79;
      return {
        trace_id: traceId,
        display_value: displayValue,
        logic_summary: summary,
        logic_formula:
          lang === 'ko'
            ? `정확도(${sourceName}) = 100 - 평균(|예측-실측|/실측 × 100), 허용오차 톤=${colorLabel}`
            : `accuracy(${sourceName}) = 100 - avg(|predicted-actual|/actual × 100), tone=${colorLabel}`,
        data_source: [
          {
            source_id: `db:weight_predictions_${horizon}:2026-02-07`,
            type: 'db',
            name: `weight_predictions_${horizon}`,
            url: `https://p-root.local/db/weight_predictions_${horizon}?date=2026-02-07`,
            row_id: 'house=H01,date=2026-02-07',
            highlight_text: accuracyHoverInfo[horizon].summary,
            highlight_anchor: `metric=${horizon}_avg_accuracy`,
          },
          {
            source_id: 'db:cctv_weight_actual:2026-02-07',
            type: 'db',
            name: 'cctv_weight_actual',
            url: 'https://p-root.local/db/cctv_weight_actual?date=2026-02-07',
            row_id: 'house=H01,date=2026-02-07',
            highlight_text: accuracyHoverInfo[horizon].lines[0]?.text ?? '-',
            highlight_anchor: 'series=daily_actual',
          },
        ],
        is_ai_generated: true,
        source_version: 'model-2.4.1',
        snapshot_at: MEASUREMENT_STAT_TIME,
        confidence,
        version_history: buildForecastVersionHistory(displayValue, summary, confidence),
      };
    };

    return {
      d1: buildAccuracyTrace('d1', 'forecast:d1-avg-accuracy', 'good/medium/bad'),
      d2: buildAccuracyTrace('d2', 'forecast:d2-avg-accuracy', 'good/medium/bad'),
      d3: buildAccuracyTrace('d3', 'forecast:d3-avg-accuracy', 'good/medium/bad'),
    };
  }, [accuracyHoverInfo, avgAccuracy, buildForecastVersionHistory, lang]);

  /**
   * 날짜 인덱스 → 표시 문자열 매핑
   * @description 차트/테이블에서 날짜 표시용
   */
  const dateMaps = useMemo(() => {
    const weekdaysKo = ['일', '월', '화', '수', '목', '금', '토'];
    const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const mapKo = new Map<number, string>();
    const mapEn = new Map<number, string>();
    const mapPlain = new Map<number, string>();
    for (let d = 0; d <= maxDay; d += 1) {
      const date = new Date(BASE_DATE);
      date.setDate(BASE_DATE.getDate() + d);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      mapKo.set(d, `${month}/${day}(${weekdaysKo[date.getDay()]})`);
      mapEn.set(d, `${month}/${day}(${weekdaysEn[date.getDay()]})`);
      mapPlain.set(d, `${month}/${day}`);
    }
    return { ko: mapKo, en: mapEn, plain: mapPlain };
  }, [maxDay]);

  const dateMap = lang === 'ko' ? dateMaps.ko : dateMaps.en;
  const plainDateMap = dateMaps.plain;
  const predictionCards = useMemo<PredictionCard[]>(() => {
    const modelMap = pointMap(MODEL_POINTS);
    const observedMap = pointMap(OBSERVED_ACTUAL_POINTS);
    const todayAge = TODAY_INDEX - AGE_OFFSET;
    const cards = [todayAge, todayAge + 1, todayAge + 2, todayAge + 3];

    return cards.map((age, idx) => {
      const xIndex = age + AGE_OFFSET;
      const predicted = modelMap.get(xIndex);
      const value = typeof predicted === 'number' ? formatWeight(predicted) : '-';
      const baseSummary =
        idx === 0
          ? (lang === 'ko'
              ? '오늘 예측값과 실측값을 비교해 오차를 계산한 카드입니다.'
              : 'Today card compares predicted and actual values with error.')
          : (lang === 'ko'
              ? `${age}일령 모델 예측값 카드입니다.`
              : `Model forecast card for age ${age}.`);
      const baseConfidence = idx === 0 ? 0.85 : 0.8;
      const baseTrace: TraceabilityPayload = {
        trace_id: idx === 0 ? 'forecast:matrix-today' : `forecast:matrix-age-${age}`,
        display_value: value,
        logic_summary: baseSummary,
        logic_formula:
          idx === 0
            ? (lang === 'ko'
                ? '오차(%) = (실측-예측)/실측 × 100'
                : 'error(%) = (actual-predicted)/actual × 100')
            : (lang === 'ko'
                ? `예측값 = model(age=${age})`
                : `predicted = model(age=${age})`),
        data_source: [
          {
            source_id: 'db:weight_model_prediction:2026-02-07',
            type: 'db',
            name: 'weight_model_prediction',
            url: 'https://p-root.local/db/weight_model_prediction?date=2026-02-07',
            row_id: `house=H01,age=${age}`,
            highlight_text: `predicted=${value}`,
            highlight_anchor: `age=${age}`,
          },
        ],
        is_ai_generated: true,
        source_version: 'model-2.4.1',
        snapshot_at: MEASUREMENT_STAT_TIME,
        confidence: baseConfidence,
        version_history: buildForecastVersionHistory(value, baseSummary, baseConfidence),
      };

      if (idx === 0) {
        const actual = observedMap.get(xIndex);
        if (typeof predicted === 'number' && typeof actual === 'number') {
          const pct = ((actual - predicted) / actual) * 100;
          const catalogTrace = traceCatalog['forecast:matrix-today'];
          const todayTrace: TraceabilityPayload = catalogTrace
            ? {
                ...catalogTrace,
                display_value: value,
                logic_summary:
                  lang === 'ko'
                    ? `오늘 예측 ${value}, 실측 ${formatWeight(actual)}, 오차 ${formatSignedPercentCeil(pct)}`
                    : `Today predicted ${value}, actual ${formatWeight(actual)}, error ${formatSignedPercentCeil(pct)}`,
              }
            : {
                ...baseTrace,
                logic_summary:
                  lang === 'ko'
                    ? `오늘 예측 ${value}, 실측 ${formatWeight(actual)}, 오차 ${formatSignedPercentCeil(pct)}`
                    : `Today predicted ${value}, actual ${formatWeight(actual)}, error ${formatSignedPercentCeil(pct)}`,
                data_source: [
                  ...baseTrace.data_source,
                  {
                    source_id: 'db:cctv_weight_actual:2026-02-07',
                    type: 'db',
                    name: 'cctv_weight_actual',
                    url: 'https://p-root.local/db/cctv_weight_actual?date=2026-02-07',
                    row_id: `house=H01,age=${age}`,
                    highlight_text: `actual=${formatWeight(actual)}`,
                    highlight_anchor: `age=${age}`,
                  },
                ],
              };

          return {
            key: `pred-${age}`,
            label: lang === 'ko' ? '오늘' : 'Today',
            value,
            errorText: `(${formatSigned(actual - predicted, 'g')}/${formatSignedPercentCeil(pct)})`,
            isToday: true,
            tone: calcErrorClass(pct, ERROR_THRESHOLDS),
            trace: todayTrace,
          };
        }
        return {
          key: `pred-${age}`,
          label: lang === 'ko' ? '오늘' : 'Today',
          value,
          errorText: '(-)',
          isToday: true,
          tone: 'neutral',
          trace: baseTrace,
        };
      }

      return {
        key: `pred-${age}`,
        label: lang === 'ko' ? `${age}일령` : `${age}d`,
        value,
        errorText: '',
        isToday: false,
        tone: 'forecast',
        trace: baseTrace,
      };
    });
  }, [buildForecastVersionHistory, lang]);

  /**
   * 현재 페이지에 표시할 일령 열 (X축)
   * @description 전체보기: 25~45d 전체, 주간보기: 해당 페이지 7개만
   */
  const visibleAgeColumns = useMemo(() => {
    if (fitAll) return transposedColumns;
    const startAge = week === 1 ? 25 : week === 2 ? 32 : 39;
    const endAge = week === 1 ? 31 : week === 2 ? 38 : 45;
    return transposedColumns.filter(col => col.age >= startAge && col.age <= endAge);
  }, [fitAll, week]);

  /**
   * 현재 페이지에 표시할 날짜 행 (Y축)
   * @description
   * - 전체보기: 오늘까지의 모든 날짜 (역순, 최신이 위)
   * - 주간보기: 해당 일령 범위의 실측일만 표시
   *   - Page 1 (25-31d): 1/23~1/29
   *   - Page 2 (32-38d): 1/30~2/5
   *   - Page 3 (39-45d): 2/6~2/12 (미래)
   */
  const visibleRows = useMemo(() => {
    if (fitAll) {
      // 전체보기: 오늘까지만 표시
      return [...transposedRows].filter(row => row.xIndex <= TODAY_INDEX).reverse();
    }

    // 주간보기: 해당 일령 범위의 실측일만 필터링
    const startAge = week === 1 ? 25 : week === 2 ? 32 : 39;
    const endAge = week === 1 ? 31 : week === 2 ? 38 : 45;
    const { minDateX, maxDateX } = getRelevantDateRange(startAge, endAge);

    return [...transposedRows]
      .filter(row => row.xIndex >= minDateX && row.xIndex <= maxDateX)
      .reverse();
  }, [fitAll, week]);

  const buildMainChartPointTrace = useCallback(
    (dayIndex: number): TraceabilityPayload => {
      const age = dayIndex - AGE_OFFSET;
      const modelMap = pointMap(MODEL_POINTS);
      const observedMap = pointMap(OBSERVED_ACTUAL_POINTS);
      const d1Map = pointMap(D1_POINTS);
      const d2Map = pointMap(D2_POINTS);
      const d3Map = pointMap(D3_POINTS);
      const dateLabel = plainDateMap.get(dayIndex) ?? '-';
      const predicted = modelMap.get(dayIndex);
      const actual = observedMap.get(dayIndex);
      const d1 = d1Map.get(dayIndex + 1);
      const d2 = d2Map.get(dayIndex + 2);
      const d3 = d3Map.get(dayIndex + 3);

      const baseSummaryKo = `${age}일령(${dateLabel}) 기준 예측 시계열 포인트`;
      const baseSummaryEn = `Forecast series point at age ${age} (${dateLabel})`;
      const displayValue = typeof predicted === 'number' ? `${predicted.toLocaleString()}g` : '-';
      const summary =
        lang === 'ko'
          ? `${baseSummaryKo} · 실측 ${typeof actual === 'number' ? `${actual.toLocaleString()}g` : '없음'}`
          : `${baseSummaryEn} · Actual ${typeof actual === 'number' ? `${actual.toLocaleString()}g` : 'N/A'}`;
      const confidence = typeof actual === 'number' ? 0.84 : 0.74;

      return {
        trace_id: `forecast:chart-point:${dayIndex}`,
        display_value: displayValue,
        logic_summary: summary,
        logic_formula:
          lang === 'ko'
            ? '예측값 = model(age), D+1/2/3 = d1/d2/d3 시계열 참조'
            : 'predicted=model(age), D+1/2/3 from d1/d2/d3 series',
        data_source: [
          {
            source_id: 'db:weight_model_prediction:2026-02-07',
            type: 'db',
            name: 'weight_model_prediction',
            url: 'https://p-root.local/db/weight_model_prediction?date=2026-02-07',
            row_id: `house=H01,age=${age}`,
            highlight_text: `model=${typeof predicted === 'number' ? predicted.toLocaleString() : '-'}g`,
            highlight_anchor: `age=${age}`,
          },
          {
            source_id: 'db:cctv_weight_actual:2026-02-07',
            type: 'db',
            name: 'cctv_weight_actual',
            url: 'https://p-root.local/db/cctv_weight_actual?date=2026-02-07',
            row_id: `house=H01,age=${age}`,
            highlight_text: `actual=${typeof actual === 'number' ? actual.toLocaleString() : '-'}g`,
            highlight_anchor: `age=${age}`,
          },
          {
            source_id: 'file:forecast_horizons_20260207',
            type: 'file',
            name: 'forecast_horizons_20260207.json',
            url: 'https://p-root.local/files/forecast_horizons_20260207.json',
            highlight_text: `d1=${d1 ?? '-'}, d2=${d2 ?? '-'}, d3=${d3 ?? '-'}`,
            highlight_anchor: `x=${dayIndex}`,
          },
        ],
        is_ai_generated: true,
        source_version: 'model-2.4.1',
        snapshot_at: MEASUREMENT_STAT_TIME,
        confidence,
        version_history: buildForecastVersionHistory(displayValue, summary, confidence),
      };
    },
    [buildForecastVersionHistory, lang, plainDateMap]
  );

  const buildAccuracyChartPointTrace = useCallback(
    (dayIndex: number): TraceabilityPayload => {
      const age = dayIndex - AGE_OFFSET;
      const observedMap = pointMap(OBSERVED_ACTUAL_POINTS);
      const d1Map = pointMap(D1_POINTS);
      const d2Map = pointMap(D2_POINTS);
      const d3Map = pointMap(D3_POINTS);
      const actual = observedMap.get(dayIndex);
      const d1 = d1Map.get(dayIndex);
      const d2 = d2Map.get(dayIndex);
      const d3 = d3Map.get(dayIndex);

      const calcPct = (value: number | undefined) => {
        if (typeof actual !== 'number' || typeof value !== 'number') return '-';
        const pct = ((value - actual) / actual) * 100;
        return formatSignedPercentCeil(pct);
      };
      const displayValue = typeof actual === 'number' ? `${actual.toLocaleString()}g` : '-';
      const summary =
        lang === 'ko'
          ? `${age}일령 정확도 비교 포인트 (실측 vs D-1/D-2/D-3)`
          : `${age}d accuracy comparison point (actual vs D-1/D-2/D-3)`;
      const confidence = 0.83;

      return {
        trace_id: `forecast:accuracy-point:${dayIndex}`,
        display_value: displayValue,
        logic_summary: summary,
        logic_formula:
          lang === 'ko'
            ? '오차율 = (예측-실측)/실측 × 100'
            : 'error_pct = (predicted-actual)/actual × 100',
        data_source: [
          {
            source_id: 'db:cctv_weight_actual:2026-02-07',
            type: 'db',
            name: 'cctv_weight_actual',
            url: 'https://p-root.local/db/cctv_weight_actual?date=2026-02-07',
            row_id: `house=H01,age=${age}`,
            highlight_text: `actual=${actual ?? '-'}g`,
            highlight_anchor: `age=${age}`,
          },
          {
            source_id: 'db:weight_predictions_accuracy:2026-02-07',
            type: 'db',
            name: 'weight_predictions_accuracy',
            url: 'https://p-root.local/db/weight_predictions_accuracy?date=2026-02-07',
            row_id: `house=H01,age=${age}`,
            highlight_text: `d1=${calcPct(d1)}, d2=${calcPct(d2)}, d3=${calcPct(d3)}`,
            highlight_anchor: `age=${age}`,
          },
        ],
        is_ai_generated: true,
        source_version: 'model-2.4.1',
        snapshot_at: MEASUREMENT_STAT_TIME,
        confidence,
        version_history: buildForecastVersionHistory(displayValue, summary, confidence),
      };
    },
    [buildForecastVersionHistory, lang]
  );

  const buildMatrixCellTrace = (
    row: TransposedRow,
    col: TransposedColumn,
    cell: TraceableMatrixCell
  ): TraceabilityPayload => {
    const age = col.age;
    const measurementX = col.xIndex;
    const horizon = measurementX - row.xIndex;
    const traceId = `forecast:matrix-cell:${row.xIndex}:${age}:${cell.type}`;

    if (cell.type === 'actual') {
      return {
        trace_id: traceId,
        display_value: cell.value,
        logic_summary:
          lang === 'ko'
            ? `${age}일령 실측 체중과 전일 대비 변화량입니다.`
            : `${age}d actual weight and daily delta.`,
        logic_formula:
          lang === 'ko'
            ? '실측 변화율 = (오늘실측-전일실측)/전일실측 × 100'
            : 'delta_pct = (actual_today-actual_prev)/actual_prev × 100',
        data_source: [
          {
            source_id: 'db:cctv_weight_actual:2026-02-07',
            type: 'db',
            name: 'cctv_weight_actual',
            url: 'https://p-root.local/db/cctv_weight_actual?date=2026-02-07',
            row_id: `house=H01,age=${age}`,
            highlight_text: `${cell.value} ${cell.check}`,
            highlight_anchor: `age=${age}`,
          },
        ],
        is_ai_generated: false,
        source_version: 'v2026.02.11',
        snapshot_at: MEASUREMENT_STAT_TIME,
      };
    }

    if (cell.type === 'future') {
      const summary =
        lang === 'ko'
          ? `${age}일령 미래 예측 구간(${cell.label}) 값입니다.`
          : `${age}d future forecast value (${cell.label}).`;
      const confidence = 0.76;
      return {
        trace_id: traceId,
        display_value: cell.value,
        logic_summary: summary,
        logic_formula:
          lang === 'ko'
            ? `horizon=${horizon}일, model 예측값 사용`
            : `horizon=${horizon}, model forecast`,
        data_source: [
          {
            source_id: `db:weight_predictions_h${Math.max(1, horizon)}:2026-02-07`,
            type: 'db',
            name: `weight_predictions_h${Math.max(1, horizon)}`,
            url: `https://p-root.local/db/weight_predictions_h${Math.max(1, horizon)}?date=2026-02-07`,
            row_id: `house=H01,age=${age}`,
            highlight_text: `${cell.value} (${cell.label})`,
            highlight_anchor: `age=${age}`,
          },
        ],
        is_ai_generated: true,
        source_version: 'model-2.4.1',
        snapshot_at: MEASUREMENT_STAT_TIME,
        confidence,
        version_history: buildForecastVersionHistory(cell.value, summary, confidence),
      };
    }

    const predictionSummary =
      lang === 'ko'
        ? `${age}일령 D-${horizon} 예측값${cell.error ? ` (오차 ${cell.error})` : ''}`
        : `${age}d D-${horizon} prediction${cell.error ? ` (error ${cell.error})` : ''}`;
    const predictionConfidence = horizon === 1 ? 0.86 : horizon === 2 ? 0.82 : 0.79;
    return {
      trace_id: traceId,
      display_value: cell.value,
      logic_summary: predictionSummary,
      logic_formula:
        lang === 'ko'
          ? '오차율 = (예측-실측)/실측 × 100'
          : 'error_pct = (predicted-actual)/actual × 100',
      data_source: [
        {
          source_id: `db:weight_predictions_d${Math.max(1, Math.min(3, horizon))}:2026-02-07`,
          type: 'db',
          name: `weight_predictions_d${Math.max(1, Math.min(3, horizon))}`,
          url: `https://p-root.local/db/weight_predictions_d${Math.max(1, Math.min(3, horizon))}?date=2026-02-07`,
          row_id: `house=H01,age=${age}`,
          highlight_text: `${cell.value}${cell.error ? ` / ${cell.error}` : ''}`,
          highlight_anchor: `age=${age}`,
        },
      ],
      is_ai_generated: true,
      source_version: 'model-2.4.1',
      snapshot_at: MEASUREMENT_STAT_TIME,
      confidence: predictionConfidence,
      version_history: buildForecastVersionHistory(cell.value, predictionSummary, predictionConfidence),
    };
  };

  /**
   * 차트-테이블 연동: 호버된 일령 계산
   * @description 차트에서 특정 xIndex에 호버하면 해당 일령의 테이블 열을 하이라이트
   */
  const hoveredAge = hoveredDay != null ? hoveredDay - AGE_OFFSET : null;
  const hoveredColumnAge = transposedColumns.find(c => c.age === hoveredAge)?.age ?? null;
  const hoveredMainTooltipDayRef = useRef<number | null>(null);
  const hoveredAccuracyTooltipDayRef = useRef<number | null>(null);

  /** 차트 캔버스 ref */
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  /** Chart.js 인스턴스 ref (cleanup용) */
  const chartInstanceRef = useRef<any>(null);
  /** 예측 정확도 차트 캔버스 ref */
  const accuracyChartRef = useRef<HTMLCanvasElement | null>(null);
  /** 예측 정확도 Chart.js 인스턴스 ref */
  const accuracyChartInstanceRef = useRef<any>(null);

  /**
   * Chart.js 초기화 및 설정
   * @description
   * - 8개 데이터셋: 예측영역, 표준체중, 과거막대, 실측막대, 예측막대, 과거선, 실측선, 예측선
   * - todayForwardLabelsPlugin: 오늘+3일 예측값 라벨 표시
   * - onHover: hoveredDay 상태 업데이트 (테이블 연동)
   * - custom tooltip: 상세 예측 정보 표시
   */
  useEffect(() => {
    const historyMap = pointMap(HISTORY_POINTS);
    const modelMap = pointMap(MODEL_POINTS);
    const d1Map = pointMap(D1_POINTS);
    const d2Map = pointMap(D2_POINTS);
    const d3Map = pointMap(D3_POINTS);
    const historyWithLink = [...HISTORY_POINTS, { x: FORECAST_START_INDEX, y: 1405 }];
    const standardWeightSeries = STANDARD_WEIGHT_POINTS.filter(
      (point) => point.x >= CHART_MIN_INDEX && point.x <= CHART_MAX_INDEX
    );
    const actualOnlyPoints = MODEL_POINTS.filter((point) => point.x <= TODAY_INDEX);
    const forecastPoints = MODEL_POINTS.filter((point) => point.x >= TODAY_INDEX);
    const barPastColor = '#3fb950';
    const makeBarColor = (defaultColor: string) => (context: any) => {
      const xVal = context?.parsed?.x;
      if (typeof xVal === 'number' && xVal >= FORECAST_START_INDEX && xVal <= TODAY_INDEX) return barPastColor;
      return defaultColor;
    };

    const calcError = (current: number, baseline: number) => {
      const diff = current - baseline;
      const pct = baseline === 0 ? 0 : (diff / baseline) * 100;
      return {
        diff,
        pct,
        pctText: formatSignedPercentCeil(pct),
        diffText: formatSigned(Number(diff.toFixed(1)), 'g'),
      };
    };

    const todayForwardLabelsPlugin = {
      id: 'todayForwardLabels',
      afterDatasetsDraw: (chart: any) => {
        const ctx = chart.ctx;
        const xScale = chart.scales.x;
        const yScale = chart.scales.y;
        const labels = [
          { x: TODAY_INDEX, value: modelMap.get(TODAY_INDEX) },
          { x: TODAY_INDEX + 1, value: d1Map.get(TODAY_INDEX + 1) },
          { x: TODAY_INDEX + 2, value: d2Map.get(TODAY_INDEX + 2) },
          { x: TODAY_INDEX + 3, value: d3Map.get(TODAY_INDEX + 3) },
        ];

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        labels.forEach((label: { x: number; value: number | undefined }) => {
          if (typeof label.value !== 'number') return;
          const x = xScale.getPixelForValue(label.x);
          const y = yScale.getPixelForValue(label.value);
          const text = `${label.value.toLocaleString()}`;
          const isTodayValue = label.x === TODAY_INDEX;
          ctx.font = isTodayValue
            ? '700 10px "Noto Sans KR", sans-serif'
            : '400 9px "Noto Sans KR", sans-serif';
          ctx.fillStyle = isTodayValue ? '#3fb950' : '#ffc107';
          ctx.fillText(text, x, y - 10);
        });
        ctx.restore();
      },
    };

    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      plugins: [todayForwardLabelsPlugin],
      data: {
        datasets: [
          {
            label: lang === 'ko' ? '예측 영역' : 'Forecast Area',
            data: MODEL_POINTS,
            borderColor: 'transparent',
            backgroundColor: 'rgba(0, 212, 170, 0.15)',
            pointRadius: 0,
            borderWidth: 0,
            fill: 'origin',
            tension: 0.35,
            order: 0,
          },
          {
            label: lang === 'ko' ? '표준 체중' : 'Standard Weight',
            data: standardWeightSeries,
            borderColor: '#4da3ff',
            backgroundColor: '#4da3ff',
            pointRadius: 0,
            borderWidth: 1,
            tension: 0.3,
            spanGaps: true,
            order: 1,
          },
          {
            type: 'bar',
            label: lang === 'ko' ? '과거 데이터(막대)' : 'History (Bars)',
            data: historyWithLink,
            backgroundColor: makeBarColor('rgb(128 128 128)'),
            borderWidth: 0,
            barThickness: 6,
            maxBarThickness: 6,
            grouped: false,
            order: 10,
          },
          {
            type: 'bar',
            label: lang === 'ko' ? '실측값(막대)' : 'Actual (Bars)',
            data: actualOnlyPoints,
            backgroundColor: makeBarColor('rgb(0 212 170)'),
            borderWidth: 0,
            barThickness: 6,
            maxBarThickness: 6,
            grouped: false,
            order: 10,
          },
          {
            type: 'bar',
            label: lang === 'ko' ? '예측값(막대)' : 'Forecast (Bars)',
            data: forecastPoints,
            backgroundColor: makeBarColor('rgb(255 193 7)'),
            borderWidth: 0,
            barThickness: 6,
            maxBarThickness: 6,
            grouped: false,
            order: 10,
          },
          {
            label: lang === 'ko' ? '과거 데이터' : 'History',
            data: historyWithLink,
            borderColor: '#808080',
            backgroundColor: '#808080',
            pointBackgroundColor: '#808080',
            pointBorderColor: '#808080',
            pointRadius: 0,
            pointHoverRadius: 0,
            pointHitRadius: 8,
            borderWidth: 1.5,
            tension: 0.35,
            order: 2,
          },
          {
            label: lang === 'ko' ? '실측값' : 'Actual',
            data: actualOnlyPoints,
            borderColor: '#3fb950',
            backgroundColor: '#3fb950',
            pointBackgroundColor: '#3fb950',
            pointBorderColor: '#3fb950',
            pointRadius: 0,
            pointHoverRadius: 0,
            pointHitRadius: 8,
            borderWidth: 2,
            tension: 0.35,
            order: 3,
          },
          {
            label: lang === 'ko' ? '예측값' : 'Forecast',
            data: forecastPoints,
            borderColor: '#ffc107',
            backgroundColor: '#ffc107',
            pointBackgroundColor: '#ffc107',
            pointBorderColor: '#ffc107',
            pointRadius: 0,
            pointHoverRadius: 0,
            pointHitRadius: 8,
            borderWidth: 2,
            borderDash: [6, 4],
            tension: 0.35,
            order: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onHover: (event: any, elements: any[]) => {
          if (!elements || elements.length === 0) {
            setHoveredDay(null);
            return;
          }
          const el = elements[0];
          const xVal = el.element?.parsed?.x;
          if (typeof xVal === 'number') {
            setHoveredDay(Math.round(xVal));
          }
        },
        onClick: (_event: unknown, elements: any[]) => {
          const clickedX = elements?.[0]?.element?.parsed?.x;
          const fallbackX = hoveredMainTooltipDayRef.current;
          const targetX = typeof clickedX === 'number' ? Math.round(clickedX) : fallbackX;
          if (typeof targetX === 'number') {
            onOpenTrace(buildMainChartPointTrace(targetX));
          }
        },
        plugins: {
          filler: { drawTime: 'beforeDatasetsDraw' },
          legend: { display: false },
          tooltip: {
            enabled: false,
            external: (context: any) => {
              const { chart, tooltip } = context;
              let tooltipEl = document.getElementById('chartjs-tooltip');

              if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.id = 'chartjs-tooltip';
                tooltipEl.style.cssText = 'background: rgba(10,10,15,0.95); border: 1px solid #2a2a3a; border-radius: 0; padding: 12px; pointer-events: auto; position: absolute; font-family: "Noto Sans KR", sans-serif; font-size: 12px; color: #f0f0f5; z-index: 9999;';
                document.body.appendChild(tooltipEl);
              }

              if (tooltip.opacity === 0) {
                hoveredMainTooltipDayRef.current = null;
                tooltipEl.style.opacity = '0';
                return;
              }

              const dayIndex = tooltip.dataPoints?.[0]?.parsed?.x;
              if (typeof dayIndex !== 'number') return;
              hoveredMainTooltipDayRef.current = Math.round(dayIndex);

              const dayAge = dayIndex - AGE_OFFSET;
              const dateLabel = plainDateMap.get(dayIndex) ?? '';
              const headerAgeText = dayAge > 0 ? `${dayAge}${lang === 'ko' ? '일령' : 'd'}` : '-';
              let html = `<div style="font-weight:600; margin-bottom:8px;">${headerAgeText} ${dateLabel} 22:00</div>`;

              const isArrivedDay = dayIndex <= TODAY_INDEX;
              const isFutureScenario = dayIndex > TODAY_INDEX;
              const todayPrediction = isFutureScenario
                ? undefined
                : (isArrivedDay ? (modelMap.get(dayIndex) ?? historyMap.get(dayIndex)) : undefined);
              const tomorrowPrediction = d1Map.get(dayIndex + 1);
              const dayAfterPrediction = d2Map.get(dayIndex + 2);
              const thirdDayPrediction = d3Map.get(dayIndex + 3);

              const primaryLabel = lang === 'ko' ? '예측무게' : 'Predicted Weight';
              const primaryValue = isFutureScenario
                ? `(${lang === 'ko' ? '분석중' : 'Analyzing'})`
                : (typeof todayPrediction === 'number' ? `${todayPrediction.toLocaleString()}g` : '-');
              html += `<div style="margin-bottom:6px;">${primaryLabel}: ${primaryValue}</div>`;

              const renderHorizonLine = (targetIndex: number, currentPrediction: number | undefined) => {
                const targetAge = targetIndex - AGE_OFFSET;
                const targetDate = plainDateMap.get(targetIndex) ?? '-';
                if (typeof currentPrediction !== 'number') {
                  return `<div style="margin-bottom:4px;">${targetAge}${lang === 'ko' ? '일령' : 'd'}(${targetDate}): -</div>`;
                }
                const baselinePrediction = targetIndex <= TODAY_INDEX ? modelMap.get(targetIndex) : undefined;
                if (typeof baselinePrediction !== 'number') {
                  return `<div style="margin-bottom:4px;">${targetAge}${lang === 'ko' ? '일령' : 'd'}(${targetDate}): ${currentPrediction.toLocaleString()}g <span style="color:#8b949e;">(${lang === 'ko' ? '분석중' : 'Analyzing'})</span></div>`;
                }
                const delta = calcError(currentPrediction, baselinePrediction);
                const color = getErrorColor(Math.abs(delta.pct), ERROR_THRESHOLDS, ERROR_COLORS);
                return `<div style="margin-bottom:4px; color:${color};">${targetAge}${lang === 'ko' ? '일령' : 'd'}(${targetDate}): ${currentPrediction.toLocaleString()}g (${delta.diffText}, ${delta.pctText})</div>`;
              };

              if (dayIndex >= FORECAST_START_INDEX) {
                if (isFutureScenario) {
                  html += `<div style="margin-bottom:4px;">${lang === 'ko' ? '오늘+1일령' : 'Today+1d'}: -</div>`;
                  html += `<div style="margin-bottom:4px;">${lang === 'ko' ? '오늘+2일령' : 'Today+2d'}: -</div>`;
                  html += `<div style="margin-bottom:4px;">${lang === 'ko' ? '오늘+3일령' : 'Today+3d'}: -</div>`;
                } else {
                  html += renderHorizonLine(dayIndex + 1, tomorrowPrediction);
                  html += renderHorizonLine(dayIndex + 2, dayAfterPrediction);
                  html += renderHorizonLine(dayIndex + 3, thirdDayPrediction);
                }
              }

              html += `<button type="button" data-trace-open style="margin-top:8px;border:1px solid #30363d;background:#11161d;color:#c9d1d9;padding:4px 8px;font-size:11px;cursor:pointer;">${lang === 'ko' ? '출처 열기' : 'Open Trace'}</button>`;

              tooltipEl.innerHTML = html;
              tooltipEl.style.opacity = '1';
              const traceButton = tooltipEl.querySelector<HTMLButtonElement>('[data-trace-open]');
              if (traceButton) {
                traceButton.onclick = (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onOpenTrace(buildMainChartPointTrace(Math.round(dayIndex)));
                };
              }

              const pos = chart.canvas.getBoundingClientRect();
              tooltipEl.style.left = pos.left + window.scrollX + tooltip.caretX + 10 + 'px';
              tooltipEl.style.top = pos.top + window.scrollY + tooltip.caretY - 10 + 'px';
            },
          },
        },
        scales: {
          x: {
            type: 'linear',
            min: CHART_MIN_INDEX,
            max: CHART_MAX_INDEX,
            grid: { color: '#2a2f37' },
            border: { color: '#374151' },
            ticks: {
              color: '#6b7280',
              font: { size: 10 },
              stepSize: 1,
              callback: (value: any) => {
                const day = Number(value);
                if (!Number.isFinite(day)) return '';
                const age = day - AGE_OFFSET;
                if (age < 8) return '';
                return `${age}`;
              },
            },
          },
          y: {
            min: 0,
            max: 3500,
            grid: { color: '#2a2f37' },
            border: { color: '#374151' },
            ticks: {
              color: '#6b7280',
              font: { size: 10 },
              stepSize: 500,
              callback: (value: any) => `${value}g`,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [buildMainChartPointTrace, dateMap, lang, onOpenTrace, plainDateMap]);

  /**
   * 예측 정확도 차트 초기화 (D-1, D-2, D-3 vs 실측값)
   */
  useEffect(() => {
    if (chartMode !== 'accuracy') return;
    if (!accuracyChartRef.current) return;
    const ctx = accuracyChartRef.current.getContext('2d');
    if (!ctx) return;

    if (accuracyChartInstanceRef.current) {
      accuracyChartInstanceRef.current.destroy();
    }

    const standardWeightFiltered = STANDARD_WEIGHT_POINTS.filter(
      (point) => point.x >= 26 && point.x <= 47
    );

    accuracyChartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: lang === 'ko' ? '표준 체중' : 'Standard Weight',
            data: standardWeightFiltered,
            borderColor: '#4da3ff',
            backgroundColor: '#4da3ff',
            pointRadius: 0,
            borderWidth: 3,
            tension: 0.3,
            spanGaps: true,
            order: 0,
          },
          {
            label: lang === 'ko' ? '실측값' : 'Actual',
            data: OBSERVED_ACTUAL_POINTS,
            borderColor: '#c9d1d9',
            backgroundColor: 'rgba(201, 209, 217, 0.15)',
            pointBackgroundColor: '#c9d1d9',
            pointRadius: 3,
            borderWidth: 2,
            tension: 0.35,
            fill: true,
          },
          {
            label: 'D-1',
            data: D1_POINTS,
            borderColor: '#3fb950',
            backgroundColor: 'transparent',
            pointBackgroundColor: '#3fb950',
            pointRadius: 0,
            pointHoverRadius: 4,
            borderWidth: 2,
            tension: 0.35,
          },
          {
            label: 'D-2',
            data: D2_POINTS,
            borderColor: '#ff7700',
            backgroundColor: 'transparent',
            pointBackgroundColor: '#ff7700',
            pointRadius: 0,
            pointHoverRadius: 4,
            borderWidth: 2,
            tension: 0.35,
          },
          {
            label: 'D-3',
            data: D3_POINTS,
            borderColor: '#f85149',
            backgroundColor: 'transparent',
            pointBackgroundColor: '#f85149',
            pointRadius: 0,
            pointHoverRadius: 4,
            borderWidth: 2,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (_event: unknown, elements: any[]) => {
          const clickedX = elements?.[0]?.element?.parsed?.x;
          const fallbackX = hoveredAccuracyTooltipDayRef.current;
          const targetX = typeof clickedX === 'number' ? Math.round(clickedX) : fallbackX;
          if (typeof targetX === 'number') {
            onOpenTrace(buildAccuracyChartPointTrace(targetX));
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: false,
            external: (context: any) => {
              const { chart, tooltip } = context;
              let tooltipEl = document.getElementById('accuracy-tooltip');

              if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.id = 'accuracy-tooltip';
                tooltipEl.style.cssText = 'background: rgba(10,10,15,0.95); border: 1px solid #2a2a3a; border-radius: 0; padding: 12px; pointer-events: auto; position: absolute; font-family: "Noto Sans KR", sans-serif; font-size: 12px; color: #f0f0f5; z-index: 9999;';
                document.body.appendChild(tooltipEl);
              }

              if (tooltip.opacity === 0) {
                hoveredAccuracyTooltipDayRef.current = null;
                tooltipEl.style.opacity = '0';
                return;
              }

              const dayIndex = tooltip.dataPoints?.[0]?.parsed?.x;
              if (typeof dayIndex !== 'number') return;
              hoveredAccuracyTooltipDayRef.current = Math.round(dayIndex);

              const dayAge = dayIndex - AGE_OFFSET;
              const observedMap = new Map(OBSERVED_ACTUAL_POINTS.map(p => [p.x, p.y]));
              const d1Map = new Map(D1_POINTS.map(p => [p.x, p.y]));
              const d2Map = new Map(D2_POINTS.map(p => [p.x, p.y]));
              const d3Map = new Map(D3_POINTS.map(p => [p.x, p.y]));

              const actual = observedMap.get(dayIndex);

              // 실측값이 없는 날짜(36일령 이후)는 툴팁 숨김
              if (typeof actual !== 'number') {
                tooltipEl.style.opacity = '0';
                return;
              }

              const d1 = d1Map.get(dayIndex);
              const d2 = d2Map.get(dayIndex);
              const d3 = d3Map.get(dayIndex);

              const headerText = `${dayAge}${lang === 'ko' ? '일령' : 'd'}`;
              let html = `<div style="font-weight:600; margin-bottom:8px;">${headerText}</div>`;

              const formatValue = (val: number | undefined, color: string, label: string) => {
                if (typeof val !== 'number') return `<div style="color:#6e7681;">${label}: -</div>`;
                let errorText = '';
                if (typeof actual === 'number' && label !== (lang === 'ko' ? '실측값' : 'Actual')) {
                  const diff = val - actual;
                  const pct = (diff / actual) * 100;
                  errorText = ` <span style="color:${color};">(${formatSignedPercentCeil(pct)})</span>`;
                }
                return `<div style="margin-bottom:4px;"><span style="color:${color};">${label}</span>: ${val.toLocaleString()}g${errorText}</div>`;
              };

              html += formatValue(actual, '#c9d1d9', lang === 'ko' ? '실측값' : 'Actual');
              html += formatValue(d1, '#3fb950', 'D-1');
              html += formatValue(d2, '#ff7700', 'D-2');
              html += formatValue(d3, '#f85149', 'D-3');
              html += `<button type="button" data-accuracy-trace-open style="margin-top:8px;border:1px solid #30363d;background:#11161d;color:#c9d1d9;padding:4px 8px;font-size:11px;cursor:pointer;">${lang === 'ko' ? '출처 열기' : 'Open Trace'}</button>`;

              tooltipEl.innerHTML = html;
              tooltipEl.style.opacity = '1';
              const traceButton = tooltipEl.querySelector<HTMLButtonElement>('[data-accuracy-trace-open]');
              if (traceButton) {
                traceButton.onclick = (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onOpenTrace(buildAccuracyChartPointTrace(Math.round(dayIndex)));
                };
              }

              const pos = chart.canvas.getBoundingClientRect();
              tooltipEl.style.left = pos.left + window.scrollX + tooltip.caretX + 10 + 'px';
              tooltipEl.style.top = pos.top + window.scrollY + tooltip.caretY - 10 + 'px';
            },
          },
        },
        scales: {
          x: {
            type: 'linear',
            min: 26,  // 24일령 (여백용)
            max: 47,  // 45일령
            grid: { color: '#2a2f37' },
            border: { color: '#374151' },
            ticks: {
              color: '#6b7280',
              font: { size: 10 },
              stepSize: 1,
              callback: (value: any) => {
                const day = Number(value);
                if (!Number.isFinite(day)) return '';
                const age = day - AGE_OFFSET;
                if (age < 25) return '';
                return `${age}`;
              },
            },
          },
          y: {
            min: 1200,
            max: 3000,
            grid: { color: '#2a2f37' },
            border: { color: '#374151' },
            ticks: {
              color: '#6b7280',
              font: { size: 10 },
              stepSize: 500,
              callback: (value: any) => `${value}g`,
            },
          },
        },
      },
    });

    return () => {
      if (accuracyChartInstanceRef.current) {
        accuracyChartInstanceRef.current.destroy();
        accuracyChartInstanceRef.current = null;
      }
    };
  }, [buildAccuracyChartPointTrace, chartMode, lang, onOpenTrace]);

  return (
    <>
      <style jsx>{`
        .forecast-group {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 0;
        }
        .forecast-card {
          background: transparent;
          border: none;
          padding: 12px;
        }
        .chart-container {
          height: 250px;
          margin-bottom: 0;
          position: relative;
        }
        .chart-legend-overlay {
          position: absolute;
          top: 10px;
          left: 50px;
          display: flex;
          flex-direction: row;
          gap: 10px;
          background: rgba(22, 27, 34, 0.85);
          padding: 6px 10px;
          border-radius: 0;
          border: 1px solid transparent;
          z-index: 10;
        }
        .legend-row {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: #8b949e;
        }
        .chart-error-legend {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          flex-direction: row;
          gap: 10px;
          background: #161b22;
          padding: 6px 10px;
          border-radius: 0;
          z-index: 10;
        }
        .chart-mode-switch {
          display: flex;
          align-items: center;
          gap: 4px;
          background: transparent;
          border: 1px solid #30363d;
          border-radius: 0;
          padding: 4px 10px;
          min-height: 30px;
          font-size: 12px;
          font-weight: 700;
          color: #8b949e;
          cursor: pointer;
          transition: all 0.2s;
        }
        .chart-mode-switch:hover {
          border-color: #8b949e;
          color: #c9d1d9;
        }
        .chart-mode-switch.active {
          background: rgba(63, 185, 80, 0.15);
          color: #3fb950;
          border-color: #3fb950;
        }
        .table-wrapper {
          overflow-x: auto;
          position: relative;
        }
        .table-legend-overlay {
          position: absolute;
          top: 32px;
          left: 58px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          background: #161b22;
          padding: 6px 8px;
          border-radius: 0;
          z-index: 10;
        }
        .matrix-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
          table-layout: fixed;
        }
        .matrix-table th, .matrix-table td {
          padding: 4px 5px;
          text-align: center;
          border-bottom: 1px solid #30363d;
        }
        .matrix-table th:first-child,
        .matrix-table td:first-child {
          width: 52px;
          min-width: 52px;
        }
        .matrix-table thead {
          position: sticky;
          top: 0;
          background: #161b22;
          z-index: 1;
        }
        .matrix-table thead th {
          color: #8b949e;
          font-weight: 500;
        }
        .date-main {
          display: block;
          color: #c9d1d9;
          font-weight: 600;
          font-size: 12px;
        }
        .date-sub {
          font-size: 10px;
          color: #6e7681;
          white-space: nowrap;
        }
        .age-main {
          display: block;
          color: #c9d1d9;
          font-weight: 600;
          font-size: 12px;
        }
        .today-col {
          background: transparent;
        }
        .today-row {
          background: rgba(63, 185, 80, 0.08);
        }
        .today-row td:first-child {
          border-left: 2px solid #3fb950;
        }
        .hovered-col {
          background: rgba(139, 92, 246, 0.15);
        }
        .row-header {
          text-align: left !important;
          color: #c9d1d9;
          font-weight: 600;
        }
        .prediction-cell .value {
          color: #c9d1d9;
          display: block;
        }
        .prediction-cell .error {
          font-size: 9px;
          color: #ffc107;
          display: block;
          margin-top: 2px;
        }
        .prediction-cell .error.good { color: #3fb950; }
        .prediction-cell .error.medium { color: #ff7700; }
        .prediction-cell .error.bad { color: #f85149; }
        .actual-cell {
          background: rgba(63, 185, 80, 0.15);
        }
        .actual-cell .value {
          color: #3fb950;
          font-weight: 700;
          display: block;
          font-size: 11px;
        }
        .actual-cell .check {
          color: #3fb950;
          font-size: 9px;
          display: block;
          margin-top: 2px;
        }
        .future-cell {
          background: rgba(255, 193, 7, 0.1);
        }
        .future-cell .value {
          color: #ffc107;
          display: block;
        }
        .future-cell .label {
          font-size: 9px;
          color: #6e7681;
          display: block;
        }
        .empty-cell {
          color: #484f58;
        }
        .legend {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #30363d;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          color: #8b949e;
        }
        .legend-dot {
          width: 16px;
          height: 8px;
          border-radius: 1px;
        }
        .legend-dot.actual { background: #3fb950; }
        .legend-dot.future { background: #ffc107; }
        .legend-dot.good { background: #3fb950; }
        .legend-dot.medium { background: #ff7700; }
        .legend-dot.bad { background: #f85149; }
        .accuracy-indicators {
          display: flex;
          gap: 6px;
          align-items: stretch;
        }
        .accuracy-item {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid #30363d;
          border-radius: 0;
          padding: 4px 10px;
          min-height: 30px;
          min-width: 74px;
          position: relative;
        }
        .prediction-item {
          min-width: fit-content;
          flex-shrink: 0;
        }
        .accuracy-tooltip {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          display: none;
          width: 240px;
          max-width: calc(100vw - 48px);
          background: rgba(10, 10, 15, 0.96);
          border: 1px solid #2a2a3a;
          border-radius: 0;
          padding: 10px 12px;
          color: #f0f0f5;
          font-size: 12px;
          line-height: 1.35;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
          z-index: 40;
        }
        .accuracy-item:hover .accuracy-tooltip {
          display: block;
        }
        .accuracy-tooltip-summary {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .accuracy-tooltip-line {
          white-space: normal;
          word-break: break-word;
          overflow-wrap: anywhere;
        }
        .accuracy-tooltip-line.good { color: rgba(63, 185, 80, 0.6); }
        .accuracy-tooltip-line.medium { color: rgba(255, 119, 0, 0.6); }
        .accuracy-tooltip-line.bad { color: rgba(248, 81, 73, 0.6); }
        .accuracy-label {
          display: flex;
          flex-direction: column;
          min-width: 30px;
          line-height: 1.1;
        }
        .accuracy-label .day {
          font-size: 12px;
          font-weight: 700;
          color: #8b949e;
        }
        .accuracy-segments {
          display: flex;
          gap: 3px;
          width: 53px;
        }
        .accuracy-segment {
          flex: 1;
          height: 8px;
          border-radius: 1px;
          background: #21262d;
        }
        .accuracy-segment.good { background: #3fb950; }
        .accuracy-segment.medium { background: #ff7700; }
        .accuracy-segment.bad { background: #f85149; }
        .prediction-placeholder .accuracy-segment {
          opacity: 0;
        }
        .prediction-placeholder {
          width: 0 !important;
          min-width: 0 !important;
          overflow: hidden;
          margin: 0 !important;
          gap: 0 !important;
        }
        .accuracy-value {
          font-size: 12px;
          font-weight: 400;
          min-width: 36px;
          text-align: right;
          color: #8b949e;
        }
        .prediction-value {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          min-width: 0;
          text-align: left;
        }
        .prediction-main {
          font-size: 12px;
          font-weight: 400;
          white-space: nowrap;
        }
        .prediction-main.forecast { color: #ffc107; }
        .prediction-main.good { color: #3fb950; }
        .prediction-main.medium { color: #ff7700; }
        .prediction-main.bad { color: #f85149; }
        .prediction-main.neutral { color: #8b949e; }
        .prediction-error {
          margin-left: 4px;
          font-size: 11px;
          font-weight: 400;
          white-space: nowrap;
        }
        .prediction-error.good { color: #3fb950; }
        .prediction-error.medium { color: #ff7700; }
        .prediction-error.bad { color: #f85149; }
        .prediction-error.neutral { color: #8b949e; }
        .accuracy-item.good .accuracy-tooltip-summary { color: #3fb950; }
        .accuracy-item.medium .accuracy-tooltip-summary { color: #ff7700; }
        .accuracy-item.bad .accuracy-tooltip-summary { color: #f85149; }
        .week-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #8b949e;
        }
        .week-btn {
          background: transparent;
          border: none;
          color: #8b949e;
          padding: 2px;
          cursor: pointer;
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }
        .week-btn:hover {
          color: #c9d1d9;
        }
        .fit-switch {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 700;
          color: #8b949e;
          cursor: pointer;
          background: transparent;
          border: 1px solid #30363d;
          padding: 4px 10px;
          min-height: 30px;
          border-radius: 0;
          transition: all 0.2s;
        }
        .fit-switch:hover {
          background: #21262d;
        }
        .fit-switch.active {
          background: rgba(63, 185, 80, 0.15);
          color: #3fb950;
          border-color: #3fb950;
        }
      `}</style>

      <div className="space-y-0">
        <div className="forecast-group">
        <div className="forecast-card pt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
          <div className="flex items-center min-w-0">
            <h3 className="text-gray-400 font-medium">{lang === 'ko' ? 'CCTV 무게예측' : 'CCTV WEIGHT'}</h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="accuracy-indicators">
              <div className={`accuracy-item ${getAccuracyTone(Number(avgAccuracy.d1))}`}>
                <div className="accuracy-label">
                  <span className="day">D-1</span>
                </div>
                {(() => {
                  const tone = getAccuracyTone(Number(avgAccuracy.d1));
                  const count = tone === 'good' ? 3 : tone === 'medium' ? 2 : 1;
                  return (
                    <div className="accuracy-segments">
                      {[0, 1, 2].map(i => (
                        <div key={i} className={`accuracy-segment ${i < count ? tone : ''}`} />
                      ))}
                    </div>
                  );
                })()}
                <TraceableValue
                  value={`${avgAccuracy.d1}%`}
                  trace={accuracyTraces.d1}
                  onOpenTrace={onOpenTrace}
                  indicatorMode="compact"
                  align="right"
                  className="w-full justify-end px-0 py-0"
                  valueClassName="accuracy-value"
                />
                <div className="accuracy-tooltip">
                  <div className="accuracy-tooltip-summary">{accuracyHoverInfo.d1.summary}</div>
                  {accuracyHoverInfo.d1.lines.map((line, idx) => (
                    <div key={`d1-${idx}`} className={`accuracy-tooltip-line ${line.tone}`}>
                      {line.text}
                    </div>
                  ))}
                </div>
              </div>
              <div className={`accuracy-item ${getAccuracyTone(Number(avgAccuracy.d2))}`}>
                <div className="accuracy-label">
                  <span className="day">D-2</span>
                </div>
                {(() => {
                  const tone = getAccuracyTone(Number(avgAccuracy.d2));
                  const count = tone === 'good' ? 3 : tone === 'medium' ? 2 : 1;
                  return (
                    <div className="accuracy-segments">
                      {[0, 1, 2].map(i => (
                        <div key={i} className={`accuracy-segment ${i < count ? tone : ''}`} />
                      ))}
                    </div>
                  );
                })()}
                <TraceableValue
                  value={`${avgAccuracy.d2}%`}
                  trace={accuracyTraces.d2}
                  onOpenTrace={onOpenTrace}
                  indicatorMode="compact"
                  align="right"
                  className="w-full justify-end px-0 py-0"
                  valueClassName="accuracy-value"
                />
                <div className="accuracy-tooltip">
                  <div className="accuracy-tooltip-summary">{accuracyHoverInfo.d2.summary}</div>
                  {accuracyHoverInfo.d2.lines.map((line, idx) => (
                    <div key={`d2-${idx}`} className={`accuracy-tooltip-line ${line.tone}`}>
                      {line.text}
                    </div>
                  ))}
                </div>
              </div>
              <div className={`accuracy-item ${getAccuracyTone(Number(avgAccuracy.d3))}`}>
                <div className="accuracy-label">
                  <span className="day">D-3</span>
                </div>
                {(() => {
                  const tone = getAccuracyTone(Number(avgAccuracy.d3));
                  const count = tone === 'good' ? 3 : tone === 'medium' ? 2 : 1;
                  return (
                    <div className="accuracy-segments">
                      {[0, 1, 2].map(i => (
                        <div key={i} className={`accuracy-segment ${i < count ? tone : ''}`} />
                      ))}
                    </div>
                  );
                })()}
                <TraceableValue
                  value={`${avgAccuracy.d3}%`}
                  trace={accuracyTraces.d3}
                  onOpenTrace={onOpenTrace}
                  indicatorMode="compact"
                  align="right"
                  className="w-full justify-end px-0 py-0"
                  valueClassName="accuracy-value"
                />
                <div className="accuracy-tooltip">
                  <div className="accuracy-tooltip-summary">{accuracyHoverInfo.d3.summary}</div>
                  {accuracyHoverInfo.d3.lines.map((line, idx) => (
                    <div key={`d3-${idx}`} className={`accuracy-tooltip-line ${line.tone}`}>
                      {line.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              className={`chart-mode-switch ${chartMode === 'accuracy' ? 'active' : ''}`}
              onClick={() => setChartMode(m => m === 'main' ? 'accuracy' : 'main')}
            >
              <span>⇄</span>
              <span>{chartMode === 'main' ? (lang === 'ko' ? '정확도 보기' : 'Accuracy') : (lang === 'ko' ? '차트 보기' : 'Chart')}</span>
            </button>
          </div>
          </div>

          {/* Chart */}
          <div className="chart-container">
          <canvas ref={chartRef} style={{ display: chartMode === 'main' ? 'block' : 'none' }} />
          <canvas ref={accuracyChartRef} style={{ display: chartMode === 'accuracy' ? 'block' : 'none' }} />
          {/* Chart Legend Overlay */}
          <div className="chart-legend-overlay">
            {chartMode === 'main' ? (
              <>
                <div className="legend-row">
                  <div className="w-2 h-2 bg-[#3fb950] " />
                  <span>{lang === 'ko' ? '3일 예측 구간' : '3-day Forecast'}</span>
                </div>
                <div className="legend-row">
                  <div className="w-2 h-2 bg-[#4da3ff] " />
                  <span>{lang === 'ko' ? '표준 체중' : 'Standard'}</span>
                </div>
                <div className="legend-row">
                  <div className="w-2 h-2 bg-[#808080] " />
                  <span>{lang === 'ko' ? '예측무게' : 'Predicted'}</span>
                </div>
                <div className="legend-row">
                  <div className="w-2 h-2 bg-[#ffc107] " />
                  <span>{lang === 'ko' ? '3일예측' : 'Forecast'}</span>
                </div>
              </>
            ) : (
              <>
                <div className="legend-row">
                  <div className="w-2 h-2 bg-[#4da3ff] " />
                  <span>{lang === 'ko' ? '표준 체중' : 'Standard'}</span>
                </div>
                <div className="legend-row">
                  <div className="w-2 h-2 bg-[#c9d1d9] " />
                  <span>{lang === 'ko' ? '실측값' : 'Actual'}</span>
                </div>
                <div className="legend-row">
                  <div className="w-2 h-2 bg-[#3fb950] " />
                  <span>D-1</span>
                </div>
                <div className="legend-row">
                  <div className="w-2 h-2 bg-[#ff7700] " />
                  <span>D-2</span>
                </div>
                <div className="legend-row">
                  <div className="w-2 h-2 bg-[#f85149] " />
                  <span>D-3</span>
                </div>
              </>
            )}
          </div>
          {/* Error Range Legend - Top Right */}
          <div className="chart-error-legend">
            <div className="legend-row">
              <span className="legend-dot good"></span>
              <span>±3%</span>
            </div>
            <div className="legend-row">
              <span className="legend-dot medium"></span>
              <span>±5%</span>
            </div>
            <div className="legend-row">
              <span className="legend-dot bad"></span>
              <span>{'>'}±5%</span>
            </div>
          </div>
          <div className="mt-1 flex justify-end">
            <p className="text-[10px] text-gray-500">
              {lang === 'ko' ? '체중 측정 시각' : 'Weights at'} {MEASUREMENT_STAT_TIME}
            </p>
          </div>
        </div>
        </div>

        <div className="forecast-card">
          {/* Table Title & Header */}
          <div className="mt-1 border-t border-[#30363d] pt-3">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 font-medium">{lang === 'ko' ? '3일 예측 매트릭스' : 'ROLLING FORECAST MATRIX'}</h3>
            <div className="flex items-center gap-3">
              <div className="accuracy-indicators">
                {predictionCards.map((card) => (
                  <div key={card.key} className="accuracy-item prediction-item">
                    <div className="accuracy-label">
                      <span className="day">{card.label}</span>
                    </div>
                    <div className="accuracy-segments prediction-placeholder">
                      {[0, 1, 2].map((i) => (
                        <div key={`pred-slot-${card.key}-${i}`} className="accuracy-segment" />
                      ))}
                    </div>
                    <span className="accuracy-value prediction-value">
                      <TraceableValue
                        value={<span className={`prediction-main ${card.tone}`}>{card.value}</span>}
                        trace={card.trace}
                        onOpenTrace={onOpenTrace}
                        indicatorMode="compact"
                        align="center"
                        className="w-auto justify-center px-0 py-0"
                      />
                      {card.isToday && <span className={`prediction-error ${card.tone}`}>{card.errorText}</span>}
                    </span>
                  </div>
                ))}
              </div>
              {!isRollingCollapsed && (
                <>
                  {!fitAll && (
                    <div className="week-nav">
                      <button className="week-btn" onClick={() => setWeek(w => (w === 1 ? 3 : w - 1) as 1 | 2 | 3)}>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span>{ageRangeLabels[week][lang]}</span>
                      <button className="week-btn" onClick={() => setWeek(w => (w === 3 ? 1 : w + 1) as 1 | 2 | 3)}>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
              <button
                type="button"
                className={`border min-h-[30px] px-[10px] py-[4px] text-[12px] font-bold transition-colors flex items-center gap-1 ${
                  isRollingCollapsed
                    ? 'border-[#30363d] text-gray-400 hover:text-gray-200'
                    : 'border-[#3fb950] text-[#3fb950] bg-[#3fb950]/10'
                }`}
                onClick={() => setIsRollingCollapsed(v => !v)}
                aria-label={lang === 'ko' ? '3일 예측 매트릭스 접기/펼치기' : 'Toggle forecast table'}
              >
                <span>{isRollingCollapsed ? (lang === 'ko' ? '상세보기' : 'Show Details') : (lang === 'ko' ? '상세닫기' : 'Hide Details')}</span>
                {isRollingCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>
            </div>
          </div>
          </div>

          {!isRollingCollapsed && (
            <>
              {/* Table (Transposed: X-axis=Age, Y-axis=Date) */}
              <div className="table-wrapper mt-3">
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>{lang === 'ko' ? '날짜' : 'Date'}</th>
                      {visibleAgeColumns.map(col => (
                        <th
                          key={col.age}
                          className={`${col.isTodayAge ? 'today-col' : ''} ${hoveredColumnAge === col.age ? 'hovered-col' : ''}`}
                        >
                          <span className="age-main">{col.age}{lang === 'ko' ? '일령' : 'd'}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row, rowIdx) => (
                      <tr key={rowIdx} className={row.isToday ? 'today-row' : ''}>
                        <td className="row-header">
                          <span className="date-main">{row.date[lang]}</span>
                          <span className="date-sub">{row.dateSub[lang]}</span>
                        </td>
                        {visibleAgeColumns.map(col => {
                          const cellIdx = transposedColumns.findIndex(c => c.age === col.age);
                          const cell = row.cells[cellIdx];
                          const todayColClass = col.isTodayAge ? ' today-col' : '';
                          const hoveredClass = hoveredColumnAge === col.age ? ' hovered-col' : '';
                          if (!cell) return <td key={col.age} className={`empty-cell${todayColClass}${hoveredClass}`}>-</td>;

                          if (cell.type === 'prediction') {
                            return (
                              <td key={col.age} className={`prediction-cell${todayColClass}${hoveredClass}`}>
                                <TraceableValue
                                  value={cell.value}
                                  trace={buildMatrixCellTrace(row, col, cell)}
                                  onOpenTrace={onOpenTrace}
                                  indicatorMode="compact"
                                  showOriginBadge={false}
                                  align="right"
                                  className="w-full justify-end px-0 py-0"
                                  valueClassName="value"
                                />
                                {cell.error && <span className={`error ${cell.errorClass}`}>{cell.error}</span>}
                              </td>
                            );
                          }
                          if (cell.type === 'actual') {
                            const checkText =
                              lang === 'ko'
                                ? cell.check
                                    .replace(/✓/g, '')
                                    .replace(/실측/g, '')
                                    .replace(/[()]/g, '')
                                    .replace(/\s+/g, ' ')
                                    .trim()
                                : cell.check
                                    .replace(/✓/g, '')
                                    .replace('실측', 'Actual')
                                    .replace(/[()]/g, '')
                                    .trim();
                            return (
                              <td key={col.age} className={`actual-cell${todayColClass}${hoveredClass}`}>
                                <TraceableValue
                                  value={cell.value}
                                  trace={buildMatrixCellTrace(row, col, cell)}
                                  onOpenTrace={onOpenTrace}
                                  indicatorMode="compact"
                                  showOriginBadge={false}
                                  align="right"
                                  className="w-full justify-end px-0 py-0"
                                  valueClassName="value"
                                />
                                <span className="check">{checkText}</span>
                              </td>
                            );
                          }
                          if (cell.type === 'future') {
                            return (
                              <td key={col.age} className={`future-cell${todayColClass}${hoveredClass}`}>
                                <TraceableValue
                                  value={cell.value}
                                  trace={buildMatrixCellTrace(row, col, cell)}
                                  onOpenTrace={onOpenTrace}
                                  indicatorMode="compact"
                                  showOriginBadge={false}
                                  align="right"
                                  className="w-full justify-end px-0 py-0"
                                  valueClassName="value"
                                />
                                <span className="label">{cell.label}</span>
                              </td>
                            );
                          }
                          return <td key={col.age} className={`empty-cell${todayColClass}${hoveredClass}`}>{cell.value}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 flex justify-end">
                <p className="text-[10px] text-gray-500">
                  {lang === 'ko' ? '체중 측정 시각' : 'Weights at'} {MEASUREMENT_STAT_TIME}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFitAll(v => !v)}
                className={`mt-1 w-full border min-h-[30px] px-[10px] py-[4px] text-[12px] font-bold transition-colors flex items-center justify-center ${
                  fitAll
                    ? 'border-[#3fb950] text-[#3fb950] bg-[#3fb950]/10'
                    : 'border-[#30363d] text-gray-400 hover:text-gray-200'
                }`}
              >
                {fitAll
                  ? (lang === 'ko' ? '전체닫기' : 'Hide All')
                  : (lang === 'ko' ? '전체보기' : 'Show All')}
              </button>
            </>
          )}
        </div>
        </div>
      </div>
    </>
  );
};

export default ForecastMatrix;
