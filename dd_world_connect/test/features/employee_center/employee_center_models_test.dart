import 'package:flutter_test/flutter_test.dart';
import 'package:dd_world_connect/features/employee_center/domain/employee_center_models.dart';

void main() {
  group('Employee identity models', () {
    test('maps the QR verification result returned by the database RPC', () {
      final result = EmployeeQrResult.fromJson({
        'employee_name': 'Test Employee',
        'staff_code': 'DD-1001',
        'team_name': 'Dilshan',
        'employee_position': 'Agent',
        'status': 'active',
        'verified': true,
      });
      expect(result.employeeName, 'Test Employee');
      expect(result.staffCode, 'DD-1001');
      expect(result.teamName, 'Dilshan');
      expect(result.position, 'Agent');
      expect(result.verified, isTrue);
    });

    test('maps document review status and private storage path', () {
      final document = EmployeeDocumentRecord.fromJson({
        'id': 'doc-1',
        'employee_id': 'employee-1',
        'document_type': 'nic_front',
        'file_name': 'nic-front.pdf',
        'mime_type': 'application/pdf',
        'file_size_bytes': 1024,
        'status': 'pending',
        'submitted_at': '2026-10-30T07:00:00Z',
        'file_path': 'employee-1/doc-1/nic-front.pdf',
        'review_note': null,
      });
      expect(document.documentType, 'nic_front');
      expect(document.status, 'pending');
      expect(document.filePath, contains('employee-1'));
    });

    test('maps leave requester identity and review stage', () {
      final leave = LeaveRequestRecord.fromJson({
        'id': 'leave-1',
        'leave_type': 'annual',
        'start_date': '2026-11-02',
        'end_date': '2026-11-03',
        'reason': 'Family matter',
        'status': 'PENDING_TEAM_LEADER',
        'review_stage': 'PENDING_TEAM_LEADER',
        'created_at': '2026-10-30T07:00:00Z',
        'user_id': 'employee-1',
        'users': {'name': 'Test Employee'},
      });
      expect(leave.employeeName, 'Test Employee');
      expect(leave.reviewStage, 'PENDING_TEAM_LEADER');
      expect(leave.endDate.difference(leave.startDate).inDays, 1);
    });
  });
}
