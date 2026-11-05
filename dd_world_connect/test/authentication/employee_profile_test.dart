import 'package:flutter_test/flutter_test.dart';
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
}
