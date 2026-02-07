'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface RightSidebarProps {
  lang: 'ko' | 'en';
}

// Seeded random for consistent values
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

// Generate survival rate data
const generateSurvivalData = () => {
  const data = [];
  for (let day = 1; day <= 51; day++) {
    data.push({
      day,
      survivalRate: 100 - (day * 0.05),
      culling: Math.max(0, Math.sin(day * 0.2) * 100),
    });
  }
  return data;
};

// Generate feedbin data
const generateFeedbinData = () => {
  const data = [];
  for (let i = 0; i < 100; i++) {
    const baseValue = 80 + Math.sin(i * 0.3) * 20;
    const spike = i % 15 < 3 ? 100 : baseValue;
    data.push({
      index: i,
      value: Math.round(spike),
    });
  }
  return data;
};

// Generate temperature data
const generateTempData = () => {
  const data = [];
  for (let i = 0; i < 100; i++) {
    data.push({
      index: i,
      value: 28 + Math.sin(i * 0.2) * 4 + seededRandom(i + 100) * 2,
    });
  }
  return data;
};

// Generate humidity data
const generateHumidityData = () => {
  const data = [];
  for (let i = 0; i < 100; i++) {
    data.push({
      index: i,
      value: 60 + Math.sin(i * 0.15) * 15 + seededRandom(i + 200) * 5,
    });
  }
  return data;
};

const survivalData = generateSurvivalData();
const feedbinData = generateFeedbinData();
const tempData = generateTempData();
const humidityData = generateHumidityData();

const t = {
  survivalRateCulling: { ko: '생존율 & 도태', en: 'SURVIVAL RATE & CULLING' },
  feedbinFullness: { ko: '사료빈 잔량', en: 'FEEDBIN FULLNESS' },
  temperature: { ko: '온도', en: 'TEMPERATURE' },
  humidity: { ko: '습도', en: 'HUMIDITY' },
};

const RightSidebar = ({ lang }: RightSidebarProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-full bg-[#161b22] border border-[#30363d] flex flex-col overflow-auto hide-scrollbar">
      {/* Survival Rate & Culling */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-gray-400 font-medium mb-3">{t.survivalRateCulling[lang]}</h3>
        <div className="h-[150px]">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={survivalData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#6b7280"
                  fontSize={9}
                  tickLine={false}
                  axisLine={{ stroke: '#374151' }}
                  ticks={[1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51]}
                />
                <YAxis
                  yAxisId="left"
                  width={30}
                  stroke="#6b7280"
                  fontSize={9}
                  tickLine={false}
                  axisLine={{ stroke: '#374151' }}
                  domain={[90, 100]}
                  ticks={[90, 92, 94, 96, 98, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis
                  yAxisId="right"
                  width={30}
                  orientation="right"
                  stroke="#6b7280"
                  fontSize={9}
                  tickLine={false}
                  axisLine={{ stroke: '#374151' }}
                  domain={[0, 500]}
                  ticks={[0, 100, 200, 300, 400, 500]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1c2128',
                    border: '1px solid #374151',
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="survivalRate"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="culling"
                  stroke="#8b5cf6"
                  strokeWidth={1}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Feedbin Fullness */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-400 font-medium">{t.feedbinFullness[lang]}</h3>
          <div className="flex items-center gap-1 text-[12px] font-bold text-[#8b949e]">
            <button className="hover:text-gray-300 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>H01B1</span>
            <button className="hover:text-gray-300 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="h-[120px]">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={feedbinData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="feedbinGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3fb950" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3fb950" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis
                  width={30}
                  stroke="#6b7280"
                  fontSize={9}
                  tickLine={false}
                  axisLine={{ stroke: '#374151' }}
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                />
                <Area
                  type="step"
                  dataKey="value"
                  stroke="#3fb950"
                  fill="url(#feedbinGradient)"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Temperature */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-400 font-medium">{t.temperature[lang]}</h3>
          <div className="flex items-center gap-1 text-[12px] font-bold text-[#8b949e]">
            <button className="hover:text-gray-300 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>H01T1</span>
            <button className="hover:text-gray-300 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="h-[120px]">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tempData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis
                  width={30}
                  stroke="#6b7280"
                  fontSize={9}
                  tickLine={false}
                  axisLine={{ stroke: '#374151' }}
                  domain={[20, 40]}
                  ticks={[20, 24, 28, 32, 36, 40]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#ef4444"
                  fill="url(#tempGradient)"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Humidity */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-400 font-medium">{t.humidity[lang]}</h3>
          <div className="flex items-center gap-1 text-[12px] font-bold text-[#8b949e]">
            <button className="hover:text-gray-300 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>H01T1</span>
            <button className="hover:text-gray-300 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="h-[120px]">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={humidityData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis
                  width={30}
                  stroke="#6b7280"
                  fontSize={9}
                  tickLine={false}
                  axisLine={{ stroke: '#374151' }}
                  domain={[40, 100]}
                  ticks={[40, 50, 60, 70, 80, 90, 100]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="url(#humidityGradient)"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
