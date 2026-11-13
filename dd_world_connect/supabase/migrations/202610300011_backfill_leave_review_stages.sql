update public.leave_requests
set review_stage=case
 when status='APPROVED' then 'APPROVED'
 when status='REJECTED' then 'REJECTED'
 when status='CANCELLED' then 'CANCELLED'
 when team_id is null then 'PENDING_OWNER'
 else 'PENDING_TEAM_LEADER'
end,
status=case
 when status='PENDING' and team_id is null then 'PENDING_OWNER'
 when status='PENDING' and team_id is not null then 'PENDING_TEAM_LEADER'
 else status
end
where review_stage='PENDING_TEAM_LEADER' and status in ('PENDING','APPROVED','REJECTED','CANCELLED');
