import 'dart:async';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class FcmNotificationService {
  FcmNotificationService(this.client);
  final SupabaseClient client;
  StreamSubscription<String>? tokenSubscription;
  StreamSubscription<RemoteMessage>? foregroundSubscription;

  Future<void> initialize({
    required String employeeId,
    required String deviceRegistrationId,
    required String platform,
  }) async {
    if (Firebase.apps.isEmpty) {
      debugPrint('Firebase config is not initialized; push registration skipped.');
      return;
    }
    final messaging = FirebaseMessaging.instance;
    await messaging.requestPermission(alert: true, badge: true, sound: true);
    final token = await messaging.getToken();
    if (token != null) await _save(employeeId, deviceRegistrationId, platform, token);
    await tokenSubscription?.cancel();
    tokenSubscription = messaging.onTokenRefresh.listen(
      (value) => _save(employeeId, deviceRegistrationId, platform, value),
      onError: (Object error) => debugPrint('FCM token refresh failed: $error'),
    );
    await foregroundSubscription?.cancel();
    foregroundSubscription = FirebaseMessaging.onMessage.listen((message) {
      debugPrint('DD WORLD FCM received: ${message.messageId}');
    });
  }

  Future<void> _save(
    String employeeId,
    String deviceRegistrationId,
    String platform,
    String token,
  ) async {
    try {
      final reservation = await client
          .from('user_devices')
          .select('device_label')
          .eq('id', deviceRegistrationId)
          .eq('employee_id', employeeId)
          .eq('is_active', true)
          .maybeSingle();
      if (reservation == null) return;

      final existing = await client
          .from('user_devices')
          .select('id,employee_id')
          .eq('fcm_token', token)
          .maybeSingle();

      if (existing != null && existing['employee_id']?.toString() != employeeId) {
        debugPrint('FCM token is already registered to another employee; refusing reassignment.');
        return;
      }
      if (existing != null && existing['id']?.toString() != deviceRegistrationId) {
        debugPrint('FCM token belongs to a different device registration; refusing reassignment.');
        return;
      }

      // The server owns registration state and device fingerprints. The client
      // may only attach/refresh the FCM token on its already-active reservation.
      await client.from('user_devices').update({
        'fcm_token': token,
        'platform': platform,
        'last_seen_at': DateTime.now().toUtc().toIso8601String(),
        'updated_at': DateTime.now().toUtc().toIso8601String(),
      }).eq('id', deviceRegistrationId)
        .eq('employee_id', employeeId)
        .eq('is_active', true);
    } catch (error) {
      // A unique-token conflict or temporary network error must not crash sign-in.
      debugPrint('FCM device token registration failed: $error');
    }
  }

  Future<void> dispose() async {
    await tokenSubscription?.cancel();
    await foregroundSubscription?.cancel();
  }
}
