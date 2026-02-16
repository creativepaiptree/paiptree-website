'use client';

import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DashSensorCard } from '../mock-data';

interface SensorPanelProps {
  sensors: DashSensorCard[];
}

const metricClassMap = {
  temperature: 'text-[#f85149]',
  humidity: 'text-[#79c0ff]',
  feedbin: 'text-[#3fb950]',
} as const;

const formatValue = (value: number | null, unit: string): string => {
  if (value === null || Number.isNaN(value)) return 'N/A';
  return `${value.toFixed(1)}${unit}`;
};

const toChartData = (values: number[]) => values.map((value, index) => ({ idx: index + 1, value }));

const SensorPanel = ({ sensors }: SensorPanelProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-full overflow-auto border border-[#30363d] bg-[#161b22] p-3 hide-scrollbar">
      <h2 className="mb-3 text-sm font-semibold text-[#e6edf3]">하우스 센서 패널</h2>
      {sensors.length === 0 ? (
        <div className="border border-[#30363d] bg-[#0d1117] p-3 text-xs text-[#8b949e]">
          선택한 조건에 해당하는 센서 데이터가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
        {sensors.map((sensor) => (
          <article key={sensor.id} className="border border-[#30363d] bg-[#0d1117] p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#e6edf3]">{sensor.title}</p>
              <span className="text-[11px] text-[#8b949e]">최근 12포인트</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div className="border border-[#30363d] bg-[#111826] px-2 py-1">
                <p className="text-[10px] text-[#8b949e]">온도</p>
                <p className={`text-base font-bold tracking-tight ${metricClassMap.temperature}`}>
                  {formatValue(sensor.temperature, '°C')}
                </p>
              </div>
              <div className="border border-[#30363d] bg-[#111826] px-2 py-1">
                <p className="text-[10px] text-[#8b949e]">습도</p>
                <p className={`text-base font-bold tracking-tight ${metricClassMap.humidity}`}>
                  {formatValue(sensor.humidity, '%')}
                </p>
              </div>
              <div className="border border-[#30363d] bg-[#111826] px-2 py-1">
                <p className="text-[10px] text-[#8b949e]">사료빈</p>
                <p className={`text-base font-bold tracking-tight ${metricClassMap.feedbin}`}>
                  {formatValue(sensor.feedbin, '%')}
                </p>
              </div>
            </div>
            <div className="mt-2 space-y-2">
              <div className="overflow-hidden border border-[#30363d] bg-[#111826] p-2">
                <p className="mb-1 text-[10px] text-[#8b949e]">온도 트렌드</p>
                <div className="h-[92px]">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={toChartData(sensor.tempTrend)} margin={{ top: 4, right: 0, left: -16, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`temp-${sensor.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f85149" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#f85149" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
                        <XAxis hide dataKey="idx" />
                        <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                        <Tooltip
                          cursor={{ stroke: '#6e7681', strokeWidth: 1 }}
                          contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d' }}
                          labelStyle={{ color: '#8b949e' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#f85149" fill={`url(#temp-${sensor.id})`} strokeWidth={1.8} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full animate-pulse bg-[#0d1117]" />
                  )}
                </div>
              </div>

              <div className="overflow-hidden border border-[#30363d] bg-[#111826] p-2">
                <p className="mb-1 text-[10px] text-[#8b949e]">습도 트렌드</p>
                <div className="h-[92px]">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={toChartData(sensor.humidTrend)} margin={{ top: 4, right: 0, left: -16, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`humid-${sensor.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#79c0ff" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#79c0ff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
                        <XAxis hide dataKey="idx" />
                        <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                        <Tooltip
                          cursor={{ stroke: '#6e7681', strokeWidth: 1 }}
                          contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d' }}
                          labelStyle={{ color: '#8b949e' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#79c0ff" fill={`url(#humid-${sensor.id})`} strokeWidth={1.8} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full animate-pulse bg-[#0d1117]" />
                  )}
                </div>
              </div>

              <div className="overflow-hidden border border-[#30363d] bg-[#111826] p-2">
                <p className="mb-1 text-[10px] text-[#8b949e]">사료빈 트렌드</p>
                <div className="h-[92px]">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={toChartData(sensor.feedTrend)} margin={{ top: 4, right: 0, left: -16, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`feed-${sensor.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3fb950" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#3fb950" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
                        <XAxis hide dataKey="idx" />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                          cursor={{ stroke: '#6e7681', strokeWidth: 1 }}
                          contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d' }}
                          labelStyle={{ color: '#8b949e' }}
                        />
                        <Area type="stepAfter" dataKey="value" stroke="#3fb950" fill={`url(#feed-${sensor.id})`} strokeWidth={1.8} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full animate-pulse bg-[#0d1117]" />
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
        </div>
      )}
    </div>
  );
};

export default SensorPanel;
