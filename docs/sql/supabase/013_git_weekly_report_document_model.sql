begin;

create extension if not exists pgcrypto;

create table if not exists public.git_weekly_reports (
  id uuid primary key default gen_random_uuid(),
  workspace_key text not null check (workspace_key ~ '^[a-z0-9][a-z0-9_-]{1,63}$'),
  source_kind text not null default 'gitlab'
    check (source_kind in ('gitlab')),
  week_monday date not null,
  week_friday date not null,
  report_title text not null,
  summary_heading text not null default '변경 요약',
  detail_heading text not null default '상세 변경 내역',
  overall_heading text not null default '이번 주 전체 맥락 요약',
  status text not null default 'completed'
    check (status in ('draft', 'completed', 'failed', 'archived')),
  total_commits integer not null default 0 check (total_commits >= 0),
  total_repos integer not null default 0 check (total_repos >= 0),
  raw_markdown text not null,
  source_report_path text,
  prompt_path text,
  snapshot_path text,
  diff_dir text,
  generator text not null default 'manual-md-import',
  model_name text,
  generated_at timestamptz,
  meta jsonb not null default '{}'::jsonb
    check (jsonb_typeof(meta) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_key, week_monday)
);

create index if not exists idx_git_weekly_reports_workspace_week
  on public.git_weekly_reports (workspace_key, week_monday desc);

create table if not exists public.git_weekly_report_summary_rows (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.git_weekly_reports(id) on delete cascade,
  sort_order integer not null check (sort_order > 0),
  author_display text not null,
  author_name text not null,
  author_email text,
  commit_count integer not null default 0 check (commit_count >= 0),
  repo_count integer not null default 0 check (repo_count >= 0),
  key_work text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (report_id, sort_order)
);

create index if not exists idx_git_weekly_report_summary_rows_report_order
  on public.git_weekly_report_summary_rows (report_id, sort_order asc);

create table if not exists public.git_weekly_report_detail_sections (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.git_weekly_reports(id) on delete cascade,
  sort_order integer not null check (sort_order > 0),
  heading_text text not null,
  repo_path text not null,
  authored_label text not null,
  author_display text not null,
  author_name text not null,
  author_email text,
  commit_message_line text not null,
  commit_messages jsonb not null default '[]'::jsonb
    check (jsonb_typeof(commit_messages) = 'array'),
  service_description text not null default '',
  before_after_heading text not null default 'Before / After',
  code_heading text not null default '코드 변경 핵심',
  context_heading text not null default '맥락 해설',
  code_block_language text not null default 'diff',
  code_highlight_markdown text not null default '',
  context_markdown text not null default '',
  section_markdown text,
  meta jsonb not null default '{}'::jsonb
    check (jsonb_typeof(meta) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (report_id, sort_order)
);

create index if not exists idx_git_weekly_report_detail_sections_report_order
  on public.git_weekly_report_detail_sections (report_id, sort_order asc);

create index if not exists idx_git_weekly_report_detail_sections_repo
  on public.git_weekly_report_detail_sections (repo_path);

create table if not exists public.git_weekly_report_detail_file_rows (
  id uuid primary key default gen_random_uuid(),
  detail_section_id uuid not null references public.git_weekly_report_detail_sections(id) on delete cascade,
  sort_order integer not null check (sort_order > 0),
  file_label text not null,
  change_summary text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (detail_section_id, sort_order)
);

create index if not exists idx_git_weekly_report_detail_file_rows_section_order
  on public.git_weekly_report_detail_file_rows (detail_section_id, sort_order asc);

create table if not exists public.git_weekly_report_overall_sections (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.git_weekly_reports(id) on delete cascade,
  sort_order integer not null check (sort_order > 0),
  heading_text text not null,
  title text not null,
  body_markdown text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (report_id, sort_order)
);

create index if not exists idx_git_weekly_report_overall_sections_report_order
  on public.git_weekly_report_overall_sections (report_id, sort_order asc);

create or replace function public.set_git_weekly_document_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_git_weekly_reports_updated_at on public.git_weekly_reports;
create trigger trg_git_weekly_reports_updated_at
before update on public.git_weekly_reports
for each row
execute function public.set_git_weekly_document_updated_at();

drop trigger if exists trg_git_weekly_report_summary_rows_updated_at on public.git_weekly_report_summary_rows;
create trigger trg_git_weekly_report_summary_rows_updated_at
before update on public.git_weekly_report_summary_rows
for each row
execute function public.set_git_weekly_document_updated_at();

drop trigger if exists trg_git_weekly_report_detail_sections_updated_at on public.git_weekly_report_detail_sections;
create trigger trg_git_weekly_report_detail_sections_updated_at
before update on public.git_weekly_report_detail_sections
for each row
execute function public.set_git_weekly_document_updated_at();

drop trigger if exists trg_git_weekly_report_detail_file_rows_updated_at on public.git_weekly_report_detail_file_rows;
create trigger trg_git_weekly_report_detail_file_rows_updated_at
before update on public.git_weekly_report_detail_file_rows
for each row
execute function public.set_git_weekly_document_updated_at();

drop trigger if exists trg_git_weekly_report_overall_sections_updated_at on public.git_weekly_report_overall_sections;
create trigger trg_git_weekly_report_overall_sections_updated_at
before update on public.git_weekly_report_overall_sections
for each row
execute function public.set_git_weekly_document_updated_at();

create or replace view public.git_weekly_report_export_v1 as
select
  report.id,
  report.workspace_key,
  report.source_kind,
  report.week_monday,
  report.week_friday,
  report.report_title,
  report.summary_heading,
  report.detail_heading,
  report.overall_heading,
  report.status,
  report.total_commits,
  report.total_repos,
  report.raw_markdown,
  report.source_report_path,
  report.prompt_path,
  report.snapshot_path,
  report.diff_dir,
  report.generator,
  report.model_name,
  report.generated_at,
  report.meta,
  report.created_at,
  report.updated_at,
  coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'sort_order', summary.sort_order,
        'author_display', summary.author_display,
        'author_name', summary.author_name,
        'author_email', summary.author_email,
        'commit_count', summary.commit_count,
        'repo_count', summary.repo_count,
        'key_work', summary.key_work
      )
      order by summary.sort_order
    )
    from public.git_weekly_report_summary_rows summary
    where summary.report_id = report.id
  ), '[]'::jsonb) as summary_rows,
  coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'sort_order', detail.sort_order,
        'heading_text', detail.heading_text,
        'repo_path', detail.repo_path,
        'authored_label', detail.authored_label,
        'author_display', detail.author_display,
        'author_name', detail.author_name,
        'author_email', detail.author_email,
        'commit_message_line', detail.commit_message_line,
        'commit_messages', detail.commit_messages,
        'service_description', detail.service_description,
        'before_after_heading', detail.before_after_heading,
        'code_heading', detail.code_heading,
        'context_heading', detail.context_heading,
        'code_block_language', detail.code_block_language,
        'code_highlight_markdown', detail.code_highlight_markdown,
        'context_markdown', detail.context_markdown,
        'section_markdown', detail.section_markdown,
        'before_after_rows', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'sort_order', file_row.sort_order,
              'file_label', file_row.file_label,
              'change_summary', file_row.change_summary
            )
            order by file_row.sort_order
          )
          from public.git_weekly_report_detail_file_rows file_row
          where file_row.detail_section_id = detail.id
        ), '[]'::jsonb)
      )
      order by detail.sort_order
    )
    from public.git_weekly_report_detail_sections detail
    where detail.report_id = report.id
  ), '[]'::jsonb) as detail_sections,
  coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'sort_order', overall.sort_order,
        'heading_text', overall.heading_text,
        'title', overall.title,
        'body_markdown', overall.body_markdown
      )
      order by overall.sort_order
    )
    from public.git_weekly_report_overall_sections overall
    where overall.report_id = report.id
  ), '[]'::jsonb) as overall_sections
from public.git_weekly_reports report;

alter table public.git_weekly_reports enable row level security;
alter table public.git_weekly_report_summary_rows enable row level security;
alter table public.git_weekly_report_detail_sections enable row level security;
alter table public.git_weekly_report_detail_file_rows enable row level security;
alter table public.git_weekly_report_overall_sections enable row level security;

drop policy if exists git_weekly_reports_service_role_rw on public.git_weekly_reports;
create policy git_weekly_reports_service_role_rw
on public.git_weekly_reports
for all
to service_role
using (true)
with check (true);

drop policy if exists git_weekly_report_summary_rows_service_role_rw on public.git_weekly_report_summary_rows;
create policy git_weekly_report_summary_rows_service_role_rw
on public.git_weekly_report_summary_rows
for all
to service_role
using (true)
with check (true);

drop policy if exists git_weekly_report_detail_sections_service_role_rw on public.git_weekly_report_detail_sections;
create policy git_weekly_report_detail_sections_service_role_rw
on public.git_weekly_report_detail_sections
for all
to service_role
using (true)
with check (true);

drop policy if exists git_weekly_report_detail_file_rows_service_role_rw on public.git_weekly_report_detail_file_rows;
create policy git_weekly_report_detail_file_rows_service_role_rw
on public.git_weekly_report_detail_file_rows
for all
to service_role
using (true)
with check (true);

drop policy if exists git_weekly_report_overall_sections_service_role_rw on public.git_weekly_report_overall_sections;
create policy git_weekly_report_overall_sections_service_role_rw
on public.git_weekly_report_overall_sections
for all
to service_role
using (true)
with check (true);

comment on table public.git_weekly_reports is '주간 리포트 문서 헤더와 원문 markdown';
comment on column public.git_weekly_reports.report_title is 'H1 제목 원문';
comment on column public.git_weekly_reports.summary_heading is '보통 \"변경 요약\"';
comment on column public.git_weekly_reports.detail_heading is '보통 \"상세 변경 내역\"';
comment on column public.git_weekly_reports.overall_heading is '보통 \"이번 주 전체 맥락 요약\"';

comment on table public.git_weekly_report_summary_rows is '변경 요약 표의 작업자 행';
comment on column public.git_weekly_report_summary_rows.author_display is '예: 윤성진 (seongjin.yoon@paiptree.com)';

comment on table public.git_weekly_report_detail_sections is '### [repo] | [date] | [author] 단위 본문 블록';
comment on column public.git_weekly_report_detail_sections.heading_text is '예: [service/FMS] | 2026-03-17 10:02 | 윤성진';
comment on column public.git_weekly_report_detail_sections.commit_message_line is '예: `feat: ...` / `a` / `b`';
comment on column public.git_weekly_report_detail_sections.section_markdown is '필요 시 원문 블록 전체를 그대로 저장';

comment on table public.git_weekly_report_detail_file_rows is '각 상세 블록의 Before/After 표 행';
comment on column public.git_weekly_report_detail_file_rows.file_label is '예: `PocPageMapper.java`';

comment on table public.git_weekly_report_overall_sections is '문서 마지막 전체 맥락 요약의 ### 섹션들';
comment on column public.git_weekly_report_overall_sections.heading_text is '예: 핵심 흐름: `tbl_farm_module` → `tbl_farm_module_mac` 전환 (윤명근)';

comment on view public.git_weekly_report_export_v1 is '문서 구조를 그대로 재구성하기 위한 JSON 집계 view';

commit;
