import 'package:flutter_test/flutter_test.dart';
import 'package:dd_world_connect/features/employee_lifecycle/domain/lifecycle_models.dart';

void main() {
  group('EmployeeOption', () {
    test('parses the active employee selector fields', () {
      final employee = EmployeeOption.fromJson({
        'id': 'employee-1',
        'name': 'Test Agent',
        'agent_code': 'DD-1001',
      });
      expect(employee.id, 'employee-1');
      expect(employee.name, 'Test Agent');
      expect(employee.code, 'DD-1001');
    });
  });

  group('LifecycleRow', () {
    test('keeps the database row and exposes common display fields', () {
      final row = LifecycleRow.fromJson({
        'id': 'record-1',
        'title': 'Sayuru Training',
        'status': 'pending',
      });
      expect(row.id, 'record-1');
      expect(row.title, 'Sayuru Training');
      expect(row.status, 'pending');
      expect(row.data['title'], 'Sayuru Training');
    });

    test('uses file name and card number as display title fallbacks', () {
      expect(LifecycleRow.fromJson({'id': '1', 'file_name': 'nic.pdf'}).title, 'nic.pdf');
      expect(LifecycleRow.fromJson({'id': '2', 'card_number': 'DD-1001'}).title, 'DD-1001');
    });
  });
}
