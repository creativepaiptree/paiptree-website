'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { stageItems } from './_stage-items';

function CherryTmsStageNav({ current, themeSuffix }: { current?: string; themeSuffix: string }) {
  return (
    <nav className="cherry-stage-nav border-b border-[#243041] bg-[#0f1722] px-4 py-3 md:px-6">
      <div className="flex flex-wrap gap-2 text-xs md:text-sm">
        <Link
          href={`/cherry_tms${themeSuffix}`}
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
              href={`${stage.href}${themeSuffix}`}
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const themeMode = searchParams.get('theme') === 'light' ? 'light' : 'dark';
  const isLight = themeMode === 'light';
  const themeSuffix = isLight ? '?theme=light' : '';

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const nextBg = isLight ? '#f8fafc' : '#050505';
    const nextColor = isLight ? '#0f172a' : '#f0f0f0';

    const prev = {
      bodyBg: body.style.backgroundColor,
      bodyColor: body.style.color,
      bodyScheme: body.style.colorScheme,
      htmlBg: html.style.backgroundColor,
      htmlColor: html.style.color,
      htmlScheme: html.style.colorScheme,
    };

    body.style.backgroundColor = nextBg;
    body.style.color = nextColor;
    body.style.colorScheme = isLight ? 'light' : 'dark';
    html.style.backgroundColor = nextBg;
    html.style.color = nextColor;
    html.style.colorScheme = isLight ? 'light' : 'dark';

    return () => {
      body.style.backgroundColor = prev.bodyBg;
      body.style.color = prev.bodyColor;
      body.style.colorScheme = prev.bodyScheme;
      html.style.backgroundColor = prev.htmlBg;
      html.style.color = prev.htmlColor;
      html.style.colorScheme = prev.htmlScheme;
    };
  }, [isLight]);

  return (
    <div
      data-theme="showcase"
      data-cherry-theme={themeMode}
      className={`cherry-tms-root min-h-screen transition-colors ${
        isLight ? 'poc-theme-light bg-[#f8fafc] text-slate-900' : 'bg-[var(--surface-bg)] text-[var(--surface-text)]'
      }`}
    >
      <style>{`
        [data-cherry-theme=light],
        [data-cherry-theme=light] main {
          background: #f8fafc !important;
          color: #0f172a !important;
        }

        [data-cherry-theme=light] th,
        [data-cherry-theme=light] td,
        [data-cherry-theme=light] p,
        [data-cherry-theme=light] h1,
        [data-cherry-theme=light] h2,
        [data-cherry-theme=light] h3,
        [data-cherry-theme=light] h4,
        [data-cherry-theme=light] h5,
        [data-cherry-theme=light] h6,
        [data-cherry-theme=light] span {
          color: inherit !important;
        }

        [data-cherry-theme=light] a {
          text-decoration: none;
        }

        [data-cherry-theme=light] button,
        [data-cherry-theme=light] a.cherry-nav-item {
          border-color: #cbd5e1 !important;
          background: #ffffff !important;
        }

        [data-cherry-theme=light] button:hover,
        [data-cherry-theme=light] a.cherry-nav-item:hover {
          background: #eff6ff !important;
        }

        [data-cherry-theme=light] .cherry-panel,
        [data-cherry-theme=light] section,
        [data-cherry-theme=light] article,
        [data-cherry-theme=light] details {
          border-color: #cbd5e1 !important;
          background: #ffffff !important;
        }

        [data-cherry-theme=light] summary {
          background: #ffffff !important;
        }

        [data-cherry-theme=light] .cherry-panel-header,
        [data-cherry-theme=light] .cherry-stage-nav,
        [data-cherry-theme=light] .cherry-light-header,
        [data-cherry-theme=light] .cherry-light-table-head {
          border-color: #cbd5e1 !important;
          background: #f1f5f9 !important;
        }

        [data-cherry-theme=light] .cherry-light-field,
        [data-cherry-theme=light] .cherry-light-row,
        [data-cherry-theme=light] .cherry-light-detail-panel,
        [data-cherry-theme=light] .cherry-light-detail-row,
        [data-cherry-theme=light] .cherry-light-badge {
          border-color: #cbd5e1 !important;
          background: #ffffff !important;
        }

        [data-cherry-theme=light] .cherry-light-active {
          border-color: #2563eb !important;
          background: #dbeafe !important;
          color: #1d4ed8 !important;
        }

        [data-cherry-theme=light] .text-white,
        [data-cherry-theme=light] .text-slate-200,
        [data-cherry-theme=light] .text-slate-300 {
          color: #0f172a !important;
        }

        [data-cherry-theme=light] .text-slate-400,
        [data-cherry-theme=light] .text-slate-500,
        [data-cherry-theme=light] .text-slate-600 {
          color: #64748b !important;
        }

        [data-cherry-theme=light] input {
          background: #ffffff !important;
          border-color: #cbd5e1 !important;
          color: #0f172a !important;
        }

        [data-cherry-theme=light] input:placeholder-shown {
          background: #eff6ff !important;
          border-color: rgba(37, 99, 235, 0.45) !important;
          color: #2563eb !important;
        }

        [data-cherry-theme=light] .cherry-nav-item.is-active {
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
              <Link
                href={pathname}
                style={themeMode === 'dark' ? { backgroundColor: '#1c2c52', color: '#ffffff' } : undefined}
                className={`px-3 py-1.5 transition ${themeMode === 'dark' ? '' : 'text-slate-400 hover:text-white'}`}
              >
                다크
              </Link>
              <Link
                href={`${pathname}?theme=light`}
                style={themeMode === 'light' ? { backgroundColor: '#dbeafe', color: '#1d4ed8' } : undefined}
                className={`px-3 py-1.5 transition ${themeMode === 'light' ? '' : 'text-slate-400 hover:text-white'}`}
              >
                라이트
              </Link>
            </div>
          </div>
          <CherryTmsStageNav current={current} themeSuffix={themeSuffix} />
        </section>
        {children}
      </main>
    </div>
  );
}
