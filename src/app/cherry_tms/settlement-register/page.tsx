import type { Metadata } from 'next';

import { CherryTmsShell } from '../_shared';
import { fetchCherryTmsSettlementRegisterPageData } from '@/lib/cherryTmsSettlementRegister';

export const metadata: Metadata = {
  title: 'Cherrybro TMS Settlement Register',
  description: '변수 선택 및 금액 확정 화면',
};

const registerStats = [
  { label: '정산 스키마', value: '10개', hint: 'tms_settlement tbl_tms_cherrybro_*' },
  { label: '기준표 데이터', value: '0건', hint: '현재 스키마 생성 / 데이터 적재 전' },
  { label: '등록 후보', value: '42묶음', hint: 'grouping에서 넘어온 운행 묶음' },
  { label: '계산 연결', value: '6테이블', hint: '운임·수당·지역·차량·배송지·정산결과' },
];

const registerRows = [
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
  {
    dispatchDate: '2026-04-23',
    vehicle: '경기96자1710',
    tripNo: '1',
    region: '정읍→광주',
    client: '정읍영업소',
    driver: '이정훈',
    totalWeight: '2,140kg',
    settlementKey: 'dispatch_dt + vehicle_no + trip_no + region_id',
    status: '검토대기',
  },
  {
    dispatchDate: '2026-04-23',
    vehicle: '경기95자3335',
    tripNo: '2',
    region: '부산→양산',
    client: '부산영업소',
    driver: '김무경',
    totalWeight: '2,370kg',
    settlementKey: 'dispatch_dt + vehicle_no + trip_no + region_id',
    status: '보정필요',
  },
  {
    dispatchDate: '2026-04-23',
    vehicle: '경기95자5027',
    tripNo: '1',
    region: '청주→용인',
    client: '청주영업소',
    driver: '김병규',
    totalWeight: '1,260kg',
    settlementKey: 'dispatch_dt + vehicle_no + trip_no + region_id',
    status: '확정완료',
  },
];

const variableGroups = [
  {
    title: '운송 원천 연결',
    rows: [
      ['tms 원천', 'transport_detail + transport_car'],
      ['정산 키', '일자 + 차량 + 회차 + 지역'],
      ['표시 중량', '1,820kg'],
      ['원천 중량 후보', 'output_weight_g / car_wgt_actual'],
      ['차량 기준', 'tbl_tms_cherrybro_vehicle'],
      ['차량 타입', 'tbl_tms_cherrybro_vehicle_type'],
    ],
  },
  {
    title: '정산 기준 테이블',
    rows: [
      ['표준운임비', 'tbl_tms_cherrybro_freight_rate'],
      ['경유비', 'fuel_stop_cnt / fuel_allowance'],
      ['거래처수당', 'dispatch_dest + region_client'],
      ['휴일운송비/일요상차', 'is_daily_extra / daily_extra_allowance'],
      ['아침하차', 'is_morning_off / morning_off_allowance'],
      ['기타/왕복', '추가 컬럼 또는 rule 확장 확인 필요'],
    ],
  },
];

const calcRows = [
  ['운임 기준', 'freight_rate: 거리+차량타입'],
  ['운행 정산 row', 'dispatch_settlement'],
  ['배송지 row', 'dispatch_dest'],
  ['경유/유류', 'fuel_price + fuel_settlement'],
  ['수당 기준', 'allowance_item'],
  ['현재 기준 총액', '계산 후 dispatch_settlement 저장'],
  ['계약 기준 대비 차액', 'review/claim-docs에서 집계'],
  ['기사 지급 기준', '현재 기준'],
];

const evidenceRows = [
  ['tbl_tms_transport_car', '차량/기사/시간/중량 실행행에서 등록 후보 생성'],
  ['tbl_tms_transport_detail', '지역·계근·도착지·출고량 원천 상세 연결'],
  ['tbl_tms_cherrybro_region_client', '착지/거래처 기준으로 거래처수당 후보 매칭'],
  ['tbl_tms_cherrybro_dispatch_settlement', '확정 후 정산 결과 row로 저장될 대상'],
];

const actionButtons = ['재계산', '임시저장', '현재 기준으로 확정', '보정 필요 표시'];

export default async function CherryTmsSettlementRegisterPage() {
  const settlementData = await fetchCherryTmsSettlementRegisterPageData();
  const hasSupabaseData = settlementData !== null;
  const rowsForRender = hasSupabaseData ? settlementData.rows : registerRows;
  const selectedRow = rowsForRender[0];
  const statsForRender = hasSupabaseData
    ? [
        { label: '원천 행', value: `${settlementData.sourceRowCount.toLocaleString('ko-KR')}건`, hint: 'Supabase raw Excel rows' },
        { label: '등록 후보', value: `${settlementData.candidateCount.toLocaleString('ko-KR')}묶음`, hint: 'grouping에서 넘어온 정산 등록 후보' },
        { label: '검토 필요', value: `${settlementData.manualReviewCount.toLocaleString('ko-KR')}건`, hint: '수동 확인이 필요한 원천/detail' },
        { label: '연결 상태', value: '실데이터', hint: 'tbl_tms_cherrybro_grouping_page_v1 기반' },
      ]
    : registerStats;
  const executionItems = [
    ['기준일자', settlementData?.groupingDate ?? '2026-04-23'],
    ['선택 기사', selectedRow?.driver || '-'],
    ['차량/소속', selectedRow?.vehicle || '-'],
    ['등록 기준', 'grouping row → settlement candidate'],
    ['현재 상태', hasSupabaseData ? `${rowsForRender.length.toLocaleString('ko-KR')}건 등록 후보` : '샘플 fallback'],
    ['다음 단계', '정산 검토로 전달'],
  ];

  return (
    <CherryTmsShell
      current="settlement-register"
      eyebrow="Cherrybro TMS / Settlement Register"
      title="정산 등록 / 현재 기준 금액 확정"
      description="이 단계는 grouping에서 넘어온 tms 원천 묶음을 tms_settlement의 체리부로 운임·수당·지역·차량 기준 테이블에 매칭하고, dispatch_settlement 저장 단위로 계산하는 메인 등록 화면입니다."
    >
      <section className="border border-[#243041] bg-[#0b1220]">
        <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
          <h2 className="text-lg font-semibold text-white">등록 실행 바</h2>
        </div>
        <div className="grid gap-3 px-4 py-4 md:grid-cols-2 xl:grid-cols-6">
          {executionItems.map(([label, value]) => (
            <div key={label} className="grid gap-2">
              <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</span>
              <div className="border border-[#314056] bg-[#0a1019] px-3 py-2 text-sm text-slate-200">{value}</div>
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
                  index === 2
                    ? 'border-[#4D7CFF] bg-[#1c2c52] text-white hover:bg-[#223664]'
                    : 'border-[#314056] bg-[#0a1019] text-slate-200 hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-px border border-[#243041] bg-[#243041] md:grid-cols-2 xl:grid-cols-4">
        {statsForRender.map((item) => (
          <article key={item.label} className="bg-[#0b1220] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">{item.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_minmax(360px,0.8fr)]">
        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">등록 대상 목록</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-[#111a27] text-slate-400">
                <tr>
                  {['배차일', '차량', '회차', '지역', '거래처', '기사', '총 중량', '정산 키', '상태'].map((head) => (
                    <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowsForRender.map((row) => (
                  <tr key={`${row.dispatchDate}-${row.driver}-${row.vehicle}-${row.tripNo}`} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                    <td className="px-4 py-3 whitespace-nowrap text-white">{row.dispatchDate}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.vehicle}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.tripNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.region}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.client}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.driver}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.totalWeight}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.settlementKey}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#9ab6ff]">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">계산 결과 요약</h2>
          </div>
          <div className="grid gap-px bg-[#243041]">
            {calcRows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between bg-[#0b1220] px-4 py-4 text-sm">
                <span className="text-slate-300">{label}</span>
                <strong className={label === '현재 기준 총액' || label === '차액' || label === '기사 지급 기준' ? 'text-[#9ab6ff]' : 'text-white'}>{value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">DB 기준 매칭</h2>
          </div>
          <div className="grid gap-6 px-4 py-4">
            {variableGroups.map((group) => (
              <section key={group.title} className="border border-[#243041] bg-[#0a1019]">
                <div className="border-b border-[#243041] px-4 py-3 text-sm font-medium text-white">{group.title}</div>
                <div className="grid gap-px bg-[#243041] md:grid-cols-2">
                  {group.rows.map(([label, value]) => (
                    <div key={label} className="bg-[#0b1220] px-4 py-4 text-sm">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</p>
                      <div className="mt-2 border border-[#314056] bg-[#0a1019] px-3 py-2 text-slate-200">{value}</div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>

        <div className="grid gap-6">
          <article className="border border-[#243041] bg-[#0b1220]">
            <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
              <h2 className="text-lg font-semibold text-white">원천 근거</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-[#111a27] text-slate-400">
                  <tr>
                    {['구분', '근거 내용'].map((head) => (
                      <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {evidenceRows.map((row) => (
                    <tr key={row[0]} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                      <td className="px-4 py-3 whitespace-nowrap text-white">{row[0]}</td>
                      <td className="px-4 py-3 text-slate-300">{row[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="border border-[#243041] bg-[#0b1220]">
            <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
              <h2 className="text-lg font-semibold text-white">등록 규칙</h2>
            </div>
            <div className="grid gap-px bg-[#243041]">
              {[
                'tms 원천은 직접 수정하지 않고, 정산 등록 결과는 tms_settlement에 저장한다.',
                'dispatch_dt, vehicle_no, trip_no, region_id 조합을 정산 row의 최소 키로 본다.',
                'freight_rate와 allowance_item은 계산 기준표이고, dispatch_settlement는 결과 테이블이다.',
                hasSupabaseData ? '현재 화면은 Supabase grouping view에서 읽은 실제 용차 엑셀 기반 등록 후보를 표시한다.' : 'Supabase 연결이 없으면 샘플 fallback으로 구조 매칭과 입력 흐름을 표현한다.',
              ].map((item) => (
                <div key={item} className="bg-[#0b1220] px-4 py-4 text-sm leading-6 text-slate-300">{item}</div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </CherryTmsShell>
  );
}
