create or replace function dd_connect_private.set_ez_cash_updated_at()
returns trigger language plpgsql set search_path=pg_catalog
as $$ begin new.updated_at=now(); return new; end $$;
revoke all on function dd_connect_private.set_ez_cash_updated_at() from public;
drop trigger if exists ez_cash_updated_at_trigger on public.ez_cash_records;
create trigger ez_cash_updated_at_trigger before update on public.ez_cash_records
for each row execute function dd_connect_private.set_ez_cash_updated_at();
