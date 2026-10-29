-- Fix the leader audit trigger's explicit reason column before reconciling existing rows.
create or replace function dd_connect_private.audit_team_changes()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare actor_id uuid; leader_reason text;
begin
  actor_id := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  leader_reason := coalesce(nullif(current_setting('dd_connect.team_leader_reason',true),''),'Team leader assignment changed');
  if tg_op='INSERT' then
    insert into public.team_audit_logs(team_id,actor_user_id,event_type,metadata)
    values(new.id,actor_id,'TEAM_CREATED',jsonb_build_object('team_code',new.team_code,'name',new.name,'status',new.status));
    return new;
  end if;
  if old.leader_id is distinct from new.leader_id then
    insert into public.team_leader_history(team_id,previous_leader_id,new_leader_id,reason,changed_by)
    values(new.id,old.leader_id,new.leader_id,leader_reason,actor_id);
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

-- Reconcile stale team.leader_id values to the canonical, active Team Leader
-- employee records already assigned to each team. Invalid legacy UUIDs are cleared
-- before the FK is validated; no employee records are removed or reassigned here.
alter table public.teams disable trigger dd_connect_team_audit;
update public.teams t set leader_id=null
where t.leader_id is not null
  and not exists (select 1 from public.users u where u.id=t.leader_id);
alter table public.teams enable trigger dd_connect_team_audit;

update public.teams t
set leader_id=u.id
from public.users u
where u.team_id=t.id
  and lower(coalesce(u.role,''))='team_leader'
  and lower(coalesce(u.status,''))='active'
  and upper(coalesce(u.employment_status,''))='ACTIVE'
  and upper(coalesce(u.id_approval_status,''))='APPROVED'
  and t.leader_id is distinct from u.id;

create unique index if not exists teams_one_team_per_leader_idx
  on public.teams(leader_id) where leader_id is not null;

alter table public.teams validate constraint teams_leader_id_fkey;
alter table public.users validate constraint users_team_id_fkey;
