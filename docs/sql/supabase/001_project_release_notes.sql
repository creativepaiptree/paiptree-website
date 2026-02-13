begin;

create extension if not exists pgcrypto;

create table if not exists public.project_release_notes (
  id uuid primary key default gen_random_uuid(),
  project_id text not null check (project_id ~ '^[a-z0-9][a-z0-9_-]{1,63}$'),
  version text not null check (version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  version_major integer generated always as ((split_part(version, '.', 1))::integer) stored,
  version_minor integer generated always as ((split_part(version, '.', 2))::integer) stored,
  version_patch integer generated always as ((split_part(version, '.', 3))::integer) stored,
  released_on date not null,
  items jsonb not null
    default '[]'::jsonb
    check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) > 0),
  meta jsonb not null
    default '{}'::jsonb
    check (jsonb_typeof(meta) = 'object'),
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, version)
);

create index if not exists idx_project_release_notes_project_sort
  on public.project_release_notes (
    project_id,
    version_major desc,
    version_minor desc,
    version_patch desc,
    released_on desc
  );

create index if not exists idx_project_release_notes_public_sort
  on public.project_release_notes (is_public, project_id, released_on desc);

create or replace function public.set_project_release_notes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_project_release_notes_updated_at on public.project_release_notes;
create trigger trg_project_release_notes_updated_at
before update on public.project_release_notes
for each row
execute function public.set_project_release_notes_updated_at();

alter table public.project_release_notes enable row level security;

drop policy if exists project_release_notes_public_read on public.project_release_notes;
create policy project_release_notes_public_read
on public.project_release_notes
for select
to anon, authenticated
using (is_public = true);

drop policy if exists project_release_notes_service_write on public.project_release_notes;
create policy project_release_notes_service_write
on public.project_release_notes
for all
to service_role
using (true)
with check (true);

create or replace view public.project_release_notes_export_v1 as
select
  project_id,
  version,
  to_char(released_on, 'YY.MM.DD') as date,
  items
from public.project_release_notes
where is_public = true
order by
  project_id asc,
  version_major desc,
  version_minor desc,
  version_patch desc,
  released_on desc;

comment on table public.project_release_notes is '프로젝트별 버전 릴리즈 노트 원본 테이블(Supabase SoT)';
comment on column public.project_release_notes.items is '배열 원소: {titleKo,titleEn,detailsKo[],detailsEn[]}';

commit;
