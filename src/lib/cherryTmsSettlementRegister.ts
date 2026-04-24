import { fetchCherryTmsGroupingPageData } from '@/lib/cherryTmsGroupings';

export type CherryTmsSettlementRegisterRow = {
  dispatchDate: string;
  vehicle: string;
  tripNo: string;
  region: string;
  client: string;
  driver: string;
  totalWeight: string;
  settlementKey: string;
  status: string;
};

export type CherryTmsSettlementRegisterPageData = {
  groupingDate: string | null;
  sourceRowCount: number;
  candidateCount: number;
  manualReviewCount: number;
  rows: CherryTmsSettlementRegisterRow[];
};

const asText = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return '';
};

export async function fetchCherryTmsSettlementRegisterPageData(): Promise<CherryTmsSettlementRegisterPageData | null> {
  const groupingData = await fetchCherryTmsGroupingPageData();
  if (!groupingData) {
    return null;
  }

  const groupingDate = groupingData.groupingDate ?? null;
  const rows = groupingData.rows.map((row, index) => {
    const tripNo = asText(row.trips).replace(/건$/, '') || String(index + 1);
    const status = row.autoStatus || '검토필요';
    return {
      dispatchDate: groupingDate ?? '',
      vehicle: row.vehicle,
      tripNo,
      region: `${row.startRegion}→${row.endRegion}`,
      client: row.businessOffice || '-',
      driver: row.driver,
      totalWeight: row.totalWeight,
      settlementKey: [groupingDate ?? '', row.driver, row.vehicle, tripNo].filter(Boolean).join(' / '),
      status,
    };
  });

  return {
    groupingDate,
    sourceRowCount: groupingData.sourceRowCount,
    candidateCount: rows.length,
    manualReviewCount: groupingData.manualReviewCount,
    rows,
  };
}
