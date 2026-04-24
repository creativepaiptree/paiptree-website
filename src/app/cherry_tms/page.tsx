import type { Metadata } from 'next';
import Link from 'next/link';

import { CherryTmsShell, stageItems } from './_shared';

export const metadata: Metadata = {
  title: 'Cherrybro TMS Hub',
  description: '체리부로 운행정산 등록 중심 허브',
};

const hubStats = [
  ['tms 원천', 'transport/detail/car', '원천 구조 참고 전용, 직접 연결 금지'],
  ['grouping 후보', '기사·차량·일자', 'work_date + driver_no + car_no 기준'],
  ['settlement 기준표', '10개 테이블', '별도 정산 DB에 동일 스키마 구성 대상'],
  ['문서 생성', 'review 승인 후', 'dispatch/fuel/rate/allowance 근거 연결'],
];

export default function CherryTmsHubPage() {
  return (
    <CherryTmsShell
      eyebrow="Cherrybro TMS / Registration-first Hub"
      title="체리부로 운행정산 단계 허브"
      description="이 화면은 대시보드가 아니라 최초 맥락 순서를 지키는 등록 작업 허브입니다. 확인된 TMS 구조는 참고만 하고, 실제 연결은 별도 동일 스키마 DB를 새로 구성하는 전제로 단계별 화면에 반영합니다."
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
            <h2 className="mt-1 text-lg font-semibold text-white">DB 구조 반영 운영 순서</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-[#111a27] text-slate-400">
                <tr>
                  {['단계', '페이지', 'DB 구조 반영 역할', '바로가기'].map((head) => (
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
              '1. tms 원천 구조는 transport/detail/car 계층으로만 참고한다.',
              '2. grouping 후보는 원천 DB 직접 연결 없이 기사·차량·일자 묶음 구조로 표현한다.',
              '3. settlement-register 이후는 별도 tms_settlement 동일 스키마 DB에 저장하는 전제로 본다.',
              '4. review 승인 결과만 claim-docs 문서 생성 후보로 넘긴다.',
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
