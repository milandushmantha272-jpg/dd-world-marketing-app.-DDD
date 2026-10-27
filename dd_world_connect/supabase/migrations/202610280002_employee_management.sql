-- DD WORLD CONNECT Employee Management Module.
-- Canonical employee identity and operational status remain in public.users.
-- Private profile, status/transfer history and approval workflow are normalized here.
create extension if not exists pgcrypto;

create table if not exists public.employee_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  nic text,
  address text,
  date_of_birth date,
  join_date date,
  profile_photo_url text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.users(id) on delete set null,
  constraint employee_profiles_nic_format check (nic is null or length(trim(nic)) between 8 and 20)
);

create unique index if not exists employee_profiles_nic_normalized_uidx
  on public.employee_profiles (upper(regexp_replace(nic, '[^A-Za-z0-9]', '', 'g')))
  where nic is not null and length(trim(nic)) > 0;
create index if not exists employee_profiles_dob_idx on public.employee_profiles(date_of_birth);
create index if not exists employee_profiles_join_date_idx on public.employee_profiles(join_date);

create table if not exists public.employee_status_history (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.users(id) on delete restrict,
  previous_status text,
  new_status text not null check (new_status in ('ACTIVE','SUSPENDED','BLACKLISTED','RESIGNED')),
  reason text not null check (length(trim(reason)) >= 3),
  changed_by uuid references public.users(id) on delete set null,
  changed_at timestamptz not null default now()
);
create index if not exists employee_status_history_employee_date_idx
  on public.employee_status_history(employee_id, changed_at desc);

create table if not exists public.employee_transfer_history (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.users(id) on delete restrict,
  previous_team_id uuid references public.teams(id) on delete set null,
  new_team_id uuid references public.teams(id) on delete set null,
  previous_reports_to_user_id uuid references public.users(id) on delete set null,
  new_reports_to_user_id uuid references public.users(id) on delete set null,
  reason text not null check (length(trim(reason)) >= 3),
  transferred_by uuid references public.users(id) on delete set null,
  transferred_at timestamptz not null default now()
);
create index if not exists employee_transfer_history_employee_date_idx
  on public.employee_transfer_history(employee_id, transferred_at desc);
create index if not exists employee_transfer_history_team_date_idx
  on public.employee_transfer_history(new_team_id, transferred_at desc);

create table if not exists public.employee_approval_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.users(id) on delete cascade,
  requested_by uuid references public.users(id) on delete set null,
  reviewed_by uuid references public.users(id) on delete set null,
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
  request_payload jsonb not null default '{}'::jsonb,
  review_reason text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists employee_approval_requests_status_date_idx
  on public.employee_approval_requests(status, created_at desc);
create index if not exists employee_approval_requests_employee_idx
  on public.employee_approval_requests(employee_id, created_at desc);

-- Normalize legacy employment values without changing the employee's role/team.
-- Preserve original legacy values in history before changing status.
insert into public.employee_status_history(employee_id, previous_status, new_status, reason)
select u.id, coalesce(u.employment_status, u.status, 'UNKNOWN'),
       case
         when upper(coalesce(u.employment_status,'')) = 'BLACKLISTED' then 'BLACKLISTED'
         when upper(coalesce(u.employment_status,'')) = 'SUSPENDED' then 'SUSPENDED'
         when upper(coalesce(u.employment_status,'')) = 'RESIGNED' then 'RESIGNED'
         else 'ACTIVE'
       end,
       'Initial status history captured during Employee Management rollout'
from public.users u
where not exists (select 1 from public.employee_status_history h where h.employee_id=u.id);

insert into public.employee_profiles(user_id, join_date)
select u.id, coalesce(u.created_at::date, current_date)
from public.users u
on conflict(user_id) do nothing;

-- Employee audit event trigger captures source-record changes; sensitive values such as
-- phone and NIC are never copied into the audit payload.
create or replace function public.dd_connect_employee_audit_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid;
  old_status text;
  new_status text;
begin
  actor_id := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  if tg_op = 'UPDATE' then
    old_status := upper(coalesce(old.employment_status, old.status, ''));
    new_status := upper(coalesce(new.employment_status, new.status, ''));
    if old.team_id is distinct from new.team_id or old.reports_to_user_id is distinct from new.reports_to_user_id then
      insert into public.employee_transfer_history(
        employee_id, previous_team_id, new_team_id, previous_reports_to_user_id,
        new_reports_to_user_id, reason, transferred_by
      ) values (
        new.id, old.team_id, new.team_id, old.reports_to_user_id,
        new.reports_to_user_id, 'Recorded automatically from employee record change',
        actor_id
      );
    end if;
    if old_status is distinct from new_status then
      insert into public.employee_status_history(employee_id, previous_status, new_status, reason, changed_by)
      values (
        new.id, old_status,
        case when new_status in ('SUSPENDED','BLACKLISTED','RESIGNED') then new_status else 'ACTIVE' end,
        'Recorded automatically from employee record change', actor_id
      );
    end if;
    return new;
  elsif tg_op = 'INSERT' then
    insert into public.employee_status_history(employee_id, previous_status, new_status, reason, changed_by)
    values (
      new.id, null,
      case when upper(coalesce(new.employment_status,'')) in ('SUSPENDED','BLACKLISTED','RESIGNED')
           then upper(new.employment_status) else 'ACTIVE' end,
      'Employee created', actor_id
    );
    return new;
  end if;
  return new;
end;
$$;
revoke all on function public.dd_connect_employee_audit_trigger() from public, anon, authenticated;
drop trigger if exists dd_connect_employee_audit on public.users;
create trigger dd_connect_employee_audit
after insert or update of team_id, reports_to_user_id, status, employment_status on public.users
for each row execute function public.dd_connect_employee_audit_trigger();

alter table public.employee_profiles enable row level security;
alter table public.employee_status_history enable row level security;
alter table public.employee_transfer_history enable row level security;
alter table public.employee_approval_requests enable row level security;

-- Helper predicates use the existing canonical users/auth link and are scoped to
-- the caller. They do not trust user-editable JWT metadata.
create or replace function public.dd_connect_my_role()
returns text
language sql stable security definer
set search_path = ''
as $$
  select lower(u.role)
  from public.users u
  where u.auth_user_id = (select auth.uid())
    and lower(coalesce(u.status,'')) = 'active'
    and upper(coalesce(u.employment_status,'')) = 'ACTIVE'
    and upper(coalesce(u.id_approval_status,'')) = 'APPROVED'
  limit 1
$$;
revoke all on function public.dd_connect_my_role() from public, anon;
grant execute on function public.dd_connect_my_role() to authenticated;

create or replace function public.dd_connect_can_view_employee(target_employee_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.users me
    join public.users target on target.id = target_employee_id
    where me.auth_user_id = (select auth.uid())
      and lower(coalesce(me.status,'')) = 'active'
      and upper(coalesce(me.employment_status,'')) = 'ACTIVE'
      and upper(coalesce(me.id_approval_status,'')) = 'APPROVED'
      and (
        lower(me.role) = 'owner'
        or me.id = target.id
        or (lower(me.role) = 'team_leader' and target.team_id in (
          select t.id from public.teams t where t.leader_id = me.id
        ))
      )
  )
$$;
revoke all on function public.dd_connect_can_view_employee(uuid) from public, anon;
grant execute on function public.dd_connect_can_view_employee(uuid) to authenticated;

create or replace function public.dd_connect_is_owner()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.users u
    where u.auth_user_id = (select auth.uid())
      and lower(u.role) = 'owner'
      and lower(coalesce(u.status,'')) = 'active'
      and upper(coalesce(u.employment_status,'')) = 'ACTIVE'
      and upper(coalesce(u.id_approval_status,'')) = 'APPROVED'
  )
$$;
revoke all on function public.dd_connect_is_owner() from public, anon;
grant execute on function public.dd_connect_is_owner() to authenticated;

drop policy if exists employee_profiles_select_authorized on public.employee_profiles;
create policy employee_profiles_select_authorized on public.employee_profiles
for select to authenticated using (public.dd_connect_can_view_employee(user_id));
drop policy if exists employee_profiles_owner_insert on public.employee_profiles;
create policy employee_profiles_owner_insert on public.employee_profiles
for insert to authenticated with check (public.dd_connect_is_owner());
drop policy if exists employee_profiles_owner_update on public.employee_profiles;
create policy employee_profiles_owner_update on public.employee_profiles
for update to authenticated using (public.dd_connect_is_owner()) with check (public.dd_connect_is_owner());

drop policy if exists employee_status_history_select_authorized on public.employee_status_history;
create policy employee_status_history_select_authorized on public.employee_status_history
for select to authenticated using (public.dd_connect_can_view_employee(employee_id));
drop policy if exists employee_status_history_owner_insert on public.employee_status_history;
create policy employee_status_history_owner_insert on public.employee_status_history
for insert to authenticated with check (public.dd_connect_is_owner());

drop policy if exists employee_transfer_history_select_authorized on public.employee_transfer_history;
create policy employee_transfer_history_select_authorized on public.employee_transfer_history
for select to authenticated using (public.dd_connect_can_view_employee(employee_id));
drop policy if exists employee_transfer_history_owner_insert on public.employee_transfer_history;
create policy employee_transfer_history_owner_insert on public.employee_transfer_history
for insert to authenticated with check (public.dd_connect_is_owner());

drop policy if exists employee_approval_requests_select_authorized on public.employee_approval_requests;
create policy employee_approval_requests_select_authorized on public.employee_approval_requests
for select to authenticated using (public.dd_connect_can_view_employee(employee_id));
drop policy if exists employee_approval_requests_owner_insert on public.employee_approval_requests;
create policy employee_approval_requests_owner_insert on public.employee_approval_requests
for insert to authenticated with check (public.dd_connect_is_owner());
drop policy if exists employee_approval_requests_owner_update on public.employee_approval_requests;
create policy employee_approval_requests_owner_update on public.employee_approval_requests
for update to authenticated using (public.dd_connect_is_owner()) with check (public.dd_connect_is_owner());

-- Profile photos are stored under <employee UUID>/... . Upload and mutation are
-- Owner-only; reads are restricted to Owner, the employee, or their Team Leader.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('employee-profile-photos','employee-profile-photos',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false, file_size_limit=5242880, allowed_mime_types=array['image/jpeg','image/png','image/webp'];

drop policy if exists employee_photo_owner_upload on storage.objects;
create policy employee_photo_owner_upload on storage.objects
for insert to authenticated with check (bucket_id='employee-profile-photos' and public.dd_connect_is_owner());
drop policy if exists employee_photo_owner_update on storage.objects;
create policy employee_photo_owner_update on storage.objects
for update to authenticated using (bucket_id='employee-profile-photos' and public.dd_connect_is_owner())
with check (bucket_id='employee-profile-photos' and public.dd_connect_is_owner());
drop policy if exists employee_photo_owner_delete on storage.objects;
create policy employee_photo_owner_delete on storage.objects
for delete to authenticated using (bucket_id='employee-profile-photos' and public.dd_connect_is_owner());
drop policy if exists employee_photo_read_authorized on storage.objects;
create policy employee_photo_read_authorized on storage.objects
for select to authenticated using (
  bucket_id='employee-profile-photos' and (
    public.dd_connect_is_owner()
    or exists (
      select 1 from public.users target
      where target.id::text = split_part(storage.objects.name,'/',1)
        and public.dd_connect_can_view_employee(target.id)
    )
  )
);

grant select, insert, update on public.employee_profiles to authenticated;
grant select, insert on public.employee_status_history to authenticated;
grant select, insert on public.employee_transfer_history to authenticated;
grant select, insert, update on public.employee_approval_requests to authenticated;
