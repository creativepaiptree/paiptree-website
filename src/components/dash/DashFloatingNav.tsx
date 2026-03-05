'use client';

import Link from 'next/link';
import { useState } from 'react';

const TOOLS: { href: string; name: string; badge: string; badgeColor: string; external?: boolean }[] = [
  {
    href: '/dash',
    name: 'zoro_LAB',
    badge: 'HUB',
    badgeColor: '#8b949e',
  },
  {
    href: '/about',
    name: 'paiptree HP',
    badge: 'SITE',
    badgeColor: '#3fb950',
  },
  {
    href: 'https://paiptree-ds.vercel.app/',
    name: 'Creative(context)',
    badge: 'SITE',
    badgeColor: '#3fb950',
    external: true,
  },
  {
    href: '/tms',
    name: 'tms Landing',
    badge: 'SITE',
    badgeColor: '#3fb950',
  },
  {
    href: '/PoC',
    name: '3.0 UX/UI (PoC)',
    badge: 'PROTOTYPE',
    badgeColor: '#ff7700',
  },
  {
    href: '/tms/main',
    name: 'tms Schedule',
    badge: 'PROTOTYPE',
    badgeColor: '#ff7700',
  },
  {
    href: '/i18n',
    name: 'i18n(ai,ems/PoC)',
    badge: 'TOOL',
    badgeColor: '#58a6ff',
  },
];

type Props = {
  current: string;
};

export default function DashFloatingNav({ current }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-[9999] flex flex-row items-stretch">
      {/* 탭 핸들 — 패널 높이를 참조해 자동으로 늘어남 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="bg-[#161b22] border border-l-0 border-[#30363d] hover:border-[#58a6ff]/60
                   w-6 flex flex-col items-center justify-center gap-3 rounded-r-md transition-colors group self-stretch"
        aria-label="내부 도구 메뉴"
      >
        <span className="text-[10px] text-[#8b949e] group-hover:text-[#c9d1d9] transition-colors">
          {open ? '◀' : '▶'}
        </span>
        {!open && (
          <span className="text-[9px] font-mono text-[#8b949e] group-hover:text-[#c9d1d9] transition-colors [writing-mode:vertical-rl] rotate-180 tracking-widest">
            zoro_LAB
          </span>
        )}
      </button>

      {/* 패널 — 너비만 토글, 높이는 콘텐츠 기준으로 자동 */}
      <nav
        className={`bg-[#161b22] border border-l-0 border-[#30363d] flex flex-col shadow-xl overflow-hidden transition-all duration-200 ${
          open ? 'w-44' : 'w-0 border-0'
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center px-4 py-3 border-b border-[#30363d] shrink-0">
          <span className="text-sm font-semibold text-[#c9d1d9] font-mono whitespace-nowrap">zoro_LAB</span>
        </div>

        {/* 도구 목록 */}
        <div className="px-3 pt-4 pb-5">
          <p className="text-[10px] text-[#8b949e] font-mono uppercase tracking-widest mb-3 whitespace-nowrap">
            Tools
          </p>
          <div className="flex flex-col gap-0.5">
            {TOOLS.map((tool) => {
              const isCurrent = tool.href === current;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  target={tool.external ? '_blank' : undefined}
                  rel={tool.external ? 'noopener noreferrer' : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex flex-col gap-1.5 px-2 py-2.5 transition-colors group ${
                    isCurrent
                      ? 'bg-[#21262d] pointer-events-none'
                      : 'hover:bg-[#21262d]'
                  }`}
                >
                  <span
                    className={`text-[12px] font-semibold leading-none transition-colors whitespace-nowrap ${
                      isCurrent ? 'text-white' : 'text-[#c9d1d9] group-hover:text-white'
                    }`}
                  >
                    {tool.name}
                  </span>
                  <span
                    className="text-[9px] font-mono border px-1 self-start leading-4 whitespace-nowrap"
                    style={{ color: tool.badgeColor, borderColor: tool.badgeColor }}
                  >
                    {tool.badge}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
