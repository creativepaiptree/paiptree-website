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

type ArchLayer = 'frontend' | 'core' | 'backend';
type ArchNode = {
  id: string; name: string; sub: string; layer: ArchLayer;
  color: string; href: string | null;
  cx: number; cy: number; w: number; h: number;
  desc: string; connects: string[];
};

const ARCH_NODES: ArchNode[] = [
  { id: 'ems',          name: 'EMS',          sub: '기업 모니터링',    layer: 'frontend', color: '#3fb950', href: '/PoC',  cx: 220, cy: 85,  w: 150, h: 60, desc: '전체 농장 통계, 출하 예측, 기업 운영자용 대시보드', connects: ['Farmers-Mind'] },
  { id: 'aiapp',        name: 'AI App',        sub: '농장주 모바일',    layer: 'frontend', color: '#8b5cf6', href: null,   cx: 450, cy: 85,  w: 150, h: 60, desc: '개별 농장주 앱. 자신의 농장 현황 및 체중 예측 확인', connects: ['Farmers-Mind'] },
  { id: 'tms',          name: 'TMS',           sub: '차량 관제',        layer: 'frontend', color: '#f0883e', href: '/tms', cx: 680, cy: 85,  w: 150, h: 60, desc: '농장→도축장→유통 차량 관리. 배차 및 정산 처리', connects: ['Farmers-Mind'] },
  { id: 'farmers_mind', name: 'Farmers-Mind',  sub: '무게예측 코어 엔진', layer: 'core',   color: '#58a6ff', href: null,   cx: 450, cy: 240, w: 260, h: 70, desc: '중앙 AI 무게예측 엔진. 모든 서비스의 핵심 데이터 소스', connects: ['EMS', 'AI App', 'TMS', 'API Gateway', 'ML Engine', 'Data Pipeline', 'Database'] },
  { id: 'api_gw',       name: 'API Gateway',   sub: '요청 라우팅',      layer: 'backend',  color: '#8b949e', href: null,   cx: 195, cy: 390, w: 140, h: 60, desc: '모든 클라이언트 요청 라우팅 및 인증 처리', connects: ['Farmers-Mind'] },
  { id: 'ml_engine',    name: 'ML Engine',     sub: '예측 추론 서버',   layer: 'backend',  color: '#8b949e', href: null,   cx: 365, cy: 390, w: 140, h: 60, desc: '체중 예측 모델 학습 및 실시간 추론 서버', connects: ['Farmers-Mind'] },
  { id: 'pipeline',     name: 'Data Pipeline', sub: '데이터 수집/정제', layer: 'backend',  color: '#8b949e', href: null,   cx: 535, cy: 390, w: 140, h: 60, desc: '농장 센서 데이터 수집, 정제, 저장 파이프라인', connects: ['Farmers-Mind'] },
  { id: 'database',     name: 'Database',      sub: '데이터 저장소',    layer: 'backend',  color: '#8b949e', href: null,   cx: 705, cy: 390, w: 140, h: 60, desc: '농장 데이터, 예측 결과, 사용자 정보 영구 저장', connects: ['Farmers-Mind'] },
];

const SYSTEM_DOC_BUTTONS = [
  { key: 'hub',       path: 'docs/admin/README.md',                          label: '문서 운영 허브'    },
  { key: 'index',     path: 'docs/README.md',                                label: '개발문서 인덱스'   },
  { key: 'authoring', path: 'docs/guides/document-authoring.md',             label: '개발문서 작성가이드' },
  { key: 'template',  path: 'docs/templates/component-spec.template.md',     label: '컴포넌트 템플릿'   },
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
              <p className="text-[9px] font-mono text-[#30363d]">Farmers-Mind Platform · v1.0</p>
            </div>
            {/* Diagram — 항상 full-width */}
            <div className="border border-[#30363d] bg-[#0d1117]">
                <svg viewBox="0 0 900 460" className="w-full h-auto">
                  <defs>
                    <pattern id="grid-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                      <circle cx="1" cy="1" r="0.8" fill="#30363d" opacity="0.4" />
                    </pattern>
                    <marker id="arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="#30363d" />
                    </marker>
                  </defs>

                  {/* Background */}
                  <rect x="0" y="0" width="900" height="460" fill="url(#grid-dots)" />

                  {/* ── Layer bands ── */}
                  <rect x="8" y="20" width="884" height="120" fill="#161b22" fillOpacity="0.6" rx="2" />
                  <text x="18" y="34" fill="#6e7681" fontSize="9" fontFamily="ui-monospace,SFMono-Regular,monospace" letterSpacing="2">FRONTEND</text>

                  <rect x="8" y="160" width="884" height="125" fill="#161b22" fillOpacity="0.85" rx="2" stroke="#58a6ff" strokeOpacity="0.25" strokeWidth="1" />
                  <text x="18" y="174" fill="#6e7681" fontSize="9" fontFamily="ui-monospace,SFMono-Regular,monospace" letterSpacing="2">CORE ENGINE</text>

                  <rect x="8" y="305" width="884" height="130" fill="#161b22" fillOpacity="0.6" rx="2" />
                  <text x="18" y="319" fill="#6e7681" fontSize="9" fontFamily="ui-monospace,SFMono-Regular,monospace" letterSpacing="2">BACKEND</text>

                  {/* ── Connections: Frontend → Farmers-Mind ── */}
                  <path d="M220,115 C220,160 450,160 450,205" stroke="#30363d" strokeWidth="1" fill="none" markerEnd="url(#arr)" />
                  <path d="M450,115 L450,205" stroke="#30363d" strokeWidth="1" fill="none" markerEnd="url(#arr)" />
                  <path d="M680,115 C680,160 450,160 450,205" stroke="#30363d" strokeWidth="1" fill="none" markerEnd="url(#arr)" />

                  {/* ── Connections: Farmers-Mind → Backend ── */}
                  <path d="M450,275 C450,318 195,318 195,360" stroke="#30363d" strokeWidth="1" fill="none" markerEnd="url(#arr)" />
                  <path d="M450,275 C450,318 365,318 365,360" stroke="#30363d" strokeWidth="1" fill="none" markerEnd="url(#arr)" />
                  <path d="M450,275 C450,318 535,318 535,360" stroke="#30363d" strokeWidth="1" fill="none" markerEnd="url(#arr)" />
                  <path d="M450,275 C450,318 705,318 705,360" stroke="#30363d" strokeWidth="1" fill="none" markerEnd="url(#arr)" />

                  {/* ── Nodes ── */}
                  {ARCH_NODES.map(node => {
                    const nx = node.cx - node.w / 2;
                    const ny = node.cy - node.h / 2;
                    const isSel = selectedNode === node.id;
                    return (
                      <g
                        key={node.id}
                        onClick={() => setSelectedNode(prev => prev === node.id ? null : node.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <rect x={nx} y={ny} width={node.w} height={node.h} fill="#0d1117" stroke={node.color} strokeWidth={isSel ? 2 : 1} />
                        <rect x={nx} y={ny} width={node.w} height={node.h} fill={node.color} fillOpacity={isSel ? 0.12 : 0.04} />
                        <text x={node.cx} y={node.cy - 7} textAnchor="middle" fill={isSel ? '#ffffff' : '#c9d1d9'} fontSize="12" fontWeight="700" fontFamily="ui-monospace,SFMono-Regular,monospace">{node.name}</text>
                        <text x={node.cx} y={node.cy + 10} textAnchor="middle" fill={node.color} fontSize="9" fontFamily="ui-monospace,SFMono-Regular,monospace" letterSpacing="1">{node.sub}</text>
                      </g>
                    );
                  })}

                  {/* ── Legend ── */}
                  <rect x="20" y="445" width="7" height="7" fill="none" stroke="#3fb950" strokeWidth="1" />
                  <text x="31" y="452" fill="#6e7681" fontSize="9" fontFamily="ui-monospace,SFMono-Regular,monospace">FRONTEND</text>
                  <rect x="110" y="445" width="7" height="7" fill="none" stroke="#58a6ff" strokeWidth="1" />
                  <text x="121" y="452" fill="#6e7681" fontSize="9" fontFamily="ui-monospace,SFMono-Regular,monospace">CORE</text>
                  <rect x="167" y="445" width="7" height="7" fill="none" stroke="#8b949e" strokeWidth="1" />
                  <text x="178" y="452" fill="#6e7681" fontSize="9" fontFamily="ui-monospace,SFMono-Regular,monospace">BACKEND</text>
                  <text x="610" y="452" fill="#30363d" fontSize="9" fontFamily="ui-monospace,SFMono-Regular,monospace">click node for details →</text>
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
                      <span
                        className="text-[9px] font-mono border px-1 py-[1px] uppercase tracking-widest self-start"
                        style={{ color: selectedArchNode.color, borderColor: selectedArchNode.color }}
                      >
                        {selectedArchNode.layer}
                      </span>
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
                    <p className="text-[12px] text-[#c9d1d9] leading-relaxed">{selectedArchNode.desc}</p>
                    {selectedArchNode.connects.length > 0 && (
                      <div>
                        <p className="text-[9px] font-mono text-[#6e7681] uppercase tracking-widest mb-2">Connections</p>
                        <div className="flex flex-col gap-1.5">
                          {selectedArchNode.connects.map(c => (
                            <span key={c} className="text-[11px] font-mono text-[#8b949e] border-l-2 border-[#30363d] pl-3">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedArchNode.href && (
                      <a
                        href={selectedArchNode.href}
                        className="text-[11px] font-mono border border-[#30363d] px-3 py-2 text-[#58a6ff] hover:bg-[#21262d] transition-colors text-center block"
                      >
                        → 페이지로 이동
                      </a>
                    )}
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
