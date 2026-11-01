begin;

create table if not exists public.backup_history (
  id uuid primary key,
  backup_year integer not null check (backup_year between 2000 and 2100),
  created_by uuid not null references public.users(id) on delete restrict,
  status text not null check (status in ('pending','verified','failed')),
  storage_bucket text not null default 'dd-backups',
  zip_path text,
  excel_path text,
  pdf_path text,
  zip_sha256 text,
  excel_sha256 text,
  pdf_sha256 text,
  total_rows bigint not null default 0 check (total_rows >= 0),
  table_counts jsonb not null default '{}'::jsonb,
  manifest jsonb not null default '{}'::jsonb,
  archive_cutoff timestamptz,
  archived_count bigint not null default 0 check (archived_count >= 0),
  archived_at timestamptz,
  failure_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint backup_history_hashes_check check (
    status <> 'verified' or (
      zip_path is not null and excel_path is not null and pdf_path is not null
      and zip_sha256 ~ '^[0-9a-f]{64}$'
      and excel_sha256 ~ '^[0-9a-f]{64}$'
      and pdf_sha256 ~ '^[0-9a-f]{64}$'
      and completed_at is not null
    )
  )
);

create table if not exists public.archive_records (
  id bigint generated always as identity primary key,
  batch_id uuid not null references public.backup_history(id) on delete restrict,
  source_table text not null,
  source_pk jsonb not null,
  record_data jsonb not null,
  record_timestamp timestamptz not null,
  archived_at timestamptz not null default now(),
  unique (batch_id, source_table, source_pk)
);

create table if not exists public.backup_snapshot_records (
  id bigint generated always as identity primary key,
  backup_id uuid not null references public.backup_history(id) on delete cascade,
  source_table text not null,
  source_pk jsonb not null,
  record_data jsonb not null,
  record_timestamp timestamptz not null,
  row_sha256 text not null check (row_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  unique (backup_id, source_table, source_pk)
);

create table if not exists public.archive_logs (
  id bigint generated always as identity primary key,
  batch_id uuid not null references public.backup_history(id) on delete restrict,
  actor_user_id uuid not null references public.users(id) on delete restrict,
  action text not null check (action in ('ARCHIVE','RESTORE')),
  source_table text not null,
  affected_count bigint not null default 0 check (affected_count >= 0),
  cutoff_at timestamptz,
  status text not null check (status in ('completed','partial')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists backup_history_created_at_idx on public.backup_history(created_at desc);
create index if not exists archive_records_batch_table_idx on public.archive_records(batch_id, source_table);
create index if not exists backup_snapshot_records_backup_idx on public.backup_snapshot_records(backup_id, source_table);
create index if not exists archive_logs_batch_idx on public.archive_logs(batch_id, created_at desc);

alter table public.backup_history enable row level security;
alter table public.archive_records enable row level security;
alter table public.backup_snapshot_records enable row level security;
alter table public.archive_logs enable row level security;

drop policy if exists backup_history_owner_read on public.backup_history;
create policy backup_history_owner_read on public.backup_history
for select to authenticated using ((select dd_connect_private.is_owner()));

drop policy if exists archive_records_owner_read on public.archive_records;
create policy archive_records_owner_read on public.archive_records
for select to authenticated using ((select dd_connect_private.is_owner()));

drop policy if exists archive_logs_owner_read on public.archive_logs;
create policy archive_logs_owner_read on public.archive_logs
for select to authenticated using ((select dd_connect_private.is_owner()));

-- Snapshot staging is server-only. No authenticated or anonymous client policies are created.
revoke all on public.backup_snapshot_records from anon, authenticated;
revoke insert, update, delete on public.backup_history from anon, authenticated;
revoke insert, update, delete on public.archive_records from anon, authenticated;
revoke insert, update, delete on public.archive_logs from anon, authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('dd-backups','dd-backups',false,104857600,
  array['application/zip','application/pdf','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/json'])
on conflict (id) do update set
  public=false,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists dd_backups_owner_read on storage.objects;
create policy dd_backups_owner_read on storage.objects
for select to authenticated
using (bucket_id='dd-backups' and (select dd_connect_private.is_owner()));

create or replace function public.archive_old_records(p_backup_id uuid, p_cutoff timestamptz default now() - interval '12 months')
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  actor uuid;
  session_text text;
  backup_row public.backup_history%rowtype;
  item record;
  staged record;
  is_same boolean;
  deleted_rows bigint;
  archived_rows bigint;
  table_result jsonb := '{}'::jsonb;
  total_archived bigint := 0;
  table_name text;
  date_column text;
begin
  if auth.uid() is null or not dd_connect_private.is_owner() then
    raise exception 'OWNER_ONLY' using errcode='42501';
  end if;

  session_text := auth.jwt()->>'session_id';
  if session_text is null or not exists (
    select 1 from auth.sessions s
    where s.id = session_text::uuid
      and s.user_id = auth.uid()
      and s.created_at >= now() - interval '10 minutes'
  ) then
    raise exception 'FRESH_OTP_REQUIRED' using errcode='42501';
  end if;

  select * into backup_row
  from public.backup_history
  where id = p_backup_id and status = 'verified'
  for update;

  if not found or backup_row.zip_path is null or backup_row.zip_sha256 is null then
    raise exception 'VERIFIED_BACKUP_REQUIRED' using errcode='22023';
  end if;
  if p_cutoff is null or p_cutoff > now() - interval '12 months' + interval '1 minute' then
    raise exception 'ARCHIVE_CUTOFF_MUST_BE_AT_LEAST_12_MONTHS_OLD' using errcode='22023';
  end if;

  actor := (select u.id from public.users u where u.auth_user_id=auth.uid() and lower(u.role)='owner' limit 1);

  -- All tables below are an explicit allowlist. Master/configuration tables are never archived.
  for item in
    select * from (values
      ('attendance_logs', 'occurred_at'),
      ('activation_logs', 'created_at'),
      ('commission_history', 'created_at'),
      ('commission_comments', 'created_at'),
      ('community_comments', 'created_at'),
      ('complaint_messages', 'created_at'),
      ('complaint_attachments', 'created_at'),
      ('conversation_messages', 'created_at'),
      ('group_messages', 'created_at'),
      ('meeting_attendance', 'marked_at'),
      ('download_history', 'downloaded_at'),
      ('training_views', 'viewed_at'),
      ('report_downloads', 'downloaded_at'),
      ('team_audit_logs', 'created_at'),
      ('employee_transfer_history', 'transferred_at'),
      ('team_transfer_history', 'transferred_at'),
      ('commission_agent_payments', 'received_at'),
      ('commission_payment_issues', 'reported_at'),
      ('notifications', 'created_at'),
      ('security_alerts', 'timestamp'),
      ('qr_verifications', 'scanned_at'),
      ('messages', 'timestamp'),
      ('sales', 'sale_date'),
      ('attendance', 'date'),
      ('activations', 'created_at')
    ) as allowed(table_name, date_column)
  loop
    archived_rows := 0;

    for staged in
      select s.* from public.backup_snapshot_records s
      where s.backup_id=p_backup_id
        and s.source_table=item.table_name
        and s.record_timestamp < p_cutoff
      order by s.id
    loop
      execute format(
        'select exists(select 1 from public.%I t where t.id::text = $1 and to_jsonb(t) = $2 for update)',
        item.table_name
      )
      into is_same
      using staged.source_pk->>'id', staged.record_data;

      if is_same then
        insert into public.archive_records(batch_id,source_table,source_pk,record_data,record_timestamp)
        values(p_backup_id,item.table_name,staged.source_pk,staged.record_data,staged.record_timestamp)
        on conflict (batch_id,source_table,source_pk) do nothing;

        execute format('delete from public.%I t where t.id::text = $1 and to_jsonb(t) = $2', item.table_name)
        using staged.source_pk->>'id', staged.record_data;
        get diagnostics deleted_rows = row_count;
        archived_rows := archived_rows + deleted_rows;
      end if;
    end loop;

    if archived_rows > 0 then
      insert into public.archive_logs(batch_id,actor_user_id,action,source_table,affected_count,cutoff_at,status,details)
      values(p_backup_id,actor,'ARCHIVE',item.table_name,archived_rows,p_cutoff,'completed',
        jsonb_build_object('backup_verified',true,'only_unchanged_snapshot_rows',true));
    end if;

    table_result := table_result || jsonb_build_object(item.table_name,archived_rows);
    total_archived := total_archived + archived_rows;
  end loop;

  delete from public.backup_snapshot_records where backup_id=p_backup_id;

  update public.backup_history
  set archive_cutoff=p_cutoff, archived_count=total_archived, archived_at=now()
  where id=p_backup_id;

  return jsonb_build_object(
    'backup_id',p_backup_id,
    'archived_count',total_archived,
    'cutoff_at',p_cutoff,
    'tables',table_result
  );
end
$function$;

revoke all on function public.archive_old_records(uuid,timestamptz) from public, anon;
grant execute on function public.archive_old_records(uuid,timestamptz) to authenticated;

create or replace function public.restore_archive_batch(p_batch_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  actor uuid;
  item record;
  archived record;
  restored_rows bigint;
  inserted_rows bigint;
  table_result jsonb := '{}'::jsonb;
  total_restored bigint := 0;
begin
  if auth.uid() is null or not dd_connect_private.is_owner() then
    raise exception 'OWNER_ONLY' using errcode='42501';
  end if;

  if not exists(select 1 from public.backup_history b where b.id=p_batch_id and b.status='verified') then
    raise exception 'VERIFIED_BACKUP_REQUIRED' using errcode='22023';
  end if;

  actor := (select u.id from public.users u where u.auth_user_id=auth.uid() and lower(u.role)='owner' limit 1);

  -- Restore parent records before their event children.
  for item in
    select * from (values
      ('sales',1),('attendance',2),('activations',3),
      ('attendance_logs',4),('activation_logs',5),
      ('commission_history',6),('commission_comments',7),
      ('community_comments',8),
      ('complaint_messages',9),('complaint_attachments',10),
      ('conversation_messages',11),('group_messages',12),
      ('meeting_attendance',13),('download_history',14),
      ('training_views',15),('report_downloads',16),
      ('team_audit_logs',17),('employee_transfer_history',18),
      ('team_transfer_history',19),('commission_agent_payments',20),
      ('commission_payment_issues',21),('notifications',22),
      ('security_alerts',23),('qr_verifications',24),('messages',25)
    ) as allowed(table_name, restore_order)
    order by restore_order
  loop
    restored_rows := 0;
    for archived in
      select a.* from public.archive_records a
      where a.batch_id=p_batch_id and a.source_table=item.table_name
      order by a.id
    loop
      execute format(
        'insert into public.%I select (pg_catalog.jsonb_populate_record(null::public.%I, $1)).* on conflict do nothing',
        item.table_name,item.table_name
      ) using archived.record_data;
      get diagnostics inserted_rows = row_count;
      restored_rows := restored_rows + inserted_rows;
      total_restored := total_restored + inserted_rows;
    end loop;

    if restored_rows > 0 then
      insert into public.archive_logs(batch_id,actor_user_id,action,source_table,affected_count,status,details)
      values(p_batch_id,actor,'RESTORE',item.table_name,restored_rows,'completed',
        jsonb_build_object('conflict_policy','do_nothing'));
    end if;
    table_result := table_result || jsonb_build_object(item.table_name,restored_rows);
  end loop;

  return jsonb_build_object('backup_id',p_batch_id,'restored_count',total_restored,'tables',table_result);
end
$function$;

revoke all on function public.restore_archive_batch(uuid) from public, anon;
grant execute on function public.restore_archive_batch(uuid) to authenticated;

grant select on public.backup_history, public.archive_records, public.archive_logs to authenticated;

commit;
