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

  Future<void> initialize({required String employeeId,required String platform}) async {
    if(Firebase.apps.isEmpty){debugPrint('Firebase config is not initialized; push registration skipped.');return;}
    final messaging=FirebaseMessaging.instance;
    await messaging.requestPermission(alert:true,badge:true,sound:true);
    final token=await messaging.getToken();
    if(token!=null)await _save(employeeId,platform,token);
    await tokenSubscription?.cancel();
    tokenSubscription=messaging.onTokenRefresh.listen((t)=>_save(employeeId,platform,t));
    await foregroundSubscription?.cancel();
    foregroundSubscription=FirebaseMessaging.onMessage.listen((m){debugPrint('DD WORLD FCM received: ${m.messageId}');});
  }

  Future<void> _save(String employeeId,String platform,String token) async {
    await client.from('user_devices').upsert({'employee_id':employeeId,'platform':platform,'fcm_token':token,'is_active':true,'last_seen_at':DateTime.now().toUtc().toIso8601String()},onConflict:'fcm_token');
  }

  Future<void> dispose() async {
    await tokenSubscription?.cancel();
    await foregroundSubscription?.cancel();
  }
}
