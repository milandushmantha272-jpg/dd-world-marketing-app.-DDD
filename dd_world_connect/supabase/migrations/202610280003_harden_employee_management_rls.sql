-- Harden employee-management RLS helpers: keep SECURITY DEFINER functions out of
-- the exposed public schema and add indexes for audit actor foreign keys.
create schema if not exists dd_connect_private;
revoke all on schema dd_connect_private from public, anon;
grant usage on schema dd_connect_private to authenticated;

create or replace function dd_connect_private.is_owner()
returns boolean language sql stable security definer set search_path = ''
as $$
 select exists(select 1 from public.users u where u.auth_user_id=(select auth.uid())
 and lower(u.role)='owner' and lower(coalesce(u.status,''))='active'
 and upper(coalesce(u.employment_status,''))='ACTIVE'
 and upper(coalesce(u.id_approval_status,''))='APPROVED')
$$;
create or replace function dd_connect_private.can_view_employee(target_employee_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
 select exists(select 1 from public.users me join public.users target on target.id=target_employee_id
 where me.auth_user_id=(select auth.uid()) and lower(coalesce(me.status,''))='active'
 and upper(coalesce(me.employment_status,''))='ACTIVE'
 and upper(coalesce(me.id_approval_status,''))='APPROVED'
 and (lower(me.role)='owner' or me.id=target.id or
 (lower(me.role)='team_leader' and target.team_id in (select t.id from public.teams t where t.leader_id=me.id))))
$$;
revoke all on function dd_connect_private.is_owner() from public, anon;
revoke all on function dd_connect_private.can_view_employee(uuid) from public, anon;
grant execute on function dd_connect_private.is_owner() to authenticated;
grant execute on function dd_connect_private.can_view_employee(uuid) to authenticated;

drop policy if exists employee_profiles_select_authorized on public.employee_profiles;
drop policy if exists employee_profiles_owner_insert on public.employee_profiles;
drop policy if exists employee_profiles_owner_update on public.employee_profiles;
create policy employee_profiles_select_authorized on public.employee_profiles for select to authenticated
using (dd_connect_private.can_view_employee(user_id));
create policy employee_profiles_owner_insert on public.employee_profiles for insert to authenticated
with check (dd_connect_private.is_owner());
create policy employee_profiles_owner_update on public.employee_profiles for update to authenticated
using (dd_connect_private.is_owner()) with check (dd_connect_private.is_owner());

drop policy if exists employee_status_history_select_authorized on public.employee_status_history;
drop policy if exists employee_status_history_owner_insert on public.employee_status_history;
create policy employee_status_history_select_authorized on public.employee_status_history for select to authenticated
using (dd_connect_private.can_view_employee(employee_id));
create policy employee_status_history_owner_insert on public.employee_status_history for insert to authenticated
with check (dd_connect_private.is_owner());

drop policy if exists employee_transfer_history_select_authorized on public.employee_transfer_history;
drop policy if exists employee_transfer_history_owner_insert on public.employee_transfer_history;
create policy employee_transfer_history_select_authorized on public.employee_transfer_history for select to authenticated
using (dd_connect_private.can_view_employee(employee_id));
create policy employee_transfer_history_owner_insert on public.employee_transfer_history for insert to authenticated
with check (dd_connect_private.is_owner());

drop policy if exists employee_approval_requests_select_authorized on public.employee_approval_requests;
drop policy if exists employee_approval_requests_owner_insert on public.employee_approval_requests;
drop policy if exists employee_approval_requests_owner_update on public.employee_approval_requests;
create policy employee_approval_requests_select_authorized on public.employee_approval_requests for select to authenticated
using (dd_connect_private.can_view_employee(employee_id));
create policy employee_approval_requests_owner_insert on public.employee_approval_requests for insert to authenticated
with check (dd_connect_private.is_owner());
create policy employee_approval_requests_owner_update on public.employee_approval_requests for update to authenticated
using (dd_connect_private.is_owner()) with check (dd_connect_private.is_owner());

drop policy if exists employee_photo_owner_upload on storage.objects;
create policy employee_photo_owner_upload on storage.objects for insert to authenticated
with check (bucket_id='employee-profile-photos' and dd_connect_private.is_owner());
drop policy if exists employee_photo_owner_update on storage.objects;
create policy employee_photo_owner_update on storage.objects for update to authenticated
using (bucket_id='employee-profile-photos' and dd_connect_private.is_owner())
with check (bucket_id='employee-profile-photos' and dd_connect_private.is_owner());
drop policy if exists employee_photo_owner_delete on storage.objects;
create policy employee_photo_owner_delete on storage.objects for delete to authenticated
using (bucket_id='employee-profile-photos' and dd_connect_private.is_owner());
drop policy if exists employee_photo_read_authorized on storage.objects;
create policy employee_photo_read_authorized on storage.objects for select to authenticated
using (bucket_id='employee-profile-photos' and (
 dd_connect_private.is_owner() or exists(select 1 from public.users target
 where target.id::text=split_part(storage.objects.name,'/',1)
 and dd_connect_private.can_view_employee(target.id))
));

revoke all on function public.dd_connect_my_role() from public, anon, authenticated;
revoke all on function public.dd_connect_can_view_employee(uuid) from public, anon, authenticated;
revoke all on function public.dd_connect_is_owner() from public, anon, authenticated;
drop function if exists public.dd_connect_my_role();
drop function if exists public.dd_connect_can_view_employee(uuid);
drop function if exists public.dd_connect_is_owner();

create index if not exists employee_profiles_updated_by_idx on public.employee_profiles(updated_by) where updated_by is not null;
create index if not exists employee_status_history_changed_by_idx on public.employee_status_history(changed_by) where changed_by is not null;
create index if not exists employee_transfer_history_previous_team_idx on public.employee_transfer_history(previous_team_id) where previous_team_id is not null;
create index if not exists employee_transfer_history_previous_manager_idx on public.employee_transfer_history(previous_reports_to_user_id) where previous_reports_to_user_id is not null;
create index if not exists employee_transfer_history_new_manager_idx on public.employee_transfer_history(new_reports_to_user_id) where new_reports_to_user_id is not null;
create index if not exists employee_transfer_history_actor_idx on public.employee_transfer_history(transferred_by) where transferred_by is not null;
create index if not exists employee_approval_requests_requester_idx on public.employee_approval_requests(requested_by) where requested_by is not null;
create index if not exists employee_approval_requests_reviewer_idx on public.employee_approval_requests(reviewed_by) where reviewed_by is not null;
