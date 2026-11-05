# Supabase setup

This project integrates with the existing DD WORLD MARKETING database. Its canonical employee source is `public.users`; the authentication bridge migration mirrors only the fields needed for secure OTP login into `public.employees`.

## Deployment order
1. Review `migrations/202610270001_authentication_bridge.sql` and confirm the target project contains the expected `public.users` columns.
2. Apply the migration to a development copy first; verify employee counts, approval flags, normalized phones and the trigger synchronization before production.
3. Resolve duplicate normalized phone numbers. The current source data has a duplicate assignment for employee codes 9183 and 9293, and the bootstrap function intentionally denies ambiguous phone matches.
4. Configure Supabase Phone Auth and an SMS provider.
5. Deploy `functions/employee-session-bootstrap` and `functions/owner-reset-device` with JWT verification enabled.
6. Run the RLS/security checks and the Flutter/Deno CI checks.

The migration enables RLS on the new authentication tables but intentionally adds no permissive client policies. Auth profile/device actions use JWT-verified Edge Functions and server-side service-role access. Do not disable RLS to make the app work.

Never put a service-role/secret key in Flutter, build arguments, source control or client-visible configuration. Do not apply `docs/reference/greenfield-schema.sql` to the existing DD WORLD project; it is reference material for a new database.
