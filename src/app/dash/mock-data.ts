import type {
  EmsBinaryState,
  EmsDataMonitorResponse,
  EmsFarmStatus,
  EmsHealthState,
} from '@/contracts/ems-dashboard';

export interface DashStatusMetric {
  label: string;
  value: string;
  detail: string;
  tone: EmsHealthState;
}

export interface DashKpiCard {
  title: string;
  value: string;
  subValue: string;
  tone: EmsHealthState;
}

export interface DashAlertItem {
  id: string;
  level: 'normal' | 'caution' | 'alert';
  createdAt: string;
  farmLabel: string;
  message: string;
  code: string;
}

export interface DashActionItem {
  id: string;
  target: string;
  issue: string;
  owner: string;
  dueText: string;
  priority: 'P1' | 'P2' | 'P3';
}

export interface DashGrowthTrackItem {
  label: string;
  value: string;
  progress: number;
  tone: EmsHealthState;
}

export type DashFarmStatus = 'normal' | 'caution' | 'alert';

export interface DashHouseTile {
  id: string;
  name: string;
  region: string;
  operating: boolean;
  cleaningReady: boolean;
  fault: boolean;
  powerOn: boolean;
  status: DashFarmStatus;
  temperature: number | null;
  humidity: number | null;
  feedbin: number | null;
  environmentRisk: number;
}

export interface DashSensorCard {
  id: string;
  title: string;
  temperature: number | null;
  humidity: number | null;
  feedbin: number | null;
  tempTrend: number[];
  humidTrend: number[];
  feedTrend: number[];
}

export interface DashViewModel {
  lastUpdatedAt: string;
  statusMetrics: DashStatusMetric[];
  kpiCards: DashKpiCard[];
  alerts: DashAlertItem[];
  actions: DashActionItem[];
  growthTrack: DashGrowthTrackItem[];
  houseTiles: DashHouseTile[];
  sensors: DashSensorCard[];
}

const dataMonitorSample: EmsDataMonitorResponse = {
  // Large-farm scenario sample: 24 farms x 5 houses = 120 houses.
  // The page logic should work as list/filter/sort first, not card explosion.
  iot_system: true,
  cloud_system: true,
  service_platform: true,
  breed_detection: true,
  weight_prediction: 'N',
  total_running_farm_count: 18,
  total_farm_count: 22,
  total_upbringing_rate: 93.4,
  total_rearing_count: 128540,
  input_list: [
    {
      date: '2026-02-13',
      affiliate_name: '동부권역',
      farm_name: '청주농장',
      house_name: 'H-01',
      count: 6420,
      kind: 'input',
    },
    {
      date: '2026-02-12',
      affiliate_name: '서부권역',
      farm_name: '홍성농장',
      house_name: 'H-03',
      count: 6280,
      kind: 'input',
    },
  ],
  output_list: [
    {
      date: '2026-02-13',
      affiliate_name: '동부권역',
      farm_name: '청주농장',
      house_name: 'H-02',
      count: 5870,
      kind: 'output',
    },
    {
      date: '2026-02-12',
      affiliate_name: '남부권역',
      farm_name: '익산농장',
      house_name: 'H-01',
      count: 5980,
      kind: 'output',
    },
  ],
  all_farm_list: [],
};

const buildFarmStatusList = (): EmsFarmStatus[] => {
  const regionPool = ['동부권역', '서부권역', '남부권역', '북부권역'];
  const farmPool = ['청주농장', '홍성농장', '익산농장', '김제농장', '천안농장', '정읍농장'];
  const list: EmsFarmStatus[] = [];

  let index = 0;
  for (let farmIndex = 0; farmIndex < 24; farmIndex += 1) {
    const region = regionPool[farmIndex % regionPool.length];
    const farmBase = farmPool[farmIndex % farmPool.length];
    const farmName = `${region} ${farmBase}${Math.floor(farmIndex / farmPool.length) + 1}`;

    for (let houseIndex = 1; houseIndex <= 5; houseIndex += 1) {
      index += 1;
      const fault = index % 17 === 0 || index % 29 === 0;
      const allWorking = !fault && index % 11 !== 0;
      const allPowerOn = !fault && index % 13 !== 0;
      const allClean = index % 7 !== 0;
      const sensorMissing = index % 19 === 0;
      const temperature = sensorMissing ? null : Number((29 + ((index * 7) % 58) / 10).toFixed(1));
      const humidity = sensorMissing ? null : Number((48 + ((index * 9) % 280) / 10).toFixed(1));
      const feedbin = sensorMissing ? null : Number((22 + ((index * 5) % 680) / 10).toFixed(1));

      list.push({
        id: `farm-${farmIndex + 1}-h${houseIndex}`,
        farm_name: farmName,
        house_name: `H-${String(houseIndex).padStart(2, '0')}`,
        rearing: true,
        all_working: allWorking,
        all_power_on: allPowerOn,
        all_clean: allClean,
        fault,
        temperature,
        humidity,
        feedbin,
      });
    }
  }

  return list;
};

const generatedFarmList = buildFarmStatusList();

dataMonitorSample.total_farm_count = generatedFarmList.length;
dataMonitorSample.total_running_farm_count = generatedFarmList.filter((farm) => farm.all_working).length;
dataMonitorSample.all_farm_list = generatedFarmList;

const numberFormatter = new Intl.NumberFormat('ko-KR');

const toHealthState = (value: EmsBinaryState): EmsHealthState => {
  if (value === true || value === 'Y') return 'normal';
  if (value === false || value === 'N') return 'alert';
  return 'unknown';
};

const toToneFromRate = (value: number): EmsHealthState => {
  if (value >= 95) return 'normal';
  if (value >= 90) return 'caution';
  return 'alert';
};

const sumCount = (list: { count: number }[]): number => list.reduce((acc, item) => acc + item.count, 0);

const getFarmStatus = (farm: EmsFarmStatus): DashFarmStatus => {
  if (farm.fault || !farm.all_working || !farm.all_power_on) return 'alert';
  if (!farm.all_clean) return 'caution';
  if ((farm.temperature ?? 0) >= 33 || (farm.humidity ?? 0) >= 70 || (farm.feedbin ?? 100) <= 25) return 'caution';
  return 'normal';
};

const calculateEnvironmentRisk = (farm: EmsFarmStatus): number => {
  let score = 0;
  if (!farm.all_working) score += 35;
  if (!farm.all_power_on) score += 35;
  if (!farm.all_clean) score += 10;
  if (farm.fault) score += 30;
  if (farm.temperature !== null && farm.temperature !== undefined && farm.temperature >= 33) score += 10;
  if (farm.humidity !== null && farm.humidity !== undefined && farm.humidity >= 70) score += 10;
  if (farm.feedbin !== null && farm.feedbin !== undefined && farm.feedbin <= 25) score += 15;
  return Math.min(score, 100);
};

const makeTrend = (seed: number, min: number, max: number): number[] =>
  Array.from({ length: 12 }, (_, index) => {
    const ratio = Math.sin((seed + index) * 0.7) * 0.5 + 0.5;
    return Math.round(min + (max - min) * ratio);
  });

const buildViewModel = (source: EmsDataMonitorResponse): DashViewModel => {
  const totalFarms = Math.max(source.total_farm_count, 1);
  const runningRate = (source.total_running_farm_count / totalFarms) * 100;
  const farmStatusList = source.all_farm_list.map((farm) => getFarmStatus(farm));
  const normalCount = farmStatusList.filter((status) => status === 'normal').length;
  const cautionCount = farmStatusList.filter((status) => status === 'caution').length;
  const alertCount = farmStatusList.filter((status) => status === 'alert').length;
  const thisWeekInput = sumCount(source.input_list);
  const thisWeekOutput = sumCount(source.output_list);

  return {
    lastUpdatedAt: '2026-02-14 10:30:00',
    statusMetrics: [
      {
        label: '정상',
        value: `${normalCount}`,
        detail: '가동 정상 하우스',
        tone: 'normal',
      },
      {
        label: '주의',
        value: `${cautionCount}`,
        detail: '청소/전원 확인 필요',
        tone: 'caution',
      },
      {
        label: '경고',
        value: `${alertCount}`,
        detail: '즉시 조치 필요',
        tone: 'alert',
      },
      {
        label: '총 마리수',
        value: numberFormatter.format(source.total_rearing_count),
        detail: '전체 사육수',
        tone: toToneFromRate(source.total_upbringing_rate),
      },
      {
        label: '가동률',
        value: `${runningRate.toFixed(1)}%`,
        detail: `${source.total_running_farm_count}/${source.total_farm_count} 농가`,
        tone: toToneFromRate(runningRate),
      },
      {
        label: '육성률',
        value: `${source.total_upbringing_rate.toFixed(1)}%`,
        detail: '누적 기준',
        tone: toToneFromRate(source.total_upbringing_rate),
      },
    ],
    kpiCards: [
      {
        title: '입추(이번 주)',
        value: numberFormatter.format(thisWeekInput),
        subValue: `건수 ${source.input_list.length}건`,
        tone: 'normal',
      },
      {
        title: '출하(이번 주)',
        value: numberFormatter.format(thisWeekOutput),
        subValue: `건수 ${source.output_list.length}건`,
        tone: 'normal',
      },
      {
        title: '장비 알람',
        value: `${alertCount}건`,
        subValue: 'fault / down 상태',
        tone: alertCount > 0 ? 'alert' : 'normal',
      },
      {
        title: '예측 모델',
        value: toHealthState(source.weight_prediction) === 'normal' ? '정상' : '점검 필요',
        subValue: 'weight_prediction',
        tone: toHealthState(source.weight_prediction),
      },
    ],
    alerts: [
      {
        id: 'alert-1',
        level: 'alert',
        createdAt: '02/14 10:24',
        farmLabel: '홍성농장 H-03',
        message: '사료빈 잔량 25% 이하',
        code: 'EMS-FEED-025',
      },
      {
        id: 'alert-2',
        level: 'caution',
        createdAt: '02/14 09:40',
        farmLabel: '청주농장 H-02',
        message: '청소 상태 점검 필요',
        code: 'EMS-CLEAN-002',
      },
      {
        id: 'alert-3',
        level: 'alert',
        createdAt: '02/14 08:55',
        farmLabel: '김제농장 H-02',
        message: '전원/통신 동시 미응답',
        code: 'EMS-SYSTEM-911',
      },
    ],
    actions: [
      {
        id: 'action-1',
        target: '김제농장 H-02',
        issue: '전원 복구 확인',
        owner: '운영 1팀',
        dueText: '10분 이내',
        priority: 'P1',
      },
      {
        id: 'action-2',
        target: '홍성농장 H-03',
        issue: '사료 보충 요청',
        owner: '현장 담당',
        dueText: '30분 이내',
        priority: 'P1',
      },
      {
        id: 'action-3',
        target: '청주농장 H-02',
        issue: '청소 상태 재점검',
        owner: '품질 담당',
        dueText: '금일 15:00',
        priority: 'P2',
      },
    ],
    growthTrack: [
      { label: '입추', value: `${numberFormatter.format(thisWeekInput)}수`, progress: 100, tone: 'normal' },
      { label: '성장', value: `${source.total_upbringing_rate.toFixed(1)}%`, progress: 93, tone: 'caution' },
      { label: '출하', value: `${numberFormatter.format(thisWeekOutput)}수`, progress: 87, tone: 'normal' },
    ],
    houseTiles: source.all_farm_list.map((farm) => ({
      id: farm.id,
      name: `${farm.farm_name} ${farm.house_name}`,
      region: farm.farm_name.split(' ')[0] ?? '미분류',
      operating: farm.all_working,
      cleaningReady: farm.all_clean,
      fault: farm.fault,
      powerOn: farm.all_power_on,
      status: getFarmStatus(farm),
      temperature: farm.temperature ?? null,
      humidity: farm.humidity ?? null,
      feedbin: farm.feedbin ?? null,
      environmentRisk: calculateEnvironmentRisk(farm),
    })),
    sensors: source.all_farm_list.map((farm, index) => ({
      id: farm.id,
      title: `${farm.farm_name} ${farm.house_name}`,
      temperature: farm.temperature ?? null,
      humidity: farm.humidity ?? null,
      feedbin: farm.feedbin ?? null,
      tempTrend: makeTrend(3 + index, 27, 35),
      humidTrend: makeTrend(11 + index, 45, 74),
      feedTrend: makeTrend(19 + index, 20, 88),
    })),
  };
};

export const mockDashViewModel = buildViewModel(dataMonitorSample);
