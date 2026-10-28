-- Keep public RPC entry points SECURITY INVOKER: Owner RLS policies authorize writes,
-- while explicit checks still reject non-Owner callers. This avoids exposing
-- SECURITY DEFINER functions through the public Data API.
alter function public.owner_set_team_leader(uuid,uuid,text) security invoker;
alter function public.owner_transfer_employee(uuid,uuid,text) security invoker;

create index if not exists team_audit_logs_target_user_idx
  on public.team_audit_logs(target_user_id) where target_user_id is not null;
create index if not exists team_leader_history_new_leader_idx
  on public.team_leader_history(new_leader_id) where new_leader_id is not null;
create index if not exists team_leader_history_previous_leader_idx
  on public.team_leader_history(previous_leader_id) where previous_leader_id is not null;
create index if not exists team_members_assigned_by_idx
  on public.team_members(assigned_by) where assigned_by is not null;
create index if not exists team_transfer_history_member_idx
  on public.team_transfer_history(team_member_id) where team_member_id is not null;
