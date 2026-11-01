begin;
create index if not exists backup_history_created_by_idx on public.backup_history(created_by);
create index if not exists archive_logs_actor_user_id_idx on public.archive_logs(actor_user_id);
commit;