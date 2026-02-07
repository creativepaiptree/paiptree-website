export type Point = { x: number; y: number };

export type ErrorThresholds = {
  goodMax: number;
  mediumMax: number;
};

export type RoundingRule = {
  mode: 'ceil_abs';
  percentDecimals: number;
};

export type DashboardColors = {
  good: string;
  medium: string;
  bad: string;
};

export type ForecastRules = {
  thresholds: ErrorThresholds;
  rounding: RoundingRule;
  colors: DashboardColors;
};

export type DashboardForecastData = {
  baseDate: string;
  todayIndex: number;
  ageOffset: number;
  forecastStartIndex: number;
  chartRange: {
    minIndex: number;
    maxIndex: number;
  };
  tableRange: {
    startX: number;
    endX: number;
    startAge: number;
    endAge: number;
  };
  series: {
    history: Point[];
    model: Point[];
    d1: Point[];
    d2: Point[];
    d3: Point[];
    observedActual: Point[];
    standardWeight: Point[];
  };
  rules: ForecastRules;
};

const isPoint = (value: unknown): value is Point => {
  if (!value || typeof value !== 'object') return false;
  const point = value as Record<string, unknown>;
  return typeof point.x === 'number' && typeof point.y === 'number';
};

const isPointArray = (value: unknown): value is Point[] => Array.isArray(value) && value.every(isPoint);

export const assertDashboardForecastData: (value: unknown) => asserts value is DashboardForecastData = (value) => {
  if (!value || typeof value !== 'object') {
    throw new Error('dashboard-data: invalid root');
  }

  const data = value as Record<string, unknown>;
  const series = data.series as Record<string, unknown> | undefined;
  const rules = data.rules as Record<string, unknown> | undefined;
  const thresholds = rules?.thresholds as Record<string, unknown> | undefined;
  const rounding = rules?.rounding as Record<string, unknown> | undefined;
  const colors = rules?.colors as Record<string, unknown> | undefined;

  const isValid =
    typeof data.baseDate === 'string' &&
    typeof data.todayIndex === 'number' &&
    typeof data.ageOffset === 'number' &&
    typeof data.forecastStartIndex === 'number' &&
    typeof (data.chartRange as Record<string, unknown> | undefined)?.minIndex === 'number' &&
    typeof (data.chartRange as Record<string, unknown> | undefined)?.maxIndex === 'number' &&
    typeof (data.tableRange as Record<string, unknown> | undefined)?.startX === 'number' &&
    typeof (data.tableRange as Record<string, unknown> | undefined)?.endX === 'number' &&
    typeof (data.tableRange as Record<string, unknown> | undefined)?.startAge === 'number' &&
    typeof (data.tableRange as Record<string, unknown> | undefined)?.endAge === 'number' &&
    !!series &&
    isPointArray(series.history) &&
    isPointArray(series.model) &&
    isPointArray(series.d1) &&
    isPointArray(series.d2) &&
    isPointArray(series.d3) &&
    isPointArray(series.observedActual) &&
    isPointArray(series.standardWeight) &&
    typeof thresholds?.goodMax === 'number' &&
    typeof thresholds?.mediumMax === 'number' &&
    rounding?.mode === 'ceil_abs' &&
    typeof rounding?.percentDecimals === 'number' &&
    typeof colors?.good === 'string' &&
    typeof colors?.medium === 'string' &&
    typeof colors?.bad === 'string';

  if (!isValid) {
    throw new Error('dashboard-data: schema mismatch');
  }
};
