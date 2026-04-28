'use client';

import Link from 'next/link';
import { Fragment, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

import { CherryTmsShell } from '../_shared';
import { formatCurrency, parseKg, parseNumber, parseTripCount } from '@/lib/cherryTmsMonthlyVehicle';
import type { CherryTmsMonthlyVehiclePageData, CherryTmsMonthlyVehicleRow } from '@/lib/cherryTmsMonthlyVehicle';

const buildMonthlyVehicleHref = (month?: string | null, vehicle?: string | null, date?: string | null, theme?: string | null) => {
  const params = new URLSearchParams();
  if (month) params.set('month', month);
  if (vehicle) params.set('vehicle', vehicle);
  if (date) params.set('date', date);
  if (theme === 'light') params.set('theme', 'light');
  const query = params.toString();
  return query ? `/cherry_tms/monthly-vehicle/?${query}` : '/cherry_tms/monthly-vehicle/';
};

const normalizeMonth = (value?: string | null) => (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value.trim()) ? value.trim() : null);
const normalizeVehicle = (value?: string | null) => (typeof value === 'string' && value.trim() ? value.trim() : null);
const normalizeDate = (value?: string | null) => (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim()) ? value.trim() : null);
const formatKg = (value: number) => `${value.toLocaleString('ko-KR')}kg`;

type DailyVehicleGroup = {
  date: string;
  driver: string;
  routeCount: number;
  sourceRowCount: number;
  detailCount: number;
  totalWeightKg: number;
  dispatchTotal: number;
  fuelTotal: number;
  rows: CherryTmsMonthlyVehicleRow['sourceRows'];
};

const buildDailyVehicleGroups = (rows: CherryTmsMonthlyVehicleRow['sourceRows']): DailyVehicleGroup[] => {
  const byKey = new Map<string, DailyVehicleGroup>();

  for (const row of rows) {
    const date = row.groupingDate ?? '미지정';
    const driver = row.driver || '미지정';
    const key = `${date}::${driver}`;
    const existing = byKey.get(key) ?? {
      date,
      driver,
      routeCount: 0,
      sourceRowCount: 0,
      detailCount: 0,
      totalWeightKg: 0,
      dispatchTotal: 0,
      fuelTotal: 0,
      rows: [],
    };

    existing.routeCount += parseTripCount(row.trips) || row.details.length || 1;
    existing.sourceRowCount += 1;
    existing.detailCount += row.details.length;
    existing.totalWeightKg += row.details.reduce((sum, detail) => sum + parseKg(detail.weight), 0);
    existing.dispatchTotal += parseNumber(row.prices.standardFare) + parseNumber(row.prices.g70TransportFare) + parseNumber(row.prices.m70RoundTrip);
    existing.fuelTotal += parseNumber(row.prices.i70FuelFare);
    existing.rows.push(row);
    byKey.set(key, existing);
  }

  return Array.from(byKey.values()).sort((a, b) => b.date.localeCompare(a.date, 'ko-KR') || a.driver.localeCompare(b.driver, 'ko-KR'));
};

const filterRows = (rows: CherryTmsMonthlyVehicleRow[], month: string | null, vehicle: string | null) => {
  let filtered = rows;
  if (month) filtered = filtered.filter((row) => row.month === month);
  if (vehicle) filtered = filtered.filter((row) => row.vehicle === vehicle);
  return filtered;
};

const fallbackRows: CherryTmsMonthlyVehicleRow[] = [
  {
    month: '2026-04',
    vehicle: '경기96자1574',
    driver: '남명규',
    routeCount: 6,
    sourceRowCount: 3,
    regionSummary: '용인 → 수원 → 동서울',
    totalWeightKg: 1820,
    dispatchTotal: 106490,
    fuelTotal: 24000,
    allowanceTotal: 15000,
    status: '검토중',
    lastDispatchDate: '2026-04-23',
    routeLabels: ['용인 → 수원 → 동서울'],
    sourceRows: [],
  },
];

export function CherryTmsMonthlyVehicleClient({ data, fallbackRows: incomingFallbackRows }: { data: CherryTmsMonthlyVehiclePageData | null; fallbackRows?: CherryTmsMonthlyVehicleRow[] }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const monthParam = normalizeMonth(searchParams.get('month'));
  const vehicleParam = normalizeVehicle(searchParams.get('vehicle'));
  const dateParam = normalizeDate(searchParams.get('date'));
  const hasSupabaseData = data !== null;
  const rowsForBase = hasSupabaseData ? data.rows : incomingFallbackRows ?? fallbackRows;
  const visibleMonths = hasSupabaseData ? data.availableMonths : Array.from(new Set(rowsForBase.map((row) => row.month)));
  const preselectedRows = monthParam || vehicleParam ? filterRows(rowsForBase, monthParam, vehicleParam) : rowsForBase;
  const selectedRow = preselectedRows[0] ?? rowsForBase[0] ?? null;
  const selectedMonth = monthParam ?? selectedRow?.month ?? visibleMonths[0] ?? null;
  const visibleRowsForMonth = useMemo(() => filterRows(rowsForBase, selectedMonth, null), [rowsForBase, selectedMonth]);
  const activeRows = useMemo(
    () => (monthParam || vehicleParam ? filterRows(rowsForBase, monthParam, vehicleParam) : visibleRowsForMonth),
    [rowsForBase, monthParam, vehicleParam, visibleRowsForMonth]
  );
  const visibleVehicles = hasSupabaseData
    ? Array.from(new Set(visibleRowsForMonth.map((row) => row.vehicle)))
    : Array.from(new Set(visibleRowsForMonth.map((row) => row.vehicle)));
  const selectedVehicle = vehicleParam ?? selectedRow?.vehicle ?? visibleVehicles[0] ?? null;
  const vehicleRowsForSelection = useMemo(() => filterRows(rowsForBase, selectedMonth, selectedVehicle), [rowsForBase, selectedMonth, selectedVehicle]);
  const selectedAggregate = vehicleRowsForSelection[0] ?? visibleRowsForMonth[0] ?? selectedRow;
  const detailRows = useMemo(() => selectedAggregate?.sourceRows ?? [], [selectedAggregate]);
  const visibleDates = useMemo(
    () => Array.from(new Set(detailRows.map((row) => row.groupingDate).filter((value): value is string => Boolean(value)))).sort((a, b) => b.localeCompare(a, 'ko-KR')),
    [detailRows]
  );
  const selectedDate = dateParam ?? visibleDates[0] ?? null;
  const detailRowsForSelection = useMemo(
    () => (selectedDate ? detailRows.filter((row) => row.groupingDate === selectedDate) : detailRows),
    [detailRows, selectedDate]
  );
  const currentSourceRowCount = detailRowsForSelection.length;
  const currentManualReviewCount = detailRowsForSelection.reduce(
    (sum, sourceRow) => sum + sourceRow.details.filter((detail) => detail.judgement !== '정상').length,
    0
  );
  const summaryCards = hasSupabaseData
    ? [
        { label: '원천 행', value: `${currentSourceRowCount.toLocaleString('ko-KR')}건`, hint: '현재 월/차량/날짜 필터 기준' },
        { label: '월별 차량 묶음', value: `${activeRows.length.toLocaleString('ko-KR')}건`, hint: '현재 월/차량 필터 기준' },
        { label: '차량 수', value: `${visibleVehicles.length.toLocaleString('ko-KR')}대`, hint: '선택 월 기준 차량' },
        { label: '수동 확인', value: `${currentManualReviewCount.toLocaleString('ko-KR')}건`, hint: '현재 날짜의 검토 필요량' },
        { label: '연결 상태', value: '실데이터', hint: 'grouping view에서 월별 집계' },
        { label: '마지막 마감', value: selectedAggregate?.lastDispatchDate ?? '-', hint: '선택 월의 최신 배차일' },
      ]
    : [
        { label: '원천 행', value: `${currentSourceRowCount.toLocaleString('ko-KR')}건`, hint: '현재 샘플 필터 기준' },
        { label: '월별 차량 묶음', value: `${activeRows.length.toLocaleString('ko-KR')}건`, hint: '샘플 기준' },
        { label: '차량 수', value: `${visibleVehicles.length.toLocaleString('ko-KR')}대`, hint: '샘플 기준' },
        { label: '수동 확인', value: `${currentManualReviewCount.toLocaleString('ko-KR')}건`, hint: '샘플 데이터' },
        { label: '연결 상태', value: '샘플', hint: 'Supabase 연결 실패/미설정' },
        { label: '마지막 마감', value: selectedAggregate?.lastDispatchDate ?? '-', hint: '샘플 기준' },
      ];

  const dailyGroups = useMemo(() => buildDailyVehicleGroups(detailRowsForSelection), [detailRowsForSelection]);

  return (
    <CherryTmsShell
      current="monthly-vehicle"
      eyebrow="Cherrybro TMS / Monthly Vehicle"
      title="월별 차량별 내역"
      description="정산월과 차량번호를 먼저 고정해 월 누계, 기사 매칭, 회차 수, 유류와 운임 차액을 함께 보는 보조 뷰입니다. settlement-review와 claim-docs 사이에서 차량 단위 월마감을 확인하는 화면으로 씁니다."
    >
      <section className="border border-[#243041] bg-[#0b1220]">
        <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">월별 차량 뷰</p>
              <h2 className="mt-1 text-lg font-semibold text-white">차량번호 + 정산월 기준 월 누계</h2>
            </div>
            <Link href={buildMonthlyVehicleHref(selectedMonth, selectedVehicle, selectedDate, theme)} className="border border-[#314056] bg-[#0a1019] px-3 py-2 text-xs text-slate-200 transition hover:bg-white/5">
              현재 선택 고정
            </Link>
          </div>
        </div>
        <div className="grid gap-3 px-4 py-4 md:grid-cols-2 xl:grid-cols-6">
          {[
            ['정산월', selectedMonth ?? '-'],
            ['선택 차량', selectedVehicle ?? '-'],
            ['선택 기사', selectedAggregate?.driver ?? '-'],
            ['월 누계 row', `${selectedAggregate?.routeCount.toLocaleString('ko-KR') ?? '0'}건`],
            ['월 누계 중량', formatKg(selectedAggregate?.totalWeightKg ?? 0)],
            ['마감 상태', selectedAggregate?.status ?? '-'],
          ].map(([label, value]) => (
            <div key={label} className="grid gap-2">
              <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</span>
              <div className="border border-[#314056] bg-[#0a1019] px-3 py-2 text-sm text-slate-200">{value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-px border border-[#243041] bg-[#243041] md:grid-cols-3 xl:grid-cols-6">
        {summaryCards.map((item) => (
          <article key={item.label} className="bg-[#0b1220] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">{item.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">월 / 차량 필터</h2>
          </div>
          <div className="space-y-4 px-4 py-4">
            <form action="/cherry_tms/monthly-vehicle/" className="grid gap-3 md:grid-cols-[180px_220px_180px_auto_auto]">
              {theme === 'light' ? <input type="hidden" name="theme" value="light" /> : null}
              <label className="grid gap-2 text-xs text-slate-400">
                <span className="uppercase tracking-[0.16em] text-slate-500">월 직접 선택</span>
                <input
                  name="month"
                  type="month"
                  defaultValue={selectedMonth ?? ''}
                  className="border border-[#314056] bg-[#0a1019] px-3 py-2 text-sm text-slate-100 outline-none [color-scheme:dark] focus:border-[#4D7CFF]"
                />
              </label>
              <label className="grid gap-2 text-xs text-slate-400">
                <span className="uppercase tracking-[0.16em] text-slate-500">차량 직접 입력</span>
                <input
                  name="vehicle"
                  type="text"
                  defaultValue={selectedVehicle ?? ''}
                  placeholder="차량번호 전체/일부"
                  className="border border-[#314056] bg-[#0a1019] px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#4D7CFF]"
                />
              </label>
              <label className="grid gap-2 text-xs text-slate-400">
                <span className="uppercase tracking-[0.16em] text-slate-500">일자 직접 선택</span>
                <input
                  name="date"
                  type="date"
                  defaultValue={selectedDate ?? ''}
                  className="border border-[#314056] bg-[#0a1019] px-3 py-2 text-sm text-slate-100 outline-none [color-scheme:dark] focus:border-[#4D7CFF]"
                />
              </label>
              <button type="submit" className="self-end border border-[#4D7CFF] bg-[#1c2c52] px-4 py-2 text-sm text-white transition hover:bg-[#223664]">
                필터 적용
              </button>
              <Link href={buildMonthlyVehicleHref(null, null, null, theme)} className="self-end border border-[#314056] bg-[#0a1019] px-4 py-2 text-center text-sm text-slate-200 transition hover:bg-white/5">
                전체 보기
              </Link>
            </form>

            <div className="grid gap-3 xl:grid-cols-2">
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-slate-500">데이터가 있는 월</p>
                <div className="flex flex-wrap gap-2 text-sm">
                  {visibleMonths.map((month) => (
                    <Link
                      key={month}
                      href={monthParam === month && !vehicleParam ? buildMonthlyVehicleHref(null, null, null, theme) : buildMonthlyVehicleHref(month, null, null, theme)}
                      className={`border px-3 py-2 transition ${selectedMonth === month && monthParam ? 'border-[#4D7CFF] bg-[#1c2c52] text-white' : 'border-[#314056] bg-[#0a1019] text-slate-300 hover:bg-white/5'}`}
                    >
                      {month}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-slate-500">선택 차량의 데이터 일자</p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Link href={buildMonthlyVehicleHref(selectedMonth, selectedVehicle, null, theme)} className={`border px-3 py-2 transition ${!dateParam ? 'border-[#4D7CFF] bg-[#1c2c52] text-white' : 'border-[#314056] bg-[#0a1019] text-slate-300 hover:bg-white/5'}`}>
                    월전체
                  </Link>
                  {visibleDates.map((date) => (
                    <Link
                      key={date}
                      href={dateParam === date ? buildMonthlyVehicleHref(selectedMonth, selectedVehicle, null, theme) : buildMonthlyVehicleHref(selectedMonth, selectedVehicle, date, theme)}
                      className={`border px-3 py-2 transition ${selectedDate === date ? 'border-[#4D7CFF] bg-[#1c2c52] text-white' : 'border-[#314056] bg-[#0a1019] text-slate-300 hover:bg-white/5'}`}
                    >
                      {date}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">월별 차량 운영 메모</h2>
          </div>
          <div className="grid gap-px bg-[#243041]">
            {[
              '이 화면은 grouping 실데이터를 월+차량 축으로 다시 묶어 월마감만 따로 확인한다.',
              '필요하면 차량 안에서 기사 고정 여부와 회차별 차액을 다시 펼친다.',
              '원천은 grouping view에서 읽은 실제 row이며, 월 누계는 같은 차량의 모든 grouping row를 합산한다.',
              '공유 TMS DB가 아니라 별도 정산 DB에서 같은 키로 읽는 전제를 유지한다.',
            ].map((item) => (
              <div key={item} className="bg-[#0b1220] px-4 py-4 text-sm leading-6 text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="border border-[#243041] bg-[#0b1220]">
        <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
          <h2 className="text-lg font-semibold text-white">월별 차량 내역 테이블</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-[#111a27] text-slate-400">
              <tr>
                {['정산월', '차량', '기사', '회차', '지역 묶음', '중량', '운임합계', '유류합계', '수당합계', '상태'].map((head) => (
                  <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeRows.map((row) => (
                <tr key={`${row.month}-${row.vehicle}`} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                  <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.month}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-white">{row.vehicle}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.driver}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.routeCount.toLocaleString('ko-KR')}건</td>
                  <td className="px-4 py-3 text-slate-300">{row.regionSummary}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-300">{formatKg(row.totalWeightKg)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-[#9ab6ff]">{formatCurrency(row.dispatchTotal)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-300">{formatCurrency(row.fuelTotal)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-300">{formatCurrency(row.allowanceTotal)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-amber-300">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {activeRows.length === 0 ? (
        <section className="border border-[#243041] bg-[#0b1220] px-4 py-4 text-sm text-slate-300">
          <div className="font-medium text-white">필터 결과 없음</div>
          <div className="mt-2 text-slate-400">선택한 월/차량에 해당하는 월별 차량 묶음이 없습니다. 다른 월이나 차량을 선택하세요.</div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_minmax(360px,0.8fr)]">
        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">선택 차량 상세 행</h2>
              <span className="border border-[#314056] bg-[#0a1019] px-3 py-1 text-xs text-slate-300">월 그룹 → 일간 그룹 → 원천행</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-[#111a27] text-slate-400">
                <tr>
                  {['배차일', '차량', '기사', '회차', '경로', '중량', '운임', '유류'].map((head) => (
                    <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dailyGroups.map((group) => (
                  <Fragment key={`${group.date}-${group.driver}`}>
                    <tr className="border-b border-[#243041] bg-[#0f1722] text-slate-200">
                      <td className="px-4 py-3 whitespace-nowrap font-semibold text-[#9ab6ff]">일간 그룹 {group.date}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-300">{selectedAggregate?.vehicle ?? '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-300">{group.driver}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-300">{group.routeCount.toLocaleString('ko-KR')}건</td>
                      <td className="px-4 py-3 text-slate-300">일간 grouping row {group.sourceRowCount.toLocaleString('ko-KR')}개 / 원천 {group.detailCount.toLocaleString('ko-KR')}행</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-300">{formatKg(group.totalWeightKg)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-[#9ab6ff]">{formatCurrency(group.dispatchTotal)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-300">{formatCurrency(group.fuelTotal)}</td>
                    </tr>
                    {group.rows.map((row) => (
                      <tr key={`${row.groupingDate}-${row.vehicle}-${row.driver}-${row.routeOrder}`} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                        <td className="px-4 py-3 whitespace-nowrap text-slate-500">↳ {row.groupingDate ?? '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-white">{row.vehicle}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.driver}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.trips}</td>
                        <td className="px-4 py-3 text-slate-300">{row.routeOrder || `${row.startRegion} → ${row.endRegion}`}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.totalWeight}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-[#9ab6ff]">{row.prices.standardFare}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.prices.i70FuelFare}</td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">다음 연결 지점</h2>
          </div>
          <div className="grid gap-px bg-[#243041]">
            {[
              ['review', '월 마감 전 승인/차액 확인'],
              ['claim-docs', '차량별 월 누계를 청구 문서로 연결'],
              ['등록 키', 'month + vehicle'],
              ['검증 포인트', '기사 교체 여부 / 유류 누락 / 회차 누락'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between bg-[#0b1220] px-4 py-4 text-sm">
                <span className="text-slate-300">{label}</span>
                <strong className="text-white">{value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>
    </CherryTmsShell>
  );
}
