begin;
CREATE OR REPLACE FUNCTION public.archive_old_records(p_backup_id uuid, p_cutoff timestamp with time zone DEFAULT (now() - '1 year'::interval))
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
      if item.table_name = 'attendance' then
        execute 'select exists(select 1 from public.attendance t where t.id::text = $1 and to_jsonb(t) = $2 and not exists(select 1 from public.attendance_logs l where l.attendance_id=t.id) for update)'
        into is_same using staged.source_pk->>'id', staged.record_data;
      elsif item.table_name = 'activations' then
        execute 'select exists(select 1 from public.activations t where t.id::text = $1 and to_jsonb(t) = $2 and not exists(select 1 from public.activation_logs l where l.activation_id=t.id) for update)'
        into is_same using staged.source_pk->>'id', staged.record_data;
      else
        execute format(
          'select exists(select 1 from public.%I t where t.id::text = $1 and to_jsonb(t) = $2 for update)',
          item.table_name
        )
        into is_same
        using staged.source_pk->>'id', staged.record_data;
      end if;

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
$function$
;
commit;
