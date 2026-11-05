enum EmployeeStatus { active, suspended, blacklisted, resigned }

enum EmployeeRole { owner, teamLeader, agent, directAgent }

extension EmployeeStatusX on EmployeeStatus {
  String get dbValue => name.toUpperCase();
  String get label => switch (this) { EmployeeStatus.active => 'Active', EmployeeStatus.suspended => 'Suspended', EmployeeStatus.blacklisted => 'Blacklisted', EmployeeStatus.resigned => 'Resigned' };
  static EmployeeStatus fromDb(Object? value) => switch (value?.toString().toUpperCase()) { 'SUSPENDED' => EmployeeStatus.suspended, 'BLACKLISTED' => EmployeeStatus.blacklisted, 'RESIGNED' => EmployeeStatus.resigned, _ => EmployeeStatus.active };
}

extension EmployeeRoleX on EmployeeRole {
  String get dbValue => switch (this) { EmployeeRole.owner => 'owner', EmployeeRole.teamLeader => 'team_leader', EmployeeRole.agent => 'agent', EmployeeRole.directAgent => 'direct_agent' };
  String get label => switch (this) { EmployeeRole.owner => 'Owner', EmployeeRole.teamLeader => 'Team Leader', EmployeeRole.agent => 'Agent', EmployeeRole.directAgent => 'Direct Agent' };
  static EmployeeRole fromDb(Object? value, {String? teamId}) => switch (value?.toString().toLowerCase()) { 'owner' => EmployeeRole.owner, 'team_leader' => EmployeeRole.teamLeader, 'direct_agent' => EmployeeRole.directAgent, _ => teamId == null ? EmployeeRole.directAgent : EmployeeRole.agent };
}

class Employee {
  const Employee({required this.id, required this.code, required this.fullName, required this.phone, required this.role, required this.status, this.email, this.nic, this.address, this.dateOfBirth, this.joinDate, this.teamId, this.teamName, this.reportsToId, this.profilePhotoUrl, this.approvalStatus = 'PENDING', this.createdAt});
  final String id, code, fullName, phone;
  final EmployeeRole role;
  final EmployeeStatus status;
  final String? email, nic, address, teamId, teamName, reportsToId, profilePhotoUrl;
  final DateTime? dateOfBirth, joinDate, createdAt;
  final String approvalStatus;
  factory Employee.fromJson(Map<String,dynamic> json) {
    final profile = json['employee_profiles'] is Map ? Map<String,dynamic>.from(json['employee_profiles'] as Map) : <String,dynamic>{};
    final team = json['teams'] is Map ? Map<String,dynamic>.from(json['teams'] as Map) : <String,dynamic>{};
    DateTime? date(Object? v) => v == null ? null : DateTime.tryParse(v.toString());
    final teamId = json['team_id']?.toString();
    return Employee(id: json['id'].toString(), code: (json['agent_code'] ?? '').toString(), fullName: (json['name'] ?? '').toString(), phone: (json['phone'] ?? '').toString(), role: EmployeeRoleX.fromDb(json['role'], teamId: teamId), status: EmployeeStatusX.fromDb(json['employment_status'] ?? json['status']), email: json['email']?.toString(), nic: profile['nic']?.toString(), address: profile['address']?.toString(), dateOfBirth: date(profile['date_of_birth']), joinDate: date(profile['join_date']), teamId: teamId, teamName: team['name']?.toString(), reportsToId: json['reports_to_user_id']?.toString(), profilePhotoUrl: profile['profile_photo_url']?.toString(), approvalStatus: (json['id_approval_status'] ?? 'PENDING').toString(), createdAt: date(json['created_at']));
  }
}

class EmployeeTeam {
  const EmployeeTeam({required this.id, required this.name, this.leaderId});
  final String id, name;
  final String? leaderId;
  factory EmployeeTeam.fromJson(Map<String,dynamic> json) => EmployeeTeam(id: json['id'].toString(), name: json['name'].toString(), leaderId: json['leader_id']?.toString());
}
