import 'package:supabase_flutter/supabase_flutter.dart';
import '../domain/team.dart';

class TeamRepository {
  TeamRepository({SupabaseClient? client}) : _client = client ?? Supabase.instance.client;
  final SupabaseClient _client;

  static const _teamFields = 'id,team_code,name,leader_id,status,description,created_at,leader:users!teams_leader_id_fkey(id,name,agent_code)';

  Future<List<Team>> list({String search = '', TeamStatus? status}) async {
    var query = _client.from('teams').select(_teamFields);
    if (status != null) query = query.eq('status', status.dbValue);
    final term = search.trim().replaceAll('%', r'\%').replaceAll(',', ' ');
    if (term.isNotEmpty) query = query.or('name.ilike.%$term%,team_code.ilike.%$term%');
    final rows = await query.order('name');
    final teams = <Team>[];
    for (final row in rows) {
      final json = Map<String, dynamic>.from(row);
      final members = await _client.from('team_members').select('id').eq('team_id', json['id']).isFilter('left_at', null);
      teams.add(Team.fromJson(json, employeeCount: members.length));
    }
    return teams;
  }

  Future<Team> get(String id) async {
    final json = Map<String, dynamic>.from(await _client.from('teams').select(_teamFields).eq('id', id).single());
    final members = await _client.from('team_members').select('id').eq('team_id', id).isFilter('left_at', null);
    return Team.fromJson(json, employeeCount: members.length);
  }

  Future<List<Map<String, dynamic>>> members(String teamId) async {
    final rows = await _client.from('users')
      .select('id,agent_code,name,phone,role,status,employment_status,id_approval_status,team_id,reports_to_user_id')
      .eq('team_id', teamId).order('name');
    return rows.map((r) => Map<String, dynamic>.from(r)).toList();
  }

  Future<List<Map<String, dynamic>>> eligibleLeaders({String? teamId}) async {
    final rows = await _client.from('users')
      .select('id,agent_code,name,phone,role,status,employment_status,id_approval_status,team_id')
      .inFilter('role', ['agent','team_leader'])
      .eq('status','active').eq('employment_status','ACTIVE').eq('id_approval_status','APPROVED')
      .order('name');
    return rows.where((row) => row['team_id'] == teamId || row['team_id'] == null || row['team_id']?.toString() == teamId).map((r) => Map<String,dynamic>.from(r)).toList();
  }

  Future<List<Map<String, dynamic>>> eligibleEmployees() async {
    final rows = await _client.from('users')
      .select('id,agent_code,name,phone,role,status,employment_status,team_id,reports_to_user_id')
      .inFilter('role', ['agent','team_leader','junior_team_leader'])
      .eq('status','active').eq('employment_status','ACTIVE').eq('id_approval_status','APPROVED')
      .order('name');
    return rows.map((r) => Map<String,dynamic>.from(r)).toList();
  }

  Future<void> create({required String code, required String name, required TeamStatus status, String? description}) async {
    await _client.from('teams').insert({'team_code':code.trim().toUpperCase(),'name':name.trim(),'status':status.dbValue,'description':_clean(description)});
  }

  Future<void> update(Team team,{required String code, required String name, required TeamStatus status, String? description}) async {
    await _client.from('teams').update({'team_code':code.trim().toUpperCase(),'name':name.trim(),'status':status.dbValue,'description':_clean(description)}).eq('id',team.id);
  }

  Future<void> delete(Team team) async {
    final count = await _client.from('team_members').select('id').eq('team_id',team.id).isFilter('left_at',null);
    if (count.isNotEmpty || team.leaderId != null) {
      throw const PostgrestException(message:'A team with current members or a Team Leader cannot be deleted. Transfer members and remove the leader, or archive the team.');
    }
    await _client.from('teams').delete().eq('id',team.id);
  }

  Future<void> setLeader(String teamId,String? leaderId,String reason) async {
    await _client.rpc('owner_set_team_leader',params:{'p_team_id':teamId,'p_leader_id':leaderId,'p_reason':reason.trim()});
  }

  Future<void> transferEmployee({required String employeeId,required String? destinationTeamId,required String reason}) async {
    final employee = await _client.from('users').select('id,team_id,reports_to_user_id,role').eq('id',employeeId).single();
    final oldTeamId = employee['team_id']?.toString();
    await _client.from('users').update({
      'team_id':destinationTeamId,
      'reports_to_user_id':null,
      if (employee['role'] == 'team_leader') 'role':'agent',
    }).eq('id',employeeId);
    // The database trigger records the transfer atomically with the canonical team_id update.
    // Record the operator's explicit reason in a second, auditable event.
    await _client.from('team_audit_logs').insert({
      'team_id':destinationTeamId ?? oldTeamId,
      'actor_user_id':_client.auth.currentUser?.id,
      'event_type':'EMPLOYEE_TRANSFER_REASON',
      'target_user_id':employeeId,
      'metadata':{'previous_team_id':oldTeamId,'new_team_id':destinationTeamId,'reason':reason.trim()},
    });
  }

  Future<List<Map<String,dynamic>>> transferHistory(String teamId) async {
    final rows = await _client.from('team_transfer_history')
      .select('id,employee_id,previous_team_id,new_team_id,reason,transferred_at,employee:users!team_transfer_history_employee_id_fkey(name,agent_code),previous_team:teams!team_transfer_history_previous_team_id_fkey(name),new_team:teams!team_transfer_history_new_team_id_fkey(name)')
      .or('previous_team_id.eq.$teamId,new_team_id.eq.$teamId')
      .order('transferred_at',ascending:false);
    return rows.map((r)=>Map<String,dynamic>.from(r)).toList();
  }

  Future<List<Map<String,dynamic>>> leaderHistory(String teamId) async {
    final rows = await _client.from('team_leader_history')
      .select('id,previous_leader_id,new_leader_id,reason,changed_at,previous_leader:users!team_leader_history_previous_leader_id_fkey(name,agent_code),new_leader:users!team_leader_history_new_leader_id_fkey(name,agent_code)')
      .eq('team_id',teamId).order('changed_at',ascending:false);
    return rows.map((r)=>Map<String,dynamic>.from(r)).toList();
  }

  Future<Team> statistics(Team team,{DateTime? from,DateTime? to}) async {
    final start=(from ?? DateTime(DateTime.now().year,DateTime.now().month,1)).toIso8601String().substring(0,10);
    final end=(to ?? DateTime.now()).toIso8601String().substring(0,10);
    final people=await members(team.id);
    final ids=people.map((p)=>p['id'].toString()).toList();
    if(ids.isEmpty) return team.withStatistics(activations:0,quantity:0,amount:0,present:0,attendance:0);
    final sales=await _client.from('sales').select('id,quantity,amount,verification_status,sale_date').eq('team_id',team.id).gte('sale_date',start).lte('sale_date',end);
    final attendance=await _client.from('attendance').select('id,user_id,status,date').inFilter('user_id',ids).gte('date',start).lte('date',end);
    var quantity=0; num amount=0; var activations=0; var present=0;
    for(final row in sales){
      quantity+=(row['quantity'] as num?)?.toInt() ?? 0;
      amount+=(row['amount'] as num?) ?? 0;
      if(['VERIFIED','SALE_CONFIRMED','COMPLETED'].contains(row['verification_status'])) activations++;
    }
    for(final row in attendance){ if(['present','late','half_day'].contains(row['status'])) present++; }
    return team.withStatistics(activations:activations,quantity:quantity,amount:amount,present:present,attendance:attendance.length);
  }

  String? _clean(String? v)=>v==null||v.trim().isEmpty?null:v.trim();
}
