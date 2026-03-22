#!/usr/bin/env node

import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseGitReportDbMarkdown } from './git-report-db-markdown-to-json.mjs';

const usage = () => {
  console.error('사용법: node scripts/git-report-db-markdown-to-supabase-sql.mjs /absolute/path/to/weekly-report_db.md');
};

const toJson = (value) => JSON.stringify(value ?? null);

const toSqlDollarString = (value, tagBase = 'txt') => {
  const source = value ?? '';
  let tag = tagBase;
  let suffix = 0;

  while (source.includes(`$${tag}$`)) {
    suffix += 1;
    tag = `${tagBase}${suffix}`;
  }

  return `$${tag}$${source}$${tag}$`;
};

const toSqlText = (value, tagBase = 'txt') => {
  if (value === null || value === undefined) {
    return 'null';
  }

  return toSqlDollarString(String(value), tagBase);
};

const toSqlDate = (value) => {
  if (!value) {
    return 'null';
  }

  return `${toSqlText(value, 'date')}::date`;
};

const toSqlJsonb = (value, tagBase = 'json') => `${toSqlDollarString(toJson(value), tagBase)}::jsonb`;

const toSqlInteger = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '0';
  }

  return String(Number(value));
};

const buildBlockRows = (blocks) =>
  blocks.map((block) => ({
    ...block,
    id: randomUUID(),
  }));

const buildBlocksInsertSql = (blocks) => {
  const valuesSql = blocks
    .map(
      (block) => `(
  ${toSqlText(block.id, 'uuid')}::uuid,
  ${toSqlDate(block.report_date)},
  ${toSqlInteger(block.sort_order)},
  ${toSqlText(block.heading_text, 'heading')},
  ${toSqlText(block.service_label, 'service_label')},
  ${toSqlText(block.service_name, 'service_name')},
  ${toSqlText(block.authored_time_label, 'authored_time')},
  ${toSqlText(block.author_name, 'author_name')},
  ${toSqlText(block.author_email, 'author_email')},
  ${toSqlText(block.commit_message_label, 'commit_label')},
  ${toSqlJsonb(block.commit_messages, 'commit_messages')},
  ${toSqlText(block.service_description, 'service_description')},
  ${toSqlText(block.before_after_heading, 'before_after_heading')},
  ${toSqlText(block.code_heading, 'code_heading')},
  ${toSqlText(block.code_block_language, 'code_lang')},
  ${toSqlText(block.code_block_markdown, 'code_block')},
  ${toSqlText(block.context_heading, 'context_heading')},
  ${toSqlText(block.context_markdown, 'context_block')},
  ${toSqlText(block.raw_block_markdown, 'raw_block')},
  ${toSqlText(block.source_markdown_path, 'source_path')},
  ${toSqlJsonb(block.meta, 'block_meta')}
)`,
    )
    .join(',\n');

  return `insert into public.git_report_blocks (
  id,
  report_date,
  sort_order,
  heading_text,
  service_label,
  service_name,
  authored_time_label,
  author_name,
  author_email,
  commit_message_label,
  commit_messages,
  service_description,
  before_after_heading,
  code_heading,
  code_block_language,
  code_block_markdown,
  context_heading,
  context_markdown,
  raw_block_markdown,
  source_markdown_path,
  meta
)
values
${valuesSql};`;
};

const buildFilesInsertSql = (blocks) => {
  const rows = blocks.flatMap((block) =>
    block.before_after_rows.map((row, index) => ({
      id: randomUUID(),
      block_id: block.id,
      sort_order: index + 1,
      file_label: row.file_label,
      change_summary: row.change_summary,
    })),
  );

  if (rows.length === 0) {
    return '-- Before / After 파일 행 없음';
  }

  const valuesSql = rows
    .map(
      (row) => `(
  ${toSqlText(row.id, 'file_uuid')}::uuid,
  ${toSqlText(row.block_id, 'block_uuid')}::uuid,
  ${toSqlInteger(row.sort_order)},
  ${toSqlText(row.file_label, 'file_label')},
  ${toSqlText(row.change_summary, 'change_summary')}
)`,
    )
    .join(',\n');

  return `insert into public.git_report_block_files (
  id,
  block_id,
  sort_order,
  file_label,
  change_summary
)
values
${valuesSql};`;
};

const buildSql = (parsed) => {
  const blockRows = buildBlockRows(parsed.blocks);

  return `begin;

delete from public.git_report_blocks
where source_markdown_path = ${toSqlText(parsed.source_markdown_path, 'source_path_delete')};

${buildBlocksInsertSql(blockRows)}

${buildFilesInsertSql(blockRows)}

commit;
`;
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
  process.stdout.write(buildSql(parsed));
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
