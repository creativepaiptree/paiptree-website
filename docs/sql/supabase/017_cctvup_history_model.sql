begin;

create extension if not exists pgcrypto;

-- CCTVUP 기록층 설계 초안
-- - 운영 DB는 read-only 조회만 사용
-- - 기록성 데이터는 별도 Supabase에 적재
-- - 문제로그는 생성 후 30일 유지
-- - 에너지바는 5분 스냅샷의 누적 이력으로 표시

create table if not exists public.tbl_cctvup_check_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'db'
    check (source in ('db', 'mock', 'unavailable')),
  checked_at timestamptz not null default now(),
  table_name text not null default 'paip.tbl_farm_image',
  farm_count integer not null default 0 check (farm_count >= 0),
  camera_count integer not null default 0 check (camera_count >= 0),
  ok_count integer not null default 0 check (ok_count >= 0),
  late_count integer not null default 0 check (late_count >= 0),
  missing_count integer not null default 0 check (missing_count >= 0),
  critical_count integer not null default 0 check (critical_count >= 0),
  paused_count integer not null default 0 check (paused_count >= 0),
  payload jsonb not null default '{}'::jsonb
    check (jsonb_typeof(payload) = 'object'),
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tbl_cctvup_check_runs_checked_at
  on public.tbl_cctvup_check_runs (checked_at desc);

create table if not exists public.tbl_cctvup_camera_snapshots (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.tbl_cctvup_check_runs(id) on delete set null,
  camera_key text not null,
  farm_id text not null,
  house_id text not null,
  module_id text not null,
  farm_name text,
  house_name text,
  camera_name text,
  snapshot_at timestamptz not null default now(),
  snapshot_date date not null default current_date,
  slot_status text not null
    check (slot_status in ('ok', 'late', 'missing', 'paused')),
  age_minutes integer not null default 0 check (age_minutes >= 0),
  cnt_1h integer not null default 0 check (cnt_1h >= 0),
  cnt_24h integer not null default 0 check (cnt_24h >= 0),
  reason text not null default '',
  expires_at timestamptz not null default (now() + interval '30 days'),
  meta jsonb not null default '{}'::jsonb
    check (jsonb_typeof(meta) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (camera_key, snapshot_at)
);

create index if not exists idx_tbl_cctvup_camera_snapshots_camera_at
  on public.tbl_cctvup_camera_snapshots (camera_key, snapshot_at desc);

create index if not exists idx_tbl_cctvup_camera_snapshots_expires_at
  on public.tbl_cctvup_camera_snapshots (expires_at asc);

create index if not exists idx_tbl_cctvup_camera_snapshots_run_id
  on public.tbl_cctvup_camera_snapshots (run_id);

create table if not exists public.tbl_cctvup_incident_logs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.tbl_cctvup_check_runs(id) on delete set null,
  camera_key text not null,
  farm_id text not null,
  house_id text not null,
  module_id text not null,
  farm_name text,
  house_name text,
  camera_name text,
  incident_kind text not null
    check (incident_kind in ('late', 'missing', 'critical')),
  incident_status text not null default 'open'
    check (incident_status in ('open', 'resolved')),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  resolved_at timestamptz,
  expires_at timestamptz not null default (now() + interval '30 days'),
  message text not null default '',
  snapshot_payload jsonb not null default '{}'::jsonb
    check (jsonb_typeof(snapshot_payload) = 'object'),
  meta jsonb not null default '{}'::jsonb
    check (jsonb_typeof(meta) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tbl_cctvup_incident_logs_expires_at
  on public.tbl_cctvup_incident_logs (expires_at asc);

create index if not exists idx_tbl_cctvup_incident_logs_camera_seen_at
  on public.tbl_cctvup_incident_logs (camera_key, first_seen_at desc);

create index if not exists idx_tbl_cctvup_incident_logs_status
  on public.tbl_cctvup_incident_logs (incident_status, incident_kind);

commit;
