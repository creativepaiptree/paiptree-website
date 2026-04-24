begin;

create extension if not exists pgcrypto;

create table if not exists public.tbl_tms_cherrybro_excel_files (
  id uuid primary key default gen_random_uuid(),
  source_file_name text not null,
  source_file_size bigint,
  source_file_sha256 text,
  import_scope text not null default 'grouping'
    check (import_scope in ('grouping', 'settlement', 'archive')),
  source_year integer,
  source_month integer,
  sheet_count integer not null default 0 check (sheet_count >= 0),
  row_count integer not null default 0 check (row_count >= 0),
  import_status text not null default 'pending'
    check (import_status in ('pending', 'parsed', 'normalized', 'failed')),
  source_note text not null default '',
  meta jsonb not null default '{}'::jsonb
    check (jsonb_typeof(meta) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tbl_tms_cherrybro_excel_files_scope_month
  on public.tbl_tms_cherrybro_excel_files (import_scope, source_year desc, source_month desc);

create table if not exists public.tbl_tms_cherrybro_excel_rows (
  id uuid primary key default gen_random_uuid(),
  file_id uuid not null references public.tbl_tms_cherrybro_excel_files(id) on delete cascade,
  sheet_name text not null,
  sheet_order integer not null default 1 check (sheet_order > 0),
  source_row_no integer not null check (source_row_no > 0),
  source_col_count integer not null default 0 check (source_col_count >= 0),
  source_row_type text not null default 'data'
    check (source_row_type in ('title', 'header', 'data', 'summary', 'blank')),
  work_date date,
  daily_seq integer,
  origin text,
  destination text,
  destination_count integer,
  vehicle_ton_class text,
  cherry_charge_amount numeric(12,0),
  driver_pay_amount numeric(12,0),
  affiliation text,
  external_driver_name text,
  external_driver_phone text,
  internal_driver_name text,
  internal_driver_phone text,
  cost_burden text,
  cost_reason text,
  memo text,
  work_type_code text,
  work_type text,
  grouping_key text,
  normalize_status text not null default 'pending'
    check (normalize_status in ('pending', 'normalized', 'review', 'excluded')),
  raw_json jsonb not null default '{}'::jsonb
    check (jsonb_typeof(raw_json) = 'object'),
  meta jsonb not null default '{}'::jsonb
    check (jsonb_typeof(meta) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (file_id, sheet_name, source_row_no)
);

create index if not exists idx_tbl_tms_cherrybro_excel_rows_file_sheet_row
  on public.tbl_tms_cherrybro_excel_rows (file_id, sheet_order asc, source_row_no asc);

create index if not exists idx_tbl_tms_cherrybro_excel_rows_grouping_key
  on public.tbl_tms_cherrybro_excel_rows (grouping_key)
  where grouping_key is not null;

create index if not exists idx_tbl_tms_cherrybro_excel_rows_work_date
  on public.tbl_tms_cherrybro_excel_rows (work_date desc)
  where work_date is not null;

create table if not exists public.tbl_tms_cherrybro_grouping_runs (
  id uuid primary key default gen_random_uuid(),
  file_id uuid references public.tbl_tms_cherrybro_excel_files(id) on delete set null,
  grouping_date date not null,
  run_status text not null default 'draft'
    check (run_status in ('draft', 'review', 'locked', 'failed')),
  source_row_count integer not null default 0 check (source_row_count >= 0),
  candidate_count integer not null default 0 check (candidate_count >= 0),
  manual_review_count integer not null default 0 check (manual_review_count >= 0),
  note text not null default '',
  meta jsonb not null default '{}'::jsonb
    check (jsonb_typeof(meta) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (grouping_date, file_id)
);

create index if not exists idx_tbl_tms_cherrybro_grouping_runs_date
  on public.tbl_tms_cherrybro_grouping_runs (grouping_date desc);

create table if not exists public.tbl_tms_cherrybro_grouping_rows (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.tbl_tms_cherrybro_grouping_runs(id) on delete cascade,
  row_order integer not null check (row_order > 0),
  driver_label text not null,
  vehicle_label text not null default '',
  trip_count integer not null default 0 check (trip_count >= 0),
  origin text not null,
  destination text not null,
  business_office text not null default '',
  vehicle_ton_class text not null default '',
  route_order text not null default '',
  auto_status text not null default '자동완료',
  standard_fare numeric(12,0) not null default 0,
  transport_fare numeric(12,0) not null default 0,
  fuel_fare numeric(12,0) not null default 0,
  round_trip_fare numeric(12,0) not null default 0,
  customer_allowance numeric(12,0) not null default 0,
  etc_allowance numeric(12,0) not null default 0,
  holiday_fare numeric(12,0) not null default 0,
  morning_drop_allowance numeric(12,0) not null default 0,
  memo text not null default '',
  raw_row_count integer not null default 0 check (raw_row_count >= 0),
  manual_review_count integer not null default 0 check (manual_review_count >= 0),
  meta jsonb not null default '{}'::jsonb
    check (jsonb_typeof(meta) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (run_id, row_order)
);

create index if not exists idx_tbl_tms_cherrybro_grouping_rows_run_order
  on public.tbl_tms_cherrybro_grouping_rows (run_id, row_order asc);

create table if not exists public.tbl_tms_cherrybro_grouping_row_details (
  id uuid primary key default gen_random_uuid(),
  grouping_row_id uuid not null references public.tbl_tms_cherrybro_grouping_rows(id) on delete cascade,
  row_order integer not null check (row_order > 0),
  source_row_id uuid references public.tbl_tms_cherrybro_excel_rows(id) on delete set null,
  transport_id text not null,
  transport_seq text not null,
  car_seq text not null,
  region text not null,
  weight_text text not null,
  destination_text text not null,
  judgement text not null,
  fare_label text not null default '',
  allowance_label text not null default '',
  note text not null default '',
  meta jsonb not null default '{}'::jsonb
    check (jsonb_typeof(meta) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (grouping_row_id, row_order)
);

create index if not exists idx_tbl_tms_cherrybro_grouping_row_details_row_order
  on public.tbl_tms_cherrybro_grouping_row_details (grouping_row_id, row_order asc);

create table if not exists public.tbl_tms_cherrybro_settlement_runs (
  id uuid primary key default gen_random_uuid(),
  grouping_run_id uuid not null references public.tbl_tms_cherrybro_grouping_runs(id) on delete cascade,
  settlement_date date not null,
  run_status text not null default 'draft'
    check (run_status in ('draft', 'review', 'approved', 'exported', 'failed')),
  settlement_row_count integer not null default 0 check (settlement_row_count >= 0),
  note text not null default '',
  meta jsonb not null default '{}'::jsonb
    check (jsonb_typeof(meta) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (settlement_date, grouping_run_id)
);

create table if not exists public.tbl_tms_cherrybro_settlement_rows (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.tbl_tms_cherrybro_settlement_runs(id) on delete cascade,
  row_order integer not null check (row_order > 0),
  driver_label text not null,
  vehicle_label text not null default '',
  work_date date not null,
  origin text not null,
  destination text not null,
  vehicle_ton_class text not null default '',
  cherry_charge_amount numeric(12,0) not null default 0,
  driver_pay_amount numeric(12,0) not null default 0,
  settlement_status text not null default 'pending'
    check (settlement_status in ('pending', 'review', 'approved', 'rejected')),
  note text not null default '',
  meta jsonb not null default '{}'::jsonb
    check (jsonb_typeof(meta) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (run_id, row_order)
);

create index if not exists idx_tbl_tms_cherrybro_settlement_rows_run_order
  on public.tbl_tms_cherrybro_settlement_rows (run_id, row_order asc);

create table if not exists public.tbl_tms_cherrybro_driver_aliases (
  id uuid primary key default gen_random_uuid(),
  driver_label text not null,
  driver_phone text,
  driver_no text,
  active boolean not null default true,
  note text not null default '',
  meta jsonb not null default '{}'::jsonb
    check (jsonb_typeof(meta) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  driver_phone_norm text not null default ''
);

create unique index if not exists idx_tbl_tms_cherrybro_driver_aliases_unique
  on public.tbl_tms_cherrybro_driver_aliases (driver_label, driver_phone_norm);

create table if not exists public.tbl_tms_cherrybro_vehicle_aliases (
  id uuid primary key default gen_random_uuid(),
  vehicle_label text not null,
  car_no text,
  car_seq text,
  active boolean not null default true,
  note text not null default '',
  meta jsonb not null default '{}'::jsonb
    check (jsonb_typeof(meta) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  car_no_norm text not null default '',
  car_seq_norm text not null default ''
);

create unique index if not exists idx_tbl_tms_cherrybro_vehicle_aliases_unique
  on public.tbl_tms_cherrybro_vehicle_aliases (vehicle_label, car_no_norm, car_seq_norm);

create table if not exists public.tbl_tms_cherrybro_rate_rules (
  id uuid primary key default gen_random_uuid(),
  rule_code text not null,
  rule_label text not null,
  rate_kind text not null default 'amount'
    check (rate_kind in ('amount', 'percent')),
  amount_value numeric(12,0),
  percent_value numeric(8,2),
  active boolean not null default true,
  note text not null default '',
  meta jsonb not null default '{}'::jsonb
    check (jsonb_typeof(meta) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (rule_code)
);

create or replace function public.set_tbl_tms_cherrybro_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_tbl_tms_cherrybro_excel_files_updated_at on public.tbl_tms_cherrybro_excel_files;
create trigger trg_tbl_tms_cherrybro_excel_files_updated_at
before update on public.tbl_tms_cherrybro_excel_files
for each row
execute function public.set_tbl_tms_cherrybro_updated_at();

drop trigger if exists trg_tbl_tms_cherrybro_excel_rows_updated_at on public.tbl_tms_cherrybro_excel_rows;
create trigger trg_tbl_tms_cherrybro_excel_rows_updated_at
before update on public.tbl_tms_cherrybro_excel_rows
for each row
execute function public.set_tbl_tms_cherrybro_updated_at();

drop trigger if exists trg_tbl_tms_cherrybro_grouping_runs_updated_at on public.tbl_tms_cherrybro_grouping_runs;
create trigger trg_tbl_tms_cherrybro_grouping_runs_updated_at
before update on public.tbl_tms_cherrybro_grouping_runs
for each row
execute function public.set_tbl_tms_cherrybro_updated_at();

drop trigger if exists trg_tbl_tms_cherrybro_grouping_rows_updated_at on public.tbl_tms_cherrybro_grouping_rows;
create trigger trg_tbl_tms_cherrybro_grouping_rows_updated_at
before update on public.tbl_tms_cherrybro_grouping_rows
for each row
execute function public.set_tbl_tms_cherrybro_updated_at();

drop trigger if exists trg_tbl_tms_cherrybro_grouping_row_details_updated_at on public.tbl_tms_cherrybro_grouping_row_details;
create trigger trg_tbl_tms_cherrybro_grouping_row_details_updated_at
before update on public.tbl_tms_cherrybro_grouping_row_details
for each row
execute function public.set_tbl_tms_cherrybro_updated_at();

drop trigger if exists trg_tbl_tms_cherrybro_settlement_runs_updated_at on public.tbl_tms_cherrybro_settlement_runs;
create trigger trg_tbl_tms_cherrybro_settlement_runs_updated_at
before update on public.tbl_tms_cherrybro_settlement_runs
for each row
execute function public.set_tbl_tms_cherrybro_updated_at();

drop trigger if exists trg_tbl_tms_cherrybro_settlement_rows_updated_at on public.tbl_tms_cherrybro_settlement_rows;
create trigger trg_tbl_tms_cherrybro_settlement_rows_updated_at
before update on public.tbl_tms_cherrybro_settlement_rows
for each row
execute function public.set_tbl_tms_cherrybro_updated_at();

drop trigger if exists trg_tbl_tms_cherrybro_driver_aliases_updated_at on public.tbl_tms_cherrybro_driver_aliases;
create trigger trg_tbl_tms_cherrybro_driver_aliases_updated_at
before update on public.tbl_tms_cherrybro_driver_aliases
for each row
execute function public.set_tbl_tms_cherrybro_updated_at();

drop trigger if exists trg_tbl_tms_cherrybro_vehicle_aliases_updated_at on public.tbl_tms_cherrybro_vehicle_aliases;
create trigger trg_tbl_tms_cherrybro_vehicle_aliases_updated_at
before update on public.tbl_tms_cherrybro_vehicle_aliases
for each row
execute function public.set_tbl_tms_cherrybro_updated_at();

drop trigger if exists trg_tbl_tms_cherrybro_rate_rules_updated_at on public.tbl_tms_cherrybro_rate_rules;
create trigger trg_tbl_tms_cherrybro_rate_rules_updated_at
before update on public.tbl_tms_cherrybro_rate_rules
for each row
execute function public.set_tbl_tms_cherrybro_updated_at();

create or replace view public.tbl_tms_cherrybro_grouping_page_v1 as
select
  row.id,
  row.run_id,
  run.grouping_date,
  run.source_row_count,
  run.candidate_count,
  run.manual_review_count,
  row.row_order,
  row.driver_label,
  row.vehicle_label,
  row.trip_count,
  row.origin,
  row.destination,
  row.business_office,
  row.vehicle_ton_class,
  row.route_order,
  row.auto_status,
  row.standard_fare,
  row.transport_fare,
  row.fuel_fare,
  row.round_trip_fare,
  row.customer_allowance,
  row.etc_allowance,
  row.holiday_fare,
  row.morning_drop_allowance,
  row.memo,
  row.raw_row_count,
  row.manual_review_count as row_manual_review_count,
  coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'row_order', detail.row_order,
        'source_row_id', detail.source_row_id,
        'transport_id', detail.transport_id,
        'transport_seq', detail.transport_seq,
        'car_seq', detail.car_seq,
        'region', detail.region,
        'weight_text', detail.weight_text,
        'destination_text', detail.destination_text,
        'judgement', detail.judgement,
        'fare_label', detail.fare_label,
        'allowance_label', detail.allowance_label,
        'note', detail.note
      )
      order by detail.row_order
    )
    from public.tbl_tms_cherrybro_grouping_row_details detail
    where detail.grouping_row_id = row.id
  ), '[]'::jsonb) as details
from public.tbl_tms_cherrybro_grouping_rows row
join public.tbl_tms_cherrybro_grouping_runs run
  on run.id = row.run_id;

alter table public.tbl_tms_cherrybro_excel_files enable row level security;
alter table public.tbl_tms_cherrybro_excel_rows enable row level security;
alter table public.tbl_tms_cherrybro_grouping_runs enable row level security;
alter table public.tbl_tms_cherrybro_grouping_rows enable row level security;
alter table public.tbl_tms_cherrybro_grouping_row_details enable row level security;
alter table public.tbl_tms_cherrybro_settlement_runs enable row level security;
alter table public.tbl_tms_cherrybro_settlement_rows enable row level security;
alter table public.tbl_tms_cherrybro_driver_aliases enable row level security;
alter table public.tbl_tms_cherrybro_vehicle_aliases enable row level security;
alter table public.tbl_tms_cherrybro_rate_rules enable row level security;

drop policy if exists tbl_tms_cherrybro_excel_files_service_role_rw on public.tbl_tms_cherrybro_excel_files;
create policy tbl_tms_cherrybro_excel_files_service_role_rw
on public.tbl_tms_cherrybro_excel_files
for all
to service_role
using (true)
with check (true);

drop policy if exists tbl_tms_cherrybro_excel_rows_service_role_rw on public.tbl_tms_cherrybro_excel_rows;
create policy tbl_tms_cherrybro_excel_rows_service_role_rw
on public.tbl_tms_cherrybro_excel_rows
for all
to service_role
using (true)
with check (true);

drop policy if exists tbl_tms_cherrybro_grouping_runs_service_role_rw on public.tbl_tms_cherrybro_grouping_runs;
create policy tbl_tms_cherrybro_grouping_runs_service_role_rw
on public.tbl_tms_cherrybro_grouping_runs
for all
to service_role
using (true)
with check (true);

drop policy if exists tbl_tms_cherrybro_grouping_rows_service_role_rw on public.tbl_tms_cherrybro_grouping_rows;
create policy tbl_tms_cherrybro_grouping_rows_service_role_rw
on public.tbl_tms_cherrybro_grouping_rows
for all
to service_role
using (true)
with check (true);

drop policy if exists tbl_tms_cherrybro_grouping_row_details_service_role_rw on public.tbl_tms_cherrybro_grouping_row_details;
create policy tbl_tms_cherrybro_grouping_row_details_service_role_rw
on public.tbl_tms_cherrybro_grouping_row_details
for all
to service_role
using (true)
with check (true);

drop policy if exists tbl_tms_cherrybro_settlement_runs_service_role_rw on public.tbl_tms_cherrybro_settlement_runs;
create policy tbl_tms_cherrybro_settlement_runs_service_role_rw
on public.tbl_tms_cherrybro_settlement_runs
for all
to service_role
using (true)
with check (true);

drop policy if exists tbl_tms_cherrybro_settlement_rows_service_role_rw on public.tbl_tms_cherrybro_settlement_rows;
create policy tbl_tms_cherrybro_settlement_rows_service_role_rw
on public.tbl_tms_cherrybro_settlement_rows
for all
to service_role
using (true)
with check (true);

drop policy if exists tbl_tms_cherrybro_driver_aliases_service_role_rw on public.tbl_tms_cherrybro_driver_aliases;
create policy tbl_tms_cherrybro_driver_aliases_service_role_rw
on public.tbl_tms_cherrybro_driver_aliases
for all
to service_role
using (true)
with check (true);

drop policy if exists tbl_tms_cherrybro_vehicle_aliases_service_role_rw on public.tbl_tms_cherrybro_vehicle_aliases;
create policy tbl_tms_cherrybro_vehicle_aliases_service_role_rw
on public.tbl_tms_cherrybro_vehicle_aliases
for all
to service_role
using (true)
with check (true);

drop policy if exists tbl_tms_cherrybro_rate_rules_service_role_rw on public.tbl_tms_cherrybro_rate_rules;
create policy tbl_tms_cherrybro_rate_rules_service_role_rw
on public.tbl_tms_cherrybro_rate_rules
for all
to service_role
using (true)
with check (true);

comment on table public.tbl_tms_cherrybro_excel_files is '업로드된 체리부로 용차 엑셀 파일 원본 메타데이터';
comment on table public.tbl_tms_cherrybro_excel_rows is '체리부로 용차 엑셀의 원본 행과 정규화 필드를 함께 보존하는 저장소';
comment on table public.tbl_tms_cherrybro_grouping_runs is '날짜별 grouping 실행 단위';
comment on table public.tbl_tms_cherrybro_grouping_rows is '기사/차량/일자 기준 묶음 후보';
comment on table public.tbl_tms_cherrybro_grouping_row_details is '묶음 후보에 붙는 원천 상세 행';
comment on table public.tbl_tms_cherrybro_settlement_runs is '정산 등록/검토용 실행 단위';
comment on table public.tbl_tms_cherrybro_settlement_rows is '정산 등록용 확정 후보';
comment on table public.tbl_tms_cherrybro_driver_aliases is '기사명/전화번호 별칭 매핑';
comment on table public.tbl_tms_cherrybro_vehicle_aliases is '차량명/차량번호 별칭 매핑';
comment on table public.tbl_tms_cherrybro_rate_rules is '체리부로 수당/운임 규칙 마스터';
comment on view public.tbl_tms_cherrybro_grouping_page_v1 is '현재 /cherry_tms/grouping 페이지에서 바로 읽을 수 있는 조회용 view';

commit;
