enum AttendanceStatus { present, late, halfDay, leave, absent }

extension AttendanceStatusX on AttendanceStatus {
  String get dbValue => switch (this) {
    AttendanceStatus.present => 'PRESENT',
    AttendanceStatus.late => 'LATE',
    AttendanceStatus.halfDay => 'HALF_DAY',
    AttendanceStatus.leave => 'LEAVE',
    AttendanceStatus.absent => 'ABSENT',
  };
  String get label => switch (this) {
    AttendanceStatus.present => 'Present',
    AttendanceStatus.late => 'Late',
    AttendanceStatus.halfDay => 'Half Day',
    AttendanceStatus.leave => 'Leave',
    AttendanceStatus.absent => 'Absent',
  };
  static AttendanceStatus fromDb(Object? value) => switch (value?.toString().toUpperCase()) {
    'LATE' => AttendanceStatus.late,
    'HALF_DAY' || 'HALF DAY' => AttendanceStatus.halfDay,
    'LEAVE' => AttendanceStatus.leave,
    'ABSENT' => AttendanceStatus.absent,
    _ => AttendanceStatus.present,
  };
}

class AttendanceRecord {
  const AttendanceRecord({
    required this.id, required this.userId, required this.date, required this.status,
    this.employeeName, this.employeeCode, this.teamId, this.teamName, this.checkInTime,
    this.checkOutTime, this.checkInLatitude, this.checkInLongitude, this.checkOutLatitude,
    this.checkOutLongitude, this.checkInAccuracy, this.checkOutAccuracy, this.notes,
  });
  final String id, userId, date;
  final AttendanceStatus status;
  final String? employeeName, employeeCode, teamId, teamName, notes;
  final DateTime? checkInTime, checkOutTime;
  final double? checkInLatitude, checkInLongitude, checkOutLatitude, checkOutLongitude;
  final double? checkInAccuracy, checkOutAccuracy;

  factory AttendanceRecord.fromJson(Map<String, dynamic> json) {
    final user = json['employee'] is Map ? Map<String,dynamic>.from(json['employee'] as Map) : <String,dynamic>{};
    final team = json['team'] is Map ? Map<String,dynamic>.from(json['team'] as Map) : <String,dynamic>{};
    DateTime? dateTime(Object? value) => value == null ? null : DateTime.tryParse(value.toString());
    double? number(Object? value) => value is num ? value.toDouble() : double.tryParse(value?.toString() ?? '');
    return AttendanceRecord(
      id: json['id'].toString(), userId: json['user_id'].toString(), date: json['date'].toString(),
      status: AttendanceStatusX.fromDb(json['status']), employeeName: user['name']?.toString(),
      employeeCode: user['agent_code']?.toString(), teamId: json['team_id']?.toString(),
      teamName: team['name']?.toString(), checkInTime: dateTime(json['check_in_time']),
      checkOutTime: dateTime(json['check_out_time']), checkInLatitude: number(json['check_in_latitude']),
      checkInLongitude: number(json['check_in_longitude']), checkOutLatitude: number(json['check_out_latitude']),
      checkOutLongitude: number(json['check_out_longitude']), checkInAccuracy: number(json['check_in_accuracy_m']),
      checkOutAccuracy: number(json['check_out_accuracy_m']), notes: json['notes']?.toString(),
    );
  }
}

class AttendanceGps {
  const AttendanceGps({required this.latitude, required this.longitude, this.accuracyMeters});
  final double latitude, longitude;
  final double? accuracyMeters;
}
