import type { Metadata } from 'next';

import { CherryTmsShell } from '../_shared';
import { GroupingTable } from './_GroupingTable';
import { fetchCherryTmsGroupingPageData } from '@/lib/cherryTmsGroupings';


export const metadata: Metadata = {
  title: 'Cherrybro TMS Grouping',
  description: '기사/차량 묶음 생성 화면',
};

type GroupingPriceVariables = {
  standardFare: string;
  g70TransportFare: string;
  i70FuelFare: string;
  m70RoundTrip: string;
  q70CustomerAllowance: string;
  t70EtcAllowance: string;
  o70HolidayFare: string;
  s70MorningDrop: string;
};

type GroupingDetailRow = {
  order: string;
  transportId: string;
  transportSeq: string;
  carSeq: string;
  region: string;
  weight: string;
  destination: string;
  judgement: string;
};

type GroupingRow = {
  driver: string;
  vehicle: string;
  trips: string;
  startRegion: string;
  endRegion: string;
  businessOffice: string;
  totalWeight: string;
  routeOrder: string;
  autoStatus: string;
  prices: GroupingPriceVariables;
  details: GroupingDetailRow[];
};

const fallbackGroupingStats = [
  { label: '원천 헤더', value: '314건', hint: 'tbl_tms_transport 기준' },
  { label: '차량 실행행', value: '4,118건', hint: 'tbl_tms_transport_car 기준' },
  { label: '상세 경로행', value: '369건', hint: 'tbl_tms_transport_detail 기준' },
  { label: '정산 후보', value: '42묶음', hint: '기사·차량·일자 기준 가공 단위' },
];

const groupingRows: GroupingRow[] = [
  {
    driver: '남명규',
    vehicle: '경기96자1574',
    trips: '5건',
    startRegion: '용인',
    endRegion: '동서울',
    businessOffice: '동서울 아워홈',
    totalWeight: '1,820kg',
    routeOrder: '용인 → 수원 → 동서울',
    autoStatus: '자동완료',
    prices: {
      standardFare: '106,490',
      g70TransportFare: '96,000',
      i70FuelFare: '24,000',
      m70RoundTrip: '0',
      q70CustomerAllowance: '15,000',
      t70EtcAllowance: '0',
      o70HolidayFare: '0',
      s70MorningDrop: '10,000',
    },
    details: [
      { order: '1', transportId: 'TMS-20260423-001', transportSeq: '1', carSeq: '1', region: '용인', weight: '420kg', destination: '용인마트', judgement: '정상' },
      { order: '2', transportId: 'TMS-20260423-001', transportSeq: '2', carSeq: '1', region: '수원', weight: '370kg', destination: '수원영업소', judgement: '정상' },
      { order: '3', transportId: 'TMS-20260423-001', transportSeq: '3', carSeq: '1', region: '수원', weight: '290kg', destination: '수원영업소', judgement: '병합대상' },
      { order: '4', transportId: 'TMS-20260423-001', transportSeq: '4', carSeq: '1', region: '광주', weight: '310kg', destination: '광주경유', judgement: '경유후보' },
      { order: '5', transportId: 'TMS-20260423-001', transportSeq: '5', carSeq: '1', region: '동서울', weight: '430kg', destination: '동서울 아워홈', judgement: '종료지' },
    ],
  },
  {
    driver: '이정훈',
    vehicle: '경기96자1710',
    trips: '4건',
    startRegion: '정읍',
    endRegion: '광주',
    businessOffice: '정읍영업소',
    totalWeight: '2,140kg',
    routeOrder: '정읍 → 익산 → 광주',
    autoStatus: '검토필요',
    prices: {
      standardFare: '118,330',
      g70TransportFare: '112,000',
      i70FuelFare: '31,500',
      m70RoundTrip: '20,000',
      q70CustomerAllowance: '0',
      t70EtcAllowance: '0',
      o70HolidayFare: '0',
      s70MorningDrop: '0',
    },
    details: [
      { order: '1', transportId: 'TMS-20260423-014', transportSeq: '1', carSeq: '1', region: '정읍', weight: '610kg', destination: '정읍센터', judgement: '시작지' },
      { order: '2', transportId: 'TMS-20260423-014', transportSeq: '2', carSeq: '1', region: '익산', weight: '440kg', destination: '익산거점', judgement: '정상' },
      { order: '3', transportId: 'TMS-20260423-014', transportSeq: '3', carSeq: '1', region: '전주', weight: '520kg', destination: '전주경유', judgement: '순서확인' },
      { order: '4', transportId: 'TMS-20260423-014', transportSeq: '4', carSeq: '1', region: '광주', weight: '570kg', destination: '광주영업소', judgement: '종료지' },
    ],
  },
  {
    driver: '김무경',
    vehicle: '경기95자3335',
    trips: '3건',
    startRegion: '부산',
    endRegion: '양산',
    businessOffice: '부산영업소',
    totalWeight: '2,370kg',
    routeOrder: '부산 → 김해 → 양산',
    autoStatus: '순서확인',
    prices: {
      standardFare: '159,750',
      g70TransportFare: '151,000',
      i70FuelFare: '49,000',
      m70RoundTrip: '0',
      q70CustomerAllowance: '0',
      t70EtcAllowance: '12,000',
      o70HolidayFare: '50%',
      s70MorningDrop: '0',
    },
    details: [
      { order: '1', transportId: 'TMS-20260423-021', transportSeq: '1', carSeq: '1', region: '부산', weight: '830kg', destination: '부산영업소', judgement: '시작지' },
      { order: '2', transportId: 'TMS-20260423-021', transportSeq: '2', carSeq: '1', region: '김해', weight: '710kg', destination: '김해경유', judgement: '정렬검토' },
      { order: '3', transportId: 'TMS-20260423-021', transportSeq: '3', carSeq: '1', region: '양산', weight: '830kg', destination: '양산센터', judgement: '종료지' },
    ],
  },
  {
    driver: '김병규',
    vehicle: '경기95자5027',
    trips: '2건',
    startRegion: '청주',
    endRegion: '용인',
    businessOffice: '청주영업소',
    totalWeight: '1,260kg',
    routeOrder: '청주 → 오산 → 용인',
    autoStatus: '차량중복확인',
    prices: {
      standardFare: '99,390',
      g70TransportFare: '92,000',
      i70FuelFare: '18,500',
      m70RoundTrip: '0',
      q70CustomerAllowance: '10,000',
      t70EtcAllowance: '0',
      o70HolidayFare: '0',
      s70MorningDrop: '0',
    },
    details: [
      { order: '1', transportId: 'TMS-20260423-033', transportSeq: '1', carSeq: '1', region: '청주', weight: '580kg', destination: '청주영업소', judgement: '기사확인' },
      { order: '2', transportId: 'TMS-20260423-033', transportSeq: '2', carSeq: '1', region: '오산', weight: '210kg', destination: '오산경유', judgement: '중간지' },
      { order: '3', transportId: 'TMS-20260423-033', transportSeq: '3', carSeq: '1', region: '용인', weight: '470kg', destination: '용인센터', judgement: '종료지' },
    ],
  },
];

const actionButtons = ['자동 묶음 재실행', '정렬 재계산', '예외 내보내기', '묶음 확정'];

export default async function CherryTmsGroupingPage() {
  const groupingData = await fetchCherryTmsGroupingPageData();
  const hasSupabaseData = groupingData !== null;
  const groupingRowsForRender = hasSupabaseData ? groupingData.rows : groupingRows;
  const groupingStats = hasSupabaseData
    ? [
        { label: '원천 행', value: `${groupingData.sourceRowCount.toLocaleString('ko-KR')}건`, hint: 'Supabase raw Excel rows' },
        { label: '묶음 후보', value: `${groupingData.candidateCount.toLocaleString('ko-KR')}건`, hint: 'grouping run rows' },
        { label: '상세 행', value: `${groupingRowsForRender.reduce((sum, row) => sum + row.details.length, 0).toLocaleString('ko-KR')}건`, hint: 'detail row total' },
        { label: '수동 확인', value: `${groupingData.manualReviewCount.toLocaleString('ko-KR')}건`, hint: '검토 필요 rows' },
      ]
    : fallbackGroupingStats;

  return (
    <CherryTmsShell
      current="grouping"
      eyebrow="Cherrybro TMS / Grouping"
      title="기사/차량 기준 묶음 생성 및 순서 점검"
      description="이 단계는 tms의 transport_detail과 transport_car 원천행을 기사·차량·운행일 기준으로 묶고, 지역·중량·차량/기사 매칭을 확인해 tms_settlement 등록 후보로 넘기는 작업표입니다."
    >
      <section className="border border-[#243041] bg-[#0b1220]">
        <div className="cherry-light-header border-b border-[#243041] bg-[#0f1722] px-4 py-3">
          <h2 className="text-lg font-semibold text-white">묶음 생성 실행 바</h2>
        </div>
        <div className="grid gap-3 px-4 py-4 md:grid-cols-2 xl:grid-cols-6">
          {[
            ['기준일자', '2026-04-23'],
            ['원천 테이블', 'detail + car'],
            ['묶음 키', 'work_date + driver_no + car_no'],
            ['정렬 필드', 'origin/weight/destination'],
            ['현재 상태', '42대 생성 / 7건 수동 확인'],
            ['다음 단계', '정산 등록으로 전달'],
          ].map(([label, value]) => (
            <div key={label} className="grid gap-2">
              <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</span>
              <div className="cherry-light-field border border-[#314056] bg-[#0a1019] px-3 py-2 text-sm text-slate-200">{value}</div>
            </div>
          ))}
        </div>
        <div className="border-t border-[#243041] px-4 py-3">
          <div className="flex flex-wrap gap-2 text-xs md:text-sm">
            {actionButtons.map((label, index) => (
              <button
                key={label}
                type="button"
                className={`border px-3 py-2 transition ${
                  index === 0 ? 'cherry-light-active border-[#4D7CFF] bg-[#1c2c52] text-white hover:bg-[#223664]' : 'border-[#314056] bg-[#0a1019] text-slate-200 hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-px border border-[#243041] bg-[#243041] md:grid-cols-2 xl:grid-cols-4">
        {groupingStats.map((item) => (
          <article key={item.label} className="bg-[#0b1220] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">{item.hint}</p>
          </article>
        ))}
      </section>

      {hasSupabaseData && groupingRowsForRender.length === 0 ? (
        <section className="border border-[#243041] bg-[#0b1220] px-4 py-4 text-sm text-slate-300">
          <div className="font-medium text-white">Supabase 연결 완료</div>
          <div className="mt-2 text-slate-400">지금 view에는 아직 묶음 행이 없어서 빈 상태로 표시됩니다. 엑셀 적재 후 이 영역에 실제 grouping row가 채워집니다.</div>
        </section>
      ) : null}

      <section className="border border-[#243041] bg-[#0b1220]">
        <div className="cherry-light-header border-b border-[#243041] bg-[#0f1722] px-4 py-3">
          <h2 className="text-lg font-semibold text-white">묶음 생성 메인 테이블</h2>
        </div>
        <GroupingTable rows={groupingRowsForRender} />
      </section>
    </CherryTmsShell>
  );
}
