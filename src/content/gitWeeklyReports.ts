export type GitReportStage = {
  step: number;
  message: string;
};

export type GitAuthorSummary = {
  authorName: string;
  authorEmail: string | null;
  commitCount: number;
  repoCount: number;
  keyWork: string;
};

export type GitOverallSection = {
  title: string;
  body: string;
};

export type GitBeforeAfterRow = {
  sortOrder: number;
  fileLabel: string;
  changeSummary: string;
};

export type GitDetailBlock = {
  id: string;
  headingText: string;
  serviceLabel: string;
  serviceName: string;
  authoredTimeLabel: string;
  authorName: string;
  authorEmail: string | null;
  commitMessageLabel: string;
  commitMessages: string[];
  serviceDescription: string;
  beforeAfterHeading: string;
  beforeAfterRows: GitBeforeAfterRow[];
  codeHeading: string;
  codeBlockLanguage: string;
  codeBlockMarkdown: string;
  contextHeading: string;
  contextMarkdown: string;
  rawBlockMarkdown: string;
};

export type GitWeeklyReportSample = {
  id: string;
  monday: string;
  friday: string;
  status: 'done' | 'design-only' | 'blocked';
  commitCount: number;
  repoCount: number;
  generatedAt: string;
  title: string;
  overview: string;
  highlights: string[];
  blockers: string[];
  authors: GitAuthorSummary[];
  overallSections: GitOverallSection[];
  focusRepos: string[];
  markdown: string;
  stages: GitReportStage[];
  detailBlocks: GitDetailBlock[];
};

export type GitCapabilityCheck = {
  title: string;
  status: '가능' | '조건부' | '분리 권장';
  description: string;
};

export type GitArchitectureStep = {
  title: string;
  summary: string;
  detail: string;
};

export type GitStorageTable = {
  name: string;
  summary: string;
  fields: string[];
};

export const gitCapabilityChecks: GitCapabilityCheck[] = [
  {
    title: '/git 페이지와 운영 UI',
    status: '가능',
    description:
      '현재 Next.js app router 구조 안에서 페이지, 목록, 진행 로그, 리포트 뷰어 UX는 바로 붙일 수 있다.',
  },
  {
    title: 'Next 내부 API에서 수집/DB 처리',
    status: '조건부',
    description:
      '개발 서버나 Node 런타임 배포에서는 가능하지만, 이 저장소는 프로덕션에서 정적 export를 쓰는 흐름이 있어 배포 방식 확인이 먼저 필요하다.',
  },
  {
    title: 'git fetch + SQLite + LLM 직접 실행',
    status: '분리 권장',
    description:
      '장시간 실행, 파일 시스템 쓰기, 원격 GitLab 접근, 모델 호출을 한 프로세스에 묶기보다 collector 서비스와 DB를 분리해야 운영이 안정적이다.',
  },
];

export const gitArchitectureSteps: GitArchitectureStep[] = [
  {
    title: '1. Collector 서비스',
    summary: 'GitLab fetch, commit 탐색, diff 수집을 담당한다.',
    detail:
      '현재 계획서의 `weekly_report.sh` 포팅 로직은 별도 Node worker나 사내 서버 프로세스로 두는 편이 안전하다.',
  },
  {
    title: '2. 정돈 DB 적재',
    summary: '주간 단위 raw 결과와 1차 정돈본을 저장한다.',
    detail:
      'SQLite보다 Postgres/Supabase 같은 외부 DB가 현재 사이트 배포 구조와 더 잘 맞는다. 파일 기반 SQLite는 정적 배포와 궁합이 약하다.',
  },
  {
    title: '3. LLM 요약 생성',
    summary: '수집한 커밋과 diff를 프롬프트에 맞게 보고서로 만든다.',
    detail:
      'Claude/OpenAI 호출은 collector 단계에서 비동기로 돌리고, 웹은 결과 조회와 재시도만 담당하는 구조가 유지보수에 유리하다.',
  },
  {
    title: '4. /git 페이지 조회',
    summary: '리포트 목록, 진행 상태, 주간 보고서 뷰를 제공한다.',
    detail:
      '현재 페이지는 이 최종 UX를 먼저 검증하는 용도로 구현했고, 이후 API만 연결하면 같은 화면을 실데이터로 전환할 수 있다.',
  },
];

export const gitStorageTables: GitStorageTable[] = [
  {
    name: 'git_report_blocks',
    summary: '날짜별 상세 변경 블록 본문 테이블',
    fields: [
      'report_date, sort_order, heading_text',
      'service_label, service_name, authored_time_label, author_name, author_email',
      'commit_message_label, commit_messages(jsonb), service_description',
      'code_block_language, code_block_markdown, context_markdown',
      'raw_block_markdown, source_markdown_path, meta',
    ],
  },
  {
    name: 'git_report_block_files',
    summary: '상세 블록 내부 Before / After 파일 행 테이블',
    fields: [
      'block_id, sort_order, file_label, change_summary',
    ],
  },
  {
    name: 'git_report_blocks_export_v1',
    summary: '날짜별 블록과 Before / After 파일행을 한 번에 읽는 조회용 view',
    fields: [
      'git_report_blocks + before_after_rows(jsonb) 조합',
    ],
  },
];

export const initialGitWeeklyReports: GitWeeklyReportSample[] = [
  {
    id: '2026-03-16',
    monday: '2026-03-16',
    friday: '2026-03-20',
    status: 'done',
    commitCount: 16,
    repoCount: 9,
    generatedAt: '2026-03-21 10:10',
    title: '주간 코드 변경 리포트 2026-03-16 (월) ~ 2026-03-20 (금)',
    overview:
      '실제 작성된 리포트 기준으로 보면 이번 주의 중심축은 `tbl_farm_module`에서 `tbl_farm_module_mac`으로 옮기는 전환 작업이다. FMS PoC 출하 기능 완성과 TMS 초기 정리 작업이 같이 잡히며, 주간 보고서는 이처럼 여러 레포의 흐름을 한 문서로 재구성해야 한다.',
    highlights: [
      '`core/monitoringmanager`, `core/dataConsumer`, `web/managerback` 등 7개 서비스에서 MAC 기반 테이블 전환 진행',
      'FMS 프론트/백엔드가 출하 시점 기준 PoC 차트 동작을 함께 정리',
      'TMS는 테스트 코드 정리와 README/TODO 정비로 초기 개발 방향을 명시',
    ],
    blockers: [
      '사이트 프로세스 안에서 `git fetch`, diff 수집, LLM 생성까지 직접 돌리면 정적 export/배포 구조와 충돌할 가능성이 높다.',
      'Supabase에는 raw markdown만 넣지 말고, author summary와 상세 entry를 분리해 저장해야 재조회/필터링이 가능하다.',
    ],
    authors: [
      {
        authorName: '윤성진',
        authorEmail: 'seongjin.yoon@paiptree.com',
        commitCount: 2,
        repoCount: 2,
        keyWork: 'FMS PoC 화면 - 출하 정보 차트 표현',
      },
      {
        authorName: '윤명근',
        authorEmail: 'ymk81@hanmail.net',
        commitCount: 12,
        repoCount: 7,
        keyWork: 'tbl_farm_module -> tbl_farm_module_mac 전환',
      },
      {
        authorName: 'chris',
        authorEmail: 'sun@paiptree.com',
        commitCount: 2,
        repoCount: 1,
        keyWork: 'TMS 소스 정리 및 README 업데이트',
      },
    ],
    overallSections: [
      {
        title: '핵심 흐름: tbl_farm_module -> tbl_farm_module_mac 전환',
        body:
          'monitoringmanager, dataConsumer, managerback, FM-back, farmInstallWeb, servicemanager 등 여러 서비스가 같은 주간에 테이블 전환을 함께 진행했다. 이 주간 리포트에서 가장 중요한 축은 개별 커밋보다도 공통 데이터 모델 교체가 여러 시스템으로 전파된 흐름이다.',
      },
      {
        title: 'FMS PoC 출하 기능 완성',
        body:
          'FMS 프론트와 백엔드가 같이 움직이며 출하 후 예측값 노출 문제를 해결했고, 차트 annotation과 i18n까지 같은 맥락으로 정리됐다. 단일 커밋 열람보다 프론트-백 연동 맥락이 중요하다.',
      },
      {
        title: 'TMS 초기 개발 정리',
        body:
          'TMS는 대규모 기능 추가보다 초기 구조 정리와 TODO 명세가 중심이었다. README 업데이트와 테스트 코드 제거도 주간 리포트에서는 하나의 방향성 변화로 묶어 보여주는 편이 읽기 쉽다.',
      },
    ],
    focusRepos: [
      'service/FMS',
      'service/FMS-back',
      'core/monitoringmanager',
      'core/dataConsumer',
      'core/dataStatistic',
      'core/farmDiaryManager',
      'web/managerback',
      'service/FM-back',
      'web/farmInstallWeb',
      'service/servicemanager',
      'service/TMS',
    ],
    markdown: `# 주간 코드 변경 리포트 2026-03-16 (월) ~ 2026-03-20 (금)

## 변경 요약
| 작업자 | 커밋 수 | 변경 레포 수 | 핵심 작업 |
| --- | ---: | ---: | --- |
| 윤성진 | 2 | 2 | FMS PoC 화면 - 출하 정보 차트 표현 |
| 윤명근 | 12 | 7 | tbl_farm_module -> tbl_farm_module_mac 전환 |
| chris | 2 | 1 | TMS 소스 정리 및 README 업데이트 |

**총 커밋: 16개 | 총 변경 레포: 9개**

## 이번 주 전체 맥락 요약
### 핵심 흐름: tbl_farm_module -> tbl_farm_module_mac 전환
- 여러 레포에서 같은 데이터 모델 전환이 동시 진행됨
- Teams WebHook 제거와 diaryRecent clear 기능 이관도 같은 흐름 안에서 해석 가능

### FMS PoC 출하 기능 완성
- 차트 annotation, i18n, 백엔드 조회 조건 정리가 한 묶음으로 움직임

### TMS 초기 개발 진행 중
- 테스트 코드 삭제, gate 환경 제거, README/TODO 업데이트로 초기 정리 진행`,
    stages: [
      { step: 1, message: '레포 fetch 중... (0/75)' },
      { step: 1, message: '레포 fetch 완료 (73/75 성공)' },
      { step: 2, message: '커밋 탐색 중...' },
      { step: 2, message: '16개 커밋 발견 (9개 레포)' },
      { step: 3, message: 'diff 수집 중...' },
      { step: 4, message: '보고서 생성 완료' },
    ],
    detailBlocks: [],
  },
  {
    id: '2026-03-09',
    monday: '2026-03-09',
    friday: '2026-03-13',
    status: 'design-only',
    commitCount: 11,
    repoCount: 6,
    generatedAt: '2026-03-14 09:20',
    title: '문서 허브 재정비와 릴리즈 노트 미러 구조 정리',
    overview:
      '이 주간은 운영 문서 구조와 미러 동기화 API 패턴이 정리된 시기다. 주간 리포트 시스템이 들어갈 때 재사용할 수 있는 패턴이 이미 일부 있다.',
    highlights: [
      'Node runtime 기반 admin API 예제가 이미 존재',
      '문서 동기화 스크립트가 route 기준 운영 문서를 자동 생성',
      '정적 JSON 미러 패턴과 운영용 API 패턴이 분리되어 있음',
    ],
    blockers: [
      '릴리즈 미러 API는 짧은 작업에는 맞지만, 장시간 스트리밍 수집 job에는 그대로 확장하기 어렵다.',
    ],
    authors: [
      {
        authorName: 'system',
        authorEmail: null,
        commitCount: 0,
        repoCount: 0,
        keyWork: '설계 검토용 시드 데이터',
      },
    ],
    overallSections: [
      {
        title: '운영 API 패턴 참고',
        body:
          '릴리즈 노트와 i18n API는 Supabase REST 패턴과 Node runtime route 예제를 제공한다. /git도 동일하게 읽기 경로와 수집 경로를 분리하는 편이 안전하다.',
      },
    ],
    focusRepos: ['src/app/api/admin/release-mirror-sync', 'src/app/api/i18n/consistency', 'src/lib/releaseNotes.ts'],
    markdown: `# 2026-03-09 ~ 2026-03-13 운영 리포트

## 핵심
- 사이트 내부에 운영성 API를 둘 수는 있지만, 장시간 수집 잡은 별도 프로세스로 분리하는 편이 안전함

## 메모
- \`/api/admin/release-mirror-sync\`는 Node runtime write 예제로 참고 가능
- \`/api/dev-docs\`는 로컬 파일 조회형 API 구조 참고 가능`,
    stages: [
      { step: 1, message: '기존 리포트 로드' },
      { step: 2, message: '저장된 메타데이터 정리' },
      { step: 3, message: '마크다운 뷰 준비 완료' },
    ],
    detailBlocks: [],
  },
];
