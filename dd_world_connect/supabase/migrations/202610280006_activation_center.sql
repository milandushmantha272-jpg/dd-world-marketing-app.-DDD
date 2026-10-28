-- DD WORLD CONNECT Activation Center: append-only activation records, audit log,
-- and per-day/team/type aggregates. Employee identity is the existing public.users.id.
create table if not exists public.activations (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.users(id) on delete restrict,
  team_id uuid references public.teams(id) on delete set null,
  employee_name text not null default '',
  employee_code text not null default '',
  team_name text,
  activation_type text not null check (activation_type in ('sayuru','govimithuru')),
  gps_latitude double precision not null check (gps_latitude between -90 and 90),
  gps_longitude double precision not null check (gps_longitude between -180 and 180),
  status text not null default 'recorded' check (status in ('recorded','dialer_opened','completed','failed')),
  created_at timestamptz not null default now(),
  created_by_auth_uid uuid not null default auth.uid(),
  constraint activations_no_client_timestamp check (created_at <= now() + interval '1 minute')
);
create index if not exists activations_created_at_idx on public.activations(created_at desc);
create index if not exists activations_employee_created_idx on public.activations(employee_id, created_at desc);
create index if not exists activations_team_created_idx on public.activations(team_id, created_at desc);
create index if not exists activations_type_created_idx on public.activations(activation_type, created_at desc);

create table if not exists public.activation_logs (
  id bigint generated always as identity primary key,
  activation_id uuid not null references public.activations(id) on delete restrict,
  actor_user_id uuid references public.users(id) on delete set null,
  event_type text not null check (event_type in ('recorded','dialer_launch_requested','status_changed')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists activation_logs_activation_created_idx on public.activation_logs(activation_id, created_at desc);

create table if not exists public.activation_statistics (
  id uuid primary key default gen_random_uuid(),
  statistic_date date not null,
  team_id uuid references public.teams(id) on delete cascade,
  activation_type text not null check (activation_type in ('sayuru','govimithuru')),
  activation_count bigint not null default 0 check (activation_count >= 0),
  updated_at timestamptz not null default now()
);
create unique index if not exists activation_statistics_team_unique_idx
  on public.activation_statistics(statistic_date, team_id, activation_type) where team_id is not null;
create unique index if not exists activation_statistics_direct_unique_idx
  on public.activation_statistics(statistic_date, activation_type) where team_id is null;

alter table public.activations enable row level security;
alter table public.activation_logs enable row level security;
alter table public.activation_statistics enable row level security;

create or replace function dd_connect_private.activation_actor_role()
returns text language sql stable security definer set search_path = ''
as $$
  select lower(u.role) from public.users u
  where u.auth_user_id = (select auth.uid())
    and lower(coalesce(u.status,''))='active'
    and upper(coalesce(u.employment_status,''))='ACTIVE'
    and upper(coalesce(u.id_approval_status,''))='APPROVED'
  limit 1
$$;
create or replace function dd_connect_private.activation_actor_id()
returns uuid language sql stable security definer set search_path = ''
as $$
  select u.id from public.users u
  where u.auth_user_id = (select auth.uid())
    and lower(coalesce(u.status,''))='active'
    and upper(coalesce(u.employment_status,''))='ACTIVE'
    and upper(coalesce(u.id_approval_status,''))='APPROVED'
  limit 1
$$;
create or replace function dd_connect_private.activation_can_view_team(target_team uuid)
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
       or (lower(me.role)='team_leader' and exists(select 1 from public.teams t where t.id=target_team and t.leader_id=me.id))
       or (lower(me.role)='agent' and me.team_id=target_team)
       or (lower(me.role)='direct_agent' and target_team is null)
     )
 )
$$;
revoke all on function dd_connect_private.activation_actor_role() from public, anon, authenticated;
revoke all on function dd_connect_private.activation_actor_id() from public, anon, authenticated;
revoke all on function dd_connect_private.activation_can_view_team(uuid) from public, anon, authenticated;
grant usage on schema dd_connect_private to authenticated;
grant execute on function dd_connect_private.activation_actor_role() to authenticated;
grant execute on function dd_connect_private.activation_actor_id() to authenticated;
grant execute on function dd_connect_private.activation_can_view_team(uuid) to authenticated;

-- Set the team and actor identity on the server; never trust the app for these fields.
create or replace function dd_connect_private.prepare_activation_insert()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare actor public.users%rowtype;
begin
  select u.* into actor from public.users u
  where u.auth_user_id=(select auth.uid())
    and lower(coalesce(u.status,''))='active'
    and upper(coalesce(u.employment_status,''))='ACTIVE'
    and upper(coalesce(u.id_approval_status,''))='APPROVED'
  limit 1;
  if actor.id is null then raise exception 'Active approved employee session required'; end if;
  if new.employee_id <> actor.id then raise exception 'Employees may only record their own activations'; end if;
  new.team_id := actor.team_id;
  new.employee_name := actor.name;
  new.employee_code := actor.agent_code;
  select t.name into new.team_name from public.teams t where t.id=actor.team_id;
  new.created_by_auth_uid := auth.uid();
  new.created_at := now();
  new.status := 'recorded';
  return new;
end
$$;
revoke all on function dd_connect_private.prepare_activation_insert() from public, anon, authenticated;
drop trigger if exists activations_before_insert on public.activations;
create trigger activations_before_insert before insert on public.activations
for each row execute function dd_connect_private.prepare_activation_insert();

drop policy if exists "activation_read_scope" on public.activations;
create policy "activation_read_scope" on public.activations for select to authenticated
using (
  employee_id = (select dd_connect_private.activation_actor_id())
  or lower(coalesce((select dd_connect_private.activation_actor_role()),''))='owner'
  or (team_id is not null and lower(coalesce((select dd_connect_private.activation_actor_role()),''))='team_leader'
      and (select dd_connect_private.activation_can_view_team(team_id)))
);
drop policy if exists "activation_insert_self" on public.activations;
create policy "activation_insert_self" on public.activations for insert to authenticated
with check (employee_id = (select dd_connect_private.activation_actor_id()) and created_by_auth_uid=(select auth.uid()));
revoke update, delete on public.activations from authenticated;
grant select, insert on public.activations to authenticated;

drop policy if exists "activation_logs_read_scope" on public.activation_logs;
create policy "activation_logs_read_scope" on public.activation_logs for select to authenticated
using (exists(select 1 from public.activations a where a.id=activation_id));
revoke insert, update, delete on public.activation_logs from authenticated;
grant select on public.activation_logs to authenticated;

drop policy if exists "activation_stats_read_scope" on public.activation_statistics;
create policy "activation_stats_read_scope" on public.activation_statistics for select to authenticated
using (
  lower(coalesce((select dd_connect_private.activation_actor_role()),''))='owner'
  or (team_id is not null and (select dd_connect_private.activation_can_view_team(team_id)))
  or (team_id is null and lower(coalesce((select dd_connect_private.activation_actor_role()),''))='direct_agent')
);
revoke insert, update, delete on public.activation_statistics from authenticated;
grant select on public.activation_statistics to authenticated;

create or replace function dd_connect_private.log_activation_insert()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.activation_logs(activation_id, actor_user_id, event_type, details)
  values (new.id, new.employee_id, 'recorded', jsonb_build_object('activation_type',new.activation_type,'team_id',new.team_id));
  update public.activation_statistics set activation_count=activation_count+1, updated_at=now()
    where statistic_date=(new.created_at at time zone 'Asia/Colombo')::date
      and team_id is not distinct from new.team_id and activation_type=new.activation_type;
  if not found then
    insert into public.activation_statistics(statistic_date,team_id,activation_type,activation_count,updated_at)
    values ((new.created_at at time zone 'Asia/Colombo')::date,new.team_id,new.activation_type,1,now());
  end if;
  return new;
end
$$;
revoke all on function dd_connect_private.log_activation_insert() from public, anon, authenticated;
drop trigger if exists activations_after_insert on public.activations;
create trigger activations_after_insert after insert on public.activations
for each row execute function dd_connect_private.log_activation_insert();

create or replace view public.activation_center_employee_view with (security_invoker = true) as
select a.id, a.employee_id, a.employee_name, a.employee_code,
       a.team_id, a.team_name, a.activation_type, a.gps_latitude, a.gps_longitude,
       a.status, a.created_at
from public.activations a;
grant select on public.activation_center_employee_view to authenticated;
