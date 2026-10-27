-- DD WORLD CONNECT initial schema foundation.
-- Apply to a development Supabase project first. RLS is enabled on all exposed tables.
create extension if not exists pgcrypto;

create type public.employee_role as enum ('owner', 'team_leader', 'agent', 'direct_agent');
create type public.employee_status as enum ('pending', 'active', 'suspended', 'rejected', 'deactivated');
create type public.activation_product as enum ('sayuru', 'govimithuru');
create type public.activation_channel as enum ('app', 'ivr');
create type public.review_status as enum ('pending', 'approved', 'rejected', 'disputed');

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  employee_code text not null unique,
  full_name text not null,
  phone_e164 text not null unique,
  status public.employee_status not null default 'pending',
  employment_status text not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employees_code_nonempty check (length(trim(employee_code)) > 0),
  constraint employees_name_nonempty check (length(trim(full_name)) > 0)
);

create table public.role_assignments (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete restrict,
  role public.employee_role not null,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  assigned_by uuid references public.employees(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint role_assignment_dates check (valid_until is null or valid_until > valid_from)
);
create index role_assignments_current_idx on public.role_assignments(employee_id, valid_from desc)
  where valid_until is null;

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  team_leader_id uuid references public.employees(id) on delete restrict,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now()
);

create table public.team_memberships (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete restrict,
  employee_id uuid not null references public.employees(id) on delete restrict,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  created_by uuid references public.employees(id) on delete set null,
  constraint membership_dates check (valid_until is null or valid_until > valid_from)
);
create index team_memberships_current_employee_idx on public.team_memberships(employee_id, team_id)
  where valid_until is null;
create index team_memberships_current_team_idx on public.team_memberships(team_id, employee_id)
  where valid_until is null;

create table public.device_registrations (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete restrict,
  device_id_hash text not null,
  platform text not null check (platform in ('android','ios','other')),
  status text not null default 'pending' check (status in ('pending','active','revoked','rejected')),
  registered_at timestamptz not null default now(),
  last_seen_at timestamptz,
  revoked_at timestamptz,
  approved_by uuid references public.employees(id) on delete set null,
  unique(employee_id, device_id_hash)
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete restrict,
  check_in_at timestamptz not null default now(),
  check_out_at timestamptz,
  check_in_latitude double precision,
  check_in_longitude double precision,
  check_in_accuracy_m double precision,
  check_out_latitude double precision,
  check_out_longitude double precision,
  check_out_accuracy_m double precision,
  status public.review_status not null default 'pending',
  reviewed_by uuid references public.employees(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  constraint attendance_checkout_after_checkin check (check_out_at is null or check_out_at >= check_in_at),
  constraint attendance_checkin_lat check (check_in_latitude is null or check_in_latitude between -90 and 90),
  constraint attendance_checkin_lng check (check_in_longitude is null or check_in_longitude between -180 and 180),
  constraint attendance_checkout_lat check (check_out_latitude is null or check_out_latitude between -90 and 90),
  constraint attendance_checkout_lng check (check_out_longitude is null or check_out_longitude between -180 and 180),
  constraint attendance_accuracy_nonnegative check (
    (check_in_accuracy_m is null or check_in_accuracy_m >= 0) and
    (check_out_accuracy_m is null or check_out_accuracy_m >= 0)
  )
);
create index attendance_employee_checkin_idx on public.attendance_records(employee_id, check_in_at desc);

create table public.activation_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete restrict,
  product public.activation_product not null,
  channel public.activation_channel not null,
  provider_reference text not null,
  quantity integer not null default 1 check (quantity > 0),
  status public.review_status not null default 'pending',
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references public.employees(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  constraint activation_reference_nonempty check (length(trim(provider_reference)) > 0),
  unique(product, channel, provider_reference)
);
create index activation_employee_date_idx on public.activation_records(employee_id, submitted_at desc);
create index activation_status_date_idx on public.activation_records(status, submitted_at desc);

create table public.commission_rules (
  id uuid primary key default gen_random_uuid(),
  product public.activation_product not null,
  channel public.activation_channel,
  rate_amount numeric(12,2) not null check (rate_amount >= 0),
  currency char(3) not null default 'LKR',
  calculation_method text not null default 'per_activation' check (calculation_method in ('per_activation','per_unit')),
  effective_from timestamptz not null,
  effective_until timestamptz,
  created_by uuid references public.employees(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint commission_rule_dates check (effective_until is null or effective_until > effective_from)
);

create table public.commission_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete restrict,
  activation_id uuid not null unique references public.activation_records(id) on delete restrict,
  commission_rule_id uuid references public.commission_rules(id) on delete restrict,
  rate_snapshot numeric(12,2) not null check (rate_snapshot >= 0),
  quantity_snapshot integer not null check (quantity_snapshot > 0),
  amount numeric(12,2) not null check (amount >= 0),
  currency char(3) not null default 'LKR',
  status text not null default 'pending' check (status in ('pending','approved','paid','reversed','disputed')),
  approved_by uuid references public.employees(id) on delete set null,
  approved_at timestamptz,
  paid_at timestamptz,
  payout_reference text,
  created_at timestamptz not null default now()
);
create index commissions_employee_created_idx on public.commission_records(employee_id, created_at desc);

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  organizer_id uuid not null references public.employees(id) on delete restrict,
  team_id uuid references public.teams(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location_label text,
  created_at timestamptz not null default now(),
  constraint meeting_dates check (ends_at is null or ends_at > starts_at)
);

create table public.meeting_attendance (
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete restrict,
  attendance_status text not null default 'invited' check (attendance_status in ('invited','attended','absent','excused')),
  marked_at timestamptz,
  primary key(meeting_id, employee_id)
);

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.employees(id) on delete restrict,
  assigned_to uuid references public.employees(id) on delete set null,
  category text not null,
  description text not null,
  status text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  resolution_note text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.employees(id) on delete cascade,
  title text not null,
  body text not null,
  category text not null default 'general',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_recipient_created_idx on public.notifications(recipient_id, created_at desc);

create table public.notification_devices (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  fcm_token text not null unique,
  platform text not null check (platform in ('android','ios','other')),
  active boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_employee_id uuid references public.employees(id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id text,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_created_idx on public.audit_logs(created_at desc);
create index audit_logs_actor_idx on public.audit_logs(actor_employee_id, created_at desc);

-- Defense-in-depth: enable RLS immediately. Policies and controlled RPC/Edge Function
-- transitions must be added and tested before exposing operational CRUD to clients.
alter table public.employees enable row level security;
alter table public.role_assignments enable row level security;
alter table public.teams enable row level security;
alter table public.team_memberships enable row level security;
alter table public.device_registrations enable row level security;
alter table public.attendance_records enable row level security;
alter table public.activation_records enable row level security;
alter table public.commission_rules enable row level security;
alter table public.commission_records enable row level security;
alter table public.meetings enable row level security;
alter table public.meeting_attendance enable row level security;
alter table public.complaints enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_devices enable row level security;
alter table public.audit_logs enable row level security;

-- Intentionally no broad client policies in this foundation migration. With RLS enabled
-- and no matching policies, client access is denied by default. Add narrowly-scoped,
-- reviewed policies and server-side state-transition functions before application use.
