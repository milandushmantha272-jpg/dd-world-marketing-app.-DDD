# DD WORLD CONNECT

Enterprise employee and sales management platform for **DD WORLD MARKETING** (telecommunication marketing).

## Stack
- Flutter mobile application
- Supabase Phone OTP, PostgreSQL, Row Level Security (RLS), Edge Functions and Storage
- Firebase Cloud Messaging (FCM) for push notifications

## Roles
- Owner: organization-wide control and audited sensitive actions
- Team Leader: assigned team only
- Agent: own records and authorized submissions
- Direct Agent: own records, reporting directly to Owner

## Authentication implementation
The app uses mobile-number SMS OTP only. There is no username/password login screen or password authentication repository.

After OTP verification, the app calls `employee-session-bootstrap`. The server verifies the authenticated Supabase user and requires a matching employee record with `status = 'active'`, `approved = true`, and exactly one current role assignment. The server links the employee to the verified Auth UID and registers or validates the one active device. The app then routes to the dashboard for the server-returned role.

Owner device reset is implemented through the authenticated `owner-reset-device` Edge Function and an Owner-only screen.

See [authentication setup](docs/authentication-setup.md) for migration order, Supabase provider configuration, deployment and security notes.

## Setup
1. Install the current stable Flutter SDK and Android toolchain.
2. Review and apply `supabase/migrations/202610270001_authentication_bridge.sql` to a development copy of the existing DD WORLD Supabase project. Do not apply `docs/reference/greenfield-schema.sql` to the existing project.
3. Apply `supabase/migrations/202610280001_remove_employee_9293.sql` after the bridge migration when setting up a database that still contains the retired employee. Employee code 9293 has been removed from the connected roster; normalized phone duplicate validation returned no duplicate groups.
4. Apply `supabase/migrations/202610280002_employee_management.sql`, then `202610280003_harden_employee_management_rls.sql` and `202610280004_employee_identity_constraints.sql`. These create profile/history/approval tables, photo storage and role-scoped RLS, keep authorization helpers out of the exposed schema, and enforce unique employee codes and normalized phone numbers. All three have been applied to the connected Supabase project.
4. Enable Supabase Phone Auth and configure an SMS provider.
5. Deploy `employee-session-bootstrap` and `owner-reset-device` Edge Functions with JWT verification enabled.
6. Configure the functions' server-side Supabase environment. Never put the service-role key in Flutter or source control.
7. Run `flutter pub get`, `flutter analyze`, and `flutter test` from this directory.
8. Build with the Supabase URL and publishable key supplied via `--dart-define`.

Example:
```sh
flutter build apk --release \
  --dart-define=SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co \
  --dart-define=SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

## Security rules
- Never put a Supabase service-role/secret key in the app.
- Never trust a role supplied by the client or user-editable metadata.
- Enforce row access in PostgreSQL RLS and sensitive transitions in server-side functions.
- Require approved active employee records after OTP verification.
- Device registration is a risk control, not proof of identity by itself.
- Collect location only for declared business purposes and with appropriate permission and notice.

## Project status
The OTP screens, session bootstrap client, role guard, installation ID service, Edge Function source and employee management module are on the feature branch. Employee management includes searchable/filterable roster, details/profile, add/edit form, status changes, team transfer, approval queue, photo upload and status/transfer/approval history. The employee schema migration has been applied and verified in the connected Supabase project. The Flutter changes have not yet passed a fresh CI run or real-device tests; Edge Functions have not been deployed. Do not treat this as a production release until CI, security review, deployment and real-device role/OTP tests pass.

## Team Management module

The Flutter Team Management module is under `lib/features/teams/` and uses the existing canonical `public.teams` table and `public.users.team_id` assignments.

- **Owner:** create/edit/archive teams, appoint or remove leaders, transfer employees, inspect rosters, statistics and history, and delete only teams without dependent records.
- **Team Leader:** access their assigned team, member roster, team statistics, and scoped transfer/leader history.
- **Agent:** view only the assigned team that RLS permits.
- **Direct Agent:** no team assignment is required; team list access is naturally empty unless a team is assigned.

Team fields include unique team code, name, leader, ACTIVE/INACTIVE/ARCHIVED status, description and creation timestamp. The module includes search/status filtering, team details, create/edit, leader appointment, employee transfer, member roster, sales/activation/attendance statistics, transfer history and leader history.

### Team schema migrations

Apply in order after the employee management migrations:

- `202610280005_team_management.sql` — extends existing teams, adds `team_members`, `team_transfer_history`, `team_leader_history`, `team_audit_logs`, RLS and indexes.
- `202610280006_team_transfer_rpc.sql` — adds an Owner-authorized transactional employee-transfer RPC that preserves the supplied reason in audit history.
- `202610280007_team_rpc_security_and_indexes.sql` — makes public RPC entry points SECURITY INVOKER and adds indexes for audit foreign keys.
- `202610280008_scope_team_history_reads.sql` — limits member enumeration and team history to Owner/Team Leader, with Agents seeing only their assigned team and own membership.

All four Team Management migrations have been applied to the connected Supabase project and the new tables were verified with RLS enabled. The migration also reconciled four known legacy synthetic roster team IDs to the matching canonical teams (Nethsara, Dilan, Dilshan and Buddhika) so existing employee assignments and team-scoped sales/messages remain consistent. It did not remove employees.

Flutter unit tests for team status/model mapping are in `test/features/teams/team_test.dart`. A fresh Flutter analyze/test/Android build and real-device OTP/role testing are still required; no CI pass or production release is claimed.

