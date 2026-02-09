'use client';

import { useState, useEffect, useMemo } from 'react';
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
  feedbinBySensor?: Record<string, SensorSeriesRecord[]>;
  temperatureBySensor?: Record<string, SensorSeriesRecord[]>;
  humidityBySensor?: Record<string, SensorSeriesRecord[]>;
  totalBirdCount?: number;
}

export interface SensorSeriesRecord {
  stat_time: string;
  average_value?: number | string;
  value?: number | string;
  temp?: number | string;
  temperature?: number | string;
  humidity?: number | string;
  farm_id?: string;
  module_id?: string;
  house_id?: string;
  data_type?: string;
  [key: string]: unknown;
}

type ChartPoint = {
  index: number;
  value: number;
};

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const mapSensorSeriesToChartData = (
  series: SensorSeriesRecord[] | undefined,
  fallback: ChartPoint[],
  valueKeys: string[]
): ChartPoint[] => {
  if (!series || series.length === 0) {
    return fallback;
  }

  const mapped = [...series]
    .sort((a, b) => a.stat_time.localeCompare(b.stat_time))
    .map((item, index) => {
      for (const key of valueKeys) {
        const numericValue = toFiniteNumber(item[key]);
        if (numericValue !== null) {
          return {
            index,
            value: numericValue,
          };
        }
      }
      return null;
    })
    .filter((item): item is ChartPoint => item !== null);

  return mapped.length > 0 ? mapped : fallback;
};

const buildAxis = (
  data: ChartPoint[],
  options: {
    defaultMin: number;
    defaultMax: number;
    step: number;
    padding: number;
    minLimit?: number;
    maxLimit?: number;
  }
) => {
  if (data.length === 0) {
    const ticks: number[] = [];
    for (let tick = options.defaultMin; tick <= options.defaultMax; tick += options.step) {
      ticks.push(tick);
    }
    return { min: options.defaultMin, max: options.defaultMax, ticks };
  }

  let minValue = Number.POSITIVE_INFINITY;
  let maxValue = Number.NEGATIVE_INFINITY;
  for (const point of data) {
    if (point.value < minValue) minValue = point.value;
    if (point.value > maxValue) maxValue = point.value;
  }

  let min = Math.floor((minValue - options.padding) / options.step) * options.step;
  let max = Math.ceil((maxValue + options.padding) / options.step) * options.step;

  if (options.minLimit !== undefined) min = Math.max(options.minLimit, min);
  if (options.maxLimit !== undefined) max = Math.min(options.maxLimit, max);
  if (max <= min) max = min + options.step;
  if (options.maxLimit !== undefined && max > options.maxLimit) {
    min = Math.max(options.minLimit ?? Number.NEGATIVE_INFINITY, max - options.step);
  }

  const ticks: number[] = [];
  for (let tick = min; tick <= max; tick += options.step) {
    ticks.push(Number(tick.toFixed(4)));
  }
  if (ticks.length < 2) {
    ticks.push(Number((min + options.step).toFixed(4)));
  }

  return { min, max, ticks };
};

// Seeded random for consistent values
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

const generateCullingByDay = (day: number) => {
  if (day <= 10) {
    // Early age: around 100 birds/day
    return Math.round(80 + seededRandom(day + 300) * 50);
  }

  // Later age: 2~30 birds/day
  return Math.round(2 + seededRandom(day + 300) * 28);
};

// Generate survival rate data from cumulative culling
const generateSurvivalData = (totalBirdCount: number) => {
  const data = [];
  const safeTotal = Math.max(1, totalBirdCount);
  let cumulativeCulling = 0;

  for (let day = 1; day <= 51; day++) {
    const culling = generateCullingByDay(day);
    cumulativeCulling = Math.min(safeTotal, cumulativeCulling + culling);
    const survivalRate = ((safeTotal - cumulativeCulling) / safeTotal) * 100;

    data.push({
      day,
      survivalRate: Number(survivalRate.toFixed(2)),
      culling,
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

const feedbinData = generateFeedbinData();
const tempData = generateTempData();
const humidityData = generateHumidityData();

const t = {
  survivalRateCulling: { ko: '생존율 & 도태', en: 'SURVIVAL RATE & CULLING' },
  feedbinFullness: { ko: '사료빈 잔량', en: 'FEEDBIN FULLNESS' },
  temperature: { ko: '온도', en: 'TEMPERATURE' },
  humidity: { ko: '습도', en: 'HUMIDITY' },
};

const RightSidebar = ({
  lang,
  feedbinBySensor,
  temperatureBySensor,
  humidityBySensor,
  totalBirdCount = 20500,
}: RightSidebarProps) => {
  const [mounted, setMounted] = useState(false);
  const [feedbinSensorIndex, setFeedbinSensorIndex] = useState(0);
  const [temperatureSensorIndex, setTemperatureSensorIndex] = useState(0);
  const [humiditySensorIndex, setHumiditySensorIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const feedbinSensorIds = useMemo(() => {
    const ids = Object.keys(feedbinBySensor ?? {});
    return ids.length > 0 ? ids : ['H01B1'];
  }, [feedbinBySensor]);

  useEffect(() => {
    if (feedbinSensorIndex >= feedbinSensorIds.length) {
      setFeedbinSensorIndex(0);
    }
  }, [feedbinSensorIds.length, feedbinSensorIndex]);

  const currentFeedbinSensorId = feedbinSensorIds[feedbinSensorIndex] ?? 'H01B1';

  const feedbinChartData = useMemo(() => {
    return mapSensorSeriesToChartData(feedbinBySensor?.[currentFeedbinSensorId], feedbinData, [
      'average_value',
      'feedbin_percent',
      'feedbin',
      'percent',
      'value',
    ]);
  }, [feedbinBySensor, currentFeedbinSensorId]);

  const feedbinAxis = useMemo(() => {
    return buildAxis(feedbinChartData, {
      defaultMin: 0,
      defaultMax: 100,
      step: 20,
      padding: 2,
      minLimit: 0,
      maxLimit: 100,
    });
  }, [feedbinChartData]);

  const temperatureSensorIds = useMemo(() => {
    const ids = Object.keys(temperatureBySensor ?? {});
    return ids.length > 0 ? ids : ['H01T1'];
  }, [temperatureBySensor]);

  useEffect(() => {
    if (temperatureSensorIndex >= temperatureSensorIds.length) {
      setTemperatureSensorIndex(0);
    }
  }, [temperatureSensorIds.length, temperatureSensorIndex]);

  const currentTemperatureSensorId = temperatureSensorIds[temperatureSensorIndex] ?? 'H01T1';

  const temperatureChartData = useMemo(() => {
    return mapSensorSeriesToChartData(temperatureBySensor?.[currentTemperatureSensorId], tempData, [
      'average_value',
      'temperature',
      'temp',
      'value',
    ]);
  }, [temperatureBySensor, currentTemperatureSensorId]);

  const temperatureAxis = useMemo(() => {
    return buildAxis(temperatureChartData, {
      defaultMin: 20,
      defaultMax: 40,
      step: 2,
      padding: 1,
    });
  }, [temperatureChartData]);

  const humiditySensorIds = useMemo(() => {
    const ids = Object.keys(humidityBySensor ?? {});
    return ids.length > 0 ? ids : ['H01T1'];
  }, [humidityBySensor]);

  useEffect(() => {
    if (humiditySensorIndex >= humiditySensorIds.length) {
      setHumiditySensorIndex(0);
    }
  }, [humiditySensorIds.length, humiditySensorIndex]);

  const currentHumiditySensorId = humiditySensorIds[humiditySensorIndex] ?? 'H01T1';

  const humidityChartData = useMemo(() => {
    return mapSensorSeriesToChartData(humidityBySensor?.[currentHumiditySensorId], humidityData, [
      'average_value',
      'humidity',
      'value',
    ]);
  }, [humidityBySensor, currentHumiditySensorId]);

  const humidityAxis = useMemo(() => {
    return buildAxis(humidityChartData, {
      defaultMin: 40,
      defaultMax: 100,
      step: 10,
      padding: 2,
      minLimit: 0,
      maxLimit: 100,
    });
  }, [humidityChartData]);

  const canNavigateFeedbinSensors = feedbinSensorIds.length > 1;
  const canNavigateTemperatureSensors = temperatureSensorIds.length > 1;
  const canNavigateHumiditySensors = humiditySensorIds.length > 1;

  const goPrevFeedbinSensor = () => {
    if (!canNavigateFeedbinSensors) return;
    setFeedbinSensorIndex((prev) => (prev - 1 + feedbinSensorIds.length) % feedbinSensorIds.length);
  };

  const goNextFeedbinSensor = () => {
    if (!canNavigateFeedbinSensors) return;
    setFeedbinSensorIndex((prev) => (prev + 1) % feedbinSensorIds.length);
  };

  const goPrevTemperatureSensor = () => {
    if (!canNavigateTemperatureSensors) return;
    setTemperatureSensorIndex((prev) => (prev - 1 + temperatureSensorIds.length) % temperatureSensorIds.length);
  };

  const goNextTemperatureSensor = () => {
    if (!canNavigateTemperatureSensors) return;
    setTemperatureSensorIndex((prev) => (prev + 1) % temperatureSensorIds.length);
  };

  const goPrevHumiditySensor = () => {
    if (!canNavigateHumiditySensors) return;
    setHumiditySensorIndex((prev) => (prev - 1 + humiditySensorIds.length) % humiditySensorIds.length);
  };

  const goNextHumiditySensor = () => {
    if (!canNavigateHumiditySensors) return;
    setHumiditySensorIndex((prev) => (prev + 1) % humiditySensorIds.length);
  };

  const survivalData = useMemo(() => generateSurvivalData(totalBirdCount), [totalBirdCount]);

  const cullingAxis = useMemo(() => {
    const chartData = survivalData.map((item) => ({ index: item.day, value: item.culling }));
    return buildAxis(chartData, {
      defaultMin: 0,
      defaultMax: 140,
      step: 20,
      padding: 5,
      minLimit: 0,
    });
  }, [survivalData]);

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
                  domain={[cullingAxis.min, cullingAxis.max]}
                  ticks={cullingAxis.ticks}
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
            <button
              onClick={goPrevFeedbinSensor}
              disabled={!canNavigateFeedbinSensors}
              className="hover:text-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>{currentFeedbinSensorId}</span>
            <button
              onClick={goNextFeedbinSensor}
              disabled={!canNavigateFeedbinSensors}
              className="hover:text-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="h-[120px]">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={feedbinChartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
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
                  domain={[feedbinAxis.min, feedbinAxis.max]}
                  ticks={feedbinAxis.ticks}
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
            <button
              onClick={goPrevTemperatureSensor}
              disabled={!canNavigateTemperatureSensors}
              className="hover:text-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>{currentTemperatureSensorId}</span>
            <button
              onClick={goNextTemperatureSensor}
              disabled={!canNavigateTemperatureSensors}
              className="hover:text-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="h-[120px]">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={temperatureChartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
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
                  domain={[temperatureAxis.min, temperatureAxis.max]}
                  ticks={temperatureAxis.ticks}
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
            <button
              onClick={goPrevHumiditySensor}
              disabled={!canNavigateHumiditySensors}
              className="hover:text-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>{currentHumiditySensorId}</span>
            <button
              onClick={goNextHumiditySensor}
              disabled={!canNavigateHumiditySensors}
              className="hover:text-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="h-[120px]">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={humidityChartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
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
                  domain={[humidityAxis.min, humidityAxis.max]}
                  ticks={humidityAxis.ticks}
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
