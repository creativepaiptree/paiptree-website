export type CherryTmsGroupingPriceVariables = {
  standardFare: string;
  g70TransportFare: string;
  i70FuelFare: string;
  m70RoundTrip: string;
  q70CustomerAllowance: string;
  t70EtcAllowance: string;
  o70HolidayFare: string;
  s70MorningDrop: string;
};

export type CherryTmsGroupingDetailRow = {
  order: string;
  transportId: string;
  transportSeq: string;
  carSeq: string;
  region: string;
  weight: string;
  destination: string;
  judgement: string;
};

export type CherryTmsGroupingRow = {
  groupingDate: string | null;
  driver: string;
  vehicle: string;
  trips: string;
  startRegion: string;
  endRegion: string;
  businessOffice: string;
  totalWeight: string;
  routeOrder: string;
  autoStatus: string;
  prices: CherryTmsGroupingPriceVariables;
  details: CherryTmsGroupingDetailRow[];
};

export type CherryTmsGroupingPageData = {
  groupingDate: string | null;
  availableGroupingDates: string[];
  availableMonths: string[];
  sourceRowCount: number;
  candidateCount: number;
  manualReviewCount: number;
  rows: CherryTmsGroupingRow[];
};

type SupabaseGroupingRow = {
  grouping_date?: string | null;
  source_row_count?: number | null;
  candidate_count?: number | null;
  manual_review_count?: number | null;
  row_order?: number | null;
  driver_label?: string | null;
  vehicle_label?: string | null;
  trip_count?: number | null;
  origin?: string | null;
  destination?: string | null;
  business_office?: string | null;
  vehicle_ton_class?: string | null;
  route_order?: string | null;
  auto_status?: string | null;
  standard_fare?: number | string | null;
  transport_fare?: number | string | null;
  fuel_fare?: number | string | null;
  round_trip_fare?: number | string | null;
  customer_allowance?: number | string | null;
  etc_allowance?: number | string | null;
  holiday_fare?: number | string | null;
  morning_drop_allowance?: number | string | null;
  raw_row_count?: number | null;
  details?: Array<Record<string, unknown>> | null;
};

type CherryTmsGroupingQuery = {
  month?: string | null;
  groupingDate?: string | null;
};

const DEFAULT_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || process.env.SUPABASE_URL?.trim() || '';
const DEFAULT_SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_KEY?.trim() ||
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_KEY?.trim() ||
  '';
const DEFAULT_SUPABASE_VIEW = process.env.SUPABASE_CHERRY_TMS_GROUPING_VIEW?.trim() || 'tbl_tms_cherrybro_grouping_page_v1';

const asString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return '';
};

const asNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const normalized = asString(value).replace(/,/g, '');
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : 0;
};

const asNumberString = (value: unknown): string => {
  const numeric = asNumber(value);
  return numeric ? numeric.toLocaleString('ko-KR') : (asString(value) || '0');
};

const toPriceVariables = (row: SupabaseGroupingRow): CherryTmsGroupingPriceVariables => ({
  standardFare: asNumberString(row.standard_fare),
  g70TransportFare: asNumberString(row.transport_fare),
  i70FuelFare: asNumberString(row.fuel_fare),
  m70RoundTrip: asNumberString(row.round_trip_fare),
  q70CustomerAllowance: asNumberString(row.customer_allowance),
  t70EtcAllowance: asNumberString(row.etc_allowance),
  o70HolidayFare: asNumberString(row.holiday_fare),
  s70MorningDrop: asNumberString(row.morning_drop_allowance),
});

const toDetails = (details: SupabaseGroupingRow['details']): CherryTmsGroupingDetailRow[] => {
  if (!Array.isArray(details)) {
    return [];
  }

  return details
    .map((detail, index) => ({
      order: asString(detail.row_order ?? index + 1),
      transportId: asString(detail.transport_id),
      transportSeq: asString(detail.transport_seq),
      carSeq: asString(detail.car_seq),
      region: asString(detail.region),
      weight: asString(detail.weight_text),
      destination: asString(detail.destination_text),
      judgement: asString(detail.judgement),
    }))
    .filter((detail) => detail.transportId.length > 0 || detail.region.length > 0 || detail.destination.length > 0);
};

const toGroupingRow = (row: SupabaseGroupingRow): CherryTmsGroupingRow => ({
  groupingDate: normalizeDateKey(row.grouping_date) || null,
  driver: asString(row.driver_label),
  vehicle: asString(row.vehicle_label),
  trips: `${row.trip_count ?? 0}건`,
  startRegion: asString(row.origin),
  endRegion: asString(row.destination),
  businessOffice: asString(row.business_office),
  totalWeight: asString(row.vehicle_ton_class),
  routeOrder: asString(row.route_order),
  autoStatus: asString(row.auto_status),
  prices: toPriceVariables(row),
  details: toDetails(row.details),
});

const compareGroupingDateDesc = (a: string, b: string) => new Date(b).getTime() - new Date(a).getTime();

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const toMonthKey = (dateValue: string) => (dateValue.length >= 7 ? dateValue.slice(0, 7) : '');

const normalizeDateKey = (value: unknown): string => {
  const dateText = asString(value);
  if (!dateText) {
    return '';
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    return dateText;
  }
  const excelSerial = asNumber(value);
  if (excelSerial > 0) {
    return new Date(Date.UTC(1899, 11, 30 + excelSerial)).toISOString().slice(0, 10);
  }
  return dateText;
};

const uniqueSorted = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort(compareGroupingDateDesc);

const uniqueMonths = (dates: string[]) => Array.from(new Set(dates.map(toMonthKey).filter(Boolean))).sort(compareGroupingDateDesc);

const sumSelectedSourceRows = (rows: SupabaseGroupingRow[]) => {
  const byDate = new Map<string, number>();
  for (const row of rows) {
    const dateKey = normalizeDateKey(row.grouping_date);
    if (!dateKey) continue;
    if (!byDate.has(dateKey)) {
      const count = asNumber(row.source_row_count) || asNumber(row.raw_row_count);
      byDate.set(dateKey, count);
    }
  }
  return Array.from(byDate.values()).reduce((sum, count) => sum + count, 0);
};

const selectRows = (rows: SupabaseGroupingRow[], query: CherryTmsGroupingQuery) => {
  const allDates = uniqueSorted(rows.map((row) => normalizeDateKey(row.grouping_date)));
  const allMonths = uniqueMonths(allDates);
  const normalizedQueryMonth = query.month?.trim() || '';
  const normalizedQueryDate = query.groupingDate?.trim() || '';
  const selectedRows = normalizedQueryMonth || normalizedQueryDate
    ? normalizedQueryDate
      ? rows.filter((row) => normalizeDateKey(row.grouping_date) === normalizedQueryDate)
      : rows.filter((row) => toMonthKey(normalizeDateKey(row.grouping_date)) === normalizedQueryMonth)
    : rows;
  const selectedDates = uniqueSorted(selectedRows.map((row) => normalizeDateKey(row.grouping_date)));
  return {
    selectedRows,
    allDates,
    allMonths,
    activeMonth: normalizedQueryMonth || allMonths[0] || '',
    selectedDate: normalizedQueryDate || selectedDates[0] || null,
  };
};

export async function fetchCherryTmsGroupingPageData(query: CherryTmsGroupingQuery = {}): Promise<CherryTmsGroupingPageData | null> {
  if (!DEFAULT_SUPABASE_URL || !DEFAULT_SUPABASE_KEY) {
    return null;
  }

  try {
    const endpoint = new URL(`/rest/v1/${DEFAULT_SUPABASE_VIEW}`, DEFAULT_SUPABASE_URL.endsWith('/') ? DEFAULT_SUPABASE_URL : `${DEFAULT_SUPABASE_URL}/`);
    endpoint.searchParams.set('select', '*');
    endpoint.searchParams.set('order', 'grouping_date.desc,row_order.asc');
    endpoint.searchParams.set('limit', '1000');

    const response = await fetch(endpoint.toString(), {
      method: 'GET',
      cache: 'no-store',
      headers: {
        apikey: DEFAULT_SUPABASE_KEY,
        Authorization: `Bearer ${DEFAULT_SUPABASE_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase request failed (${response.status})`);
    }

    const payload = await response.json();
    const rows = Array.isArray(payload) ? payload.filter(isRecord).map((row) => row as SupabaseGroupingRow) : [];
    if (rows.length === 0) {
      return {
        groupingDate: query.groupingDate?.trim() || null,
        availableGroupingDates: [],
        availableMonths: [],
        sourceRowCount: 0,
        candidateCount: 0,
        manualReviewCount: 0,
        rows: [],
      };
    }

    const selection = selectRows(rows, query);
    const normalizedRows = selection.selectedRows
      .map(toGroupingRow)
      .filter((row) => row.driver.length > 0 || row.vehicle.length > 0)
      .sort((a, b) => Number.parseInt(a.trips, 10) - Number.parseInt(b.trips, 10));

    const sourceRowCount = sumSelectedSourceRows(selection.selectedRows) || normalizedRows.reduce((sum, row) => sum + row.details.length, 0);
    const candidateCount = normalizedRows.length;
    const manualReviewCount = normalizedRows.reduce((sum, row) => sum + row.details.filter((detail) => detail.judgement !== '정상').length, 0);

    return {
      groupingDate: selection.selectedDate,
      availableGroupingDates: selection.allDates,
      availableMonths: selection.allMonths,
      sourceRowCount,
      candidateCount,
      manualReviewCount,
      rows: normalizedRows,
    };
  } catch (error) {
    console.error('[cherry-tms-groupings] Supabase fetch failed', error);
    return null;
  }
}
