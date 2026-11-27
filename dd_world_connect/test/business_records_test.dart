import 'package:flutter_test/flutter_test.dart';
import 'package:dd_world_connect/features/business_centers/domain/business_records.dart';

void main() {
  group('Report file type validation', () {
    test('accepts supported PDF and spreadsheet formats', () {
      expect(reportMimeType('weekly.pdf'), 'application/pdf');
      expect(reportMimeType('monthly.xlsx'),
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(reportMimeType('legacy.xls'), 'application/vnd.ms-excel');
      expect(reportMimeType('report.csv'), 'text/csv');
    });

    test('rejects unsupported file types', () {
      expect(() => reportMimeType('report.exe'), throwsFormatException);
    });
  });

  group('DialogReport model', () {
    test('maps Supabase report fields', () {
      final report = DialogReport.fromJson({
        'id': 'report-1',
        'report_type': 'weekly',
        'title': 'Weekly Dialog Report',
        'period_start': '2026-10-19',
        'period_end': '2026-10-25',
        'file_path': 'reports/2026/report.pdf',
        'file_name': 'report.pdf',
        'mime_type': 'application/pdf',
        'file_size_bytes': 1234,
        'created_at': '2026-10-26T10:00:00Z',
        'archived_at': null,
      });

      expect(report.id, 'report-1');
      expect(report.type, 'weekly');
      expect(report.fileSize, 1234);
      expect(report.archivedAt, isNull);
      expect(report.periodLabel, contains('2026-10-19'));
    });
  });
}
