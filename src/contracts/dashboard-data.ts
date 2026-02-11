import type {
  DataSourceReference,
  TraceabilityPayload,
  TraceVersionSnapshot,
} from '@/types/traceability';

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
  traceCatalog?: Record<string, TraceabilityPayload>;
};

const isPoint = (value: unknown): value is Point => {
  if (!value || typeof value !== 'object') return false;
  const point = value as Record<string, unknown>;
  return typeof point.x === 'number' && typeof point.y === 'number';
};

const isPointArray = (value: unknown): value is Point[] => Array.isArray(value) && value.every(isPoint);

const isDataSourceReference = (value: unknown): value is DataSourceReference => {
  if (!value || typeof value !== 'object') return false;
  const source = value as Record<string, unknown>;
  return (
    typeof source.source_id === 'string' &&
    typeof source.type === 'string' &&
    typeof source.name === 'string' &&
    typeof source.url === 'string' &&
    (source.page === undefined || typeof source.page === 'number') &&
    (source.row_id === undefined || typeof source.row_id === 'string') &&
    (source.highlight_text === undefined || typeof source.highlight_text === 'string') &&
    (source.highlight_anchor === undefined || typeof source.highlight_anchor === 'string')
  );
};

const isTraceVersionSnapshot = (value: unknown): value is TraceVersionSnapshot => {
  if (!value || typeof value !== 'object') return false;
  const snapshot = value as Record<string, unknown>;
  return (
    typeof snapshot.source_version === 'string' &&
    typeof snapshot.snapshot_at === 'string' &&
    (snapshot.display_value === undefined || typeof snapshot.display_value === 'string') &&
    (snapshot.logic_summary === undefined || typeof snapshot.logic_summary === 'string') &&
    (snapshot.confidence === undefined || typeof snapshot.confidence === 'number') &&
    (snapshot.data_source === undefined ||
      (Array.isArray(snapshot.data_source) && snapshot.data_source.every(isDataSourceReference)))
  );
};

const isTraceabilityPayload = (value: unknown): value is TraceabilityPayload => {
  if (!value || typeof value !== 'object') return false;
  const trace = value as Record<string, unknown>;

  return (
    typeof trace.trace_id === 'string' &&
    typeof trace.display_value === 'string' &&
    typeof trace.logic_summary === 'string' &&
    Array.isArray(trace.data_source) &&
    trace.data_source.every(isDataSourceReference) &&
    typeof trace.is_ai_generated === 'boolean' &&
    (trace.logic_formula === undefined || typeof trace.logic_formula === 'string') &&
    (trace.source_version === undefined || typeof trace.source_version === 'string') &&
    (trace.snapshot_at === undefined || typeof trace.snapshot_at === 'string') &&
    (trace.confidence === undefined || typeof trace.confidence === 'number') &&
    (trace.version_history === undefined ||
      (Array.isArray(trace.version_history) && trace.version_history.every(isTraceVersionSnapshot)))
  );
};

const isTraceCatalog = (value: unknown): value is Record<string, TraceabilityPayload> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.values(value as Record<string, unknown>).every(isTraceabilityPayload);
};

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
    typeof colors?.bad === 'string' &&
    (data.traceCatalog === undefined || isTraceCatalog(data.traceCatalog));

  if (!isValid) {
    throw new Error('dashboard-data: schema mismatch');
  }
};
