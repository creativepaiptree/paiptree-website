import type { Metadata } from 'next';

import { CherryTmsShell } from '../_shared';

export const metadata: Metadata = {
  title: 'Cherrybro TMS Grouping',
  description: '기사/차량 묶음 생성 화면',
};

const groupingStats = [
  { label: '총 운행건수', value: '105건', hint: '전일 운행완료 raw 기준' },
  { label: '차량 수', value: '42대', hint: '차량번호 식별 가능 건 기준' },
  { label: '기사 수', value: '24명', hint: '기사명 또는 차량 연결 기준' },
  { label: '수동 확인 필요', value: '7건', hint: '자동 묶음/정렬 예외 큐 포함' },
];

const groupingRows = [
  {
    driver: '남명규',
    vehicle: '경기96자1574',
    trips: '5건',
    startRegion: '용인',
    endRegion: '동서울',
    businessOffice: '동서울 아워홈',
    totalWeight: '1.82t',
    routeOrder: '용인 → 수원 → 동서울',
    autoStatus: '자동완료',
  },
  {
    driver: '이정훈',
    vehicle: '경기96자1710',
    trips: '4건',
    startRegion: '정읍',
    endRegion: '광주',
    businessOffice: '정읍영업소',
    totalWeight: '2.14t',
    routeOrder: '정읍 → 익산 → 광주',
    autoStatus: '검토필요',
  },
  {
    driver: '김무경',
    vehicle: '경기95자3335',
    trips: '3건',
    startRegion: '부산',
    endRegion: '양산',
    businessOffice: '부산영업소',
    totalWeight: '2.37t',
    routeOrder: '부산 → 김해 → 양산',
    autoStatus: '순서확인',
  },
  {
    driver: '김병규',
    vehicle: '경기95자5027',
    trips: '2건',
    startRegion: '청주',
    endRegion: '용인',
    businessOffice: '청주영업소',
    totalWeight: '1.26t',
    routeOrder: '청주 → 오산 → 용인',
    autoStatus: '차량중복확인',
  },
];

const groupingExceptions = [
  ['동일 차량 다중 기사', '2건', '차량번호 기준 우선 묶음 후 기사명 비교'],
  ['시작/종료 지역 추정 실패', '3건', 'raw 지역 순서를 수동으로 재정렬'],
  ['영업소 매핑 미확정', '2건', '거래처/영업소 master 보완 필요'],
  ['운행건 분할 필요', '1건', '동일 기사라도 별도 영업소는 분리 후보'],
];

const selectedBundleSummary = [
  ['선택 기사', '남명규'],
  ['차량번호', '경기96자1574'],
  ['원천 행 수', '5건'],
  ['총 중량', '1.82t'],
  ['자동 정렬 결과', '용인 → 수원 → 동서울'],
  ['묶음 상태', '정산 등록 가능'],
];

const selectedBundleRows = [
  ['1', '용인', '0.42t', '용인마트', '정상'],
  ['2', '수원', '0.37t', '수원영업소', '정상'],
  ['3', '수원', '0.29t', '수원영업소', '병합대상'],
  ['4', '광주', '0.31t', '광주경유', '경유후보'],
  ['5', '동서울', '0.43t', '동서울 아워홈', '종료지'],
];

const nextChecks = [
  '기사/차량 기준으로 묶인 건만 settlement-register로 넘긴다.',
  '시작/종료 지역 순서가 불명확한 건은 grouping 단계에서 반드시 확정한다.',
  '영업소 연결이 안 된 건은 정산 등록으로 넘기지 않는다.',
  '동일 차량 다중 기사 케이스는 예외로 남기지 말고 기준을 명시한다.',
];

const actionButtons = ['자동 묶음 재실행', '정렬 재계산', '예외 내보내기', '묶음 확정'];

export default function CherryTmsGroupingPage() {
  return (
    <CherryTmsShell
      current="grouping"
      eyebrow="Cherrybro TMS / Grouping"
      title="기사/차량 기준 묶음 생성 및 순서 점검"
      description="이 단계는 원천 운행건을 기사 또는 차량 기준으로 묶고, 시작·종료 지역 순서와 영업소 연결을 확인해 정산 등록 가능한 단위로 만드는 운영 화면입니다."
    >
      <section className="border border-[#243041] bg-[#0b1220]">
        <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
          <h2 className="text-lg font-semibold text-white">묶음 생성 실행 바</h2>
        </div>
        <div className="grid gap-3 px-4 py-4 md:grid-cols-2 xl:grid-cols-6">
          {[
            ['기준일자', '2026-04-23'],
            ['원천건수', '105건'],
            ['묶음 기준', '기사 / 차량번호'],
            ['자동 정렬 기준', '지역 시작 → 종료'],
            ['현재 상태', '42대 생성 / 7건 수동 확인'],
            ['다음 단계', '정산 등록으로 전달'],
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
        {groupingStats.map((item) => (
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
            <h2 className="text-lg font-semibold text-white">묶음 생성 메인 테이블</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-[#111a27] text-slate-400">
                <tr>
                  {['기사', '차량', '운행건수', '시작 지역', '종료 지역', '영업소', '총 중량', '자동 정렬 결과', '상태'].map((head) => (
                    <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupingRows.map((row) => (
                  <tr key={row.driver + row.vehicle} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                    <td className="px-4 py-3 whitespace-nowrap text-white">{row.driver}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.vehicle}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.trips}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.startRegion}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.endRegion}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.businessOffice}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.totalWeight}</td>
                    <td className="px-4 py-3 text-slate-200">{row.routeOrder}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#9ab6ff]">{row.autoStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <div className="grid gap-6">
          <article className="border border-[#243041] bg-[#0b1220]">
            <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
              <h2 className="text-lg font-semibold text-white">예외 큐</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-[#111a27] text-slate-400">
                  <tr>
                    {['항목', '건수', '조치'].map((head) => (
                      <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groupingExceptions.map((row) => (
                    <tr key={row[0]} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                      <td className="px-4 py-3 whitespace-nowrap text-white">{row[0]}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-amber-300">{row[1]}</td>
                      <td className="px-4 py-3 text-slate-300">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="border border-[#243041] bg-[#0b1220]">
            <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
              <h2 className="text-lg font-semibold text-white">다음 단계 전달 조건</h2>
            </div>
            <div className="grid gap-px bg-[#243041]">
              {nextChecks.map((item) => (
                <div key={item} className="bg-[#0b1220] px-4 py-4 text-sm leading-6 text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">선택 묶음 요약</h2>
          </div>
          <div className="grid gap-px bg-[#243041]">
            {selectedBundleSummary.map(([label, value]) => (
              <div key={label} className="bg-[#0b1220] px-4 py-4 text-sm">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</p>
                <p className="mt-2 text-slate-200">{value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">원천 행 순서 / 병합 후보</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-[#111a27] text-slate-400">
                <tr>
                  {['순번', '지역', '중량', '영업소/도착지', '판정'].map((head) => (
                    <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedBundleRows.map((row) => (
                  <tr key={row[0] + row[1]} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row[0]}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-white">{row[1]}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row[2]}</td>
                    <td className="px-4 py-3 text-slate-300">{row[3]}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#9ab6ff]">{row[4]}</td>
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
