-- Tighten conversation membership: a direct conversation has exactly two participants.
create or replace function public.dd_comm_can_add_conversation_member(p_conversation_id uuid,p_employee_id uuid)
returns boolean language plpgsql stable security definer set search_path=public,pg_temp
as $fn$
declare member_count integer; creator_id uuid;
begin
 if public.dd_comm_current_user_id() is null then return false; end if;
 if p_employee_id=public.dd_comm_current_user_id() then return true; end if;
 if public.dd_comm_is_owner() then return true; end if;
 select created_by into creator_id from public.conversations where id=p_conversation_id;
 select count(*) into member_count from public.conversation_members where conversation_id=p_conversation_id;
 return creator_id=public.dd_comm_current_user_id() and member_count<2;
end
$fn$;
revoke all on function public.dd_comm_can_add_conversation_member(uuid,uuid) from public;
grant execute on function public.dd_comm_can_add_conversation_member(uuid,uuid) to authenticated;

drop policy if exists conversation_members_insert_self_or_owner on public.conversation_members;
create policy conversation_members_insert_self_or_owner on public.conversation_members for insert to authenticated
with check (public.dd_comm_can_add_conversation_member(conversation_id,employee_id));
