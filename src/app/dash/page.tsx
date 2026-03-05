import DashFloatingNav from '@/components/dash/DashFloatingNav';

export default function DashPage() {
  return (
    <div
      className="h-screen flex flex-col overflow-hidden bg-[#0d1117] text-gray-100"
      data-poc-theme="dark"
    >
      {/* 상단 바 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d] bg-[#161b22]">
        <span className="text-sm font-semibold text-[#c9d1d9] font-mono">zoro_LAB</span>
        <span className="text-[10px] text-[#8b949e]">내부 도구 허브</span>
      </div>

      {/* 메인 콘텐츠 영역 — 추후 대시보드 위젯/그래프 */}
      <main className="flex-1 overflow-y-auto flex items-center justify-center">
        <p className="text-[11px] text-[#30363d] font-mono uppercase tracking-widest select-none">
          dashboard · coming soon
        </p>
      </main>

      <DashFloatingNav current="/dash" />
    </div>
  );
}
