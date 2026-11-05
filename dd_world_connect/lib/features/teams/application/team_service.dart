import '../data/team_repository.dart';
import '../domain/team.dart';

class TeamService {
  TeamService(this._repository);
  final TeamRepository _repository;
  Future<List<Team>> list({String search='',TeamStatus? status})=>_repository.list(search:search,status:status);
  Future<Team> details(String id)=>_repository.get(id);
  Future<List<Map<String,dynamic>>> members(String id)=>_repository.members(id);
  Future<void> create({required String code,required String name,required TeamStatus status,String? description})=>_repository.create(code:code,name:name,status:status,description:description);
  Future<void> update(Team team,{required String code,required String name,required TeamStatus status,String? description})=>_repository.update(team,code:code,name:name,status:status,description:description);
  Future<void> appointLeader(String teamId,String? leaderId,String reason)=>_repository.setLeader(teamId,leaderId,reason);
  Future<void> transferEmployee({required String employeeId,required String? destinationTeamId,required String reason})=>_repository.transferEmployee(employeeId:employeeId,destinationTeamId:destinationTeamId,reason:reason);
  Future<void> delete(Team team)=>_repository.delete(team);
  Future<Team> statistics(Team team,{DateTime? from,DateTime? to})=>_repository.statistics(team,from:from,to:to);
}
