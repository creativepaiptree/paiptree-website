import type { Metadata } from 'next';
import { Suspense } from 'react';

import { CherryTmsMonthlyVehicleClient } from './MonthlyVehicleClient';
import { fetchCherryTmsMonthlyVehiclePageData } from '@/lib/cherryTmsMonthlyVehicle';
import { fallbackMonthlyVehicleRows } from '@/lib/cherryTmsSampleData';

export const metadata: Metadata = {
  title: 'Cherrybro TMS Monthly Vehicle View',
  description: '월별 차량별 내역 화면',
};

export default async function CherryTmsMonthlyVehiclePage() {
  const monthlyVehicleData = await fetchCherryTmsMonthlyVehiclePageData();
  return (
    <Suspense fallback={<div className="px-4 py-6 text-sm text-slate-400">로딩 중...</div>}>
      <CherryTmsMonthlyVehicleClient data={monthlyVehicleData} fallbackRows={fallbackMonthlyVehicleRows} />
    </Suspense>
  );
}
