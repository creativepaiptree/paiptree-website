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
  total_commits integer not null default 0 check (total_commits >= 0),
  total_repos integer not null default 0 check (total_repos >= 0),
  raw_markdown text not null,
  status text not null default 'completed'
    check (status in ('draft', 'completed', 'failed', 'archived')),
  source_report_path text,
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
  author_name text,
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

create table if not exists public.git_weekly_report_blocks (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.git_weekly_reports(id) on delete cascade,
  sort_order integer not null check (sort_order > 0),
  block_kind text not null default 'detail'
    check (block_kind in ('detail')),
  heading_text text not null,
  repo_label text not null,
  repo_path text not null,
  authored_at_label text not null,
  author_display text not null,
  author_name text,
  author_email text,
  commit_message_label text not null,
  commit_messages jsonb not null default '[]'::jsonb
    check (jsonb_typeof(commit_messages) = 'array'),
  service_description text not null default '',
  service_stack_label text,
  before_after_heading text not null default 'Before / After',
  code_heading text not null default '코드 변경 핵심',
  context_heading text not null default '맥락 해설',
  code_block_language text not null default 'diff',
  code_block_markdown text not null default '',
  context_markdown text not null default '',
  raw_block_markdown text,
  meta jsonb not null default '{}'::jsonb
    check (jsonb_typeof(meta) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (report_id, sort_order)
);

create index if not exists idx_git_weekly_report_blocks_report_order
  on public.git_weekly_report_blocks (report_id, sort_order asc);

create index if not exists idx_git_weekly_report_blocks_repo
  on public.git_weekly_report_blocks (repo_path);

create table if not exists public.git_weekly_report_block_files (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references public.git_weekly_report_blocks(id) on delete cascade,
  sort_order integer not null check (sort_order > 0),
  file_label text not null,
  change_summary text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (block_id, sort_order)
);

create index if not exists idx_git_weekly_report_block_files_block_order
  on public.git_weekly_report_block_files (block_id, sort_order asc);

create table if not exists public.git_weekly_report_overall_sections (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.git_weekly_reports(id) on delete cascade,
  sort_order integer not null check (sort_order > 0),
  heading_text text not null,
  body_markdown text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (report_id, sort_order)
);

create index if not exists idx_git_weekly_report_overall_sections_report_order
  on public.git_weekly_report_overall_sections (report_id, sort_order asc);

create or replace function public.set_git_weekly_report_updated_at()
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
execute function public.set_git_weekly_report_updated_at();

drop trigger if exists trg_git_weekly_report_summary_rows_updated_at on public.git_weekly_report_summary_rows;
create trigger trg_git_weekly_report_summary_rows_updated_at
before update on public.git_weekly_report_summary_rows
for each row
execute function public.set_git_weekly_report_updated_at();

drop trigger if exists trg_git_weekly_report_blocks_updated_at on public.git_weekly_report_blocks;
create trigger trg_git_weekly_report_blocks_updated_at
before update on public.git_weekly_report_blocks
for each row
execute function public.set_git_weekly_report_updated_at();

drop trigger if exists trg_git_weekly_report_block_files_updated_at on public.git_weekly_report_block_files;
create trigger trg_git_weekly_report_block_files_updated_at
before update on public.git_weekly_report_block_files
for each row
execute function public.set_git_weekly_report_updated_at();

drop trigger if exists trg_git_weekly_report_overall_sections_updated_at on public.git_weekly_report_overall_sections;
create trigger trg_git_weekly_report_overall_sections_updated_at
before update on public.git_weekly_report_overall_sections
for each row
execute function public.set_git_weekly_report_updated_at();

create or replace view public.git_weekly_report_blocks_export_v1 as
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
  report.total_commits,
  report.total_repos,
  report.raw_markdown,
  report.status,
  report.source_report_path,
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
        'sort_order', block.sort_order,
        'heading_text', block.heading_text,
        'repo_label', block.repo_label,
        'repo_path', block.repo_path,
        'authored_at_label', block.authored_at_label,
        'author_display', block.author_display,
        'author_name', block.author_name,
        'author_email', block.author_email,
        'commit_message_label', block.commit_message_label,
        'commit_messages', block.commit_messages,
        'service_description', block.service_description,
        'service_stack_label', block.service_stack_label,
        'before_after_heading', block.before_after_heading,
        'code_heading', block.code_heading,
        'context_heading', block.context_heading,
        'code_block_language', block.code_block_language,
        'code_block_markdown', block.code_block_markdown,
        'context_markdown', block.context_markdown,
        'raw_block_markdown', block.raw_block_markdown,
        'before_after_rows', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'sort_order', file_row.sort_order,
              'file_label', file_row.file_label,
              'change_summary', file_row.change_summary
            )
            order by file_row.sort_order
          )
          from public.git_weekly_report_block_files file_row
          where file_row.block_id = block.id
        ), '[]'::jsonb)
      )
      order by block.sort_order
    )
    from public.git_weekly_report_blocks block
    where block.report_id = report.id
  ), '[]'::jsonb) as detail_blocks,
  coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'sort_order', overall.sort_order,
        'heading_text', overall.heading_text,
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
alter table public.git_weekly_report_blocks enable row level security;
alter table public.git_weekly_report_block_files enable row level security;
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

drop policy if exists git_weekly_report_blocks_service_role_rw on public.git_weekly_report_blocks;
create policy git_weekly_report_blocks_service_role_rw
on public.git_weekly_report_blocks
for all
to service_role
using (true)
with check (true);

drop policy if exists git_weekly_report_block_files_service_role_rw on public.git_weekly_report_block_files;
create policy git_weekly_report_block_files_service_role_rw
on public.git_weekly_report_block_files
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

comment on table public.git_weekly_reports is '주간 리포트 문서 단위 헤더';
comment on table public.git_weekly_report_summary_rows is '변경 요약 표의 작업자별 행';
comment on table public.git_weekly_report_blocks is '### [repo] | [date] | [author] 단위의 상세 변경 덩어리';
comment on column public.git_weekly_report_blocks.commit_message_label is '예: etc: 소스 정리 / etc: 소스 정리 및 readme 업데이트';
comment on column public.git_weekly_report_blocks.service_description is '예: 운수 배차 관리 프론트엔드 (Nuxt3 / Vue3 / TypeScript / Tailwind CSS)';
comment on column public.git_weekly_report_blocks.raw_block_markdown is '필요 시 블록 전체 원문을 그대로 저장';
comment on table public.git_weekly_report_block_files is '상세 변경 덩어리 내부 Before / After 파일 행';
comment on table public.git_weekly_report_overall_sections is '이번 주 전체 맥락 요약 섹션';
comment on view public.git_weekly_report_blocks_export_v1 is '문서 -> 상세 블록 -> 파일 행 구조를 한번에 조회하는 export view';

commit;
