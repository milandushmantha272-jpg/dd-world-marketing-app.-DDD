enum TeamStatus { active, inactive, archived }

extension TeamStatusX on TeamStatus {
  String get dbValue => name.toUpperCase();
  String get label => switch (this) { TeamStatus.active => 'Active', TeamStatus.inactive => 'Inactive', TeamStatus.archived => 'Archived' };
  static TeamStatus fromDb(Object? value) => switch (value?.toString().toUpperCase()) {
    'INACTIVE' => TeamStatus.inactive, 'ARCHIVED' => TeamStatus.archived, _ => TeamStatus.active
  };
}

class Team {
  const Team({required this.id, required this.code, required this.name, required this.status, this.description, this.leaderId, this.leaderName, this.createdAt, this.employeeCount = 0, this.activationCount = 0, this.salesQuantity = 0, this.salesAmount = 0, this.presentCount = 0, this.attendanceCount = 0});
  final String id, code, name;
  final TeamStatus status;
  final String? description, leaderId, leaderName;
  final DateTime? createdAt;
  final int employeeCount, activationCount, salesQuantity, presentCount, attendanceCount;
  final num salesAmount;

  factory Team.fromJson(Map<String, dynamic> json, {int employeeCount = 0}) {
    final leader = json['leader'];
    final leaderMap = leader is Map ? Map<String, dynamic>.from(leader) : <String, dynamic>{};
    return Team(
      id: json['id'].toString(),
      code: (json['team_code'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      status: TeamStatusX.fromDb(json['status']),
      description: json['description']?.toString(),
      leaderId: json['leader_id']?.toString(),
      leaderName: leaderMap['name']?.toString(),
      createdAt: DateTime.tryParse((json['created_at'] ?? '').toString()),
      employeeCount: employeeCount,
    );
  }

  Team withStatistics({required int activations, required int quantity, required num amount, required int present, required int attendance}) => Team(
    id:id, code:code, name:name, status:status, description:description, leaderId:leaderId, leaderName:leaderName, createdAt:createdAt,
    employeeCount:employeeCount, activationCount:activations, salesQuantity:quantity, salesAmount:amount, presentCount:present, attendanceCount:attendance,
  );
}
