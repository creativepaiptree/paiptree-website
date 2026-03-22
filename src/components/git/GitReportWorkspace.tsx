'use client';

import { startTransition, useEffect, useState } from 'react';
import type {
  GitArchitectureStep,
  GitCapabilityCheck,
  GitStorageTable,
  GitWeeklyReportSample,
} from '@/content/gitWeeklyReports';
import type { GitReportsPayload } from '@/lib/gitWeeklyReports';

type GitReportWorkspaceProps = {
  initialReports: GitWeeklyReportSample[];
  capabilityChecks: GitCapabilityCheck[];
  architectureSteps: GitArchitectureStep[];
  storageTables: GitStorageTable[];
};

const formatDate = (dateText: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(`${dateText}T00:00:00`));

const statusToneMap: Record<GitWeeklyReportSample['status'], string> = {
  done: 'bg-[rgba(45,212,191,0.12)] text-[#7ef0d5] border-[rgba(45,212,191,0.35)]',
  'design-only': 'bg-[rgba(0,171,230,0.12)] text-[#67d8ff] border-[rgba(0,171,230,0.35)]',
  blocked: 'bg-[rgba(255,122,122,0.12)] text-[#ff9d9d] border-[rgba(255,122,122,0.35)]',
};

const statusLabelMap: Record<GitWeeklyReportSample['status'], string> = {
  done: 'READY',
  'design-only': 'UI ONLY',
  blocked: 'BLOCKED',
};

const capabilityToneMap: Record<GitCapabilityCheck['status'], string> = {
  가능: '#3fb950',
  조건부: '#58a6ff',
  '분리 권장': '#ff7700',
};

const countBeforeAfterRows = (report: GitWeeklyReportSample | null) =>
  report?.detailBlocks.reduce((sum, block) => sum + block.beforeAfterRows.length, 0) ?? 0;

export default function GitReportWorkspace({
  initialReports,
  capabilityChecks,
  architectureSteps,
  storageTables,
}: GitReportWorkspaceProps) {
  const [reports, setReports] = useState(initialReports);
  const [selectedId, setSelectedId] = useState(initialReports[0]?.id ?? '');
  const [selectedDate, setSelectedDate] = useState(initialReports[0]?.monday ?? '');
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [reportsSource, setReportsSource] = useState<'supabase' | 'unavailable'>('unavailable');

  useEffect(() => {
    let cancelled = false;

    const loadReports = async () => {
      try {
        const response = await fetch('/api/git/reports', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`git reports API failed (${response.status})`);
        }

        const payload = (await response.json()) as GitReportsPayload;
        if (cancelled || !Array.isArray(payload.reports)) {
          return;
        }

        startTransition(() => {
          setReports(payload.reports);
          setReportsSource(payload.meta.source);

          const nextSelectedId = payload.reports[0]?.id ?? '';
          setSelectedId(nextSelectedId);
          setSelectedDate(
            payload.reports.find((report) => report.id === nextSelectedId)?.monday ?? payload.reports[0]?.monday ?? '',
          );
        });
      } catch (error) {
        console.error('[git-report-blocks] client fetch failed', error);
      } finally {
        if (!cancelled) {
          setIsLoadingReports(false);
        }
      }
    };

    void loadReports();

    return () => {
      cancelled = true;
    };
  }, []);

  const reportForView = reports.find((report) => report.id === selectedId) ?? null;
  const stagesForView = reportForView?.stages ?? [];
  const markdownForView = reportForView?.markdown ?? '';
  const beforeAfterCount = countBeforeAfterRows(reportForView);

  const handleSelectDate = (dateText: string) => {
    setSelectedDate(dateText);
    const matched = reports.find((report) => report.monday === dateText);
    startTransition(() => {
      setSelectedId(matched?.id ?? '');
    });
  };

  return (
    <div className="h-full flex flex-col 2xl:flex-row gap-4">
      <aside className="w-full 2xl:w-[320px] shrink-0 border border-[#30363d] bg-[#161b22] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#c9d1d9]">날짜별 리포트</span>
            <span className="text-[9px] font-mono border border-[#58a6ff] text-[#58a6ff] px-1">
              {reports.length}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#8b949e]">ARCHIVE</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {reports.map((report) => {
            const isActive = report.id === selectedId;
            return (
              <button
                key={report.id}
                type="button"
                onClick={() => {
                  startTransition(() => {
                    setSelectedId(report.id);
                    setSelectedDate(report.monday);
                  });
                }}
                className={`w-full text-left p-3 border-b border-[#30363d] transition-colors border-l-2 ${
                  isActive ? 'bg-[#21262d] border-l-[#58a6ff]' : 'border-l-transparent hover:bg-[#21262d]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono text-[#8b949e]">{report.monday}</p>
                    <p className="mt-1 text-xs font-semibold text-[#c9d1d9] break-words">{report.title}</p>
                  </div>
                  <span className={`type-label border px-1.5 py-[1px] shrink-0 ${statusToneMap[report.status]}`}>
                    {statusLabelMap[report.status]}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="border border-[#30363d] bg-[#0d1117] px-2 py-2">
                    <p className="text-[9px] font-mono uppercase tracking-widest text-[#6e7681]">Commits</p>
                    <p className="mt-1 text-sm font-semibold text-[#c9d1d9]">{report.commitCount}</p>
                  </div>
                  <div className="border border-[#30363d] bg-[#0d1117] px-2 py-2">
                    <p className="text-[9px] font-mono uppercase tracking-widest text-[#6e7681]">Blocks</p>
                    <p className="mt-1 text-sm font-semibold text-[#c9d1d9]">{report.detailBlocks.length}</p>
                  </div>
                </div>
              </button>
            );
          })}

          {!isLoadingReports && reports.length === 0 ? (
            <div className="p-4 text-xs leading-6 text-[#8b949e]">Supabase에는 아직 날짜별 리포트가 없다.</div>
          ) : null}
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-hidden">
        <section className="border border-[#30363d] bg-[#161b22]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#c9d1d9]">Date Control</span>
              <span className="text-[9px] font-mono border border-[#58a6ff] text-[#58a6ff] px-1">LIVE</span>
            </div>
            <span className="text-[10px] font-mono text-[#8b949e]">git_report_blocks_export_v1</span>
          </div>

          <div className="p-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="border border-[#30363d] bg-[#0d1117] px-3 py-3">
                <p className="text-[9px] uppercase tracking-widest font-mono text-[#8b949e]">Viewing Date</p>
                <p className="mt-1 text-sm font-semibold text-[#c9d1d9]">
                  {reportForView ? formatDate(reportForView.monday) : '선택 없음'}
                </p>
              </div>
              <div className="border border-[#30363d] bg-[#0d1117] px-3 py-3">
                <p className="text-[9px] uppercase tracking-widest font-mono text-[#8b949e]">Blocks</p>
                <p className="mt-1 text-sm font-semibold text-[#58a6ff]">{reportForView?.detailBlocks.length ?? 0}</p>
              </div>
              <div className="border border-[#30363d] bg-[#0d1117] px-3 py-3">
                <p className="text-[9px] uppercase tracking-widest font-mono text-[#8b949e]">Before/After</p>
                <p className="mt-1 text-sm font-semibold text-[#c9d1d9]">{beforeAfterCount}</p>
              </div>
              <div className="border border-[#30363d] bg-[#0d1117] px-3 py-3">
                <p className="text-[9px] uppercase tracking-widest font-mono text-[#8b949e]">Backend</p>
                <p
                  className={`mt-1 text-sm font-semibold ${
                    reportsSource === 'supabase' ? 'text-[#3fb950]' : 'text-[#f85149]'
                  }`}
                >
                  {reportsSource === 'supabase' ? 'SUPABASE LINKED' : 'DB UNAVAILABLE'}
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-[9px] uppercase tracking-widest font-mono text-[#8b949e]" htmlFor="git-date">
                Report Date
              </label>
              <input
                id="git-date"
                type="date"
                value={selectedDate}
                onChange={(event) => handleSelectDate(event.target.value)}
                className="h-9 px-3 bg-[#0d1117] border border-[#30363d] text-xs text-[#c9d1d9] outline-none focus:border-[#58a6ff] font-mono"
              />
              <p className="text-[11px] leading-5 text-[#8b949e]">
                {isLoadingReports
                  ? 'Supabase 리포트 목록을 확인 중...'
                  : reportForView
                    ? '선택 날짜의 상세 변경 블록을 바로 렌더링한다.'
                    : '선택한 날짜에 해당하는 리포트가 아직 없다.'}
              </p>
            </div>
          </div>
        </section>

        <section className="flex-1 min-h-0 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="border border-[#30363d] bg-[#161b22] flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#c9d1d9]">Daily Report View</span>
                {reportForView ? (
                  <span className={`type-label border px-1.5 py-[1px] ${statusToneMap[reportForView.status]}`}>
                    {statusLabelMap[reportForView.status]}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-mono text-[#8b949e]">
                {reportForView?.generatedAt ?? 'generated_at 미설정'}
              </span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
              <div className="border border-[#30363d] bg-[#0d1117] p-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#8b949e]">Overview</p>
                <h2 className="mt-2 text-lg font-semibold text-[#c9d1d9]">
                  {reportForView?.title ?? '리포트 없음'}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#8b949e]">
                  {reportForView?.overview ?? '좌측 목록이나 날짜 입력으로 리포트를 선택하면 상세 블록이 열린다.'}
                </p>
              </div>

              {reportForView ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="border border-[#30363d] bg-[#11161d] p-4">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#8b949e]">핵심 커밋 메시지</p>
                    <ul className="mt-3 space-y-3">
                      {reportForView.highlights.map((highlight) => (
                        <li key={highlight} className="text-sm leading-6 text-[#c9d1d9]">
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border border-[#30363d] bg-[#11161d] p-4">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#8b949e]">작업자 요약</p>
                    <ul className="mt-3 space-y-3">
                      {reportForView.authors.map((author) => (
                        <li key={`${author.authorName}-${author.authorEmail ?? 'none'}`} className="text-sm leading-6 text-[#c9d1d9]">
                          {author.authorName} / {author.commitCount} commits / {author.repoCount} repos
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}

              {reportForView?.focusRepos.length ? (
                <div className="border border-[#30363d] bg-[#11161d] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-[#8b949e]">Touched Services</p>
                      <p className="mt-1 text-xs text-[#6e7681]">선택 날짜에 포함된 서비스 경로</p>
                    </div>
                    <span className="text-[10px] font-mono text-[#8b949e]">{reportForView.focusRepos.length} services</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {reportForView.focusRepos.map((repo) => (
                      <span key={repo} className="border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-[11px] font-mono text-[#c9d1d9]">
                        {repo}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {reportForView?.detailBlocks.length ? (
                <div className="border border-[#30363d] bg-[#11161d] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-[#8b949e]">Detail Blocks</p>
                      <p className="mt-1 text-xs text-[#6e7681]">DB에 저장된 상세 변경 블록을 그대로 렌더링</p>
                    </div>
                    <span className="text-[10px] font-mono text-[#8b949e]">{reportForView.detailBlocks.length} blocks</span>
                  </div>

                  <div className="mt-4 space-y-4">
                    {reportForView.detailBlocks.map((block) => (
                      <article key={block.id} className="border border-[#30363d] bg-[#0d1117] p-4 space-y-4">
                        <div className="flex flex-col gap-2 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-[#c9d1d9]">{block.headingText}</p>
                            <p className="mt-2 text-xs leading-5 text-[#8b949e]">{block.serviceDescription}</p>
                          </div>
                          <span className="text-[10px] font-mono border border-[#58a6ff] px-1.5 py-[1px] text-[#58a6ff]">
                            {block.commitMessages.length || 1} msg
                          </span>
                        </div>

                        <div className="border border-[#30363d] bg-[#11161d] p-3">
                          <p className="text-[10px] font-mono uppercase tracking-widest text-[#8b949e]">Commit Message</p>
                          <p className="mt-2 text-sm leading-6 text-[#c9d1d9]">{block.commitMessageLabel}</p>
                        </div>

                        <div className="border border-[#30363d] bg-[#11161d] p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[10px] font-mono uppercase tracking-widest text-[#8b949e]">
                              {block.beforeAfterHeading}
                            </p>
                            <span className="text-[10px] font-mono text-[#8b949e]">{block.beforeAfterRows.length} files</span>
                          </div>

                          <div className="mt-3 overflow-x-auto">
                            <table className="min-w-full text-left text-xs text-[#c9d1d9]">
                              <thead className="text-[10px] uppercase tracking-widest text-[#8b949e]">
                                <tr>
                                  <th className="border-b border-[#30363d] px-2 py-2 font-normal">파일</th>
                                  <th className="border-b border-[#30363d] px-2 py-2 font-normal">변경 내용 요약</th>
                                </tr>
                              </thead>
                              <tbody>
                                {block.beforeAfterRows.map((row) => (
                                  <tr key={`${block.id}-${row.sortOrder}`}>
                                    <td className="border-b border-[#21262d] px-2 py-2 font-mono text-[#58a6ff]">
                                      {row.fileLabel}
                                    </td>
                                    <td className="border-b border-[#21262d] px-2 py-2 leading-6 text-[#c9d1d9]">
                                      {row.changeSummary}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="border border-[#30363d] bg-[#11161d] p-3">
                          <p className="text-[10px] font-mono uppercase tracking-widest text-[#8b949e]">{block.codeHeading}</p>
                          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-[#c9d1d9] font-mono">
                            {block.codeBlockMarkdown}
                          </pre>
                        </div>

                        <div className="border border-[#30363d] bg-[#11161d] p-3">
                          <p className="text-[10px] font-mono uppercase tracking-widest text-[#8b949e]">{block.contextHeading}</p>
                          <p className="mt-3 text-sm leading-6 text-[#c9d1d9]">{block.contextMarkdown}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="border border-[#30363d] bg-[#0d1117] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#8b949e]">Raw Markdown</p>
                    <p className="mt-1 text-xs text-[#6e7681]">선택 날짜 블록들을 다시 합친 원문</p>
                  </div>
                  <span className="text-[10px] font-mono text-[#8b949e]">
                    {markdownForView.length.toLocaleString()} chars
                  </span>
                </div>
                <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-[#c9d1d9] font-mono">
                  {markdownForView || '선택된 날짜에 표시할 원문이 없다.'}
                </pre>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-h-0">
            <div className="border border-[#30363d] bg-[#161b22] flex flex-col min-h-[240px] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]">
                <span className="text-xs font-semibold text-[#c9d1d9]">Progress Log</span>
                <span className="text-[10px] font-mono text-[#8b949e]">{stagesForView.length} steps</span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {stagesForView.map((stage, index) => (
                  <div
                    key={`${stage.step}-${stage.message}-${index}`}
                    className="border border-[#30363d] bg-[#0d1117] p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 shrink-0 border border-[#30363d] bg-[#11161d] flex items-center justify-center text-[11px] font-mono text-[#58a6ff]">
                        {stage.step}
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-mono text-[#8b949e]">STEP {stage.step}</p>
                        <p className="mt-1 text-xs leading-5 text-[#c9d1d9]">{stage.message}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {stagesForView.length === 0 ? (
                  <div className="border border-[#30363d] bg-[#0d1117] p-3 text-xs text-[#8b949e]">
                    선택된 날짜의 진행 로그가 없다.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="border border-[#30363d] bg-[#161b22] flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]">
                <span className="text-xs font-semibold text-[#c9d1d9]">System Inspector</span>
                <span className="text-[10px] font-mono text-[#8b949e]">PoC layout</span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                <div className="space-y-3">
                  {capabilityChecks.map((item) => (
                    <div key={item.title} className="border border-[#30363d] bg-[#0d1117] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-[#c9d1d9]">{item.title}</p>
                        <span
                          className="text-[9px] font-mono border px-1 py-[1px]"
                          style={{
                            color: capabilityToneMap[item.status],
                            borderColor: capabilityToneMap[item.status],
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-[#8b949e]">{item.description}</p>
                    </div>
                  ))}
                </div>

                <div className="border border-[#30363d] bg-[#11161d] p-3">
                  <p className="text-[10px] uppercase tracking-widest font-mono text-[#8b949e]">권장 구현 순서</p>
                  <div className="mt-3 space-y-3">
                    {architectureSteps.map((step) => (
                      <div key={step.title} className="border border-[#30363d] bg-[#0d1117] p-3">
                        <p className="text-[10px] font-mono text-[#58a6ff]">{step.title}</p>
                        <p className="mt-1 text-xs font-semibold text-[#c9d1d9]">{step.summary}</p>
                        <p className="mt-2 text-xs leading-5 text-[#8b949e]">{step.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-[#30363d] bg-[#11161d] p-3">
                  <p className="text-[10px] uppercase tracking-widest font-mono text-[#8b949e]">Supabase Storage</p>
                  <div className="mt-3 space-y-3">
                    {storageTables.map((table) => (
                      <div key={table.name} className="border border-[#30363d] bg-[#0d1117] p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[10px] font-mono text-[#58a6ff]">{table.name}</p>
                          <span className="text-[9px] font-mono border border-[#30363d] px-1 py-[1px] text-[#8b949e]">
                            {table.fields.length} fields
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-[#c9d1d9]">{table.summary}</p>
                        <ul className="mt-3 space-y-2">
                          {table.fields.map((field) => (
                            <li key={field} className="text-[11px] leading-5 text-[#8b949e]">
                              {field}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
