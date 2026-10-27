# Navigation and RBAC

## Authentication flow
Splash -> mobile number -> Supabase SMS OTP -> verify OTP -> resolve employee by authenticated UID -> check employee status and device state -> role-specific home.

A valid OTP alone is not authorization to use the company ERP. The employee must exist, be approved and active. Authorization must be checked on the server and in RLS; hiding UI elements is not a security boundary.

## Role navigation
- Owner: Overview, Employees, Teams, Attendance, Activations, Commission Center, Meetings, Complaints, Notifications, Reports, Audit Log, Settings.
- Team Leader: My Team, Team Sales, Attendance Review, Activation Review (if assigned), Meetings, Complaints, Team Reports, Notifications, Profile.
- Agent: Home, Check In/Out, New Activation, My Sales, My Attendance, My Commission, Meetings, Complaints, Notifications, Profile.
- Direct Agent: same self-service modules as Agent; reporting authority is Owner and no Team Leader membership is required.

## Business workflow
1. Agent submits activation with product, channel, unique reference and server timestamp.
2. Backend validates employee status and duplicate reference.
3. If policy requires review, record stays pending until an authorized reviewer acts.
4. Approved activations feed commission calculation using the rate effective at the business event date.
5. Commission approval and payout are separate audited transitions.
6. Daily and monthly reports aggregate canonical database records and respect RLS.

## Device controls
Maintain a server-side device registration and revocation state. Treat platform identifiers as risk signals, not immutable identity. Revocation should block protected operations and trigger session revocation/reauthentication where supported.

## Data handling
Store timestamps as timestamptz in UTC and display Asia/Colombo. GPS must include accuracy and capture time. Restrict access to precise location records and provide employee notice.
