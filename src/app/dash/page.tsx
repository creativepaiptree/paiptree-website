'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashFloatingNav from '@/components/dash/DashFloatingNav';

// ─── Constants ────────────────────────────────────────────────────────────────
const MEMBER = {
  spaceName: 'zoro_LAB',
  descShort: '영연님의 테스트 및 연구 개발공간입니다.',
  desc: '크리에이티브팀 영연님의 테스트 및 연구 개발공간입니다.',
  role: 'Planner / PM',
  color: '#58a6ff',
};

const MEMBER_SELECT = [
  { key: 'zoro', label: 'ZORO(조영연)', href: '/dash' },
  { key: 'jim',  label: 'Jim(성진)',    href: '/dash_2' },
  { key: 'hk',   label: 'HK(강현국)',   href: '/dash_3' },
];

type ArchLayer  = 'edge' | 'service' | 'core' | 'backend';
type NodeStatus = 'live' | 'dev' | 'inactive' | 'planned';
type ArchNode = {
  id: string;
  name: string;
  sub: string;
  layer: ArchLayer;
  status: NodeStatus;
  color: string;
  href: string | null;
  cx: number;
  cy: number;
  w: number;
  h: number;
  summary: string;
  modules: string[];
  endpoints: string[];
  dataFlow: string[];
  risks: string[];
};

type ArchLink = {
  id: string;
  from: string;
  to: string;
  path: string;
  label: string;
  tone: 'edge' | 'core' | 'backend' | 'neutral' | 'planned';
  dashed?: boolean;
  lx?: number; // label box center x
  ly?: number; // label box center y
};

const STATUS_CFG: Record<NodeStatus, { label: string; color: string }> = {
  live:     { label: 'LIVE',     color: '#3fb950' },
  dev:      { label: 'DEV',      color: '#f0883e' },
  inactive: { label: 'INACTIVE', color: '#8b949e' },
  planned:  { label: 'PLANNED',  color: '#6e7681' },
};

const ARCH_NODES: ArchNode[] = [
  // ── Farm Edge ────────────────────────────────────────────────────────────────
  {
    id: 'sensor',
    name: '온습도계',
    sub: '온도 / 습도 / 체중계',
    layer: 'edge',
    status: 'live',
    color: '#ff7700',
    href: null,
    cx: 230,
    cy: 60,
    w: 155,
    h: 44,
    summary: '현장 온습도계·체중계의 1차 수집 포인트. sensorCollector/fileCollector가 데이터를 받아 Data Collection으로 전달.',
    modules: ['온습도계 (환경센서)', '체중계 (중량 측정)', 'sensorCollector', 'fileCollector'],
    endpoints: ['현장 장치 수집 채널', '센서 업로드 배치/이벤트'],
    dataFlow: ['온습도·체중 데이터 → Data Collection'],
    risks: ['센서 동기화 실패 시 재시도/백필 필요', '네트워크 불안정 시 수집 누락 가능'],
  },
  {
    id: 'cctv',
    name: 'CCTV / Camera',
    sub: 'CCTV 관제',
    layer: 'edge',
    status: 'live',
    color: '#ff7700',
    href: '/farm',
    cx: 670,
    cy: 60,
    w: 155,
    h: 44,
    summary: '현장 영상/이미지 수집 소스. cctvManager 및 imageTransfer 계열이 처리.',
    modules: ['cctvManager', 'imageTransfer', '영상/알람 이벤트'],
    endpoints: ['현장 카메라 RTSP/스냅샷', 'NVR 저장 연계'],
    dataFlow: ['영상·이미지 이벤트 → NVR / NAS'],
    risks: ['스트림 동시성 증가 시 지연', '저장소 용량 정책 미정으로 과거 이력 관리 불안정'],
  },
  // ── Service ──────────────────────────────────────────────────────────────────
  {
    id: 'ems',
    name: 'Farmers-Mind_ems',
    sub: '기업 모니터링',
    layer: 'service',
    status: 'live',
    color: '#3fb950',
    href: '/PoC',
    cx: 134,
    cy: 189,
    w: 155,
    h: 52,
    summary: '현재 운영중인 EMS. fms.farmers-mind.com에서 동작하며 API Gateway 경유로 백엔드 호출 수행.',
    modules: ['FMS(front)', '대시보드 라우팅', 'Pinia 상태관리'],
    endpoints: ['https://fms.farmers-mind.com', 'FMS-back: 6300(운영), 8080(개발)'],
    dataFlow: ['브라우저 요청 → API Gateway', '데이터 조회/조작 API'],
    risks: ['SPA fallback으로 외부에서 Swagger 직접 호출 제한'],
  },
  {
    id: 'aiapp',
    name: 'Farmers-Mind_ai',
    sub: '농장주 모바일',
    layer: 'service',
    status: 'inactive',
    color: '#8b5cf6',
    href: null,
    cx: 556,
    cy: 189,
    w: 155,
    h: 52,
    summary: 'platform/notused에 존재한 FM-mobile / FM-back 라인. 현재 미활성으로 점검 대상.',
    modules: ['FM-mobile', 'FM-back', '농장주 화면'],
    endpoints: ['platform/service/FM-mobile', 'platform/service/FM-back'],
    dataFlow: ['기존 API 재사용 가능성 확보 중'],
    risks: ['권한 체계/UX 동기화 미정'],
  },
  {
    id: 'tms',
    name: 'Farmers-Mind_tms',
    sub: '차량 관제',
    layer: 'service',
    status: 'dev',
    color: '#f0883e',
    href: '/tms',
    cx: 767,
    cy: 189,
    w: 155,
    h: 52,
    summary: 'Nuxt3/TMS-back/location 조합으로 운영 중인 물류 관제 축. 차량/운송/정산 맥락이 겹침.',
    modules: ['TMS(front)', 'TMS-back', 'TMS-location'],
    endpoints: ['TMS API', 'TMS 위치 이벤트'],
    dataFlow: ['실시간 위치 조회', '운송 상태 업데이트'],
    risks: ['라우팅 정책 분산 정합성'],
  },
  {
    id: 'vms',
    name: 'Farmers-Mind_vms',
    sub: '영상 관제',
    layer: 'service',
    status: 'dev',
    color: '#f0883e',
    href: '/farm',
    cx: 345,
    cy: 189,
    w: 155,
    h: 52,
    summary: 'EMS와 별도 독립 앱(Quasar + Spring Boot). CCTV 관제·스냅샷·Control Center 전담. VMS-back이 /fms/dash/ 경로를 포함해 FMS 데이터도 직접 서빙.',
    modules: ['VMS-service (Quasar/Vue3, 48 commits)', 'VMS-back (Spring Boot, 28 commits)', 'cctvManager', 'ControlCenterPage', 'ExternalVmsPage', 'SnapshotPage'],
    endpoints: ['VmsController: /vms/{token}', 'DashboardController: /fms/dash/', 'DiaryController: /fms/diary/', 'MapController'],
    dataFlow: ['CCTV 스트림 → Control Center 표시', 'FMS DB 직접 조회 (/fms/* 경유)', '영상 → NVR/NAS 아카이브'],
    risks: ['FMS-back과 /fms/* 라우트 중복 → API 정합성 리스크', '미배포 상태로 운영 도메인 미확정', '알람 규칙 및 보관 기간 정책 미정'],
  },
  // ── AI Core ──────────────────────────────────────────────────────────────────
  {
    id: 'datacol',
    name: 'Data Collection',
    sub: '수집 / 정제 / 통계',
    layer: 'core',
    status: 'live',
    color: '#58a6ff',
    href: null,
    cx: 205,
    cy: 319,
    w: 155,
    h: 52,
    summary: '센서·파일 수집 데이터를 정제하고 통계/이벤트로 정돈하는 파이프라인 코어.',
    modules: ['sensorCollector', 'fileCollector', 'dataConsumer', 'dataStatistic', 'eventEngine', 'farmDiaryManager'],
    endpoints: ['core 모듈 내부 연동'],
    dataFlow: ['Raw 데이터 정합', 'DB 반영', 'AI 피처 입력'],
    risks: ['수집 실패 시 지연, 중복 처리 리스크'],
  },
  {
    id: 'farmDiary',
    name: 'farmDiaryManager',
    sub: '사육일지 처리',
    layer: 'core',
    status: 'dev',
    color: '#58a6ff',
    href: null,
    cx: 390,
    cy: 319,
    w: 165,
    h: 52,
    summary: 'farmDiaryManager 기반으로 농장 일지/이벤트를 관리하는 독립 코어.',
    modules: ['farmDiaryManager', '일지 이벤트 동기화'],
    endpoints: ['farmDiaryManager: 172.31.55.157:8200'],
    dataFlow: ['사육일지 연동', 'Core 피처 보강'],
    risks: ['다른 DB 계층과의 키 정합성'],
  },
  {
    id: 'aiml',
    name: 'AI / ML Engine',
    sub: '체중예측 추론',
    layer: 'core',
    status: 'dev',
    color: '#58a6ff',
    href: null,
    cx: 595,
    cy: 319,
    w: 165,
    h: 52,
    summary: 'dataAnalysis 및 newWeightModule2 계열로 체중 예측/이력 추론 수행.',
    modules: ['dataAnalysis', 'newWeightModule2'],
    endpoints: ['AI 분석 API', '학습/추론 파이프라인'],
    dataFlow: ['feature 변환', '예측값 반환'],
    risks: ['모델 버전 관리 미정의'],
  },
  {
    id: 'apigw',
    name: 'API Gateway',
    sub: '요청 라우팅',
    layer: 'core',
    status: 'live',
    color: '#58a6ff',
    href: null,
    cx: 780,
    cy: 319,
    w: 130,
    h: 52,
    summary: '운영 172.31.55.157:8100, 개발 3.36.42.219:8100. 인증·라우팅·세션 게이트웨이.',
    modules: ['apiGateway', '라우팅 정책', '인증 위임'],
    endpoints: ['http://172.31.55.157:8100/apiv1', 'http://3.36.42.219:8100/apiv1'],
    dataFlow: ['서비스 요청 집약', '백엔드/저장소 호출'],
    risks: ['라우팅 오류 영향 범위 큼', 'timeout 정책이 전체 품질에 영향'],
  },
  // ── Backend ──────────────────────────────────────────────────────────────────
  {
    id: 'mariadb',
    name: 'MariaDB',
    sub: '주 데이터베이스',
    layer: 'backend',
    status: 'live',
    color: '#8b949e',
    href: null,
    cx: 170,
    cy: 449,
    w: 140,
    h: 52,
    summary: '운영 데이터 저장의 중추 DB. FMS/TMS 공통으로 사용되는 영속 계층.',
    modules: ['MyBatis Mapper', '도메인 테이블'],
    endpoints: ['15.164.212.104:6241/fms(개발)', '172.31.33.100:6241/fms(운영)'],
    dataFlow: ['CRUD/분석 쿼리', '이력 저장'],
    risks: ['쿼리 성능 병목', '파티셔닝·보존 정책 미정'],
  },
  {
    id: 'redis',
    name: 'Redis',
    sub: '세션 캐시',
    layer: 'backend',
    status: 'live',
    color: '#8b949e',
    href: null,
    cx: 370,
    cy: 449,
    w: 140,
    h: 52,
    summary: '세션, 캐시 데이터 처리에 사용되는 빠른 보조 저장소.',
    modules: ['세션 저장소', '임시 캐시'],
    endpoints: ['RedisConfig'],
    dataFlow: ['로그인 세션', '빈번 조회 캐시'],
    risks: ['TTL/캐시 갱신 정책 불일치'],
  },
  {
    id: 's3',
    name: 'AWS S3',
    sub: '파일 저장소',
    layer: 'backend',
    status: 'live',
    color: '#8b949e',
    href: null,
    cx: 560,
    cy: 449,
    w: 140,
    h: 52,
    summary: '이미지·엑셀·첨부파일 등 비정형 정적 자산 저장.',
    modules: ['S3Config', '미디어 업로드'],
    endpoints: ['AWS S3 버킷'],
    dataFlow: ['미디어 업로드', '기록 보관'],
    risks: ['버킷 정책 변경 위험', '메타데이터 정합'],
  },
  {
    id: 'nvr',
    name: 'NVR / NAS',
    sub: '영상 저장소',
    layer: 'backend',
    status: 'live',
    color: '#8b949e',
    href: null,
    cx: 750,
    cy: 449,
    w: 140,
    h: 52,
    summary: '영상 및 이미지 보관형 스토리지. CCTV 파이프라인의 하단 저장 지점.',
    modules: ['nvrManager', 'nasTransfer'],
    endpoints: ['NVR / NAS 네트워크 경로'],
    dataFlow: ['영상 아카이브', 'AI 분석 참조'],
    risks: ['보관기간/용량 관리 미정'],
  },
];

const ARCH_LINKS: ArchLink[] = [
  // ── Farm Edge ─────────────────────────────────────────────────────────────
  // sensor bottom-center(230,82) → datacol top-center(205,293); bus y=254 in SERVICE-CORE gap
  { id: 'sensor->datacol', from: 'sensor', to: 'datacol', label: '온습도/체중 수집', tone: 'edge',
    path: 'M230,82 L230,254 L205,254 L205,293', lx: 217, ly: 248 },
  // cctv right-center(748,60) → nvr top-center(750,423); right bypass x=885
  { id: 'cctv->nvr',       from: 'cctv',   to: 'nvr',    label: '영상 아카이빙', tone: 'edge',
    path: 'M748,60 L885,60 L885,423 L750,423',  lx: 817, ly: 53  },
  // ── Service → API Gateway — bottom-center → top-center (bus y=244~259) ───
  { id: 'ems->apigw',   from: 'ems',   to: 'apigw', label: '운영 서비스 라우팅', tone: 'core',
    path: 'M134,215 L134,244 L780,244 L780,293', lx: 457, ly: 238 },
  { id: 'vms->apigw',   from: 'vms',   to: 'apigw', label: 'VMS API 경유',      tone: 'core',
    path: 'M345,215 L345,249 L780,249 L780,293', lx: 562, ly: 243 },
  { id: 'aiapp->apigw', from: 'aiapp', to: 'apigw', label: '미사용/추적',       tone: 'neutral', dashed: true,
    path: 'M556,215 L556,254 L780,254 L780,293', lx: 668, ly: 248 },
  { id: 'tms->apigw',   from: 'tms',   to: 'apigw', label: 'TMS API 경유',      tone: 'core',
    path: 'M767,215 L767,259 L780,259 L780,293', lx: 752, ly: 233 },
  // ── AI Core horizontal chain — right/left face centers ────────────────────
  // datacol right-center(288,319) → farmDiary left-center(308,319)
  { id: 'datacol->farmDiary', from: 'datacol',  to: 'farmDiary', label: '수집 이력 반영', tone: 'core',
    path: 'M288,319 L308,319', lx: 298, ly: 312 },
  // farmDiary right-center(473,319) → aiml left-center(513,319)
  { id: 'farmDiary->aiml',    from: 'farmDiary', to: 'aiml',      label: '피처 제공',     tone: 'core',
    path: 'M473,319 L513,319', lx: 493, ly: 312 },
  // aiml right-center(678,319) → apigw left-center(715,319)
  { id: 'aiml->apigw',        from: 'aiml',      to: 'apigw',     label: '추론 결과',     tone: 'core',
    path: 'M678,319 L715,319', lx: 696, ly: 312 },
  // ── Core/Edge → Backend — bottom-center → top-center (bus y=372~400) ─────
  { id: 'datacol->mariadb', from: 'datacol',  to: 'mariadb', label: '운영 데이터',  tone: 'backend',
    path: 'M205,345 L205,372 L170,372 L170,423', lx: 187, ly: 366 },
  { id: 'farmDiary->nvr',   from: 'farmDiary', to: 'nvr',     label: '이벤트 참조',  tone: 'backend',
    path: 'M390,345 L390,379 L750,379 L750,423', lx: 570, ly: 373 },
  { id: 'apigw->s3',        from: 'apigw',     to: 's3',      label: '파일 업로드',  tone: 'backend',
    path: 'M780,345 L780,386 L560,386 L560,423', lx: 670, ly: 380 },
  { id: 'apigw->redis',     from: 'apigw',     to: 'redis',   label: '세션/캐시',    tone: 'backend',
    path: 'M780,345 L780,393 L370,393 L370,423', lx: 575, ly: 387 },
  { id: 'apigw->mariadb',   from: 'apigw',     to: 'mariadb', label: '트랜잭션 DB',  tone: 'backend',
    path: 'M780,345 L780,400 L170,400 L170,423', lx: 475, ly: 394 },
];

const ARCH_LINK_STYLE: Record<
  ArchLink['tone'],
  { stroke: string; marker: string; opacity?: number; label: string }
> = {
  edge: { stroke: '#ff7700', marker: 'arr-edge', opacity: 0.5, label: 'Edge' },
  core: { stroke: '#58a6ff', marker: 'arr-core', opacity: 0.5, label: 'Core' },
  backend: { stroke: '#6e7681', marker: 'arr-backend', opacity: 0.6, label: 'Backend' },
  neutral: { stroke: '#30363d', marker: 'arr', opacity: 0.7, label: 'Service' },
  planned: { stroke: '#6e7681', marker: 'arr-dim', opacity: 0.8, label: 'Planned' },
};

const SYSTEM_DOC_BUTTONS = [
  { key: 'hub',       path: 'docs/admin/README.md',                          label: '문서 운영 허브'    },
  { key: 'index',     path: 'docs/README.md',                                label: '개발문서 인덱스'   },
  { key: 'authoring', path: 'docs/guides/document-authoring.md',             label: '개발문서 작성가이드' },
  { key: 'template',  path: 'docs/templates/component-spec.template.md',     label: '컴포넌트 템플릿'   },
  { key: 'design',    path: 'docs/3.0-design-system.md',                     label: '3.0 디자인 시스템'  },
] as const;

type SystemDocKey = typeof SYSTEM_DOC_BUTTONS[number]['key'];
const SYSTEM_DOC_PATHS = new Set<string>(SYSTEM_DOC_BUTTONS.map(b => b.path));

// ─── Supabase config (project_id = dash) ──────────────────────────────────────
const SUPABASE_EXPORT_VIEW  = process.env.NEXT_PUBLIC_SUPABASE_EXPORT_VIEW?.trim()  ?? 'project_release_notes_export_v1';
const SUPABASE_PROJECT_ID   = 'dash';
const SUPABASE_PUBLIC_URL   = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()          ?? '';
const SUPABASE_PUBLIC_KEY   = process.env.NEXT_PUBLIC_SUPABASE_KEY?.trim()          ?? '';

// ─── Types ────────────────────────────────────────────────────────────────────
type ReleaseItem = {
  titleKo: string;
  titleEn: string;
  detailsKo: string[];
  detailsEn: string[];
};
type ReleaseNote = { version: string; date: string; items: ReleaseItem[] };
type DevDoc = {
  id: string;
  title: string;
  path: string;
  absolutePath: string;
  editorUri: string;
  updatedAt: string;
  author: string;
  preview: string;
  content: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SEMVER = /^\d+\.\d+\.\d+$/;
const DATE_PATTERN = /^\d{2}\.\d{2}\.\d{2}$/;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

const asStrArr = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.filter((s): s is string => typeof s === 'string' && s.trim().length > 0).map(s => s.trim())
    : [];

const sanitizeItem = (v: unknown): ReleaseItem | null => {
  if (!isRecord(v)) return null;
  const titleKo = typeof v.titleKo === 'string' ? v.titleKo.trim() : '';
  const titleEn = typeof v.titleEn === 'string' ? v.titleEn.trim() : '';
  if (!titleKo || !titleEn) return null;
  return { titleKo, titleEn, detailsKo: asStrArr(v.detailsKo), detailsEn: asStrArr(v.detailsEn) };
};

const sanitizeNote = (v: unknown): ReleaseNote | null => {
  if (!isRecord(v)) return null;
  const version = typeof v.version === 'string' ? v.version.trim() : '';
  const date    = typeof v.date    === 'string' ? v.date.trim()    : '';
  if (!SEMVER.test(version) || !DATE_PATTERN.test(date)) return null;
  const items = Array.isArray(v.items)
    ? v.items.map(sanitizeItem).filter((x): x is ReleaseItem => x !== null)
    : [];
  if (items.length === 0) return null;
  return { version, date, items };
};

const compareSemverDesc = (a: string, b: string) => {
  const ap = a.split('.').map(Number);
  const bp = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if (ap[i] !== bp[i]) return bp[i] - ap[i];
  return 0;
};

const compareDateDesc = (a: string, b: string) => {
  const n = (s: string) => { const [y, m, d] = s.split('.').map(Number); return (2000 + y) * 10000 + m * 100 + d; };
  return n(b) - n(a);
};

const sanitizeNotes = (raw: unknown): ReleaseNote[] => {
  if (!Array.isArray(raw)) throw new Error('Invalid payload');
  return raw
    .map(sanitizeNote)
    .filter((n): n is ReleaseNote => n !== null)
    .sort((a, b) => { const v = compareSemverDesc(a.version, b.version); return v !== 0 ? v : compareDateDesc(a.date, b.date); });
};

const getLatestVersion = (notes: ReleaseNote[]) =>
  notes.map(n => n.version).filter(v => SEMVER.test(v)).sort(compareSemverDesc)[0] ?? '0.0.0';

const fetchReleaseNotes = async (signal: AbortSignal): Promise<ReleaseNote[]> => {
  if (!SUPABASE_PUBLIC_URL || !SUPABASE_PUBLIC_KEY) throw new Error('Supabase env missing');
  const url = new URL(
    `/rest/v1/${SUPABASE_EXPORT_VIEW}`,
    SUPABASE_PUBLIC_URL.endsWith('/') ? SUPABASE_PUBLIC_URL : `${SUPABASE_PUBLIC_URL}/`,
  );
  url.searchParams.set('project_id', `eq.${SUPABASE_PROJECT_ID}`);
  url.searchParams.set('select', 'version,date,items');
  url.searchParams.set('limit', '500');
  const res = await fetch(url.toString(), {
    headers: { apikey: SUPABASE_PUBLIC_KEY, Authorization: `Bearer ${SUPABASE_PUBLIC_KEY}`, Accept: 'application/json' },
    cache: 'no-store',
    signal,
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return sanitizeNotes(await res.json());
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashPage() {
  const router = useRouter();

  // version modal
  const [isVersionOpen, setIsVersionOpen]   = useState(false);
  const [releaseNotes, setReleaseNotes]     = useState<ReleaseNote[]>([]);
  const [currentVersion, setCurrentVersion] = useState('0.0.0');
  const [notesLoading, setNotesLoading]     = useState(false);
  const [notesError, setNotesError]         = useState<string | null>(null);
  const versionModalRef                     = useRef<HTMLDivElement>(null);
  const versionCloseBtnRef                  = useRef<HTMLButtonElement>(null);

  // docs modal
  const [isDocsOpen, setIsDocsOpen]                   = useState(false);
  const [devDocs, setDevDocs]                         = useState<DevDoc[]>([]);
  const [docsLoading, setDocsLoading]                 = useState(false);
  const [docsError, setDocsError]                     = useState<string | null>(null);
  const [activeDocSource, setActiveDocSource]         = useState<'system' | 'component'>('system');
  const [activeSystemDocKey, setActiveSystemDocKey]   = useState<SystemDocKey>('hub');
  const [selectedCompDocId, setSelectedCompDocId]     = useState<string | null>(null);
  const docsModalRef                                  = useRef<HTMLDivElement>(null);
  const docsCloseBtnRef                               = useRef<HTMLButtonElement>(null);

  // arch inspector
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const closeVersion = useCallback(() => setIsVersionOpen(false), []);
  const closeDocs    = useCallback(() => setIsDocsOpen(false),    []);

  // ── Load release notes ──
  const loadNotes = useCallback(async ({ signal, showLoading }: { signal: AbortSignal; showLoading: boolean }) => {
    if (showLoading) { setNotesLoading(true); setNotesError(null); }
    try {
      const notes = await fetchReleaseNotes(signal);
      setReleaseNotes(notes);
      setCurrentVersion(getLatestVersion(notes));
    } catch {
      if (signal.aborted) return;
      if (showLoading) setNotesError('버전 정보를 불러오지 못했습니다.');
    } finally {
      if (showLoading && !signal.aborted) setNotesLoading(false);
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    void loadNotes({ signal: ctrl.signal, showLoading: false });
    return () => ctrl.abort();
  }, [loadNotes]);

  useEffect(() => {
    if (!isVersionOpen) return;
    const ctrl = new AbortController();
    void loadNotes({ signal: ctrl.signal, showLoading: true });
    return () => ctrl.abort();
  }, [isVersionOpen, loadNotes]);

  // ── Load dev docs ──
  useEffect(() => {
    if (!isDocsOpen) return;
    const ctrl = new AbortController();
    const load = async () => {
      setDocsLoading(true); setDocsError(null);
      try {
        const res = await fetch('/api/dev-docs', { cache: 'no-store', signal: ctrl.signal });
        if (!res.ok) throw new Error(`${res.status}`);
        const data = (await res.json()) as { docs: DevDoc[] };
        if (!Array.isArray(data.docs)) throw new Error('invalid');
        setDevDocs(data.docs);
        const tocDocs = data.docs.filter((d: DevDoc) =>
          (d.path.startsWith('docs/components/') || d.path.startsWith('docs/guides/') ||
           d.path.startsWith('docs/pages/')      || d.path.startsWith('docs/admin/'))
          && !SYSTEM_DOC_PATHS.has(d.path),
        );
        setSelectedCompDocId(prev =>
          prev && tocDocs.some(d => d.id === prev) ? prev : (tocDocs[0]?.id ?? null),
        );
      } catch {
        if (ctrl.signal.aborted) return;
        setDocsError('개발 문서를 불러오지 못했습니다.');
      } finally {
        if (!ctrl.signal.aborted) setDocsLoading(false);
      }
    };
    void load();
    return () => ctrl.abort();
  }, [isDocsOpen]);

  // ── Focus trap ──
  useEffect(() => {
    if (!isVersionOpen && !isDocsOpen) return;
    const modalRef     = isDocsOpen ? docsModalRef     : versionModalRef;
    const closeBtnRef  = isDocsOpen ? docsCloseBtnRef  : versionCloseBtnRef;
    const closeActive  = isDocsOpen ? closeDocs        : closeVersion;
    closeBtnRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); closeActive(); return; }
      if (e.key !== 'Tab') return;
      const modal = modalRef.current;
      if (!modal) return;
      const focusable = Array.from(modal.querySelectorAll<HTMLElement>(
        'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
      )).filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
      if (!focusable.length) { e.preventDefault(); modal.focus(); return; }
      const first = focusable[0], last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (!active || active === first || !modal.contains(active)) { e.preventDefault(); last.focus(); }
      } else {
        if (!active || active === last || !modal.contains(active)) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [closeDocs, closeVersion, isDocsOpen, isVersionOpen]);

  const docsByPath   = useMemo(() => new Map(devDocs.map(d => [d.path, d])), [devDocs]);
  const componentDocs = useMemo(
    () => devDocs.filter(d =>
      (d.path.startsWith('docs/components/') || d.path.startsWith('docs/guides/') ||
       d.path.startsWith('docs/pages/')      || d.path.startsWith('docs/admin/'))
      && !SYSTEM_DOC_PATHS.has(d.path),
    ),
    [devDocs],
  );
  const selectedSystemDoc = useMemo(
    () => docsByPath.get(SYSTEM_DOC_BUTTONS.find(b => b.key === activeSystemDocKey)?.path ?? '') ?? null,
    [activeSystemDocKey, docsByPath],
  );
  const selectedCompDoc = componentDocs.find(d => d.id === selectedCompDocId) ?? componentDocs[0] ?? null;
  const selectedDoc     = activeDocSource === 'system' ? selectedSystemDoc : selectedCompDoc;

  const openInEditor = useCallback((doc: DevDoc) => {
    if (!doc.editorUri) return;
    const w = window.open(doc.editorUri, '_blank', 'noopener,noreferrer');
    if (!w) window.location.href = doc.editorUri;
  }, []);

  const selectedArchNode = selectedNode ? (ARCH_NODES.find(n => n.id === selectedNode) ?? null) : null;
  const selectedIncomingLinks = useMemo(() => {
    if (!selectedArchNode) return [];
    return ARCH_LINKS.filter(link => link.to === selectedArchNode.id);
  }, [selectedArchNode]);
  const selectedOutgoingLinks = useMemo(() => {
    if (!selectedArchNode) return [];
    return ARCH_LINKS.filter(link => link.from === selectedArchNode.id);
  }, [selectedArchNode]);

  const archNodeById = useMemo(() => new Map(ARCH_NODES.map(n => [n.id, n])), []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0d1117] text-gray-100" data-poc-theme="dark">

      {/* ─ Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex-shrink-0 text-sm font-semibold font-mono" style={{ color: MEMBER.color }}>
            {MEMBER.spaceName}
          </span>
          <span className="flex-shrink-0 font-mono text-sm" style={{ color: MEMBER.color }}>
            (Ver.{currentVersion})
          </span>
          <button
            type="button"
            onClick={() => { setIsDocsOpen(false); setIsVersionOpen(true); }}
            className="hidden sm:inline-flex h-6 items-center text-[10px] font-mono border px-2 transition-colors"
            style={{ color: MEMBER.color, borderColor: `${MEMBER.color}60` }}
          >
            업데이트 정보
          </button>
          <button
            type="button"
            onClick={() => { setIsVersionOpen(false); setActiveDocSource('system'); setActiveSystemDocKey('hub'); setIsDocsOpen(true); }}
            className="hidden sm:inline-flex h-6 items-center text-[10px] font-mono border px-2 transition-colors"
            style={{ color: MEMBER.color, borderColor: `${MEMBER.color}60` }}
          >
            개발문서
          </button>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <select
            value="zoro"
            onChange={e => { const item = MEMBER_SELECT.find(m => m.key === e.target.value); if (item) router.push(item.href); }}
            className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] text-xs font-mono px-2 py-1 outline-none focus:border-[#58a6ff] cursor-pointer"
          >
            {MEMBER_SELECT.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
          <span className="text-xs text-[#8b949e]">내부 도구 허브</span>
        </div>
      </div>

      {/* ─ Main ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto flex flex-col">

        {/* Member identity — 상단 고정 */}
        <div className="shrink-0 flex flex-col items-center gap-2 px-4 pt-16 pb-4">
          <span
            className="text-[10px] font-mono border px-2 py-[1px] uppercase tracking-widest"
            style={{ color: MEMBER.color, borderColor: MEMBER.color }}
          >
            {MEMBER.role}
          </span>
          <p className="text-2xl font-bold font-mono tracking-tight" style={{ color: MEMBER.color }}>
            {MEMBER.spaceName}
          </p>
          <p className="text-[11px] text-[#8b949e] font-mono">{MEMBER.desc}</p>
        </div>

        {/* Service Architecture Map — 나머지 공간 가운데 */}
        <div className="flex-1 flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-5xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono text-[#6e7681] uppercase tracking-widest">Service Architecture</p>
              <p className="text-[9px] font-mono text-[#30363d]">Core-Engine Platform · v1.0</p>
            </div>
            {/* Diagram — 항상 full-width */}
            <div className="border border-[#30363d] bg-[#0d1117]">
                <svg viewBox="0 0 900 550" className="w-full h-auto">
                  <defs>
                    <pattern id="grid-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                      <circle cx="1" cy="1" r="0.8" fill="#30363d" opacity="0.4" />
                    </pattern>
                    <marker id="arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="#30363d" />
                    </marker>
                    <marker id="arr-dim" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="#6e7681" />
                    </marker>
                    <marker id="arr-edge" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="#ff7700" fillOpacity="0.5" />
                    </marker>
                    <marker id="arr-core" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="#58a6ff" fillOpacity="0.5" />
                    </marker>
                    <marker id="arr-backend" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="#6e7681" />
                    </marker>
                  </defs>

                  {/* Background */}
                  <rect x="0" y="0" width="900" height="550" fill="url(#grid-dots)" />

                  {/* ── Layer bands ── */}
                  <rect x="8" y="16"  width="884" height="88"  fill="#161b22" fillOpacity="0.5"  rx="2" stroke="#ff7700" strokeOpacity="0.2" strokeWidth="1" />
                  <text x="18" y="30"  fill="#6e7681" fontSize="9" fontFamily="ui-monospace,SFMono-Regular,monospace" letterSpacing="2">FARM EDGE</text>

                  <rect x="8" y="144" width="884" height="90"  fill="#161b22" fillOpacity="0.6"  rx="2" />
                  <text x="18" y="158" fill="#6e7681" fontSize="9" fontFamily="ui-monospace,SFMono-Regular,monospace" letterSpacing="2">SERVICE</text>

                  <rect x="8" y="274" width="884" height="90"  fill="#161b22" fillOpacity="0.85" rx="2" stroke="#58a6ff" strokeOpacity="0.25" strokeWidth="1" />
                  <text x="18" y="288" fill="#6e7681" fontSize="9" fontFamily="ui-monospace,SFMono-Regular,monospace" letterSpacing="2">AI CORE</text>

                  <rect x="8" y="404" width="884" height="90"  fill="#161b22" fillOpacity="0.6"  rx="2" />
                  <text x="18" y="418" fill="#6e7681" fontSize="9" fontFamily="ui-monospace,SFMono-Regular,monospace" letterSpacing="2">BACKEND</text>

                  {/* ── Connections (data-driven) ── */}
                  {ARCH_LINKS.map(link => {
                    const style = ARCH_LINK_STYLE[link.tone];
                    const lx = link.lx ?? null;
                    const ly = link.ly ?? null;
                    const labelW = Math.max(36, link.label.length * 7 + 10);
                    return (
                      <g key={link.id}>
                        <path
                          d={link.path}
                          stroke={style.stroke}
                          strokeOpacity={style.opacity}
                          strokeWidth="1"
                          strokeDasharray={link.dashed ? '4 3' : undefined}
                          fill="none"
                          markerEnd={`url(#${style.marker})`}
                        />
                        {lx !== null && ly !== null && (
                          <g>
                            <rect
                              x={lx - labelW / 2}
                              y={ly - 7}
                              width={labelW}
                              height={14}
                              fill="#0b0f14"
                              stroke={style.stroke}
                              strokeOpacity={0.45}
                              strokeWidth="0.5"
                              rx="1"
                            />
                            <text
                              x={lx}
                              y={ly + 4}
                              textAnchor="middle"
                              fontSize="7"
                              fill={style.stroke}
                              fillOpacity={0.9}
                              fontFamily="ui-monospace,SFMono-Regular,monospace"
                            >
                              {link.label}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* ── Nodes ── */}
                  {ARCH_NODES.map(node => {
                    const nx = node.cx - node.w / 2;
                    const ny = node.cy - node.h / 2;
                    const isSel     = selectedNode === node.id;
                    const st        = STATUS_CFG[node.status];
                    const isPlanned = node.status === 'planned';
                    return (
                      <g
                        key={node.id}
                        onClick={() => setSelectedNode(prev => prev === node.id ? null : node.id)}
                        style={{ cursor: 'pointer', opacity: isPlanned ? 0.65 : 1 }}
                      >
                        <rect x={nx} y={ny} width={node.w} height={node.h} fill="#0d1117" stroke={node.color} strokeWidth={isSel ? 2 : 1} strokeDasharray={isPlanned ? '4 3' : undefined} />
                        <rect x={nx} y={ny} width={node.w} height={node.h} fill={node.color} fillOpacity={isSel ? 0.12 : 0.04} />
                        {/* Status badge (top-right) */}
                        <text x={nx + node.w - 4} y={ny + 10} textAnchor="end" fill={st.color} fontSize="7" fontFamily="ui-monospace,SFMono-Regular,monospace">{st.label}</text>
                        {/* Node name */}
                        <text x={node.cx} y={node.cy - 4} textAnchor="middle" fill={isSel ? '#ffffff' : '#c9d1d9'} fontSize="11" fontWeight="700" fontFamily="ui-monospace,SFMono-Regular,monospace">{node.name}</text>
                        {/* Sub label */}
                        <text x={node.cx} y={node.cy + 10} textAnchor="middle" fill={node.color} fontSize="9" fontFamily="ui-monospace,SFMono-Regular,monospace" letterSpacing="1">{node.sub}</text>
                      </g>
                    );
                  })}

                  {/* ── Legend — Layer ── */}
                  <rect x="18"  y="511" width="7" height="7" fill="none" stroke="#ff7700" strokeWidth="1" />
                  <text x="29"  y="518" fill="#6e7681" fontSize="9" fontFamily="ui-monospace,SFMono-Regular,monospace">FARM EDGE</text>
                  <rect x="103" y="511" width="7" height="7" fill="none" stroke="#3fb950" strokeWidth="1" />
                  <text x="114" y="518" fill="#6e7681" fontSize="9" fontFamily="ui-monospace,SFMono-Regular,monospace">SERVICE</text>
                  <rect x="168" y="511" width="7" height="7" fill="none" stroke="#58a6ff" strokeWidth="1" />
                  <text x="179" y="518" fill="#6e7681" fontSize="9" fontFamily="ui-monospace,SFMono-Regular,monospace">AI CORE</text>
                  <rect x="233" y="511" width="7" height="7" fill="none" stroke="#8b949e" strokeWidth="1" />
                  <text x="244" y="518" fill="#6e7681" fontSize="9" fontFamily="ui-monospace,SFMono-Regular,monospace">BACKEND</text>
                  {/* ── Legend — Status ── */}
                  <circle cx="314" cy="515" r="3" fill="#3fb950" />
                  <text x="321" y="518" fill="#6e7681" fontSize="9" fontFamily="ui-monospace,SFMono-Regular,monospace">LIVE</text>
                  <circle cx="354" cy="515" r="3" fill="#f0883e" />
                  <text x="361" y="518" fill="#6e7681" fontSize="9" fontFamily="ui-monospace,SFMono-Regular,monospace">DEV</text>
                  <circle cx="393" cy="515" r="3" fill="#8b949e" />
                  <text x="400" y="518" fill="#6e7681" fontSize="9" fontFamily="ui-monospace,SFMono-Regular,monospace">INACTIVE</text>
                  <line x1="456" y1="512" x2="470" y2="512" stroke="#6e7681" strokeWidth="1" strokeDasharray="3 2" />
                  <text x="474" y="518" fill="#6e7681" fontSize="9" fontFamily="ui-monospace,SFMono-Regular,monospace">PLANNED</text>
                  <text x="630" y="518" fill="#30363d" fontSize="9" fontFamily="ui-monospace,SFMono-Regular,monospace">click node for details →</text>
                </svg>
              </div>

            {/* Inspector — TracePanel 패턴: fixed 사이드 드로어 + backdrop */}
            {selectedArchNode && (
              <>
                <button
                  type="button"
                  aria-label="close inspector"
                  className="fixed inset-0 z-40 bg-black/50"
                  onClick={() => setSelectedNode(null)}
                />
                <aside className="fixed right-0 top-0 z-50 h-full w-80 border-l border-[#30363d] bg-[#161b22] shadow-2xl flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between px-4 py-3 border-b border-[#30363d] shrink-0">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className="text-[9px] font-mono border px-1 py-[1px] uppercase tracking-widest"
                          style={{ color: selectedArchNode.color, borderColor: selectedArchNode.color }}
                        >
                          {selectedArchNode.layer}
                        </span>
                        <span
                          className="text-[9px] font-mono border px-1 py-[1px] uppercase tracking-widest"
                          style={{ color: STATUS_CFG[selectedArchNode.status].color, borderColor: STATUS_CFG[selectedArchNode.status].color }}
                        >
                          {STATUS_CFG[selectedArchNode.status].label}
                        </span>
                      </div>
                      <p className="text-sm font-bold font-mono" style={{ color: selectedArchNode.color }}>
                        {selectedArchNode.name}
                      </p>
                      <p className="text-[10px] text-[#8b949e] font-mono">{selectedArchNode.sub}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedNode(null)}
                      className="inline-flex items-center border border-[#30363d] px-2 py-1 text-xs text-[#8b949e] hover:bg-[#21262d] transition-colors shrink-0 ml-3 mt-0.5"
                    >
                      ✕
                    </button>
                  </div>
                  {/* Body */}
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                    <section>
                      <p className="text-[9px] font-mono text-[#6e7681] uppercase tracking-widest mb-2">Summary</p>
                      <p className="text-[12px] text-[#c9d1d9] leading-relaxed">{selectedArchNode.summary}</p>
                    </section>
                    <section>
                      <p className="text-[9px] font-mono text-[#6e7681] uppercase tracking-widest mb-2">Modules</p>
                      <ul className="flex flex-col gap-1.5">
                        {selectedArchNode.modules.map(item => (
                          <li key={item} className="text-[11px] font-mono text-[#8b949e] border-l-2 border-[#30363d] pl-3">{item}</li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <p className="text-[9px] font-mono text-[#6e7681] uppercase tracking-widest mb-2">Endpoints</p>
                      <ul className="flex flex-col gap-1.5">
                        {selectedArchNode.endpoints.map(item => (
                          <li key={item} className="text-[11px] font-mono text-[#8b949e] border-l-2 border-[#30363d] pl-3">{item}</li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <p className="text-[9px] font-mono text-[#6e7681] uppercase tracking-widest mb-2">Data Flow</p>
                      <ul className="flex flex-col gap-1.5">
                        {selectedArchNode.dataFlow.map(item => (
                          <li key={item} className="text-[11px] font-mono text-[#8b949e] border-l-2 border-[#30363d] pl-3">{item}</li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <p className="text-[9px] font-mono text-[#6e7681] uppercase tracking-widest mb-2">Risk</p>
                      <ul className="flex flex-col gap-1.5">
                        {selectedArchNode.risks.map(item => (
                          <li key={item} className="text-[11px] font-mono text-[#8b949e] border-l-2 border-[#ff7b72] pl-3">{item}</li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <p className="text-[9px] font-mono text-[#6e7681] uppercase tracking-widest mb-2">Inbound / Outbound</p>
                      <div className="flex flex-col gap-2 text-[11px] font-mono">
                        {selectedIncomingLinks.length > 0 && (
                          <div className="flex flex-col gap-1">
                            <span className="text-[#8b949e]">◀ Incoming</span>
                            {selectedIncomingLinks.map(link => {
                              const from = ARCH_NODES.find(n => n.id === link.from);
                              return (
                                <span key={`in-${link.id}`} className="pl-3 text-[#8b949e] border-l-2 border-[#30363d]">
                                  {from?.name ?? link.from} → {link.label}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        {selectedOutgoingLinks.length > 0 && (
                          <div className="flex flex-col gap-1">
                            <span className="text-[#8b949e]">Outgoing →</span>
                            {selectedOutgoingLinks.map(link => {
                              const to = ARCH_NODES.find(n => n.id === link.to);
                              return (
                                <span key={`out-${link.id}`} className="pl-3 text-[#8b949e] border-l-2 border-[#30363d]">
                                  {link.label} → {to?.name ?? link.to}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </section>
                    {selectedIncomingLinks.length === 0 && selectedOutgoingLinks.length === 0 && (
                      <p className="text-[11px] text-[#30363d]">연결 정보가 없습니다.</p>
                    )}
                    {(selectedIncomingLinks.length > 0 || selectedOutgoingLinks.length > 0) && (
                      <p className="text-[10px] text-[#30363d]">※ 토글한 항목은 실제 연결 라인 라벨/방향을 기준으로 표시됩니다.</p>
                    )}
                    <div className="mt-auto border-t border-[#30363d] pt-2">
                      {selectedArchNode.href && (
                        <a
                          href={selectedArchNode.href}
                          className="text-[11px] font-mono border border-[#30363d] px-3 py-2 text-[#58a6ff] hover:bg-[#21262d] transition-colors text-center block"
                        >
                          → 페이지로 이동
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedNode(null)}
                        className="mt-2 text-[11px] w-full border border-[#30363d] px-3 py-2 text-[#8b949e] hover:bg-[#21262d] transition-colors"
                      >
                        닫기
                      </button>
                    </div>
                  </div>
                </aside>
              </>
            )}
          </div>
        </div>
      </main>

      {/* ─ Footer ─────────────────────────────────────────────────────────── */}
      <footer className="flex-shrink-0 border-t border-[#30363d] bg-[#161b22] px-4 py-2 flex items-center justify-between">
        <span className="text-[10px] text-[#8b949e] font-mono">© 2025 Paiptree.Inc</span>
        <span className="text-[10px] text-[#8b949e] font-mono">
          Made by Creative Team ZORO &nbsp;·&nbsp; Powered by Next.js
        </span>
      </footer>

      <DashFloatingNav current="/dash" />

      {/* ─ Version Modal ──────────────────────────────────────────────────── */}
      {isVersionOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) closeVersion(); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            ref={versionModalRef}
            className="w-full max-w-[480px] bg-[#161b22] border border-[#30363d] shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d]">
              <h3 className="text-[#c9d1d9] font-semibold text-sm">버전별 업데이트 정보</h3>
              <button
                type="button"
                ref={versionCloseBtnRef}
                onClick={closeVersion}
                className="text-[#8b949e] hover:text-[#c9d1d9] text-xs px-2 py-1 border border-[#30363d] hover:bg-[#21262d] transition-colors"
              >
                닫기
              </button>
            </div>
            <div className="p-5">
              <div className="max-h-[460px] overflow-y-auto pr-1 space-y-3">
                {notesLoading && <p className="text-xs text-[#8b949e]">불러오는 중...</p>}
                {notesError   && <p className="text-xs text-[#f85149]">{notesError}</p>}
                {!notesLoading && !notesError && releaseNotes.map(note => (
                  <section key={`${note.version}-${note.date}`} className="p-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-yellow-400 font-semibold text-lg">{note.version}</span>
                      <span className="text-[#6e7681] text-xs">·</span>
                      <span className="text-[#8b949e] text-xs">{note.date}</span>
                    </div>
                    <div className="mt-2 space-y-3">
                      {note.items.map((item, idx) => (
                        <div key={idx} className="text-xs text-[#8b949e]">
                          <p className="font-semibold text-sm text-white">{idx + 1}. {item.titleKo}</p>
                          <ul className="mt-1 ml-1 space-y-1">
                            {item.detailsKo.map((d, di) => (
                              <li key={di} className="grid grid-cols-[10px_1fr] gap-1">
                                <span className="text-[#6e7681]">-</span>
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
                {!notesLoading && !notesError && releaseNotes.length === 0 && (
                  <p className="text-xs text-[#6e7681]">표시할 버전 정보가 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─ Dev Docs Modal ─────────────────────────────────────────────────── */}
      {isDocsOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) closeDocs(); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            ref={docsModalRef}
            className="w-full max-w-[980px] bg-[#161b22] border border-[#30363d] shadow-2xl"
          >
            {/* Modal header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-[#30363d] gap-4">
              <div className="min-w-0">
                <h3 className="text-[#c9d1d9] font-semibold text-sm mb-2">개발 문서</h3>
                <div className="flex flex-wrap gap-2">
                  {SYSTEM_DOC_BUTTONS.map(btn => {
                    const isActive = activeDocSource === 'system' && activeSystemDocKey === btn.key;
                    return (
                      <button
                        key={btn.key}
                        type="button"
                        onClick={() => { setActiveDocSource('system'); setActiveSystemDocKey(btn.key); }}
                        className={`border px-2 py-1 text-[11px] transition-colors flex flex-col items-start leading-tight ${
                          isActive
                            ? 'text-[#58a6ff] border-[#58a6ff]/70 bg-[#58a6ff]/10'
                            : 'text-[#8b949e] border-[#30363d] hover:text-[#c9d1d9] hover:border-[#58a6ff]/50'
                        }`}
                      >
                        <span>{btn.label}</span>
                        <span className="text-[10px] text-[#6e7681] mt-0.5">{btn.path.split('/').pop()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                type="button"
                ref={docsCloseBtnRef}
                onClick={closeDocs}
                className="shrink-0 text-[#8b949e] hover:text-[#c9d1d9] text-xs px-2 py-1 border border-[#30363d] hover:bg-[#21262d] transition-colors"
              >
                닫기
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5">
              {docsLoading && <p className="text-sm text-[#8b949e]">문서를 불러오는 중...</p>}
              {docsError   && <p className="text-sm text-[#f85149]">{docsError}</p>}
              {!docsLoading && !docsError && (
                <div className="grid grid-cols-[280px_1fr] gap-4">
                  {/* TOC */}
                  <aside className="max-h-[520px] overflow-y-auto border border-[#30363d] p-2 bg-[#0d1117]">
                    <p className="text-xs text-[#6e7681] px-1 pb-2 border-b border-[#30363d] mb-2">
                      페이지 / 컴포넌트 / 가이드 문서 목차
                    </p>
                    {componentDocs.map(doc => {
                      const isActive = activeDocSource === 'component' && doc.id === selectedCompDoc?.id;
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => { setActiveDocSource('component'); setSelectedCompDocId(doc.id); }}
                          className={`w-full text-left p-2 border transition-colors mb-2 ${
                            isActive
                              ? 'border-[#58a6ff] bg-[#161b22]'
                              : 'border-transparent hover:border-[#30363d] hover:bg-[#161b22]'
                          }`}
                        >
                          <div className="text-sm font-semibold text-[#c9d1d9]">{doc.title}</div>
                          <div className="text-[11px] text-[#6e7681] mt-1">{doc.path}</div>
                          <div className="text-[11px] text-[#6e7681] mt-1 flex items-center gap-2">
                            <span>{doc.updatedAt}</span>
                            <span>·</span>
                            <span>작성자 {doc.author}</span>
                          </div>
                        </button>
                      );
                    })}
                    {componentDocs.length === 0 && (
                      <p className="text-xs text-[#6e7681] px-1">표시할 문서가 없습니다.</p>
                    )}
                  </aside>

                  {/* Content */}
                  <section className="max-h-[520px] overflow-y-auto border border-[#30363d] p-4 bg-[#0d1117]">
                    {selectedDoc ? (
                      <>
                        <div className="mb-3">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="text-base font-semibold text-[#c9d1d9]">{selectedDoc.title}</h4>
                            <button
                              type="button"
                              onClick={() => openInEditor(selectedDoc)}
                              className="shrink-0 border border-[#58a6ff]/60 px-2 py-1 text-[11px] leading-none text-[#58a6ff] hover:text-[#79b8ff] hover:border-[#79b8ff]/70 transition-colors"
                              title={selectedDoc.absolutePath}
                            >
                              수정
                            </button>
                          </div>
                          <p className="text-xs text-[#6e7681] mt-1">
                            {selectedDoc.path} · {selectedDoc.updatedAt} · 작성자 {selectedDoc.author}
                          </p>
                        </div>
                        <pre className="whitespace-pre-wrap text-xs leading-5 text-[#c9d1d9] font-mono">
                          {selectedDoc.content}
                        </pre>
                      </>
                    ) : (
                      <p className="text-sm text-[#6e7681]">상단 버튼 또는 왼쪽 목차에서 문서를 선택하세요.</p>
                    )}
                  </section>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-5 py-3 border-t border-[#30363d] bg-[#161b22]">
              <h4 className="text-[#c9d1d9] font-semibold text-sm mb-1">문서 작성 예시</h4>
              <div className="text-[11px] text-[#8b949e] space-y-1">
                <p>1) 문서 구조를 모르는 새 작업 시작할 때 (예시: README.md 먼저 읽고 관련 문서 찾아서 진행해)</p>
                <p>2) 문서화 작업 자체를 시킬 때 (예시: README 기준으로 필요한 문서 갱신 범위 판단해서 반영해)</p>
                <p>3) 컴포넌트 수정처럼 대상이 명확할 때 (예시: document-authoring.md 기준으로 해당 컴포넌트 문서 업데이트해)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
