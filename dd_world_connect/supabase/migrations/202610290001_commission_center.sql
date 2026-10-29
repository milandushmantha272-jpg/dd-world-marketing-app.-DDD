-- DD WORLD CONNECT Commission Center. Uses existing public.users and public.teams identity.
create table if not exists public.commissions (
 id uuid primary key default gen_random_uuid(), employee_id uuid not null references public.users(id) on delete restrict,
 team_id uuid references public.teams(id) on delete set null, period_month date not null check(extract(day from period_month)=1),
 amount numeric(14,2) not null check(amount>=0), currency text not null default 'LKR' check(currency ~ '^[A-Z]{3}$'),
 status text not null default 'pending' check(status in ('pending','confirmed','not_received','wrong_amount')),
 source_file_name text, owner_note text, confirmed_at timestamptz, confirmation_note text,
 created_by uuid not null default auth.uid(), updated_by uuid not null default auth.uid(),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(employee_id,period_month)
);
create index if not exists commissions_month_idx on public.commissions(period_month desc);
create index if not exists commissions_employee_month_idx on public.commissions(employee_id,period_month desc);
create index if not exists commissions_team_month_idx on public.commissions(team_id,period_month desc);
create table if not exists public.commission_history (
 id bigint generated always as identity primary key, commission_id uuid not null references public.commissions(id) on delete restrict,
 actor_user_id uuid references public.users(id) on delete set null,
 event_type text not null check(event_type in ('created','updated','confirmed','not_received','wrong_amount')),
 old_record jsonb, new_record jsonb, created_at timestamptz not null default now()
);
create index if not exists commission_history_lookup_idx on public.commission_history(commission_id,created_at desc);
create table if not exists public.commission_complaints (
 id uuid primary key default gen_random_uuid(), commission_id uuid not null references public.commissions(id) on delete restrict,
 employee_id uuid not null references public.users(id) on delete restrict,
 complaint_type text not null check(complaint_type in ('not_received','wrong_amount','other')),
 message text not null check(length(trim(message)) between 3 and 4000),
 expected_amount numeric(14,2) check(expected_amount is null or expected_amount>=0), screenshot_path text,
 status text not null default 'open' check(status in ('open','under_review','resolved','rejected')),
 owner_response text, resolved_by uuid references public.users(id) on delete set null, resolved_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists commission_complaints_commission_idx on public.commission_complaints(commission_id,created_at desc);
create index if not exists commission_complaints_employee_idx on public.commission_complaints(employee_id,created_at desc);
create table if not exists public.commission_comments (
 id uuid primary key default gen_random_uuid(), commission_id uuid not null references public.commissions(id) on delete cascade,
 author_user_id uuid not null references public.users(id) on delete restrict,
 comment text not null check(length(trim(comment)) between 1 and 2000), shared_with_team boolean not null default false,
 created_at timestamptz not null default now()
);
create index if not exists commission_comments_lookup_idx on public.commission_comments(commission_id,created_at);

create or replace function dd_connect_private.commission_actor_id()
returns uuid language sql stable security definer set search_path='' as $$
 select u.id from public.users u where u.auth_user_id=(select auth.uid()) and lower(coalesce(u.status,''))='active'
 and upper(coalesce(u.employment_status,''))='ACTIVE' and upper(coalesce(u.id_approval_status,''))='APPROVED' limit 1
$$;
create or replace function dd_connect_private.commission_actor_role()
returns text language sql stable security definer set search_path='' as $$
 select lower(u.role) from public.users u where u.auth_user_id=(select auth.uid()) and lower(coalesce(u.status,''))='active'
 and upper(coalesce(u.employment_status,''))='ACTIVE' and upper(coalesce(u.id_approval_status,''))='APPROVED' limit 1
$$;
revoke all on function dd_connect_private.commission_actor_id() from public,anon,authenticated;
revoke all on function dd_connect_private.commission_actor_role() from public,anon,authenticated;
grant usage on schema dd_connect_private to authenticated;
grant execute on function dd_connect_private.commission_actor_id() to authenticated;
grant execute on function dd_connect_private.commission_actor_role() to authenticated;
create or replace function dd_connect_private.commission_can_view_team(target_team uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.users me where me.auth_user_id=(select auth.uid())
 and lower(coalesce(me.status,''))='active' and upper(coalesce(me.employment_status,''))='ACTIVE'
 and upper(coalesce(me.id_approval_status,''))='APPROVED' and lower(me.role)='team_leader'
 and exists(select 1 from public.teams t where t.id=target_team and t.leader_id=me.id))
$$;
revoke all on function dd_connect_private.commission_can_view_team(uuid) from public,anon,authenticated;
grant execute on function dd_connect_private.commission_can_view_team(uuid) to authenticated;

alter table public.commissions enable row level security;
alter table public.commission_history enable row level security;
alter table public.commission_complaints enable row level security;
alter table public.commission_comments enable row level security;
drop policy if exists commission_select_scope on public.commissions;
create policy commission_select_scope on public.commissions for select to authenticated using(
 employee_id=(select dd_connect_private.commission_actor_id()) or lower(coalesce((select dd_connect_private.commission_actor_role()),''))='owner'
 or (team_id is not null and (select dd_connect_private.commission_can_view_team(team_id)))
);
drop policy if exists commission_owner_insert on public.commissions;
create policy commission_owner_insert on public.commissions for insert to authenticated with check(
 lower(coalesce((select dd_connect_private.commission_actor_role()),''))='owner' and created_by=(select auth.uid()) and updated_by=(select auth.uid())
);
drop policy if exists commission_owner_update on public.commissions;
create policy commission_owner_update on public.commissions for update to authenticated using(lower(coalesce((select dd_connect_private.commission_actor_role()),''))='owner')
with check(lower(coalesce((select dd_connect_private.commission_actor_role()),''))='owner' and updated_by=(select auth.uid()));
grant select,insert,update on public.commissions to authenticated;
revoke delete on public.commissions from authenticated;
drop policy if exists commission_history_select_scope on public.commission_history;
create policy commission_history_select_scope on public.commission_history for select to authenticated using(exists(select 1 from public.commissions c where c.id=commission_id));
grant select on public.commission_history to authenticated;
revoke insert,update,delete on public.commission_history from authenticated;
drop policy if exists commission_complaints_select_scope on public.commission_complaints;
create policy commission_complaints_select_scope on public.commission_complaints for select to authenticated using(
 employee_id=(select dd_connect_private.commission_actor_id()) or lower(coalesce((select dd_connect_private.commission_actor_role()),''))='owner'
 or exists(select 1 from public.commissions c where c.id=commission_id and c.team_id is not null and (select dd_connect_private.commission_can_view_team(c.team_id)))
);
drop policy if exists commission_complaints_insert_self on public.commission_complaints;
create policy commission_complaints_insert_self on public.commission_complaints for insert to authenticated with check(
 employee_id=(select dd_connect_private.commission_actor_id()) and exists(select 1 from public.commissions c where c.id=commission_id and c.employee_id=commission_complaints.employee_id)
);
drop policy if exists commission_complaints_owner_update on public.commission_complaints;
create policy commission_complaints_owner_update on public.commission_complaints for update to authenticated using(lower(coalesce((select dd_connect_private.commission_actor_role()),''))='owner')
with check(lower(coalesce((select dd_connect_private.commission_actor_role()),''))='owner');
grant select,insert,update on public.commission_complaints to authenticated;
revoke delete on public.commission_complaints from authenticated;
drop policy if exists commission_comments_select_scope on public.commission_comments;
create policy commission_comments_select_scope on public.commission_comments for select to authenticated using(exists(select 1 from public.commissions c where c.id=commission_id));
drop policy if exists commission_comments_insert_scope on public.commission_comments;
create policy commission_comments_insert_scope on public.commission_comments for insert to authenticated with check(
 author_user_id=(select dd_connect_private.commission_actor_id()) and lower(coalesce((select dd_connect_private.commission_actor_role()),'')) in ('owner','team_leader')
 and exists(select 1 from public.commissions c where c.id=commission_id and (lower(coalesce((select dd_connect_private.commission_actor_role()),''))='owner'
 or (c.team_id is not null and (select dd_connect_private.commission_can_view_team(c.team_id)))))
);
grant select,insert on public.commission_comments to authenticated;
revoke update,delete on public.commission_comments from authenticated;

create or replace function dd_connect_private.commission_set_timestamps()
returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now();new.updated_by=auth.uid();return new;end $$;
drop trigger if exists commissions_set_timestamps on public.commissions;
create trigger commissions_set_timestamps before update on public.commissions for each row execute function dd_connect_private.commission_set_timestamps();
create or replace function dd_connect_private.commission_write_history()
returns trigger language plpgsql security definer set search_path='' as $$
declare evt text;
begin
 if tg_op='INSERT' then insert into public.commission_history(commission_id,actor_user_id,event_type,new_record)
 values(new.id,(select dd_connect_private.commission_actor_id()),'created',to_jsonb(new));return new;end if;
 evt=case when new.status='confirmed' then 'confirmed' when new.status='not_received' then 'not_received' when new.status='wrong_amount' then 'wrong_amount' else 'updated' end;
 insert into public.commission_history(commission_id,actor_user_id,event_type,old_record,new_record)
 values(new.id,(select dd_connect_private.commission_actor_id()),evt,to_jsonb(old),to_jsonb(new));return new;
end $$;
revoke all on function dd_connect_private.commission_write_history() from public,anon,authenticated;
drop trigger if exists commissions_write_history on public.commissions;
create trigger commissions_write_history after insert or update on public.commissions for each row execute function dd_connect_private.commission_write_history();

create or replace function public.confirm_commission(p_commission_id uuid,p_status text,p_note text default null)
returns void language plpgsql security definer set search_path='' as $$
declare actor uuid;
begin
 actor=(select dd_connect_private.commission_actor_id());
 if actor is null then raise exception 'Active approved employee session required';end if;
 if p_status not in ('confirmed','not_received','wrong_amount') then raise exception 'Invalid confirmation status';end if;
 update public.commissions set status=p_status,confirmation_note=nullif(trim(p_note),''),confirmed_at=case when p_status='confirmed' then now() else null end
 where id=p_commission_id and employee_id=actor;
 if not found then raise exception 'Commission not found or not owned by current employee';end if;
end $$;
revoke all on function public.confirm_commission(uuid,text,text) from public,anon;
grant execute on function public.confirm_commission(uuid,text,text) to authenticated;

create or replace function dd_connect_private.commission_complaint_timestamp()
returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now();return new;end $$;
drop trigger if exists commission_complaint_set_timestamps on public.commission_complaints;
create trigger commission_complaint_set_timestamps before update on public.commission_complaints for each row execute function dd_connect_private.commission_complaint_timestamp();
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('commission-evidence','commission-evidence',false,10485760,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict(id) do update set public=false,file_size_limit=10485760,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists commission_evidence_insert_self on storage.objects;
create policy commission_evidence_insert_self on storage.objects for insert to authenticated with check(
 bucket_id='commission-evidence' and (storage.foldername(name))[2]=(select auth.uid())::text
 and exists(select 1 from public.commissions c where c.id::text=(storage.foldername(name))[1] and c.employee_id=(select dd_connect_private.commission_actor_id()))
);
drop policy if exists commission_evidence_read_scope on storage.objects;
create policy commission_evidence_read_scope on storage.objects for select to authenticated using(
 bucket_id='commission-evidence' and exists(select 1 from public.commission_complaints cc join public.commissions c on c.id=cc.commission_id
 where cc.screenshot_path=name and (c.employee_id=(select dd_connect_private.commission_actor_id())
 or lower(coalesce((select dd_connect_private.commission_actor_role()),''))='owner'
 or (c.team_id is not null and (select dd_connect_private.commission_can_view_team(c.team_id)))))
);
revoke update,delete on storage.objects from authenticated;
