#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const usage = () => {
  console.error('사용법: node scripts/git-report-db-markdown-to-json.mjs /absolute/path/to/weekly-report_db.md');
};

const normalizeNewlines = (value) => value.replace(/\r\n/g, '\n').trim();

const parseMarkdownTable = (tableMarkdown) => {
  const lines = tableMarkdown
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|'));

  if (lines.length < 3) {
    return [];
  }

  return lines.slice(2).map((line) =>
    line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim()),
  );
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

const parseBeforeAfterRows = (rawTable) =>
  parseMarkdownTable(rawTable).map((row) => ({
    file_label: row[0] || '',
    change_summary: row[1] || '',
  }));

const parseHeading = (repoPath, authoredLabel, authorName) => {
  const normalizedAuthoredLabel = authoredLabel.trim();
  const dateMatch = normalizedAuthoredLabel.match(/^(\d{4}-\d{2}-\d{2})(?:\s+(.+))?$/);
  if (!dateMatch) {
    throw new Error(`헤더 날짜를 파싱하지 못했습니다: ${normalizedAuthoredLabel}`);
  }

  return {
    heading_text: `[${repoPath}] | ${normalizedAuthoredLabel} | ${authorName}`,
    report_date: dateMatch[1],
    authored_time_label: (dateMatch[2] || '').trim(),
  };
};

const parseServiceName = (serviceLabel) => {
  const parts = serviceLabel.split('/').filter(Boolean);
  return parts.at(-1) || serviceLabel;
};

export const parseGitReportDbMarkdown = (markdown, filePath) => {
  const normalized = normalizeNewlines(markdown);
  const blocks = [];
  const pattern =
    /^###\s+\[([^\]]+)\]\s+\|\s+(.+?)\s+\|\s+([^\n]+)\n\n\*\*커밋 메시지:\*\*\s+([^\n]+)\n\*\*서비스 설명:\*\*\s+([^\n]+)\n\n#### Before \/ After\n\n([\s\S]*?)\n#### 코드 변경 핵심\n\n```([^\n]*)\n([\s\S]*?)\n```\n\n#### 맥락 해설\n([\s\S]*?)(?=\n---\n\n###\s+\[|$)/gm;

  let match = pattern.exec(normalized);
  while (match) {
    const serviceLabel = match[1].trim();
    const authoredLabel = match[2].trim();
    const authorName = match[3].trim();
    const rawCommitMessage = match[4].trim();
    const serviceDescription = match[5].trim();
    const beforeAfterMarkdown = match[6].trim();
    const codeBlockLanguage = (match[7] || 'diff').trim() || 'diff';
    const codeBlockMarkdown = match[8].trim();
    const contextMarkdown = match[9].trim();
    const heading = parseHeading(serviceLabel, authoredLabel, authorName);
    const commitMessages = parseCommitMessages(rawCommitMessage);

    blocks.push({
      sort_order: blocks.length + 1,
      report_date: heading.report_date,
      heading_text: heading.heading_text,
      service_label: serviceLabel,
      service_name: parseServiceName(serviceLabel),
      authored_time_label: heading.authored_time_label,
      author_name: authorName,
      author_email: null,
      commit_message_label: commitMessages.join(' / '),
      commit_messages: commitMessages,
      service_description: serviceDescription,
      before_after_heading: 'Before / After',
      before_after_rows: parseBeforeAfterRows(beforeAfterMarkdown),
      code_heading: '코드 변경 핵심',
      code_block_language: codeBlockLanguage,
      code_block_markdown: codeBlockMarkdown,
      context_heading: '맥락 해설',
      context_markdown: contextMarkdown,
      raw_block_markdown: match[0].trim(),
      source_markdown_path: filePath,
      meta: {
        parser_version: 1,
        source_commit_message_line: rawCommitMessage,
      },
    });

    match = pattern.exec(normalized);
  }

  if (blocks.length === 0) {
    throw new Error('상세 변경 블록을 찾지 못했습니다. _db.md 포맷을 확인하세요.');
  }

  return {
    source_markdown_path: filePath,
    block_count: blocks.length,
    parsed_at: new Date().toISOString(),
    blocks,
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
  const parsed = parseGitReportDbMarkdown(markdown, absolutePath);
  process.stdout.write(`${JSON.stringify(parsed, null, 2)}\n`);
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
