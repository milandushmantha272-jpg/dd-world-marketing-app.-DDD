import 'package:supabase_flutter/supabase_flutter.dart';

import '../domain/employee_profile.dart';
import 'device_registration_service.dart';

class AuthRepository {
  AuthRepository({
    SupabaseClient? client,
    DeviceRegistrationService? deviceRegistration,
  })  : _client = client ?? Supabase.instance.client,
        _deviceRegistration = deviceRegistration ?? DeviceRegistrationService();

  final SupabaseClient _client;
  final DeviceRegistrationService _deviceRegistration;

  String normalizePhone(String input) {
    final phone = input.replaceAll(RegExp(r'[\s()\-]'), '');
    if (!RegExp(r'^\+[1-9]\d{7,14}$').hasMatch(phone)) {
      throw const AuthInputException(
        'Enter the full mobile number with country code, e.g. +94771234567.',
      );
    }
    return phone;
  }

  Future<void> sendPhoneOtp(String input) async {
    final phone = normalizePhone(input);
    await _client.auth.signInWithOtp(
      phone: phone,
      // OTP may create a Supabase Auth identity, but company access is granted
      // only by the server bootstrap after checking the employee record.
      shouldCreateUser: true,
    );
  }

  Future<void> verifyPhoneOtp({
    required String inputPhone,
    required String token,
  }) async {
    final phone = normalizePhone(inputPhone);
    final normalizedToken = token.trim();
    if (!RegExp(r'^\d{6}$').hasMatch(normalizedToken)) {
      throw const AuthInputException('Enter the 6-digit verification code.');
    }
    await _client.auth.verifyOTP(
      phone: phone,
      token: normalizedToken,
      type: OtpType.sms,
    );
  }

  /// Must be called after OTP verification and on every app cold start.
  /// The server checks employee status/approval, binds the Auth UID, and
  /// registers or validates the one permitted active installation.
  Future<EmployeeProfile> bootstrapSession() async {
    final session = _client.auth.currentSession;
    if (session == null) throw const AuthBlockedException('Please sign in again.');

    final installationId = await _deviceRegistration.getInstallationId();
    final response = await _client.functions.invoke(
      'employee-session-bootstrap',
      body: {
        'installation_id': installationId,
        'platform': _deviceRegistration.platform,
      },
    );

    if (response.status < 200 || response.status >= 300) {
      throw AuthBlockedException(_messageFromResponse(response.data));
    }
    final data = response.data;
    if (data is! Map) {
      throw const AuthBlockedException('The server returned an invalid employee profile.');
    }
    return EmployeeProfile.fromJson(Map<String, dynamic>.from(data));
  }

  Future<void> ownerResetDeviceRegistration(String employeeCode) async {
    final code = employeeCode.trim();
    if (code.isEmpty) {
      throw const AuthInputException('Enter the employee code.');
    }
    final response = await _client.functions.invoke(
      'owner-reset-device',
      body: {'employee_code': code},
    );
    if (response.status < 200 || response.status >= 300) {
      throw AuthBlockedException(_messageFromResponse(response.data));
    }
  }

  Future<void> signOut() => _client.auth.signOut();

  String _messageFromResponse(Object? data) {
    if (data is Map) {
      final code = data['code']?.toString();
      final message = data['error']?.toString() ?? data['message']?.toString();
      if (code == 'DEVICE_ALREADY_REGISTERED') {
        return 'This employee is registered on another device. Ask the Owner to reset the device registration.';
      }
      if (code == 'EMPLOYEE_NOT_APPROVED' || code == 'EMPLOYEE_NOT_FOUND') {
        return 'This mobile number is not linked to an approved, active DD WORLD employee. Contact the Owner.';
      }
      if (message != null && message.isNotEmpty) return message;
    }
    return 'Sign-in could not be completed. Check your connection or contact the Owner.';
  }
}

class AuthInputException implements Exception {
  const AuthInputException(this.message);
  final String message;
  @override
  String toString() => message;
}

class AuthBlockedException implements Exception {
  const AuthBlockedException(this.message);
  final String message;
  @override
  String toString() => message;
}
