-- Private media visibility follows the conversation, group, or feed record.
drop policy if exists dd_comm_storage_select_authenticated on storage.objects;
create policy dd_comm_storage_select_authorized on storage.objects for select to authenticated
using (
 bucket_id='dd-world-communication' and (
  (storage.foldername(name))[1]=(select auth.uid())::text
  or public.dd_comm_is_owner()
  or exists(select 1 from public.conversation_messages cm where cm.attachment_path=name and public.dd_comm_is_conversation_member(cm.conversation_id))
  or exists(select 1 from public.group_messages gm where gm.attachment_path=name and public.dd_comm_is_group_member(gm.group_id))
  or exists(select 1 from public.community_posts p where (p.image_path=name or p.video_path=name) and p.status='published' and p.deleted_at is null and (p.audience='all' or p.team_id=(select u.team_id from public.users u where u.id=public.dd_comm_current_user_id())))
 )
);
