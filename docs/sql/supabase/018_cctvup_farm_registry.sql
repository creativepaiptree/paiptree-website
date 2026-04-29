begin;

create extension if not exists pgcrypto;

-- CCTVUP farm registry
-- - 운영 DB는 read-only 조회만 사용
-- - 농장 표시명 / 카테고리 / 태그 / 메모 / 별칭은 Supabase registry에 저장
-- - 핵심 키는 farm_id

create table if not exists public.tbl_cctvup_farm_registry (
  farm_id text primary key
    check (farm_id ~ '^[A-Za-z0-9._:-]{1,128}$'),
  display_name text,
  category text not null default 'other'
    check (category in ('overseas', 'shinwoo', 'cheriburo', 'other')),
  tags text[] not null default '{}'::text[],
  memo text not null default '',
  aliases text[] not null default '{}'::text[],
  is_active boolean not null default true,
  updated_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tbl_cctvup_farm_registry_category
  on public.tbl_cctvup_farm_registry (category, is_active, farm_id);

create index if not exists idx_tbl_cctvup_farm_registry_active
  on public.tbl_cctvup_farm_registry (is_active, farm_id);

create index if not exists idx_tbl_cctvup_farm_registry_updated_at
  on public.tbl_cctvup_farm_registry (updated_at desc);

create or replace function public.set_tbl_cctvup_farm_registry_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_tbl_cctvup_farm_registry_updated_at on public.tbl_cctvup_farm_registry;
create trigger trg_tbl_cctvup_farm_registry_updated_at
before update on public.tbl_cctvup_farm_registry
for each row
execute function public.set_tbl_cctvup_farm_registry_updated_at();

alter table public.tbl_cctvup_farm_registry enable row level security;

drop policy if exists tbl_cctvup_farm_registry_service_role_rw on public.tbl_cctvup_farm_registry;
create policy tbl_cctvup_farm_registry_service_role_rw
on public.tbl_cctvup_farm_registry
for all
to service_role
using (true)
with check (true);

comment on table public.tbl_cctvup_farm_registry is 'CCTVUP 농장 registry(Supabase SoT)';
comment on column public.tbl_cctvup_farm_registry.display_name is '화면 표시명';
comment on column public.tbl_cctvup_farm_registry.category is '해외 / 신우 / 체리부로 / 기타';
comment on column public.tbl_cctvup_farm_registry.tags is '운영 태그 배열';
comment on column public.tbl_cctvup_farm_registry.memo is '운영 메모';
comment on column public.tbl_cctvup_farm_registry.aliases is '별칭 배열';

commit;
