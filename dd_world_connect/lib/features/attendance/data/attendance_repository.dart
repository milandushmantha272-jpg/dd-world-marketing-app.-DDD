import 'package:supabase_flutter/supabase_flutter.dart';
import '../domain/attendance_record.dart';

class AttendanceRepository {
  AttendanceRepository({SupabaseClient? client}) : _client = client ?? Supabase.instance.client;
  final SupabaseClient _client;

  static const _fields = 'id,user_id,date,status,team_id,check_in_time,check_out_time,check_in_latitude,check_in_longitude,check_out_latitude,check_out_longitude,check_in_accuracy_m,check_out_accuracy_m,notes,employee:users!attendance_user_id_fkey(id,name,agent_code,team_id),team:teams!attendance_team_id_fkey(id,name,team_code)';

  Future<String> _currentEmployeeId() async {
    final authId = _client.auth.currentUser?.id;
    if (authId == null) throw const AuthException('Sign in to use attendance.');
    final row = await _client.from('users').select('id').eq('auth_user_id', authId).single();
    return row['id'].toString();
  }

  String _today() {
    final now = DateTime.now();
    return '${now.year.toString().padLeft(4,'0')}-${now.month.toString().padLeft(2,'0')}-${now.day.toString().padLeft(2,'0')}';
  }

  Future<AttendanceRecord?> todayRecord() async {
    final employeeId = await _currentEmployeeId();
    final rows = await _client.from('attendance').select(_fields).eq('user_id', employeeId).eq('date', _today()).limit(1);
    if (rows.isEmpty) return null;
    return AttendanceRecord.fromJson(Map<String,dynamic>.from(rows.first));
  }

  Future<AttendanceRecord> checkIn(AttendanceGps gps) async {
    final employeeId = await _currentEmployeeId();
    final user = await _client.from('users').select('team_id').eq('id', employeeId).single();
    final now = DateTime.now().toUtc();
    final inserted = Map<String,dynamic>.from(await _client.from('attendance').insert({
      'user_id': employeeId, 'team_id': user['team_id'], 'date': _today(),
      'status': 'PRESENT', 'check_in_time': now.toIso8601String(),
      'check_in_latitude': gps.latitude, 'check_in_longitude': gps.longitude,
      'check_in_accuracy_m': gps.accuracyMeters,
      'gps_location': {'check_in': {'latitude': gps.latitude, 'longitude': gps.longitude, 'accuracy_m': gps.accuracyMeters}},
    }).select('id').single());
    final id = inserted['id'].toString();
    await _client.from('attendance_logs').insert({
      'attendance_id': id, 'user_id': employeeId, 'event_type': 'CHECK_IN',
      'occurred_at': now.toIso8601String(), 'latitude': gps.latitude,
      'longitude': gps.longitude, 'accuracy_m': gps.accuracyMeters,
    });
    return (await todayRecord())!;
  }

  Future<AttendanceRecord> checkOut(AttendanceGps gps) async {
    final employeeId = await _currentEmployeeId();
    final rows = await _client.from('attendance').select('id,check_out_time,gps_location').eq('user_id', employeeId).eq('date', _today()).limit(1);
    if (rows.isEmpty) throw const PostgrestException(message: 'Check in before checking out.');
    final current = Map<String,dynamic>.from(rows.first);
    if (current['check_out_time'] != null) throw const PostgrestException(message: 'You have already checked out today.');
    final now = DateTime.now().toUtc();
    final oldGps = current['gps_location'] is Map ? Map<String,dynamic>.from(current['gps_location'] as Map) : <String,dynamic>{};
    oldGps['check_out'] = {'latitude': gps.latitude, 'longitude': gps.longitude, 'accuracy_m': gps.accuracyMeters};
    await _client.from('attendance').update({
      'check_out_time': now.toIso8601String(), 'check_out_latitude': gps.latitude,
      'check_out_longitude': gps.longitude, 'check_out_accuracy_m': gps.accuracyMeters,
      'gps_location': oldGps, 'updated_at': now.toIso8601String(),
    }).eq('id', current['id']);
    await _client.from('attendance_logs').insert({
      'attendance_id': current['id'], 'user_id': employeeId, 'event_type': 'CHECK_OUT',
      'occurred_at': now.toIso8601String(), 'latitude': gps.latitude,
      'longitude': gps.longitude, 'accuracy_m': gps.accuracyMeters,
    });
    return (await todayRecord())!;
  }

  Future<List<AttendanceRecord>> history({DateTime? from, DateTime? to, String? userId, String? teamId}) async {
    var query = _client.from('attendance').select(_fields);
    if (from != null) query = query.gte('date', _date(from));
    if (to != null) query = query.lte('date', _date(to));
    if (userId != null) query = query.eq('user_id', userId);
    if (teamId != null) query = query.eq('team_id', teamId);
    final rows = await query.order('date', ascending: false).limit(500);
    return rows.map((row) => AttendanceRecord.fromJson(Map<String,dynamic>.from(row))).toList();
  }

  Future<List<Map<String,dynamic>>> teamAttendanceToday() async {
    final today = _today();
    final rows = await _client.from('attendance').select(_fields).eq('date', today).order('check_in_time');
    return rows.map((row) => Map<String,dynamic>.from(row)).toList();
  }

  Future<List<Map<String,dynamic>>> logs(String attendanceId) async {
    final rows = await _client.from('attendance_logs').select('id,event_type,occurred_at,latitude,longitude,accuracy_m,metadata').eq('attendance_id', attendanceId).order('occurred_at');
    return rows.map((row) => Map<String,dynamic>.from(row)).toList();
  }

  Future<List<Map<String,dynamic>>> monthlySummary({required DateTime month, String? teamId}) async {
    final start = DateTime(month.year,month.month,1);
    final end = DateTime(month.year,month.month+1,0);
    var query = _client.from('attendance').select('date,status,user_id,team_id');
    query = query.gte('date',_date(start)).lte('date',_date(end));
    if (teamId != null) query = query.eq('team_id',teamId);
    final rows = await query;
    final counts = <String,int>{'PRESENT':0,'LATE':0,'HALF_DAY':0,'LEAVE':0,'ABSENT':0};
    for(final row in rows){ final status=(row['status'] ?? 'PRESENT').toString().toUpperCase(); counts[status]=(counts[status] ?? 0)+1; }
    return counts.entries.map((e)=>{'status':e.key,'count':e.value}).toList();
  }

  Future<void> submitLeave({required String leaveType, required DateTime start, required DateTime end, required String reason}) async {
    final employeeId = await _currentEmployeeId();
    final user = await _client.from('users').select('team_id').eq('id',employeeId).single();
    await _client.from('leave_requests').insert({
      'user_id':employeeId,'team_id':user['team_id'],'leave_type':leaveType,
      'start_date':_date(start),'end_date':_date(end),'reason':reason.trim(),
    });
  }

  Future<List<Map<String,dynamic>>> leaveRequests() async {
    final rows = await _client.from('leave_requests').select('id,user_id,team_id,leave_type,start_date,end_date,reason,status,review_note,created_at,employee:users!leave_requests_user_id_fkey(name,agent_code)').order('created_at',ascending:false).limit(300);
    return rows.map((row)=>Map<String,dynamic>.from(row)).toList();
  }

  Future<void> reviewLeave(String id,{required String status,String? note}) async {
    final employeeId = await _currentEmployeeId();
    await _client.from('leave_requests').update({'status':status,'reviewed_by':employeeId,'reviewed_at':DateTime.now().toUtc().toIso8601String(),'review_note':note}).eq('id',id);
  }

  String _date(DateTime value) => '${value.year.toString().padLeft(4,'0')}-${value.month.toString().padLeft(2,'0')}-${value.day.toString().padLeft(2,'0')}';
}
