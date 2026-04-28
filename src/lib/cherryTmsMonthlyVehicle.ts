import { fetchCherryTmsGroupingPageData, type CherryTmsGroupingRow } from '@/lib/cherryTmsGroupings';

export type CherryTmsMonthlyVehicleQuery = {
  month?: string | null;
  vehicle?: string | null;
};

export type CherryTmsMonthlyVehicleSourceRow = CherryTmsGroupingRow;

export type CherryTmsMonthlyVehicleRow = {
  month: string;
  vehicle: string;
  driver: string;
  routeCount: number;
  sourceRowCount: number;
  regionSummary: string;
  totalWeightKg: number;
  dispatchTotal: number;
  fuelTotal: number;
  allowanceTotal: number;
  status: string;
  lastDispatchDate: string;
  routeLabels: string[];
  sourceRows: CherryTmsMonthlyVehicleSourceRow[];
};

export type CherryTmsMonthlyVehiclePageData = {
  sourceRowCount: number;
  aggregateCount: number;
  manualReviewCount: number;
  availableMonths: string[];
  availableVehicles: string[];
  rows: CherryTmsMonthlyVehicleRow[];
};

const asText = (value: unknown): string => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
};

const parseNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const normalized = asText(value).replace(/,/g, '').replace(/[^\d.-]/g, '');
  if (!normalized) return 0;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseKg = (value: unknown): number => {
  const text = asText(value);
  if (!text) return 0;
  const match = text.match(/([\d,]+)\s*kg/i);
  if (match) return parseNumber(match[1]);
  return parseNumber(text);
};

const normalizeMonthKey = (dateValue: string) => (dateValue.length >= 7 ? dateValue.slice(0, 7) : '');

const normalizeDateKey = (value: unknown): string => {
  const text = asText(value);
  if (!text) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const excelSerial = parseNumber(value);
  if (excelSerial > 0) {
    return new Date(Date.UTC(1899, 11, 30 + excelSerial)).toISOString().slice(0, 10);
  }
  return text;
};

const compareDesc = (a: string, b: string) => b.localeCompare(a, 'ko-KR');

const formatCurrency = (value: number) => `${Math.round(value).toLocaleString('ko-KR')}원`;

const parseTripCount = (value: string) => {
  const parsed = Number.parseInt(value.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const resolveStatus = (rows: CherryTmsMonthlyVehicleSourceRow[]) => {
  const labels = rows.flatMap((row) => [row.autoStatus, ...row.details.map((detail) => detail.judgement)]).filter(Boolean);
  if (labels.some((label) => /보정|반려|이상/.test(label))) return '보정필요';
  if (labels.some((label) => /차액|검토|확인/.test(label))) return '검토중';
  return '월마감완료';
};

export const aggregateRows = (rows: CherryTmsMonthlyVehicleSourceRow[]): CherryTmsMonthlyVehicleRow[] => {
  const byKey = new Map<string, CherryTmsMonthlyVehicleRow>();

  for (const row of rows) {
    const month = normalizeMonthKey(normalizeDateKey(row.groupingDate ?? ''));
    const vehicle = row.vehicle;
    if (!month || !vehicle) continue;

    const key = `${month}::${vehicle}`;
    const existing = byKey.get(key);
    const routeCount = parseTripCount(row.trips) || row.details.length || 1;
    const totalWeightKg = row.details.reduce((sum, detail) => sum + parseKg(detail.weight), 0);
    const standardFare = parseNumber(row.prices.standardFare);
    const transportFare = parseNumber(row.prices.g70TransportFare);
    const fuelFare = parseNumber(row.prices.i70FuelFare);
    const roundTripFare = parseNumber(row.prices.m70RoundTrip);
    const customerAllowance = parseNumber(row.prices.q70CustomerAllowance);
    const etcAllowance = parseNumber(row.prices.t70EtcAllowance);
    const holidayFare = parseNumber(row.prices.o70HolidayFare);
    const morningDrop = parseNumber(row.prices.s70MorningDrop);
    const routeLabel = row.routeOrder || [row.startRegion, row.endRegion].filter(Boolean).join(' → ');

    if (!existing) {
      byKey.set(key, {
        month,
        vehicle,
        driver: row.driver,
        routeCount,
        sourceRowCount: 1,
        regionSummary: routeLabel,
        totalWeightKg,
        dispatchTotal: standardFare + transportFare + roundTripFare,
        fuelTotal: fuelFare,
        allowanceTotal: customerAllowance + etcAllowance + holidayFare + morningDrop,
        status: resolveStatus([row]),
        lastDispatchDate: normalizeDateKey(row.groupingDate ?? ''),
        routeLabels: routeLabel ? [routeLabel] : [],
        sourceRows: [row],
      });
      continue;
    }

    existing.driver = existing.driver || row.driver;
    existing.routeCount += routeCount;
    existing.sourceRowCount += 1;
    existing.totalWeightKg += totalWeightKg;
    existing.dispatchTotal += standardFare + transportFare + roundTripFare;
    existing.fuelTotal += fuelFare;
    existing.allowanceTotal += customerAllowance + etcAllowance + holidayFare + morningDrop;
    existing.status = resolveStatus(existing.sourceRows.concat(row));
    const candidateDate = normalizeDateKey(row.groupingDate ?? '');
    if (candidateDate > existing.lastDispatchDate) {
      existing.lastDispatchDate = candidateDate;
    }
    existing.routeLabels.push(routeLabel);
    existing.sourceRows.push(row);
  }

  return Array.from(byKey.values())
    .map((row) => ({
      ...row,
      routeLabels: Array.from(new Set(row.routeLabels.filter(Boolean))),
      regionSummary: Array.from(new Set(row.routeLabels.filter(Boolean))).slice(0, 3).join(' / '),
      sourceRows: row.sourceRows.sort((a, b) => normalizeDateKey(b.groupingDate ?? '').localeCompare(normalizeDateKey(a.groupingDate ?? ''), 'ko-KR')),
    }))
    .sort((a, b) => b.month.localeCompare(a.month, 'ko-KR') || a.vehicle.localeCompare(b.vehicle, 'ko-KR'));
};

export async function fetchCherryTmsMonthlyVehiclePageData(): Promise<CherryTmsMonthlyVehiclePageData | null> {
  const groupingData = await fetchCherryTmsGroupingPageData();
  if (!groupingData) return null;

  const rows = aggregateRows(groupingData.rows);
  const availableMonths = Array.from(new Set(rows.map((row) => row.month))).sort(compareDesc);
  const availableVehicles = Array.from(new Set(rows.map((row) => row.vehicle))).sort((a, b) => a.localeCompare(b, 'ko-KR'));
  const sourceRowCount = groupingData.sourceRowCount;
  const manualReviewCount = groupingData.manualReviewCount;

  return {
    sourceRowCount,
    aggregateCount: rows.length,
    manualReviewCount,
    availableMonths,
    availableVehicles,
    rows,
  };
}

export { formatCurrency, normalizeDateKey, parseNumber, parseKg, parseTripCount };
