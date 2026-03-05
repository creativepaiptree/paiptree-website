'use client';

import { useState } from 'react';
import DashFloatingNav from '@/components/dash/DashFloatingNav';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FarmCamera {
  id: string;
  farmName: string;
  farmCode: string;
  cameraId: string;
  cameraModel: string;
  installDate: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  checkerStatus: 'calibrated' | 'pending' | 'needs_adjustment';
  lastCalibration: string | null;
  zeroPointX: number | null;
  zeroPointY: number | null;
  notes: string;
}

type CameraStatus = FarmCamera['status'];
type CheckerStatus = FarmCamera['checkerStatus'];
type ViewMode = 'table' | 'graph';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<CameraStatus, { label: string; color: string; bg: string; border: string }> = {
  active:      { label: 'ACTIVE',      color: '#3fb950', bg: 'rgba(63,185,80,0.1)',   border: 'rgba(63,185,80,0.3)'   },
  inactive:    { label: 'INACTIVE',    color: '#8b949e', bg: 'rgba(139,148,158,0.1)', border: 'rgba(139,148,158,0.3)' },
  maintenance: { label: 'MAINTENANCE', color: '#ff7700', bg: 'rgba(255,119,0,0.1)',   border: 'rgba(255,119,0,0.3)'   },
  error:       { label: 'ERROR',       color: '#f85149', bg: 'rgba(248,81,73,0.1)',   border: 'rgba(248,81,73,0.3)'   },
};

const CHECKER_CFG: Record<CheckerStatus, { label: string; color: string; bg: string; border: string }> = {
  calibrated:       { label: 'CALIBRATED', color: '#58a6ff', bg: 'rgba(88,166,255,0.1)',  border: 'rgba(88,166,255,0.3)'  },
  pending:          { label: 'PENDING',    color: '#8b949e', bg: 'rgba(139,148,158,0.1)', border: 'rgba(139,148,158,0.3)' },
  needs_adjustment: { label: 'ADJUST',     color: '#ff7700', bg: 'rgba(255,119,0,0.1)',   border: 'rgba(255,119,0,0.3)'   },
};

// ─── Static data ──────────────────────────────────────────────────────────────
const CAMERAS: FarmCamera[] = [
  {
    id: 'cam-001', farmName: '청송 사과농장', farmCode: 'CS-APL-001',
    cameraId: 'CAM-CS-001', cameraModel: 'AXIS P3245-V', installDate: '2024-03-15',
    status: 'active', checkerStatus: 'calibrated', lastCalibration: '2024-12-20',
    zeroPointX: 1920, zeroPointY: 1080, notes: '정상 운영 중',
  },
  {
    id: 'cam-002', farmName: '청송 사과농장', farmCode: 'CS-APL-001',
    cameraId: 'CAM-CS-002', cameraModel: 'AXIS P3245-V', installDate: '2024-03-15',
    status: 'active', checkerStatus: 'needs_adjustment', lastCalibration: '2024-11-10',
    zeroPointX: 1918, zeroPointY: 1082, notes: '영점 재조정 필요',
  },
  {
    id: 'cam-003', farmName: '안동 배농장', farmCode: 'AD-PER-001',
    cameraId: 'CAM-AD-001', cameraModel: 'Hikvision DS-2CD2T47', installDate: '2024-05-20',
    status: 'active', checkerStatus: 'calibrated', lastCalibration: '2025-01-05',
    zeroPointX: 2560, zeroPointY: 1440, notes: '',
  },
  {
    id: 'cam-004', farmName: '안동 배농장', farmCode: 'AD-PER-001',
    cameraId: 'CAM-AD-002', cameraModel: 'Hikvision DS-2CD2T47', installDate: '2024-05-20',
    status: 'maintenance', checkerStatus: 'pending', lastCalibration: null,
    zeroPointX: null, zeroPointY: null, notes: '렌즈 교체 예정',
  },
  {
    id: 'cam-005', farmName: '영주 포도농장', farmCode: 'YJ-GRP-001',
    cameraId: 'CAM-YJ-001', cameraModel: 'AXIS P3245-V', installDate: '2024-07-10',
    status: 'error', checkerStatus: 'needs_adjustment', lastCalibration: '2024-09-15',
    zeroPointX: 1920, zeroPointY: 1078, notes: '네트워크 연결 불안정',
  },
  {
    id: 'cam-006', farmName: '문경 복숭아농장', farmCode: 'MG-PCH-001',
    cameraId: 'CAM-MG-001', cameraModel: 'Dahua IPC-HFW5442T', installDate: '2024-08-25',
    status: 'inactive', checkerStatus: 'pending', lastCalibration: null,
    zeroPointX: null, zeroPointY: null, notes: '겨울철 운휴',
  },
  {
    id: 'cam-007', farmName: '상주 감농장', farmCode: 'SJ-PSM-001',
    cameraId: 'CAM-SJ-001', cameraModel: 'AXIS P3245-V', installDate: '2024-09-01',
    status: 'active', checkerStatus: 'calibrated', lastCalibration: '2025-01-20',
    zeroPointX: 1920, zeroPointY: 1080, notes: '신규 설치 완료',
  },
  {
    id: 'cam-008', farmName: '예천 토마토농장', farmCode: 'YC-TMT-001',
    cameraId: 'CAM-YC-001', cameraModel: 'Hikvision DS-2CD2T47', installDate: '2024-10-15',
    status: 'active', checkerStatus: 'calibrated', lastCalibration: '2025-01-15',
    zeroPointX: 2560, zeroPointY: 1440, notes: '하우스 내부 설치',
  },
];

const LOG_ENTRIES = [
  { timestamp: '14:22:01', level: 'INFO',    message: 'System health check completed. All nodes responding.' },
  { timestamp: '14:22:05', level: 'SUCCESS', message: 'Camera sync complete. 5 cameras online.' },
  { timestamp: '14:23:12', level: 'WARN',    message: 'CAM-YJ-001 reporting high packet loss. Investigating...' },
  { timestamp: '14:24:00', level: 'INFO',    message: 'Calibration data updated for CAM-SJ-001.' },
];

const GRAPH_FARM_NODES = [
  { left: 130, top: 260, code: 'CS-APL-001', sub: '2 Cameras', nodeColor: '#3fb950', borderColor: '#3fb950' },
  { left: 340, top: 260, code: 'AD-PER-001', sub: '1 Maint',   nodeColor: '#3fb950', borderColor: '#ff7700' },
  { left: 520, top: 260, code: 'YJ-GRP-001', sub: 'Error',     nodeColor: '#f85149', borderColor: '#f85149' },
  { left: 680, top: 260, code: 'MG-PCH-001', sub: 'Offline',   nodeColor: '#6e7681', borderColor: '#30363d' },
];

function getStats(cameras: FarmCamera[]) {
  return {
    total:          cameras.length,
    active:         cameras.filter(c => c.status === 'active').length,
    maintenance:    cameras.filter(c => c.status === 'maintenance').length,
    error:          cameras.filter(c => c.status === 'error').length,
    calibrated:     cameras.filter(c => c.checkerStatus === 'calibrated').length,
    needsAdjustment: cameras.filter(c => c.checkerStatus === 'needs_adjustment').length,
  };
}

// ─── Inline MetricCard ────────────────────────────────────────────────────────
function MetricCard({ title, value, subtext, icon, valueColor }: {
  title: string;
  value: number;
  subtext: string;
  icon: string;
  valueColor: string;
}) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] p-3 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-[#6e7681] uppercase tracking-widest">{title}</span>
        <span className="text-sm text-[#6e7681]">{icon}</span>
      </div>
      <span className="text-2xl font-bold font-mono" style={{ color: valueColor }}>{value}</span>
      <span className="text-[10px] text-[#8b949e] font-mono">{subtext}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FarmPage() {
  const [viewMode, setViewMode]           = useState<ViewMode>('table');
  const [filterStatus, setFilterStatus]   = useState<CameraStatus | 'all'>('all');
  const [selectedCamera, setSelectedCamera] = useState<FarmCamera | null>(null);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const stats = getStats(CAMERAS);
  const filteredCameras = filterStatus === 'all'
    ? CAMERAS
    : CAMERAS.filter(c => c.status === filterStatus);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden bg-[#0d1117] text-[#c9d1d9]"
      data-poc-theme="dark"
    >
      {/* ─ Header ─────────────────────────────────────────────────────────── */}
      <header className="shrink-0 h-14 flex items-center justify-between px-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold font-mono text-[#c9d1d9]">Farm Operations</span>
          <span className="px-1 py-[1px] text-[10px] font-mono border border-[#ff7700] text-[#ff7700]">PROTOTYPE</span>
        </div>
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex border border-[#30363d] overflow-hidden">
            {(['table', 'graph'] as ViewMode[]).map((mode, i) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs font-mono transition-colors capitalize ${
                  i > 0 ? 'border-l border-[#30363d]' : ''
                } ${
                  viewMode === mode
                    ? 'bg-[#58a6ff]/15 text-[#58a6ff]'
                    : 'text-[#6e7681] hover:text-[#c9d1d9] hover:bg-[#21262d]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as CameraStatus | 'all')}
            className="h-7 px-2 bg-[#0d1117] border border-[#30363d] text-xs text-[#c9d1d9] outline-none focus:border-[#58a6ff] font-mono"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
            <option value="error">Error</option>
          </select>
        </div>
      </header>

      {/* ─ Body ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-row overflow-hidden">

        {/* ─ Left Sidebar ─ */}
        <aside className="w-56 shrink-0 bg-[#161b22] border-r border-[#30363d] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[#30363d]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#58a6ff] font-mono">Farm Explorer</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-0.5">
              {Array.from(new Set(CAMERAS.map(c => c.farmCode))).map(farmCode => {
                const farmCams = CAMERAS.filter(c => c.farmCode === farmCode);
                const farmName = farmCams[0]?.farmName ?? '';
                const hasError = farmCams.some(c => c.status === 'error');
                const hasWarn  = farmCams.some(c => c.status === 'maintenance' || c.checkerStatus === 'needs_adjustment');
                const dotColor = hasError ? '#f85149' : hasWarn ? '#ff7700' : '#3fb950';
                return (
                  <div key={farmCode} className="px-2 py-1.5 hover:bg-[#21262d] cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full shrink-0" style={{ background: dotColor }} />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-[#c9d1d9] block truncate">{farmName}</span>
                        <span className="text-[9px] text-[#6e7681] font-mono">{farmCode} ({farmCams.length})</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="mt-4 pt-4 border-t border-[#30363d] px-2">
              <p className="text-[10px] font-bold text-[#6e7681] uppercase tracking-widest mb-2">Quick Stats</p>
              <div className="space-y-1.5">
                {([
                  { label: 'Total Cameras', value: stats.total,     color: '#c9d1d9' },
                  { label: 'Online',        value: stats.active,    color: '#3fb950' },
                  { label: 'Calibrated',    value: stats.calibrated, color: '#58a6ff' },
                  { label: 'Errors',        value: stats.error,     color: '#f85149' },
                ] as const).map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-[#8b949e]">{label}</span>
                    <span className="font-mono font-bold" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ─ Main Content ─ */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumb bar */}
          <div className="shrink-0 flex items-center px-4 py-2 border-b border-[#30363d] bg-[#0d1117]">
            <span className="text-xs font-mono text-[#8b949e]">Farm</span>
            <span className="text-xs text-[#6e7681] mx-1">/</span>
            <span className="text-xs font-bold font-mono text-[#58a6ff]">Farm_Operations</span>
          </div>

          {/* Metric cards */}
          <div className="shrink-0 grid grid-cols-4 gap-3 p-4">
            <MetricCard
              title="TOTAL_CAMERAS"
              value={stats.total}
              subtext="ALL_FARMS"
              icon="▣"
              valueColor="#c9d1d9"
            />
            <MetricCard
              title="ONLINE"
              value={stats.active}
              subtext={`${Math.round((stats.active / stats.total) * 100)}% UPTIME`}
              icon="◉"
              valueColor="#3fb950"
            />
            <MetricCard
              title="CALIBRATED"
              value={stats.calibrated}
              subtext={`${stats.needsAdjustment} NEEDS_ADJUST`}
              icon="⊞"
              valueColor={stats.needsAdjustment > 0 ? '#ff7700' : '#3fb950'}
            />
            <MetricCard
              title="ISSUES"
              value={stats.error + stats.maintenance}
              subtext={`${stats.error} ERROR / ${stats.maintenance} MAINT`}
              icon="⚠"
              valueColor={stats.error > 0 ? '#f85149' : '#8b949e'}
            />
          </div>

          {/* Table / Graph content area */}
          <div className="flex-1 overflow-hidden">
            {viewMode === 'table' ? (
              <div className="h-full overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-[#161b22] z-10 border-b border-[#30363d]">
                    <tr>
                      {['Camera ID', 'Farm', 'Model', 'Status', 'Checker', 'Zero Point', 'Last Calibration'].map(h => (
                        <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#6e7681]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#21262d]">
                    {filteredCameras.map(cam => {
                      const sCfg = STATUS_CFG[cam.status];
                      const cCfg = CHECKER_CFG[cam.checkerStatus];
                      const isSelected = selectedCamera?.id === cam.id;
                      return (
                        <tr
                          key={cam.id}
                          onClick={() => setSelectedCamera(isSelected ? null : cam)}
                          className={`cursor-pointer transition-colors ${isSelected ? 'bg-[#58a6ff]/10' : 'hover:bg-[#21262d]'}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[#6e7681]">▣</span>
                              <span className="text-xs font-bold font-mono text-[#c9d1d9]">{cam.cameraId}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-[#c9d1d9]">{cam.farmName}</div>
                            <div className="text-[9px] text-[#6e7681] font-mono">{cam.farmCode}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-[#8b949e]">{cam.cameraModel}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center px-2 py-0.5 border text-[9px] font-bold uppercase"
                              style={{ color: sCfg.color, background: sCfg.bg, borderColor: sCfg.border }}
                            >
                              {sCfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center px-2 py-0.5 border text-[9px] font-bold uppercase"
                              style={{ color: cCfg.color, background: cCfg.bg, borderColor: cCfg.border }}
                            >
                              {cCfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {cam.zeroPointX !== null
                              ? <span className="text-xs font-mono text-[#58a6ff]">{cam.zeroPointX} x {cam.zeroPointY}</span>
                              : <span className="text-xs text-[#6e7681]">N/A</span>
                            }
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-[#8b949e]">{cam.lastCalibration ?? '-'}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Graph View */
              <div
                className="h-full relative"
                style={{ backgroundImage: 'radial-gradient(rgba(88,166,255,0.08) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
              >
                {/* SVG connection lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <marker id="arr" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#58a6ff" fillOpacity="0.5" />
                    </marker>
                  </defs>
                  <path d="M 400 120 Q 280 200 180 280" stroke="#58a6ff" strokeWidth="1" strokeDasharray="4" fill="none" markerEnd="url(#arr)" />
                  <path d="M 400 120 Q 390 200 390 280" stroke="#58a6ff" strokeWidth="1" strokeDasharray="4" fill="none" markerEnd="url(#arr)" />
                  <path d="M 400 120 Q 510 200 570 280" stroke="#ff7700" strokeWidth="1" strokeDasharray="4" fill="none" markerEnd="url(#arr)" />
                  <path d="M 400 120 Q 620 200 730 280" stroke="#f85149" strokeWidth="1" strokeDasharray="4" fill="none" markerEnd="url(#arr)" />
                </svg>

                {/* Central server node */}
                <div className="absolute" style={{ left: 340, top: 80 }}>
                  <div className="p-3 bg-[#161b22] border-2 border-[#58a6ff] shadow-[0_0_15px_rgba(88,166,255,0.3)] flex flex-col items-center gap-1 min-w-[120px]">
                    <span className="text-lg text-[#58a6ff]">◈</span>
                    <span className="text-[10px] font-bold font-mono text-[#c9d1d9]">CENTRAL_SERVER</span>
                    <span className="text-[8px] text-[#58a6ff] animate-pulse uppercase tracking-tighter">Active</span>
                  </div>
                </div>

                {/* Farm nodes */}
                {GRAPH_FARM_NODES.map(n => (
                  <div key={n.code} className="absolute" style={{ left: n.left, top: n.top }}>
                    <div
                      className="p-3 bg-[#161b22] border flex flex-col items-center gap-1 min-w-[100px] transition-all hover:border-[#58a6ff]/50 cursor-pointer"
                      style={{ borderColor: n.borderColor }}
                    >
                      <span className="text-lg" style={{ color: n.nodeColor }}>◆</span>
                      <span className="text-[10px] font-bold font-mono text-[#c9d1d9]">{n.code}</span>
                      <span className="text-[8px] uppercase tracking-tighter" style={{ color: n.nodeColor }}>{n.sub}</span>
                    </div>
                  </div>
                ))}

                {/* Legend */}
                <div
                  className="absolute bottom-4 left-4 p-3 bg-[#161b22]/90 border border-[#30363d]"
                  style={{ borderLeftColor: '#58a6ff', borderLeftWidth: 2 }}
                >
                  <p className="text-[9px] font-bold text-[#6e7681] uppercase mb-2">Connection Status</p>
                  <div className="flex items-center gap-4">
                    {([
                      { color: '#58a6ff', label: 'Active' },
                      { color: '#ff7700', label: 'Warning' },
                      { color: '#f85149', label: 'Error' },
                    ] as const).map(({ color, label }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full" style={{ background: color }} />
                        <span className="text-[10px] font-mono text-[#8b949e]">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ─ Right Inspector ─ */}
        <aside className="w-64 shrink-0 bg-[#161b22] border-l border-[#30363d] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[#30363d]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#c9d1d9]">Camera Inspector</span>
          </div>
          {selectedCamera ? (
            <>
              <div className="flex-1 overflow-y-auto">
                {/* Camera header */}
                <div className="p-4 border-b border-[#30363d] bg-[#58a6ff]/5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="size-8 bg-[#58a6ff] flex items-center justify-center shrink-0">
                      <span className="text-[#0d1117] font-bold text-sm">▣</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#c9d1d9]">{selectedCamera.cameraId}</p>
                      <p className="text-[10px] text-[#6e7681] font-mono">{selectedCamera.farmName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-[#6e7681] mb-1">Status</p>
                      <span className="text-xs font-bold" style={{ color: STATUS_CFG[selectedCamera.status].color }}>
                        {STATUS_CFG[selectedCamera.status].label}
                      </span>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-[#6e7681] mb-1">Checker</p>
                      <span className="text-xs font-bold" style={{ color: CHECKER_CFG[selectedCamera.checkerStatus].color }}>
                        {CHECKER_CFG[selectedCamera.checkerStatus].label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Properties */}
                <div className="p-4 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-[#6e7681] uppercase mb-2">Properties</p>
                    <div className="space-y-2 font-mono text-xs">
                      {([
                        { label: 'Model',            value: selectedCamera.cameraModel,                color: '#c9d1d9' },
                        { label: 'Farm Code',        value: selectedCamera.farmCode,                   color: '#58a6ff' },
                        { label: 'Install Date',     value: selectedCamera.installDate,               color: '#c9d1d9' },
                        { label: 'Last Calibration', value: selectedCamera.lastCalibration ?? 'N/A',  color: '#c9d1d9' },
                      ] as const).map(({ label, value, color }) => (
                        <div key={label} className="flex justify-between items-center py-1 border-b border-[#30363d]/30">
                          <span className="text-[#8b949e]">{label}</span>
                          <span style={{ color }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedCamera.zeroPointX !== null && (
                    <div>
                      <p className="text-[10px] font-bold text-[#6e7681] uppercase mb-2">Zero Point</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(['X', 'Y'] as const).map((axis) => (
                          <div key={axis} className="p-2 bg-[#0d1117] border border-[#30363d]">
                            <span className="text-[9px] text-[#6e7681] block">{axis}</span>
                            <span className="text-xs font-mono text-[#58a6ff]">
                              {axis === 'X' ? selectedCamera.zeroPointX : selectedCamera.zeroPointY}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCamera.notes && (
                    <div>
                      <p className="text-[10px] font-bold text-[#6e7681] uppercase mb-2">Notes</p>
                      <p className="text-xs text-[#8b949e]">{selectedCamera.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
                <button className="w-full py-2 bg-[#58a6ff] text-[#0d1117] font-bold text-xs uppercase tracking-wider hover:bg-[#58a6ff]/90 transition-colors">
                  Edit Camera
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-xs text-[#6e7681]">Select a camera to inspect</span>
            </div>
          )}
        </aside>
      </div>

      {/* ─ Log Console ────────────────────────────────────────────────────── */}
      {isConsoleOpen && (
        <div className="shrink-0 bg-[#161b22] border-t border-[#30363d] h-36 flex flex-col overflow-hidden">
          <div className="shrink-0 flex items-center justify-between px-4 py-1.5 border-b border-[#30363d]">
            <span className="text-[10px] font-mono text-[#58a6ff] uppercase tracking-widest">&gt;_ Console</span>
            <button
              onClick={() => setIsConsoleOpen(false)}
              className="text-[#8b949e] hover:text-[#c9d1d9] text-lg leading-none"
              aria-label="Close console"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto font-mono text-[11px] py-1">
            {LOG_ENTRIES.map((log, i) => {
              const levelColor = log.level === 'SUCCESS' ? '#3fb950' : log.level === 'WARN' ? '#ff7700' : '#8b949e';
              return (
                <div key={i} className="px-4 py-0.5 flex gap-3 hover:bg-[#21262d]">
                  <span className="text-[#6e7681] shrink-0">{log.timestamp}</span>
                  <span className="shrink-0 font-bold w-16" style={{ color: levelColor }}>{log.level}</span>
                  <span className="text-[#c9d1d9]">{log.message}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─ Footer ─────────────────────────────────────────────────────────── */}
      <footer className="shrink-0 flex items-center justify-between px-4 py-2 border-t border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <button
            onClick={() => setIsConsoleOpen(v => !v)}
            aria-label={isConsoleOpen ? '콘솔 숨기기' : '콘솔 보기'}
            aria-expanded={isConsoleOpen}
            className={`flex items-center gap-1 transition-colors ${isConsoleOpen ? 'text-[#58a6ff]' : 'text-[#8b949e] hover:text-[#58a6ff]'}`}
          >
            <span>&gt;_</span>
            <span className="uppercase tracking-widest">Console: {isConsoleOpen ? 'Live' : 'Hidden'}</span>
          </button>
          <span className="text-[#30363d]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[#3fb950] animate-pulse" />
            <span className="text-[#8b949e]">SYSTEM_READY</span>
          </div>
          <span className="text-[#6e7681]">CAMERAS: {stats.active}/{stats.total} ONLINE</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-[#6e7681] opacity-70">
          <span>FARM_OPS_V1.0</span>
          <div className="flex items-center gap-1">
            <span>⊛</span>
            <span>LEVEL_03</span>
          </div>
        </div>
      </footer>

      <DashFloatingNav current="/farm" />
    </div>
  );
}
