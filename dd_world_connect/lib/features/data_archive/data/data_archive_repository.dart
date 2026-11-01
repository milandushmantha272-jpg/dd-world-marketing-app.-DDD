import 'dart:typed_data';
import 'package:file_picker/file_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class DataArchiveRepository {
  DataArchiveRepository([SupabaseClient? client]) : client = client ?? Supabase.instance.client;
  final SupabaseClient client;
  static const bucket = 'dd-backups';

  Future<Map<String, dynamic>> createYearlyBackup(int year) async {
    final response = await client.functions.invoke('data-archive-backup', body: {'backup_year': year});
    if (response.status < 200 || response.status >= 300) {
      throw StateError(_message(response.data));
    }
    if (response.data is! Map) throw StateError('Invalid backup response.');
    final result = Map<String, dynamic>.from(response.data as Map);
    if (result['success'] != true || result['status'] != 'verified') {
      throw StateError(_message(result));
    }
    return result;
  }

  Future<List<Map<String, dynamic>>> history() async {
    final rows = await client.from('backup_history').select(
      'id,backup_year,status,zip_path,excel_path,pdf_path,zip_sha256,excel_sha256,pdf_sha256,total_rows,table_counts,manifest,archive_cutoff,archived_count,archived_at,failure_message,created_at,completed_at'
    ).order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(rows);
  }

  Future<List<Map<String, dynamic>>> logs() async {
    final rows = await client.from('archive_logs').select(
      'id,batch_id,action,source_table,affected_count,cutoff_at,status,created_at'
    ).order('created_at', ascending: false).limit(500);
    return List<Map<String, dynamic>>.from(rows);
  }

  Future<Map<String, dynamic>> archive(String backupId) async {
    // Let PostgreSQL calculate the 12-month cutoff using server time.
    final result = await client.rpc('archive_old_records', params: {
      'p_backup_id': backupId,
    });
    if (result is! Map) throw StateError('Invalid archive response.');
    return Map<String, dynamic>.from(result);
  }

  Future<Map<String, dynamic>> restore(String batchId) async {
    final result = await client.rpc('restore_archive_batch', params: {'p_batch_id': batchId});
    if (result is! Map) throw StateError('Invalid restore response.');
    return Map<String, dynamic>.from(result);
  }

  Future<String?> download(String path, String name, String extension) async {
    final Uint8List bytes = await client.storage.from(bucket).download(path);
    return FilePicker.platform.saveFile(
      dialogTitle: 'Save DD WORLD backup',
      fileName: name,
      type: FileType.custom,
      allowedExtensions: [extension],
      bytes: bytes,
    );
  }

  String _message(Object? value) {
    if (value is Map) return (value['error'] ?? value['message'] ?? value).toString();
    return value?.toString() ?? 'Backup operation failed.';
  }
}
