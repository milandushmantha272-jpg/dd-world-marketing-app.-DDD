# Supabase setup

1. Create or select a **development** Supabase project.
2. Configure phone OTP and an SMS provider in Supabase Auth.
3. Review and apply migrations in order using the Supabase CLI.
4. Add and test narrowly scoped RLS policies before granting application access.
5. Implement server-side workflows for employee approval, device approval/revocation, attendance review, activation review, commission approval and payout.
6. Configure Firebase FCM delivery through a protected server-side function.
7. Run SQL/RLS tests and inspect Supabase security advisors before production.

The initial migration enables RLS but deliberately defines no permissive client policies. Client CRUD will remain denied until a reviewed policy or server-side workflow explicitly grants it. Do not disable RLS to make the app work.

Do not apply unreviewed migrations directly to production. Back up the database and test rollback/restore procedures first.
