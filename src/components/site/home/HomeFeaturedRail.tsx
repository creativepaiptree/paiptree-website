'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import type { FeaturedRailItem } from '@/content/homePresentation';

type HomeFeaturedRailProps = {
  items: readonly FeaturedRailItem[];
};

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

/* Dark surface panel style (replaces old light panel) */
const darkPanelStyle = {
  border: '1px solid rgba(67,70,84,0.30)',
  background: '#272a2d',
  borderRadius: '4px',
} as const;

const darkPanelAlt = {
  border: '1px solid rgba(67,70,84,0.30)',
  background: '#1d2023',
  borderRadius: '4px',
} as const;

function RailVisual({ item }: { item: FeaturedRailItem }) {
  if (item.visual === 'tms') {
    return (
      <>
        <div className="absolute inset-0 bg-[#1d2023]" />
        <div className="absolute inset-x-5 bottom-5 top-10 overflow-hidden rounded-[4px]" style={darkPanelStyle}>
          {item.imageSrc ? (
            <Image
              src={item.imageSrc}
              alt={`${item.title} 인터페이스`}
              fill
              sizes="(max-width: 1024px) 84vw, 34rem"
              className="object-cover object-left-top"
            />
          ) : null}
        </div>
        <div className="absolute left-5 top-5 px-3 py-2" style={darkPanelAlt}>
          <p className="type-label" style={{ color: '#8d90a0' }}>Live dispatch</p>
        </div>
      </>
    );
  }

  if (item.visual === 'proof') {
    return (
      <>
        <div className="absolute inset-0 bg-[#1d2023]" />
        <div className="grid h-full grid-cols-2 gap-3 p-5">
          {item.stats?.slice(0, 4).map((stat, index) => (
            <div
              key={stat.label}
              className="flex min-h-[118px] flex-col justify-between p-4"
              style={{
                ...darkPanelStyle,
                background: index === 0 ? '#323538' : '#272a2d',
              }}
            >
              <span className="type-label" style={{ color: '#8d90a0' }}>{stat.label}</span>
              <span
                className="type-heading-s"
                style={{
                  color: '#e1e2e6',
                  fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
                }}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (item.visual === 'global') {
    return (
      <>
        <div className="absolute inset-0 bg-[#272a2d]" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M18 24 C31 30, 38 34, 49 40" stroke="#434654" strokeWidth="0.6" fill="none" />
          <path d="M49 40 C58 36, 67 30, 76 22" stroke="#434654" strokeWidth="0.6" fill="none" />
          <path d="M49 40 C57 48, 61 58, 64 72" stroke="#434654" strokeWidth="0.6" fill="none" />
          <path d="M24 64 C34 57, 41 49, 49 40" stroke="#434654" strokeWidth="0.6" fill="none" />
        </svg>
        <div className="absolute left-[17%] top-[22%] h-3 w-3 rounded-full bg-[#b5c4ff]" />
        <div className="absolute left-[48%] top-[38%] h-3 w-3 rounded-full bg-[#4edea3]" />
        <div className="absolute left-[74%] top-[24%] h-3 w-3 rounded-full bg-[#b5c4ff]" />
        <div className="absolute left-[64%] top-[69%] h-3 w-3 rounded-full bg-[#b5c4ff]" />
        <div className="absolute inset-x-5 bottom-5 grid gap-3 sm:grid-cols-3">
          {item.stats?.slice(0, 3).map((stat) => (
            <div key={stat.label} className="p-4" style={darkPanelStyle}>
              <p
                className="type-heading-s mb-2"
                style={{
                  color: '#e1e2e6',
                  fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
                }}
              >
                {stat.value}
              </p>
              <p className="type-label" style={{ color: '#8d90a0' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (item.visual === 'ems') {
    return (
      <>
        <div className="absolute inset-0 bg-[#1d2023]" />
        <div className="absolute inset-x-5 top-5 grid gap-3 sm:grid-cols-3">
          {['농장 운영', '출하 판단', '정산 관리'].map((label) => (
            <div key={label} className="flex min-h-[92px] flex-col justify-between p-4" style={darkPanelStyle}>
              <span className="type-label" style={{ color: '#8d90a0' }}>{label}</span>
              <div className="space-y-2">
                <div className="h-2 w-full bg-[#434654]" />
                <div className="h-2 w-2/3 bg-[#323538]" />
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-x-5 bottom-5 top-[44%] p-5" style={darkPanelStyle}>
          <div className="mb-4 grid grid-cols-[1.1fr_repeat(3,minmax(0,0.72fr))] gap-3">
            {['운영 콘솔', '사육', '출하', '정산'].map((label) => (
              <div
                key={label}
                className="px-3 py-2"
                style={{ border: '1px solid rgba(67,70,84,0.30)', borderRadius: '4px', color: '#8d90a0' }}
              >
                <span className="type-label">{label}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {[0, 1, 2].map((row) => (
              <div key={row} className="grid grid-cols-[1.1fr_repeat(3,minmax(0,0.72fr))] gap-3">
                <div className="h-10 rounded-[4px] bg-[#323538]" />
                <div className="h-10 rounded-[4px] bg-[#272a2d]" />
                <div className="h-10 rounded-[4px] bg-[#272a2d]" />
                <div className="h-10 rounded-[4px] bg-[#272a2d]" />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  /* Default: AI sensing */
  return (
    <>
      <div className="absolute inset-0 bg-[#1d2023]" />
      <div className="absolute inset-x-5 bottom-5 top-5 grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
        <div className="p-5" style={darkPanelStyle}>
          <p className="type-label mb-4" style={{ color: '#8d90a0' }}>Live sensing</p>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 24 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square rounded-full"
                style={{
                  background:
                    index % 7 === 0 ? '#e1e2e6'
                    : index % 5 === 0 ? '#8d90a0'
                    : '#434654',
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {['평균 중량', '이상 감지', '출하 준비 상태'].map((label) => (
            <div key={label} className="flex-1 p-4" style={darkPanelStyle}>
              <p className="type-label mb-3" style={{ color: '#8d90a0' }}>{label}</p>
              <div className="space-y-2">
                <div className="h-2 w-full bg-[#434654]" />
                <div className="h-2 w-3/4 bg-[#323538]" />
                <div className="h-2 w-1/2 bg-[#272a2d]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function HomeFeaturedRail({ items }: HomeFeaturedRailProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const activateItem = (id: string) => {
    setActiveId(id);
    itemRefs.current[id]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-6">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => activateItem(item.id)}
                className="flex-shrink-0 px-4 py-2.5 text-left transition-colors duration-200"
                style={{
                  border: `1px solid ${isActive ? 'rgba(67,70,84,0.50)' : 'rgba(67,70,84,0.20)'}`,
                  borderRadius: '4px',
                  background: isActive ? '#272a2d' : 'transparent',
                  color: isActive ? '#e1e2e6' : '#8d90a0',
                }}
              >
                <span className="type-body-s">{item.tabLabel}</span>
              </button>
            );
          })}
        </div>

        <Link
          href="/services"
          className="hidden items-center gap-2 lg:inline-flex"
          style={{ color: '#8d90a0' }}
        >
          <span className="type-body-s">See All</span>
          <ArrowIcon />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 hide-scrollbar snap-x snap-mandatory">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <Link
              key={item.id}
              ref={(node) => {
                itemRefs.current[item.id] = node;
              }}
              href={item.href}
              onMouseEnter={() => setActiveId(item.id)}
              onFocus={() => setActiveId(item.id)}
              className="group min-w-[86vw] snap-start overflow-hidden sm:min-w-[28rem] xl:min-w-[30rem] transition-colors duration-200"
              style={{
                border: `1px solid ${isActive ? 'rgba(67,70,84,0.40)' : 'rgba(67,70,84,0.15)'}`,
                borderRadius: '4px',
                background: isActive ? '#191c1f' : '#111417',
              }}
            >
              <div className="relative h-[318px] border-b" style={{ borderColor: 'rgba(67,70,84,0.20)' }}>
                {/* Card badge */}
                <div
                  className="absolute left-5 top-5 z-10 px-3 py-2"
                  style={{
                    border: '1px solid rgba(67,70,84,0.30)',
                    borderRadius: '4px',
                    background: 'rgba(17,20,23,0.84)',
                    color: '#8d90a0',
                  }}
                >
                  <span className="type-label">{item.tabLabel}</span>
                </div>
                <RailVisual item={item} />
              </div>

              <div className="p-5 sm:p-6">
                <p className="type-label mb-3" style={{ color: '#8d90a0' }}>{item.label}</p>
                <h3
                  className="type-heading-s mb-3 line-clamp-2 whitespace-pre-line"
                  style={{ color: '#e1e2e6', maxWidth: '13ch', fontWeight: 500 }}
                >
                  {item.title}
                </h3>
                <p className="type-body-s line-clamp-2" style={{ color: '#c3c5d6', maxWidth: '28rem' }}>
                  {item.summary}
                </p>
                <div className="mt-6 inline-flex items-center gap-2" style={{ color: '#b5c4ff' }}>
                  <span className="type-body-s">Learn More</span>
                  <ArrowIcon />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
