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
    if (token != null) await _save(deviceRegistrationId, platform, token);
    await tokenSubscription?.cancel();
    tokenSubscription = messaging.onTokenRefresh.listen(
      (value) => _save(deviceRegistrationId, platform, value),
      onError: (Object error) => debugPrint('FCM token refresh failed: $error'),
    );
    await foregroundSubscription?.cancel();
    foregroundSubscription = FirebaseMessaging.onMessage.listen((message) {
      debugPrint('DD WORLD FCM received: ${message.messageId}');
    });
  }

  Future<void> _save(String deviceRegistrationId, String platform, String token) async {
    await client.from('user_devices').update({
      'fcm_token': token,
      'platform': platform,
      'is_active': true,
      'last_seen_at': DateTime.now().toUtc().toIso8601String(),
      'updated_at': DateTime.now().toUtc().toIso8601String(),
    }).eq('id', deviceRegistrationId).eq('is_active', true);
  }

  Future<void> dispose() async {
    await tokenSubscription?.cancel();
    await foregroundSubscription?.cancel();
  }
}
