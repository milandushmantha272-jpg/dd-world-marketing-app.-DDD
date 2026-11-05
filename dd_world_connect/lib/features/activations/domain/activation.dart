enum ActivationType { sayuru, govimithuru }
extension ActivationTypeX on ActivationType {
  String get databaseValue => switch (this) { ActivationType.sayuru => 'sayuru', ActivationType.govimithuru => 'govimithuru' };
  String get displayName => switch (this) { ActivationType.sayuru => 'SAYURU', ActivationType.govimithuru => 'GOVIMITHURU' };
  String get ussdCode => switch (this) { ActivationType.sayuru => '*828#', ActivationType.govimithuru => '*616#' };
  static ActivationType fromDatabase(Object? value) => switch (value?.toString().toLowerCase()) {
    'sayuru' => ActivationType.sayuru, 'govimithuru' => ActivationType.govimithuru,
    _ => throw FormatException('Unknown activation type: $value'),
  };
}
class Activation {
  const Activation({required this.id, required this.employeeId, required this.employeeName, required this.employeeCode, required this.teamId, required this.teamName, required this.type, required this.createdAt, required this.latitude, required this.longitude, required this.status});
  final String id, employeeId, employeeName, employeeCode, status;
  final String? teamId, teamName;
  final ActivationType type;
  final DateTime createdAt;
  final double latitude, longitude;
  factory Activation.fromJson(Map<String,dynamic> j) => Activation(
    id: j['id'].toString(), employeeId: j['employee_id'].toString(), employeeName: (j['employee_name'] ?? 'Employee').toString(),
    employeeCode: (j['employee_code'] ?? '').toString(), teamId: j['team_id']?.toString(), teamName: j['team_name']?.toString(),
    type: ActivationTypeX.fromDatabase(j['activation_type']), createdAt: DateTime.parse(j['created_at'].toString()).toLocal(),
    latitude: (j['gps_latitude'] as num).toDouble(), longitude: (j['gps_longitude'] as num).toDouble(), status: (j['status'] ?? 'recorded').toString());
}
class ActivationStatistics {
  const ActivationStatistics({required this.daily, required this.weekly, required this.monthly, required this.byType});
  final int daily, weekly, monthly;
  final Map<ActivationType,int> byType;
}