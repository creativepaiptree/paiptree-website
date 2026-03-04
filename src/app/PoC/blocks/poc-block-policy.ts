import type { TraceabilityPayload } from '@/types/traceability';
import type { SensorSeriesRecord } from '../sections/RightSidebar';

export type PocLang = 'ko' | 'en';
export type PocBlockRegion = 'top' | 'left' | 'center' | 'right' | 'bottom';
export type PocBlockState = 'default' | 'loading' | 'empty' | 'error';

export interface PocBlockConstraint {
  maxButtons?: number;
  maxCards?: number;
  maxTitleLength?: number;
  minHeightPx?: number;
  allowEmptyData?: boolean;
}

export interface PocBlockPolicy {
  id: string;
  name: string;
  purpose: string;
  requiredFields: string[];
  supportedStates: PocBlockState[];
  constraints: PocBlockConstraint;
  prohibitedPatterns: string[];
  acceptanceCriteria: string[];
}

export interface PocRightSidebarData {
  feedbinBySensor: Record<string, SensorSeriesRecord[]>;
  temperatureBySensor: Record<string, SensorSeriesRecord[]>;
  humidityBySensor: Record<string, SensorSeriesRecord[]>;
  totalBirdCount: number;
}

export interface PocBlockContext {
  lang: PocLang;
  setLang: (lang: PocLang) => void;
  onOpenTrace: (trace: TraceabilityPayload) => void;
  rightSidebarData: PocRightSidebarData;
}

export const pocBlockPolicies: Record<string, PocBlockPolicy> = {
  'top-navigation': {
    id: 'top-navigation',
    name: '상단 네비게이션',
    purpose: '버전/문서 모달 열기, 언어 전환, 글로벌 액션 노출',
    requiredFields: ['lang', 'setLang'],
    supportedStates: ['default', 'loading', 'error'],
    constraints: {
      maxButtons: 2,
      maxTitleLength: 28,
      minHeightPx: 56,
      allowEmptyData: false,
    },
    prohibitedPatterns: ['두 개 이상의 CTA를 한 행에 배치', '버튼 텍스트 20자 초과'],
    acceptanceCriteria: ['버튼은 동작 우선순위 순서로 정렬', '언어 전환 즉시 반영', '오류 시 비상 안내 메시지 노출'],
  },
  'left-sidebar-alerts': {
    id: 'left-sidebar-alerts',
    name: '좌측 알림 사이드바',
    purpose: '알림·운영 지표·빠른 입력 진입점을 고정된 형태로 노출',
    requiredFields: ['lang'],
    supportedStates: ['default', 'empty', 'loading', 'error'],
    constraints: {
      maxCards: 1,
      maxButtons: 3,
      minHeightPx: 600,
      allowEmptyData: true,
    },
    prohibitedPatterns: ['2개 이상의 제목 사이즈 레벨 혼용', '표준 패턴 외의 리스트 마크업 삽입'],
    acceptanceCriteria: [
      '알림 리스트는 최신순 정렬',
      '카드 내부 텍스트 길이는 모바일 기준 1줄 내지 2줄 제한',
      '요약 수치가 0일 때도 레이아웃 무너지지 않음',
    ],
  },
  'header-overview': {
    id: 'header-overview',
    name: '중앙 헤더 KPI',
    purpose: '현재 일령 기준 핵심 지표 5개(기상, 집수, 생존율, 추정체중, 온습도) 요약',
    requiredFields: ['lang', 'onOpenTrace'],
    supportedStates: ['default', 'loading', 'empty', 'error'],
    constraints: {
      maxCards: 6,
      maxTitleLength: 20,
      minHeightPx: 320,
      allowEmptyData: true,
    },
    prohibitedPatterns: ['KPI 수가 정책값 초과', '단일 KPI의 값/단위를 누락'],
    acceptanceCriteria: ['TraceableValue는 모든 KPI에서 사용', '모바일에서는 카드 1열', 'lang/tooltip 문구 변경 시 즉시 반영'],
  },
  'forecast-matrix': {
    id: 'forecast-matrix',
    name: '중앙 예측 매트릭스',
    purpose: '차트 + D-1/D-2/D-3 예측 표를 한 블록으로 묶어 정책 일관성 유지',
    requiredFields: ['lang', 'onOpenTrace'],
    supportedStates: ['default', 'loading', 'error'],
    constraints: {
      minHeightPx: 560,
      maxCards: 2,
      allowEmptyData: false,
    },
    prohibitedPatterns: ['표와 차트 배치 순서 변경', '툴팁 접근성 포커스 제거'],
    acceptanceCriteria: ['차트 스케일은 범례 기준 재사용', '예측값 클릭 시 TracePanel 호출', '모바일에서 가로 스크롤 대신 적응형 너비 처리'],
  },
  'weight-distribution': {
    id: 'weight-distribution',
    name: '중앙 체중 분포',
    purpose: '분산 지표(분포, CV, 적합률)를 한 화면에서 운영자가 한눈에 판단',
    requiredFields: ['lang', 'onOpenTrace'],
    supportedStates: ['default', 'loading', 'error', 'empty'],
    constraints: {
      maxCards: 3,
      maxTitleLength: 24,
      minHeightPx: 500,
      allowEmptyData: true,
    },
    prohibitedPatterns: ['핵심 수치에 색상만 의존한 구분', '요약문 누락'],
    acceptanceCriteria: ['상세/요약 토글 상태 기억', '비정상 상태 색상 규칙은 상수로 통일', '추적값은 TraceableValue로 노출'],
  },
  'right-sidebar-overview': {
    id: 'right-sidebar-overview',
    name: '우측 KPI 사이드바',
    purpose: '생존율/센서 그래프, 입식 마릿수 기반 운영 지표를 1:1 응답성으로 노출',
    requiredFields: ['lang', 'onOpenTrace', 'rightSidebarData'],
    supportedStates: ['default', 'loading', 'empty', 'error'],
    constraints: {
      maxCards: 2,
      maxButtons: 3,
      minHeightPx: 700,
      allowEmptyData: true,
    },
    prohibitedPatterns: ['섹션 라벨 중복', '센서 교체 시 인덱스 정합성 미보장'],
    acceptanceCriteria: [
      '온도/습도/사료빈 차트 각자 독립 축 적용',
      '센서 변경 시 선택값 초기화 정책 적용',
      '실패 구간은 색상 + 라벨 동시 전달',
    ],
  },
  'cctv-monitor': {
    id: 'cctv-monitor',
    name: '하단 CCTV 모니터',
    purpose: '라이브/아카이브 분석 이미지를 통해 운영자 이벤트 추적 포인트 제공',
    requiredFields: ['lang', 'onOpenTrace'],
    supportedStates: ['default', 'loading', 'empty', 'error'],
    constraints: {
      minHeightPx: 520,
      maxCards: 3,
      allowEmptyData: true,
    },
    prohibitedPatterns: ['이미지 리스트/동영상 리스트 섞기', '프레임 상세정보 미노출'],
    acceptanceCriteria: ['카메라 탭은 상태 유지', '이상 이벤트는 배지 색상/텍스트 동시 사용', '캡처 상세에서 원본 링크 제공'],
  },
};
