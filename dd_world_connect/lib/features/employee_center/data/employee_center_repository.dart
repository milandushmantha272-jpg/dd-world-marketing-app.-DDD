import 'dart:typed_data';
import 'package:file_picker/file_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:uuid/uuid.dart';
import '../domain/employee_center_models.dart';

class EmployeeCenterRepository {
  EmployeeCenterRepository(this.client);
  final SupabaseClient client;
  static const _uuid = Uuid();

  Future<Map<String,dynamic>> _employee(String id) async {
    final row = await client.from('users').select('id,name,agent_code,role,team_id').eq('id',id).single();
    final profile = await client.from('employee_profiles').select('profile_photo_url').eq('user_id',id).maybeSingle();
    var team = '';
    final teamId = row['team_id'] as String?;
    if (teamId != null) {
      final result = await client.from('teams').select('name').eq('id',teamId).maybeSingle();
      team = result?['name'] as String? ?? '';
    }
    return {...row, 'photo_path': profile?['profile_photo_url'], 'team_name': team};
  }

  Future<List<Map<String,dynamic>>> employees() async {
    final rows = await client.from('users').select('id,name,agent_code,role,team_id').eq('status','active').eq('employment_status','ACTIVE').eq('id_approval_status','APPROVED').order('name');
    return List<Map<String,dynamic>>.from(rows);
  }

  Future<EmployeeIdCardRecord?> myIdCard(String employeeId) async {
    final row = await client.from('employee_id_cards').select().eq('employee_id',employeeId).maybeSingle();
    if (row == null) return null;
    final emp = await _employee(employeeId);
    return EmployeeIdCardRecord(id:row['id'],employeeId:employeeId,cardNumber:row['card_number'],qrToken:row['qr_token'] ?? '',status:row['status'],employeeName:emp['name'],staffCode:emp['agent_code'] ?? '',position:rolePosition(emp['role']),teamName:emp['team_name'],employeePhotoPath:row['employee_photo_path'] ?? emp['photo_path'],companyLogoPath:row['company_logo_path'],issuedAt:DateTime.parse(row['issued_at']));
  }

  Future<EmployeeIdCardRecord> issueIdCard({required String employeeId}) async {
    // The database RPC performs the authoritative Owner/employee-status checks,
    // generates the QR token, and writes the card atomically.
    final response = await client.rpc(
      'issue_employee_id_card',
      params: {'p_employee_id': employeeId},
    );
    final rows = List<Map<String, dynamic>>.from(response as List);
    if (rows.isEmpty) {
      throw StateError('The ID card could not be issued.');
    }
    // The RPC returns the one-time token for the QR payload. Re-read the card
    // through the normal RLS-protected query to hydrate employee/team details.
    final card = await myIdCard(employeeId);
    if (card == null) {
      throw StateError('The ID card was issued but could not be loaded.');
    }
    return EmployeeIdCardRecord(
      id: card.id,
      employeeId: card.employeeId,
      cardNumber: card.cardNumber,
      qrToken: rows.first['qr_token'] as String,
      status: card.status,
      employeeName: card.employeeName,
      staffCode: card.staffCode,
      position: card.position,
      teamName: card.teamName,
      employeePhotoPath: card.employeePhotoPath,
      companyLogoPath: card.companyLogoPath,
      issuedAt: card.issuedAt,
    );
  }

  Future<EmployeeQrResult> verifyQr(String token) async {
    final data = await client.rpc('verify_employee_qr',params:{'p_token':token});
    final rows = List<Map<String,dynamic>>.from(data as List);
    if (rows.isEmpty) throw StateError('No employee matched this QR code');
    return EmployeeQrResult.fromJson(rows.first);
  }

  Future<List<EmployeeDocumentRecord>> documents(String employeeId,{required bool owner}) async {
    var query = client.from('employee_documents').select();
    if (!owner) query = query.eq('employee_id',employeeId);
    final rows = await query.order('submitted_at',ascending:false);
    return List<Map<String,dynamic>>.from(rows).map(EmployeeDocumentRecord.fromJson).toList();
  }

  String _mime(String name) {
    final ext = name.split('.').last.toLowerCase();
    return switch(ext) {
      'pdf' => 'application/pdf',
      'jpg' || 'jpeg' => 'image/jpeg',
      'png' => 'image/png',
      'webp' => 'image/webp',
      'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'xls' => 'application/vnd.ms-excel',
      'csv' => 'text/csv',
      'mp4' => 'video/mp4',
      'mov' => 'video/quicktime',
      'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'ppt' => 'application/vnd.ms-powerpoint',
      'zip' => 'application/zip',
      _ => 'application/octet-stream'
    };
  }

  Future<void> uploadDocument({required String employeeId,required PlatformFile file,required String type}) async {
    final bytes = file.bytes;
    if (bytes == null || bytes.isEmpty) throw StateError('File data is unavailable.');
    if (bytes.length > 26214400) throw StateError('Document must be 25 MB or smaller.');
    final mime = _mime(file.name);
    if (!['image/jpeg','image/png','image/webp','application/pdf'].contains(mime)) throw StateError('Only PDF, JPG, PNG and WEBP files are accepted.');
    final id = _uuid.v4();
    final safeName = file.name.replaceAll(RegExp(r'[^A-Za-z0-9._-]'),'_');
    final path = '$employeeId/$id/$safeName';
    await client.storage.from('employee-documents').uploadBinary(path,bytes,fileOptions:FileOptions(contentType:mime));
    try {
      await client.from('employee_documents').insert({'employee_id':employeeId,'document_type':type,'file_path':path,'file_name':file.name,'mime_type':mime,'file_size_bytes':bytes.length,'status':'pending'});
    } catch (_) {
      await client.storage.from('employee-documents').remove([path]);
      rethrow;
    }
  }

  Future<String> documentUrl(String path) => client.storage.from('employee-documents').createSignedUrl(path,300);
  Future<String> employeePhotoUrl(String path) => client.storage.from('employee-profile-photos').createSignedUrl(path,300);
  Future<Uint8List> employeePhotoBytes(String path) => client.storage.from('employee-profile-photos').download(path);

  Future<void> reviewDocument({required String documentId,required bool approve,String? note}) async {
    await client.rpc('review_employee_document',params:{'p_document_id':documentId,'p_decision':approve?'approved':'rejected','p_note':note});
  }

  Future<List<LeaveRequestRecord>> leaves(String employeeId,{required bool owner,required bool teamLeader}) async {
    var query = client.from('leave_requests').select('*,users!leave_requests_user_id_fkey(name)');
    if (!owner && !teamLeader) query = query.eq('user_id',employeeId);
    final rows = await query.order('created_at',ascending:false);
    return List<Map<String,dynamic>>.from(rows).map(LeaveRequestRecord.fromJson).toList();
  }

  Future<void> applyLeave({required String employeeId,required String leaveType,required DateTime start,required DateTime end,required String reason,required bool halfDayMorning}) async {
    if (end.isBefore(start)) throw StateError('End date must not be before start date.');
    final emp = await client.from('users').select('team_id').eq('id',employeeId).single();
    final teamId = emp['team_id'] as String?;
    final stage = teamId == null ? 'PENDING_OWNER' : 'PENDING_TEAM_LEADER';
    final days = leaveType == 'half_day' ? 0.5 : end.difference(start).inDays + 1.0;
    await client.from('leave_requests').insert({'user_id':employeeId,'team_id':teamId,'leave_type':leaveType,'start_date':start.toIso8601String().substring(0,10),'end_date':end.toIso8601String().substring(0,10),'reason':reason.trim(),'status':stage,'review_stage':stage,'days':days,'half_day_period':leaveType == 'half_day' ? (halfDayMorning ? 'morning' : 'afternoon') : null});
  }

  Future<void> reviewLeave({required String leaveId,required bool approve,String? note}) async {
    await client.rpc('review_leave_request',params:{'p_leave_request_id':leaveId,'p_decision':approve ? 'approved' : 'rejected','p_note':note});
  }

  Future<List<SharedMaterialRecord>> downloads() async {
    final rows = await client.from('downloads').select().eq('is_published',true).order('created_at',ascending:false);
    return List<Map<String,dynamic>>.from(rows).map((j)=>SharedMaterialRecord.fromJson(j,category:j['category'])).toList();
  }
  Future<List<SharedMaterialRecord>> training() async {
    final rows = await client.from('training_materials').select().eq('is_published',true).order('sort_order').order('created_at',ascending:false);
    return List<Map<String,dynamic>>.from(rows).map((j)=>SharedMaterialRecord.fromJson(j,category:j['material_type'])).toList();
  }
  Future<String> materialUrl(String bucket,String path) => client.storage.from(bucket).createSignedUrl(path,600);
  Future<void> logDownload(String id,String employeeId) async { await client.from('download_history').insert({'download_id':id,'employee_id':employeeId}); }
  Future<void> logTrainingView(String id,String employeeId) async {
    await client.from('training_views').upsert({'material_id':id,'employee_id':employeeId,'viewed_at':DateTime.now().toUtc().toIso8601String()},onConflict:'material_id,employee_id');
  }

  Future<void> uploadSharedFile({required String title,required String description,required String category,required PlatformFile file,required String uploaderId}) async {
    final bytes = file.bytes;
    if (bytes == null || bytes.isEmpty) throw StateError('File data is unavailable.');
    if (bytes.length > 52428800) throw StateError('File must be 50 MB or smaller.');
    final id = _uuid.v4();
    final mime = _mime(file.name);
    final safeName = file.name.replaceAll(RegExp(r'[^A-Za-z0-9._-]'),'_');
    final path = '$id/$safeName';
    await client.storage.from('dd-downloads').uploadBinary(path,bytes,fileOptions:FileOptions(contentType:mime));
    try {
      await client.from('downloads').insert({'title':title,'description':description,'category':category,'file_path':path,'file_name':file.name,'mime_type':mime,'file_size_bytes':bytes.length,'uploaded_by':uploaderId});
    } catch (_) {
      await client.storage.from('dd-downloads').remove([path]);
      rethrow;
    }
  }

  Future<void> uploadTraining({required String title,required String description,required String product,required String materialType,required PlatformFile file,required String uploaderId}) async {
    final bytes = file.bytes;
    if (bytes == null || bytes.isEmpty) throw StateError('File data is unavailable.');
    if (bytes.length > 104857600) throw StateError('Training file must be 100 MB or smaller.');
    final id = _uuid.v4();
    final mime = _mime(file.name);
    final safeName = file.name.replaceAll(RegExp(r'[^A-Za-z0-9._-]'),'_');
    final path = '$id/$safeName';
    await client.storage.from('dd-training-materials').uploadBinary(path,bytes,fileOptions:FileOptions(contentType:mime));
    try {
      await client.from('training_materials').insert({'title':title,'description':description,'product':product,'material_type':materialType,'file_path':path,'file_name':file.name,'mime_type':mime,'file_size_bytes':bytes.length,'uploaded_by':uploaderId});
    } catch (_) {
      await client.storage.from('dd-training-materials').remove([path]);
      rethrow;
    }
  }
}