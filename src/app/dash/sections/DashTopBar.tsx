import { Bell, RefreshCw, ShieldCheck } from 'lucide-react';

interface DashTopBarProps {
  lastUpdatedAt: string;
  contextLabel?: string;
}

const DashTopBar = ({ lastUpdatedAt, contextLabel }: DashTopBarProps) => {
  return (
    <div className="h-[86px] overflow-hidden bg-[#161b22] border border-[#30363d] px-4 py-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b949e]">EMS Dashboard 2.0</p>
          <h1 className="text-xl font-semibold text-[#e6edf3]">운영 통합 대시보드</h1>
          {contextLabel ? <p className="mt-0.5 truncate text-[11px] text-[#79c0ff]">Context: {contextLabel}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 border border-[#1f6feb66] bg-[#1f6feb22] px-2 py-1 text-xs text-[#79c0ff]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Cluster Live
          </span>
          <span className="inline-flex items-center gap-1 border border-[#3fb95066] bg-[#3fb95022] px-2 py-1 text-xs text-[#3fb950]">
            <Bell className="h-3.5 w-3.5" />
            Action Queue Ready
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1 border border-[#30363d] bg-[#0d1117] px-2 py-1 text-xs text-[#c9d1d9] transition-colors hover:border-[#8b949e]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            수동 새로고침
          </button>
        </div>
      </div>
      <p className="text-[11px] text-[#8b949e]">마지막 갱신: {lastUpdatedAt}</p>
    </div>
  );
};

export default DashTopBar;
