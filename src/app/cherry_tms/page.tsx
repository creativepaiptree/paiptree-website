import type { Metadata } from 'next';
import Link from 'next/link';

import { CherryTmsShell, stageItems } from './_shared';

export const metadata: Metadata = {
  title: 'Cherrybro TMS Hub',
  description: '체리부로 운행정산 등록 중심 허브',
};

const hubStats = [
  ['전일 조회 대상', '105건', 'ERP 운행완료 기준'],
  ['DB 적재 완료', '96건', '중복/예외 제외 반영'],
  ['묶음 생성 결과', '42대', '기사/차량 단위 생성'],
  ['등록 미완료', '18건', '변수 선택 및 금액 확정 필요'],
];

export default function CherryTmsHubPage() {
  return (
    <CherryTmsShell
      eyebrow="Cherrybro TMS / Registration-first Hub"
      title="체리부로 운행정산 단계 허브"
      description="이 화면은 대시보드가 아니라 등록 작업의 진입 허브입니다. 실제 운영 순서대로 데이터 반입 → 묶음 생성 → 정산 등록 → 정산 검토 → 청구/문서 단계로 이동합니다."
    >
      <section className="grid gap-px border border-[#243041] bg-[#243041] md:grid-cols-2 xl:grid-cols-4">
        {hubStats.map(([label, value, hint]) => (
          <article key={label} className="bg-[#0b1220] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">{hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_minmax(320px,0.8fr)]">
        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">작업 단계</p>
            <h2 className="mt-1 text-lg font-semibold text-white">등록 중심 운영 순서</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-[#111a27] text-slate-400">
                <tr>
                  {['단계', '페이지', '역할', '바로가기'].map((head) => (
                    <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stageItems.map((stage) => (
                  <tr key={stage.key} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                    <td className="px-4 py-3 whitespace-nowrap text-[#9ab6ff]">{stage.label}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-white">{stage.title}</td>
                    <td className="px-4 py-3 text-slate-300">{stage.description}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link href={stage.href} className="border border-[#314056] bg-[#0a1019] px-3 py-2 text-xs text-slate-200 transition hover:bg-white/5">
                        이동
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">오늘 우선 처리</p>
            <h2 className="mt-1 text-lg font-semibold text-white">운영자 체크포인트</h2>
          </div>
          <div className="grid gap-px bg-[#243041]">
            {[
              '1. 어제자 ERP 운행완료 내역을 조회해 우리 DB로 적재한다.',
              '2. 기사/차량 기준 묶음 생성 결과와 예외 건을 확인한다.',
              '3. 변수 선택 후 현재 기준 지급 금액을 확정한다.',
              '4. 계약 기준 대비 차액을 마지막에 문서로 출력한다.',
            ].map((item) => (
              <div key={item} className="bg-[#0b1220] px-4 py-4 text-sm leading-6 text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>
    </CherryTmsShell>
  );
}
