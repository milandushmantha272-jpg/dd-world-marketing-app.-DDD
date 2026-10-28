-- DD WORLD CONNECT Team Management. Extend the existing canonical public.teams table;
-- public.users.team_id remains the compatibility source used by sales and attendance.
alter table public.teams
  add column if not exists team_code text,
  add column if not exists status text not null default 'ACTIVE',
  add column if not exists description text;

update public.teams
set team_code = upper(regexp_replace(coalesce(name,'TEAM'), '[^A-Za-z0-9]+', '-', 'g'))
where team_code is null or btrim(team_code) = '';

alter table public.teams
  alter column team_code set not null;
alter table public.teams
  add constraint teams_status_check check (status in ('ACTIVE','INACTIVE','ARCHIVED'));
create unique index if not exists teams_team_code_unique_idx
  on public.teams (upper(btrim(team_code)));
create index if not exists teams_status_name_idx on public.teams(status, name);
create index if not exists teams_leader_id_idx on public.teams(leader_id) where leader_id is not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname='teams_leader_id_fkey' and conrelid='public.teams'::regclass) then
    alter table public.teams add constraint teams_leader_id_fkey
      foreign key (leader_id) references public.users(id) on delete set null not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname='users_team_id_fkey' and conrelid='public.users'::regclass) then
    alter table public.users add constraint users_team_id_fkey
      foreign key (team_id) references public.teams(id) on delete set null not valid;
  end if;
end $$;

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete restrict,
  user_id uuid not null references public.users(id) on delete restrict,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  assigned_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint team_members_dates_check check (left_at is null or left_at >= joined_at)
);
create unique index if not exists team_members_one_current_team_per_user_idx
  on public.team_members(user_id) where left_at is null;
create index if not exists team_members_team_current_idx
  on public.team_members(team_id, user_id) where left_at is null;
create index if not exists team_members_user_history_idx
  on public.team_members(user_id, joined_at desc);

create table if not exists public.team_transfer_history (
  id uuid primary key default gen_random_uuid(),
  team_member_id uuid references public.team_members(id) on delete set null,
  employee_id uuid not null references public.users(id) on delete restrict,
  previous_team_id uuid references public.teams(id) on delete set null,
  new_team_id uuid references public.teams(id) on delete set null,
  reason text not null check (char_length(btrim(reason)) >= 3),
  transferred_by uuid references public.users(id) on delete set null,
  transferred_at timestamptz not null default now()
);
create index if not exists team_transfer_history_employee_idx on public.team_transfer_history(employee_id, transferred_at desc);
create index if not exists team_transfer_history_previous_team_idx on public.team_transfer_history(previous_team_id, transferred_at desc);
create index if not exists team_transfer_history_new_team_idx on public.team_transfer_history(new_team_id, transferred_at desc);
create index if not exists team_transfer_history_actor_idx on public.team_transfer_history(transferred_by) where transferred_by is not null;

create table if not exists public.team_leader_history (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete restrict,
  previous_leader_id uuid references public.users(id) on delete set null,
  new_leader_id uuid references public.users(id) on delete set null,
  reason text not null default 'Team leader assignment changed' check (char_length(btrim(reason)) >= 3),
  changed_by uuid references public.users(id) on delete set null,
  changed_at timestamptz not null default now()
);
create index if not exists team_leader_history_team_idx on public.team_leader_history(team_id, changed_at desc);
create index if not exists team_leader_history_actor_idx on public.team_leader_history(changed_by) where changed_by is not null;

create table if not exists public.team_audit_logs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete set null,
  actor_user_id uuid references public.users(id) on delete set null,
  event_type text not null check (char_length(btrim(event_type)) >= 3),
  target_user_id uuid references public.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists team_audit_logs_team_created_idx on public.team_audit_logs(team_id, created_at desc);
create index if not exists team_audit_logs_actor_idx on public.team_audit_logs(actor_user_id, created_at desc);

create or replace function dd_connect_private.can_view_team(target_team_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.users me
    where me.auth_user_id=(select auth.uid())
      and lower(coalesce(me.status,''))='active'
      and upper(coalesce(me.employment_status,''))='ACTIVE'
      and upper(coalesce(me.id_approval_status,''))='APPROVED'
      and (
        lower(me.role)='owner'
        or exists (
          select 1 from public.teams t
          where t.id=target_team_id and (
            (lower(me.role)='team_leader' and t.leader_id=me.id)
            or (lower(me.role) in ('agent','junior_team_leader') and me.team_id=t.id)
          )
        )
      )
  )
$$;
create or replace function dd_connect_private.current_employee_id()
returns uuid language sql stable security definer set search_path = ''
as $$
  select u.id from public.users u
  where u.auth_user_id=(select auth.uid())
    and lower(coalesce(u.status,''))='active'
    and upper(coalesce(u.employment_status,''))='ACTIVE'
    and upper(coalesce(u.id_approval_status,''))='APPROVED'
  limit 1
$$;
revoke all on function dd_connect_private.can_view_team(uuid) from public, anon;
revoke all on function dd_connect_private.current_employee_id() from public, anon;
grant execute on function dd_connect_private.can_view_team(uuid) to authenticated;
grant execute on function dd_connect_private.current_employee_id() to authenticated;

-- Keep the historical membership ledger synchronized with canonical users.team_id.
create or replace function dd_connect_private.sync_team_membership()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare actor_id uuid;
begin
  actor_id := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  if tg_op='INSERT' then
    if new.team_id is not null then
      insert into public.team_members(team_id,user_id,assigned_by)
      values(new.team_id,new.id,actor_id)
      on conflict do nothing;
    end if;
    return new;
  end if;
  if old.team_id is distinct from new.team_id then
    update public.team_members set left_at=now()
      where user_id=new.id and left_at is null;
    if new.team_id is not null then
      insert into public.team_members(team_id,user_id,assigned_by)
      values(new.team_id,new.id,actor_id);
    end if;
    insert into public.team_transfer_history(employee_id,previous_team_id,new_team_id,reason,transferred_by)
    values(new.id,old.team_id,new.team_id,'Team assignment changed on employee record',actor_id);
    insert into public.team_audit_logs(team_id,actor_user_id,event_type,target_user_id,metadata)
    values(new.team_id,actor_id,'EMPLOYEE_TEAM_TRANSFER',new.id,
      jsonb_build_object('previous_team_id',old.team_id,'new_team_id',new.team_id));
  end if;
  return new;
end $$;
revoke all on function dd_connect_private.sync_team_membership() from public, anon, authenticated;
drop trigger if exists dd_connect_team_membership_sync on public.users;
create trigger dd_connect_team_membership_sync
after insert or update of team_id on public.users
for each row execute function dd_connect_private.sync_team_membership();

-- Backfill current team memberships without duplicating the existing rows.
insert into public.team_members(team_id,user_id,joined_at)
select u.team_id,u.id,coalesce(u.created_at,now())
from public.users u
where u.team_id is not null
  and not exists (select 1 from public.team_members m where m.user_id=u.id and m.left_at is null);

create or replace function dd_connect_private.audit_team_changes()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare actor_id uuid;
begin
  actor_id := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  if tg_op='INSERT' then
    insert into public.team_audit_logs(team_id,actor_user_id,event_type,metadata)
    values(new.id,actor_id,'TEAM_CREATED',jsonb_build_object('team_code',new.team_code,'name',new.name,'status',new.status));
    return new;
  end if;
  if old.leader_id is distinct from new.leader_id then
    insert into public.team_leader_history(team_id,previous_leader_id,new_leader_id,changed_by)
    values(new.id,old.leader_id,new.leader_id,coalesce(nullif(current_setting('dd_connect.team_leader_reason',true),''),'Team leader assignment changed'),actor_id);
    insert into public.team_audit_logs(team_id,actor_user_id,event_type,target_user_id,metadata)
    values(new.id,actor_id,'TEAM_LEADER_CHANGED',new.leader_id,
      jsonb_build_object('previous_leader_id',old.leader_id,'new_leader_id',new.leader_id));
  end if;
  if old.name is distinct from new.name or old.team_code is distinct from new.team_code
     or old.status is distinct from new.status or old.description is distinct from new.description then
    insert into public.team_audit_logs(team_id,actor_user_id,event_type,metadata)
    values(new.id,actor_id,'TEAM_UPDATED',
      jsonb_build_object('old_name',old.name,'new_name',new.name,'old_status',old.status,'new_status',new.status));
  end if;
  return new;
end $$;
revoke all on function dd_connect_private.audit_team_changes() from public, anon, authenticated;
drop trigger if exists dd_connect_team_audit on public.teams;
create trigger dd_connect_team_audit after insert or update of name,team_code,status,description,leader_id
on public.teams for each row execute function dd_connect_private.audit_team_changes();

-- Owner-only transactional leader appointment/removal. No client can self-appoint.
create or replace function public.owner_set_team_leader(
  p_team_id uuid, p_leader_id uuid, p_reason text default 'Team leader assignment changed'
) returns void language plpgsql security definer set search_path = ''
as $$
declare actor_id uuid; previous_id uuid;
begin
  actor_id := dd_connect_private.current_employee_id();
  if actor_id is null or not dd_connect_private.is_owner() then
    raise exception 'Only an active, approved Owner can appoint or remove a Team Leader' using errcode='42501';
  end if;
  if char_length(btrim(coalesce(p_reason,''))) < 3 then
    raise exception 'Please provide a reason of at least 3 characters';
  end if;
  select leader_id into previous_id from public.teams where id=p_team_id for update;
  if not found then raise exception 'Team not found'; end if;
  if p_leader_id is not null and not exists (
    select 1 from public.users u
    where u.id=p_leader_id and lower(u.role) in ('team_leader','agent')
      and lower(coalesce(u.status,''))='active'
      and upper(coalesce(u.employment_status,''))='ACTIVE'
      and upper(coalesce(u.id_approval_status,''))='APPROVED'
  ) then raise exception 'Selected employee must be active and approved'; end if;
  if p_leader_id is not null and exists (
    select 1 from public.teams t where t.leader_id=p_leader_id and t.id<>p_team_id
  ) then raise exception 'This employee already leads another team'; end if;

  perform set_config('dd_connect.team_leader_reason',btrim(p_reason),true);
  update public.teams set leader_id=p_leader_id where id=p_team_id;
  if previous_id is not null and previous_id is distinct from p_leader_id then
    update public.users set role='agent'
      where id=previous_id and lower(role)='team_leader' and team_id=p_team_id;
  end if;
  if p_leader_id is not null then
    update public.users set role='team_leader',team_id=p_team_id
      where id=p_leader_id;
  end if;
  insert into public.team_audit_logs(team_id,actor_user_id,event_type,target_user_id,metadata)
  values(p_team_id,actor_id,case when p_leader_id is null then 'TEAM_LEADER_REMOVED' else 'TEAM_LEADER_APPOINTED' end,
    p_leader_id,jsonb_build_object('previous_leader_id',previous_id,'new_leader_id',p_leader_id,'reason',btrim(p_reason)));
end $$;
revoke all on function public.owner_set_team_leader(uuid,uuid,text) from public, anon;
grant execute on function public.owner_set_team_leader(uuid,uuid,text) to authenticated;

-- Replace legacy team policies with explicit active/approved role scoping.
drop policy if exists teams_select on public.teams;
drop policy if exists teams_insert on public.teams;
drop policy if exists teams_update on public.teams;
drop policy if exists teams_delete on public.teams;
create policy teams_select_authorized on public.teams for select to authenticated
using (dd_connect_private.can_view_team(id));
create policy teams_owner_insert on public.teams for insert to authenticated
with check (dd_connect_private.is_owner());
create policy teams_owner_update on public.teams for update to authenticated
using (dd_connect_private.is_owner()) with check (dd_connect_private.is_owner());
create policy teams_owner_delete on public.teams for delete to authenticated
using (dd_connect_private.is_owner());

alter table public.team_members enable row level security;
alter table public.team_transfer_history enable row level security;
alter table public.team_leader_history enable row level security;
alter table public.team_audit_logs enable row level security;

create policy team_members_select_scoped on public.team_members for select to authenticated
using (dd_connect_private.can_view_team(team_id) or user_id=dd_connect_private.current_employee_id());
create policy team_members_owner_insert on public.team_members for insert to authenticated
with check (dd_connect_private.is_owner());
create policy team_members_owner_update on public.team_members for update to authenticated
using (dd_connect_private.is_owner()) with check (dd_connect_private.is_owner());
create policy team_members_owner_delete on public.team_members for delete to authenticated
using (dd_connect_private.is_owner());

create policy team_transfer_history_select_scoped on public.team_transfer_history for select to authenticated
using (dd_connect_private.is_owner() or dd_connect_private.can_view_team(previous_team_id) or dd_connect_private.can_view_team(new_team_id)
  or employee_id=dd_connect_private.current_employee_id());
create policy team_transfer_history_owner_insert on public.team_transfer_history for insert to authenticated
with check (dd_connect_private.is_owner());

create policy team_leader_history_select_scoped on public.team_leader_history for select to authenticated
using (dd_connect_private.can_view_team(team_id));
create policy team_leader_history_owner_insert on public.team_leader_history for insert to authenticated
with check (dd_connect_private.is_owner());

create policy team_audit_logs_select_scoped on public.team_audit_logs for select to authenticated
using (dd_connect_private.can_view_team(team_id) or (team_id is null and dd_connect_private.is_owner()));
create policy team_audit_logs_owner_insert on public.team_audit_logs for insert to authenticated
with check (dd_connect_private.is_owner());

grant select, insert, update, delete on public.teams to authenticated;
grant select, insert, update, delete on public.team_members to authenticated;
grant select, insert on public.team_transfer_history to authenticated;
grant select, insert on public.team_leader_history to authenticated;
grant select, insert on public.team_audit_logs to authenticated;
