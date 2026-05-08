begin;

alter table public.tbl_cctvup_farm_registry
  add column if not exists category_source text not null default 'legacy';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tbl_cctvup_farm_registry_category_source_check'
  ) then
    alter table public.tbl_cctvup_farm_registry
      add constraint tbl_cctvup_farm_registry_category_source_check
      check (category_source in ('auto', 'legacy', 'manual'));
  end if;
end;
$$;

create index if not exists idx_tbl_cctvup_farm_registry_category_source
  on public.tbl_cctvup_farm_registry (category_source, category, farm_id);

comment on column public.tbl_cctvup_farm_registry.category_source is 'category 출처: auto=원본 DB 자동분류, legacy=기존 일괄 registry 값, manual=사용자 명시 override';

commit;
