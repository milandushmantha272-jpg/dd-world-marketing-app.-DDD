alter table public.employee_id_cards add column if not exists qr_token text;
drop policy if exists leave_requests_insert_self on public.leave_requests;
create policy leave_requests_insert_self on public.leave_requests for insert to authenticated
with check (
 public.is_active_employee()
 and user_id=dd_connect_private.current_employee_id()
 and team_id=(select u.team_id from public.users u where u.id=dd_connect_private.current_employee_id())
 and status=case when team_id is null then 'PENDING_OWNER' else 'PENDING_TEAM_LEADER' end
 and review_stage=case when team_id is null then 'PENDING_OWNER' else 'PENDING_TEAM_LEADER' end
);
