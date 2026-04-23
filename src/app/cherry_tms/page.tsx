import type { Metadata } from 'next';
import Link from 'next/link';

type StatCard = {
  label: string;
  value: string;
  tone?: 'default' | 'accent' | 'warn';
  hint: string;
};

type QueueItem = {
  title: string;
  count: string;
  detail: string;
};

type SettlementRow = {
  date: string;
  vehicle: string;
  driver: string;
  trip: string;
  region: string;
  boxes: string;
  status: string;
  current: string;
  previous: string;
  diff: string;
};

type SourceFile = {
  name: string;
  source: string;
  status: string;
  rows: string;
};

type MappingIssue = {
  field: string;
  raw: string;
  suggested: string;
  state: string;
};

type SettlementDetail = {
  vehicle: string;
  driver: string;
  trip: string;
  region: string;
  sourceBasis: string[];
  inputValues: Array<{ label: string; value: string }>;
  calcValues: Array<{ label: string; value: string; tone?: 'default' | 'accent' }>;
};

type MonthlyCloseItem = {
  driver: string;
  vehicle: string;
  trips: string;
  current: string;
  previous: string;
  diff: string;
  status: string;
};

export const metadata: Metadata = {
  title: 'Cherrybro TMS Settlement V1',
  description: '체리부로 운행정산센터 시안 / 정산 업무 흐름 중심 workbench',
};

const topStats: StatCard[] = [
  { label: '이번달 업로드', value: '8개', hint: '배송현황·배차일보·용차내역 기준', tone: 'default' },
  { label: '미매핑 건수', value: '19건', hint: '거래처/지역 매핑 필요', tone: 'warn' },
  { label: '미검토 일정산', value: '42건', hint: '운임·수당 검토 대기', tone: 'warn' },
  { label: '예상 차액 청구', value: '₩8.5M', hint: 'Green 청구 초안 기준', tone: 'accent' },
];

const workQueues: QueueItem[] = [
  { title: '원천 업로드', count: '완료 5 / 보조 3', detail: 'ERP 완료파일과 보조 엑셀 수집 상태' },
  { title: '정규화 대기', count: '12건', detail: '차량·거래처·지역 raw 값 확인 필요' },
  { title: '일 정산 검토', count: '42건', detail: '경유수·일요·야간·수기보정 검토' },
  { title: '월 마감 준비', count: '6/24 기사', detail: '승인된 일 정산 기준 월합계 생성 가능' },
];

const sourceFiles: SourceFile[] = [
  { name: '1월 배송현황(그린)', source: 'ERP 완료', status: '파싱완료', rows: '31시트 / 1,248행' },
  { name: '1월 배차일보 2026', source: '배차일보', status: '정규화중', rows: '31시트 / 864행' },
  { name: '1월 체리부로 용차내역', source: '용차예외', status: '보정보류', rows: '4시트 / 96행' },
  { name: '2026년 01월 운행일지', source: '기준정보', status: '기준확정', rows: '운임표 / 차량현황 / 청구분' },
];

const mappingIssues: MappingIssue[] = [
  { field: '거래처', raw: '아워홈동서울영업소', suggested: '동서울 아워홈', state: '확인필요' },
  { field: '지역', raw: '용인마트', suggested: '용인', state: '매핑대기' },
  { field: '차량번호', raw: '4750', suggested: '경기95자4750', state: '보정대기' },
  { field: '수당해석', raw: '거래처수당', suggested: '착지수당 후보', state: '규칙확인' },
];

const selectedSettlement: SettlementDetail = {
  vehicle: '경기96자1574',
  driver: '남명규',
  trip: '2차',
  region: '용인',
  sourceBasis: [
    '배송현황 05.05 시트 / 차량번호 경기96자1574 / 기사명 남명규',
    '배차일보 05.05 시트 / 2차 지역 용인 / 출고BOX 265',
    '운행일지 기준 / 4.5톤 / 170km band / 2026 운임 적용',
  ],
  inputValues: [
    { label: '경유수(입력)', value: '1' },
    { label: '일요추가', value: 'N' },
    { label: '야하행차', value: 'N' },
    { label: '수기보정', value: '+10,000' },
  ],
  calcValues: [
    { label: '운임(당해)', value: '143,180' },
    { label: '운임(전년)', value: '117,000' },
    { label: '경유수당', value: '50,000' },
    { label: '착지수당', value: '10,000' },
    { label: '당해 총액', value: '203,180', tone: 'accent' },
    { label: '전년 총액', value: '177,000' },
    { label: '차액', value: '+26,180', tone: 'accent' },
  ],
};

const settlementRows: SettlementRow[] = [
  {
    date: '01.05',
    vehicle: '경기96자1574',
    driver: '남명규',
    trip: '2차',
    region: '용인',
    boxes: '265',
    status: '검토중',
    current: '203,180',
    previous: '177,000',
    diff: '+26,180',
  },
  {
    date: '01.05',
    vehicle: '경기96자1710',
    driver: '이정훈',
    trip: '1차',
    region: '정읍',
    boxes: '296',
    status: '승인대기',
    current: '236,490',
    previous: '205,880',
    diff: '+30,610',
  },
  {
    date: '01.06',
    vehicle: '경기95자3335',
    driver: '김무경',
    trip: '1차',
    region: '부산고정',
    boxes: '312',
    status: '차액확인',
    current: '281,020',
    previous: '247,840',
    diff: '+33,180',
  },
  {
    date: '01.06',
    vehicle: '경기95자5027',
    driver: '김병규',
    trip: '3차',
    region: '청주',
    boxes: '188',
    status: '원천누락',
    current: '0',
    previous: '0',
    diff: '보정필요',
  },
];

const claimBreakdown = [
  ['운임 인상분', '₩6.2M'],
  ['착지수당 차이', '₩1.2M'],
  ['일요/휴일 차이', '₩1.1M'],
  ['예외 보정', '₩0.3M'],
];

const monthlyCloseItems: MonthlyCloseItem[] = [
  {
    driver: '남명규',
    vehicle: '경기96자1574',
    trips: '31건',
    current: '₩5.92M',
    previous: '₩5.21M',
    diff: '+₩0.71M',
    status: '마감초안',
  },
  {
    driver: '이정훈',
    vehicle: '경기96자1710',
    trips: '28건',
    current: '₩6.34M',
    previous: '₩5.61M',
    diff: '+₩0.73M',
    status: '검토완료',
  },
  {
    driver: '김무경',
    vehicle: '경기95자3335',
    trips: '26건',
    current: '₩6.88M',
    previous: '₩6.02M',
    diff: '+₩0.86M',
    status: '차액확인',
  },
];

const statusTone = (status: string) => {
  if (status === '검토중') return 'bg-amber-500/12 text-amber-300 border-amber-500/30';
  if (status === '승인대기') return 'bg-sky-500/12 text-sky-300 border-sky-500/30';
  if (status === '검토완료') return 'bg-emerald-500/12 text-emerald-300 border-emerald-500/30';
  if (status === '차액확인') return 'bg-violet-500/12 text-violet-300 border-violet-500/30';
  if (status === '마감초안') return 'bg-orange-500/12 text-orange-300 border-orange-500/30';
  return 'bg-rose-500/12 text-rose-300 border-rose-500/30';
};

const cardTone = (tone: StatCard['tone']) => {
  if (tone === 'accent') return 'border-[#4D7CFF]/50 bg-[#4D7CFF]/10';
  if (tone === 'warn') return 'border-amber-500/40 bg-amber-500/10';
  return 'border-white/10 bg-white/[0.03]';
};

export default function CherryTmsPage() {
  return (
    <div data-theme="showcase" className="min-h-screen bg-[var(--surface-bg)] text-[var(--surface-text)]">
      <main className="mx-auto flex min-h-screen w-full max-w-[1720px] flex-col gap-6 px-4 py-6 md:px-6 xl:px-8">
        <section className="rounded-[28px] border border-white/10 bg-[#0b1220] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-8 border-b border-white/10 px-6 py-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
            <div className="max-w-3xl">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7aa2ff]">
                Cherrybro TMS Settlement V1 / Settlement Workbench
              </p>
              <h1 className="mb-4 text-3xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
                정산 실무 흐름이 바로 읽히는 체리부로 시안
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                일반 TMS 소개 화면이 아니라, 업로드 → 정규화 → 일 정산 → 월 마감 → Green 차액청구까지를
                정산 실무자 관점에서 빠르게 검토하도록 구성한 내부 workbench 시안입니다.
              </p>
            </div>
            <div className="grid min-w-[280px] gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300 md:min-w-[340px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">정산월</span>
                <strong className="text-white">2026.01</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">기준 버전</span>
                <strong className="text-white">당해 2026 / 비교 2025</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">현재 상태</span>
                <strong className="text-[#7aa2ff]">월마감 준비 단계</strong>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/PoC"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white transition hover:border-white/20 hover:bg-white/5"
                >
                  PoC 참조 보기
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-[#4D7CFF] px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110"
                >
                  월 마감 시작
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-6 md:grid-cols-2 xl:grid-cols-4 xl:px-8">
            {topStats.map((stat) => (
              <article key={stat.label} className={`rounded-2xl border p-5 ${cardTone(stat.tone)}`}>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
                <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">{stat.value}</p>
                <p className="mt-3 text-sm text-slate-300">{stat.hint}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_minmax(320px,0.85fr)]">
          <div className="grid gap-6">
            <article className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">작업 흐름</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">이번 달 정산 워크벤치</h2>
                </div>
                <span className="rounded-full border border-[#4D7CFF]/40 bg-[#4D7CFF]/10 px-3 py-1 text-xs font-medium text-[#8eb0ff]">
                  운영자용 1차 시안
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {workQueues.map((item, index) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">STEP 0{index + 1}</span>
                      <strong className="text-sm text-white">{item.count}</strong>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">원천 업로드 / 정규화</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">업로드 묶음과 매핑 대기 항목</h2>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/5"
                >
                  업로드 상세
                </button>
              </div>
              <div className="grid gap-4 xl:grid-cols-[1.05fr_minmax(280px,0.95fr)]">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">이번 달 파일 번들</p>
                    <span className="text-xs text-slate-400">raw 보존 + 시트 파싱</span>
                  </div>
                  <div className="space-y-3">
                    {sourceFiles.map((file) => (
                      <div key={file.name} className="rounded-2xl border border-white/10 bg-[#0b1220]/60 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-white">{file.name}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{file.source}</p>
                          </div>
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-300">
                            {file.status}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-slate-300">{file.rows}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#4D7CFF]/20 bg-[#4D7CFF]/6 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">매핑 대기 큐</p>
                    <span className="text-xs text-[#9ab6ff]">12건 중 우선 4건</span>
                  </div>
                  <div className="space-y-3">
                    {mappingIssues.map((item) => (
                      <div key={`${item.field}-${item.raw}`} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.field}</span>
                          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-200">
                            {item.state}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-slate-300">raw: {item.raw}</p>
                        <p className="mt-1 text-sm font-medium text-white">suggested: {item.suggested}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">일 정산</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">검토 대기 행</h2>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {['전체', '검토중', '승인대기', '원천누락'].map((filter, index) => (
                    <button
                      key={filter}
                      type="button"
                      className={`rounded-full border px-3 py-1.5 transition ${
                        index === 0
                          ? 'border-[#4D7CFF]/40 bg-[#4D7CFF]/10 text-[#9ab6ff]'
                          : 'border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                    <thead className="bg-white/[0.04] text-slate-400">
                      <tr>
                        {['일자', '차량', '기사', '차수', '지역', 'BOX', '상태', '당해', '전년', '차액'].map((head) => (
                          <th key={head} className="px-4 py-3 font-medium whitespace-nowrap">
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-[#0b1220]/40">
                      {settlementRows.map((row, index) => {
                        const isActive = index === 0;

                        return (
                          <tr
                            key={`${row.date}-${row.vehicle}-${row.trip}`}
                            className={`text-slate-200 transition ${
                              isActive ? 'bg-[#4D7CFF]/8' : 'hover:bg-white/[0.03]'
                            }`}
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <span className={`h-8 w-1 rounded-full ${isActive ? 'bg-[#4D7CFF]' : 'bg-transparent'}`} />
                                <span>{row.date}</span>
                              </div>
                            </td>
                            <td className={`px-4 py-3 whitespace-nowrap ${isActive ? 'text-white font-medium' : ''}`}>{row.vehicle}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{row.driver}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{row.trip}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{row.region}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{row.boxes}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone(row.status)}`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">{row.current}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-400">{row.previous}</td>
                            <td className={`px-4 py-3 whitespace-nowrap font-medium ${isActive ? 'text-[#b6caff]' : 'text-[#8eb0ff]'}`}>
                              {row.diff}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </article>

            <article className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">일 정산 상세</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">선택 행 상세 패널</h2>
                </div>
                <span className="rounded-full border border-[#4D7CFF]/30 bg-[#4D7CFF]/10 px-3 py-1 text-xs font-medium text-[#9ab6ff]">
                  {selectedSettlement.vehicle} / {selectedSettlement.trip}
                </span>
              </div>
              <div className="grid gap-4 xl:grid-cols-[1fr_minmax(280px,0.9fr)]">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-semibold text-white">원천 근거</p>
                  <div className="mt-4 space-y-3">
                    {selectedSettlement.sourceBasis.map((item, index) => (
                      <div key={item} className="rounded-2xl border border-white/10 bg-[#0b1220]/60 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">SOURCE 0{index + 1}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-200">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-sm font-semibold text-white">입력값</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {selectedSettlement.inputValues.map((item) => (
                        <div key={item.label} className="rounded-2xl border border-white/10 bg-[#0b1220]/60 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                          <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#4D7CFF]/25 bg-[#4D7CFF]/8 p-4">
                    <p className="text-sm font-semibold text-white">계산 결과</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {selectedSettlement.calcValues.map((item) => (
                        <div key={item.label} className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                          <p className={`mt-2 text-lg font-semibold ${item.tone === 'accent' ? 'text-[#9ab6ff]' : 'text-white'}`}>
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full bg-[#4D7CFF] px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110"
                    >
                      재계산
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/5"
                    >
                      승인
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-200 transition hover:bg-amber-500/15"
                    >
                      보정 필요 표시
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className="grid gap-6">
            <article className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">월 마감</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">기사별 월 합계 초안</h2>
              <div className="mt-5 space-y-3">
                {monthlyCloseItems.map((item) => (
                  <div key={`${item.driver}-${item.vehicle}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.driver}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{item.vehicle} / {item.trips}</p>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusTone(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                      <div className="rounded-2xl border border-white/10 bg-[#0b1220]/60 px-3 py-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">당해</p>
                        <p className="mt-2 font-semibold text-white">{item.current}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-[#0b1220]/60 px-3 py-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">전년</p>
                        <p className="mt-2 font-semibold text-slate-300">{item.previous}</p>
                      </div>
                      <div className="rounded-2xl border border-[#4D7CFF]/25 bg-[#4D7CFF]/8 px-3 py-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#9ab6ff]">차액</p>
                        <p className="mt-2 font-semibold text-[#9ab6ff]">{item.diff}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[24px] border border-[#4D7CFF]/25 bg-[#4D7CFF]/8 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9ab6ff]">Green 차액청구 초안</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">청구 요약 / export</h2>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-white/10 bg-black/15 px-4 py-2 text-xs font-medium text-white transition hover:bg-black/25"
                >
                  Excel export
                </button>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">당해 기준 총액</p>
                  <p className="mt-2 text-2xl font-semibold text-white">₩124.3M</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">전년 기준 총액</p>
                  <p className="mt-2 text-2xl font-semibold text-white">₩115.8M</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-dashed border-white/15 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">청구 차액 총액</p>
                <p className="mt-2 text-3xl font-semibold text-[#9ab6ff]">₩8.5M</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">기사 지급은 당해 기준으로 마감하고, Green 청구는 당해-전년 차액만 별도 문서화합니다.</p>
              </div>
              <div className="mt-5 space-y-3">
                {claimBreakdown.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm">
                    <span className="text-slate-200">{label}</span>
                    <strong className="text-white">{value}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">문서 액션</p>
              <div className="mt-4 grid gap-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">1. 기사별 월정산표 export</div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">2. Green 차액청구 요약서 export</div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">3. 상세 근거내역 첨부용 export</div>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
