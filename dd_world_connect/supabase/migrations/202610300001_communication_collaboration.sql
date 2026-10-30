-- DD WORLD CONNECT Communication & Collaboration
-- Safe additive migration: keeps legacy messages, community feed and notifications intact.
create extension if not exists pgcrypto;

create or replace function public.dd_comm_current_user_id()
returns uuid language sql stable security definer set search_path = public, pg_temp
as $$
  select u.id from public.users u
  where u.auth_user_id = (select auth.uid())
    and coalesce(u.status,'active') = 'active'
    and coalesce(u.employment_status,'ACTIVE') = 'ACTIVE'
    and coalesce(u.id_approval_status,'APPROVED') = 'APPROVED'
  limit 1
$$;
revoke all on function public.dd_comm_current_user_id() from public;
grant execute on function public.dd_comm_current_user_id() to authenticated;

create or replace function public.dd_comm_current_role()
returns text language sql stable security definer set search_path = public, pg_temp
as $$
  select u.role from public.users u where u.id = public.dd_comm_current_user_id() limit 1
$$;
revoke all on function public.dd_comm_current_role() from public;
grant execute on function public.dd_comm_current_role() to authenticated;

create or replace function public.dd_comm_is_owner()
returns boolean language sql stable security definer set search_path = public, pg_temp
as $$ select coalesce(public.dd_comm_current_role() = 'owner', false) $$;
revoke all on function public.dd_comm_is_owner() from public;
grant execute on function public.dd_comm_is_owner() to authenticated;

create table if not exists public.meetings (
 id uuid primary key default gen_random_uuid(),
 title text not null check (length(trim(title)) between 3 and 180),
 description text not null default '',
 meeting_type text not null check (meeting_type in ('physical','online','training','emergency')),
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 location text,
 meeting_url text,
 team_id uuid references public.teams(id) on delete set null,
 created_by uuid not null references public.users(id),
 status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 constraint meetings_valid_range check (ends_at > starts_at),
 constraint meetings_online_link check (meeting_type <> 'online' or meeting_url is not null)
);
create index if not exists meetings_starts_at_idx on public.meetings(starts_at) where deleted_at is null;
create index if not exists meetings_team_starts_idx on public.meetings(team_id,starts_at) where deleted_at is null;

create table if not exists public.meeting_attendance (
 id uuid primary key default gen_random_uuid(),
 meeting_id uuid not null references public.meetings(id) on delete cascade,
 employee_id uuid not null references public.users(id),
 attendance_status text not null default 'attending' check (attendance_status in ('attending','attended','absent','excused')),
 marked_at timestamptz not null default now(),
 note text,
 unique(meeting_id,employee_id)
);
create index if not exists meeting_attendance_employee_idx on public.meeting_attendance(employee_id,marked_at desc);

create table if not exists public.conversations (
 id uuid primary key default gen_random_uuid(),
 conversation_type text not null default 'direct' check (conversation_type in ('direct')),
 created_by uuid not null references public.users(id),
 created_at timestamptz not null default now(),
 last_message_at timestamptz not null default now(),
 unique(id)
);
create table if not exists public.conversation_members (
 conversation_id uuid not null references public.conversations(id) on delete cascade,
 employee_id uuid not null references public.users(id),
 joined_at timestamptz not null default now(),
 last_read_at timestamptz,
 primary key(conversation_id,employee_id)
);
create index if not exists conversation_members_employee_idx on public.conversation_members(employee_id,conversation_id);

create table if not exists public.conversation_messages (
 id uuid primary key default gen_random_uuid(),
 conversation_id uuid not null references public.conversations(id) on delete cascade,
 sender_id uuid not null references public.users(id),
 body text not null default '',
 message_type text not null default 'text' check (message_type in ('text','image')),
 attachment_path text,
 attachment_mime_type text,
 created_at timestamptz not null default now(),
 read_at timestamptz,
 check (length(body) <= 5000),
 check (length(body) > 0 or attachment_path is not null)
);
create index if not exists conversation_messages_conversation_created_idx on public.conversation_messages(conversation_id,created_at desc);
create or replace function public.dd_comm_is_conversation_member(p_conversation_id uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp
as $fn$ select exists(select 1 from public.conversation_members cm where cm.conversation_id=p_conversation_id and cm.employee_id=public.dd_comm_current_user_id()) $fn$;
revoke all on function public.dd_comm_is_conversation_member(uuid) from public;
grant execute on function public.dd_comm_is_conversation_member(uuid) to authenticated;

create or replace function public.dd_comm_is_group_member(p_group_id uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp
as $fn$ select exists(select 1 from public.group_members gm where gm.group_id=p_group_id and gm.employee_id=public.dd_comm_current_user_id()) $fn$;
revoke all on function public.dd_comm_is_group_member(uuid) from public;
grant execute on function public.dd_comm_is_group_member(uuid) to authenticated;

create table if not exists public.groups (
 id uuid primary key default gen_random_uuid(),
 name text not null check (length(trim(name)) between 2 and 100),
 group_type text not null check (group_type in ('all_staff','team_leaders','direct_agents','team','custom')),
 team_id uuid references public.teams(id) on delete cascade,
 description text not null default '',
 created_by uuid not null references public.users(id),
 is_announcement_only boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(name,team_id)
);
create table if not exists public.group_members (
 group_id uuid not null references public.groups(id) on delete cascade,
 employee_id uuid not null references public.users(id),
 added_by uuid references public.users(id),
 joined_at timestamptz not null default now(),
 last_read_at timestamptz,
 primary key(group_id,employee_id)
);
create table if not exists public.group_messages (
 id uuid primary key default gen_random_uuid(),
 group_id uuid not null references public.groups(id) on delete cascade,
 sender_id uuid not null references public.users(id),
 body text not null default '',
 message_type text not null default 'text' check (message_type in ('text','image','announcement')),
 attachment_path text,
 attachment_mime_type text,
 created_at timestamptz not null default now(),
 edited_at timestamptz,
 deleted_at timestamptz,
 check (length(body) <= 5000),
 check (length(body) > 0 or attachment_path is not null)
);
create index if not exists group_messages_group_created_idx on public.group_messages(group_id,created_at desc);

-- Reuse the existing DD WORLD community feed tables, extending them for video and announcement content.
alter table public.community_posts add column if not exists video_path text;
alter table public.community_posts add column if not exists is_announcement boolean not null default false;
alter table public.community_posts add column if not exists is_success_story boolean not null default false;
alter table public.community_posts add column if not exists audience text not null default 'all' check (audience in ('all','team'));
alter table public.community_posts add column if not exists team_id uuid references public.teams(id) on delete set null;
alter table public.community_posts add column if not exists deleted_at timestamptz;
alter table public.community_posts add column if not exists deleted_by uuid references public.users(id);
create index if not exists community_posts_feed_idx on public.community_posts(created_at desc) where status='published' and deleted_at is null;

-- Existing notifications are the in-app inbox. Add delivery bookkeeping and FCM device registrations.
alter table public.notifications add column if not exists sent_push_at timestamptz;
alter table public.notifications add column if not exists push_error text;
create table if not exists public.user_devices (
 id uuid primary key default gen_random_uuid(),
 employee_id uuid not null references public.users(id) on delete cascade,
 fcm_token text not null unique,
 platform text not null check(platform in ('android','ios','web')),
 device_label text,
 is_active boolean not null default true,
 last_seen_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists user_devices_employee_active_idx on public.user_devices(employee_id) where is_active;

-- Touch updated_at fields.
create or replace function public.dd_comm_touch_updated_at()
returns trigger language plpgsql set search_path = public, pg_temp
as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists meetings_touch_updated_at on public.meetings;
create trigger meetings_touch_updated_at before update on public.meetings for each row execute function public.dd_comm_touch_updated_at();
drop trigger if exists groups_touch_updated_at on public.groups;
create trigger groups_touch_updated_at before update on public.groups for each row execute function public.dd_comm_touch_updated_at();
drop trigger if exists user_devices_touch_updated_at on public.user_devices;
create trigger user_devices_touch_updated_at before update on public.user_devices for each row execute function public.dd_comm_touch_updated_at();

-- All RLS policies are additive and scoped to active, approved employee records.
alter table public.meetings enable row level security;
alter table public.meeting_attendance enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_messages enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_reactions enable row level security;
alter table public.notifications enable row level security;
alter table public.user_devices enable row level security;

drop policy if exists meetings_select_active on public.meetings;
create policy meetings_select_active on public.meetings for select to authenticated
using (public.dd_comm_current_user_id() is not null and deleted_at is null and
 (team_id is null or team_id = (select u.team_id from public.users u where u.id=public.dd_comm_current_user_id()) or public.dd_comm_is_owner()));
drop policy if exists meetings_insert_owner_or_team_leader on public.meetings;
create policy meetings_insert_owner_or_team_leader on public.meetings for insert to authenticated
with check (created_by=public.dd_comm_current_user_id() and
 (public.dd_comm_is_owner() or (public.dd_comm_current_role()='team_leader' and team_id is not null and team_id=(select u.team_id from public.users u where u.id=public.dd_comm_current_user_id()))));
drop policy if exists meetings_update_owner_or_creator on public.meetings;
create policy meetings_update_owner_or_creator on public.meetings for update to authenticated
using (public.dd_comm_is_owner() or (created_by=public.dd_comm_current_user_id() and public.dd_comm_current_role()='team_leader' and team_id=(select u.team_id from public.users u where u.id=public.dd_comm_current_user_id())))
with check (public.dd_comm_is_owner() or (created_by=public.dd_comm_current_user_id() and public.dd_comm_current_role()='team_leader' and team_id=(select u.team_id from public.users u where u.id=public.dd_comm_current_user_id())));
drop policy if exists meetings_delete_owner on public.meetings;
create policy meetings_delete_owner on public.meetings for delete to authenticated using (public.dd_comm_is_owner());

drop policy if exists meeting_attendance_select on public.meeting_attendance;
create policy meeting_attendance_select on public.meeting_attendance for select to authenticated
using (employee_id=public.dd_comm_current_user_id() or public.dd_comm_is_owner() or exists(select 1 from public.meetings m where m.id=meeting_id and m.team_id=(select u.team_id from public.users u where u.id=public.dd_comm_current_user_id()) and public.dd_comm_current_role()='team_leader'));
drop policy if exists meeting_attendance_insert_self on public.meeting_attendance;
create policy meeting_attendance_insert_self on public.meeting_attendance for insert to authenticated
with check (employee_id=public.dd_comm_current_user_id() and exists(select 1 from public.meetings m where m.id=meeting_id and m.deleted_at is null));
drop policy if exists meeting_attendance_update_self_or_manager on public.meeting_attendance;
create policy meeting_attendance_update_self_or_manager on public.meeting_attendance for update to authenticated
using (employee_id=public.dd_comm_current_user_id() or public.dd_comm_is_owner() or exists(select 1 from public.meetings m where m.id=meeting_id and m.team_id=(select u.team_id from public.users u where u.id=public.dd_comm_current_user_id()) and public.dd_comm_current_role()='team_leader'))
with check (employee_id=public.dd_comm_current_user_id() or public.dd_comm_is_owner() or exists(select 1 from public.meetings m where m.id=meeting_id and m.team_id=(select u.team_id from public.users u where u.id=public.dd_comm_current_user_id()) and public.dd_comm_current_role()='team_leader'));

drop policy if exists conversations_select_member on public.conversations;
create policy conversations_select_member on public.conversations for select to authenticated
using (public.dd_comm_is_conversation_member(id));
drop policy if exists conversations_insert_creator on public.conversations;
create policy conversations_insert_creator on public.conversations for insert to authenticated
with check (created_by=public.dd_comm_current_user_id());
drop policy if exists conversation_members_select_member on public.conversation_members;
create policy conversation_members_select_member on public.conversation_members for select to authenticated
using (employee_id=public.dd_comm_current_user_id() or public.dd_comm_is_conversation_member(conversation_id));
drop policy if exists conversation_members_insert_self_or_owner on public.conversation_members;
create policy conversation_members_insert_self_or_owner on public.conversation_members for insert to authenticated
with check (employee_id=public.dd_comm_current_user_id() or public.dd_comm_is_owner() or exists(select 1 from public.conversations c where c.id=conversation_id and c.created_by=public.dd_comm_current_user_id()));
drop policy if exists conversation_messages_select_member on public.conversation_messages;
create policy conversation_messages_select_member on public.conversation_messages for select to authenticated using (public.dd_comm_is_conversation_member(conversation_id));
drop policy if exists conversation_messages_insert_member on public.conversation_messages;
create policy conversation_messages_insert_member on public.conversation_messages for insert to authenticated with check (sender_id=public.dd_comm_current_user_id() and public.dd_comm_is_conversation_member(conversation_id));
drop policy if exists conversation_messages_update_read on public.conversation_messages;
create policy conversation_messages_update_read on public.conversation_messages for update to authenticated using (public.dd_comm_is_conversation_member(conversation_id) and sender_id<>public.dd_comm_current_user_id()) with check (public.dd_comm_is_conversation_member(conversation_id) and sender_id<>public.dd_comm_current_user_id());

drop policy if exists groups_select_member on public.groups;
create policy groups_select_member on public.groups for select to authenticated
using (public.dd_comm_is_group_member(id) or public.dd_comm_is_owner());
drop policy if exists groups_insert_manager on public.groups;
create policy groups_insert_manager on public.groups for insert to authenticated
with check (created_by=public.dd_comm_current_user_id() and (public.dd_comm_is_owner() or (public.dd_comm_current_role()='team_leader' and group_type='team' and team_id=(select u.team_id from public.users u where u.id=public.dd_comm_current_user_id()))));
drop policy if exists groups_update_manager on public.groups;
create policy groups_update_manager on public.groups for update to authenticated
using (public.dd_comm_is_owner() or (created_by=public.dd_comm_current_user_id() and public.dd_comm_current_role()='team_leader' and group_type='team' and team_id=(select u.team_id from public.users u where u.id=public.dd_comm_current_user_id())))
with check (public.dd_comm_is_owner() or (created_by=public.dd_comm_current_user_id() and public.dd_comm_current_role()='team_leader' and group_type='team' and team_id=(select u.team_id from public.users u where u.id=public.dd_comm_current_user_id())));
drop policy if exists groups_delete_owner on public.groups;
create policy groups_delete_owner on public.groups for delete to authenticated using (public.dd_comm_is_owner());
drop policy if exists group_members_select_group_member on public.group_members;
create policy group_members_select_group_member on public.group_members for select to authenticated
using (employee_id=public.dd_comm_current_user_id() or public.dd_comm_is_group_member(group_id) or public.dd_comm_is_owner());
drop policy if exists group_members_insert_manager on public.group_members;
create policy group_members_insert_manager on public.group_members for insert to authenticated
with check (added_by=public.dd_comm_current_user_id() and (public.dd_comm_is_owner() or exists(select 1 from public.groups g where g.id=group_id and g.group_type='team' and g.team_id=(select u.team_id from public.users u where u.id=public.dd_comm_current_user_id()) and public.dd_comm_current_role()='team_leader')));
drop policy if exists group_messages_select_member on public.group_messages;
create policy group_messages_select_member on public.group_messages for select to authenticated
using (public.dd_comm_is_group_member(group_id));
drop policy if exists group_messages_insert_member on public.group_messages;
create policy group_messages_insert_member on public.group_messages for insert to authenticated
with check (sender_id=public.dd_comm_current_user_id() and public.dd_comm_is_group_member(group_id) and (message_type<>'announcement' or public.dd_comm_is_owner() or public.dd_comm_current_role()='team_leader'));

drop policy if exists community_posts_select on public.community_posts;
drop policy if exists community_posts_insert on public.community_posts;
drop policy if exists community_posts_update on public.community_posts;
drop policy if exists community_posts_delete on public.community_posts;
drop policy if exists community_posts_select_active on public.community_posts;
create policy community_posts_select_active on public.community_posts for select to authenticated
using (public.dd_comm_current_user_id() is not null and status='published' and deleted_at is null and (audience='all' or team_id=(select u.team_id from public.users u where u.id=public.dd_comm_current_user_id())));
drop policy if exists community_posts_insert_author on public.community_posts;
create policy community_posts_insert_author on public.community_posts for insert to authenticated
with check (author_user_id=public.dd_comm_current_user_id() and (not is_announcement or public.dd_comm_is_owner() or public.dd_comm_current_role()='team_leader'));
drop policy if exists community_posts_update_author_or_owner on public.community_posts;
create policy community_posts_update_author_or_owner on public.community_posts for update to authenticated
using (author_user_id=public.dd_comm_current_user_id() or public.dd_comm_is_owner())
with check (author_user_id=public.dd_comm_current_user_id() or public.dd_comm_is_owner());
drop policy if exists community_posts_delete_author_or_owner on public.community_posts;
create policy community_posts_delete_author_or_owner on public.community_posts for delete to authenticated
using (author_user_id=public.dd_comm_current_user_id() or public.dd_comm_is_owner());
drop policy if exists community_comments_select on public.community_comments;
drop policy if exists community_comments_insert on public.community_comments;
drop policy if exists community_comments_update on public.community_comments;
drop policy if exists community_comments_delete on public.community_comments;
drop policy if exists community_comments_select_active on public.community_comments;
create policy community_comments_select_active on public.community_comments for select to authenticated
using (exists(select 1 from public.community_posts p where p.id=post_id and p.status='published' and p.deleted_at is null and (p.audience='all' or p.team_id=(select u.team_id from public.users u where u.id=public.dd_comm_current_user_id()))));
drop policy if exists community_comments_insert_self on public.community_comments;
create policy community_comments_insert_self on public.community_comments for insert to authenticated
with check (author_user_id=public.dd_comm_current_user_id() and exists(select 1 from public.community_posts p where p.id=post_id and p.status='published' and p.deleted_at is null));
drop policy if exists community_reactions_select on public.community_reactions;
drop policy if exists community_reactions_insert on public.community_reactions;
drop policy if exists community_reactions_delete on public.community_reactions;
drop policy if exists community_reactions_select_active on public.community_reactions;
create policy community_reactions_select_active on public.community_reactions for select to authenticated
using (exists(select 1 from public.community_posts p where p.id=post_id and p.status='published' and p.deleted_at is null));
drop policy if exists community_reactions_insert_self on public.community_reactions;
create policy community_reactions_insert_self on public.community_reactions for insert to authenticated
with check (user_id=public.dd_comm_current_user_id() and exists(select 1 from public.community_posts p where p.id=post_id and p.status='published' and p.deleted_at is null));
drop policy if exists community_reactions_delete_self on public.community_reactions;
create policy community_reactions_delete_self on public.community_reactions for delete to authenticated
using (user_id=public.dd_comm_current_user_id() or public.dd_comm_is_owner());

drop policy if exists notifications_select_self on public.notifications;
create policy notifications_select_self on public.notifications for select to authenticated
using (user_id=public.dd_comm_current_user_id());
drop policy if exists notifications_update_self on public.notifications;
create policy notifications_update_self on public.notifications for update to authenticated
using (user_id=public.dd_comm_current_user_id()) with check (user_id=public.dd_comm_current_user_id());
drop policy if exists user_devices_select_self_or_owner on public.user_devices;
create policy user_devices_select_self_or_owner on public.user_devices for select to authenticated
using (employee_id=public.dd_comm_current_user_id() or public.dd_comm_is_owner());
drop policy if exists user_devices_insert_self on public.user_devices;
create policy user_devices_insert_self on public.user_devices for insert to authenticated
with check (employee_id=public.dd_comm_current_user_id());
drop policy if exists user_devices_update_self on public.user_devices;
create policy user_devices_update_self on public.user_devices for update to authenticated
using (employee_id=public.dd_comm_current_user_id()) with check (employee_id=public.dd_comm_current_user_id());
drop policy if exists user_devices_delete_self_or_owner on public.user_devices;
create policy user_devices_delete_self_or_owner on public.user_devices for delete to authenticated
using (employee_id=public.dd_comm_current_user_id() or public.dd_comm_is_owner());

-- Private media bucket. Paths start with the authenticated user's auth UID.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('dd-world-communication','dd-world-communication',false,52428800,
 array['image/jpeg','image/png','image/webp','video/mp4','video/quicktime'])
on conflict (id) do update set public=false,file_size_limit=52428800,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists dd_comm_storage_select_authenticated on storage.objects;
create policy dd_comm_storage_select_authenticated on storage.objects for select to authenticated
using (bucket_id='dd-world-communication' and public.dd_comm_current_user_id() is not null);
drop policy if exists dd_comm_storage_insert_own on storage.objects;
create policy dd_comm_storage_insert_own on storage.objects for insert to authenticated
with check (bucket_id='dd-world-communication' and (storage.foldername(name))[1]=(select auth.uid())::text and public.dd_comm_current_user_id() is not null);
drop policy if exists dd_comm_storage_delete_own_or_owner on storage.objects;
create policy dd_comm_storage_delete_own_or_owner on storage.objects for delete to authenticated
using (bucket_id='dd-world-communication' and ((storage.foldername(name))[1]=(select auth.uid())::text or public.dd_comm_is_owner()));

grant select,insert,update,delete on public.meetings,public.meeting_attendance,public.conversations,public.conversation_members,public.conversation_messages,public.groups,public.group_members,public.group_messages,public.community_posts,public.community_comments,public.community_reactions,public.notifications,public.user_devices to authenticated;
