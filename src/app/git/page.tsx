import DashFloatingNav from '@/components/dash/DashFloatingNav';
import GitReportWorkspace from '@/components/git/GitReportWorkspace';
import {
  gitArchitectureSteps,
  gitCapabilityChecks,
  gitStorageTables,
} from '@/content/gitWeeklyReports';

export default function GitPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0d1117] text-gray-100" data-poc-theme="dark">
      <header className="flex-shrink-0 bg-[#161b22] border-b border-[#30363d] px-4 flex items-center justify-between min-h-[56px]">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold font-mono text-[#c9d1d9]">GitLab Daily Blocks</span>
          <span className="text-[10px] font-mono border border-[#58a6ff] text-[#58a6ff] px-1 py-[1px]">
            TOOL
          </span>
          <span className="text-[10px] font-mono border border-[#ff7700] text-[#ff7700] px-1 py-[1px]">
            PROTOTYPE
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-[#8b949e]">
          <span>Source: `/Users/zoro/projects/gitlab-sync`</span>
          <span className="hidden lg:inline">Mode: PoC 3.0 surface</span>
        </div>
      </header>

      <div className="flex-shrink-0 bg-[#161b22] border-b border-[#30363d] px-4 py-2.5">
        <div className="flex flex-wrap gap-3">
          <div className="border border-[#30363d] bg-[#0d1117] px-3 py-2 min-w-[220px]">
            <p className="text-[9px] uppercase tracking-widest font-mono text-[#8b949e]">Actual Source</p>
            <p className="mt-1 text-xs text-[#c9d1d9]">`reports/weekly-report-2026-03-16_db.md` 기준</p>
          </div>
          <div className="border border-[#30363d] bg-[#0d1117] px-3 py-2 min-w-[220px]">
            <p className="text-[9px] uppercase tracking-widest font-mono text-[#8b949e]">Read Model</p>
            <p className="mt-1 text-xs text-[#c9d1d9]">`git_report_blocks_export_v1` 날짜별 조회</p>
          </div>
          <div className="border border-[#30363d] bg-[#0d1117] px-3 py-2 min-w-[220px]">
            <p className="text-[9px] uppercase tracking-widest font-mono text-[#8b949e]">DB Direction</p>
            <p className="mt-1 text-xs text-[#c9d1d9]">Supabase block + file-row schema</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <div className="max-w-[1760px] w-full h-full mx-auto">
          <GitReportWorkspace
            initialReports={[]}
            capabilityChecks={gitCapabilityChecks}
            architectureSteps={gitArchitectureSteps}
            storageTables={gitStorageTables}
          />
        </div>
      </div>

      <DashFloatingNav current="/git" />
    </div>
  );
}
