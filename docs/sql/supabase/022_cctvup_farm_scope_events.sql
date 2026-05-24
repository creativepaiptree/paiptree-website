begin;

create extension if not exists pgcrypto;

-- CCTVUP farm scope lifecycle model
-- 목표:
-- - 원본 운영 DB는 read-only 조회만 한다.
-- - Supabase에는 농장별 현재 감시범위 1행만 upsert한다.
-- - 입추/출하/대상확인/미설치 같은 농장 감시범위 변화만 이벤트로 append한다.
-- - 카메라 이미지 문제 이벤트(issue_events)와 농장 감시범위 이벤트를 분리한다.

create table if not exists public.tbl_cctvup_farm_scope_states (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.tbl_cctvup_check_runs(id) on delete set null,
  farm_id text not null unique,
  farm_name text,
  monitor_scope_code text not null
    check (monitor_scope_code in ('active', 'resting', 'needs_review', 'uninstalled')),
  monitor_scope_label text,
  cycle_bucket_code text
    check (
      cycle_bucket_code is null
      or cycle_bucket_code in ('current_rearing', 'resting', 'long_idle', 'no_cycle_info', 'pre_placement', 'unknown_cycle')
    ),
  cycle_bucket_label text,
  gateway_installed_count integer not null default 0 check (gateway_installed_count >= 0),
  camera_count integer not null default 0 check (camera_count >= 0),
  active_camera_count integer not null default 0 check (active_camera_count >= 0),
  last_checked_at timestamptz not null default now(),
  message text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tbl_cctvup_farm_scope_states_scope
  on public.tbl_cctvup_farm_scope_states (monitor_scope_code, last_checked_at desc);

create index if not exists idx_tbl_cctvup_farm_scope_states_cycle
  on public.tbl_cctvup_farm_scope_states (cycle_bucket_code, monitor_scope_code, last_checked_at desc);

create table if not exists public.tbl_cctvup_farm_scope_events (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.tbl_cctvup_check_runs(id) on delete set null,
  farm_id text not null,
  farm_name text,
  event_kind text not null
    check (event_kind in ('activated', 'resting_started', 'review_needed', 'uninstalled', 'scope_changed')),
  previous_scope_code text
    check (previous_scope_code is null or previous_scope_code in ('active', 'resting', 'needs_review', 'uninstalled')),
  next_scope_code text not null
    check (next_scope_code in ('active', 'resting', 'needs_review', 'uninstalled')),
  previous_cycle_bucket_code text
    check (
      previous_cycle_bucket_code is null
      or previous_cycle_bucket_code in ('current_rearing', 'resting', 'long_idle', 'no_cycle_info', 'pre_placement', 'unknown_cycle')
    ),
  next_cycle_bucket_code text
    check (
      next_cycle_bucket_code is null
      or next_cycle_bucket_code in ('current_rearing', 'resting', 'long_idle', 'no_cycle_info', 'pre_placement', 'unknown_cycle')
    ),
  previous_cycle_bucket_label text,
  next_cycle_bucket_label text,
  event_at timestamptz not null default now(),
  gateway_installed_count integer not null default 0 check (gateway_installed_count >= 0),
  camera_count integer not null default 0 check (camera_count >= 0),
  active_camera_count integer not null default 0 check (active_camera_count >= 0),
  message text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_tbl_cctvup_farm_scope_events_event_at
  on public.tbl_cctvup_farm_scope_events (event_at desc);

create index if not exists idx_tbl_cctvup_farm_scope_events_farm_at
  on public.tbl_cctvup_farm_scope_events (farm_id, event_at desc);

create index if not exists idx_tbl_cctvup_farm_scope_events_kind_at
  on public.tbl_cctvup_farm_scope_events (event_kind, event_at desc);

create or replace function public.set_tbl_cctvup_farm_scope_states_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_tbl_cctvup_farm_scope_states_updated_at on public.tbl_cctvup_farm_scope_states;
create trigger trg_tbl_cctvup_farm_scope_states_updated_at
before update on public.tbl_cctvup_farm_scope_states
for each row
execute function public.set_tbl_cctvup_farm_scope_states_updated_at();

alter table public.tbl_cctvup_farm_scope_states enable row level security;
alter table public.tbl_cctvup_farm_scope_events enable row level security;

drop policy if exists tbl_cctvup_farm_scope_states_service_role_rw on public.tbl_cctvup_farm_scope_states;
create policy tbl_cctvup_farm_scope_states_service_role_rw
on public.tbl_cctvup_farm_scope_states
for all
to service_role
using (true)
with check (true);

drop policy if exists tbl_cctvup_farm_scope_events_service_role_rw on public.tbl_cctvup_farm_scope_events;
create policy tbl_cctvup_farm_scope_events_service_role_rw
on public.tbl_cctvup_farm_scope_events
for all
to service_role
using (true)
with check (true);

comment on table public.tbl_cctvup_farm_scope_states is 'CCTVUP 농장별 현재 감시범위. 감시중/휴지기/대상확인/미설치를 1행 upsert로 유지한다.';
comment on table public.tbl_cctvup_farm_scope_events is 'CCTVUP 농장 감시범위 전환 이벤트. 입추/출하/대상확인/미설치 전환만 append한다.';
comment on column public.tbl_cctvup_farm_scope_states.monitor_scope_code is 'active=감시중, resting=휴지기, needs_review=대상확인, uninstalled=미설치';
comment on column public.tbl_cctvup_farm_scope_events.event_kind is 'activated=입추/감시 시작, resting_started=출하/휴지기 진입, review_needed=대상확인 전환, uninstalled=미설치 전환, scope_changed=기타 감시범위 변경';

commit;
