'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Settings, LogOut, User, Bell } from 'lucide-react';

interface NavbarProps {
  lang: 'ko' | 'en';
  setLang: (lang: 'ko' | 'en') => void;
}

type ReleaseItem = {
  titleKo: string;
  titleEn: string;
  detailsKo: string[];
  detailsEn: string[];
};

type ReleaseNote = {
  version: string;
  date: string;
  items: ReleaseItem[];
};

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

type DevDocsResponse = {
  docs: DevDoc[];
};

type SystemDocKey = 'hub' | 'index' | 'authoring' | 'template';

const SYSTEM_DOC_BUTTONS: Array<{ key: SystemDocKey; path: string; labelKo: string; labelEn: string }> = [
  {
    key: 'hub',
    path: 'docs/admin/README.md',
    labelKo: '문서 운영 허브',
    labelEn: 'Docs Hub',
  },
  {
    key: 'index',
    path: 'docs/README.md',
    labelKo: '개발문서 인덱스',
    labelEn: 'Docs Index',
  },
  {
    key: 'authoring',
    path: 'docs/guides/document-authoring.md',
    labelKo: '개발문서 작성가이드',
    labelEn: 'Authoring Guide',
  },
  {
    key: 'template',
    path: 'docs/templates/component-spec.template.md',
    labelKo: '컴포넌트 템플릿',
    labelEn: 'Component Spec Template',
  },
];

const SYSTEM_DOC_PATHS = new Set(SYSTEM_DOC_BUTTONS.map((button) => button.path));
const SEMVER_LIKE_PATTERN = /^\d+\.\d+\.\d+$/;
const NOTE_DATE_PATTERN = /^\d{2}\.\d{2}\.\d{2}$/;
const SUPABASE_EXPORT_VIEW = process.env.NEXT_PUBLIC_SUPABASE_EXPORT_VIEW?.trim() || 'project_release_notes_export_v1';
const SUPABASE_PROJECT_ID = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID?.trim() || 'poc';
const SUPABASE_PUBLIC_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
const SUPABASE_PUBLIC_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY?.trim() || '';

const compareSemverDesc = (a: string, b: string): number => {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);

  for (let index = 0; index < 3; index += 1) {
    if (aParts[index] !== bParts[index]) {
      return bParts[index] - aParts[index];
    }
  }

  return 0;
};

const getLatestVersion = (notes: ReleaseNote[]): string => {
  const versions = notes
    .map((note) => (typeof note.version === 'string' ? note.version.trim() : ''))
    .filter((version): version is string => SEMVER_LIKE_PATTERN.test(version))
    .sort(compareSemverDesc);

  return versions[0] ?? '0.0.0';
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const asNonEmptyStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
      .filter((line): line is string => typeof line === 'string' && line.trim().length > 0)
      .map((line) => line.trim())
    : [];

const sanitizeReleaseItem = (value: unknown): ReleaseItem | null => {
  if (!isRecord(value)) {
    return null;
  }

  const titleKo = typeof value.titleKo === 'string' ? value.titleKo.trim() : '';
  const titleEn = typeof value.titleEn === 'string' ? value.titleEn.trim() : '';
  const detailsKo = asNonEmptyStringArray(value.detailsKo);
  const detailsEn = asNonEmptyStringArray(value.detailsEn);

  if (!titleKo || !titleEn) {
    return null;
  }

  return { titleKo, titleEn, detailsKo, detailsEn };
};

const sanitizeReleaseNote = (value: unknown): ReleaseNote | null => {
  if (!isRecord(value)) {
    return null;
  }

  const version = typeof value.version === 'string' ? value.version.trim() : '';
  const date = typeof value.date === 'string' ? value.date.trim() : '';
  if (!SEMVER_LIKE_PATTERN.test(version) || !NOTE_DATE_PATTERN.test(date)) {
    return null;
  }

  const items = Array.isArray(value.items)
    ? value.items.map(sanitizeReleaseItem).filter((item): item is ReleaseItem => item !== null)
    : [];

  if (items.length === 0) {
    return null;
  }

  return { version, date, items };
};

const compareDateDesc = (a: string, b: string): number => {
  const toComparable = (value: string) => {
    const [yy, mm, dd] = value.split('.').map(Number);
    return (2000 + yy) * 10000 + mm * 100 + dd;
  };

  return toComparable(b) - toComparable(a);
};

const sanitizeAndSortReleaseNotes = (rawNotes: unknown): ReleaseNote[] => {
  if (!Array.isArray(rawNotes)) {
    throw new Error('Invalid version notes payload');
  }

  return rawNotes
    .map(sanitizeReleaseNote)
    .filter((note): note is ReleaseNote => note !== null)
    .sort((a, b) => {
      const byVersion = compareSemverDesc(a.version, b.version);
      return byVersion !== 0 ? byVersion : compareDateDesc(a.date, b.date);
    });
};

const fetchReleaseNotesFromSupabase = async (signal: AbortSignal): Promise<ReleaseNote[]> => {
  if (!SUPABASE_PUBLIC_URL || !SUPABASE_PUBLIC_KEY) {
    throw new Error('Supabase env is missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_KEY');
  }

  const endpoint = new URL(
    `/rest/v1/${SUPABASE_EXPORT_VIEW}`,
    SUPABASE_PUBLIC_URL.endsWith('/') ? SUPABASE_PUBLIC_URL : `${SUPABASE_PUBLIC_URL}/`,
  );
  endpoint.searchParams.set('project_id', `eq.${SUPABASE_PROJECT_ID}`);
  endpoint.searchParams.set('select', 'version,date,items');
  endpoint.searchParams.set('limit', '500');

  try {
    const response = await fetch(endpoint.toString(), {
      method: 'GET',
      headers: {
        apikey: SUPABASE_PUBLIC_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLIC_KEY}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal,
    });

    if (!response.ok) {
      throw new Error(`Supabase request failed (${response.status})`);
    }

    return sanitizeAndSortReleaseNotes(await response.json());
  } catch (error) {
    if (signal.aborted) {
      throw error;
    }
    console.error('[release-notes] failed to fetch from Supabase', error);
    throw error;
  }
};

const Navbar = ({ lang, setLang }: NavbarProps) => {
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState<ReleaseNote[]>([]);
  const [currentVersion, setCurrentVersion] = useState('0.0.0');
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [devDocs, setDevDocs] = useState<DevDoc[]>([]);
  const [isDocsLoading, setIsDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [selectedComponentDocId, setSelectedComponentDocId] = useState<string | null>(null);
  const [activeDocSource, setActiveDocSource] = useState<'system' | 'component'>('system');
  const [activeSystemDocKey, setActiveSystemDocKey] = useState<SystemDocKey>('hub');
  const versionModalRef = useRef<HTMLDivElement>(null);
  const versionCloseButtonRef = useRef<HTMLButtonElement>(null);
  const docsModalRef = useRef<HTMLDivElement>(null);
  const docsCloseButtonRef = useRef<HTMLButtonElement>(null);

  const closeVersionModal = useCallback(() => {
    setIsVersionModalOpen(false);
  }, []);

  const closeDocsModal = useCallback(() => {
    setIsDocsModalOpen(false);
  }, []);

  const loadReleaseNotes = useCallback(
    async ({ signal, showLoading, showError }: { signal: AbortSignal; showLoading: boolean; showError: boolean }) => {
      if (showLoading) {
        setIsNotesLoading(true);
        setNotesError(null);
      }

      try {
        const notes = await fetchReleaseNotesFromSupabase(signal);
        setReleaseNotes(notes);
        setCurrentVersion(getLatestVersion(notes));
      } catch (error) {
        if (signal.aborted) {
          return;
        }
        if (showError) {
          setNotesError(lang === 'ko' ? '버전 정보를 불러오지 못했습니다.' : 'Unable to load version notes.');
        }
      } finally {
        if (showLoading && !signal.aborted) {
          setIsNotesLoading(false);
        }
      }
    },
    [lang],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadReleaseNotes({ signal: controller.signal, showLoading: false, showError: false });
    return () => controller.abort();
  }, [loadReleaseNotes]);

  useEffect(() => {
    if (!isVersionModalOpen) {
      return;
    }

    const controller = new AbortController();
    void loadReleaseNotes({ signal: controller.signal, showLoading: true, showError: true });
    return () => controller.abort();
  }, [isVersionModalOpen, loadReleaseNotes]);

  useEffect(() => {
    if (!isDocsModalOpen) {
      return;
    }

    const controller = new AbortController();
    const loadDevDocs = async () => {
      setIsDocsLoading(true);
      setDocsError(null);

      try {
        const response = await fetch('/api/dev-docs', {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to load docs (${response.status})`);
        }

        const data = (await response.json()) as DevDocsResponse;
        if (!Array.isArray(data.docs)) {
          throw new Error('Invalid dev docs payload');
        }

        setDevDocs(data.docs);
        const tocDocs = data.docs.filter((doc) => {
          const isTocGroup =
            doc.path.startsWith('docs/components/') ||
            doc.path.startsWith('docs/guides/') ||
            doc.path.startsWith('docs/pages/') ||
            doc.path.startsWith('docs/admin/');
          return isTocGroup && !SYSTEM_DOC_PATHS.has(doc.path);
        });
        setSelectedComponentDocId((prev) => {
          if (prev && tocDocs.some((doc) => doc.id === prev)) {
            return prev;
          }
          return tocDocs[0]?.id ?? null;
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        setDocsError(lang === 'ko' ? '개발 문서를 불러오지 못했습니다.' : 'Unable to load development docs.');
      } finally {
        if (!controller.signal.aborted) {
          setIsDocsLoading(false);
        }
      }
    };

    void loadDevDocs();
    return () => controller.abort();
  }, [isDocsModalOpen, lang]);

  useEffect(() => {
    const isAnyModalOpen = isVersionModalOpen || isDocsModalOpen;
    if (!isAnyModalOpen) {
      return;
    }

    const activeModalRef = isDocsModalOpen ? docsModalRef : versionModalRef;
    const activeCloseButtonRef = isDocsModalOpen ? docsCloseButtonRef : versionCloseButtonRef;
    const closeActiveModal = isDocsModalOpen ? closeDocsModal : closeVersionModal;

    activeCloseButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeActiveModal();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const modalElement = activeModalRef.current;
      if (!modalElement) {
        return;
      }

      const focusableSelectors = [
        'button',
        '[href]',
        'input',
        'select',
        'textarea',
        '[tabindex]:not([tabindex="-1"])',
      ].join(',');

      const focusableElements = Array.from(modalElement.querySelectorAll<HTMLElement>(focusableSelectors)).filter(
        (element) =>
          !element.hasAttribute('disabled') &&
          element.getAttribute('aria-hidden') !== 'true' &&
          (element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement),
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        modalElement.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!activeElement || activeElement === firstElement || !modalElement.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus();
        }
        return;
      }

      if (!activeElement || activeElement === lastElement || !modalElement.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeDocsModal, closeVersionModal, isDocsModalOpen, isVersionModalOpen]);

  const docsByPath = useMemo(() => new Map(devDocs.map((doc) => [doc.path, doc])), [devDocs]);
  const componentDocs = useMemo(
    () =>
      devDocs.filter((doc) => {
        const isTocGroup =
          doc.path.startsWith('docs/components/') ||
          doc.path.startsWith('docs/guides/') ||
          doc.path.startsWith('docs/pages/') ||
          doc.path.startsWith('docs/admin/');
        return isTocGroup && !SYSTEM_DOC_PATHS.has(doc.path);
      }),
    [devDocs],
  );
  const selectedSystemDoc = useMemo(
    () => docsByPath.get(SYSTEM_DOC_BUTTONS.find((button) => button.key === activeSystemDocKey)?.path ?? '') ?? null,
    [activeSystemDocKey, docsByPath],
  );
  const selectedComponentDoc =
    componentDocs.find((doc) => doc.id === selectedComponentDocId) ?? componentDocs[0] ?? null;
  const selectedDoc = activeDocSource === 'system' ? selectedSystemDoc : selectedComponentDoc;
  const openDocInEditor = useCallback((doc: DevDoc) => {
    if (!doc.editorUri) {
      return;
    }

    const opened = window.open(doc.editorUri, '_blank', 'noopener,noreferrer');
    if (!opened) {
      window.location.href = doc.editorUri;
    }
  }, []);

  return (
    <>
      <div className="bg-[#161b22] border-b border-[#30363d] px-6 py-3 flex items-center justify-between">
        {/* Left - Logo */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-semibold text-2xl">Farmers_Mind</span>
          <span className="text-[#3fb950] font-semibold ml-2 text-base">PoC (Ver.{currentVersion})</span>
          <button
            type="button"
            onClick={() => {
              setIsDocsModalOpen(false);
              setIsVersionModalOpen(true);
            }}
            className="h-6 text-[10px] leading-none text-[#3fb950] border border-[#3fb950]/40 px-2 hover:text-[#56d364] hover:border-[#56d364]/50 transition-colors"
          >
            {lang === 'ko' ? '업데이트 정보' : 'Updates'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsVersionModalOpen(false);
              setIsDocsModalOpen(true);
              setActiveDocSource('system');
              setActiveSystemDocKey('hub');
            }}
            className="h-6 text-[10px] leading-none text-[#3fb950] border border-[#3fb950]/40 px-2 hover:text-[#56d364] hover:border-[#56d364]/50 transition-colors"
          >
            {lang === 'ko' ? '개발문서' : 'Dev Docs'}
          </button>
        </div>

        {/* Right - User & Actions */}
        <div className="flex items-center gap-4">
          {/* Language, Notifications, Settings Group */}
          <div className="flex items-center gap-1">
            {/* Language Switch */}
            <div className="flex items-center border border-[#30363d]">
              <span
                className={`px-2.5 py-1 text-xs font-medium cursor-pointer transition-all ${lang === 'ko' ? 'text-gray-400' : 'text-gray-500 hover:text-gray-400'}`}
                onClick={() => setLang('ko')}
              >
                KO
              </span>
              <span className="text-gray-600">|</span>
              <span
                className={`px-2.5 py-1 text-xs font-medium cursor-pointer transition-all ${lang === 'en' ? 'text-gray-400' : 'text-gray-500 hover:text-gray-400'}`}
                onClick={() => setLang('en')}
              >
                EN
              </span>
            </div>

            {/* Notifications */}
            <button className="ml-2 p-2 text-gray-400 hover:text-gray-400 hover:bg-[#21262d] transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            {/* Settings */}
            <button className="p-2 text-gray-400 hover:text-gray-400 hover:bg-[#21262d] transition-colors">
              <Settings className="w-5 h-5" />
            </button>

          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-[#30363d]" />

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#21262d] border border-[#30363d] flex items-center justify-center">
              <User className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-sm">
              <p className="text-gray-400">C.P.Group</p>
              <p className="text-gray-500 text-xs">ChampaHomFarm</p>
            </div>
          </div>

          {/* Logout */}
          <button className="h-8 flex items-center gap-2 px-3 border border-[#30363d] text-gray-400 hover:text-red-400 hover:bg-[#21262d] transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {isVersionModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeVersionModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            ref={versionModalRef}
            className="w-full max-w-[480px] bg-[#161b22] border border-[#30363d]  shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d]">
              <h3 className="text-gray-400 font-semibold">
                {lang === 'ko' ? '버전별 업데이트 정보' : 'Version Update Notes'}
              </h3>
              <button
                type="button"
                ref={versionCloseButtonRef}
                onClick={closeVersionModal}
                className="text-gray-400 hover:text-gray-400 text-sm px-2 py-1  hover:bg-[#21262d]"
              >
                {lang === 'ko' ? '닫기' : 'Close'}
              </button>
            </div>

            <div className="p-5">
              <div className="max-h-[460px] overflow-y-auto pr-1 space-y-3">
                {isNotesLoading && (
                  <p className="text-xs text-gray-400">{lang === 'ko' ? '불러오는 중...' : 'Loading...'}</p>
                )}

                {notesError && <p className="text-xs text-red-400">{notesError}</p>}

                {!isNotesLoading &&
                  !notesError &&
                  releaseNotes.map((note) => (
                    <section
                      key={`${note.version}-${note.date}`}
                      className="border border-transparent  p-3 bg-transparent"
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="text-yellow-400 font-semibold text-lg">{note.version}</span>
                        <span className="text-gray-500 text-xs">·</span>
                        <span className="text-gray-400 text-xs">{note.date}</span>
                      </div>
                      <div className="mt-2 space-y-3">
                        {note.items.map((item, itemIndex) => (
                          <div key={`${note.version}-item-${itemIndex}`} className="text-xs text-gray-400">
                            <p className="font-semibold text-sm text-white">
                              {itemIndex + 1}. {lang === 'ko' ? item.titleKo : item.titleEn}
                            </p>
                            <ul className="mt-1 ml-1 space-y-1">
                              {(lang === 'ko' ? item.detailsKo : item.detailsEn).map((detail, detailIndex) => (
                                <li
                                  key={`${note.version}-item-${itemIndex}-detail-${detailIndex}`}
                                  className="grid grid-cols-[10px_1fr] gap-1"
                                >
                                  <span className="text-gray-500">-</span>
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}

                {!isNotesLoading && !notesError && releaseNotes.length === 0 && (
                  <p className="text-xs text-gray-500">{lang === 'ko' ? '표시할 버전 정보가 없습니다.' : 'No version notes available.'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isDocsModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeDocsModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            ref={docsModalRef}
            className="w-full max-w-[980px] bg-[#161b22] border border-[#30363d]  shadow-2xl"
          >
            <div className="flex items-start justify-between px-5 py-4 border-b border-[#30363d] gap-4">
              <div className="min-w-0">
                <h3 className="text-gray-300 font-semibold">
                  {lang === 'ko' ? '개발 문서' : 'Development Docs'}
                </h3>
                <div className="mt-2 flex items-start justify-between gap-4">
                  <div className="flex flex-wrap gap-2 justify-start self-center shrink-0">
                    {SYSTEM_DOC_BUTTONS.map((button) => {
                      const isActive = activeDocSource === 'system' && activeSystemDocKey === button.key;
                      return (
                        <button
                          key={button.key}
                          type="button"
                          onClick={() => {
                            setActiveDocSource('system');
                            setActiveSystemDocKey(button.key);
                          }}
                          className={`border  px-2 py-1 transition-colors flex flex-col items-start leading-tight ${
                            isActive
                              ? 'text-[#3fb950] border-[#3fb950]/70 bg-[#3fb950]/10'
                              : 'text-gray-400 border-[#30363d] hover:text-gray-200 hover:border-[#3fb950]/50'
                          }`}
                        >
                          <span className="text-[11px]">{lang === 'ko' ? button.labelKo : button.labelEn}</span>
                          <span className="text-[10px] text-gray-500 mt-0.5">{button.path.split('/').pop()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <button
                type="button"
                ref={docsCloseButtonRef}
                onClick={closeDocsModal}
                className="text-gray-400 hover:text-gray-200 text-sm px-2 py-1  hover:bg-[#21262d]"
              >
                {lang === 'ko' ? '닫기' : 'Close'}
              </button>
            </div>

            <div className="p-5">
              {isDocsLoading && (
                <p className="text-sm text-gray-400">{lang === 'ko' ? '문서를 불러오는 중...' : 'Loading documents...'}</p>
              )}

              {docsError && <p className="text-sm text-red-400">{docsError}</p>}

              {!isDocsLoading && !docsError && (
                <div>
                  <div className="grid grid-cols-[280px_1fr] gap-4">
                    <aside className="max-h-[520px] overflow-y-auto border border-[#30363d]  p-2 bg-[#0d1117]">
                      <p className="text-xs text-gray-500 px-1 pb-2 border-b border-[#30363d] mb-2">
                        {lang === 'ko' ? '페이지/컴포넌트/가이드 문서 목차' : 'Pages, Specs & Guides TOC'}
                      </p>
                      {componentDocs.map((doc) => {
                        const isActive = activeDocSource === 'component' && doc.id === selectedComponentDoc?.id;
                        return (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => {
                              setActiveDocSource('component');
                              setSelectedComponentDocId(doc.id);
                            }}
                            className={`w-full text-left p-2  border transition-colors mb-2 ${
                              isActive
                                ? 'border-[#3fb950] bg-[#161b22]'
                                : 'border-transparent hover:border-[#30363d] hover:bg-[#161b22]'
                            }`}
                          >
                            <div className="text-sm font-semibold text-gray-200">{doc.title}</div>
                            <div className="text-[11px] text-gray-500 mt-1">{doc.path}</div>
                            <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-2">
                              <span>{doc.updatedAt}</span>
                              <span>·</span>
                              <span>{lang === 'ko' ? `작성자 ${doc.author}` : `Author ${doc.author}`}</span>
                            </div>
                          </button>
                        );
                      })}
                      {componentDocs.length === 0 && (
                        <p className="text-xs text-gray-500 px-1">
                          {lang === 'ko' ? '표시할 문서가 없습니다.' : 'No documents found.'}
                        </p>
                      )}
                    </aside>

                    <section className="max-h-[520px] overflow-y-auto border border-[#30363d]  p-4 bg-[#0d1117]">
                      {selectedDoc ? (
                        <>
                          <div className="mb-3">
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="text-base font-semibold text-gray-200">{selectedDoc.title}</h4>
                              <button
                                type="button"
                                onClick={() => openDocInEditor(selectedDoc)}
                                className="shrink-0 border border-[#3fb950]/60 px-2 py-1 text-[11px] leading-none text-[#3fb950] hover:text-[#56d364] hover:border-[#56d364]/70 transition-colors"
                                title={selectedDoc.absolutePath}
                              >
                                {lang === 'ko' ? '수정' : 'Edit'}
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {selectedDoc.path} · {selectedDoc.updatedAt} · {lang === 'ko' ? `작성자 ${selectedDoc.author}` : `Author ${selectedDoc.author}`}
                            </p>
                          </div>
                          <pre className="whitespace-pre-wrap text-xs leading-5 text-gray-300 font-mono">
                            {selectedDoc.content}
                          </pre>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">
                          {lang === 'ko'
                            ? '상단 버튼 또는 왼쪽 목차에서 문서를 선택하세요.'
                            : 'Choose a document from top buttons or the left TOC.'}
                        </p>
                      )}
                    </section>
                  </div>

                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-[#30363d] bg-[#161b22]">
              <h4 className="text-gray-300 font-semibold text-sm mb-1">
                {lang === 'ko' ? '문서 작성 예시' : 'Documentation Prompt Examples'}
              </h4>
              <div className="text-[11px] text-gray-400 space-y-1">
                <p className="text-left">
                  {lang === 'ko'
                    ? '1) 문서 구조를 모르는 새 작업 시작할 때 (예시: README.md 먼저 읽고 관련 문서 찾아서 진행해)'
                    : '1) When starting a new task without doc context (Example: Read README.md first and proceed with related docs)'}
                </p>
                <p className="text-left">
                  {lang === 'ko'
                    ? '2) 문서화 작업 자체를 시킬 때 (예시: README 기준으로 필요한 문서 갱신 범위 판단해서 반영해)'
                    : '2) When requesting a documentation task (Example: Use README to determine and update required docs)'}
                </p>
                <p className="text-left">
                  {lang === 'ko'
                    ? '3) 컴포넌트 수정처럼 대상이 명확할 때 (예시: document-authoring.md 기준으로 ForecastMatrix 문서 업데이트해)'
                    : '3) When target is explicit, such as a component update (Example: Update ForecastMatrix docs based on document-authoring.md)'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
