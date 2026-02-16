import { AlertTriangle, ClipboardCheck } from 'lucide-react';
import type { DashActionItem, DashAlertItem } from '../mock-data';

interface EventPanelProps {
  alerts: DashAlertItem[];
  actions: DashActionItem[];
}

const levelClassMap = {
  normal: 'border-[#3fb95066] bg-[#3fb9501f] text-[#3fb950]',
  caution: 'border-[#d2992266] bg-[#d299221f] text-[#d29922]',
  alert: 'border-[#f8514966] bg-[#f851491f] text-[#f85149]',
} as const;

const priorityClassMap = {
  P1: 'text-[#f85149]',
  P2: 'text-[#d29922]',
  P3: 'text-[#3fb950]',
} as const;

const EventPanel = ({ alerts, actions }: EventPanelProps) => {
  return (
    <div className="flex h-full flex-col gap-4">
      <section className="border border-[#30363d] bg-[#161b22]">
        <header className="flex items-center justify-between border-b border-[#30363d] px-4 py-3">
          <h2 className="text-sm font-semibold text-[#e6edf3]">이벤트/경고</h2>
          <span className="text-xs text-[#8b949e]">{alerts.length}건</span>
        </header>
        <div className="space-y-2 p-3">
          {alerts.map((alert) => (
            <article key={alert.id} className="border border-[#30363d] bg-[#0d1117] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${levelClassMap[alert.level]}`}>
                  {alert.level.toUpperCase()}
                </span>
                <span className="text-[11px] text-[#8b949e]">{alert.createdAt}</span>
              </div>
              <p className="text-sm font-semibold tracking-tight text-[#e6edf3]">{alert.farmLabel}</p>
              <p className="mt-1 text-[13px] text-[#c9d1d9]">{alert.message}</p>
              <p className="mt-1 font-mono text-[11px] text-[#8b949e]">{alert.code}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="flex-1 border border-[#30363d] bg-[#161b22]">
        <header className="flex items-center justify-between border-b border-[#30363d] px-4 py-3">
          <h2 className="text-sm font-semibold text-[#e6edf3]">알람/조치 큐</h2>
          <span className="text-xs text-[#8b949e]">{actions.length}건</span>
        </header>
        <div className="space-y-2 p-3">
          {actions.map((action) => (
            <article key={action.id} className="border border-[#30363d] bg-[#0d1117] p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold tracking-tight text-[#e6edf3]">{action.target}</p>
                <span className={`text-xs font-semibold ${priorityClassMap[action.priority]}`}>{action.priority}</span>
              </div>
              <p className="mt-1 text-[13px] text-[#c9d1d9]">{action.issue}</p>
              <p className="mt-1 text-[11px] text-[#8b949e]">
                담당: {action.owner} · 기한: {action.dueText}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1 border border-[#30363d] bg-[#111826] px-2 py-1 text-[11px] text-[#c9d1d9] transition-colors hover:border-[#1f6feb]"
                >
                  <ClipboardCheck className="h-3 w-3" />
                  상태 확인
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1 border border-[#30363d] bg-[#111826] px-2 py-1 text-[11px] text-[#c9d1d9] transition-colors hover:border-[#d29922]"
                >
                  <AlertTriangle className="h-3 w-3" />
                  담당자 노트
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default EventPanel;
