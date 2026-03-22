#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseWeeklyReport } from './git-weekly-report-to-json.mjs';

const usage = () => {
  console.error('사용법: node scripts/git-weekly-report-to-supabase-sql.mjs /absolute/path/to/weekly-report.md');
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

const toEntriesInsertSql = (entries) => {
  if (entries.length === 0) {
    return '-- 상세 entry 없음';
  }

  const valuesSql = entries
    .map(
      (entry) => `(
  (select id from upserted_report),
  ${toSqlInteger(entry.sort_order)},
  ${toSqlText(entry.repo_path, 'repo')},
  ${toSqlText(entry.authored_label, 'authored')},
  ${toSqlText(entry.author_name, 'author')},
  ${toSqlText(entry.author_email, 'email')},
  ${toSqlText(entry.commit_message, 'commit')},
  ${toSqlJsonb(entry.commit_messages, 'commit_json')},
  ${toSqlText(entry.service_description, 'service')},
  ${toSqlJsonb(entry.before_after_rows, 'before_after')},
  ${toSqlText(entry.code_highlight_markdown, 'code')},
  ${toSqlText(entry.context_markdown, 'context')},
  ${toSqlJsonb(entry.meta, 'entry_meta')}
)`,
    )
    .join(',\n');

  return `insert into public.git_weekly_report_entries (
  report_id,
  sort_order,
  repo_path,
  authored_label,
  author_name,
  author_email,
  commit_message,
  commit_messages,
  service_description,
  before_after_rows,
  code_highlight_markdown,
  context_markdown,
  meta
)
values
${valuesSql};`;
};

const buildSql = (parsed) => {
  const importMeta = {
    ...parsed.meta,
    import_mode: 'manual_markdown',
    imported_from: parsed.source_report_path,
  };

  return `begin;

with upserted_report as (
  insert into public.git_weekly_reports (
    workspace_key,
    source_kind,
    week_monday,
    week_friday,
    report_title,
    status,
    total_commits,
    total_repos,
    author_summaries,
    overall_summary_markdown,
    overall_sections,
    raw_markdown,
    source_report_path,
    prompt_path,
    snapshot_path,
    diff_dir,
    generator,
    model_name,
    generated_at,
    meta
  )
  values (
    ${toSqlText(parsed.workspace_key, 'workspace')},
    ${toSqlText(parsed.source_kind, 'source')},
    ${toSqlDate(parsed.week_monday)},
    ${toSqlDate(parsed.week_friday)},
    ${toSqlText(parsed.report_title, 'title')},
    ${toSqlText(parsed.status, 'status')},
    ${toSqlInteger(parsed.total_commits)},
    ${toSqlInteger(parsed.total_repos)},
    ${toSqlJsonb(parsed.author_summaries, 'authors')},
    ${toSqlText(parsed.overall_summary_markdown, 'overall')},
    ${toSqlJsonb(parsed.overall_sections, 'overall_sections')},
    ${toSqlText(parsed.raw_markdown, 'raw_markdown')},
    ${toSqlText(parsed.source_report_path, 'source_path')},
    ${toSqlText(parsed.prompt_path, 'prompt_path')},
    ${toSqlText(parsed.snapshot_path, 'snapshot_path')},
    ${toSqlText(parsed.diff_dir, 'diff_dir')},
    ${toSqlText('manual-md-import', 'generator')},
    null,
    null,
    ${toSqlJsonb(importMeta, 'report_meta')}
  )
  on conflict (workspace_key, week_monday) do update
  set
    source_kind = excluded.source_kind,
    week_friday = excluded.week_friday,
    report_title = excluded.report_title,
    status = excluded.status,
    total_commits = excluded.total_commits,
    total_repos = excluded.total_repos,
    author_summaries = excluded.author_summaries,
    overall_summary_markdown = excluded.overall_summary_markdown,
    overall_sections = excluded.overall_sections,
    raw_markdown = excluded.raw_markdown,
    source_report_path = excluded.source_report_path,
    prompt_path = excluded.prompt_path,
    snapshot_path = excluded.snapshot_path,
    diff_dir = excluded.diff_dir,
    generator = excluded.generator,
    model_name = excluded.model_name,
    generated_at = excluded.generated_at,
    meta = excluded.meta
  returning id
)
delete from public.git_weekly_report_entries
where report_id = (select id from upserted_report);

${toEntriesInsertSql(parsed.entries)}

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
  const parsed = parseWeeklyReport(markdown, absolutePath);
  process.stdout.write(buildSql(parsed));
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
