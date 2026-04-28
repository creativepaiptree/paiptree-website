import type { Metadata } from 'next';
import { Suspense } from 'react';

import { CherryTmsSettlementRegisterClient } from './SettlementRegisterClient';
import { fetchCherryTmsSettlementRegisterPageData, type CherryTmsSettlementRegisterRow } from '@/lib/cherryTmsSettlementRegister';

export const metadata: Metadata = {
  title: 'Cherrybro TMS Settlement Register',
  description: '변수 선택 및 금액 확정 화면',
};

const fallbackRows: CherryTmsSettlementRegisterRow[] = [
  {
    dispatchDate: '2026-04-23',
    vehicle: '경기96자1574',
    tripNo: '1',
    region: '용인→동서울',
    client: '동서울 아워홈',
    driver: '남명규',
    totalWeight: '1,820kg',
    settlementKey: 'dispatch_dt + vehicle_no + trip_no + region_id',
    status: '등록중',
  },
];

export default async function CherryTmsSettlementRegisterPage() {
  const settlementData = await fetchCherryTmsSettlementRegisterPageData();
  return (
    <Suspense fallback={<div className="px-4 py-6 text-sm text-slate-400">로딩 중...</div>}>
      <CherryTmsSettlementRegisterClient data={settlementData} fallbackRows={fallbackRows} />
    </Suspense>
  );
}
