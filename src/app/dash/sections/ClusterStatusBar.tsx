import type { DashStatusMetric } from '../mock-data';

interface ClusterStatusBarProps {
  metrics: DashStatusMetric[];
}

const toneClassMap = {
  normal: 'border-[#3fb95066] bg-[#3fb9501f] text-[#3fb950]',
  caution: 'border-[#d2992266] bg-[#d299221f] text-[#d29922]',
  alert: 'border-[#f8514966] bg-[#f851491f] text-[#f85149]',
  unknown: 'border-[#8b949e66] bg-[#8b949e1f] text-[#8b949e]',
} as const;

const ClusterStatusBar = ({ metrics }: ClusterStatusBarProps) => {
  return (
    <div className="h-[112px] overflow-hidden bg-[#161b22] border border-[#30363d] p-2">
      <div className="grid h-full grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="border border-[#30363d] bg-[#0d1117] px-2 py-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#8b949e]">{metric.label}</span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${toneClassMap[metric.tone]}`}>
                {metric.tone.toUpperCase()}
              </span>
            </div>
            <p
              className={`mt-1 font-bold tracking-tight text-[#e6edf3] ${
                metric.label === '총 마리수' || metric.label === '가동률' || metric.label === '육성률'
                  ? 'text-[21px]'
                  : 'text-[18px]'
              }`}
            >
              {metric.value}
            </p>
            <p className="truncate text-[10px] text-[#6e7681]">{metric.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClusterStatusBar;
