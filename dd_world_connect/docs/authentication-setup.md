# DD WORLD CONNECT authentication deployment

## Existing DD WORLD source of truth
The connected DD WORLD MARKETING Supabase project already stores employees in `public.users` (with `auth_user_id`, `agent_code`, `name`, `phone`, `role`, `status`, `employment_status`, `id_approval_status`, and `team_id`). The authentication migration adds a minimal `public.employees` projection and keeps it synchronized from `public.users`; it does not replace or recreate the existing teams, attendance, sales or commission tables.

## Authentication contract
- Phone number + SMS OTP only; no username/password flow is implemented in the Flutter app.
- The app accepts E.164 numbers (for example, `+94771234567`). Existing local Sri Lankan numbers are normalized from `07XXXXXXXX` to `+947XXXXXXXX` in the employee projection.
- Supabase Auth verifies the OTP and issues a session.
- `employee-session-bootstrap` uses the verified Auth phone to find exactly one employee projection, then rechecks the canonical `public.users` row. It requires `status = 'active'`, `employment_status = 'ACTIVE'`, and `id_approval_status = 'APPROVED'`.
- The function links the verified Auth UID to the canonical `public.users.auth_user_id` only when that field is empty. A conflicting existing link is denied.
- The role is resolved from the canonical source row. `agent` with a team is an Agent; `agent` without a team is routed as Direct Agent. Unknown roles fail closed.
- After authorization, the function registers or validates the one active device and returns the minimal profile used by the Flutter role router.
- A valid OTP without a unique, active, approved employee record does not grant ERP access.

## Important existing-data finding
The current connected database has 37 user records, all marked active and approved in the source status fields, but one normalized phone number is shared by employee codes **9183 and 9293**. The Edge Function rejects that phone as ambiguous. The Owner must correct the duplicate phone assignment in the canonical `public.users` rows before either employee can use phone OTP. The migration intentionally does not add a unique constraint to `employees.phone_e164` until the existing duplicate is resolved.

## Database migration
Apply `supabase/migrations/202610270001_authentication_bridge.sql` to a **development copy of the existing DD WORLD Supabase project first**. Review its SQL and confirm the source columns match the target project before applying it to production.

The migration:
- creates `public.employees` as a projection of existing `public.users`;
- backfills the existing employee rows;
- normalizes local Sri Lankan phone numbers to E.164;
- synchronizes status, approval, role, phone and Auth UID changes from `public.users`;
- creates device registration and audit tables;
- enables RLS and adds no permissive client policies.

The standalone schema in `docs/reference/greenfield-schema.sql` is reference material for a new database only. Do **not** apply that file as a migration to the existing DD WORLD project.

## Supabase dashboard configuration
1. Enable Phone authentication under Authentication > Sign In / Providers.
2. Configure an SMS provider and test delivery to the company's supported countries.
3. Configure OTP expiry and request/verification rate limits appropriate for staff login.
4. Deploy `employee-session-bootstrap` and `owner-reset-device` Edge Functions with JWT verification enabled.
5. Confirm the standard Edge Function environment variables are present. Never copy `SUPABASE_SERVICE_ROLE_KEY` into Flutter, source control, build arguments or logs.
6. Run migrations and security checks in development before production.
7. Provision and update employees through the existing Owner-approved `public.users` workflow so the projection trigger remains the synchronization path.

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
- The Edge Function stores only a SHA-256 hash, not the raw installation ID.
- The first approved login registers the active installation.
- Re-login from the same installation is accepted.
- A different installation is rejected until an active Owner resets the employee's device.
- Reset revokes the active registration and writes an audit log.
- Revoked installation hashes cannot automatically re-register; a replacement installation ID is required after reset.
- App reinstall or clearing secure storage may create a new installation ID and require Owner reset.
- An installation ID is not a tamper-proof hardware identity. Treat it as a device risk control, not as sole authentication.

## Important security follow-up
RLS remains enabled and no broad client policies are added to the new authentication tables. Add reviewed, least-privilege RLS policies and server-validated device checks to each business workflow before exposing it to clients. A client-side role guard is navigation UX only and is not a substitute for backend authorization. Sensitive actions must re-check current employee approval, role and device status on the server.
