-- DD WORLD CONNECT Attendance and GPS. Extend existing attendance without replacing it.
alter table public.attendance
  add column if not exists team_id uuid references public.teams(id) on delete set null,
  add column if not exists check_in_latitude double precision,
  add column if not exists check_in_longitude double precision,
  add column if not exists check_out_latitude double precision,
  add column if not exists check_out_longitude double precision,
  add column if not exists check_in_accuracy_m double precision,
  add column if not exists check_out_accuracy_m double precision,
  add column if not exists notes text,
  add column if not exists updated_at timestamptz not null default now();

-- Existing duplicates are preserved; enforce one row per employee/day only when data
-- is clean. If legacy duplicates exist, the migration fails rather than deleting history.
create unique index if not exists attendance_user_date_unique_idx
  on public.attendance(user_id, date) where user_id is not null;
create index if not exists attendance_team_date_idx on public.attendance(team_id,date desc);
create index if not exists attendance_date_status_idx on public.attendance(date,status);

create table if not exists public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  attendance_id uuid not null references public.attendance(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete restrict,
  event_type text not null check (event_type in ('CHECK_IN','CHECK_OUT','STATUS_CHANGED','NOTE_ADDED')),
  occurred_at timestamptz not null default now(),
  latitude double precision,
  longitude double precision,
  accuracy_m double precision,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists attendance_logs_user_time_idx on public.attendance_logs(user_id,occurred_at desc);
create index if not exists attendance_logs_attendance_time_idx on public.attendance_logs(attendance_id,occurred_at desc);

create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  team_id uuid references public.teams(id) on delete set null,
  leave_type text not null check (leave_type in ('LEAVE','HALF_DAY')),
  start_date date not null,
  end_date date not null,
  reason text not null,
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED','CANCELLED')),
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leave_dates_valid check (end_date >= start_date),
  constraint leave_reason_nonempty check (length(btrim(reason)) >= 3)
);
create index if not exists leave_requests_user_dates_idx on public.leave_requests(user_id,start_date desc);
create index if not exists leave_requests_team_status_idx on public.leave_requests(team_id,status,start_date);

alter table public.attendance enable row level security;
alter table public.attendance_logs enable row level security;
alter table public.leave_requests enable row level security;

-- Remove legacy broad write policies before installing narrower attendance writes.
drop policy if exists attendance_employee_insert on public.attendance;
drop policy if exists attendance_employee_update on public.attendance;
drop policy if exists attendance_owner_delete on public.attendance;

create policy attendance_insert_self_or_owner on public.attendance
for insert to authenticated
with check (
  is_owner() or (
    is_active_employee()
    and user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  )
);
create policy attendance_update_self_or_owner on public.attendance
for update to authenticated
using (
  is_owner() or (
    is_active_employee()
    and user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  )
)
with check (
  is_owner() or (
    is_active_employee()
    and user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  )
);
create policy attendance_delete_owner_only on public.attendance
for delete to authenticated using (is_owner());

drop policy if exists attendance_logs_read_scoped on public.attendance_logs;
create policy attendance_logs_read_scoped on public.attendance_logs
for select to authenticated
using (
  is_owner()
  or user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  or exists (
    select 1 from public.users target
    where target.id = attendance_logs.user_id
      and target.team_id is not null
      and dd_connect_private.can_view_team(target.team_id)
  )
);
create policy attendance_logs_insert_self on public.attendance_logs
for insert to authenticated
with check (
  is_active_employee()
  and user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  and exists (select 1 from public.attendance a where a.id = attendance_logs.attendance_id and a.user_id = attendance_logs.user_id)
);

drop policy if exists leave_requests_read_scoped on public.leave_requests;
create policy leave_requests_read_scoped on public.leave_requests
for select to authenticated
using (
  is_owner()
  or user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
  or (team_id is not null and dd_connect_private.can_view_team(team_id))
);
create policy leave_requests_insert_self on public.leave_requests
for insert to authenticated
with check (
  is_active_employee()
  and user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1)
);
create policy leave_requests_update_owner_or_team_leader on public.leave_requests
for update to authenticated
using (
  is_owner()
  or (team_id is not null and dd_connect_private.can_view_team(team_id))
  or (user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1) and status = 'PENDING')
)
with check (
  is_owner()
  or (team_id is not null and dd_connect_private.can_view_team(team_id))
  or (user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()) limit 1) and status in ('PENDING','CANCELLED')
);
