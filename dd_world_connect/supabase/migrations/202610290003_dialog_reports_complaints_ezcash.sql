-- DD WORLD CONNECT: Dialog Reports, Complaint Threads/Attachments and EZ Cash
-- Idempotent migration; existing commission_complaints and dialog-reports bucket are reused.
create schema if not exists dd_connect_private;

create table if not exists public.dialog_reports (
 id uuid primary key default gen_random_uuid(),
 report_type text not null check (report_type in ('weekly','monthly')),
 title text not null check (length(trim(title)) between 2 and 180),
 period_start date not null,
 period_end date not null,
 file_path text not null,
 file_name text not null,
 mime_type text not null check (mime_type in ('application/pdf','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel','text/csv')),
 file_size_bytes bigint not null check (file_size_bytes > 0 and file_size_bytes <= 26214400),
 uploaded_by uuid not null references public.users(id),
 created_at timestamptz not null default now(),
 archived_at timestamptz,
 archived_by uuid references public.users(id),
 deleted_at timestamptz,
 deleted_by uuid references public.users(id),
 check (period_end >= period_start)
);
create index if not exists dialog_reports_type_period_idx on public.dialog_reports(report_type,period_start desc) where deleted_at is null;

create table if not exists public.report_downloads (
 id uuid primary key default gen_random_uuid(),
 report_id uuid not null references public.dialog_reports(id) on delete restrict,
 downloaded_by uuid not null references public.users(id),
 downloaded_at timestamptz not null default now(),
 file_name text not null
);
create index if not exists report_downloads_report_idx on public.report_downloads(report_id,downloaded_at desc);

create table if not exists public.report_archive (
 id uuid primary key default gen_random_uuid(),
 report_id uuid not null references public.dialog_reports(id) on delete restrict,
 archived_by uuid not null references public.users(id),
 archived_at timestamptz not null default now(),
 reason text
);
create unique index if not exists report_archive_report_once_idx on public.report_archive(report_id);

create table if not exists public.complaint_messages (
 id uuid primary key default gen_random_uuid(),
 complaint_id uuid not null references public.commission_complaints(id) on delete cascade,
 sender_user_id uuid not null references public.users(id),
 message text not null check (length(trim(message)) between 1 and 4000),
 created_at timestamptz not null default now()
);
create index if not exists complaint_messages_thread_idx on public.complaint_messages(complaint_id,created_at);

create table if not exists public.complaint_attachments (
 id uuid primary key default gen_random_uuid(),
 complaint_id uuid not null references public.commission_complaints(id) on delete cascade,
 uploaded_by uuid not null references public.users(id),
 storage_path text not null,
 file_name text not null,
 mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp','application/pdf')),
 file_size_bytes bigint not null check (file_size_bytes > 0 and file_size_bytes <= 10485760),
 created_at timestamptz not null default now()
);
create index if not exists complaint_attachments_thread_idx on public.complaint_attachments(complaint_id,created_at);

create table if not exists public.ez_cash_records (
 id uuid primary key default gen_random_uuid(),
 employee_id uuid not null references public.users(id),
 team_id uuid references public.teams(id),
 period_month date not null check (extract(day from period_month)=1),
 amount numeric(14,2) not null check (amount >= 0),
 currency text not null default 'LKR' check (currency='LKR'),
 paid_at timestamptz,
 payment_reference text,
 payment_number_last4 text check (payment_number_last4 is null or payment_number_last4 ~ '^[0-9]{4}$'),
 status text not null default 'pending' check (status in ('pending','paid','failed','cancelled')),
 owner_note text,
 source_file_name text,
 created_by uuid not null default auth.uid(),
 updated_by uuid not null default auth.uid(),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists ez_cash_employee_period_idx on public.ez_cash_records(employee_id,period_month desc);
create index if not exists ez_cash_team_period_idx on public.ez_cash_records(team_id,period_month desc);

create table if not exists public.ez_cash_reports (
 id uuid primary key default gen_random_uuid(),
 title text not null check (length(trim(title)) between 2 and 180),
 period_month date not null check (extract(day from period_month)=1),
 file_path text not null,
 file_name text not null,
 mime_type text not null check (mime_type in ('application/pdf','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel','text/csv')),
 file_size_bytes bigint not null check (file_size_bytes > 0 and file_size_bytes <= 26214400),
 uploaded_by uuid not null references public.users(id),
 created_at timestamptz not null default now(),
 deleted_at timestamptz,
 deleted_by uuid references public.users(id)
);

create table if not exists public.ez_cash_history (
 id bigint generated always as identity primary key,
 record_id uuid not null,
 actor_auth_uid uuid,
 event_type text not null check (event_type in ('INSERT','UPDATE','DELETE')),
 old_record jsonb,
 new_record jsonb,
 created_at timestamptz not null default now()
);
create index if not exists ez_cash_history_record_idx on public.ez_cash_history(record_id,created_at desc);

create or replace function dd_connect_private.is_active_commission_employee()
returns boolean language sql stable security definer set search_path=pg_catalog,public,dd_connect_private
as $$
 select exists(select 1 from public.users u where u.auth_user_id=(select auth.uid())
   and lower(coalesce(u.status,''))='active' and upper(coalesce(u.employment_status,''))='ACTIVE'
   and upper(coalesce(u.id_approval_status,''))='APPROVED')
$$;
revoke all on function dd_connect_private.is_active_commission_employee() from public;
grant execute on function dd_connect_private.is_active_commission_employee() to authenticated;

create or replace function dd_connect_private.is_dialog_reports_owner()
returns boolean language sql stable security definer set search_path=pg_catalog,public,dd_connect_private
as $$ select dd_connect_private.is_active_commission_employee() and lower(coalesce((select dd_connect_private.commission_actor_role()),''))='owner' $$;
revoke all on function dd_connect_private.is_dialog_reports_owner() from public;
grant execute on function dd_connect_private.is_dialog_reports_owner() to authenticated;

create or replace function dd_connect_private.log_ez_cash_history()
returns trigger language plpgsql security definer set search_path=pg_catalog,public
as $$
begin
 if tg_op='INSERT' then
   insert into public.ez_cash_history(record_id,actor_auth_uid,event_type,new_record) values(new.id,auth.uid(),'INSERT',to_jsonb(new)); return new;
 elsif tg_op='UPDATE' then
   insert into public.ez_cash_history(record_id,actor_auth_uid,event_type,old_record,new_record) values(new.id,auth.uid(),'UPDATE',to_jsonb(old),to_jsonb(new)); new.updated_at=now(); return new;
 else
   insert into public.ez_cash_history(record_id,actor_auth_uid,event_type,old_record) values(old.id,auth.uid(),'DELETE',to_jsonb(old)); return old;
 end if;
end $$;
revoke all on function dd_connect_private.log_ez_cash_history() from public;

drop trigger if exists ez_cash_history_trigger on public.ez_cash_records;
create trigger ez_cash_history_trigger after insert or update or delete on public.ez_cash_records
for each row execute function dd_connect_private.log_ez_cash_history();

alter table public.dialog_reports enable row level security;
alter table public.report_downloads enable row level security;
alter table public.report_archive enable row level security;
alter table public.complaint_messages enable row level security;
alter table public.complaint_attachments enable row level security;
alter table public.ez_cash_records enable row level security;
alter table public.ez_cash_reports enable row level security;
alter table public.ez_cash_history enable row level security;

drop policy if exists dialog_reports_read_active on public.dialog_reports;
create policy dialog_reports_read_active on public.dialog_reports for select to authenticated
using (dd_connect_private.is_active_commission_employee() and deleted_at is null);
drop policy if exists dialog_reports_owner_insert on public.dialog_reports;
create policy dialog_reports_owner_insert on public.dialog_reports for insert to authenticated
with check (dd_connect_private.is_dialog_reports_owner() and uploaded_by=(select dd_connect_private.commission_actor_id()) and archived_at is null and deleted_at is null);
drop policy if exists dialog_reports_owner_update on public.dialog_reports;
create policy dialog_reports_owner_update on public.dialog_reports for update to authenticated
using (dd_connect_private.is_dialog_reports_owner()) with check (dd_connect_private.is_dialog_reports_owner());
drop policy if exists dialog_reports_owner_delete on public.dialog_reports;
create policy dialog_reports_owner_delete on public.dialog_reports for delete to authenticated using (dd_connect_private.is_dialog_reports_owner());

drop policy if exists report_downloads_self_insert on public.report_downloads;
create policy report_downloads_self_insert on public.report_downloads for insert to authenticated
with check (dd_connect_private.is_active_commission_employee() and downloaded_by=(select dd_connect_private.commission_actor_id()) and exists(select 1 from public.dialog_reports r where r.id=report_id and r.deleted_at is null));
drop policy if exists report_downloads_read_scope on public.report_downloads;
create policy report_downloads_read_scope on public.report_downloads for select to authenticated
using (dd_connect_private.is_dialog_reports_owner() or downloaded_by=(select dd_connect_private.commission_actor_id()));

drop policy if exists report_archive_read_scope on public.report_archive;
create policy report_archive_read_scope on public.report_archive for select to authenticated using (dd_connect_private.is_active_commission_employee() and (dd_connect_private.is_dialog_reports_owner() or exists(select 1 from public.dialog_reports r where r.id=report_id and r.deleted_at is null)));
drop policy if exists report_archive_owner_insert on public.report_archive;
create policy report_archive_owner_insert on public.report_archive for insert to authenticated
with check (dd_connect_private.is_dialog_reports_owner() and archived_by=(select dd_connect_private.commission_actor_id()));

drop policy if exists complaint_messages_read_scope on public.complaint_messages;
create policy complaint_messages_read_scope on public.complaint_messages for select to authenticated
using (exists(select 1 from public.commission_complaints c where c.id=complaint_id));
drop policy if exists complaint_messages_insert_scope on public.complaint_messages;
create policy complaint_messages_insert_scope on public.complaint_messages for insert to authenticated
with check (dd_connect_private.is_active_commission_employee() and sender_user_id=(select dd_connect_private.commission_actor_id())
 and exists(select 1 from public.commission_complaints c where c.id=complaint_id and (c.employee_id=(select dd_connect_private.commission_actor_id()) or dd_connect_private.is_dialog_reports_owner())));

drop policy if exists complaint_attachments_read_scope on public.complaint_attachments;
create policy complaint_attachments_read_scope on public.complaint_attachments for select to authenticated
using (exists(select 1 from public.commission_complaints c where c.id=complaint_id));
drop policy if exists complaint_attachments_insert_self on public.complaint_attachments;
create policy complaint_attachments_insert_self on public.complaint_attachments for insert to authenticated
with check (dd_connect_private.is_active_commission_employee() and uploaded_by=(select dd_connect_private.commission_actor_id())
 and exists(select 1 from public.commission_complaints c where c.id=complaint_id and c.employee_id=(select dd_connect_private.commission_actor_id())));

drop policy if exists ez_cash_records_read_scope on public.ez_cash_records;
create policy ez_cash_records_read_scope on public.ez_cash_records for select to authenticated
using (dd_connect_private.is_active_commission_employee() and
 (employee_id=(select dd_connect_private.commission_actor_id()) or dd_connect_private.is_dialog_reports_owner()
  or (team_id is not null and (select dd_connect_private.commission_can_view_team(team_id)))));
drop policy if exists ez_cash_records_owner_insert on public.ez_cash_records;
create policy ez_cash_records_owner_insert on public.ez_cash_records for insert to authenticated
with check (dd_connect_private.is_dialog_reports_owner() and created_by=(select auth.uid()) and updated_by=(select auth.uid()));
drop policy if exists ez_cash_records_owner_update on public.ez_cash_records;
create policy ez_cash_records_owner_update on public.ez_cash_records for update to authenticated
using (dd_connect_private.is_dialog_reports_owner()) with check (dd_connect_private.is_dialog_reports_owner() and updated_by=(select auth.uid()));
drop policy if exists ez_cash_records_owner_delete on public.ez_cash_records;
create policy ez_cash_records_owner_delete on public.ez_cash_records for delete to authenticated using (dd_connect_private.is_dialog_reports_owner());
drop policy if exists ez_cash_history_read_scope on public.ez_cash_history;
create policy ez_cash_history_read_scope on public.ez_cash_history for select to authenticated
using (dd_connect_private.is_dialog_reports_owner() or exists(select 1 from public.ez_cash_records r where r.id=record_id and r.employee_id=(select dd_connect_private.commission_actor_id())));
drop policy if exists ez_cash_reports_read_active on public.ez_cash_reports;
create policy ez_cash_reports_read_active on public.ez_cash_reports for select to authenticated
using (dd_connect_private.is_active_commission_employee() and deleted_at is null);
drop policy if exists ez_cash_reports_owner_insert on public.ez_cash_reports;
create policy ez_cash_reports_owner_insert on public.ez_cash_reports for insert to authenticated
with check (dd_connect_private.is_dialog_reports_owner() and uploaded_by=(select dd_connect_private.commission_actor_id()) and deleted_at is null);
drop policy if exists ez_cash_reports_owner_update on public.ez_cash_reports;
create policy ez_cash_reports_owner_update on public.ez_cash_reports for update to authenticated
using (dd_connect_private.is_dialog_reports_owner()) with check (dd_connect_private.is_dialog_reports_owner());

-- Storage: keep all buckets private. Existing dialog-reports and commission-evidence buckets are reused.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('ez-cash-reports','ez-cash-reports',false,26214400,array['application/pdf','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel','text/csv'])
on conflict(id) do update set public=false,file_size_limit=26214400,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists dialog_reports_storage_read_active on storage.objects;
create policy dialog_reports_storage_read_active on storage.objects for select to authenticated
using (bucket_id='dialog-reports' and dd_connect_private.is_active_commission_employee());
drop policy if exists dialog_reports_storage_owner_insert on storage.objects;
create policy dialog_reports_storage_owner_insert on storage.objects for insert to authenticated
with check (bucket_id='dialog-reports' and dd_connect_private.is_dialog_reports_owner());
drop policy if exists dialog_reports_storage_owner_update on storage.objects;
create policy dialog_reports_storage_owner_update on storage.objects for update to authenticated
using (bucket_id='dialog-reports' and dd_connect_private.is_dialog_reports_owner())
with check (bucket_id='dialog-reports' and dd_connect_private.is_dialog_reports_owner());
drop policy if exists dialog_reports_storage_owner_delete on storage.objects;
create policy dialog_reports_storage_owner_delete on storage.objects for delete to authenticated
using (bucket_id='dialog-reports' and dd_connect_private.is_dialog_reports_owner());

drop policy if exists commission_evidence_read_scope on storage.objects;
create policy commission_evidence_read_scope on storage.objects for select to authenticated
using (bucket_id='commission-evidence' and dd_connect_private.is_active_commission_employee()
 and (dd_connect_private.is_dialog_reports_owner() or (storage.foldername(name))[2]=(select dd_connect_private.commission_actor_id())::text));
drop policy if exists commission_evidence_insert_scope on storage.objects;
create policy commission_evidence_insert_scope on storage.objects for insert to authenticated
with check (bucket_id='commission-evidence' and dd_connect_private.is_active_commission_employee()
 and (storage.foldername(name))[2]=(select dd_connect_private.commission_actor_id())::text);
drop policy if exists ez_cash_reports_storage_read_active on storage.objects;
create policy ez_cash_reports_storage_read_active on storage.objects for select to authenticated
using (bucket_id='ez-cash-reports' and dd_connect_private.is_active_commission_employee());
drop policy if exists ez_cash_reports_storage_owner_insert on storage.objects;
create policy ez_cash_reports_storage_owner_insert on storage.objects for insert to authenticated
with check (bucket_id='ez-cash-reports' and dd_connect_private.is_dialog_reports_owner());
drop policy if exists ez_cash_reports_storage_owner_update on storage.objects;
create policy ez_cash_reports_storage_owner_update on storage.objects for update to authenticated
using (bucket_id='ez-cash-reports' and dd_connect_private.is_dialog_reports_owner())
with check (bucket_id='ez-cash-reports' and dd_connect_private.is_dialog_reports_owner());
drop policy if exists ez_cash_reports_storage_owner_delete on storage.objects;
create policy ez_cash_reports_storage_owner_delete on storage.objects for delete to authenticated
using (bucket_id='ez-cash-reports' and dd_connect_private.is_dialog_reports_owner());

grant select,insert,update,delete on public.dialog_reports,public.report_downloads,public.report_archive,
 public.complaint_messages,public.complaint_attachments,public.ez_cash_records,public.ez_cash_reports to authenticated;
grant select on public.ez_cash_history to authenticated;
