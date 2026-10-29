import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/team_repository.dart';
import '../domain/team.dart';

final teamRepositoryProvider = Provider<TeamRepository>((ref) => TeamRepository());
final teamSearchProvider = StateProvider<String>((ref) => '');
final teamStatusFilterProvider = StateProvider<TeamStatus?>((ref) => null);
final teamsProvider = FutureProvider<List<Team>>((ref) => ref.watch(teamRepositoryProvider).list(
  search:ref.watch(teamSearchProvider), status:ref.watch(teamStatusFilterProvider),
));
final teamDetailsProvider = FutureProvider.family<Team,String>((ref,id)=>ref.watch(teamRepositoryProvider).get(id));
final teamMembersProvider = FutureProvider.family<List<Map<String,dynamic>>,String>((ref,id)=>ref.watch(teamRepositoryProvider).members(id));
final teamTransferHistoryProvider = FutureProvider.family<List<Map<String,dynamic>>,String>((ref,id)=>ref.watch(teamRepositoryProvider).transferHistory(id));
final teamLeaderHistoryProvider = FutureProvider.family<List<Map<String,dynamic>>,String>((ref,id)=>ref.watch(teamRepositoryProvider).leaderHistory(id));
