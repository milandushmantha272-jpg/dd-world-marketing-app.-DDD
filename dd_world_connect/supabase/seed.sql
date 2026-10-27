-- DD WORLD CONNECT local/dev seed hygiene.
-- Employee 9293 was removed from the canonical DD WORLD roster. Keep this guard
-- in development seeds so the retired employee cannot be reintroduced by stale
-- local fixture data. This does not delete historical sales records.
delete from public.users where agent_code = '9293';
