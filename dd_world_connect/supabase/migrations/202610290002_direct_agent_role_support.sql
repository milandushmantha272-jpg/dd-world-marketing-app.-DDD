-- The Commission Center supports Direct Agents as a first-class employee role.
-- Preserve every existing role while allowing direct_agent rows.
alter table public.users drop constraint if exists users_role_check;
alter table public.users add constraint users_role_check
  check (role = any (array['owner'::text,'team_leader'::text,'junior_team_leader'::text,'agent'::text,'direct_agent'::text,'dialog_officer'::text]));
