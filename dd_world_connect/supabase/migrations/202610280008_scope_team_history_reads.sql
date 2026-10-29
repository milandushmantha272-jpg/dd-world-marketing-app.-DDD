-- Agents can discover their assigned team but cannot enumerate other members,
-- personnel transfer history, leader history, or audit records. Team Leaders and
-- the Owner retain team-scoped roster/history access.
create or replace function dd_connect_private.is_team_leader_of(target_team_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.teams t join public.users me on me.id=t.leader_id
    where t.id=target_team_id and me.auth_user_id=(select auth.uid())
      and lower(coalesce(me.status,''))='active'
      and upper(coalesce(me.employment_status,''))='ACTIVE'
      and upper(coalesce(me.id_approval_status,''))='APPROVED'
      and lower(me.role)='team_leader'
  )
$$;
revoke all on function dd_connect_private.is_team_leader_of(uuid) from public, anon;
grant execute on function dd_connect_private.is_team_leader_of(uuid) to authenticated;

drop policy if exists team_members_select_scoped on public.team_members;
create policy team_members_select_scoped on public.team_members for select to authenticated
using (
  dd_connect_private.is_owner()
  or dd_connect_private.is_team_leader_of(team_id)
  or user_id=dd_connect_private.current_employee_id()
);

drop policy if exists team_transfer_history_select_scoped on public.team_transfer_history;
create policy team_transfer_history_select_scoped on public.team_transfer_history for select to authenticated
using (
  dd_connect_private.is_owner()
  or dd_connect_private.is_team_leader_of(previous_team_id)
  or dd_connect_private.is_team_leader_of(new_team_id)
  or employee_id=dd_connect_private.current_employee_id()
);

drop policy if exists team_leader_history_select_scoped on public.team_leader_history;
create policy team_leader_history_select_scoped on public.team_leader_history for select to authenticated
using (dd_connect_private.is_owner() or dd_connect_private.is_team_leader_of(team_id));

drop policy if exists team_audit_logs_select_scoped on public.team_audit_logs;
create policy team_audit_logs_select_scoped on public.team_audit_logs for select to authenticated
using (dd_connect_private.is_owner() or dd_connect_private.is_team_leader_of(team_id));
