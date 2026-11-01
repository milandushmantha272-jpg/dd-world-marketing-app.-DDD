begin;
CREATE OR REPLACE FUNCTION public.restore_archive_batch(p_batch_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  actor uuid;
  item record;
  archived record;
  restored_rows bigint;
  inserted_rows bigint;
  identity_col record;
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
      ('commission_reports',4),('commissions',5),
      ('meetings',6),('leave_requests',7),
      ('attendance_logs',9),('activation_logs',10),
      ('commission_history',11),('commission_comments',12),
      ('commission_team_submissions',13),('commission_agent_payments',14),
      ('commission_payment_issues',15),('meeting_attendance',16),
      ('leave_approvals',17),('ez_cash_history',18),
      ('community_comments',19),('complaint_messages',20),('complaint_attachments',21),
      ('conversation_messages',22),('group_messages',23),('download_history',24),
      ('training_views',25),('report_downloads',26),('team_audit_logs',27),
      ('employee_transfer_history',28),('team_transfer_history',29),
      ('employee_status_history',30),('team_leader_history',31),
      ('dialog_report_distributions',32),('activation_statistics',33),
      ('attendance_monthly_summary',34),('sales_monthly_summary',35),
      ('notifications',36),('security_alerts',37),('qr_verifications',38),('messages',39)
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
        'insert into public.%I overriding system value select (pg_catalog.jsonb_populate_record(null::public.%I, $1)).* on conflict do nothing',
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

  for identity_col in
    select table_name,column_name from information_schema.columns
    where table_schema='public' and is_identity='YES'
      and table_name in ('activation_logs','commission_history','ez_cash_history')
  loop
    execute format(
      'select pg_catalog.setval(pg_catalog.pg_get_serial_sequence(%L,%L)::regclass, coalesce(max(%I),1), max(%I) is not null) from public.%I',
      'public.'||identity_col.table_name,identity_col.column_name,
      identity_col.column_name,identity_col.column_name,identity_col.table_name
    );
  end loop;

  return jsonb_build_object('backup_id',p_batch_id,'restored_count',total_restored,'tables',table_result);
end
$function$
;
commit;
