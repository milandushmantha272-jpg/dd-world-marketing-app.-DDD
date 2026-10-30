create or replace function public.review_employee_document(p_document_id uuid,p_decision text,p_note text default null)
returns public.employee_documents
language plpgsql security definer
set search_path=public,dd_connect_private,pg_temp
as $$
declare actor uuid; result public.employee_documents;
begin
 if auth.uid() is null or not public.is_active_employee() or not dd_connect_private.is_owner() then
  raise exception 'Only the active Owner can verify employee documents';
 end if;
 if p_decision not in ('approved','rejected') then raise exception 'Decision must be approved or rejected'; end if;
 actor:=dd_connect_private.current_employee_id();
 update public.employee_documents set status=p_decision,reviewed_at=now(),reviewed_by=actor,review_note=nullif(btrim(p_note),'')
 where id=p_document_id and status='pending' returning * into result;
 if not found then raise exception 'Pending document not found'; end if;
 insert into public.document_verifications(document_id,verifier_id,decision,note)
 values(p_document_id,actor,p_decision,nullif(btrim(p_note),''));
 return result;
end $$;
revoke all on function public.review_employee_document(uuid,text,text) from public,anon;
grant execute on function public.review_employee_document(uuid,text,text) to authenticated;
drop policy if exists employee_documents_owner_update on public.employee_documents;
revoke update,delete on public.employee_documents from authenticated;
drop policy if exists document_verifications_owner_insert on public.document_verifications;
revoke insert,update,delete on public.document_verifications from authenticated;
