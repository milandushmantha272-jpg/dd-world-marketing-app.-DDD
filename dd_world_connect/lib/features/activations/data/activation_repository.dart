import 'package:supabase_flutter/supabase_flutter.dart';
import '../domain/activation.dart';
class ActivationRepository {
  ActivationRepository({SupabaseClient? client}) : _client=client ?? Supabase.instance.client;
  final SupabaseClient _client;
  static const _columns='id,employee_id,employee_name,employee_code,team_id,team_name,activation_type,created_at,gps_latitude,gps_longitude,status';
  Future<Activation> create({required String employeeId, required ActivationType type, required double latitude, required double longitude}) async {
    final inserted = await _client.from('activations').insert({'employee_id':employeeId,'activation_type':type.databaseValue,'gps_latitude':latitude,'gps_longitude':longitude}).select('id').single();
    final row = await _client.from('activation_center_employee_view').select(_columns).eq('id', inserted['id']).single();
    return Activation.fromJson(row);
  }
  Future<List<Activation>> history({int limit=100}) async {
    final rows=await _client.from('activation_center_employee_view').select(_columns).order('created_at',ascending:false).limit(limit);
    return (rows as List).map((r)=>Activation.fromJson(Map<String,dynamic>.from(r))).toList();
  }
  Future<ActivationStatistics> statistics() async {
    final rows=await _client.from('activations').select('activation_type,created_at');
    final now=DateTime.now(), today=DateTime(now.year,now.month,now.day), week=today.subtract(Duration(days:today.weekday-1)), month=DateTime(now.year,now.month,1);
    var daily=0,weekly=0,monthly=0;
    final byType=<ActivationType,int>{for(final t in ActivationType.values)t:0};
    for(final value in rows as List){final r=Map<String,dynamic>.from(value);final d=DateTime.parse(r['created_at'].toString()).toLocal();if(!d.isBefore(today))daily++;if(!d.isBefore(week))weekly++;if(!d.isBefore(month))monthly++;final t=ActivationTypeX.fromDatabase(r['activation_type']);byType[t]=(byType[t]??0)+1;}
    return ActivationStatistics(daily:daily,weekly:weekly,monthly:monthly,byType:byType);
  }
}