#!/usr/bin/env bash
set -euo pipefail

# 사용법:
#   chmod +x scripts/poc-storybook-bootstrap.sh
#   ./scripts/poc-storybook-bootstrap.sh setup --root /Users/.../paiptree-website
#   ./scripts/poc-storybook-bootstrap.sh scaffold --root /Users/.../paiptree-website --stories-dir src/app/PoC/stories --force

SUBCMD="${1:-}"
shift || true

ROOT_DIR="$(pwd)"
FORCE="0"
STORIES_DIR=""

usage() {
  cat <<'EOF'
사용법:
  poc-storybook-bootstrap.sh setup --root <project-root>
  poc-storybook-bootstrap.sh scaffold --root <project-root> --stories-dir <stories-dir> [--force]
  poc-storybook-bootstrap.sh check --root <project-root> --stories-dir <stories-dir>
  poc-storybook-bootstrap.sh run-storybook --root <project-root>

옵션:
  --root <dir>         프로젝트 루트(필수)
  --stories-dir <dir>   스토리 경로 (예: src/app/PoC/stories)
  --force              파일이 이미 있어도 덮어쓰기
EOF
  exit 1
}

require_arg() {
  local name="$1"
  local value="${2:-}"
  if [[ -z "$value" ]]; then
    echo "[ERR] $name 값이 비어 있습니다."
    usage
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --root)
      ROOT_DIR="$2"
      shift 2
      ;;
    --stories-dir)
      STORIES_DIR="$2"
      shift 2
      ;;
    --force)
      FORCE="1"
      shift
      ;;
    *)
      usage
      ;;
  esac
done

if [[ "$ROOT_DIR" == "" ]]; then
  usage
fi

if [[ ! -f "$ROOT_DIR/package.json" ]]; then
  echo "[ERR] package.json을 찾을 수 없습니다: $ROOT_DIR"
  exit 1
fi

ensure_storybook_setup() {
  echo "1) Storybook 스크립트/환경 점검"
  node - <<NODE
const fs = require('fs');
const path = process.argv[1];
const packagePath = `${path}/package.json`;
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['storybook'] = pkg.scripts['storybook'] || 'npx --yes storybook dev -p 6006';
pkg.scripts['build-storybook'] = pkg.scripts['build-storybook'] || 'npx --yes storybook build';
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\\n');
NODE
"$ROOT_DIR"

  if [[ ! -d "$ROOT_DIR/.storybook" ]]; then
    mkdir -p "$ROOT_DIR/.storybook"
  fi
}

write_if_needed() {
  local target="$1"
  local content="$2"
  if [[ -f "$target" && "$FORCE" != "1" ]]; then
    echo "[SKIP] $target (이미 존재, --force 미사용)"
    return
  fi
  printf "%s" "$content" > "$target"
  echo "[OK] $target 생성/갱신"
}

write_story_file_default() {
  local target="$1"
  local title="$2"
  local component_import="$3"
  local component_type="$4"
  local extra="$5"
  local fixture_imports="$6"
  local render_body="$7"

  local content
  content="$(cat <<EOF
import ${component_type}, { type CCTVMonitorState, type TracePanelState } from '${component_import}';
import { BLOCK_IDS, noop } from './poc-story-fixtures';

const STATES = ['default', 'loading', 'empty', 'error'] as const;

const renderComponent = (args: { lang: 'ko' | 'en'; state: CCTVMonitorState | TracePanelState }) => (
  <div className="p-2">
${render_body}
  </div>
);

export default {
  title: '${title}',
  argTypes: {
    lang: {
      control: { type: 'inline-radio' },
      options: ['ko', 'en'],
    },
    state: {
      control: { type: 'select' },
      options: STATES,
    },
  },
  args: {
    lang: 'ko',
    state: 'default',
  },
};

export const Default = {
  render: renderComponent,
};

export const Loading = {
  args: {
    state: 'loading',
  },
  render: renderComponent,
};

export const Empty = {
  args: {
    state: 'empty',
  },
  render: renderComponent,
};

export const Error = {
  args: {
    state: 'error',
  },
  render: renderComponent,
};

export const PolicyReference = {
  parameters: {
    docs: {
      description: {
        story: `정책 블록 ID: ${BLOCK_IDS[0]} / ${title.split('/').slice(-1)[0]}`,
      },
    },
  },
};
${extra}
EOF
)"

  write_if_needed "$target" "$content"
}

scaffold_cctv_story() {
  local stories_dir="$1"
  local target="$stories_dir/PocCctvMonitor.stories.tsx"
  local component_import="..\\/sections\\/CCTVMonitor"
  local content
  content="$(cat <<'EOF'
import CCTVMonitor, { type CCTVMonitorState } from '../sections/CCTVMonitor';
import { BLOCK_IDS, noop } from './poc-story-fixtures';

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

export const Default = { render: renderCctvMonitor };

export const LoadingState = {
  args: { state: 'loading' },
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
  args: { state: 'empty' },
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
  args: { state: 'error' },
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
EOF
)"
  write_if_needed "$target" "$content"
}

scaffold_trace_story() {
  local stories_dir="$1"
  local target="$stories_dir/PoCTracePanel.stories.tsx"
  local content
  content="$(cat <<'EOF'
import TracePanel from '../components/trace/TracePanel';
import { cctvTracePayload, defaultTracePayload, tracePayloadWithHistory } from './poc-story-fixtures';

const renderTracePanel = (args: { lang: 'ko' | 'en'; state: 'default' | 'loading' | 'empty' | 'error'; trace?: never }) => (
  <div className="p-2">
    <TracePanel
      lang={args.lang}
      open={true}
      trace={defaultTracePayload}
      onClose={() => undefined}
      state={args.state}
    />
  </div>
);

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
  render: renderTracePanel,
};

export const Loading = {
  args: { state: 'loading' },
  render: renderTracePanel,
};

export const Empty = {
  args: { state: 'empty' },
  render: (args: { lang: 'ko' | 'en'; state: 'empty' | 'default' | 'loading' | 'error' }) => (
    <div className="p-2">
      <TracePanel lang={args.lang} open={true} trace={null} onClose={() => undefined} state={args.state} />
    </div>
  ),
};

export const Error = {
  args: { state: 'error' },
  render: renderTracePanel,
};

export const WithHistory = {
  render: () => (
    <div className="p-2">
      <TracePanel
        lang="ko"
        open={true}
        trace={tracePayloadWithHistory}
        onClose={() => undefined}
        state="default"
      />
    </div>
  ),
};

export const WithCctvTrace = {
  render: () => (
    <div className="p-2">
      <TracePanel
        lang="ko"
        open={true}
        trace={cctvTracePayload}
        onClose={() => undefined}
        state="default"
      />
    </div>
  ),
};
EOF
)"
  write_if_needed "$target" "$content"
}

check_status() {
  echo "=== 체크 ==="
  echo "project: $ROOT_DIR"
  echo ".storybook/main.js: $( [[ -f \"$ROOT_DIR/.storybook/main.js\" ]] && echo 존재 || echo 없음)"
  echo ".storybook/preview.js: $( [[ -f \"$ROOT_DIR/.storybook/preview.js\" ]] && echo 존재 || echo 없음)"
  echo "package scripts: storybook/build-storybook 존재 확인"
}

run_storybook() {
  echo "Storybook 실행: npm run storybook"
  (cd "$ROOT_DIR" && npm run storybook)
}

case "$SUBCMD" in
  setup)
    ensure_storybook_setup
    echo "[DONE] setup 완료"
    ;;
  scaffold)
    if [[ -z "$STORIES_DIR" ]]; then
      usage
    fi
    ensure_storybook_setup
    STORIES_DIR_ABS="$ROOT_DIR/$STORIES_DIR"
    mkdir -p "$STORIES_DIR_ABS"
    scaffold_cctv_story "$STORIES_DIR_ABS"
    scaffold_trace_story "$STORIES_DIR_ABS"
    echo "[DONE] scaffold 완료"
    ;;
  check)
    if [[ -z "$STORIES_DIR" ]]; then
      usage
    fi
    check_status
    ;;
  run-storybook)
    run_storybook
    ;;
  *)
    usage
    ;;
esac
