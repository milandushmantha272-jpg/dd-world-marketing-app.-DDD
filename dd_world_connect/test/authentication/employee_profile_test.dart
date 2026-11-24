import 'package:flutter_test/flutter_test.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:dd_world_connect/features/authentication/data/auth_repository.dart';
import 'package:dd_world_connect/features/authentication/domain/employee_profile.dart';

void main() {
  group('EmployeeRoleX.parse', () {
    test('maps all supported server roles', () {
      expect(EmployeeRoleX.parse('owner'), EmployeeRole.owner);
      expect(EmployeeRoleX.parse('team_leader'), EmployeeRole.teamLeader);
      expect(EmployeeRoleX.parse('agent'), EmployeeRole.agent);
      expect(EmployeeRoleX.parse('direct_agent'), EmployeeRole.directAgent);
    });

    test('rejects unknown roles instead of granting a default role', () {
      expect(
        () => EmployeeRoleX.parse('administrator'),
        throwsA(isA<FormatException>()),
      );
    });
  });

  test('parses the minimum authorized employee profile', () {
    final profile = EmployeeProfile.fromJson({
      'employee_id': 'employee-uuid',
      'employee_code': 'DD-0037',
      'full_name': 'Test Owner',
      'phone_e164': '+94770000000',
      'role': 'owner',
      'device_registration_id': 'device-uuid',
    });

    expect(profile.id, 'employee-uuid');
    expect(profile.employeeCode, 'DD-0037');
    expect(profile.role, EmployeeRole.owner);
  });

  test('rejects incomplete profiles instead of guessing fields', () {
    expect(
      () => EmployeeProfile.fromJson({'role': 'agent'}),
      throwsA(isA<FormatException>()),
    );
  });
  group('AuthRepository.normalizePhone', () {
    final repository = AuthRepository(
      client: SupabaseClient('https://example.supabase.co', 'test-anon-key'),
    );

    test('converts a local Sri Lankan mobile number to E.164', () {
      expect(repository.normalizePhone('0771234567'), '+94771234567');
    });

    test('accepts an already normalized E.164 number', () {
      expect(repository.normalizePhone('+94771234567'), '+94771234567');
    });

    test('rejects invalid mobile numbers', () {
      expect(
        () => repository.normalizePhone('12345'),
        throwsA(isA<AuthInputException>()),
      );
    });
  });

}
