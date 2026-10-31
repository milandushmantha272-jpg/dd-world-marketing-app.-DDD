create or replace function public.verify_employee_qr(p_token text)
returns table(employee_name text,staff_code text,team_name text,employee_position text,status text,verified boolean)
language plpgsql security definer
set search_path=public,dd_connect_private,extensions,pg_temp
as $$
declare scanner uuid; card public.employee_id_cards; emp public.users; team_label text; card_state text;
begin
 if auth.uid() is null or not public.is_active_employee() then raise exception 'Active employee authentication required'; end if;
 scanner:=dd_connect_private.current_employee_id();
 select c.* into card from public.employee_id_cards c
 where c.qr_token_hash=encode(extensions.digest(convert_to(p_token,'UTF8'),'sha256'),'hex') limit 1;
 if not found then raise exception 'Employee QR code not recognized'; end if;
 select u.* into emp from public.users u where u.id=card.employee_id;
 select t.name into team_label from public.teams t where t.id=emp.team_id;
 card_state:=case when card.expires_at is not null and card.expires_at<now() then 'expired' when card.status<>'active' then card.status when emp.status<>'active' or emp.employment_status<>'ACTIVE' or emp.id_approval_status<>'APPROVED' then 'inactive' else 'active' end;
 insert into public.qr_verifications(employee_id,scanned_by,result)
 values(emp.id,scanner,case when card_state='active' then 'valid' when card_state='revoked' then 'revoked' when card_state='expired' then 'expired' else 'inactive' end);
 return query select emp.name,coalesce(emp.agent_code,''),coalesce(team_label,''),initcap(replace(emp.role,'_',' ')),card_state,(card_state='active');
end $$;
revoke all on function public.verify_employee_qr(text) from public,anon;
grant execute on function public.verify_employee_qr(text) to authenticated;
