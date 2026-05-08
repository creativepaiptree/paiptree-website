begin;

create extension if not exists pgcrypto;

-- CCTVUP state-machine model
-- 목표:
-- - 원본 운영 DB는 read-only 조회만 한다.
-- - Supabase Free 500MB 안에서 버티도록 카메라별 현재 상태는 1행 upsert로 유지한다.
-- - 5분마다 전체 카메라 snapshot을 누적하지 않는다.
-- - 3회 연속 미수집(약 15분) 이후에만 issue event를 append한다.

create table if not exists public.tbl_cctvup_camera_states (
  id uuid primary key default gen_random_uuid(),
  camera_key text not null unique,
  farm_id text not null,
  house_id text not null,
  module_id text not null,
  farm_name text,
  house_name text,
  camera_name text,
  status text not null default 'ok'
    check (status in ('ok', 'watching', 'open', 'recovering', 'resolved')),
  latest_image_at timestamptz,
  last_checked_at timestamptz not null default now(),
  miss_count integer not null default 0 check (miss_count >= 0),
  first_missed_at timestamptz,
  opened_at timestamptz,
  resolved_at timestamptz,
  recent_slots jsonb not null default '[]'::jsonb
    check (jsonb_typeof(recent_slots) = 'array'),
  age_minutes integer not null default 0 check (age_minutes >= 0),
  run_id uuid references public.tbl_cctvup_check_runs(id) on delete set null,
  message text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tbl_cctvup_camera_states_status
  on public.tbl_cctvup_camera_states (status, last_checked_at desc);

create index if not exists idx_tbl_cctvup_camera_states_farm
  on public.tbl_cctvup_camera_states (farm_id, status, last_checked_at desc);

create index if not exists idx_tbl_cctvup_camera_states_latest_image
  on public.tbl_cctvup_camera_states (latest_image_at desc nulls last);

create table if not exists public.tbl_cctvup_issue_events (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.tbl_cctvup_check_runs(id) on delete set null,
  camera_key text not null,
  farm_id text not null,
  house_id text not null,
  module_id text not null,
  farm_name text,
  house_name text,
  camera_name text,
  event_kind text not null
    check (event_kind in ('opened', 'recovering', 'resolved', 'reopened')),
  previous_status text
    check (previous_status is null or previous_status in ('ok', 'watching', 'open', 'recovering', 'resolved')),
  next_status text not null
    check (next_status in ('ok', 'watching', 'open', 'recovering', 'resolved')),
  event_at timestamptz not null default now(),
  latest_image_at timestamptz,
  miss_count integer not null default 0 check (miss_count >= 0),
  message text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_tbl_cctvup_issue_events_event_at
  on public.tbl_cctvup_issue_events (event_at desc);

create index if not exists idx_tbl_cctvup_issue_events_camera_at
  on public.tbl_cctvup_issue_events (camera_key, event_at desc);

create index if not exists idx_tbl_cctvup_issue_events_kind_at
  on public.tbl_cctvup_issue_events (event_kind, event_at desc);

create or replace function public.set_tbl_cctvup_camera_states_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_tbl_cctvup_camera_states_updated_at on public.tbl_cctvup_camera_states;
create trigger trg_tbl_cctvup_camera_states_updated_at
before update on public.tbl_cctvup_camera_states
for each row
execute function public.set_tbl_cctvup_camera_states_updated_at();

alter table public.tbl_cctvup_camera_states enable row level security;
alter table public.tbl_cctvup_issue_events enable row level security;

drop policy if exists tbl_cctvup_camera_states_service_role_rw on public.tbl_cctvup_camera_states;
create policy tbl_cctvup_camera_states_service_role_rw
on public.tbl_cctvup_camera_states
for all
to service_role
using (true)
with check (true);

drop policy if exists tbl_cctvup_issue_events_service_role_rw on public.tbl_cctvup_issue_events;
create policy tbl_cctvup_issue_events_service_role_rw
on public.tbl_cctvup_issue_events
for all
to service_role
using (true)
with check (true);

comment on table public.tbl_cctvup_camera_states is 'CCTVUP 카메라별 현재 상태. 5분 체크마다 upsert하고 전체 snapshot 누적을 피한다.';
comment on table public.tbl_cctvup_issue_events is 'CCTVUP 상태 전환 이벤트. opened/recovering/resolved/reopened만 append한다.';
comment on column public.tbl_cctvup_camera_states.status is 'ok/watching/open/recovering/resolved 상태머신 결과';
comment on column public.tbl_cctvup_camera_states.recent_slots is '최근 12회 5분 체크 슬롯. 빨간 칸이 뒤로 밀려 사라지는 UI 기준';

commit;
