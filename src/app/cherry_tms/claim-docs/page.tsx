import type { Metadata } from 'next';

import { CherryTmsShell } from '../_shared';

export const metadata: Metadata = {
  title: 'Cherrybro TMS Claim Docs',
  description: '차액청구 및 문서 출력 화면',
};

const claimStats = [
  { label: '결과 원천', value: 'dispatch_settlement', hint: 'review 승인 row만 문서 후보' },
  { label: '유류 정산', value: 'fuel_settlement', hint: '월별 차량 유류비 집계' },
  { label: '기준표', value: 'freight_rate / allowance_item', hint: '계약 기준·수당 기준 근거' },
  { label: '문서 생성', value: '3종', hint: '기사 지급표 / 차액청구서 / 첨부본' },
];

const claimRows = [
  {
    item: '운임 기준 차액',
    source: 'dispatch_settlement + freight_rate',
    key: 'dispatch_dt / vehicle_type_id / distance',
    current: '현재 기준 지급 합산',
    contract: '계약 운임표 재계산',
    status: '청구 후보',
    note: 'freight_rate 기준표와 결과 row의 운임 차이',
  },
  {
    item: '경유·유류 정산',
    source: 'fuel_settlement + fuel_price',
    key: 'settle_ym + vehicle_no',
    current: 'fuel_amt',
    contract: '월 유류 기준',
    status: '근거확인',
    note: '월별 차량 유류비를 차액 청구 근거로 연결',
  },
  {
    item: '거래처/착지 수당',
    source: 'dispatch_dest + region_client',
    key: 'client_id + region_id',
    current: 'stop_allowance / box_allowance',
    contract: 'allowance_item',
    status: '검토필요',
    note: '착지·박스·회수 수당의 거래처별 근거',
  },
  {
    item: '휴일/아침/기타 수당',
    source: 'dispatch_settlement + allowance_item',
    key: 'base_yr + allowance flags',
    current: 'daily_extra / morning_off',
    contract: '수당 기준표',
    status: '확장확인',
    note: '왕복·기타수당은 별도 컬럼/규칙 확장 확인 필요',
  },
];

const docRows = [
  {
    document: '기사별 월정산표',
    basis: '월마감 승인 행 기준',
    target: '기사 지급용',
    status: '생성가능',
    action: '엑셀 내보내기',
  },
  {
    document: 'Green 차액청구 요약서',
    basis: '현재 기준 - 계약 기준 차액 합계',
    target: '체리부로 요청용',
    status: '검토후 생성',
    action: '요약서 생성',
  },
  {
    document: '상세 근거 첨부본',
    basis: '원천행/보정 내역/영업소 근거 포함',
    target: '증빙 제출용',
    status: '근거정리 필요',
    action: '첨부본 생성',
  },
];

const approvalRows = [
  ['문서 원천', 'review 승인 완료 dispatch_settlement row'],
  ['청구 기준', 'freight_rate / allowance_item 대비 차액'],
  ['유류 기준', 'fuel_settlement는 월별 차량 단위로 별도 첨부'],
  ['연결 원칙', '공유 TMS DB 직접 연결 금지 / 별도 정산 DB 사용'],
];

const evidenceRows = [
  ['tbl_tms_cherrybro_dispatch_settlement', '일별/차량/회차/지역별 승인 결과 row'],
  ['tbl_tms_cherrybro_fuel_settlement', 'settle_ym + vehicle_no 기준 유류 정산 근거'],
  ['tbl_tms_cherrybro_freight_rate', '거리·차량타입별 표준/계약 운임 기준'],
  ['tbl_tms_cherrybro_allowance_item', '경유·박스·회수·휴일·아침하차 수당 기준'],
];

const actionButtons = ['기사 지급표 생성', '차액청구서 생성', '첨부본 생성', '차액 메모 출력'];

export default function CherryTmsClaimDocsPage() {
  return (
    <CherryTmsShell
      current="claim-docs"
      eyebrow="Cherrybro TMS / Claim & Documents"
      title="차액 청구 / 문서 생성"
      description="review에서 승인된 dispatch_settlement 결과를 기준으로 fuel_settlement, freight_rate, allowance_item 근거를 붙여 지급표·차액청구서·첨부본을 생성하는 마지막 단계입니다. 실제 공유 TMS DB가 아니라 별도 정산 DB 구조를 전제로 합니다."
    >
      <section className="border border-[#243041] bg-[#0b1220]">
        <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
          <h2 className="text-lg font-semibold text-white">문서 생성 실행 바</h2>
        </div>
        <div className="grid gap-3 px-4 py-4 md:grid-cols-2 xl:grid-cols-6">
          {[
            ['정산월', '2026-04'],
            ['운송사', '그린'],
            ['지급 기준', '승인된 dispatch_settlement'],
            ['청구 기준', 'freight/rate/allowance 비교'],
            ['현재 상태', '문서 후보 구조 매칭'],
            ['마지막 단계', '문서 생성 / 출력'],
          ].map(([label, value]) => (
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
                  index === 1
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
        {claimStats.map((item) => (
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
            <h2 className="text-lg font-semibold text-white">차액청구 집계표</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-[#111a27] text-slate-400">
                <tr>
                  {['항목', '원천 테이블', '집계 키', '현재 기준', '계약/기준표', '상태', '비고'].map((head) => (
                    <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {claimRows.map((row) => (
                  <tr key={row.item} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                    <td className="px-4 py-3 whitespace-nowrap text-white">{row.item}</td>
                    <td className="px-4 py-3 text-slate-300">{row.source}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#9ab6ff]">{row.key}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.current}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.contract}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-amber-300">{row.status}</td>
                    <td className="px-4 py-3 text-slate-300">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">승인 / 산출 기준 요약</h2>
          </div>
          <div className="grid gap-px bg-[#243041]">
            {approvalRows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between bg-[#0b1220] px-4 py-4 text-sm">
                <span className="text-slate-300">{label}</span>
                <strong className="text-white">{value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">문서 생성 작업행</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-[#111a27] text-slate-400">
                <tr>
                  {['문서명', '기준', '대상', '상태', '실행'].map((head) => (
                    <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docRows.map((row) => (
                  <tr key={row.document} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                    <td className="px-4 py-3 whitespace-nowrap text-white">{row.document}</td>
                    <td className="px-4 py-3 text-slate-300">{row.basis}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.target}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-amber-300">{row.status}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#9ab6ff]">{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">청구 근거 연결</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-[#111a27] text-slate-400">
                <tr>
                  {['출처', '근거 내용'].map((head) => (
                    <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">{head}</th>
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
      </section>
    </CherryTmsShell>
  );
}
