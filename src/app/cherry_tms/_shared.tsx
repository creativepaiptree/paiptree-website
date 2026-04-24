import Link from 'next/link';
import type { ReactNode } from 'react';

export type StageItem = {
  href: string;
  key: string;
  label: string;
  title: string;
  description: string;
};

export const stageItems: StageItem[] = [
  {
    key: 'intake',
    href: '/cherry_tms/intake',
    label: 'STEP 01',
    title: '데이터 반입',
    description: '전일 ERP 조회, 엑셀 반입, 우리 DB 적재 상태를 확인한다.',
  },
  {
    key: 'grouping',
    href: '/cherry_tms/grouping',
    label: 'STEP 02',
    title: '묶음 생성',
    description: '운행건을 기사/차량 기준으로 묶고 시작·종료 지역 순을 점검한다.',
  },
  {
    key: 'settlement-register',
    href: '/cherry_tms/settlement-register',
    label: 'STEP 03',
    title: '정산 등록',
    description: '변수 선택, 현재/계약 기준 동시 계산, 기사 지급 기준 금액을 확정한다.',
  },
  {
    key: 'settlement-review',
    href: '/cherry_tms/settlement-review',
    label: 'STEP 04',
    title: '정산 검토',
    description: '일별/월별/기사별 기준으로 등록 완료 건을 검토한다.',
  },
  {
    key: 'claim-docs',
    href: '/cherry_tms/claim-docs',
    label: 'STEP 05',
    title: '청구/문서',
    description: '현재 기준 지급과 계약 기준 차액을 정리해 청구 문서를 생성한다.',
  },
];

export function CherryTmsStageNav({ current }: { current?: string }) {
  return (
    <nav className="border-b border-[#243041] bg-[#0f1722] px-4 py-3 md:px-6">
      <div className="flex flex-wrap gap-2 text-xs md:text-sm">
        <Link
          href="/cherry_tms"
          className={`border px-3 py-2 transition ${
            !current ? 'border-[#4D7CFF] bg-[#1c2c52] text-white' : 'border-[#314056] bg-[#0a1019] text-slate-300 hover:bg-white/5'
          }`}
        >
          HUB
        </Link>
        {stageItems.map((stage) => {
          const active = current === stage.key;
          return (
            <Link
              key={stage.key}
              href={stage.href}
              className={`border px-3 py-2 transition ${
                active ? 'border-[#4D7CFF] bg-[#1c2c52] text-white' : 'border-[#314056] bg-[#0a1019] text-slate-300 hover:bg-white/5'
              }`}
            >
              {stage.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function CherryTmsShell({
  current,
  eyebrow,
  title,
  description,
  children,
}: {
  current?: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div data-theme="showcase" className="min-h-screen bg-[var(--surface-bg)] text-[var(--surface-text)]">
      <main className="mx-auto flex min-h-screen w-full max-w-[1720px] flex-col gap-6 px-4 py-6 md:px-6 xl:px-8">
        <section className="border border-[#243041] bg-[#0b1220]">
          <div className="px-4 py-4 md:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7aa2ff]">{eyebrow}</p>
            <h1 className="mt-2 text-xl font-semibold text-white md:text-2xl">{title}</h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">{description}</p>
          </div>
          <CherryTmsStageNav current={current} />
        </section>
        {children}
      </main>
    </div>
  );
}
