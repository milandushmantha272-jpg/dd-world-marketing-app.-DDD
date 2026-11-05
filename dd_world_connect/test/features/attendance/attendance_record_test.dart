import 'package:flutter_test/flutter_test.dart';
import 'package:dd_world_connect/features/attendance/domain/attendance_record.dart';

void main() {
  group('AttendanceStatus mapping', () {
    test('serializes all attendance statuses', () {
      expect(AttendanceStatus.present.dbValue, 'PRESENT');
      expect(AttendanceStatus.late.dbValue, 'LATE');
      expect(AttendanceStatus.halfDay.dbValue, 'HALF_DAY');
      expect(AttendanceStatus.leave.dbValue, 'LEAVE');
      expect(AttendanceStatus.absent.dbValue, 'ABSENT');
    });

    test('parses database values', () {
      expect(AttendanceStatusX.fromDb('LATE'), AttendanceStatus.late);
      expect(AttendanceStatusX.fromDb('HALF_DAY'), AttendanceStatus.halfDay);
      expect(AttendanceStatusX.fromDb('LEAVE'), AttendanceStatus.leave);
      expect(AttendanceStatusX.fromDb('ABSENT'), AttendanceStatus.absent);
      expect(AttendanceStatusX.fromDb('PRESENT'), AttendanceStatus.present);
    });
  });

  test('parses GPS coordinates, timestamps and employee relation', () {
    final record = AttendanceRecord.fromJson({
      'id': 'att-1',
      'user_id': 'employee-1',
      'date': '2026-10-28',
      'status': 'PRESENT',
      'check_in_time': '2026-10-28T03:00:00Z',
      'check_in_latitude': 7.8731,
      'check_in_longitude': 80.7718,
      'check_in_accuracy_m': 8.5,
      'employee': {'name': 'Agent One', 'agent_code': 'AG-1'},
      'team': {'name': 'Dilshan'},
    });
    expect(record.userId, 'employee-1');
    expect(record.employeeName, 'Agent One');
    expect(record.teamName, 'Dilshan');
    expect(record.checkInLatitude, 7.8731);
    expect(record.checkInLongitude, 80.7718);
    expect(record.checkInAccuracy, 8.5);
    expect(record.checkOutTime, isNull);
  });
}
