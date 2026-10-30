alter table public.leave_requests drop constraint if exists leave_requests_status_check;
alter table public.leave_requests add constraint leave_requests_status_check
 check(status in ('PENDING','PENDING_TEAM_LEADER','PENDING_OWNER','APPROVED','REJECTED','CANCELLED'));
drop policy if exists leave_requests_insert_self on public.leave_requests;
create policy leave_requests_insert_self on public.leave_requests for insert to authenticated
with check (
 public.is_active_employee()
 and user_id=dd_connect_private.current_employee_id()
 and team_id is not distinct from (select u.team_id from public.users u where u.id=dd_connect_private.current_employee_id())
 and status=case when team_id is null then 'PENDING_OWNER' else 'PENDING_TEAM_LEADER' end
 and review_stage=case when team_id is null then 'PENDING_OWNER' else 'PENDING_TEAM_LEADER' end
);
create or replace function public.review_leave_request(p_leave_request_id uuid,p_decision text,p_note text default null)
returns public.leave_requests language plpgsql security definer
set search_path=public,dd_connect_private,pg_temp
as $$
declare actor uuid; actor_role text; actor_team uuid; target public.leave_requests; updated public.leave_requests;
begin
 if auth.uid() is null or not public.is_active_employee() then raise exception 'Active employee authentication required'; end if;
 actor:=dd_connect_private.current_employee_id();
 select role,team_id into actor_role,actor_team from public.users where id=actor;
 select * into target from public.leave_requests where id=p_leave_request_id for update;
 if not found then raise exception 'Leave request not found'; end if;
 if p_decision not in ('approved','rejected') then raise exception 'Decision must be approved or rejected'; end if;
 if actor_role='team_leader' and target.review_stage='PENDING_TEAM_LEADER' and target.team_id=actor_team
   and exists(select 1 from public.users requester where requester.id=target.user_id and requester.team_id=target.team_id)
 then
   insert into public.leave_approvals(leave_request_id,reviewer_id,reviewer_role,decision,note) values(target.id,actor,'team_leader',p_decision,p_note);
   update public.leave_requests set review_stage=case when p_decision='approved' then 'PENDING_OWNER' else 'REJECTED' end,status=case when p_decision='approved' then 'PENDING_OWNER' else 'REJECTED' end,reviewed_by=actor,reviewed_at=now(),review_note=p_note,updated_at=now() where id=target.id returning * into updated;
 elsif actor_role='owner' and target.review_stage='PENDING_OWNER' then
   insert into public.leave_approvals(leave_request_id,reviewer_id,reviewer_role,decision,note) values(target.id,actor,'owner',p_decision,p_note);
   update public.leave_requests set review_stage=case when p_decision='approved' then 'APPROVED' else 'REJECTED' end,status=case when p_decision='approved' then 'APPROVED' else 'REJECTED' end,reviewed_by=actor,reviewed_at=now(),review_note=p_note,updated_at=now() where id=target.id returning * into updated;
 else raise exception 'You are not authorized for this leave review stage'; end if;
 return updated;
end $$;
revoke all on function public.review_leave_request(uuid,text,text) from public,anon;
grant execute on function public.review_leave_request(uuid,text,text) to authenticated;
