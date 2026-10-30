-- Secure Owner-only employee ID issuance. The returned QR token is also
-- hashed for verification by verify_employee_qr.
create or replace function public.issue_employee_id_card(p_employee_id uuid)
returns table(card_id uuid,card_number text,qr_token text)
language plpgsql security definer
set search_path=public,dd_connect_private,extensions,pg_temp
as $function$
declare actor_id uuid; target public.users; token_value text; number_value text; photo_value text; new_card_id uuid;
begin
 if auth.uid() is null or not public.is_active_employee() or not dd_connect_private.identity_is_owner() then
  raise exception 'Only the active Owner can issue employee ID cards';
 end if;
 actor_id:=dd_connect_private.identity_employee_id();
 select * into target from public.users where id=p_employee_id;
 if not found then raise exception 'Employee not found'; end if;
 if target.status<>'active' or target.employment_status<>'ACTIVE' or target.id_approval_status<>'APPROVED' then
  raise exception 'Only active, approved employees can receive an ID card';
 end if;
 token_value:=replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-','');
 number_value:='DD-'||coalesce(nullif(target.agent_code,''),left(target.id::text,8))||'-'||to_char(clock_timestamp(),'YYYYMMDDHH24MISS');
 select ep.profile_photo_url into photo_value from public.employee_profiles ep where ep.user_id=p_employee_id;
 insert into public.employee_id_cards(employee_id,card_number,employee_photo_path,qr_token_hash,qr_token,status,issued_at,issued_by)
 values(p_employee_id,number_value,photo_value,encode(extensions.digest(convert_to(token_value,'UTF8'),'sha256'),'hex'),token_value,'active',now(),actor_id)
 on conflict(employee_id) do update set card_number=excluded.card_number,employee_photo_path=excluded.employee_photo_path,
 qr_token_hash=excluded.qr_token_hash,qr_token=excluded.qr_token,status='active',issued_at=now(),issued_by=actor_id,expires_at=null,updated_at=now()
 returning id into new_card_id;
 return query select new_card_id,number_value,token_value;
end;
$function$;
revoke all on function public.issue_employee_id_card(uuid) from public,anon;
grant execute on function public.issue_employee_id_card(uuid) to authenticated;
