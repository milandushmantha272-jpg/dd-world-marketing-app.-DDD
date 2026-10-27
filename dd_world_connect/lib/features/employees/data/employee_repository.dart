import 'dart:typed_data';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../domain/employee.dart';

class EmployeeRepository {
  EmployeeRepository({SupabaseClient? client}) : _client = client ?? Supabase.instance.client;
  final SupabaseClient _client;
  static const _selection = 'id,agent_code,name,phone,email,role,status,employment_status,id_approval_status,team_id,reports_to_user_id,created_at,teams(id,name),employee_profiles(nic,address,date_of_birth,join_date,profile_photo_url)';

  Future<List<Employee>> list({String search = '', EmployeeStatus? status, String? teamId}) async {
    var query = _client.from('users').select(_selection);
    if (status != null) query = query.eq('employment_status', status.dbValue);
    if (teamId != null && teamId.isNotEmpty) query = query.eq('team_id', teamId);
    final term = search.trim().replaceAll(',', ' ');
    if (term.isNotEmpty) query = query.or('name.ilike.%$term%,agent_code.ilike.%$term%,phone.ilike.%$term%');
    final rows = await query.order('name');
    final employees = <Employee>[];\n    for (final row in rows) { employees.add(Employee.fromJson(await _signedPhoto(Map<String,dynamic>.from(row)))); }\n    return employees;
  }
  Future<Employee> getById(String id) async => Employee.fromJson(await _signedPhoto(Map<String,dynamic>.from(await _client.from('users').select(_selection).eq('id', id).single())));
  Future<List<EmployeeTeam>> teams() async => (await _client.from('teams').select('id,name,leader_id').order('name')).map((r) => EmployeeTeam.fromJson(Map<String,dynamic>.from(r))).toList();

  Future<void> create({required String code, required String name, required String phone, required EmployeeRole role, required EmployeeStatus status, required String? teamId, String? nic, String? address, DateTime? dob, DateTime? joinDate}) async {
    final inserted = await _client.from('users').insert({'agent_code':code.trim(),'name':name.trim(),'phone':phone.trim(),'role':role.dbValue,'status':status==EmployeeStatus.active?'active':'inactive','employment_status':status.dbValue,'id_approval_status':'PENDING','team_id':teamId,'created_at':DateTime.now().toUtc().toIso8601String()}).select('id').single();
    final id = inserted['id'].toString();
    await _client.from('employee_profiles').upsert({'user_id':id,'nic':_clean(nic),'address':_clean(address),'date_of_birth':_date(dob),'join_date':_date(joinDate ?? DateTime.now()),'updated_by':_client.auth.currentUser?.id});
    await _client.from('employee_approval_requests').insert({'employee_id':id,'requested_by':_client.auth.currentUser?.id,'status':'PENDING','request_payload':{'employee_code':code.trim(),'role':role.dbValue,'team_id':teamId}});
  }
  Future<void> update({required Employee employee, required String name, required String phone, required EmployeeRole role, required EmployeeStatus status, required String? teamId, String? nic, String? address, DateTime? dob, DateTime? joinDate}) async {
    await _client.from('users').update({'name':name.trim(),'phone':phone.trim(),'role':role.dbValue,'status':status==EmployeeStatus.active?'active':'inactive','employment_status':status.dbValue,'team_id':teamId}).eq('id',employee.id);
    await _client.from('employee_profiles').upsert({'user_id':employee.id,'nic':_clean(nic),'address':_clean(address),'date_of_birth':_date(dob),'join_date':_date(joinDate),'updated_by':_client.auth.currentUser?.id});
  }
  Future<void> changeStatus(Employee employee, EmployeeStatus status, String reason) async {
    await _client.from('users').update({'employment_status':status.dbValue,'status':status==EmployeeStatus.active?'active':'inactive'}).eq('id',employee.id);
    await _client.from('employee_status_history').insert({'employee_id':employee.id,'previous_status':employee.status.dbValue,'new_status':status.dbValue,'reason':reason.trim(),'changed_by':_client.auth.currentUser?.id});
  }
  Future<void> transfer(Employee employee,{required String? teamId,required String? reportsToId,required String reason}) async {
    await _client.from('users').update({'team_id':teamId,'reports_to_user_id':reportsToId}).eq('id',employee.id);
    await _client.from('employee_transfer_history').insert({'employee_id':employee.id,'previous_team_id':employee.teamId,'new_team_id':teamId,'previous_reports_to_user_id':employee.reportsToId,'new_reports_to_user_id':reportsToId,'reason':reason.trim(),'transferred_by':_client.auth.currentUser?.id});
  }
  Future<void> reviewApproval(String requestId,String employeeId,{required bool approve,required String reason}) async {
    await _client.from('employee_approval_requests').update({'status':approve?'APPROVED':'REJECTED','reviewed_by':_client.auth.currentUser?.id,'review_reason':reason.trim(),'reviewed_at':DateTime.now().toUtc().toIso8601String()}).eq('id',requestId);
    await _client.from('users').update({'id_approval_status':approve?'APPROVED':'REJECTED','status':approve?'active':'inactive'}).eq('id',employeeId);
  }
  Future<List<Map<String,dynamic>>> history(String id) async {
    final rows = await Future.wait([_client.from('employee_status_history').select('id,previous_status,new_status,reason,changed_at').eq('employee_id',id).order('changed_at',ascending:false),_client.from('employee_transfer_history').select('id,previous_team_id,new_team_id,reason,transferred_at').eq('employee_id',id).order('transferred_at',ascending:false),_client.from('employee_approval_requests').select('id,status,review_reason,created_at,reviewed_at').eq('employee_id',id).order('created_at',ascending:false)]);
    final result = <Map<String,dynamic>>[for(final r in rows[0]) {'kind':'Status',...Map<String,dynamic>.from(r)},for(final r in rows[1]) {'kind':'Transfer',...Map<String,dynamic>.from(r)},for(final r in rows[2]) {'kind':'Approval',...Map<String,dynamic>.from(r)}];
    result.sort((a,b)=>(b['changed_at']??b['transferred_at']??b['created_at']??'').toString().compareTo((a['changed_at']??a['transferred_at']??a['created_at']??'').toString())); return result;
  }
  Future<String> uploadPhoto(String employeeId, String fileName, Uint8List bytes, String contentType) async {\n    final path = '$employeeId/${DateTime.now().millisecondsSinceEpoch}_${fileName.replaceAll(RegExp(r'[^A-Za-z0-9._-]'), '_')}';\n    await _client.storage.from('employee-profile-photos').uploadBinary(path, bytes, fileOptions: FileOptions(contentType: contentType, upsert: false));\n    await _client.from('employee_profiles').upsert({'user_id':employeeId,'profile_photo_url':path,'updated_by':_client.auth.currentUser?.id});\n    return path;\n  }\n  Future<Map<String,dynamic>> _signedPhoto(Map<String,dynamic> json) async {\n    final raw = json['employee_profiles'];\n    if (raw is Map) { final profile = Map<String,dynamic>.from(raw); final path = profile['profile_photo_url']?.toString(); if (path != null && path.isNotEmpty && !path.startsWith('http')) { try { profile['profile_photo_url'] = await _client.storage.from('employee-profile-photos').createSignedUrl(path, 604800); } catch (_) { profile['profile_photo_url'] = null; } } json['employee_profiles'] = profile; }\n    return json;\n  }\n  String? _clean(String? value) => value == null || value.trim().isEmpty ? null : value.trim();
  String? _date(DateTime? value) => value == null ? null : '${value.year.toString().padLeft(4,'0')}-${value.month.toString().padLeft(2,'0')}-${value.day.toString().padLeft(2,'0')}';
}
