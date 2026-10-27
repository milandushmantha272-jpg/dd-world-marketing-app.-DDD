# DD WORLD CONNECT authentication deployment

## Authentication contract
- Phone number + SMS OTP only; no username/password flow is implemented.
- The app accepts phone numbers in E.164 form (for example, `+94771234567`).
- Supabase Auth verifies the OTP and issues a session.
- The `employee-session-bootstrap` Edge Function then matches the verified Auth phone to `employees.phone_e164`, requires `status = 'active'` and `approved = true`, links `auth_user_id` safely, requires exactly one current role assignment, and registers/validates the active device.
- The app does not query employee profile data directly; the bootstrap function returns only the profile fields needed by the authenticated client.
- A valid OTP without an active, approved employee row does not grant ERP access.

## Database migration
Apply these migrations in order to a development Supabase project:
1. `supabase/migrations/202610270001_initial_schema.sql`
2. `supabase/migrations/202610270002_auth_device_security.sql`

The second migration adds `employees.approved` (default false) and a unique partial index allowing at most one `active` device per employee. Before production, review existing data for duplicate active device registrations because such duplicates prevent the unique index from being created.

The existing schema uses the enum value `active` in lowercase; the business meaning is the requested ACTIVE status. The boolean `approved` must be explicitly set to true by an authorized Owner process. Do not automatically approve all existing employees.

## Supabase dashboard configuration
1. Enable Phone authentication under Authentication > Sign In / Providers.
2. Configure an SMS provider and test delivery to the company's supported countries.
3. Configure OTP expiration and request/verification rate limits appropriate for staff login.
4. Deploy both Edge Functions with JWT verification enabled.
5. Confirm the standard Edge Function environment variables are present. Never copy `SUPABASE_SERVICE_ROLE_KEY` into Flutter, source control, build arguments or logs.
6. Apply and test migrations in development before production.
7. Ensure employees are provisioned by an authorized Owner workflow with unique E.164 phone, approved active status and exactly one current role assignment.

## Build
Supply the Supabase project URL and publishable key at build time:
```sh
flutter pub get
flutter analyze
flutter test
flutter build apk --release \
  --dart-define=SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co \
  --dart-define=SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Use the publishable key only. A Supabase secret/service-role key is server-only.

## Device registration behavior
- The app creates a random installation ID and stores it using platform secure storage.
- The Edge Function stores a SHA-256 hash, not the raw installation ID.
- The first approved login registers the active installation.
- Re-login from the same installation is accepted.
- A different installation is rejected until an active Owner resets the employee's device.
- Reset revokes the active registration and writes an audit log.
- App reinstall or clearing secure storage may create a new installation ID and require Owner reset.
- An installation ID is not a tamper-proof hardware identity. Treat it as a device risk control, not as sole authentication.

## Important security follow-up
RLS remains enabled and no broad employee/device policies are added. Add reviewed, least-privilege RLS policies and server-validated device checks to each future business workflow before exposing it to clients. A client-side role guard is navigation UX only and is not a substitute for backend authorization. Sensitive actions must re-check current employee approval, role and device status on the server.
