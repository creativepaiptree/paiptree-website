'use client';

import Link from 'next/link';
import { useState } from 'react';

const PLACEHOLDERS = ['바로가기 1', '바로가기 2', '바로가기 3'];

export default function MemberFloatingNav({ labName }: { labName: string }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-[9999] flex flex-row items-stretch">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="bg-[#161b22] border border-l-0 border-[#30363d] hover:border-[#58a6ff]/60
                   w-6 flex flex-col items-center justify-center gap-3 rounded-r-md transition-colors group self-stretch"
        aria-label="멤버 메뉴"
      >
        <span className="text-[10px] text-[#8b949e] group-hover:text-[#c9d1d9] transition-colors">
          {open ? '◀' : '▶'}
        </span>
        {!open && (
          <span className="text-[9px] font-mono text-[#8b949e] group-hover:text-[#c9d1d9] transition-colors [writing-mode:vertical-rl] rotate-180 tracking-widest">
            {labName}
          </span>
        )}
      </button>

      <nav
        className={`bg-[#161b22] border border-l-0 border-[#30363d] flex flex-col shadow-xl overflow-hidden transition-all duration-200 ${
          open ? 'w-44' : 'w-0 border-0'
        }`}
      >
        <div className="flex items-center px-4 py-3 border-b border-[#30363d] shrink-0">
          <Link
            href="/dash"
            className="text-sm font-semibold text-[#c9d1d9] font-mono whitespace-nowrap hover:text-white transition-colors"
          >
            ← {labName}
          </Link>
        </div>

        <div className="px-3 pt-4 pb-5">
          <p className="text-[10px] text-[#8b949e] font-mono uppercase tracking-widest mb-3 whitespace-nowrap">
            Shortcuts
          </p>
          <div className="flex flex-col gap-0.5">
            {PLACEHOLDERS.map((label, i) => (
              <div key={i} className="flex flex-col gap-1.5 px-2 py-2.5 opacity-40">
                <span className="text-[12px] font-semibold leading-none text-[#c9d1d9] whitespace-nowrap">
                  {label}
                </span>
                <span className="text-[9px] font-mono border border-[#30363d] text-[#8b949e] px-1 self-start leading-4 whitespace-nowrap">
                  예정
                </span>
              </div>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
