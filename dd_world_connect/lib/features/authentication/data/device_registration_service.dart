import 'dart:io';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:uuid/uuid.dart';

class DeviceRegistrationService {
  DeviceRegistrationService({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  static const _installationIdKey = 'dd_world_connect_installation_id';
  final FlutterSecureStorage _storage;
  static const _uuid = Uuid();

  /// Creates one random installation identifier and persists it in secure storage.
  /// The server stores only a hash of this value. It is an installation signal,
  /// not an unforgeable hardware identity; reinstalling/clearing app data may
  /// require an Owner to reset the registered device.
  Future<String> getInstallationId() async {
    final existing = await _storage.read(key: _installationIdKey);
    if (existing != null && existing.isNotEmpty) return existing;

    final generated = _uuid.v4();
    await _storage.write(key: _installationIdKey, value: generated);
    return generated;
  }

  String get platform {
    if (Platform.isAndroid) return 'android';
    if (Platform.isIOS) return 'ios';
    return 'other';
  }
}
