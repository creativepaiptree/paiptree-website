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
import TraceableValue from '../components/trace/TraceableValue';
import type { TraceabilityPayload } from '@/types/traceability';

interface RightSidebarProps {
  lang: 'ko' | 'en';
  feedbinBySensor?: Record<string, SensorSeriesRecord[]>;
  temperatureBySensor?: Record<string, SensorSeriesRecord[]>;
  humidityBySensor?: Record<string, SensorSeriesRecord[]>;
  totalBirdCount?: number;
  onOpenTrace: (trace: TraceabilityPayload) => void;
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
  onOpenTrace,
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

  const latestSurvival = survivalData[survivalData.length - 1];
  const latestFeedbinValue = feedbinChartData[feedbinChartData.length - 1]?.value ?? 0;
  const latestTemperatureValue = temperatureChartData[temperatureChartData.length - 1]?.value ?? 0;
  const latestHumidityValue = humidityChartData[humidityChartData.length - 1]?.value ?? 0;

  const survivalTrace: TraceabilityPayload = {
    trace_id: 'right-sidebar:survival-rate',
    display_value: `${latestSurvival?.survivalRate ?? 0}%`,
    logic_summary:
      lang === 'ko'
        ? '총 사육수에서 누적 도태수를 제외해 생존율을 계산했습니다.'
        : 'Survival is calculated from total birds minus cumulative culling.',
    logic_formula:
      lang === 'ko'
        ? `생존율 = (총마릿수-${latestSurvival?.culling ?? 0})/총마릿수 × 100`
        : `survival = (total-${latestSurvival?.culling ?? 0})/total × 100`,
    data_source: [
      {
        source_id: 'db:survival_daily:2026-02-07',
        type: 'db',
        name: 'survival_daily',
        url: 'https://p-root.local/db/survival_daily?date=2026-02-07',
        row_id: `day=${latestSurvival?.day ?? 0}`,
        highlight_text: `survival=${latestSurvival?.survivalRate ?? 0}%`,
        highlight_anchor: `day=${latestSurvival?.day ?? 0}`,
      },
    ],
    is_ai_generated: false,
    source_version: 'v2026.02.11',
    snapshot_at: '2026-02-07 20:00:00',
  };

  const cullingTrace: TraceabilityPayload = {
    trace_id: 'right-sidebar:culling-daily',
    display_value: `${latestSurvival?.culling ?? 0}`,
    logic_summary:
      lang === 'ko'
        ? '일자별 도태 기록을 집계한 당일 도태 마릿수입니다.'
        : 'Daily culling count aggregated from per-event culling logs.',
    logic_formula: lang === 'ko' ? '당일 도태 = Σ(도태 이벤트 수량)' : 'daily_culling = Σ(culling events)',
    data_source: [
      {
        source_id: 'db:culling_events:2026-02-07',
        type: 'db',
        name: 'culling_events',
        url: 'https://p-root.local/db/culling_events?date=2026-02-07',
        row_id: `day=${latestSurvival?.day ?? 0}`,
        highlight_text: `culling=${latestSurvival?.culling ?? 0}`,
        highlight_anchor: `day=${latestSurvival?.day ?? 0}`,
      },
    ],
    is_ai_generated: false,
    source_version: 'v2026.02.11',
    snapshot_at: '2026-02-07 20:00:00',
  };

  const feedbinTrace: TraceabilityPayload = {
    trace_id: 'right-sidebar:feedbin-latest',
    display_value: `${Math.round(latestFeedbinValue)}%`,
    logic_summary:
      lang === 'ko'
        ? `${currentFeedbinSensorId} 센서의 최신 사료빈 잔량 측정값입니다.`
        : `Latest feedbin fullness from sensor ${currentFeedbinSensorId}.`,
    logic_formula: lang === 'ko' ? '표시값 = 최신 센서 average_value' : 'display = latest sensor average_value',
    data_source: [
      {
        source_id: `db:feedbin:${currentFeedbinSensorId}`,
        type: 'db',
        name: 'sensor_feedbin_hourly',
        url: `https://p-root.local/db/sensor_feedbin_hourly?sensor=${currentFeedbinSensorId}`,
        row_id: `sensor=${currentFeedbinSensorId}`,
        highlight_text: `latest=${Math.round(latestFeedbinValue)}%`,
        highlight_anchor: `sensor=${currentFeedbinSensorId}`,
      },
    ],
    is_ai_generated: false,
    source_version: 'v2026.02.11',
    snapshot_at: '2026-02-07 20:00:00',
  };

  const temperatureTrace: TraceabilityPayload = {
    trace_id: 'right-sidebar:temperature-latest',
    display_value: `${latestTemperatureValue.toFixed(1)}°C`,
    logic_summary:
      lang === 'ko'
        ? `${currentTemperatureSensorId} 센서의 최신 온도 측정값입니다.`
        : `Latest temperature from sensor ${currentTemperatureSensorId}.`,
    logic_formula: lang === 'ko' ? '표시값 = 최신 센서 average_value' : 'display = latest sensor average_value',
    data_source: [
      {
        source_id: `db:temperature:${currentTemperatureSensorId}`,
        type: 'db',
        name: 'sensor_temperature_hourly',
        url: `https://p-root.local/db/sensor_temperature_hourly?sensor=${currentTemperatureSensorId}`,
        row_id: `sensor=${currentTemperatureSensorId}`,
        highlight_text: `latest=${latestTemperatureValue.toFixed(1)}°C`,
        highlight_anchor: `sensor=${currentTemperatureSensorId}`,
      },
    ],
    is_ai_generated: false,
    source_version: 'v2026.02.11',
    snapshot_at: '2026-02-07 20:00:00',
  };

  const humidityTrace: TraceabilityPayload = {
    trace_id: 'right-sidebar:humidity-latest',
    display_value: `${latestHumidityValue.toFixed(1)}%`,
    logic_summary:
      lang === 'ko'
        ? `${currentHumiditySensorId} 센서의 최신 습도 측정값입니다.`
        : `Latest humidity from sensor ${currentHumiditySensorId}.`,
    logic_formula: lang === 'ko' ? '표시값 = 최신 센서 average_value' : 'display = latest sensor average_value',
    data_source: [
      {
        source_id: `db:humidity:${currentHumiditySensorId}`,
        type: 'db',
        name: 'sensor_humidity_hourly',
        url: `https://p-root.local/db/sensor_humidity_hourly?sensor=${currentHumiditySensorId}`,
        row_id: `sensor=${currentHumiditySensorId}`,
        highlight_text: `latest=${latestHumidityValue.toFixed(1)}%`,
        highlight_anchor: `sensor=${currentHumiditySensorId}`,
      },
    ],
    is_ai_generated: false,
    source_version: 'v2026.02.11',
    snapshot_at: '2026-02-07 20:00:00',
  };

  return (
    <div className="h-full bg-[#161b22] border border-[#30363d] flex flex-col overflow-auto hide-scrollbar">
      {/* Survival Rate & Culling */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-gray-400 font-medium mb-3">{t.survivalRateCulling[lang]}</h3>
        <div className="mb-2 grid grid-cols-2 gap-2">
          <TraceableValue
            value={`${latestSurvival?.survivalRate ?? 0}%`}
            trace={survivalTrace}
            onOpenTrace={onOpenTrace}
            indicatorMode="compact"
            valueClassName="text-xs font-semibold text-[#f97316]"
            className="bg-[#0d1117] border border-[#30363d] px-2 py-1 justify-between"
          />
          <TraceableValue
            value={`${latestSurvival?.culling ?? 0}`}
            trace={cullingTrace}
            onOpenTrace={onOpenTrace}
            indicatorMode="compact"
            valueClassName="text-xs font-semibold text-[#8b5cf6]"
            className="bg-[#0d1117] border border-[#30363d] px-2 py-1 justify-between"
          />
        </div>
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
        <TraceableValue
          value={`${Math.round(latestFeedbinValue)}%`}
          trace={feedbinTrace}
          onOpenTrace={onOpenTrace}
          indicatorMode="compact"
          align="right"
          valueClassName="text-xs font-semibold text-[#3fb950]"
          className="mb-2 border border-[#30363d] bg-[#0d1117] px-2 py-1 justify-between"
        />
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
        <TraceableValue
          value={`${latestTemperatureValue.toFixed(1)}°C`}
          trace={temperatureTrace}
          onOpenTrace={onOpenTrace}
          indicatorMode="compact"
          align="right"
          valueClassName="text-xs font-semibold text-[#ef4444]"
          className="mb-2 border border-[#30363d] bg-[#0d1117] px-2 py-1 justify-between"
        />
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
        <TraceableValue
          value={`${latestHumidityValue.toFixed(1)}%`}
          trace={humidityTrace}
          onOpenTrace={onOpenTrace}
          indicatorMode="compact"
          align="right"
          valueClassName="text-xs font-semibold text-[#3b82f6]"
          className="mb-2 border border-[#30363d] bg-[#0d1117] px-2 py-1 justify-between"
        />
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
