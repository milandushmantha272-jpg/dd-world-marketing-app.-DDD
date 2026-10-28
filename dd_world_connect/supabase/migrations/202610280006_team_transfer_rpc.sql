-- Preserve explicit transfer reasons and make employee transfers atomic and Owner-only.
create or replace function dd_connect_private.sync_team_membership()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare actor_id uuid; transfer_reason text;
begin
  actor_id := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  transfer_reason := coalesce(nullif(current_setting('dd_connect.team_transfer_reason', true), ''),'Team assignment changed on employee record');
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
    values(new.id,old.team_id,new.team_id,transfer_reason,actor_id);
    insert into public.team_audit_logs(team_id,actor_user_id,event_type,target_user_id,metadata)
    values(new.team_id,actor_id,'EMPLOYEE_TEAM_TRANSFER',new.id,
      jsonb_build_object('previous_team_id',old.team_id,'new_team_id',new.team_id,'reason',transfer_reason));
  end if;
  return new;
end $$;
revoke all on function dd_connect_private.sync_team_membership() from public, anon, authenticated;

create or replace function public.owner_transfer_employee(
  p_employee_id uuid, p_destination_team_id uuid, p_reason text
) returns void language plpgsql security definer set search_path = ''
as $$
declare actor_id uuid; employee_row public.users%rowtype; destination_status text;
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
  select status into destination_status from public.teams where id=p_destination_team_id for update;
  if not found or destination_status <> 'ACTIVE' then
    raise exception 'Destination team must exist and be ACTIVE';
  end if;
  if employee_row.team_id=p_destination_team_id then
    raise exception 'Employee is already assigned to this team';
  end if;
  perform set_config('dd_connect.team_transfer_reason',btrim(p_reason),true);
  update public.users set team_id=p_destination_team_id,reports_to_user_id=null where id=p_employee_id;
end $$;
revoke all on function public.owner_transfer_employee(uuid,uuid,text) from public, anon;
grant execute on function public.owner_transfer_employee(uuid,uuid,text) to authenticated;
