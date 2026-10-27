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

## Project status
This folder is the initial application foundation and architecture. It is not yet a production release. Configure project credentials, complete the migrations and policies, implement feature screens and workflows, and run security/integration tests before deployment.

## Setup
1. Install the current stable Flutter SDK and Android toolchain.
2. From this directory run `flutter pub get`.
3. Copy `.env.example` to a local configuration file and provide the Supabase URL and publishable/anon key using your chosen build-time configuration approach.
4. Configure Firebase for each target platform and keep server credentials out of the mobile app.
5. Apply reviewed SQL migrations to a non-production Supabase project first.
6. Test OTP, role isolation, device revocation, GPS permission denial, duplicate activations and commission calculations.

## Security rules
- Never put a Supabase service-role/secret key in the app.
- Never trust a role supplied by the client or user-editable metadata.
- Enforce row access in PostgreSQL RLS and sensitive transitions in server-side functions.
- Require approved active employee records after OTP verification.
- Device registration is a risk control, not proof of identity by itself.
- Collect location only for declared business purposes and with appropriate permission and notice.
