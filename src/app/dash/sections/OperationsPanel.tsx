'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DashGrowthTrackItem, DashHouseTile, DashKpiCard } from '../mock-data';

interface OperationsPanelProps {
  kpiCards: DashKpiCard[];
  growthTrack: DashGrowthTrackItem[];
  houseTiles: DashHouseTile[];
}

const toneClassMap = {
  normal: 'text-[#3fb950]',
  caution: 'text-[#d29922]',
  alert: 'text-[#f85149]',
  unknown: 'text-[#8b949e]',
} as const;

const trackDescriptionMap: Record<string, string> = {
  입추: '이번 주 입추 집계',
  성장: '육성률 실시간 기준',
  출하: '이번 주 출하 집계',
};

const OperationsPanel = ({ kpiCards, growthTrack, houseTiles }: OperationsPanelProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statusChartData = useMemo(
    () => [
      { name: '정상', count: houseTiles.filter((item) => item.status === 'normal').length, color: '#3fb950' },
      { name: '주의', count: houseTiles.filter((item) => item.status === 'caution').length, color: '#d29922' },
      { name: '경고', count: houseTiles.filter((item) => item.status === 'alert').length, color: '#f85149' },
    ],
    [houseTiles]
  );

  const environmentChartData = useMemo(
    () => [
      { name: '고온(>=33C)', count: houseTiles.filter((item) => (item.temperature ?? 0) >= 33).length, color: '#f85149' },
      { name: '고습(>=70%)', count: houseTiles.filter((item) => (item.humidity ?? 0) >= 70).length, color: '#79c0ff' },
      { name: '저사료(<=25%)', count: houseTiles.filter((item) => (item.feedbin ?? 100) <= 25).length, color: '#3fb950' },
      { name: '센서없음', count: houseTiles.filter((item) => item.temperature === null || item.humidity === null).length, color: '#8b949e' },
    ],
    [houseTiles]
  );

  const trackBars = useMemo(
    () =>
      growthTrack.map((item) => ({
        name: item.label,
        progress: item.progress,
        valueLabel: item.value,
        color:
          item.tone === 'normal'
            ? '#3fb950'
            : item.tone === 'caution'
              ? '#d29922'
              : item.tone === 'alert'
                ? '#f85149'
                : '#8b949e',
      })),
    [growthTrack]
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      <section className="h-[182px] shrink-0 overflow-hidden border border-[#30363d] bg-[#161b22] p-3">
        <h2 className="mb-3 text-sm font-semibold text-[#e6edf3]">운영 핵심 KPI</h2>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((card) => (
            <article key={card.title} className="border border-[#30363d] bg-[#0d1117] p-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-[#8b949e]">{card.title}</p>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                    card.tone === 'normal'
                      ? 'bg-[#3fb9501f] text-[#3fb950]'
                      : card.tone === 'caution'
                        ? 'bg-[#d299221f] text-[#d29922]'
                        : card.tone === 'alert'
                          ? 'bg-[#f851491f] text-[#f85149]'
                          : 'bg-[#8b949e1f] text-[#8b949e]'
                  }`}
                >
                  {card.tone.toUpperCase()}
                </span>
              </div>
              <p className={`mt-2 text-3xl font-bold tracking-tight ${toneClassMap[card.tone]}`}>{card.value}</p>
              <p className="mt-1 text-[10px] text-[#6e7681]">{card.subValue}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="h-[286px] shrink-0 overflow-hidden border border-[#30363d] bg-[#161b22] p-3">
        <h2 className="mb-3 text-sm font-semibold text-[#e6edf3]">입추-성장-출하 분석 트랙</h2>
        <div className="space-y-3 border border-[#30363d] bg-[#0d1117] p-3">
          <div className="grid gap-3 md:grid-cols-3">
            {growthTrack.map((item) => (
              <article key={item.label} className="border border-[#30363d] bg-[#111826] p-3">
                <div className="flex items-end justify-between">
                  <p className="text-sm font-semibold text-[#e6edf3]">{item.label}</p>
                  <p className={`text-xl font-bold tracking-tight ${toneClassMap[item.tone]}`}>{item.value}</p>
                </div>
                <p className="mt-1 text-[10px] text-[#6e7681]">
                  {trackDescriptionMap[item.label] ?? '운영 지표'}
                </p>
                <div className="mt-3 h-4 w-full overflow-hidden rounded-sm bg-[#21262d]">
                  <div
                    className={`h-full ${
                      item.tone === 'normal'
                        ? 'bg-[#3fb950]'
                        : item.tone === 'caution'
                          ? 'bg-[#d29922]'
                          : item.tone === 'alert'
                            ? 'bg-[#f85149]'
                            : 'bg-[#8b949e]'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-[11px] font-medium text-[#8b949e]">진행률 {item.progress}%</p>
              </article>
            ))}
          </div>

          <div className="h-[118px] w-full overflow-hidden border border-[#30363d] bg-[#111826] p-2">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trackBars} layout="vertical" margin={{ top: 6, right: 24, left: 8, bottom: 2 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363d" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: '#8b949e', fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: '#30363d' }}
                    unit="%"
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={44}
                    tick={{ fill: '#c9d1d9', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#30363d' }}
                  />
                  <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d' }} />
                  <Bar dataKey="progress" radius={[3, 3, 3, 3]} barSize={20}>
                    {trackBars.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                    <LabelList dataKey="valueLabel" position="right" fill="#e6edf3" fontSize={11} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full animate-pulse bg-[#0d1117]" />
            )}
          </div>

          <p className="pt-0.5 text-[10px] text-[#8b949e]">
            1차에서는 알람 중심 오버레이만 제공하고, 이벤트 라벨 계층화는 2차 스프린트에서 연동합니다.
          </p>
        </div>
      </section>

      <section className="flex-1 min-h-0 overflow-hidden border border-[#30363d] bg-[#161b22] p-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#e6edf3]">운영 분포 요약</h2>
          <p className="text-[11px] text-[#8b949e]">전체 {houseTiles.length}동 기준</p>
        </div>

        <div className="mt-3 grid gap-2 lg:grid-cols-2">
          <div className="border border-[#30363d] bg-[#0d1117] p-2">
            <p className="mb-1 text-[11px] text-[#8b949e]">상태 분포</p>
            <div className="h-[96px]">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusChartData} margin={{ top: 6, right: 6, left: -14, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#8b949e', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#30363d' }} />
                    <YAxis tick={{ fill: '#8b949e', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#30363d' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d' }} />
                    <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                      {statusChartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full animate-pulse bg-[#111826]" />
              )}
            </div>
          </div>

          <div className="border border-[#30363d] bg-[#0d1117] p-2">
            <p className="mb-1 text-[11px] text-[#8b949e]">환경 이상 분포</p>
            <div className="h-[96px]">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={environmentChartData} margin={{ top: 6, right: 6, left: -14, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#8b949e', fontSize: 9 }}
                      tickLine={false}
                      axisLine={{ stroke: '#30363d' }}
                    />
                    <YAxis tick={{ fill: '#8b949e', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#30363d' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d' }} />
                    <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                      {environmentChartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full animate-pulse bg-[#111826]" />
              )}
            </div>
          </div>
        </div>

        <p className="mt-2 text-[10px] text-[#8b949e]">
          목록형 상세는 제외했고, 상태/환경 분포만 남겼습니다.
        </p>
      </section>
    </div>
  );
};

export default OperationsPanel;
