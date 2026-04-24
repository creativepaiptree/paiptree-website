import type { Metadata } from 'next';

import { CherryTmsShell } from '../_shared';

export const metadata: Metadata = {
  title: 'Cherrybro TMS Settlement Register',
  description: '변수 선택 및 금액 확정 화면',
};

const registerStats = [
  { label: '등록 대상 묶음', value: '42건', hint: 'grouping 단계 확정 건 기준' },
  { label: '현재 기준 계산 완료', value: '24건', hint: '변수 선택 및 재계산 완료' },
  { label: '보정 필요', value: '6건', hint: '수기보정 또는 원천 재확인 필요' },
  { label: '기사 지급 확정', value: '18건', hint: '현재 기준 금액으로 확정' },
];

const registerRows = [
  {
    driver: '남명규',
    vehicle: '경기96자1574',
    startRegion: '용인',
    endRegion: '동서울',
    office: '동서울 아워홈',
    totalWeight: '1.82t',
    minWeight: '0.29t',
    maxWeight: '0.43t',
    status: '등록중',
  },
  {
    driver: '이정훈',
    vehicle: '경기96자1710',
    startRegion: '정읍',
    endRegion: '광주',
    office: '정읍영업소',
    totalWeight: '2.14t',
    minWeight: '0.48t',
    maxWeight: '0.77t',
    status: '검토대기',
  },
  {
    driver: '김무경',
    vehicle: '경기95자3335',
    startRegion: '부산',
    endRegion: '양산',
    office: '부산영업소',
    totalWeight: '2.37t',
    minWeight: '0.58t',
    maxWeight: '0.93t',
    status: '보정필요',
  },
  {
    driver: '김병규',
    vehicle: '경기95자5027',
    startRegion: '청주',
    endRegion: '용인',
    office: '청주영업소',
    totalWeight: '1.26t',
    minWeight: '0.42t',
    maxWeight: '0.51t',
    status: '확정완료',
  },
];

const variableGroups = [
  {
    title: '기본 운행 조건',
    rows: [
      ['시작 지역', '용인'],
      ['종료 지역', '동서울'],
      ['영업소', '동서울 아워홈'],
      ['최소무게', '0.29t'],
      ['최대무게', '0.43t'],
      ['총 중량', '1.82t'],
    ],
  },
  {
    title: '공통 변수',
    rows: [
      ['새벽배송', 'Y'],
      ['아침배송', 'N'],
      ['주말배송', 'N'],
      ['경유수', '1'],
      ['착지수당', '적용'],
      ['수기보정', '+10,000'],
    ],
  },
];

const calcRows = [
  ['계약 기준 운임', '117,000'],
  ['현재 기준 운임', '143,180'],
  ['경유수당', '50,000'],
  ['착지수당', '10,000'],
  ['계약 기준 총액', '177,000'],
  ['현재 기준 총액', '203,180'],
  ['차액', '+26,180'],
  ['기사 지급 기준', '현재 기준'],
];

const evidenceRows = [
  ['ERP 운행완료', '차량번호 경기96자1574 / 기사 남명규 / 총 5행'],
  ['배송현황 원천', '용인마트 2건, 수원영업소 2건, 동서울 아워홈 1건'],
  ['배차일보 보조', '경유수 1회 / 새벽배송 플래그 확인'],
  ['grouping 결과', '용인 → 수원 → 동서울 순서로 확정'],
];

const actionButtons = ['재계산', '임시저장', '현재 기준으로 확정', '보정 필요 표시'];

export default function CherryTmsSettlementRegisterPage() {
  return (
    <CherryTmsShell
      current="settlement-register"
      eyebrow="Cherrybro TMS / Settlement Register"
      title="정산 등록 / 현재 기준 금액 확정"
      description="이 단계는 묶인 운행건에 대해 최소/최대 무게, 배송유형, 경유/착지수당, 수기보정 등 변수를 선택하고 계약 기준과 현재 기준을 동시에 계산해 기사 지급 금액을 현재 기준으로 확정하는 메인 등록 화면입니다."
    >
      <section className="border border-[#243041] bg-[#0b1220]">
        <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
          <h2 className="text-lg font-semibold text-white">등록 실행 바</h2>
        </div>
        <div className="grid gap-3 px-4 py-4 md:grid-cols-2 xl:grid-cols-6">
          {[
            ['기준일자', '2026-04-23'],
            ['선택 기사', '남명규'],
            ['차량번호', '경기96자1574'],
            ['등록 기준', '현재 기준 지급 / 계약 기준 비교'],
            ['현재 상태', '변수 선택 완료 / 확정 전'],
            ['다음 단계', '정산 검토로 전달'],
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
        {registerStats.map((item) => (
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
                  {['기사', '차량', '시작 지역', '종료 지역', '영업소', '총 중량', '최소무게', '최대무게', '상태'].map((head) => (
                    <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {registerRows.map((row) => (
                  <tr key={row.driver + row.vehicle} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                    <td className="px-4 py-3 whitespace-nowrap text-white">{row.driver}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.vehicle}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.startRegion}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.endRegion}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.office}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.totalWeight}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.minWeight}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.maxWeight}</td>
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
            <h2 className="text-lg font-semibold text-white">변수 선택</h2>
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
                '계약 기준과 현재 기준은 항상 동시에 계산한다.',
                '기사 지급 금액은 현재 기준 총액으로 확정한다.',
                '차액은 이후 claim-docs 단계에서 청구 근거로 사용한다.',
                '시작/종료 지역 또는 영업소 근거가 불명확하면 확정하지 않고 보정 필요 상태로 남긴다.',
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
