'use client';

import { useState } from 'react';
import DashFloatingNav from '@/components/dash/DashFloatingNav';

type ViewMode = 'list' | 'table' | 'map';
type Destination = 'jincheon' | 'eumseong' | 'cheongju';
type ProjectStatus = 'running' | 'waiting' | 'scheduled';
type CellState = 'completed' | 'active' | 'scheduled';

const STATUS_CFG: Record<ProjectStatus, { label: string; color: string }> = {
  running:   { label: '운행중', color: '#3fb950' },
  waiting:   { label: '대기중', color: '#ff7700' },
  scheduled: { label: '예정',  color: '#8b949e' },
};

const CELL_CLS: Record<CellState, string> = {
  completed: 'bg-[#3fb950]/15 text-[#3fb950]',
  active:    'bg-[#58a6ff]/15 text-[#58a6ff] animate-pulse',
  scheduled: 'bg-[#21262d] text-[#8b949e]',
};

const ROW_STATUS_CLS: Record<string, string> = {
  '완료':  'text-[#3fb950] border-[#3fb950]',
  '운행중': 'text-[#58a6ff] border-[#58a6ff]',
  '대기':  'text-[#ff7700] border-[#ff7700]',
  '예정':  'text-[#8b949e] border-[#30363d]',
};

const PROJECTS = [
  { id: 1, code: 'P001', status: 'running'   as ProjectStatus, name: '진천 농장 A', dest: '진천 도축장', time: '06:00 ~ 14:30', count: 5, client: '체리부로', fullId: '20251224_P001' },
  { id: 2, code: 'P002', status: 'waiting'   as ProjectStatus, name: '음성 농장 B', dest: '음성 도축장', time: '07:00 ~ 15:00', count: 5, client: '체리부로', fullId: '20251224_P002' },
  { id: 3, code: 'P003', status: 'scheduled' as ProjectStatus, name: '청주 농장 C', dest: '청주 도축장', time: '13:00 ~ 18:30', count: 5, client: '체리부로', fullId: '20251224_P003' },
];

const LIST_GROUPS = [
  {
    idx: 1, name: '진천 도축장', summary: '배차: 5대 (25t:1, 5t:4)',
    vehicles: [
      { type: '5T',  color: '#58a6ff', plate: '123가4567', driver: '홍길동', depart: '06:00', arrive: '09:20' },
      { type: '5T',  color: '#58a6ff', plate: '456나7890', driver: '김철수', depart: '06:15', arrive: '09:35' },
      { type: '5T',  color: '#58a6ff', plate: '789다1234', driver: '이영희', depart: '06:30', arrive: '09:50' },
      { type: '25T', color: '#8b5cf6', plate: '234라5678', driver: '박민수', depart: '07:00', arrive: '10:20' },
      { type: '5T',  color: '#58a6ff', plate: '567마8901', driver: '정수진', depart: '07:30', arrive: '10:50' },
    ],
  },
  {
    idx: 2, name: '음성 도축장', summary: '배차: 3대 (5t:3)',
    vehicles: [
      { type: '5T', color: '#58a6ff', plate: '890바2345', driver: '최준혁', depart: '08:00', arrive: '11:20' },
      { type: '5T', color: '#58a6ff', plate: '345사6789', driver: '강민정', depart: '08:30', arrive: '11:50' },
      { type: '5T', color: '#58a6ff', plate: '678아9012', driver: '윤서연', depart: '09:00', arrive: '12:20' },
    ],
  },
  {
    idx: 3, name: '청주 도축장', summary: '배차: 2대 (25t:1, 5t:1)',
    vehicles: [
      { type: '25T', color: '#8b5cf6', plate: '901자3456', driver: '임태호', depart: '10:00', arrive: '13:30' },
      { type: '5T',  color: '#58a6ff', plate: '234차7890', driver: '한소희', depart: '10:30', arrive: '14:00' },
    ],
  },
];

interface TableRow {
  type: string; typeColor: string; plate: string; driver: string;
  depart: CellState; scale: CellState; sanitize: CellState; arrive: CellState;
  departTime: string; scaleTime: string; sanitizeTime: string; arriveTime: string;
  rowStatus: string;
}

const TABLE_GROUPS: { idx: number; name: string; summary: string; rows: TableRow[] }[] = [
  {
    idx: 1, name: '진천 도축장', summary: '배차: 5대 (25t:1, 5t:4)',
    rows: [
      { type: '5T',  typeColor: '#58a6ff', plate: '123가4567', driver: '홍길동', depart: 'completed', scale: 'completed', sanitize: 'completed', arrive: 'completed', departTime: '06:00', scaleTime: '06:35', sanitizeTime: '06:50', arriveTime: '09:20', rowStatus: '완료' },
      { type: '5T',  typeColor: '#58a6ff', plate: '456나7890', driver: '김철수', depart: 'completed', scale: 'completed', sanitize: 'active',    arrive: 'scheduled', departTime: '06:15', scaleTime: '06:50', sanitizeTime: '07:05', arriveTime: '09:35', rowStatus: '운행중' },
      { type: '5T',  typeColor: '#58a6ff', plate: '789다1234', driver: '이영희', depart: 'completed', scale: 'active',    sanitize: 'scheduled', arrive: 'scheduled', departTime: '06:30', scaleTime: '07:05', sanitizeTime: '07:20', arriveTime: '09:50', rowStatus: '운행중' },
      { type: '25T', typeColor: '#8b5cf6', plate: '234라5678', driver: '박민수', depart: 'completed', scale: 'scheduled', sanitize: 'scheduled', arrive: 'scheduled', departTime: '07:00', scaleTime: '07:35', sanitizeTime: '07:50', arriveTime: '10:20', rowStatus: '대기' },
      { type: '5T',  typeColor: '#58a6ff', plate: '567마8901', driver: '정수진', depart: 'scheduled', scale: 'scheduled', sanitize: 'scheduled', arrive: 'scheduled', departTime: '07:30', scaleTime: '08:05', sanitizeTime: '08:20', arriveTime: '10:50', rowStatus: '예정' },
    ],
  },
  {
    idx: 2, name: '음성 도축장', summary: '배차: 3대 (5t:3)',
    rows: [
      { type: '5T', typeColor: '#58a6ff', plate: '890바2345', driver: '최준혁', depart: 'scheduled', scale: 'scheduled', sanitize: 'scheduled', arrive: 'scheduled', departTime: '08:00', scaleTime: '08:35', sanitizeTime: '08:50', arriveTime: '11:20', rowStatus: '예정' },
      { type: '5T', typeColor: '#58a6ff', plate: '345사6789', driver: '강민정', depart: 'scheduled', scale: 'scheduled', sanitize: 'scheduled', arrive: 'scheduled', departTime: '08:30', scaleTime: '09:05', sanitizeTime: '09:20', arriveTime: '11:50', rowStatus: '예정' },
      { type: '5T', typeColor: '#58a6ff', plate: '678아9012', driver: '윤서연', depart: 'scheduled', scale: 'scheduled', sanitize: 'scheduled', arrive: 'scheduled', departTime: '09:00', scaleTime: '09:35', sanitizeTime: '09:50', arriveTime: '12:20', rowStatus: '예정' },
    ],
  },
  {
    idx: 3, name: '청주 도축장', summary: '배차: 2대 (25t:1, 5t:1)',
    rows: [
      { type: '25T', typeColor: '#8b5cf6', plate: '901자3456', driver: '임태호', depart: 'scheduled', scale: 'scheduled', sanitize: 'scheduled', arrive: 'scheduled', departTime: '10:00', scaleTime: '10:35', sanitizeTime: '10:50', arriveTime: '13:30', rowStatus: '예정' },
      { type: '5T',  typeColor: '#58a6ff', plate: '234차7890', driver: '한소희', depart: 'scheduled', scale: 'scheduled', sanitize: 'scheduled', arrive: 'scheduled', departTime: '10:30', scaleTime: '11:05', sanitizeTime: '11:20', arriveTime: '14:00', rowStatus: '예정' },
    ],
  },
];

interface DestInfo {
  name: string; count: string; color: string;
  endX: number; endY: number; routeColors: string[];
  vehicles: { plate: string; time: string }[];
}

const DEST_CONFIG: Record<Destination, DestInfo> = {
  jincheon: {
    name: '진천 도축장', count: '5대', color: '#58a6ff',
    endX: 450, endY: 180, routeColors: ['#58a6ff', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
    vehicles: [
      { plate: '123가4567 홍길동', time: '06:00 ~ 09:20' },
      { plate: '456나7890 김철수', time: '06:15 ~ 09:35' },
      { plate: '789다1234 이영희', time: '06:30 ~ 09:50' },
      { plate: '234라5678 박민수', time: '07:00 ~ 10:20' },
      { plate: '567마8901 정수진', time: '07:30 ~ 10:50' },
    ],
  },
  eumseong: {
    name: '음성 도축장', count: '3대', color: '#3fb950',
    endX: 550, endY: 320, routeColors: ['#3fb950', '#34d399', '#6ee7b7'],
    vehicles: [
      { plate: '890바2345 최준혁', time: '08:00 ~ 11:20' },
      { plate: '345사6789 강민정', time: '08:30 ~ 11:50' },
      { plate: '678아9012 윤서연', time: '09:00 ~ 12:20' },
    ],
  },
  cheongju: {
    name: '청주 도축장', count: '2대', color: '#8b5cf6',
    endX: 650, endY: 250, routeColors: ['#8b5cf6', '#a78bfa'],
    vehicles: [
      { plate: '901자3456 임태호', time: '10:00 ~ 13:30' },
      { plate: '234차7890 한소희', time: '10:30 ~ 14:00' },
    ],
  },
};

const DESTINATIONS: Destination[] = ['jincheon', 'eumseong', 'cheongju'];
const NAV_ITEMS = ['배차 관리', '실시간 차량 조회', '이동장소 관리', '차량 및 기사 관리', '고객사 관리', '사용자 관리'];
const VIEW_MODES: { mode: ViewMode; label: string }[] = [
  { mode: 'list',  label: '목록보기' },
  { mode: 'table', label: '표보기' },
  { mode: 'map',   label: '지도보기' },
];

export default function TmsSchedulePage() {
  const [selectedProjectId, setSelectedProjectId] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDest, setSelectedDest] = useState<Destination>('jincheon');

  const project = PROJECTS.find((p) => p.id === selectedProjectId) ?? PROJECTS[0];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0d1117] text-gray-100" data-poc-theme="dark">

      {/* Navbar */}
      <header className="flex-shrink-0 bg-[#161b22] border-b border-[#30363d] px-6 flex items-center justify-between" style={{ minHeight: 56 }}>
        <div className="flex items-center gap-6 h-14">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-[#c9d1d9] font-mono">TMS</span>
            <span className="text-[#3fb950] text-xs">Ver 2.0.0</span>
            <span className="text-[9px] font-mono border px-1 py-[1px] text-[#ff7700] border-[#ff7700]">PROTOTYPE</span>
          </div>
          <nav className="hidden xl:flex items-center h-full">
            {NAV_ITEMS.map((item, i) => (
              <button
                key={item}
                type="button"
                className={`px-3 h-full text-xs transition-colors border-b-2 ${
                  i === 0
                    ? 'text-[#58a6ff] border-[#58a6ff]'
                    : 'text-[#8b949e] border-transparent hover:text-[#c9d1d9]'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#21262d] border border-[#30363d] flex items-center justify-center">
              <span className="text-[11px] text-[#8b949e]">P</span>
            </div>
            <span className="text-xs text-[#c9d1d9]">파이프트리</span>
          </div>
          <button type="button" className="text-[11px] text-[#8b949e] hover:text-[#f85149] transition-colors">로그아웃</button>
        </div>
      </header>

      {/* Filter bar */}
      <div className="flex-shrink-0 bg-[#161b22] border-b border-[#30363d] px-4 py-2.5 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-0.5">
          <label className="text-[9px] text-[#8b949e] font-mono uppercase tracking-widest">작업일</label>
          <input
            type="date"
            defaultValue="2025-12-24"
            className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] text-xs px-2 py-1 outline-none focus:border-[#58a6ff] font-mono w-32"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-[9px] text-[#8b949e] font-mono uppercase tracking-widest">고객사</label>
          <select className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] text-xs px-2 py-1 outline-none focus:border-[#58a6ff] min-w-[120px]">
            <option>전체 고객사</option>
            <option>체리부로</option>
          </select>
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-[9px] text-[#8b949e] font-mono uppercase tracking-widest">차량 선택</label>
          <select className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] text-xs px-2 py-1 outline-none focus:border-[#58a6ff] min-w-[140px]">
            <option value="">전체 차량</option>
            <option>123가4567 (홍길동)</option>
            <option>456나7890 (김철수)</option>
            <option>789다1234 (이영희)</option>
          </select>
        </div>
        <button type="button" className="border border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#58a6ff]/60 px-3 py-1.5 text-xs transition-colors">
          검색
        </button>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar */}
        <aside className="w-72 flex-shrink-0 border-r border-[#30363d] bg-[#161b22] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#c9d1d9]">배차 목록</span>
              <span className="text-[9px] font-mono border border-[#58a6ff] text-[#58a6ff] px-1">3</span>
            </div>
            <span className="text-[10px] text-[#8b949e] font-mono">2025. 12. 24.</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {PROJECTS.map((p) => {
              const cfg = STATUS_CFG[p.status];
              const isSelected = selectedProjectId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`w-full text-left p-3 border-b border-[#30363d] transition-colors border-l-2 ${
                    isSelected ? 'bg-[#21262d] border-l-[#58a6ff]' : 'hover:bg-[#21262d] border-l-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                    <span className="text-[10px] text-[#8b949e] font-mono">{p.code}</span>
                  </div>
                  <p className="text-xs font-semibold text-[#c9d1d9] truncate mb-1">{p.name} - {p.dest}</p>
                  <div className="text-[10px] text-[#8b949e] font-mono flex items-center gap-2">
                    <span>{p.time}</span><span>·</span><span>{p.count}대</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right detail */}
        <section className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-shrink-0 flex items-start justify-between px-5 py-4 border-b border-[#30363d] bg-[#161b22]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[10px] font-semibold border px-1 py-[1px]"
                  style={{ color: STATUS_CFG[project.status].color, borderColor: STATUS_CFG[project.status].color }}
                >
                  {STATUS_CFG[project.status].label}
                </span>
                <span className="text-[10px] text-[#8b949e] font-mono">ID: {project.fullId}</span>
              </div>
              <h2 className="text-lg font-bold text-[#c9d1d9]">({project.client}) {project.name}</h2>
              <div className="flex gap-6 mt-2 text-[11px] text-[#8b949e]">
                <span>운행 시간: <span className="text-[#c9d1d9] font-mono">{project.time}</span></span>
                <span>도착지: <span className="text-[#c9d1d9]">{project.dest}</span></span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex border border-[#30363d]">
                {VIEW_MODES.map(({ mode, label }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1.5 text-xs transition-colors ${
                      viewMode === mode
                        ? 'bg-[#21262d] text-[#c9d1d9]'
                        : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button type="button" className="border border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9] px-3 py-1.5 text-xs transition-colors">
                엑셀 내보내기
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {viewMode === 'list'  && <ListView />}
            {viewMode === 'table' && <TableView />}
            {viewMode === 'map'   && <MapView selectedDest={selectedDest} onSelectDest={setSelectedDest} />}
          </div>
        </section>
      </div>

      <DashFloatingNav current="/tms/main" />
    </div>
  );
}

function ListView() {
  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="flex justify-between items-center mb-4">
        <p className="text-[10px] text-[#8b949e] font-mono uppercase tracking-widest">상세 배차 내역 (드라이버 할당)</p>
        <button type="button" className="border border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9] px-3 py-1.5 text-xs transition-colors">
          이동경로 확인
        </button>
      </div>
      <div className="space-y-3">
        {LIST_GROUPS.map((group) => (
          <div key={group.idx} className="bg-[#161b22] border border-[#30363d]">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#30363d]">
              <span className="w-5 h-5 bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[10px] font-mono text-[#8b949e]">
                {group.idx}
              </span>
              <span className="text-sm font-semibold text-[#c9d1d9]">{group.name}</span>
              <span className="text-[10px] text-[#8b949e] border border-[#30363d] px-1 py-[1px]">{group.summary}</span>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {group.vehicles.map((v) => (
                <button
                  key={v.plate}
                  type="button"
                  className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] px-3 py-2 hover:border-[#58a6ff]/60 transition-colors group"
                >
                  <span className="text-[9px] font-mono border px-1 leading-4" style={{ color: v.color, borderColor: v.color }}>
                    {v.type}
                  </span>
                  <span className="text-xs text-[#c9d1d9] group-hover:text-white transition-colors">
                    {v.plate} {v.driver}
                  </span>
                  <span className="text-[10px] text-[#8b949e] font-mono">({v.depart}, {v.arrive})</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableView() {
  return (
    <div className="h-full overflow-y-auto p-5">
      <p className="text-[10px] text-[#8b949e] font-mono uppercase tracking-widest mb-4">배차 차량 목록 (10대)</p>
      <div className="space-y-3">
        {TABLE_GROUPS.map((group) => (
          <div key={group.idx} className="bg-[#161b22] border border-[#30363d] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#30363d]">
              <span className="w-5 h-5 bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[10px] font-mono text-[#8b949e]">
                {group.idx}
              </span>
              <span className="text-sm font-semibold text-[#c9d1d9]">{group.name}</span>
              <span className="text-[10px] text-[#8b949e] border border-[#30363d] px-1 py-[1px]">{group.summary}</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#30363d] bg-[#0d1117]">
                  <th className="text-left px-4 py-2 text-[10px] font-semibold text-[#8b949e] w-44">차량 / 기사</th>
                  <th className="text-center px-4 py-2 text-[10px] font-semibold text-[#8b949e]">농장 출발</th>
                  <th className="text-center px-4 py-2 text-[10px] font-semibold text-[#8b949e]">계근소</th>
                  <th className="text-center px-4 py-2 text-[10px] font-semibold text-[#8b949e]">소독소</th>
                  <th className="text-center px-4 py-2 text-[10px] font-semibold text-[#8b949e]">도축장 도착</th>
                  <th className="text-center px-4 py-2 text-[10px] font-semibold text-[#8b949e] w-20">상태</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row, i) => (
                  <tr
                    key={row.plate}
                    className={`hover:bg-[#21262d]/50 transition-colors ${i < group.rows.length - 1 ? 'border-b border-[#30363d]' : ''}`}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono border px-1 leading-4" style={{ color: row.typeColor, borderColor: row.typeColor }}>
                          {row.type}
                        </span>
                        <div>
                          <div className="text-[11px] text-[#c9d1d9] font-semibold">{row.plate}</div>
                          <div className="text-[10px] text-[#8b949e]">{row.driver}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center px-4 py-2.5">
                      <span className={`text-[10px] font-mono px-2 py-1 ${CELL_CLS[row.depart]}`}>{row.departTime}</span>
                    </td>
                    <td className="text-center px-4 py-2.5">
                      <span className={`text-[10px] font-mono px-2 py-1 ${CELL_CLS[row.scale]}`}>{row.scaleTime}</span>
                    </td>
                    <td className="text-center px-4 py-2.5">
                      <span className={`text-[10px] font-mono px-2 py-1 ${CELL_CLS[row.sanitize]}`}>{row.sanitizeTime}</span>
                    </td>
                    <td className="text-center px-4 py-2.5">
                      <span className={`text-[10px] font-mono px-2 py-1 ${CELL_CLS[row.arrive]}`}>{row.arriveTime}</span>
                    </td>
                    <td className="text-center px-4 py-2.5">
                      <span className={`text-[9px] font-semibold border px-1 py-[1px] ${ROW_STATUS_CLS[row.rowStatus] ?? ROW_STATUS_CLS['예정']}`}>
                        {row.rowStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapView({
  selectedDest,
  onSelectDest,
}: {
  selectedDest: Destination;
  onSelectDest: (d: Destination) => void;
}) {
  const dest = DEST_CONFIG[selectedDest];

  return (
    <div
      className="h-full relative overflow-hidden bg-[#0b1017]"
      style={{
        backgroundImage: 'radial-gradient(#21262d 1px, transparent 1px), linear-gradient(to right, #161b22 1px, transparent 1px), linear-gradient(to bottom, #161b22 1px, transparent 1px)',
        backgroundSize: '20px 20px, 40px 40px, 40px 40px',
      }}
    >
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {dest.routeColors.map((color, i) => (
          <path
            key={i}
            d={`M 150 200 Q ${280 + i * 40} ${150 + i * 30} ${dest.endX} ${dest.endY}`}
            fill="none"
            stroke={color}
            strokeDasharray="8 4"
            strokeWidth={i === 0 ? 3 : 2}
            opacity={i === 0 ? 0.8 : Math.max(0.3, 0.65 - i * 0.08)}
          />
        ))}
      </svg>

      {/* Origin marker */}
      <div className="absolute flex flex-col items-center" style={{ left: 118, top: 184 }}>
        <div className="w-3 h-3 rounded-full bg-[#3fb950] border-2 border-[#0d1117]" />
        <div className="bg-[#161b22] border border-[#30363d] px-2 py-0.5 mt-1 text-[10px] text-[#c9d1d9] font-mono whitespace-nowrap">
          진천 농장 A
        </div>
      </div>

      {/* Destination marker */}
      <div className="absolute flex flex-col items-center" style={{ left: dest.endX - 6, top: dest.endY - 6 }}>
        <div className="w-3 h-3 rounded-full border-2 border-[#0d1117]" style={{ backgroundColor: dest.color }} />
        <div className="bg-[#161b22] border border-[#30363d] px-2 py-0.5 mt-1 text-[10px] font-mono whitespace-nowrap" style={{ color: dest.color }}>
          {dest.name}
        </div>
      </div>

      {/* Destination selector (top-left) */}
      <div className="absolute left-4 top-4 bg-[#161b22] border border-[#30363d] w-52 shadow-xl">
        <div className="px-3 py-2 border-b border-[#30363d]">
          <span className="text-[9px] text-[#8b949e] font-mono uppercase tracking-widest">도착지 선택</span>
        </div>
        <div className="p-1.5 flex flex-col gap-0.5">
          {DESTINATIONS.map((key) => {
            const cfg = DEST_CONFIG[key];
            const isActive = selectedDest === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectDest(key)}
                className={`flex items-center gap-3 px-2.5 py-2 text-left transition-colors ${
                  isActive ? 'bg-[#21262d]' : 'hover:bg-[#21262d]'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                <div className="flex-1">
                  <div className="text-[11px] text-[#c9d1d9] font-semibold">{cfg.name}</div>
                  <div className="text-[9px] text-[#8b949e]">{cfg.count} 배차</div>
                </div>
                {isActive && <span className="text-[8px]" style={{ color: cfg.color }}>●</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vehicle info panel (bottom-right) */}
      <div className="absolute right-4 bottom-4 bg-[#161b22] border border-[#30363d] w-64 shadow-xl">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363d]">
          <span className="text-[11px] text-[#c9d1d9] font-semibold">{dest.name} 차량</span>
          <span className="text-[9px] font-mono border px-1 py-[1px]" style={{ color: dest.color, borderColor: dest.color }}>
            {dest.count}
          </span>
        </div>
        <div className="p-2 space-y-1 max-h-44 overflow-y-auto">
          {dest.vehicles.map((v) => (
            <div key={v.plate} className="flex justify-between items-center bg-[#0d1117] px-2 py-1.5">
              <span className="text-[10px] text-[#c9d1d9]">{v.plate}</span>
              <span className="text-[10px] text-[#8b949e] font-mono">{v.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
