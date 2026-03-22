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
  status text not null default 'queued'
    check (status in ('queued', 'collecting', 'summarizing', 'completed', 'failed', 'archived')),
  total_commits integer not null default 0 check (total_commits >= 0),
  total_repos integer not null default 0 check (total_repos >= 0),
  author_summaries jsonb not null default '[]'::jsonb
    check (jsonb_typeof(author_summaries) = 'array'),
  overall_summary_markdown text not null default '',
  overall_sections jsonb not null default '[]'::jsonb
    check (jsonb_typeof(overall_sections) = 'array'),
  raw_markdown text not null,
  source_report_path text,
  prompt_path text,
  snapshot_path text,
  diff_dir text,
  generator text not null default 'manual',
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

create index if not exists idx_git_weekly_reports_status_week
  on public.git_weekly_reports (status, week_monday desc);

create index if not exists idx_git_weekly_reports_generated_at
  on public.git_weekly_reports (generated_at desc nulls last);

create table if not exists public.git_weekly_report_entries (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.git_weekly_reports(id) on delete cascade,
  sort_order integer not null check (sort_order > 0),
  repo_path text not null,
  authored_label text not null,
  author_name text not null,
  author_email text,
  commit_message text not null,
  commit_messages jsonb not null default '[]'::jsonb
    check (jsonb_typeof(commit_messages) = 'array'),
  service_description text,
  before_after_rows jsonb not null default '[]'::jsonb
    check (jsonb_typeof(before_after_rows) = 'array'),
  code_highlight_markdown text not null default '',
  context_markdown text not null default '',
  meta jsonb not null default '{}'::jsonb
    check (jsonb_typeof(meta) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (report_id, sort_order)
);

create index if not exists idx_git_weekly_report_entries_report_order
  on public.git_weekly_report_entries (report_id, sort_order asc);

create index if not exists idx_git_weekly_report_entries_repo
  on public.git_weekly_report_entries (repo_path);

create index if not exists idx_git_weekly_report_entries_author
  on public.git_weekly_report_entries (author_name, report_id);

create table if not exists public.git_weekly_report_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_key text not null check (workspace_key ~ '^[a-z0-9][a-z0-9_-]{1,63}$'),
  week_monday date not null,
  week_friday date not null,
  report_id uuid references public.git_weekly_reports(id) on delete set null,
  trigger_kind text not null default 'manual'
    check (trigger_kind in ('manual', 'scheduled', 'rerun')),
  status text not null default 'queued'
    check (status in ('queued', 'collecting', 'summarizing', 'completed', 'failed', 'cancelled')),
  progress_logs jsonb not null default '[]'::jsonb
    check (jsonb_typeof(progress_logs) = 'array'),
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  meta jsonb not null default '{}'::jsonb
    check (jsonb_typeof(meta) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists idx_git_weekly_report_runs_workspace_week
  on public.git_weekly_report_runs (workspace_key, week_monday desc, created_at desc);

create or replace function public.set_git_weekly_updated_at()
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
execute function public.set_git_weekly_updated_at();

drop trigger if exists trg_git_weekly_report_entries_updated_at on public.git_weekly_report_entries;
create trigger trg_git_weekly_report_entries_updated_at
before update on public.git_weekly_report_entries
for each row
execute function public.set_git_weekly_updated_at();

alter table public.git_weekly_reports enable row level security;
alter table public.git_weekly_report_entries enable row level security;
alter table public.git_weekly_report_runs enable row level security;

drop policy if exists git_weekly_reports_service_role_rw on public.git_weekly_reports;
create policy git_weekly_reports_service_role_rw
on public.git_weekly_reports
for all
to service_role
using (true)
with check (true);

drop policy if exists git_weekly_report_entries_service_role_rw on public.git_weekly_report_entries;
create policy git_weekly_report_entries_service_role_rw
on public.git_weekly_report_entries
for all
to service_role
using (true)
with check (true);

drop policy if exists git_weekly_report_runs_service_role_rw on public.git_weekly_report_runs;
create policy git_weekly_report_runs_service_role_rw
on public.git_weekly_report_runs
for all
to service_role
using (true)
with check (true);

comment on table public.git_weekly_reports is 'GitLab 주간 리포트 원본/요약 저장 테이블';
comment on column public.git_weekly_reports.author_summaries is '배열 원소: {author_name,author_email,commit_count,repo_count,key_work}';
comment on column public.git_weekly_reports.overall_sections is '배열 원소: {title,body_markdown}';
comment on column public.git_weekly_reports.raw_markdown is 'Claude/LLM 최종 출력 원문';
comment on table public.git_weekly_report_entries is '주간 리포트 상세 커밋/레포 섹션 파싱 결과';
comment on column public.git_weekly_report_entries.before_after_rows is '배열 원소: {file,summary}';
comment on table public.git_weekly_report_runs is '수집/요약 실행 로그 테이블';

commit;
