import type { TraceabilityPayload } from '@/types/traceability';
import { feedbinBySensorSample, humidityBySensorSample, temperatureBySensorSample } from '../sample-sensor-data';

export const BLOCK_IDS = [
  'top-navigation',
  'left-sidebar-alerts',
  'header-overview',
  'forecast-matrix',
  'weight-distribution',
  'right-sidebar-overview',
  'cctv-monitor',
] as const;

export type PocStoryBlockId = (typeof BLOCK_IDS)[number];

export const defaultTracePayload: TraceabilityPayload = {
  trace_id: 'poc-story-default',
  display_value: '33.2',
  logic_summary: 'PoC 스토리북용 기본 추적 데이터입니다.',
  logic_formula: 'N/A',
  data_source: [],
  is_ai_generated: false,
  source_version: 'storybook',
  snapshot_at: '2026-02-19 12:00:00',
};

export const emptyTracePayload: TraceabilityPayload = {
  trace_id: 'poc-story-empty',
  display_value: '-',
  logic_summary: '표시할 추적 데이터가 없습니다.',
  logic_formula: 'N/A',
  data_source: [],
  is_ai_generated: false,
  source_version: 'storybook-empty',
  snapshot_at: '2026-02-19 12:00:00',
};

export const cctvTracePayload: TraceabilityPayload = {
  trace_id: 'cctv:storybook:frame',
  display_value: 'frame #018',
  logic_summary: 'CCTV 스토리북용 프레임 트레이스입니다.',
  logic_formula: 'frame_id = archive.batch + index',
  is_ai_generated: false,
  source_version: 'storybook-cctv',
  snapshot_at: '2026-02-19 12:03:22',
  confidence: 0.92,
  data_source: [
    {
      source_id: 'file:storybook-cctv:ct01',
      type: 'file',
      name: 'cctv-ct01-frame-018.jpg',
      url: '/media/cctv-sample-test1/images/frame-018.jpg',
      highlight_text: 'frame #018',
      highlight_anchor: 'archive=ct01&frame=18',
    },
  ],
};

export const tracePayloadWithHistory: TraceabilityPayload = {
  trace_id: 'poc-story-history',
  display_value: '34.4',
  logic_summary: '시간대별 추적 스냅샷 비교를 위한 이력 데이터입니다.',
  logic_formula: 'value = weighted_average(raw_series[-N:])',
  is_ai_generated: false,
  source_version: 'storybook-v1',
  snapshot_at: '2026-02-19 11:54:00',
  data_source: [
    {
      source_id: 'db:storybook:summary',
      type: 'db',
      name: 'story_trace_summary',
      url: 'https://story-source.local/trace/summary',
      highlight_text: 'summary row 1',
      highlight_anchor: 'r1',
    },
  ],
  version_history: [
    {
      source_version: 'storybook-v0',
      snapshot_at: '2026-02-19 11:44:00',
      display_value: '31.5',
      logic_summary: 'baseline',
      confidence: 0.75,
      data_source: [
        {
          source_id: 'db:storybook:summary-v0',
          type: 'db',
          name: 'story_trace_summary_v0',
          url: 'https://story-source.local/trace/summary/v0',
          highlight_text: 'summary row 1',
          highlight_anchor: 'r1',
        },
      ],
    },
    {
      source_version: 'storybook-v1',
      snapshot_at: '2026-02-19 11:54:00',
      display_value: '34.4',
      logic_summary: 'baseline',
      confidence: 0.82,
      data_source: [
        {
          source_id: 'db:storybook:summary-v1',
          type: 'db',
          name: 'story_trace_summary_v1',
          url: 'https://story-source.local/trace/summary/v1',
          highlight_text: 'summary row 1',
          highlight_anchor: 'r1',
        },
      ],
    },
  ],
};

export const noop = () => {};

export const openTraceNoop = (_trace: TraceabilityPayload = defaultTracePayload) => undefined;

export const rightSidebarSampleData = {
  feedbinBySensor: feedbinBySensorSample,
  temperatureBySensor: temperatureBySensorSample,
  humidityBySensor: humidityBySensorSample,
  totalBirdCount: 20500,
};
