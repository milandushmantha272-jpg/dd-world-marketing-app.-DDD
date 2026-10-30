-- Final role-scope hardening for meetings and Team Leader group membership.
drop policy if exists meetings_update_owner_or_creator on public.meetings;
create policy meetings_update_owner_only on public.meetings for update to authenticated
using (public.dd_comm_is_owner())
with check (public.dd_comm_is_owner());

drop policy if exists group_members_insert_manager on public.group_members;
create policy group_members_insert_manager on public.group_members for insert to authenticated
with check (
 added_by=public.dd_comm_current_user_id()
 and (
  public.dd_comm_is_owner()
  or (
   public.dd_comm_current_role()='team_leader'
   and exists(
    select 1 from public.groups g
    join public.users target on target.id=employee_id
    where g.id=group_id and g.group_type='team'
      and g.team_id=(select u.team_id from public.users u where u.id=public.dd_comm_current_user_id())
      and target.team_id=g.team_id
      and target.status='active'
      and target.employment_status='ACTIVE'
      and target.id_approval_status='APPROVED'
   )
  )
 )
);
