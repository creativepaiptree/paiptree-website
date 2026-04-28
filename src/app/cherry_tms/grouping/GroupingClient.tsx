'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

import { CherryTmsShell } from '../_shared';
import { GroupingTable } from './_GroupingTable';
import type { CherryTmsGroupingPageData, CherryTmsGroupingRow } from '@/lib/cherryTmsGroupings';


const buildGroupingHref = (month?: string | null, date?: string | null, theme?: string | null) => {
  const params = new URLSearchParams();
  if (month) params.set('month', month);
  if (date) params.set('date', date);
  if (theme === 'light') params.set('theme', 'light');
  const query = params.toString();
  return query ? `/cherry_tms/grouping/?${query}` : '/cherry_tms/grouping/';
};

const fallbackGroupingStats = [
  { label: '원천 헤더', value: '314건', hint: 'tbl_tms_transport 기준' },
  { label: '차량 실행행', value: '4,118건', hint: 'tbl_tms_transport_car 기준' },
  { label: '상세 경로행', value: '369건', hint: 'tbl_tms_transport_detail 기준' },
  { label: '정산 후보', value: '42묶음', hint: '기사·차량·일자 기준 가공 단위' },
];

const actionButtons = ['자동 묶음 재실행', '정렬 재계산', '예외 내보내기', '묶음 확정'];

const normalizeMonth = (value?: string | null) => (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value.trim()) ? value.trim() : null);
const normalizeDate = (value?: string | null) => (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim()) ? value.trim() : null);

const getRowsForSelection = (rows: CherryTmsGroupingRow[], month: string | null, date: string | null) => {
  if (date) {
    return rows.filter((row) => row.groupingDate === date);
  }
  if (month) {
    return rows.filter((row) => row.groupingDate?.startsWith(month));
  }
  return rows;
};

export function CherryTmsGroupingClient({
  data,
  fallbackRows,
}: {
  data: CherryTmsGroupingPageData | null;
  fallbackRows: CherryTmsGroupingRow[];
}) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const monthParam = normalizeMonth(searchParams.get('month'));
  const dateParam = normalizeDate(searchParams.get('date'));
  const hasSupabaseData = data !== null;
  const rowsForBase = hasSupabaseData ? data.rows : fallbackRows;
  const selectedMonth = monthParam ?? dateParam?.slice(0, 7) ?? data?.availableMonths[0] ?? null;
  const selectedDateForInput = dateParam ?? '';
  const filteredRows = useMemo(() => getRowsForSelection(rowsForBase, monthParam, dateParam), [rowsForBase, monthParam, dateParam]);
  const visibleMonths = hasSupabaseData ? data.availableMonths : [];
  const visibleDates = hasSupabaseData && selectedMonth ? data.availableGroupingDates.filter((date) => date.startsWith(selectedMonth)) : data?.availableGroupingDates ?? [];
  const currentSourceRowCount = filteredRows.reduce((sum, row) => sum + row.details.length, 0);
  const currentManualReviewCount = filteredRows.reduce((sum, row) => sum + row.details.filter((detail) => detail.judgement !== '정상').length, 0);
  const groupingStats = hasSupabaseData
    ? [
        { label: '원천 행', value: `${currentSourceRowCount.toLocaleString('ko-KR')}건`, hint: '현재 월/날짜 필터 기준 원천행' },
        { label: '묶음 후보', value: `${filteredRows.length.toLocaleString('ko-KR')}건`, hint: '현재 필터 기준 row 수' },
        { label: '상세 행', value: `${currentSourceRowCount.toLocaleString('ko-KR')}건`, hint: '현재 필터 기준 detail row total' },
        { label: '수동 확인', value: `${currentManualReviewCount.toLocaleString('ko-KR')}건`, hint: '현재 필터의 검토 필요 rows' },
      ]
    : fallbackGroupingStats;

  return (
    <CherryTmsShell
      current="grouping"
      eyebrow="Cherrybro TMS / Grouping"
      title="기사/차량 기준 묶음 생성 및 순서 점검"
      description="이 단계는 tms의 transport_detail과 transport_car 원천행을 기사·차량·운행일 기준으로 묶고, 지역·중량·차량/기사 매칭을 확인해 tms_settlement 등록 후보로 넘기는 작업표입니다."
    >
      {hasSupabaseData ? (
        <section className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">월 / 날짜 필터</h2>
          </div>
          <div className="space-y-4 px-4 py-4">
            <form action="/cherry_tms/grouping/" className="grid gap-3 md:grid-cols-[180px_180px_auto_auto]">
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
                <span className="uppercase tracking-[0.16em] text-slate-500">일자 직접 선택</span>
                <input
                  name="date"
                  type="date"
                  defaultValue={selectedDateForInput}
                  className="border border-[#314056] bg-[#0a1019] px-3 py-2 text-sm text-slate-100 outline-none [color-scheme:dark] focus:border-[#4D7CFF]"
                />
              </label>
              <button type="submit" className="self-end border border-[#4D7CFF] bg-[#1c2c52] px-4 py-2 text-sm text-white transition hover:bg-[#223664]">
                필터 적용
              </button>
              <Link href={buildGroupingHref(null, null, theme)} className="self-end border border-[#314056] bg-[#0a1019] px-4 py-2 text-center text-sm text-slate-200 transition hover:bg-white/5">
                전체 보기
              </Link>
            </form>

            <div className="grid gap-3 xl:grid-cols-2">
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-slate-500">데이터가 있는 월</p>
                <div className="flex flex-wrap gap-2">
                  {visibleMonths.map((month) => (
                    <Link
                      key={month}
                      href={monthParam === month && !dateParam ? buildGroupingHref(null, null, theme) : buildGroupingHref(month, null, theme)}
                      className={`border px-3 py-2 text-sm transition ${selectedMonth === month && (monthParam || dateParam) ? 'border-[#4D7CFF] bg-[#1c2c52] text-white' : 'border-[#314056] bg-[#0a1019] text-slate-200 hover:bg-white/5'}`}
                    >
                      {month}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-slate-500">선택 월의 데이터 일자</p>
                <div className="flex flex-wrap gap-2">
                  <Link href={buildGroupingHref(selectedMonth, null, theme)} className={`border px-3 py-2 text-sm transition ${!dateParam ? 'border-[#4D7CFF] bg-[#1c2c52] text-white' : 'border-[#314056] bg-[#0a1019] text-slate-200 hover:bg-white/5'}`}>
                    월전체
                  </Link>
                  {visibleDates.map((date) => (
                    <Link
                      key={date}
                      href={dateParam === date ? buildGroupingHref(selectedMonth, null, theme) : buildGroupingHref(selectedMonth, date, theme)}
                      className={`border px-3 py-2 text-sm transition ${dateParam === date ? 'border-[#4D7CFF] bg-[#1c2c52] text-white' : 'border-[#314056] bg-[#0a1019] text-slate-200 hover:bg-white/5'}`}
                    >
                      {date}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-xs leading-5 text-slate-400">
              직접 입력은 아직 데이터가 없는 월/일도 조회할 수 있습니다. 아래 빠른 버튼은 Supabase view에 실제 grouping row가 있는 월/일만 보여줍니다.
            </div>
          </div>
        </section>
      ) : null}

      <section className="border border-[#243041] bg-[#0b1220]">
        <div className="cherry-light-header border-b border-[#243041] bg-[#0f1722] px-4 py-3">
          <h2 className="text-lg font-semibold text-white">묶음 생성 실행 바</h2>
        </div>
        <div className="grid gap-3 px-4 py-4 md:grid-cols-2 xl:grid-cols-6">
          {[
            ['기준일자', dateParam ?? selectedMonth ?? data?.groupingDate ?? '-'],
            ['원천 테이블', 'detail + car'],
            ['묶음 키', 'work_date + driver'],
            ['정렬 필드', 'origin/weight/destination'],
            ['운영 모드', hasSupabaseData ? '실데이터' : '샘플'],
            ['현재 상태', `${filteredRows.length.toLocaleString('ko-KR')}건`],
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
                  index === 0 ? 'cherry-light-active border-[#4D7CFF] bg-[#1c2c52] text-white hover:bg-[#223664]' : 'border-[#314056] bg-[#0a1019] text-slate-200 hover:bg-white/5'
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

      {hasSupabaseData && filteredRows.length === 0 ? (
        <section className="border border-[#243041] bg-[#0b1220] px-4 py-4 text-sm text-slate-300">
          <div className="font-medium text-white">필터 결과 없음</div>
          <div className="mt-2 text-slate-400">선택한 월/날짜에 해당하는 grouping row가 아직 없습니다. 다른 날짜를 선택하거나 전체로 돌아가세요.</div>
        </section>
      ) : null}

      <section className="border border-[#243041] bg-[#0b1220]">
        <div className="cherry-light-header border-b border-[#243041] bg-[#0f1722] px-4 py-3">
          <h2 className="text-lg font-semibold text-white">묶음 생성 메인 테이블</h2>
        </div>
        <GroupingTable rows={filteredRows} />
      </section>
    </CherryTmsShell>
  );
}
