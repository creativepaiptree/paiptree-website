import type { Metadata } from 'next';

import { CherryTmsShell } from '../_shared';

export const metadata: Metadata = {
  title: 'Cherrybro TMS Intake',
  description: '전일 운행 조회 및 DB 적재 화면',
};

const intakeStats = [
  { label: 'tms 운송 헤더', value: '314건', hint: 'tbl_tms_transport 근사 row' },
  { label: '실행 차량행', value: '4,118건', hint: 'tbl_tms_transport_car 기준' },
  { label: '운송 상세행', value: '369건', hint: 'tbl_tms_transport_detail 기준' },
  { label: '미매핑 후보', value: '확인필요', hint: 'location/car/driver -1 또는 null 점검' },
];

const transportRows = [
  {
    table: 'tbl_tms_transport',
    key: 'transport_id',
    dateField: 'work_date',
    typeField: 'transport_input_type',
    statusField: 'transport_status_client / transport_status_work',
    pageRole: '운송 헤더, ERP/MANUAL 원천 반입 단위',
  },
  {
    table: 'tbl_tms_transport_detail',
    key: 'transport_id + transport_seq',
    dateField: 'origin_time / destination_time',
    typeField: 'location_no_origin/weight/destination',
    statusField: 'detail_status_work',
    pageRole: '경로·계근·도착지·출고량 원천 상세행',
  },
  {
    table: 'tbl_tms_transport_car',
    key: 'transport_id + transport_seq + car_seq',
    dateField: 'origin_time / destination_time / car_loaded_time',
    typeField: 'car_no / driver_no',
    statusField: 'car_status_work',
    pageRole: '차량·기사·중량 실행행, grouping 후보',
  },
];

const dbRows = [
  ['tbl_tms_car', '137건', 'car_number', '차량번호·소유·톤급 기준정보'],
  ['tbl_tms_driver', '136건', 'driver_name / driver_tel', '기사 매칭 기준정보'],
  ['tbl_tms_location', '313건', 'location_type / location_name', '출발·세척·계근·도착 위치 기준정보'],
  ['tbl_tms_enum', '118건', '상태 enum', 'ERP/MANUAL, 작업상태, 차량구분 코드'],
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
      description="이 단계는 실제 tms 스키마의 운송 헤더·상세·차량 실행행을 기준으로 전일 운행 데이터를 확인하고, grouping으로 넘길 수 있는 원천 row를 정리하는 운영 화면입니다."
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
            ['원천 테이블', 'transport / detail / car'],
            ['현재 상태', 'tms 원천 구조 확인 / 미매핑 점검'],
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
            <h2 className="text-lg font-semibold text-white">tms 원천 테이블 매칭</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-[#111a27] text-slate-400">
                <tr>
                  {['테이블', '키', '일자/시간 필드', '구분 필드', '화면 역할'].map((head) => (
                    <th key={head} className="border-b border-[#243041] px-4 py-3 font-medium whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transportRows.map((row) => (
                  <tr key={row.table} className="border-b border-[#1b2636] text-slate-200 last:border-b-0">
                    <td className="px-4 py-3 whitespace-nowrap text-white">{row.table}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.key}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.dateField}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#9ab6ff]">{row.typeField}</td>
                    <td className="px-4 py-3 text-slate-300">{row.pageRole}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="border border-[#243041] bg-[#0b1220]">
          <div className="border-b border-[#243041] bg-[#0f1722] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">기준정보 매칭</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-[#111a27] text-slate-400">
                <tr>
                  {['테이블', '근사 row', '핵심 필드', '화면 사용처'].map((head) => (
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
                    <td className="px-4 py-3 text-slate-300">{row[3]}</td>
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
