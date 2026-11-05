enum EmployeeRole { owner, teamLeader, agent, directAgent }

extension EmployeeRoleX on EmployeeRole {
  String get apiValue => switch (this) {
        EmployeeRole.owner => 'owner',
        EmployeeRole.teamLeader => 'team_leader',
        EmployeeRole.agent => 'agent',
        EmployeeRole.directAgent => 'direct_agent',
      };

  String get displayName => switch (this) {
        EmployeeRole.owner => 'Owner',
        EmployeeRole.teamLeader => 'Team Leader',
        EmployeeRole.agent => 'Agent',
        EmployeeRole.directAgent => 'Direct Agent',
      };

  static EmployeeRole parse(Object? value) {
    final normalized = value?.toString().trim().toLowerCase();
    return switch (normalized) {
      'owner' => EmployeeRole.owner,
      'team_leader' || 'team leader' => EmployeeRole.teamLeader,
      'agent' => EmployeeRole.agent,
      'direct_agent' || 'direct agent' => EmployeeRole.directAgent,
      _ => throw const FormatException('The employee role is not recognized. Contact the Owner.'),
    };
  }
}

class EmployeeProfile {
  const EmployeeProfile({
    required this.id,
    required this.employeeCode,
    required this.fullName,
    required this.phoneE164,
    required this.role,
    required this.deviceRegistrationId,
  });

  final String id;
  final String employeeCode;
  final String fullName;
  final String phoneE164;
  final EmployeeRole role;
  final String deviceRegistrationId;

  factory EmployeeProfile.fromJson(Map<String, dynamic> json) {
    String requiredString(String key) {
      final value = json[key]?.toString().trim();
      if (value == null || value.isEmpty) {
        throw FormatException('Missing required employee profile field: $key');
      }
      return value;
    }

    return EmployeeProfile(
      id: requiredString('employee_id'),
      employeeCode: requiredString('employee_code'),
      fullName: requiredString('full_name'),
      phoneE164: requiredString('phone_e164'),
      role: EmployeeRoleX.parse(json['role']),
      deviceRegistrationId: requiredString('device_registration_id'),
    );
  }
}
