import type { Metadata } from 'next';

import { CherryTmsShell } from '../_shared';

export const metadata: Metadata = {
  title: 'Cherrybro TMS Settlement Review',
  description: '일별/월별/기사별 정산 검토 화면',
};

const reviewStats = [
  { label: '검토 대상', value: '42건', hint: 'settlement-register 확정 후보 기준' },
  { label: '검토 완료', value: '18건', hint: '현재 기준 지급 확정 완료' },
  { label: '보정 재요청', value: '6건', hint: '등록 화면으로 되돌림 필요' },
  { label: '월마감 후보', value: '24건', hint: '차액 이상치 점검 후 마감 가능' },
];

const filterButtons = ['일별', '월별', '기사별', '차량별'];

const reviewRows = [
  {
    basis: '일별',
    target: '2026-04-23',
    count: '105건',
    current: '₩14.1M',
    contract: '₩13.2M',
    diff: '+₩0.9M',
    status: '검토완료',
  },
  {
    basis: '월별',
    target: '2026-04',
    count: '2,184건',
    current: '₩141.0M',
    contract: '₩132.5M',
    diff: '+₩8.5M',
    status: '월마감전',
  },
  {
    basis: '기사별',
    target: '남명규',
    count: '31건',
    current: '₩5.92M',
    contract: '₩5.21M',
    diff: '+₩0.71M',
    status: '차액확인',
  },
  {
    basis: '차량별',
    target: '경기96자1710',
    count: '28건',
    current: '₩6.34M',
    contract: '₩5.61M',
    diff: '+₩0.73M',
    status: '보정보류',
  },
];

const reviewChecks = [
  ['현재 기준 총액', '₩5.92M'],
  ['계약 기준 총액', '₩5.21M'],
  ['차액', '+₩0.71M'],
  ['검토 상태', '차액확인'],
  ['월마감 반영', '대기'],
  ['다음 액션', 'register로 되돌림 또는 승인'],
];

const detailRows = [
  ['01.05', '경기96자1574', '용인 → 동서울', '₩203,180', '₩177,000', '+₩26,180'],
  ['01.08', '경기96자1574', '용인 → 수원', '₩191,200', '₩169,000', '+₩22,200'],
  ['01.12', '경기96자1574', '용인 → 동서울', '₩205,700', '₩180,500', '+₩25,200'],
];

const reviewNotes = [
  '검토 화면은 입력이 아니라 결과 승인/반려를 위한 단계다.',
  '보정 필요 건은 settlement-register로 되돌려 다시 계산한다.',
  '기사별/차량별 차액 이상치가 해소돼야 월마감 후보로 넘긴다.',
  '월마감 반영 전에는 현재 기준 지급 총액과 계약 기준 총액을 함께 확인한다.',
];

const actionButtons = ['승인', 'register로 되돌리기', '차액 메모 추가', '월마감 후보 반영'];

export default function CherryTmsSettlementReviewPage() {
  return (
    <CherryTmsShell
      current="settlement-review"
      eyebrow="Cherrybro TMS / Settlement Review"
      title="일별 / 월별 / 기사별 정산 검토 및 승인"
      description="등록 완료된 정산 결과를 기준 축별로 검토하는 단계입니다. 이 화면은 입력이 아니라 현재 기준 지급값과 계약 기준 비교 결과를 검토하고 승인/반려하는 운영 화면입니다."
    >
      <section className="border border-[#243041] bg-[#0b1220]">
        <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
          <h2 className="text-lg font-semibold text-white">검토 실행 바</h2>
        </div>
        <div className="grid gap-3 px-4 py-4 md:grid-cols-2 xl:grid-cols-6">
          {[
            ['기준일자', '2026-04-23'],
            ['기준 축', '일별 / 월별 / 기사별 / 차량별'],
            ['현재 선택', '기사별 남명규'],
            ['검토 목적', '현재 기준 지급 승인'],
            ['현재 상태', '차액확인 / 월마감 반영 전'],
            ['다음 단계', 'claim-docs 또는 register 복귀'],
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
                  index === 0
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
        {reviewStats.map((item) => (
          <article key={item.label} className="bg-[#0b1220] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">{item.hint}</p>
          </article>
        ))}
      </section>

      <section className="border border-[#243041] bg-[#0b1220]">
        <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
          <h2 className="text-lg font-semibold text-white">조회 축 전환</h2>
        </div>
        <div className="flex flex-wrap gap-2 px-4 py-4 text-sm">
          {filterButtons.map((item, index) => (
            <button
              key={item}
              type="button"
              className={`border px-3 py-2 transition ${
                index === 2 ? 'border-[#4D7CFF] bg-[#1c2c52] text-white' : 'border-[#314056] bg-[#0a1019] text-slate-300 hover:bg-white/5'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_minmax(360px,0.8fr)]">
        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">검토 리스트</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-[#111a27] text-slate-400">
                <tr>
                  {['기준', '대상', '건수', '현재 기준', '계약 기준', '차액', '상태'].map((head) => (
                    <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reviewRows.map((row) => (
                  <tr key={row.basis + row.target} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.basis}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-white">{row.target}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.count}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.current}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.contract}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-[#9ab6ff]">{row.diff}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-amber-300">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">선택 기준 요약</h2>
          </div>
          <div className="grid gap-px bg-[#243041]">
            {reviewChecks.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between bg-[#0b1220] px-4 py-4 text-sm">
                <span className="text-slate-300">{label}</span>
                <strong className={label === '차액' || label === '검토 상태' ? 'text-[#9ab6ff]' : 'text-white'}>{value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">상세 행 비교</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-[#111a27] text-slate-400">
                <tr>
                  {['일자', '차량', '구간', '현재 기준', '계약 기준', '차액'].map((head) => (
                    <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detailRows.map((row) => (
                  <tr key={row[0] + row[1]} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                    {row.map((cell, index) => (
                      <td key={`${row[0]}-${index}`} className={`px-4 py-3 ${index === 1 ? 'text-white' : 'text-slate-300'}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">검토 메모 / 운영 규칙</h2>
          </div>
          <div className="grid gap-px bg-[#243041]">
            {reviewNotes.map((item) => (
              <div key={item} className="bg-[#0b1220] px-4 py-4 text-sm leading-6 text-slate-300">{item}</div>
            ))}
          </div>
        </article>
      </section>
    </CherryTmsShell>
  );
}
