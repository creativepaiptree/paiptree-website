import CCTVMonitor, { type CCTVMonitorState } from '../sections/CCTVMonitor';
import { BLOCK_IDS } from './poc-story-fixtures';
import { noop } from './poc-story-fixtures';

const CCTV_STATES: CCTVMonitorState[] = ['default', 'loading', 'empty', 'error'];

const renderCctvMonitor = (args: { lang: 'ko' | 'en'; state: CCTVMonitorState }) => (
  <div className="p-2">
    <CCTVMonitor lang={args.lang} onOpenTrace={noop} state={args.state} />
  </div>
);

export default {
  title: 'PoC/Blocks/Bottom CCTV Monitor',
  argTypes: {
    lang: {
      control: { type: 'inline-radio' },
      options: ['ko', 'en'],
    },
    state: {
      control: { type: 'select' },
      options: CCTV_STATES,
    },
  },
  args: {
    lang: 'ko',
    state: 'default',
  },
};

export const Default = {
  render: renderCctvMonitor,
};

export const LoadingState = {
  args: {
    state: 'loading',
  },
  render: renderCctvMonitor,
  parameters: {
    docs: {
      description: {
        story: '정책 규칙: cctv-monitor loading 상태 (실시간 + 보관 데이터 동시 로딩)',
      },
    },
  },
};

export const EmptyState = {
  args: {
    state: 'empty',
  },
  render: renderCctvMonitor,
  parameters: {
    docs: {
      description: {
        story: '정책 규칙: cctv-monitor empty 상태 (보관 데이터 없음)',
      },
    },
  },
};

export const ErrorState = {
  args: {
    state: 'error',
  },
  render: renderCctvMonitor,
  parameters: {
    docs: {
      description: {
        story: '정책 규칙: cctv-monitor error 상태 (실시간/보관 조회 실패 메시지)',
      },
    },
  },
};

export const PolicyReference = {
  parameters: {
    docs: {
      description: {
        story: `정책 블록 ID: ${BLOCK_IDS[6]} / cctv-monitor`,
      },
    },
  },
};
