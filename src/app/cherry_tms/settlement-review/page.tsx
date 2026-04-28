import type { Metadata } from 'next';
import Link from 'next/link';

import { CherryTmsShell } from '../_shared';

export const metadata: Metadata = {
  title: 'Cherrybro TMS Settlement Review',
  description: '일별/월별/기사별 정산 검토 화면',
};

const reviewStats = [
  { label: '검토 기준 테이블', value: 'dispatch_settlement', hint: '일자·차량·회차·지역별 결과 row' },
  { label: '집계 축', value: '4개', hint: 'dispatch_dt / vehicle_no / driver / region_id' },
  { label: '상태 보강 필요', value: '필요', hint: '승인·반려·월마감 컬럼은 별도 설계 후보' },
  { label: '다음 단계', value: 'claim-docs', hint: '승인 완료 row만 문서 생성 후보' },
];

const filterButtons = ['일별', '월별', '기사별', '차량별'];

const reviewRows = [
  {
    basis: '일별',
    groupKey: 'dispatch_dt',
    target: '2026-04-23',
    rows: '42묶음',
    source: 'tbl_tms_cherrybro_dispatch_settlement',
    amount: '수당 합산',
    diff: '계약 기준 대비',
    status: '승인대기',
  },
  {
    basis: '월별',
    groupKey: 'dispatch_dt 월 집계',
    target: '2026-04',
    rows: '마감 후보',
    source: 'dispatch_settlement + fuel_settlement',
    amount: '월 누계',
    diff: '청구 후보',
    status: '월마감전',
  },
  {
    basis: '기사별',
    groupKey: 'driver1 / driver2 / vehicle.driver_nm',
    target: '남명규',
    rows: '기사별 묶음',
    source: 'dispatch_settlement + vehicle',
    amount: '기사 지급 후보',
    diff: '이상치 확인',
    status: '차액확인',
  },
  {
    basis: '차량별',
    groupKey: 'vehicle_no',
    target: '경기96자1710',
    rows: '차량별 묶음',
    source: 'dispatch_settlement + vehicle_type',
    amount: '차량별 지급 후보',
    diff: '유류/운임 비교',
    status: '보정보류',
  },
  {
    basis: '지역별',
    groupKey: 'region_id',
    target: '용인→동서울',
    rows: '지역별 묶음',
    source: 'dispatch_settlement + region',
    amount: '지역 운임 합산',
    diff: '거리 기준 비교',
    status: '검토필요',
  },
];

const reviewChecks = [
  ['검토 대상 row', 'dispatch_dt + vehicle_no + trip_no + region_id'],
  ['필수 집계 축', '일별 / 월별 / 기사별 / 차량별 / 지역별'],
  ['금액 원천', 'dispatch_settlement 수당·운임 결과'],
  ['유류 원천', 'fuel_settlement 월별 차량 유류'],
  ['상태 처리', '현재 DB 컬럼 보강 필요'],
  ['다음 액션', '승인 후 claim-docs 또는 register 복귀'],
];

const detailRows = [
  ['2026-04-23', '경기96자1574', '1', '용인→동서울', 'region_id', '승인대기'],
  ['2026-04-23', '경기96자1710', '1', '정읍→광주', 'region_id', '검토대기'],
  ['2026-04-23', '경기95자3335', '2', '부산→양산', 'region_id', '보정필요'],
];

const reviewNotes = [
  '검토 화면은 입력이 아니라 dispatch_settlement 결과 row의 승인/반려 단계다.',
  '맥락 충돌 방지를 위해 tms 원천 DB에는 직접 연결하거나 쓰지 않는다.',
  '보정 필요 건은 settlement-register로 되돌려 별도 정산 DB row를 다시 계산한다.',
  '월마감/승인/반려 상태는 현재 스키마에 명확하지 않아 추가 상태 테이블 또는 컬럼 설계가 필요하다.',
];

const actionButtons = ['승인', 'register로 되돌리기', '차액 메모 추가', '월마감 후보 반영'];

export default function CherryTmsSettlementReviewPage() {
  return (
    <CherryTmsShell
      current="settlement-review"
      eyebrow="Cherrybro TMS / Settlement Review"
      title="일별 / 월별 / 기사별 정산 검토 및 승인"
      description="등록 단계에서 만든 dispatch_settlement 저장 단위를 일별·월별·기사별·차량별·지역별로 검토하는 화면입니다. 공유 TMS DB에 직접 연결하지 않고, 확인된 구조만 기준으로 검토 축을 정리합니다."
    >
      <section className="border border-[#243041] bg-[#0b1220]">
        <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
          <h2 className="text-lg font-semibold text-white">검토 실행 바</h2>
        </div>
        <div className="grid gap-3 px-4 py-4 md:grid-cols-2 xl:grid-cols-6">
          {[
            ['기준일자', '2026-04-23'],
            ['기준 축', '일별 / 월별 / 기사별 / 차량별'],
            ['현재 선택', 'dispatch_dt 2026-04-23'],
            ['검토 목적', 'dispatch_settlement 결과 승인'],
            ['현재 상태', '상태 컬럼 보강 필요'],
            ['다음 단계', 'claim-docs 또는 register 복귀'],
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
                  index === 0
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
        {reviewStats.map((item) => (
          <article key={item.label} className="bg-[#0b1220] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">{item.hint}</p>
          </article>
        ))}
      </section>

      <section className="border border-[#243041] bg-[#0b1220]">
        <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
          <h2 className="text-lg font-semibold text-white">조회 축 전환</h2>
        </div>
        <div className="flex flex-wrap gap-2 px-4 py-4 text-sm">
          {filterButtons.map((item, index) => (
            <button
              key={item}
              type="button"
              className={`border px-3 py-2 transition ${
                index === 2 ? 'border-[#4D7CFF] bg-[#1c2c52] text-white' : 'border-[#314056] bg-[#0a1019] text-slate-300 hover:bg-white/5'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_minmax(360px,0.8fr)]">
        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">검토 리스트</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-[#111a27] text-slate-400">
                <tr>
                  {['기준', '집계 키', '대상', 'row 범위', '원천 테이블', '금액 해석', '상태'].map((head) => (
                    <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reviewRows.map((row) => (
                  <tr key={row.basis + row.target} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.basis}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#9ab6ff]">{row.groupKey}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-white">{row.target}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.rows}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.source}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.amount}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-amber-300">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">선택 기준 요약</h2>
              <Link href="/cherry_tms/monthly-vehicle" className="border border-[#314056] bg-[#0a1019] px-3 py-2 text-xs text-slate-200 transition hover:bg-white/5">
                월별 차량 내역 보기
              </Link>
            </div>
          </div>
          <div className="grid gap-px bg-[#243041]">
            {reviewChecks.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between bg-[#0b1220] px-4 py-4 text-sm">
                <span className="text-slate-300">{label}</span>
                <strong className={label === '차액' || label === '검토 상태' ? 'text-[#9ab6ff]' : 'text-white'}>{value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">상세 행 비교</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-[#111a27] text-slate-400">
                <tr>
                  {['배차일', '차량', '회차', '지역', '지역 키', '검토 상태'].map((head) => (
                    <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detailRows.map((row) => (
                  <tr key={row[0] + row[1]} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                    {row.map((cell, index) => (
                      <td key={`${row[0]}-${index}`} className={`px-4 py-3 ${index === 1 ? 'text-white' : 'text-slate-300'}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">검토 메모 / 운영 규칙</h2>
          </div>
          <div className="grid gap-px bg-[#243041]">
            {reviewNotes.map((item) => (
              <div key={item} className="bg-[#0b1220] px-4 py-4 text-sm leading-6 text-slate-300">{item}</div>
            ))}
          </div>
        </article>
      </section>
    </CherryTmsShell>
  );
}
