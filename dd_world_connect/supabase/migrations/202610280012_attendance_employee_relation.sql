-- Preserve legacy attendance rows with missing employee links while exposing the
-- canonical employee relation to PostgREST. NOT VALID enforces new writes but keeps
-- historic orphaned rows available for audit and does not delete any data.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname='attendance_user_id_fkey' and conrelid='public.attendance'::regclass
  ) then
    alter table public.attendance
      add constraint attendance_user_id_fkey
      foreign key (user_id) references public.users(id) on delete set null not valid;
  end if;
end $$;
create index if not exists attendance_user_id_idx on public.attendance(user_id) where user_id is not null;
