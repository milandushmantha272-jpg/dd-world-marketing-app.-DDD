-- DD WORLD CONNECT authentication bridge for the existing DD WORLD MARKETING schema.
-- The live project already uses public.users as its employee source of truth.
-- This migration mirrors the minimal auth profile into public.employees and preserves
-- the existing users, teams, attendance, sales and commission tables.
create extension if not exists pgcrypto;
create schema if not exists dd_connect_private;
revoke all on schema dd_connect_private from public, anon, authenticated;

create table if not exists public.employees (
  id uuid primary key,
  source_user_id uuid not null unique references public.users(id) on delete restrict,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  employee_code text not null unique,
  full_name text not null,
  phone_e164 text,
  status text not null default 'pending',
  approved boolean not null default false,
  role text not null default 'unassigned'
    check (role in ('owner','team_leader','agent','direct_agent','unassigned')),
  team_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.employees is
  'DD WORLD CONNECT auth projection of the existing public.users employee source. Do not edit employee business fields directly; changes sync from public.users.';
comment on column public.employees.approved is
  'True only when source user status is active, employment_status is ACTIVE and id_approval_status is APPROVED.';
comment on column public.employees.phone_e164 is
  'Normalized verified login phone. Deliberately not unique until existing duplicate phone records are resolved; bootstrap rejects ambiguous matches.';

create index if not exists employees_phone_e164_idx on public.employees(phone_e164);
create index if not exists employees_auth_user_id_idx on public.employees(auth_user_id) where auth_user_id is not null;

create table if not exists public.device_registrations (
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
create unique index if not exists device_registrations_one_active_per_employee
  on public.device_registrations(employee_id) where status = 'active';
create index if not exists device_registrations_employee_status_idx
  on public.device_registrations(employee_id, status);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_employee_id uuid references public.employees(id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id text,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists dd_connect_audit_logs_created_idx on public.audit_logs(created_at desc);
create index if not exists dd_connect_audit_logs_actor_idx on public.audit_logs(actor_employee_id, created_at desc);

-- Mirror employee fields from the existing source table. Phone numbers currently
-- stored as Sri Lankan local 10-digit values are normalized to +94 E.164 form.
create or replace function dd_connect_private.sync_dd_world_employee()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_phone text;
  normalized_role text;
  is_approved boolean;
begin
  normalized_phone := case
    when new.phone ~ '^0[0-9]{9}$' then '+94' || pg_catalog.substr(new.phone, 2)
    when new.phone ~ '^\+[1-9][0-9]{7,14}$' then new.phone
    else null
  end;

  normalized_role := case
    when pg_catalog.lower(coalesce(new.role, '')) = 'owner' then 'owner'
    when pg_catalog.lower(coalesce(new.role, '')) = 'team_leader' then 'team_leader'
    when pg_catalog.lower(coalesce(new.role, '')) = 'direct_agent' then 'direct_agent'
    when pg_catalog.lower(coalesce(new.role, '')) = 'agent' and new.team_id is null then 'direct_agent'
    when pg_catalog.lower(coalesce(new.role, '')) = 'agent' then 'agent'
    else 'unassigned'
  end;

  is_approved :=
    pg_catalog.lower(coalesce(new.status, '')) = 'active'
    and pg_catalog.upper(coalesce(new.employment_status, '')) = 'ACTIVE'
    and pg_catalog.upper(coalesce(new.id_approval_status, '')) = 'APPROVED';

  insert into public.employees (
    id, source_user_id, auth_user_id, employee_code, full_name, phone_e164,
    status, approved, role, team_id, created_at, updated_at
  ) values (
    new.id, new.id, new.auth_user_id, new.agent_code, new.name, normalized_phone,
    pg_catalog.lower(coalesce(new.status, 'pending')), is_approved,
    normalized_role, new.team_id, coalesce(new.created_at, pg_catalog.now()), pg_catalog.now()
  )
  on conflict (id) do update set
    source_user_id = excluded.source_user_id,
    auth_user_id = excluded.auth_user_id,
    employee_code = excluded.employee_code,
    full_name = excluded.full_name,
    phone_e164 = excluded.phone_e164,
    status = excluded.status,
    approved = excluded.approved,
    role = excluded.role,
    team_id = excluded.team_id,
    updated_at = pg_catalog.now();

  return new;
end;
$$;

revoke all on function dd_connect_private.sync_dd_world_employee() from public, anon, authenticated;
drop trigger if exists sync_dd_world_employee_from_users on public.users;
create trigger sync_dd_world_employee_from_users
after insert or update on public.users
for each row execute function dd_connect_private.sync_dd_world_employee();

-- Initial backfill. Existing duplicate phone records are intentionally preserved
-- for investigation; the auth Edge Function rejects any phone matching >1 employee.
insert into public.employees (
  id, source_user_id, auth_user_id, employee_code, full_name, phone_e164,
  status, approved, role, team_id, created_at, updated_at
)
select
  u.id,
  u.id,
  u.auth_user_id,
  u.agent_code,
  u.name,
  case
    when u.phone ~ '^0[0-9]{9}$' then '+94' || pg_catalog.substr(u.phone, 2)
    when u.phone ~ '^\+[1-9][0-9]{7,14}$' then u.phone
    else null
  end,
  pg_catalog.lower(coalesce(u.status, 'pending')),
  pg_catalog.lower(coalesce(u.status, '')) = 'active'
    and pg_catalog.upper(coalesce(u.employment_status, '')) = 'ACTIVE'
    and pg_catalog.upper(coalesce(u.id_approval_status, '')) = 'APPROVED',
  case
    when pg_catalog.lower(coalesce(u.role, '')) = 'owner' then 'owner'
    when pg_catalog.lower(coalesce(u.role, '')) = 'team_leader' then 'team_leader'
    when pg_catalog.lower(coalesce(u.role, '')) = 'direct_agent' then 'direct_agent'
    when pg_catalog.lower(coalesce(u.role, '')) = 'agent' and u.team_id is null then 'direct_agent'
    when pg_catalog.lower(coalesce(u.role, '')) = 'agent' then 'agent'
    else 'unassigned'
  end,
  u.team_id,
  coalesce(u.created_at, pg_catalog.now()),
  pg_catalog.now()
from public.users u
on conflict (id) do update set
  source_user_id = excluded.source_user_id,
  auth_user_id = excluded.auth_user_id,
  employee_code = excluded.employee_code,
  full_name = excluded.full_name,
  phone_e164 = excluded.phone_e164,
  status = excluded.status,
  approved = excluded.approved,
  role = excluded.role,
  team_id = excluded.team_id,
  updated_at = pg_catalog.now();

alter table public.employees enable row level security;
alter table public.device_registrations enable row level security;
alter table public.audit_logs enable row level security;

-- No permissive client policies are created. Auth profile/device operations use
-- JWT-verified Edge Functions; business-table RLS remains a separate requirement.
