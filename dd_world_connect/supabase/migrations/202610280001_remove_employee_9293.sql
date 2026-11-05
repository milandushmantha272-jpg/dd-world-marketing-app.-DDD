-- Employee removal: code 9293 (Haseema Sewwandi).
-- The migration is identity-guarded and idempotent. Historical sales rows are retained.
do $$
declare
  v_employee_id uuid;
  v_auth_user_id uuid;
  v_schema text;
  v_table text;
  v_column text;
begin
  select id, auth_user_id into v_employee_id, v_auth_user_id
  from public.users
  where agent_code = '9293'
    and lower(trim(name)) = lower('Haseema sewwandi')
    and regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') = '0763878628';

  if v_employee_id is null then
    raise notice 'Employee 9293 already absent or identity no longer matches; no deletion performed.';
    return;
  end if;

  update public.users set reports_to_user_id = null where reports_to_user_id = v_employee_id;

  for v_schema, v_table, v_column in
    select distinct tc.table_schema, tc.table_name, kcu.column_name
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu
      on kcu.constraint_name = tc.constraint_name and kcu.constraint_schema = tc.constraint_schema
    join information_schema.constraint_column_usage ccu
      on ccu.constraint_name = tc.constraint_name and ccu.constraint_schema = tc.constraint_schema
    where tc.constraint_type = 'FOREIGN KEY'
      and ccu.table_schema = 'public' and ccu.table_name = 'users'
      and not (tc.table_schema = 'public' and tc.table_name = 'users')
  loop
    execute format('delete from %I.%I where %I = $1', v_schema, v_table, v_column) using v_employee_id;
  end loop;

  if to_regclass('public.device_registrations') is not null then
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='device_registrations' and column_name='employee_id') then
      execute 'delete from public.device_registrations where employee_id = $1' using v_employee_id;
    end if;
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='device_registrations' and column_name='employee_code') then
      execute 'delete from public.device_registrations where employee_code = $1' using '9293';
    end if;
  end if;

  if to_regclass('public.otp_login_records') is not null then
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='otp_login_records' and column_name='employee_id') then
      execute 'delete from public.otp_login_records where employee_id = $1' using v_employee_id;
    end if;
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='otp_login_records' and column_name='employee_code') then
      execute 'delete from public.otp_login_records where employee_code = $1' using '9293';
    end if;
  end if;

  delete from public.users where id = v_employee_id;

  -- Only delete Auth when explicitly linked to this employee; never delete by phone,
  -- because the same phone had also been assigned to employee 9183.
  if v_auth_user_id is not null then
    delete from auth.users where id = v_auth_user_id;
  end if;
end $$;

do $$
declare v_duplicate_count integer;
begin
  select count(*) into v_duplicate_count from (
    select regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') normalized_phone
    from public.users
    where nullif(regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g'), '') is not null
    group by regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g')
    having count(*) > 1
  ) d;
  if v_duplicate_count > 0 then
    raise exception 'Duplicate normalized phone assignments remain (% groups).', v_duplicate_count;
  end if;
end $$;
