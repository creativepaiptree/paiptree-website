'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { stageItems } from './_stage-items';

function CherryTmsStageNav({ current }: { current?: string }) {
  return (
    <nav className="cherry-stage-nav border-b border-[#243041] bg-[#0f1722] px-4 py-3 md:px-6">
      <div className="flex flex-wrap gap-2 text-xs md:text-sm">
        <Link
          href="/cherry_tms"
          className={`cherry-nav-item border px-3 py-2 transition ${
            !current ? 'is-active border-[#4D7CFF] bg-[#1c2c52] text-white' : 'border-[#314056] bg-[#0a1019] text-slate-300 hover:bg-white/5'
          }`}
        >
          HUB
        </Link>
        {stageItems.map((stage) => {
          const active = current === stage.key;
          return (
            <Link
              key={stage.key}
              href={stage.href}
              className={`cherry-nav-item border px-3 py-2 transition ${
                active ? 'is-active border-[#4D7CFF] bg-[#1c2c52] text-white' : 'border-[#314056] bg-[#0a1019] text-slate-300 hover:bg-white/5'
              }`}
            >
              {stage.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function CherryTmsThemeFrame({
  current,
  eyebrow,
  title,
  description,
  children,
}: {
  current?: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const isLight = themeMode === 'light';

  return (
    <div
      data-theme="showcase"
      data-cherry-theme={themeMode}
      className={`cherry-tms-root min-h-screen transition-colors ${
        isLight ? 'poc-theme-light bg-[#f8fafc] text-slate-900' : 'bg-[var(--surface-bg)] text-[var(--surface-text)]'
      }`}
    >
      <style>{`
        [data-cherry-theme='light'] .cherry-panel,
        [data-cherry-theme='light'] section {
          border-color: #cbd5e1 !important;
          background: #ffffff !important;
        }

        [data-cherry-theme='light'] .cherry-panel-header,
        [data-cherry-theme='light'] .cherry-stage-nav,
        [data-cherry-theme='light'] .bg-\[\#0f1722\],
        [data-cherry-theme='light'] .bg-\[\#111a27\] {
          border-color: #cbd5e1 !important;
          background: #f1f5f9 !important;
        }

        [data-cherry-theme='light'] .bg-\[\#0b1220\],
        [data-cherry-theme='light'] .bg-\[\#07101b\],
        [data-cherry-theme='light'] .bg-\[\#0a1019\] {
          background: #ffffff !important;
        }

        [data-cherry-theme='light'] .bg-\[\#1c2c52\],
        [data-cherry-theme='light'] .bg-\[\#13213a\],
        [data-cherry-theme='light'] .bg-\[\#14213b\] {
          background: #dbeafe !important;
        }

        [data-cherry-theme='light'] .border-\[\#243041\],
        [data-cherry-theme='light'] .border-\[\#314056\],
        [data-cherry-theme='light'] .border-\[\#1b2636\],
        [data-cherry-theme='light'] .border-\[\#101a2a\],
        [data-cherry-theme='light'] .border-\[\#162131\],
        [data-cherry-theme='light'] .border-\[\#263244\],
        [data-cherry-theme='light'] .border-\[\#2a3443\] {
          border-color: #cbd5e1 !important;
        }

        [data-cherry-theme='light'] .text-white,
        [data-cherry-theme='light'] .text-slate-200,
        [data-cherry-theme='light'] .text-slate-300 {
          color: #0f172a !important;
        }

        [data-cherry-theme='light'] .text-slate-400,
        [data-cherry-theme='light'] .text-slate-500,
        [data-cherry-theme='light'] .text-slate-600 {
          color: #64748b !important;
        }

        [data-cherry-theme='light'] input {
          background: #ffffff !important;
          color: #0f172a !important;
        }

        [data-cherry-theme='light'] input:placeholder-shown {
          background: #eff6ff !important;
          border-color: rgba(37, 99, 235, 0.45) !important;
          color: #2563eb !important;
        }

        [data-cherry-theme='light'] .cherry-nav-item.is-active {
          border-color: #2563eb !important;
          background: #dbeafe !important;
          color: #1d4ed8 !important;
        }
      `}</style>
      <main className="mx-auto flex min-h-screen w-full max-w-[1720px] flex-col gap-6 px-4 py-6 md:px-6 xl:px-8">
        <section className="cherry-panel border border-[#243041] bg-[#0b1220]">
          <div className="cherry-panel-header flex flex-col gap-3 px-4 py-4 md:flex-row md:items-start md:justify-between md:px-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7aa2ff]">{eyebrow}</p>
              <h1 className="mt-2 text-xl font-semibold text-white md:text-2xl">{title}</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">{description}</p>
            </div>
            <div className="flex shrink-0 items-center border border-[#314056] bg-[#0a1019] p-1 text-xs">
              {(['dark', 'light'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setThemeMode(mode)}
                  className={`px-3 py-1.5 transition ${
                    themeMode === mode ? 'bg-[#1c2c52] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode === 'dark' ? '다크' : '라이트'}
                </button>
              ))}
            </div>
          </div>
          <CherryTmsStageNav current={current} />
        </section>
        {children}
      </main>
    </div>
  );
}
