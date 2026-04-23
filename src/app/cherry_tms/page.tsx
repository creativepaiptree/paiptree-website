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

type ClaimDraftItem = {
  item: string;
  basis: string;
  current: string;
  previous: string;
  diff: string;
  status: string;
};

type DocumentActionItem = {
  document: string;
  basis: string;
  target: string;
  status: string;
  action: string;
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

const claimDraftItems: ClaimDraftItem[] = [
  {
    item: '운임 인상분',
    basis: '2026 운임표 - 2025 운임표',
    current: '₩124.3M',
    previous: '₩118.1M',
    diff: '+₩6.2M',
    status: '초안완료',
  },
  {
    item: '착지수당 차이',
    basis: '배송현황 착지수당 집계',
    current: '₩9.8M',
    previous: '₩8.6M',
    diff: '+₩1.2M',
    status: '검토필요',
  },
  {
    item: '경유수당 차이',
    basis: '배차일보 경유수 입력 기준',
    current: '₩5.4M',
    previous: '₩4.7M',
    diff: '+₩0.7M',
    status: '근거확인',
  },
  {
    item: '기타 보정',
    basis: '수기보정/예외 운행 반영',
    current: '₩1.5M',
    previous: '₩1.1M',
    diff: '+₩0.4M',
    status: '초안완료',
  },
];

const documentActionItems: DocumentActionItem[] = [
  {
    document: '기사별 월정산표',
    basis: '월마감 집계표 승인 행 기준',
    target: '기사 지급 마감용',
    status: '생성가능',
    action: '엑셀 내보내기',
  },
  {
    document: 'Green 차액청구 요약서',
    basis: '당해-전년 차액 합계 기준',
    target: '거래처 청구 초안',
    status: '검토후 생성',
    action: '요약서 생성',
  },
  {
    document: '상세 근거내역 첨부본',
    basis: '일정산 상세/보정 내역 포함',
    target: '첨부 증빙 제출용',
    status: '근거정리 필요',
    action: '첨부본 생성',
  },
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
  if (status === '검토중' || status === '검토필요') return 'bg-amber-500/12 text-amber-300 border-amber-500/30';
  if (status === '승인대기' || status === '생성가능') return 'bg-sky-500/12 text-sky-300 border-sky-500/30';
  if (status === '검토완료' || status === '초안완료') return 'bg-emerald-500/12 text-emerald-300 border-emerald-500/30';
  if (status === '차액확인' || status === '근거확인') return 'bg-violet-500/12 text-violet-300 border-violet-500/30';
  if (status === '마감초안' || status === '검토후 생성') return 'bg-orange-500/12 text-orange-300 border-orange-500/30';
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
        <section className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3 md:px-6">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7aa2ff]">
                  Cherrybro TMS Settlement V1 / ERP Input Draft
                </p>
                <h1 className="mt-2 text-xl font-semibold text-white md:text-2xl">
                  체리부로 차량 정산 등록 / 검토
                </h1>
              </div>
              <div className="flex flex-wrap gap-2 text-xs md:text-sm">
                <Link
                  href="/PoC"
                  className="inline-flex items-center justify-center border border-[#314056] px-3 py-2 text-slate-200 transition hover:bg-white/5"
                >
                  PoC 참조
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center justify-center border border-[#4D7CFF] bg-[#1c2c52] px-3 py-2 font-medium text-white transition hover:bg-[#223664]"
                >
                  정산월 마감
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-[#243041] px-4 py-4 md:px-6">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
              {[
                ['정산월', '2026.01'],
                ['운송사', '그린'],
                ['기사명', '전체'],
                ['상태', '검토중'],
                ['기준 버전', '당해 2026 / 비교 2025'],
                ['조회 키워드', '차량번호 / 거래처'],
              ].map(([label, value]) => (
                <label key={label} className="grid gap-2">
                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">{label}</span>
                  <div className="border border-[#314056] bg-[#0a1019] px-3 py-2 text-sm text-slate-200">{value}</div>
                </label>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {['조회', '초기화', '엑셀업로드', '정산생성', '청구초안'].map((action, index) => (
                <button
                  key={action}
                  type="button"
                  className={`px-3 py-2 text-xs font-medium transition md:text-sm ${
                    index === 0
                      ? 'border border-[#4D7CFF] bg-[#1c2c52] text-white hover:bg-[#223664]'
                      : 'border border-[#314056] bg-[#0a1019] text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-px bg-[#243041] md:grid-cols-2 xl:grid-cols-4">
            {topStats.map((stat) => (
              <article key={stat.label} className={`bg-[#0b1220] px-4 py-4 ${cardTone(stat.tone)}`}>
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{stat.label}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">{stat.hint}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_minmax(320px,0.85fr)]">
          <div className="grid gap-6">
            <article className="border border-[#243041] bg-[#0b1220]">
              <div className="flex items-center justify-between gap-4 border-b border-[#243041] bg-[#0f1722] px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">작업 흐름</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">정산 진행 현황</h2>
                </div>
                <span className="border border-[#314056] bg-[#0a1019] px-3 py-1 text-xs text-slate-300">
                  ERP 진행표
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-[#111a27] text-slate-400">
                    <tr>
                      <th className="border-b border-[#243041] px-4 py-3 font-medium">단계</th>
                      <th className="border-b border-[#243041] px-4 py-3 font-medium">현재 상태</th>
                      <th className="border-b border-[#243041] px-4 py-3 font-medium">설명</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workQueues.map((item, index) => (
                      <tr key={item.title} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-6 min-w-[52px] items-center justify-center border border-[#314056] bg-[#0a1019] px-2 text-[11px] font-medium text-slate-300">
                              STEP 0{index + 1}
                            </span>
                            <span className="font-medium text-white">{item.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-[#9ab6ff]">{item.count}</td>
                        <td className="px-4 py-3 text-slate-300">{item.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="border border-[#243041] bg-[#0b1220]">
              <div className="flex items-center justify-between gap-3 border-b border-[#243041] bg-[#0f1722] px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">원천 업로드 / 정규화</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">업로드 파일 및 매핑 대기 현황</h2>
                </div>
                <button
                  type="button"
                  className="border border-[#314056] bg-[#0a1019] px-3 py-2 text-xs text-slate-200 transition hover:bg-white/5"
                >
                  업로드 상세
                </button>
              </div>
              <div className="grid gap-px bg-[#243041] xl:grid-cols-[1.1fr_minmax(280px,0.9fr)]">
                <div className="bg-[#0b1220]">
                  <div className="border-b border-[#243041] px-4 py-3 text-sm font-medium text-white">이번 달 파일 번들</div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-left text-sm">
                      <thead className="bg-[#111a27] text-slate-400">
                        <tr>
                          {['파일명', '구분', '상태', '행/시트'].map((head) => (
                            <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">
                              {head}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sourceFiles.map((file) => (
                          <tr key={file.name} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                            <td className="px-4 py-3 whitespace-nowrap text-white">{file.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-300">{file.source}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-[#9ab6ff]">{file.status}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-300">{file.rows}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-[#0b1220]">
                  <div className="flex items-center justify-between border-b border-[#243041] px-4 py-3">
                    <span className="text-sm font-medium text-white">매핑 대기 큐</span>
                    <span className="text-xs text-[#9ab6ff]">12건 중 우선 4건</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-left text-sm">
                      <thead className="bg-[#111a27] text-slate-400">
                        <tr>
                          {['필드', 'raw 값', '제안값', '상태'].map((head) => (
                            <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">
                              {head}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {mappingIssues.map((item) => (
                          <tr key={`${item.field}-${item.raw}`} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                            <td className="px-4 py-3 whitespace-nowrap text-white">{item.field}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-300">{item.raw}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-200">{item.suggested}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-amber-300">{item.state}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </article>

            <article className="border border-[#243041] bg-[#0b1220]">
              <div className="flex flex-col gap-3 border-b border-[#243041] bg-[#0f1722] px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">일 정산</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">일 정산 검토 리스트</h2>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {['전체', '검토중', '승인대기', '원천누락'].map((filter, index) => (
                    <button
                      key={filter}
                      type="button"
                      className={`border px-3 py-1.5 transition ${
                        index === 0
                          ? 'border-[#4D7CFF] bg-[#1c2c52] text-white'
                          : 'border-[#314056] bg-[#0a1019] text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-[#111a27] text-slate-400">
                    <tr>
                      {['일자', '차량', '기사', '차수', '지역', 'BOX', '상태', '당해', '전년', '차액'].map((head) => (
                        <th key={head} className="border-b border-[#243041] px-3 py-3 font-medium whitespace-nowrap">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {settlementRows.map((row, index) => {
                      const isActive = index === 0;

                      return (
                        <tr
                          key={`${row.date}-${row.vehicle}-${row.trip}`}
                          className={`border-b border-[#1b2636] text-slate-200 last:border-b-0 ${
                            isActive ? 'bg-[#13213a]' : 'hover:bg-white/[0.03]'
                          }`}
                        >
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className={`h-6 w-[3px] ${isActive ? 'bg-[#4D7CFF]' : 'bg-transparent'}`} />
                              <span>{row.date}</span>
                            </div>
                          </td>
                          <td className={`px-3 py-3 whitespace-nowrap ${isActive ? 'font-medium text-white' : ''}`}>{row.vehicle}</td>
                          <td className="px-3 py-3 whitespace-nowrap">{row.driver}</td>
                          <td className="px-3 py-3 whitespace-nowrap">{row.trip}</td>
                          <td className="px-3 py-3 whitespace-nowrap">{row.region}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-right">{row.boxes}</td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className={`border px-2 py-1 text-[11px] font-medium ${statusTone(row.status)}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-right">{row.current}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-right text-slate-400">{row.previous}</td>
                          <td className={`px-3 py-3 whitespace-nowrap text-right font-medium ${isActive ? 'text-[#b6caff]' : 'text-[#8eb0ff]'}`}>
                            {row.diff}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="border border-[#243041] bg-[#0b1220]">
              <div className="flex items-center justify-between gap-3 border-b border-[#243041] bg-[#0f1722] px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">일 정산 상세</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">선택 행 상세 입력 / 계산</h2>
                </div>
                <span className="border border-[#314056] bg-[#0a1019] px-3 py-1 text-xs text-[#9ab6ff]">
                  {selectedSettlement.vehicle} / {selectedSettlement.trip}
                </span>
              </div>
              <div className="grid gap-px bg-[#243041] xl:grid-cols-[1fr_minmax(300px,0.95fr)]">
                <div className="bg-[#0b1220]">
                  <div className="border-b border-[#243041] px-4 py-3 text-sm font-medium text-white">원천 근거</div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-left text-sm">
                      <thead className="bg-[#111a27] text-slate-400">
                        <tr>
                          <th className="border-b border-[#243041] px-4 py-3 font-medium">구분</th>
                          <th className="border-b border-[#243041] px-4 py-3 font-medium">근거 내용</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSettlement.sourceBasis.map((item, index) => (
                          <tr key={item} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                            <td className="px-4 py-3 whitespace-nowrap text-slate-400">SOURCE 0{index + 1}</td>
                            <td className="px-4 py-3 text-slate-200">{item}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-[#0b1220]">
                  <div className="border-b border-[#243041] px-4 py-3 text-sm font-medium text-white">입력값 / 계산결과</div>
                  <div className="grid gap-px bg-[#243041] md:grid-cols-2">
                    {selectedSettlement.inputValues.map((item) => (
                      <div key={item.label} className="bg-[#0b1220] px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                        <div className="mt-2 border border-[#314056] bg-[#0a1019] px-3 py-2 text-sm text-white">{item.value}</div>
                      </div>
                    ))}
                    {selectedSettlement.calcValues.map((item) => (
                      <div key={item.label} className="bg-[#0b1220] px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                        <div className={`mt-2 border px-3 py-2 text-sm font-medium ${item.tone === 'accent' ? 'border-[#4D7CFF] bg-[#15233f] text-[#b6caff]' : 'border-[#314056] bg-[#0a1019] text-white'}`}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#243041] px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="border border-[#4D7CFF] bg-[#1c2c52] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#223664]"
                      >
                        재계산
                      </button>
                      <button
                        type="button"
                        className="border border-[#314056] bg-[#0a1019] px-3 py-2 text-xs text-slate-200 transition hover:bg-white/5"
                      >
                        승인
                      </button>
                      <button
                        type="button"
                        className="border border-[#7a5a23] bg-[#2b2213] px-3 py-2 text-xs text-amber-200 transition hover:bg-[#352a18]"
                      >
                        보정 필요 표시
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className="grid gap-6">
            <article className="border border-[#243041] bg-[#0b1220]">
              <div className="flex items-center justify-between gap-3 border-b border-[#243041] bg-[#0f1722] px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">월 마감</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">기사별 월 합계 초안</h2>
                </div>
                <span className="border border-[#314056] bg-[#0a1019] px-3 py-1 text-xs text-slate-300">
                  월마감 집계표
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-[#111a27] text-slate-400">
                    <tr>
                      {['기사명', '차량', '운행건수', '당해', '전년', '차액', '상태'].map((head) => (
                        <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyCloseItems.map((item) => (
                      <tr key={`${item.driver}-${item.vehicle}`} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                        <td className="px-4 py-3 whitespace-nowrap text-white">{item.driver}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-300">{item.vehicle}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-300">{item.trips}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-white">{item.current}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-slate-400">{item.previous}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-[#9ab6ff]">{item.diff}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`border px-2 py-1 text-[11px] font-medium ${statusTone(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="border border-[#243041] bg-[#0b1220]">
              <div className="flex items-center justify-between gap-3 border-b border-[#243041] bg-[#10203d] px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9ab6ff]">차액청구</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">Green 차액청구 집계표</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="border border-[#4D7CFF] bg-[#1c2c52] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#223664]"
                  >
                    청구초안 생성
                  </button>
                  <button
                    type="button"
                    className="border border-[#314056] bg-[#0a1019] px-3 py-2 text-xs text-slate-200 transition hover:bg-white/5"
                  >
                    요약서 export
                  </button>
                </div>
              </div>
              <div className="grid gap-px border-b border-[#243041] bg-[#243041] md:grid-cols-3">
                {[
                  ['당해 기준 총액', '₩141.0M'],
                  ['전년 기준 총액', '₩132.5M'],
                  ['청구 차액 총액', '₩8.5M'],
                ].map(([label, value], index) => (
                  <div key={label} className="bg-[#0b1220] px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</p>
                    <p className={`mt-2 text-xl font-semibold ${index === 2 ? 'text-[#9ab6ff]' : 'text-white'}`}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-[#111a27] text-slate-400">
                    <tr>
                      {['항목', '산출 기준', '당해', '전년', '차액', '상태'].map((head) => (
                        <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {claimDraftItems.map((item) => (
                      <tr key={item.item} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                        <td className="px-4 py-3 whitespace-nowrap text-white">{item.item}</td>
                        <td className="px-4 py-3 text-slate-300">{item.basis}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-white">{item.current}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-slate-400">{item.previous}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-[#9ab6ff]">{item.diff}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`border px-2 py-1 text-[11px] font-medium ${statusTone(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-[#243041] px-4 py-3 text-sm text-slate-300">
                기사 지급은 당해 기준으로 마감하고, Green 청구는 당해-전년 차액만 별도 문서화합니다.
              </div>
            </article>

            <article className="border border-[#243041] bg-[#0b1220]">
              <div className="flex items-center justify-between gap-3 border-b border-[#243041] bg-[#0f1722] px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">문서 액션</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">월마감 문서 생성 작업행</h2>
                </div>
                <span className="border border-[#314056] bg-[#0a1019] px-3 py-1 text-xs text-slate-300">export / 생성 / 첨부</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-[#111a27] text-slate-400">
                    <tr>
                      {['문서명', '생성 기준', '제출 대상', '상태', '실행'].map((head) => (
                        <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {documentActionItems.map((item) => (
                      <tr key={item.document} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                        <td className="px-4 py-3 whitespace-nowrap text-white">{item.document}</td>
                        <td className="px-4 py-3 text-slate-300">{item.basis}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-300">{item.target}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`border px-2 py-1 text-[11px] font-medium ${statusTone(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            type="button"
                            className="border border-[#314056] bg-[#0a1019] px-3 py-2 text-xs text-slate-200 transition hover:bg-white/5"
                          >
                            {item.action}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
