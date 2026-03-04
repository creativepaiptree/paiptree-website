begin;

create extension if not exists pgcrypto;

drop table if exists public.i18n_translation_overrides;

create table if not exists public.i18n_translation_overrides (
  service text not null check (service in ('FM-AI', 'FM-EMS and PoC')),
  lang text not null check (lang in ('en', 'ko', 'th', 'tw', 'jp')),
  key text not null,
  value text not null default '',
  updated_by text null,
  updated_at timestamptz not null default now(),
  primary key (service, lang, key)
);

create index if not exists idx_i18n_translation_overrides_service
  on public.i18n_translation_overrides (service);
create index if not exists idx_i18n_translation_overrides_service_lang
  on public.i18n_translation_overrides (service, lang);

create or replace function public.set_i18n_translation_overrides_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_i18n_translation_overrides_updated_at on public.i18n_translation_overrides;
create trigger trg_i18n_translation_overrides_updated_at
before update on public.i18n_translation_overrides
for each row
execute function public.set_i18n_translation_overrides_updated_at();

alter table public.i18n_translation_overrides enable row level security;

drop policy if exists i18n_translation_overrides_service_role_rw on public.i18n_translation_overrides;
create policy i18n_translation_overrides_service_role_rw
on public.i18n_translation_overrides
for all
to service_role
using (true)
with check (true);

comment on table public.i18n_translation_overrides is 'i18n 번역 편집 값 저장 테이블 (정합성 페이지 저장 값의 SoT)';
comment on column public.i18n_translation_overrides.key is '번역 키';
comment on column public.i18n_translation_overrides.value is '번역 값';

commit;
