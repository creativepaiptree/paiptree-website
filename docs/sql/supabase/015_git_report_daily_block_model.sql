begin;

create extension if not exists pgcrypto;

create table if not exists public.git_report_blocks (
  id uuid primary key default gen_random_uuid(),
  report_date date not null,
  sort_order integer not null default 1 check (sort_order > 0),
  heading_text text not null,
  service_label text not null,
  service_name text not null,
  authored_time_label text not null,
  author_name text not null,
  author_email text,
  commit_message_label text not null,
  commit_messages jsonb not null default '[]'::jsonb
    check (jsonb_typeof(commit_messages) = 'array'),
  service_description text not null default '',
  before_after_heading text not null default 'Before / After',
  code_heading text not null default '코드 변경 핵심',
  code_block_language text not null default 'diff',
  code_block_markdown text not null default '',
  context_heading text not null default '맥락 해설',
  context_markdown text not null default '',
  raw_block_markdown text,
  source_markdown_path text,
  meta jsonb not null default '{}'::jsonb
    check (jsonb_typeof(meta) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_git_report_blocks_report_date
  on public.git_report_blocks (report_date desc, sort_order asc);

create index if not exists idx_git_report_blocks_service_name
  on public.git_report_blocks (service_name);

create table if not exists public.git_report_block_files (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references public.git_report_blocks(id) on delete cascade,
  sort_order integer not null check (sort_order > 0),
  file_label text not null,
  change_summary text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (block_id, sort_order)
);

create index if not exists idx_git_report_block_files_block_order
  on public.git_report_block_files (block_id, sort_order asc);

create or replace function public.set_git_report_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_git_report_blocks_updated_at on public.git_report_blocks;
create trigger trg_git_report_blocks_updated_at
before update on public.git_report_blocks
for each row
execute function public.set_git_report_updated_at();

drop trigger if exists trg_git_report_block_files_updated_at on public.git_report_block_files;
create trigger trg_git_report_block_files_updated_at
before update on public.git_report_block_files
for each row
execute function public.set_git_report_updated_at();

create or replace view public.git_report_blocks_export_v1 as
select
  block.id,
  block.report_date,
  block.sort_order,
  block.heading_text,
  block.service_label,
  block.service_name,
  block.authored_time_label,
  block.author_name,
  block.author_email,
  block.commit_message_label,
  block.commit_messages,
  block.service_description,
  block.before_after_heading,
  block.code_heading,
  block.code_block_language,
  block.code_block_markdown,
  block.context_heading,
  block.context_markdown,
  block.raw_block_markdown,
  block.source_markdown_path,
  block.meta,
  block.created_at,
  block.updated_at,
  coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'sort_order', file_row.sort_order,
        'file_label', file_row.file_label,
        'change_summary', file_row.change_summary
      )
      order by file_row.sort_order
    )
    from public.git_report_block_files file_row
    where file_row.block_id = block.id
  ), '[]'::jsonb) as before_after_rows
from public.git_report_blocks block;

alter table public.git_report_blocks enable row level security;
alter table public.git_report_block_files enable row level security;

drop policy if exists git_report_blocks_service_role_rw on public.git_report_blocks;
create policy git_report_blocks_service_role_rw
on public.git_report_blocks
for all
to service_role
using (true)
with check (true);

drop policy if exists git_report_block_files_service_role_rw on public.git_report_block_files;
create policy git_report_block_files_service_role_rw
on public.git_report_block_files
for all
to service_role
using (true)
with check (true);

comment on table public.git_report_blocks is '날짜 조회 시 한 페이지에 모아 보여줄 상세 변경 블록';
comment on column public.git_report_blocks.heading_text is '예: [service/TMS] | 2026-03-20 09:08 + 14:18 | chris';
comment on column public.git_report_blocks.commit_message_label is '예: etc: 소스 정리 / etc: 소스 정리 및 readme 업데이트';
comment on column public.git_report_blocks.service_description is '예: 운수 배차 관리 프론트엔드 (Nuxt3 / Vue3 / TypeScript / Tailwind CSS)';
comment on column public.git_report_blocks.authored_time_label is '예: 09:08 + 14:18';
comment on table public.git_report_block_files is '상세 변경 블록의 Before / After 파일별 행';
comment on view public.git_report_blocks_export_v1 is '날짜별 상세 변경 블록과 파일행을 같이 읽는 조회용 view';

commit;
