#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const usage = () => {
  console.error('사용법: node scripts/git-weekly-report-to-json.mjs /absolute/path/to/weekly-report.md');
};

const normalizeNewlines = (value) => value.replace(/\r\n/g, '\n').trim();

const parseDateRange = (markdown) => {
  const match = markdown.match(
    /^#\s+주간 코드 변경 리포트\s+(\d{4}-\d{2}-\d{2})\s+\([^)]+\)\s+~\s+(\d{4}-\d{2}-\d{2})\s+\([^)]+\)/m,
  );

  if (!match) {
    throw new Error('리포트 제목에서 주간 날짜를 찾지 못했습니다.');
  }

  return {
    monday: match[1],
    friday: match[2],
    title: match[0].replace(/^#\s+/, '').trim(),
  };
};

const getSection = (markdown, startHeading, endHeading) => {
  const startIndex = markdown.indexOf(startHeading);
  if (startIndex === -1) {
    return '';
  }

  const contentStart = startIndex + startHeading.length;
  const endIndex = endHeading ? markdown.indexOf(endHeading, contentStart) : -1;
  return markdown.slice(contentStart, endIndex === -1 ? undefined : endIndex).trim();
};

const parseMarkdownTable = (tableMarkdown) => {
  const lines = tableMarkdown
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|'));

  if (lines.length < 3) {
    return [];
  }

  const dataLines = lines.slice(2);
  return dataLines.map((line) =>
    line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim()),
  );
};

const parseAuthorCell = (cell) => {
  const match = cell.match(/^(.+?)\s+\(([^)]+)\)$/);
  if (!match) {
    return {
      author_name: cell.trim(),
      author_email: null,
      author_display: cell.trim(),
    };
  }

  return {
    author_name: match[1].trim(),
    author_email: match[2].trim(),
    author_display: cell.trim(),
  };
};

const parseSummaryRows = (sectionMarkdown) => {
  const rows = parseMarkdownTable(sectionMarkdown);
  return rows.map((row) => {
    const authorInfo = parseAuthorCell(row[0] || '');
    return {
      ...authorInfo,
      commit_count: Number.parseInt((row[1] || '0').replace(/[^\d]/g, ''), 10) || 0,
      repo_count: Number.parseInt((row[2] || '0').replace(/[^\d]/g, ''), 10) || 0,
      key_work: row[3] || '',
    };
  });
};

const parseTotals = (sectionMarkdown) => {
  const match = sectionMarkdown.match(/\*\*총 커밋:\s*(\d+)개\s*\|\s*총 변경 레포:\s*(\d+)개\*\*/);
  return {
    total_commits: match ? Number.parseInt(match[1], 10) : 0,
    total_repos: match ? Number.parseInt(match[2], 10) : 0,
  };
};

const parseCommitMessages = (rawValue) => {
  const matches = Array.from(rawValue.matchAll(/`([^`]+)`/g)).map((match) => match[1].trim());
  if (matches.length > 0) {
    return matches;
  }

  return rawValue
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);
};

const parseBeforeAfterRows = (rawTable) => {
  return parseMarkdownTable(rawTable).map((row) => ({
    file: row[0] || '',
    summary: row[1] || '',
  }));
};

const parseOverallSections = (overallMarkdown) => {
  const sections = [];
  const normalized = overallMarkdown.trim();
  const matches = Array.from(normalized.matchAll(/^###\s+(.+)$/gm));

  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index];
    const next = matches[index + 1];
    const title = current[1].trim();
    const bodyStart = current.index + current[0].length;
    const bodyEnd = next ? next.index : normalized.length;
    const bodyMarkdown = normalized.slice(bodyStart, bodyEnd).trim();

    sections.push({
      title,
      body_markdown: bodyMarkdown,
    });
  }

  return sections;
};

const buildAuthorLookup = (summaryRows) => {
  const lookup = new Map();
  summaryRows.forEach((row) => {
    lookup.set(row.author_name, row);
  });
  return lookup;
};

const parseDetailEntries = (detailsMarkdown, authorLookup) => {
  const entries = [];
  const pattern =
    /^###\s+\[([^\]]+)\]\s+\|\s+(.+?)\s+\|\s+([^\n]+)\n\n\*\*커밋 메시지:\*\*\s+([^\n]+)\n\*\*서비스 설명:\*\*\s+([^\n]+)\n\n#### Before \/ After\n\n([\s\S]*?)\n#### 코드 변경 핵심\n\n```(?:\w+)?\n([\s\S]*?)\n```\n\n#### 맥락 해설\n([\s\S]*?)(?=^---\n\n^###\s+|^##\s+이번 주 전체 맥락 요약|\s*$)/gm;

  let match = pattern.exec(detailsMarkdown);
  while (match) {
    const repoPath = match[1].trim();
    const authoredLabel = match[2].trim();
    const authorName = match[3].trim();
    const rawCommitMessage = match[4].trim();
    const serviceDescription = match[5].trim();
    const beforeAfterMarkdown = match[6].trim();
    const codeHighlightMarkdown = match[7].trim();
    const contextMarkdown = match[8].trim();
    const authorSummary = authorLookup.get(authorName);

    entries.push({
      sort_order: entries.length + 1,
      repo_path: repoPath,
      authored_label: authoredLabel,
      author_name: authorName,
      author_email: authorSummary?.author_email ?? null,
      commit_message: parseCommitMessages(rawCommitMessage).join(' / '),
      commit_messages: parseCommitMessages(rawCommitMessage),
      service_description: serviceDescription,
      before_after_rows: parseBeforeAfterRows(beforeAfterMarkdown),
      code_highlight_markdown: codeHighlightMarkdown,
      context_markdown: contextMarkdown,
      meta: {
        source_commit_message_line: rawCommitMessage,
      },
    });

    match = pattern.exec(detailsMarkdown);
  }

  return entries;
};

export const parseWeeklyReport = (markdown, filePath) => {
  const normalized = normalizeNewlines(markdown);
  const { monday, friday, title } = parseDateRange(normalized);
  const summaryMarkdown = getSection(normalized, '## 변경 요약', '## 상세 변경 내역');
  const detailsMarkdown = getSection(normalized, '## 상세 변경 내역', '## 이번 주 전체 맥락 요약');
  const overallMarkdown = getSection(normalized, '## 이번 주 전체 맥락 요약', null);
  const authorSummaries = parseSummaryRows(summaryMarkdown);
  const authorLookup = buildAuthorLookup(authorSummaries);
  const entries = parseDetailEntries(detailsMarkdown, authorLookup);
  const totals = parseTotals(summaryMarkdown);

  return {
    workspace_key: 'platform',
    source_kind: 'gitlab',
    week_monday: monday,
    week_friday: friday,
    report_title: title,
    status: 'completed',
    total_commits: totals.total_commits,
    total_repos: totals.total_repos,
    author_summaries: authorSummaries,
    overall_summary_markdown: overallMarkdown,
    overall_sections: parseOverallSections(overallMarkdown),
    raw_markdown: normalized,
    source_report_path: filePath,
    prompt_path: '/Users/zoro/projects/gitlab-sync/WEEKLY_PROMPT.md',
    snapshot_path: '/Users/zoro/projects/gitlab-sync/snapshots/2026-03-06-full/platform',
    diff_dir: `/tmp/gitlab_weekly_${monday}`,
    generated_at: null,
    meta: {
      parser_version: 1,
      parsed_at: new Date().toISOString(),
      entry_count: entries.length,
    },
    entries,
  };
};

const main = async () => {
  const reportPath = process.argv[2];
  if (!reportPath) {
    usage();
    process.exit(1);
  }

  const absolutePath = path.resolve(reportPath);
  const markdown = await readFile(absolutePath, 'utf8');
  const parsed = parseWeeklyReport(markdown, absolutePath);
  process.stdout.write(`${JSON.stringify(parsed, null, 2)}\n`);
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
