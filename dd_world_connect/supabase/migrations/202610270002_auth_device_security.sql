-- DD WORLD CONNECT authentication and single-active-device enforcement.
-- Run only after 202610270001_initial_schema.sql.
alter table public.employees
  add column if not exists approved boolean not null default false;

comment on column public.employees.approved is
  'Owner-controlled employee approval. OTP authentication alone never grants ERP access.';

-- Keep status canonical as the existing enum value 'active' (UI label: ACTIVE).
-- One employee can have at most one active device registration at a time.
create unique index if not exists device_registrations_one_active_per_employee
  on public.device_registrations(employee_id)
  where status = 'active';

create index if not exists employees_auth_user_id_idx
  on public.employees(auth_user_id)
  where auth_user_id is not null;

-- Auth/bootstrap and device reset are performed only by Edge Functions using
-- service-role access after validating the caller's Supabase Auth JWT.
-- No client-facing policies are added to employees/device_registrations/audit_logs.
-- RLS remains enabled; direct client reads/writes remain denied by default.
