'use client';

import { useRouter } from 'next/navigation';
import MemberFloatingNav from '@/components/dash/MemberFloatingNav';

const MEMBER = {
  spaceName: 'jim_LAB',
  descShort: '성진님의 테스트 및 연구 개발공간입니다.',
  desc: '크리에이티브팀 성진님의 테스트 및 연구 개발공간입니다.',
  role: 'Dev / AI Research',
  color: '#3fb950',
};

const MEMBER_SELECT = [
  { key: 'zoro', label: 'ZORO(조영연)', href: '/dash' },
  { key: 'jim',  label: 'Jim(성진)',    href: '/dash_2' },
  { key: 'hk',   label: 'HK(강현국)',   href: '/dash_3' },
];

export default function Dash2Page() {
  const router = useRouter();

  return (
    <div
      className="h-screen flex flex-col overflow-hidden bg-[#0d1117] text-gray-100"
      data-poc-theme="dark"
    >
      {/* 상단 바 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex-shrink-0 text-sm font-semibold font-mono" style={{ color: MEMBER.color }}>
            {MEMBER.spaceName}
          </span>
          <span className="text-xs text-[#8b949e] truncate">{MEMBER.descShort}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <select
            value="jim"
            onChange={(e) => {
              const item = MEMBER_SELECT.find((m) => m.key === e.target.value);
              if (item) router.push(item.href);
            }}
            className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] text-xs font-mono px-2 py-1 outline-none focus:border-[#58a6ff] cursor-pointer"
          >
            {MEMBER_SELECT.map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
          <span className="text-xs text-[#8b949e]">내부 도구 허브</span>
        </div>
      </div>

      {/* 메인 */}
      <main className="flex-1 overflow-y-auto flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-3">
          <span
            className="text-[10px] font-mono border px-2 py-[2px] uppercase tracking-widest"
            style={{ color: MEMBER.color, borderColor: MEMBER.color }}
          >
            {MEMBER.role}
          </span>
          <p className="text-3xl font-bold font-mono tracking-tight" style={{ color: MEMBER.color }}>
            {MEMBER.spaceName}
          </p>
          <p className="text-[11px] text-[#8b949e] font-mono">{MEMBER.desc}</p>
        </div>
        <p className="text-[10px] text-[#30363d] font-mono uppercase tracking-widest select-none mt-6">
          dashboard · coming soon
        </p>
      </main>

      {/* 푸터 */}
      <footer className="flex-shrink-0 border-t border-[#30363d] bg-[#161b22] px-4 py-2 flex items-center justify-between">
        <span className="text-[10px] text-[#8b949e] font-mono">© 2025 Paiptree.Inc</span>
        <span className="text-[10px] text-[#8b949e] font-mono">
          Made by Creative Team ZORO &nbsp;·&nbsp; Powered by Next.js
        </span>
      </footer>

      <MemberFloatingNav labName="jim_LAB" />
    </div>
  );
}
