import TracePanel from '../components/trace/TracePanel';
import { cctvTracePayload, defaultTracePayload, tracePayloadWithHistory } from './poc-story-fixtures';

type TracePanelStoryArgs = {
  lang: 'ko' | 'en';
  state: 'default' | 'loading' | 'empty' | 'error';
};

export default {
  title: 'PoC/Trace/TracePanel',
  argTypes: {
    lang: {
      control: { type: 'inline-radio' },
      options: ['ko', 'en'],
    },
    state: {
      control: { type: 'select' },
      options: ['default', 'loading', 'empty', 'error'],
    },
  },
  args: {
    lang: 'ko',
    state: 'default',
  },
};

export const Default = {
  render: (args: TracePanelStoryArgs) => (
    <TracePanel lang={args.lang} open={true} trace={defaultTracePayload} onClose={() => undefined} state={args.state} />
  ),
};

export const Loading = {
  args: {
    state: 'loading',
  },
  parameters: {
    docs: {
      description: {
        story: 'TracePanel loading 상태: 서버 응답 대기 시 추적 패널 스켈레톤',
      },
    },
  },
};

export const Empty = {
  args: {
    state: 'empty',
  },
  render: (args: TracePanelStoryArgs) => (
    <TracePanel
      lang={args.lang}
      open={true}
      trace={null}
      onClose={() => undefined}
      state={args.state}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'TracePanel empty 상태: 추적 데이터 미존재 시 기본 메시지 노출',
      },
    },
  },
};

export const Error = {
  args: {
    state: 'error',
  },
  render: (args: TracePanelStoryArgs) => (
    <TracePanel
      lang={args.lang}
      open={true}
      trace={defaultTracePayload}
      onClose={() => undefined}
      state={args.state}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'TracePanel error 상태: 추적 조회 실패 또는 파싱 실패 대응',
      },
    },
  },
};

export const WithHistory = {
  render: (args: TracePanelStoryArgs) => (
    <TracePanel
      lang={args.lang}
      open={true}
      trace={tracePayloadWithHistory}
      onClose={() => undefined}
      state="default"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'History 탭 스냅샷 비교(기본 상태 검증용)',
      },
    },
  },
};

export const WithCctvTrace = {
  render: (args: TracePanelStoryArgs) => (
    <TracePanel
      lang={args.lang}
      open={true}
      trace={cctvTracePayload}
      onClose={() => undefined}
      state="default"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'CCTV trace일 때 CCTV 탭 존재 여부 정책/작동 확인용',
      },
    },
  },
};
