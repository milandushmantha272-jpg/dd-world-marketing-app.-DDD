# DD WORLD CONNECT Communication & Collaboration

## Supabase
Apply migrations in timestamp order. The Communication & Collaboration phase uses:
- `meetings`, `meeting_attendance`
- `conversations`, `conversation_members`, `conversation_messages` (separate from the pre-existing legacy `messages` inbox table)
- `groups`, `group_members`, `group_messages`
- existing `community_posts`, `community_comments`, `community_reactions` extended for announcements and video
- existing `notifications` extended with push delivery status and `user_devices`
- private Storage bucket `dd-world-communication`

The mobile app must only use the Supabase publishable key. RLS uses the active, approved employee row mapped by `auth.uid()`; never put a service-role key in Flutter.

## Firebase Cloud Messaging
1. Create/register the Android and iOS apps in Firebase for the exact application IDs used by the Flutter builds.
2. Add the generated Android `google-services.json` and iOS `GoogleService-Info.plist`; initialize Firebase using the generated FlutterFire options before calling `FcmNotificationService.initialize`.
3. Enable Firebase Cloud Messaging API (HTTP v1) and create a service account with permission to send FCM messages.
4. Store the service-account JSON in Supabase Edge Function secret `FCM_SERVICE_ACCOUNT_JSON`. Do not commit this file or any private key.
5. Deploy `send-push-notification` with JWT verification enabled. Invoke it with a signed-in user's bearer token and a notification ID. A caller may send only their own notification; Owner may send a notification to any employee.
6. Configure backend notification producers to invoke this function after inserting a notification. Without the Firebase app configuration and service-account secret, push delivery is intentionally unavailable; in-app notifications remain available.

## Operational notes
- Meeting scheduling uses the device's local clock and persists UTC timestamps.
- Team Leaders can create meetings and team groups only for their own team; Owner can administer organization-wide groups and meetings.
- Direct conversations are limited to two members by a security-definer membership guard.
- Chat and feed media are stored privately. Signed URLs should be generated only after authorization.
