-- Employee Identity, Document Vault, Leave, Downloads and Training.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.employee_id_cards(
 id uuid primary key default gen_random_uuid(),
 employee_id uuid not null unique references public.users(id) on delete restrict,
 card_number text not null unique,
 employee_photo_path text,
 company_logo_path text,
 qr_token_hash text not null unique,
 status text not null default 'active' check(status in ('active','suspended','revoked','expired')),
 issued_at timestamptz not null default now(),
 expires_at timestamptz,
 issued_by uuid not null references public.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.qr_verifications(
 id uuid primary key default gen_random_uuid(),
 employee_id uuid not null references public.users(id) on delete restrict,
 scanned_by uuid not null references public.users(id) on delete restrict,
 result text not null check(result in ('valid','inactive','revoked','expired','not_found')),
 scanned_at timestamptz not null default now(),
 device_label text
);
create table if not exists public.employee_documents(
 id uuid primary key default gen_random_uuid(),
 employee_id uuid not null references public.users(id) on delete restrict,
 document_type text not null check(document_type in ('nic_front','nic_back','police_report','grama_sevaka_report','education_certificate','cv','previous_employment_record')),
 file_path text not null unique,
 file_name text not null,
 mime_type text not null,
 file_size_bytes bigint not null check(file_size_bytes>0 and file_size_bytes<=26214400),
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 submitted_at timestamptz not null default now(),
 reviewed_at timestamptz,
 reviewed_by uuid references public.users(id),
 review_note text,
 version integer not null default 1 check(version>0)
);
create table if not exists public.document_verifications(
 id uuid primary key default gen_random_uuid(),
 document_id uuid not null references public.employee_documents(id) on delete restrict,
 verifier_id uuid not null references public.users(id),
 decision text not null check(decision in ('approved','rejected')),
 note text,
 created_at timestamptz not null default now()
);

-- The existing leave_requests table is retained to preserve its historical data.
alter table public.leave_requests add column if not exists review_stage text not null default 'PENDING_TEAM_LEADER';
alter table public.leave_requests add column if not exists half_day_period text;
alter table public.leave_requests add column if not exists days numeric(5,2);
alter table public.leave_requests add column if not exists cancelled_at timestamptz;
alter table public.leave_requests drop constraint if exists leave_requests_leave_type_check;
alter table public.leave_requests add constraint leave_requests_leave_type_check
 check(leave_type in ('annual','casual','sick','half_day','ANNUAL','CASUAL','SICK','HALF_DAY'));
alter table public.leave_requests drop constraint if exists leave_requests_review_stage_check;
alter table public.leave_requests add constraint leave_requests_review_stage_check
 check(review_stage in ('PENDING_TEAM_LEADER','PENDING_OWNER','APPROVED','REJECTED','CANCELLED'));
create table if not exists public.leave_approvals(
 id uuid primary key default gen_random_uuid(),
 leave_request_id uuid not null references public.leave_requests(id) on delete restrict,
 reviewer_id uuid not null references public.users(id),
 reviewer_role text not null check(reviewer_role in ('team_leader','owner')),
 decision text not null check(decision in ('approved','rejected')),
 note text,
 created_at timestamptz not null default now()
);

create table if not exists public.downloads(
 id uuid primary key default gen_random_uuid(),
 title text not null,
 description text,
 category text not null check(category in ('pdf_report','excel_report','training_file','company_file')),
 file_path text not null unique,
 file_name text not null,
 mime_type text not null,
 file_size_bytes bigint not null check(file_size_bytes>0 and file_size_bytes<=52428800),
 is_published boolean not null default true,
 uploaded_by uuid not null references public.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.download_history(
 id uuid primary key default gen_random_uuid(),
 download_id uuid not null references public.downloads(id) on delete restrict,
 employee_id uuid not null references public.users(id) on delete restrict,
 downloaded_at timestamptz not null default now()
);
create table if not exists public.training_materials(
 id uuid primary key default gen_random_uuid(),
 title text not null,
 description text,
 product text not null check(product in ('sayuru','govimithuru','general')),
 material_type text not null check(material_type in ('video','pdf','presentation')),
 file_path text not null unique,
 file_name text not null,
 mime_type text not null,
 file_size_bytes bigint not null check(file_size_bytes>0 and file_size_bytes<=104857600),
 duration_seconds integer check(duration_seconds is null or duration_seconds>0),
 is_published boolean not null default true,
 sort_order integer not null default 0,
 uploaded_by uuid not null references public.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.training_views(
 id uuid primary key default gen_random_uuid(),
 material_id uuid not null references public.training_materials(id) on delete restrict,
 employee_id uuid not null references public.users(id) on delete restrict,
 viewed_at timestamptz not null default now(),
 completed_at timestamptz,
 unique(material_id,employee_id)
);

-- Private, server-side helpers use the canonical employee mapping and existing active-employee checks.
create or replace function dd_connect_private.identity_employee_id()
returns uuid language sql stable security invoker set search_path=public,dd_connect_private,pg_temp
as $$ select dd_connect_private.current_employee_id() $$;
create or replace function dd_connect_private.identity_is_owner()
returns boolean language sql stable security invoker set search_path=public,dd_connect_private,pg_temp
as $$ select dd_connect_private.is_owner() $$;
create or replace function dd_connect_private.identity_can_review_team(target_team uuid)
returns boolean language sql stable security invoker set search_path=public,dd_connect_private,pg_temp
as $$ select exists(select 1 from public.users u where u.id=dd_connect_private.current_employee_id() and u.role='team_leader' and u.team_id=target_team and u.status='active' and u.employment_status='ACTIVE' and u.id_approval_status='APPROVED') $$;

alter table public.employee_id_cards enable row level security;
alter table public.qr_verifications enable row level security;
alter table public.employee_documents enable row level security;
alter table public.document_verifications enable row level security;
alter table public.leave_approvals enable row level security;
alter table public.downloads enable row level security;
alter table public.download_history enable row level security;
alter table public.training_materials enable row level security;
alter table public.training_views enable row level security;

drop policy if exists employee_id_cards_read_scoped on public.employee_id_cards;
create policy employee_id_cards_read_scoped on public.employee_id_cards for select to authenticated
using (public.is_active_employee() and (employee_id=dd_connect_private.identity_employee_id() or dd_connect_private.identity_is_owner()));
drop policy if exists employee_id_cards_owner_manage on public.employee_id_cards;
create policy employee_id_cards_owner_manage on public.employee_id_cards for all to authenticated
using (dd_connect_private.identity_is_owner()) with check (dd_connect_private.identity_is_owner());

drop policy if exists qr_verifications_owner_read on public.qr_verifications;
create policy qr_verifications_owner_read on public.qr_verifications for select to authenticated
using (dd_connect_private.identity_is_owner());
drop policy if exists employee_documents_read_scoped on public.employee_documents;
create policy employee_documents_read_scoped on public.employee_documents for select to authenticated
using (public.is_active_employee() and (employee_id=dd_connect_private.identity_employee_id() or dd_connect_private.identity_is_owner()));
drop policy if exists employee_documents_insert_self on public.employee_documents;
create policy employee_documents_insert_self on public.employee_documents for insert to authenticated
with check (public.is_active_employee() and employee_id=dd_connect_private.identity_employee_id() and status='pending' and reviewed_by is null);
drop policy if exists employee_documents_owner_update on public.employee_documents;
create policy employee_documents_owner_update on public.employee_documents for update to authenticated
using (dd_connect_private.identity_is_owner()) with check (dd_connect_private.identity_is_owner());
drop policy if exists employee_documents_owner_delete on public.employee_documents;
create policy employee_documents_owner_delete on public.employee_documents for delete to authenticated
using (dd_connect_private.identity_is_owner());
drop policy if exists document_verifications_owner_read on public.document_verifications;
create policy document_verifications_owner_read on public.document_verifications for select to authenticated using (dd_connect_private.identity_is_owner());
drop policy if exists document_verifications_owner_insert on public.document_verifications;
create policy document_verifications_owner_insert on public.document_verifications for insert to authenticated
with check (dd_connect_private.identity_is_owner() and verifier_id=dd_connect_private.identity_employee_id());

drop policy if exists leave_approvals_read_scoped on public.leave_approvals;
create policy leave_approvals_read_scoped on public.leave_approvals for select to authenticated
using (dd_connect_private.identity_is_owner() or reviewer_id=dd_connect_private.identity_employee_id() or exists(select 1 from public.leave_requests lr where lr.id=leave_request_id and lr.user_id=dd_connect_private.identity_employee_id()));
drop policy if exists leave_approvals_insert_via_rpc on public.leave_approvals;
create policy leave_approvals_insert_via_rpc on public.leave_approvals for insert to authenticated with check(false);
-- Prevent client-side bypass of the ordered TL -> Owner review workflow.
drop policy if exists leave_requests_update_owner_or_team_leader on public.leave_requests;
drop policy if exists leave_requests_update on public.leave_requests;
drop policy if exists leave_requests_update_owner on public.leave_requests;
grant select,insert on public.leave_requests to authenticated;
revoke update,delete on public.leave_requests from authenticated;

create or replace function public.review_leave_request(p_leave_request_id uuid,p_decision text,p_note text default null)
returns public.leave_requests
language plpgsql security definer
set search_path=public,dd_connect_private,pg_temp
as $$
declare actor uuid; actor_role text; target public.leave_requests; updated public.leave_requests;
begin
 if auth.uid() is null or not public.is_active_employee() then raise exception 'Active employee authentication required'; end if;
 actor:=dd_connect_private.current_employee_id();
 select role into actor_role from public.users where id=actor;
 select * into target from public.leave_requests where id=p_leave_request_id for update;
 if not found then raise exception 'Leave request not found'; end if;
 if p_decision not in ('approved','rejected') then raise exception 'Decision must be approved or rejected'; end if;
 if actor_role='team_leader' and target.review_stage='PENDING_TEAM_LEADER'
   and exists(select 1 from public.users requester where requester.id=target.user_id and requester.team_id=target.team_id)
 then
   insert into public.leave_approvals(leave_request_id,reviewer_id,reviewer_role,decision,note)
   values(target.id,actor,'team_leader',p_decision,p_note);
   update public.leave_requests set review_stage=case when p_decision='approved' then 'PENDING_OWNER' else 'REJECTED' end,
    status=case when p_decision='approved' then 'PENDING_OWNER' else 'REJECTED' end,
    reviewed_by=actor,reviewed_at=now(),review_note=p_note,updated_at=now()
   where id=target.id returning * into updated;
 elsif actor_role='owner' and target.review_stage='PENDING_OWNER' then
   insert into public.leave_approvals(leave_request_id,reviewer_id,reviewer_role,decision,note)
   values(target.id,actor,'owner',p_decision,p_note);
   update public.leave_requests set review_stage=case when p_decision='approved' then 'APPROVED' else 'REJECTED' end,
    status=case when p_decision='approved' then 'APPROVED' else 'REJECTED' end,
    reviewed_by=actor,reviewed_at=now(),review_note=p_note,updated_at=now()
   where id=target.id returning * into updated;
 else raise exception 'You are not authorized for this leave review stage'; end if;
 return updated;
end $$;
revoke all on function public.review_leave_request(uuid,text,text) from public,anon;
grant execute on function public.review_leave_request(uuid,text,text) to authenticated;

drop policy if exists downloads_read_published on public.downloads;
create policy downloads_read_published on public.downloads for select to authenticated using(public.is_active_employee() and is_published);
drop policy if exists downloads_owner_manage on public.downloads;
create policy downloads_owner_manage on public.downloads for all to authenticated using(dd_connect_private.identity_is_owner()) with check(dd_connect_private.identity_is_owner());
drop policy if exists download_history_read_scoped on public.download_history;
create policy download_history_read_scoped on public.download_history for select to authenticated
using(employee_id=dd_connect_private.identity_employee_id() or dd_connect_private.identity_is_owner());
drop policy if exists download_history_insert_self on public.download_history;
create policy download_history_insert_self on public.download_history for insert to authenticated
with check(employee_id=dd_connect_private.identity_employee_id() and exists(select 1 from public.downloads d where d.id=download_id and d.is_published));

drop policy if exists training_materials_read_published on public.training_materials;
create policy training_materials_read_published on public.training_materials for select to authenticated using(public.is_active_employee() and is_published);
drop policy if exists training_materials_owner_manage on public.training_materials;
create policy training_materials_owner_manage on public.training_materials for all to authenticated using(dd_connect_private.identity_is_owner()) with check(dd_connect_private.identity_is_owner());
drop policy if exists training_views_read_scoped on public.training_views;
create policy training_views_read_scoped on public.training_views for select to authenticated
using(employee_id=dd_connect_private.identity_employee_id() or dd_connect_private.identity_is_owner());
drop policy if exists training_views_insert_self on public.training_views;
create policy training_views_insert_self on public.training_views for insert to authenticated
with check(employee_id=dd_connect_private.identity_employee_id() and exists(select 1 from public.training_materials t where t.id=material_id and t.is_published));
drop policy if exists training_views_update_self on public.training_views;
create policy training_views_update_self on public.training_views for update to authenticated
using(employee_id=dd_connect_private.identity_employee_id()) with check(employee_id=dd_connect_private.identity_employee_id());

-- QR verification returns only the fields printed on an employee card. Raw QR tokens are never stored.
create or replace function public.verify_employee_qr(p_token text)
returns table(employee_name text,staff_code text,team_name text,position text,status text,verified boolean)
language plpgsql security definer
set search_path=public,dd_connect_private,extensions,pg_temp
as $$
declare scanner uuid; card public.employee_id_cards; emp public.users; team_label text;
begin
 if auth.uid() is null or not public.is_active_employee() then raise exception 'Active employee authentication required'; end if;
 scanner:=dd_connect_private.current_employee_id();
 select c.* into card from public.employee_id_cards c
 where c.qr_token_hash=encode(extensions.digest(convert_to(p_token,'UTF8'),'sha256'),'hex') limit 1;
 if not found then raise exception 'Employee QR code not recognized'; end if;
 select u.* into emp from public.users u where u.id=card.employee_id;
 select t.name into team_label from public.teams t where t.id=emp.team_id;
 insert into public.qr_verifications(employee_id,scanned_by,result)
 values(emp.id,scanner,case when card.status='active' and emp.status='active' and emp.employment_status='ACTIVE' and emp.id_approval_status='APPROVED' then 'valid' when card.status='revoked' then 'revoked' else 'inactive' end);
 return query select emp.name,coalesce(emp.agent_code,''),coalesce(team_label,''),replace(initcap(replace(emp.role,'_',' ')),'Team Leader','Team Leader'),
 case when card.status<>'active' then card.status when emp.status<>'active' or emp.employment_status<>'ACTIVE' or emp.id_approval_status<>'APPROVED' then 'inactive' else 'active' end,
 (card.status='active' and emp.status='active' and emp.employment_status='ACTIVE' and emp.id_approval_status='APPROVED');
end $$;
revoke all on function public.verify_employee_qr(text) from public,anon;
grant execute on function public.verify_employee_qr(text) to authenticated;

-- Storage: private buckets, employee-owned document folders; Owner-managed shared resources.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('employee-documents','employee-documents',false,26214400,array['image/jpeg','image/png','image/webp','application/pdf']),
 ('dd-downloads','dd-downloads',false,52428800,array['application/pdf','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel','text/csv','application/zip']),
 ('dd-training-materials','dd-training-materials',false,104857600,array['video/mp4','video/quicktime','application/pdf','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.ms-powerpoint'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists employee_documents_storage_select on storage.objects;
create policy employee_documents_storage_select on storage.objects for select to authenticated
using(bucket_id='employee-documents' and (dd_connect_private.identity_is_owner() or (storage.foldername(name))[1]=dd_connect_private.identity_employee_id()::text));
drop policy if exists employee_documents_storage_insert on storage.objects;
create policy employee_documents_storage_insert on storage.objects for insert to authenticated
with check(bucket_id='employee-documents' and (storage.foldername(name))[1]=dd_connect_private.identity_employee_id()::text and public.is_active_employee());
drop policy if exists employee_documents_storage_update on storage.objects;
create policy employee_documents_storage_update on storage.objects for update to authenticated
using(bucket_id='employee-documents' and dd_connect_private.identity_is_owner()) with check(bucket_id='employee-documents' and dd_connect_private.identity_is_owner());
drop policy if exists employee_documents_storage_delete on storage.objects;
create policy employee_documents_storage_delete on storage.objects for delete to authenticated
using(bucket_id='employee-documents' and dd_connect_private.identity_is_owner());

drop policy if exists dd_downloads_storage_select on storage.objects;
create policy dd_downloads_storage_select on storage.objects for select to authenticated
using(bucket_id='dd-downloads' and public.is_active_employee());
drop policy if exists dd_downloads_storage_manage on storage.objects;
create policy dd_downloads_storage_manage on storage.objects for all to authenticated
using(bucket_id='dd-downloads' and dd_connect_private.identity_is_owner()) with check(bucket_id='dd-downloads' and dd_connect_private.identity_is_owner());

drop policy if exists dd_training_storage_select on storage.objects;
create policy dd_training_storage_select on storage.objects for select to authenticated
using(bucket_id='dd-training-materials' and public.is_active_employee());
drop policy if exists dd_training_storage_manage on storage.objects;
create policy dd_training_storage_manage on storage.objects for all to authenticated
using(bucket_id='dd-training-materials' and dd_connect_private.identity_is_owner()) with check(bucket_id='dd-training-materials' and dd_connect_private.identity_is_owner());

grant select,insert,update,delete on public.employee_id_cards,public.qr_verifications,public.employee_documents,public.document_verifications,public.leave_approvals,public.downloads,public.download_history,public.training_materials,public.training_views to authenticated;
