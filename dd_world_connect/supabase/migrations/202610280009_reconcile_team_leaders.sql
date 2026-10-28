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
