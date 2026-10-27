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
3. Apply `supabase/migrations/202610280001_remove_employee_9293.sql` after the bridge migration when setting up a database that still contains the retired employee. Employee code 9293 has been removed from the connected roster; normalized phone duplicate validation returned no duplicate groups.\n4. Apply `supabase/migrations/202610280002_employee_management.sql` to create employee profile, status history, transfer history, approval workflow, photo storage and RLS policies. This migration has been applied to the connected Supabase project.
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
