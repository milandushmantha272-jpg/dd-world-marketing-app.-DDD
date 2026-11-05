-- When an employee changes teams, update their reporting relationship to the
-- destination team's currently appointed leader in the same transaction.
create or replace function public.owner_transfer_employee(
  p_employee_id uuid, p_destination_team_id uuid, p_reason text
) returns void language plpgsql security invoker set search_path = ''
as $$
declare actor_id uuid; employee_row public.users%rowtype; destination_status text; destination_leader_id uuid;
begin
  actor_id := dd_connect_private.current_employee_id();
  if actor_id is null or not dd_connect_private.is_owner() then
    raise exception 'Only an active, approved Owner can transfer employees' using errcode='42501';
  end if;
  if char_length(btrim(coalesce(p_reason,''))) < 3 then
    raise exception 'Please provide a transfer reason of at least 3 characters';
  end if;
  select * into employee_row from public.users where id=p_employee_id for update;
  if not found then raise exception 'Employee not found'; end if;
  if lower(coalesce(employee_row.role,'')) not in ('agent','junior_team_leader') then
    raise exception 'Remove the Team Leader appointment before transferring this employee';
  end if;
  if lower(coalesce(employee_row.status,'')) <> 'active'
     or upper(coalesce(employee_row.employment_status,'')) <> 'ACTIVE'
     or upper(coalesce(employee_row.id_approval_status,'')) <> 'APPROVED' then
    raise exception 'Only active and approved employees can be transferred';
  end if;
  select status,leader_id into destination_status,destination_leader_id
    from public.teams where id=p_destination_team_id for update;
  if not found or destination_status <> 'ACTIVE' then
    raise exception 'Destination team must exist and be ACTIVE';
  end if;
  if employee_row.team_id=p_destination_team_id then
    raise exception 'Employee is already assigned to this team';
  end if;
  perform set_config('dd_connect.team_transfer_reason',btrim(p_reason),true);
  update public.users
    set team_id=p_destination_team_id,reports_to_user_id=destination_leader_id
    where id=p_employee_id;
end $$;
revoke all on function public.owner_transfer_employee(uuid,uuid,text) from public, anon;
grant execute on function public.owner_transfer_employee(uuid,uuid,text) to authenticated;
