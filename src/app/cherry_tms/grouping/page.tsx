import type { Metadata } from 'next';
import { Suspense } from 'react';

import { CherryTmsGroupingClient } from './GroupingClient';
import { fetchCherryTmsGroupingPageData } from '@/lib/cherryTmsGroupings';
import { fallbackGroupingRows } from '@/lib/cherryTmsSampleData';

export const metadata: Metadata = {
  title: 'Cherrybro TMS Grouping',
  description: '기사/차량 묶음 생성 화면',
};

export default async function CherryTmsGroupingPage() {
  const groupingData = await fetchCherryTmsGroupingPageData();
  return (
    <Suspense fallback={<div className="px-4 py-6 text-sm text-slate-400">로딩 중...</div>}>
      <CherryTmsGroupingClient data={groupingData} fallbackRows={fallbackGroupingRows} />
    </Suspense>
  );
}
