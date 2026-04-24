import type { Metadata } from 'next';

import { CherryTmsShell } from '../_shared';

export const metadata: Metadata = {
  title: 'Cherrybro TMS Intake',
  description: '전일 운행 조회 및 DB 적재 화면',
};

const intakeStats = [
  { label: 'ERP 조회 대상', value: '105건', hint: '2026-04-23 운행완료 기준' },
  { label: '우리 DB 적재완료', value: '96건', hint: '정산 대상 생성 가능' },
  { label: '중복 / 보류', value: '9건', hint: '원천 비교 후 재적재 필요' },
  { label: '미매핑 예외', value: '12건', hint: '지역·영업소·차량번호 확인 필요' },
];

const sourceRuns = [
  {
    source: 'ERP 운행완료 조회',
    executedAt: '2026-04-24 06:10',
    status: '조회완료',
    scope: '105행 / 42대',
    note: '차량번호, 기사명, 중량, 지역, 영업소 포함',
  },
  {
    source: '배송현황 엑셀 업로드',
    executedAt: '2026-04-24 06:20',
    status: '적재완료',
    scope: '31시트 / 1,248행',
    note: 'ERP 조회 누락 대비 원천 보조본',
  },
  {
    source: '배차일보 업로드',
    executedAt: '2026-04-24 06:25',
    status: '정규화중',
    scope: '864행',
    note: '경유수 / 배송유형 해석용 보조 소스',
  },
  {
    source: '우리 DB 적재 배치',
    executedAt: '2026-04-24 06:31',
    status: '부분완료',
    scope: '96건 반영 / 9건 보류',
    note: '중복 추정 및 미매핑 행은 staging 유지',
  },
];

const dbRows = [
  ['raw_trip_import', '105건', '96건', '9건', 'ERP/엑셀 원천 보관'],
  ['trip_staging', '105건', '96건', '9건', '중복/미매핑 검토 전'],
  ['settlement_candidates', '96건', '96건', '-', '묶음 생성 단계로 이동 가능'],
];

const actionButtons = [
  'ERP 조회 실행',
  '엑셀 업로드',
  '우리 DB 적재',
  '중복 재검사',
  '예외 내보내기',
];

export default function CherryTmsIntakePage() {
  return (
    <CherryTmsShell
      current="intake"
      eyebrow="Cherrybro TMS / Intake"
      title="전일 운행 데이터 조회 / 반입 / 적재"
      description="이 단계는 정산 등록 전에 전일 운행완료 내역을 가져와 우리 DB에 적재하는 운영 화면입니다. ERP 직접 조회와 엑셀 반입을 함께 다루고, 적재 결과·예외·다음 단계 전달 가능 여부를 먼저 확인합니다."
    >
      <section className="border border-[#243041] bg-[#0b1220]">
        <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
          <h2 className="text-lg font-semibold text-white">조회 / 반입 실행 바</h2>
        </div>
        <div className="grid gap-3 px-4 py-4 md:grid-cols-2 xl:grid-cols-6">
          {[
            ['기준일자', '2026-04-23'],
            ['운송사', '그린'],
            ['반입 기준', '전일 운행완료'],
            ['원천 소스', 'ERP + 배송현황 + 배차일보'],
            ['현재 상태', 'DB 적재 완료 / 예외 검토 필요'],
            ['다음 단계', '묶음 생성으로 전달'],
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
                  index === 0 ? 'border-[#4D7CFF] bg-[#1c2c52] text-white hover:bg-[#223664]' : 'border-[#314056] bg-[#0a1019] text-slate-200 hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-px border border-[#243041] bg-[#243041] md:grid-cols-2 xl:grid-cols-4">
        {intakeStats.map((item) => (
          <article key={item.label} className="bg-[#0b1220] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">{item.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_minmax(340px,0.8fr)]">
        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">원천 조회 / 반입 / 적재 이력</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-[#111a27] text-slate-400">
                <tr>
                  {['소스', '실행시각', '상태', '범위', '비고'].map((head) => (
                    <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sourceRuns.map((row) => (
                  <tr key={row.source} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                    <td className="px-4 py-3 whitespace-nowrap text-white">{row.source}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.executedAt}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#9ab6ff]">{row.status}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.scope}</td>
                    <td className="px-4 py-3 text-slate-300">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">우리 DB 적재 결과</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-[#111a27] text-slate-400">
                <tr>
                  {['적재 레이어', '수집건수', '반영건수', '보류건수', '설명'].map((head) => (
                    <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dbRows.map((row) => (
                  <tr key={row[0]} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                    <td className="px-4 py-3 whitespace-nowrap text-white">{row[0]}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row[1]}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#9ab6ff]">{row[2]}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-amber-300">{row[3]}</td>
                    <td className="px-4 py-3 text-slate-300">{row[4]}</td>
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
