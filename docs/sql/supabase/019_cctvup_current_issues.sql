begin;

create extension if not exists pgcrypto;

-- CCTVUP issue-first current state table
-- - keep the open/resolved lifecycle separate from the run-level history
-- - one row per camera_key
-- - open issues stay visible; resolved rows remain briefly for audit/history
create table if not exists public.tbl_cctvup_current_issues (
  id uuid primary key default gen_random_uuid(),
  camera_key text not null unique,
  farm_id text not null,
  house_id text not null,
  module_id text not null,
  farm_name text,
  house_name text,
  camera_name text,
  issue_kind text not null
    check (issue_kind in ('late', 'missing', 'critical')),
  issue_status text not null default 'open'
    check (issue_status in ('open', 'resolved')),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  resolved_at timestamptz,
  latest_at timestamptz,
  age_minutes integer not null default 0 check (age_minutes >= 0),
  run_id uuid references public.tbl_cctvup_check_runs(id) on delete set null,
  message text not null default '',
  payload jsonb not null default '{}'::jsonb
    check (jsonb_typeof(payload) = 'object'),
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tbl_cctvup_current_issues_status
  on public.tbl_cctvup_current_issues (issue_status, issue_kind, last_seen_at desc);

create index if not exists idx_tbl_cctvup_current_issues_camera
  on public.tbl_cctvup_current_issues (camera_key);

create index if not exists idx_tbl_cctvup_current_issues_resolved_at
  on public.tbl_cctvup_current_issues (resolved_at desc nulls last);

create index if not exists idx_tbl_cctvup_current_issues_expires_at
  on public.tbl_cctvup_current_issues (expires_at asc);

commit;
