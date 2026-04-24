import type { Metadata } from 'next';

import { CherryTmsShell } from '../_shared';

export const metadata: Metadata = {
  title: 'Cherrybro TMS Claim Docs',
  description: '차액청구 및 문서 출력 화면',
};

const claimStats = [
  { label: '현재 기준 총액', value: '₩141.0M', hint: '기사 지급 확정 총액' },
  { label: '계약 기준 총액', value: '₩132.5M', hint: '체리부로 계약 정산 기준' },
  { label: '차액 청구 총액', value: '₩8.5M', hint: '현재 기준 - 계약 기준' },
  { label: '문서 생성 대기', value: '3종', hint: '지급용 / 청구용 / 첨부본' },
];

const claimRows = [
  {
    item: '운임 인상분',
    basis: '2026 운임표 - 2025 운임표',
    current: '₩124.3M',
    contract: '₩118.1M',
    diff: '+₩6.2M',
    status: '초안완료',
    note: '계약 단가 대비 현재 지급 단가 상승분',
  },
  {
    item: '착지수당 차이',
    basis: '배송현황 착지수당 집계',
    current: '₩9.8M',
    contract: '₩8.6M',
    diff: '+₩1.2M',
    status: '검토필요',
    note: '영업소 기준 착지수당 적용 차이',
  },
  {
    item: '경유수당 차이',
    basis: '배차일보 경유수 입력 기준',
    current: '₩5.4M',
    contract: '₩4.7M',
    diff: '+₩0.7M',
    status: '근거확인',
    note: '경유수 원천과 지급 기준 대조 필요',
  },
  {
    item: '수기보정 누적분',
    basis: 'register 보정값 월 합산',
    current: '₩1.5M',
    contract: '₩1.1M',
    diff: '+₩0.4M',
    status: '첨부필수',
    note: '차액 청구 시 상세 근거 첨부 필요',
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
  ['기사 지급 기준', '현재 기준 총액으로 확정'],
  ['청구 기준', '계약 기준 대비 차액만 산출'],
  ['월마감 반영', 'review 승인 완료 건만 포함'],
  ['첨부 필요 항목', '경유수당 차이 / 수기보정 누적분'],
];

const evidenceRows = [
  ['정산 review 결과', '월마감 후보 24건 반영'],
  ['register 보정 이력', '수기보정 6건 / 총 +₩0.4M'],
  ['grouping 정렬 근거', '영업소/구간 정렬 완료 행만 청구 포함'],
  ['intake 적재 기준', '우리 DB 적재 완료 96건 기준 집계'],
];

const actionButtons = ['기사 지급표 생성', '차액청구서 생성', '첨부본 생성', '차액 메모 출력'];

export default function CherryTmsClaimDocsPage() {
  return (
    <CherryTmsShell
      current="claim-docs"
      eyebrow="Cherrybro TMS / Claim & Documents"
      title="차액 청구 / 문서 생성"
      description="기사 지급은 현재 기준으로 확정하고, 그린이 체리부로에 요청할 금액은 계약 기준 대비 차액으로 정리하는 마지막 단계입니다. 이 화면은 결과 요약이 아니라 실제 문서 생성과 청구 근거 정리용 운영 화면입니다."
    >
      <section className="border border-[#243041] bg-[#0b1220]">
        <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
          <h2 className="text-lg font-semibold text-white">문서 생성 실행 바</h2>
        </div>
        <div className="grid gap-3 px-4 py-4 md:grid-cols-2 xl:grid-cols-6">
          {[
            ['정산월', '2026-04'],
            ['운송사', '그린'],
            ['지급 기준', '현재 기준 총액'],
            ['청구 기준', '계약 기준 대비 차액'],
            ['현재 상태', '청구 요약서 생성 전'],
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
                  {['항목', '산출 기준', '현재 기준', '계약 기준', '차액', '상태', '비고'].map((head) => (
                    <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {claimRows.map((row) => (
                  <tr key={row.item} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                    <td className="px-4 py-3 whitespace-nowrap text-white">{row.item}</td>
                    <td className="px-4 py-3 text-slate-300">{row.basis}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.current}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.contract}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-[#9ab6ff]">{row.diff}</td>
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
