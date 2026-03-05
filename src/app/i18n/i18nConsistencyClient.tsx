'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import DashFloatingNav from '@/components/dash/DashFloatingNav';

const LANGS = ['en', 'ko', 'th', 'tw', 'jp'] as const;
type Lang = (typeof LANGS)[number];
type Service = 'FM-AI' | 'FM-EMS and PoC';

const SERVICES: Service[] = ['FM-AI', 'FM-EMS and PoC'];
const FILE_PREFIX: Record<Service, string> = {
  'FM-AI': 'ai',
  'FM-EMS and PoC': 'ems',
};

type FlatTranslation = Record<string, string>;
type ServiceConsistency = {
  keys: string[];
  languages: Partial<Record<Lang, FlatTranslation>>;
  errors: Partial<Record<Lang, string>>;
};
type I18nConsistencyData = Record<Service, ServiceConsistency>;

type RowCell = {
  lang: Lang;
  type: 'missing' | 'empty' | 'ok';
  text: string;
  hasKey: boolean;
};

type Row = {
  key: string;
  cells: RowCell[];
  hasIssue: boolean;
};

type Props = {
  initialData: I18nConsistencyData;
};

type SaveApiResponse = {
  success: boolean;
  error?: string;
};

type ChangeItem = {
  key: string;
  lang: Lang;
  oldVal: string;
  newVal: string;
};

const SAVE_PASSWORD = 'creative';

const buildRows = (
  data: ServiceConsistency,
  query: string,
  showOnlyIssues: boolean,
  activeLangs: readonly Lang[],
) => {
  const q = query.trim().toLowerCase();
  const rows: Row[] = [];
  const issueSummary = activeLangs.map((lang) => ({ lang, missing: 0, empty: 0 }));
  let issueCount = 0;

  for (const key of data.keys) {
    const cells: RowCell[] = [];
    let hasIssue = false;

    for (const lang of activeLangs) {
      const map = data.languages[lang] ?? {};
      const hasKey = Object.prototype.hasOwnProperty.call(map, key);
      const value = hasKey ? map[key] ?? '' : '';

      let type: 'missing' | 'empty' | 'ok' = 'ok';
      if (!hasKey || map === undefined) {
        type = 'missing';
        hasIssue = true;
        const stat = issueSummary.find((item) => item.lang === lang);
        if (stat) {
          stat.missing += 1;
        }
      } else if (value === '') {
        type = 'empty';
        hasIssue = true;
        const stat = issueSummary.find((item) => item.lang === lang);
        if (stat) {
          stat.empty += 1;
        }
      }

      cells.push({
        lang,
        type,
        text: value,
        hasKey,
      });
    }

    const searchable = [key, ...cells.map((cell) => cell.text)].join(' ').toLowerCase();
    if (q && !searchable.includes(q)) {
      continue;
    }

    if (showOnlyIssues && !hasIssue) {
      continue;
    }

    if (hasIssue) {
      issueCount += 1;
    }

    rows.push({
      key,
      cells,
      hasIssue,
    });
  }

  const summary = issueSummary
    .map((item) => `${item.lang}: missing ${item.missing}, empty ${item.empty}`)
    .join(' | ');

  return {
    rows,
    totalKeys: data.keys.length,
    issueCount,
    summary,
  };
};

const cloneInitialData = (data: I18nConsistencyData): I18nConsistencyData =>
  JSON.parse(JSON.stringify(data)) as I18nConsistencyData;

const escapeTsString = (value: string): string => {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/'/g, "\\'");
};

const isObjectLike = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const toNestedObject = (flat: FlatTranslation, keys: string[]): Record<string, unknown> => {
  const out: Record<string, unknown> = {};

  for (const key of keys) {
    const value = flat[key] ?? '';
    const path = key.split('.');
    let node: Record<string, unknown> = out;

    for (let i = 0; i < path.length; i += 1) {
      const segment = path[i];
      const isLeaf = i === path.length - 1;

      if (isLeaf) {
        node[segment] = value;
        continue;
      }

      const next = node[segment];
      if (!isObjectLike(next)) {
        node[segment] = {};
      }
      node = node[segment] as Record<string, unknown>;
    }
  }

  return out;
};

const quoteKey = (key: string): string => `'${escapeTsString(key)}'`;

const serializeValue = (value: unknown, indent = 0): string => {
  if (typeof value === 'string') {
    return `'${escapeTsString(value)}'`;
  }

  if (value === null || value === undefined) {
    return "''";
  }

  if (Array.isArray(value)) {
    return '[]';
  }

  if (isObjectLike(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return '{}';
    }

    const pad = ' '.repeat(indent);
    const nextPad = ' '.repeat(indent + 2);
    const body = entries
      .map(
        ([k, v], idx) =>
          `${nextPad}${quoteKey(k)}: ${serializeValue(v, indent + 2)}${
            idx + 1 === entries.length ? '' : ','
          }`,
      )
      .join('\n');

    return `{\n${body}\n${pad}}`;
  }

  return `'${escapeTsString(String(value))}'`;
};

const buildTsContent = (flat: FlatTranslation, keys: string[]): string => {
  const nested = toNestedObject(flat, keys);
  return `export default ${serializeValue(nested, 0)};\n`;
};

const downloadTextFile = (filename: string, content: string): void => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export default function I18nConsistencyClient({ initialData }: Props) {
  const [service, setService] = useState<Service>(SERVICES[0]);
  const [query, setQuery] = useState('');
  const [showOnlyIssues, setShowOnlyIssues] = useState(false);
  const [activeLangs, setActiveLangs] = useState<Lang[]>([...LANGS]);
  const [workingData, setWorkingData] = useState<I18nConsistencyData>(() => cloneInitialData(initialData));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<ChangeItem[]>([]);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const activeData = workingData[service];
  const visibleLangs = LANGS.filter((lang) => activeLangs.includes(lang));

  const { rows, issueCount, summary, totalKeys } = useMemo(
    () => buildRows(activeData, query, showOnlyIssues, visibleLangs),
    [activeData, query, showOnlyIssues, visibleLangs],
  );

  const parseErrorLanguages = useMemo(
    () => Object.entries(activeData.errors).filter((entry): entry is [Lang, string] => Boolean(entry[1])),
    [activeData],
  );

  const onServiceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setService(event.target.value as Service);
    setShowOnlyIssues(false);
    setQuery('');
  };

  const onLanguageToggle = (lang: Lang) => {
    setActiveLangs((prev) => {
      const hasLang = prev.includes(lang);
      if (hasLang) {
        if (prev.length === 1) {
          return prev;
        }

        return prev.filter((item) => item !== lang);
      }

      return [...prev, lang].sort((a, b) => LANGS.indexOf(a) - LANGS.indexOf(b));
    });
  };

  const onCellChange = (key: string, lang: Lang, value: string) => {
    setWorkingData((prev) => {
      const serviceData = prev[service];
      const nextLangMap = { ...(serviceData.languages[lang] ?? {}) };
      const nextKeys = new Set(serviceData.keys);

      nextLangMap[key] = value;
      nextKeys.add(key);

      return {
        ...prev,
        [service]: {
          ...serviceData,
          keys: Array.from(nextKeys).sort((a, b) => a.localeCompare(b)),
          languages: {
            ...serviceData.languages,
            [lang]: nextLangMap,
          },
        },
      };
    });
  };

  const onExportAllLangs = () => {
    const serviceData = workingData[service];
    for (const lang of LANGS) {
      const map = serviceData.languages[lang] ?? {};
      const flat: FlatTranslation = {};

      for (const key of serviceData.keys) {
        flat[key] = map[key] ?? '';
      }

      const text = buildTsContent(flat, serviceData.keys);
      const filename = `${FILE_PREFIX[service]}_${lang}.ts`;
      downloadTextFile(filename, text);
    }
  };

  const computeChanges = (): ChangeItem[] => {
    const initial = initialData[service];
    const working = workingData[service];
    const changes: ChangeItem[] = [];

    for (const key of working.keys) {
      for (const lang of LANGS) {
        const oldVal = initial.languages[lang]?.[key] ?? '';
        const newVal = working.languages[lang]?.[key] ?? '';
        if (oldVal !== newVal) {
          changes.push({ key, lang, oldVal, newVal });
        }
      }
    }

    return changes;
  };

  const onSave = () => {
    const changes = computeChanges();
    if (changes.length === 0) {
      setMessage('변경된 내용이 없습니다.');
      return;
    }
    setPendingChanges(changes);
    setConfirmPassword('');
    setConfirmPasswordError('');
    setConfirmOpen(true);
  };

  const onConfirmSave = async () => {
    if (confirmPassword !== SAVE_PASSWORD) {
      setConfirmPasswordError('비밀번호가 올바르지 않습니다.');
      return;
    }

    setConfirmOpen(false);
    setSaving(true);
    setMessage('저장 요청 중...');
    try {
      const serviceData = workingData[service];
      const languages: Partial<Record<Lang, FlatTranslation>> = {};

      for (const lang of LANGS) {
        const map = serviceData.languages[lang] ?? {};
        const flat: FlatTranslation = {};

        for (const key of serviceData.keys) {
          flat[key] = map[key] ?? '';
        }

        languages[lang] = flat;
      }

      const res = await fetch('/api/i18n/consistency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service,
          keys: serviceData.keys,
          languages,
        }),
      });

      const payload = (await res.json().catch(() => null)) as SaveApiResponse | null;
      if (!res.ok || !payload?.success) {
        const err = payload?.error ?? '저장에 실패했습니다.';
        throw new Error(err);
      }

      setMessage('저장 완료.');
    } catch (error) {
      setMessage(error instanceof Error ? `저장 실패: ${error.message}` : '저장 실패');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main
      className="h-screen flex flex-col overflow-hidden bg-[#0d1117] text-gray-100"
      data-poc-theme="dark"
    >
      {/* Header bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
        <span className="text-xs font-semibold text-[#c9d1d9]">FM-i18n 정합성 검증</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportAllLangs}
            className="border border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9] px-3 py-1.5 text-xs transition-colors"
          >
            수정본 다운로드 (.ts 5개)
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="border border-[#3fb950] text-[#3fb950] bg-[#3fb950]/10 px-3 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex-shrink-0 flex flex-wrap items-center gap-2 px-4 py-2.5 bg-[#0d1117] border-b border-[#30363d]">
        <label htmlFor="service" className="text-[11px] text-[#8b949e]">서비스</label>
        <select
          id="service"
          value={service}
          onChange={onServiceChange}
          className="bg-[#161b22] border border-[#30363d] text-[#c9d1d9] px-2 py-1 text-xs outline-none focus:border-[#58a6ff]"
        >
          {SERVICES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="key 또는 value 검색"
          className="min-w-[260px] bg-[#161b22] border border-[#30363d] text-[#c9d1d9] placeholder-[#6e7681] px-2 py-1 text-xs outline-none focus:border-[#58a6ff]"
        />

        <button
          type="button"
          onClick={() => setQuery('')}
          className="border border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9] px-3 py-1.5 text-xs transition-colors"
        >
          초기화
        </button>

        <label className="ml-1 inline-flex items-center gap-2 text-[11px] text-[#8b949e] cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyIssues}
            onChange={(event) => setShowOnlyIssues(event.target.checked)}
            className="h-4 w-4 accent-[#3fb950]"
          />
          문제 행만
        </label>

        <span className="ml-1 inline-flex items-center gap-2 text-[11px] text-[#8b949e]">
          언어:
          {LANGS.map((lang) => (
            <label key={lang} className="inline-flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={activeLangs.includes(lang)}
                onChange={() => onLanguageToggle(lang)}
                disabled={activeLangs.length === 1 && activeLangs.includes(lang)}
                className="h-4 w-4 accent-[#3fb950]"
              />
              <span className="text-[#c9d1d9]">{lang}</span>
            </label>
          ))}
        </span>
      </div>

      {/* Stats + messages */}
      <div className="flex-shrink-0 px-4 py-2 bg-[#0d1117] border-b border-[#30363d] space-y-1">
        <p className="text-[11px] text-[#8b949e]">
          {`총 키 ${totalKeys}개 | 표시 행 ${rows.length}개 | 이슈 행 ${issueCount}개 | ${summary}`}
        </p>
        {message ? <p className="text-[11px] text-[#58a6ff]">{message}</p> : null}
        {parseErrorLanguages.length > 0 ? (
          <p className="text-[11px] text-[#ff7700]">
            파싱 오류: {parseErrorLanguages.map(([lang]) => lang).join(', ')} (번역 파일을 확인해 주세요)
          </p>
        ) : null}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-[#161b22]">
            <tr>
              <th className="min-w-[250px] w-[32%] border-r border-b border-[#30363d] px-2 py-2 text-left text-[11px] font-semibold text-[#8b949e]">key</th>
              {visibleLangs.map((lang) => (
                <th
                  key={lang}
                  className="min-w-[160px] w-[13.6%] border-r border-b border-[#30363d] px-2 py-2 text-left text-[11px] font-semibold text-[#8b949e]"
                >
                  {lang}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  className="border-b border-[#30363d] px-2 py-2 text-[#8b949e]"
                  colSpan={visibleLangs.length + 1}
                >
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.key} className={row.hasIssue ? 'bg-[#f85149]/5' : ''}>
                  <td className="border-r border-b border-[#30363d] px-2 py-2 align-top">
                    {row.hasIssue ? (
                      <span className="inline-block text-[#f85149] bg-[#f85149]/15 border border-[#f85149] px-1 py-[1px] text-[10px] font-semibold mr-1">issue</span>
                    ) : (
                      <span className="inline-block text-[#8b949e] bg-[#11161d] border border-[#30363d] px-1 py-[1px] text-[10px] mr-1">ok</span>
                    )}
                    <span className="text-[#c9d1d9] break-all">{row.key}</span>
                  </td>
                  {row.cells.map((cell) => (
                    <td
                      key={`${row.key}-${cell.lang}`}
                      className={`border-r border-b border-[#30363d] break-all px-2 py-2 align-top ${
                        cell.type === 'missing'
                          ? 'bg-[#f85149]/10'
                          : cell.type === 'empty'
                            ? 'bg-[#ff7700]/10'
                            : ''
                      }`}
                    >
                      <input
                        value={cell.text}
                        onChange={(event) => onCellChange(row.key, cell.lang, event.target.value)}
                        placeholder={cell.hasKey ? '' : '(누락)'}
                        className="w-full bg-transparent border border-transparent text-[#c9d1d9] placeholder-[#6e7681] px-1 py-0.5 outline-none focus:border-[#30363d] focus:bg-[#161b22] rounded-[2px]"
                      />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm save modal */}
      {confirmOpen ? (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="max-w-[560px] w-full mx-4 bg-[#161b22] border border-[#30363d]">
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]">
              <span className="text-xs font-semibold text-[#c9d1d9]">
                변경 내용 확인 ({pendingChanges.length}개)
              </span>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="text-[#8b949e] hover:text-[#c9d1d9] text-xs transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Changes list */}
            <div className="max-h-[320px] overflow-y-auto">
              <table className="w-full border-collapse text-[11px]">
                <thead className="sticky top-0 bg-[#0d1117]">
                  <tr>
                    <th className="px-3 py-2 text-left text-[#8b949e] font-semibold border-b border-[#30363d] w-[40%]">key</th>
                    <th className="px-3 py-2 text-left text-[#8b949e] font-semibold border-b border-[#30363d] w-[8%]">lang</th>
                    <th className="px-3 py-2 text-left text-[#8b949e] font-semibold border-b border-[#30363d] w-[26%]">이전</th>
                    <th className="px-3 py-2 text-left text-[#8b949e] font-semibold border-b border-[#30363d] w-[26%]">이후</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingChanges.map((item) => (
                    <tr key={`${item.key}-${item.lang}`} className="border-b border-[#30363d]/50">
                      <td className="px-3 py-2 text-[#8b949e] break-all font-mono">{item.key}</td>
                      <td className="px-3 py-2">
                        <span className="text-[#8b949e] bg-[#11161d] border border-[#30363d] px-1 py-[1px] text-[10px]">{item.lang}</span>
                      </td>
                      <td className="px-3 py-2 text-[#f85149] break-all">{item.oldVal || <span className="text-[#6e7681]">(없음)</span>}</td>
                      <td className="px-3 py-2 text-[#3fb950] break-all">{item.newVal || <span className="text-[#6e7681]">(비움)</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Password + actions */}
            <div className="px-4 py-3 border-t border-[#30363d] space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-[#8b949e] shrink-0">비밀번호</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordError(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') onConfirmSave(); }}
                  placeholder="입력 후 Enter"
                  className="flex-1 bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] placeholder-[#6e7681] px-2 py-1 text-xs outline-none focus:border-[#58a6ff]"
                  autoFocus
                />
              </div>
              {confirmPasswordError ? (
                <p className="text-[11px] text-[#f85149]">{confirmPasswordError}</p>
              ) : null}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="border border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9] px-3 py-1.5 text-xs transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={onConfirmSave}
                  className="border border-[#3fb950] text-[#3fb950] bg-[#3fb950]/10 px-3 py-1.5 text-xs"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <DashFloatingNav current="/i18n" />
    </main>
  );
}
