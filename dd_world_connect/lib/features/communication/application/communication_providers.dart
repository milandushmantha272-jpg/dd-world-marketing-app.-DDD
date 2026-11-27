import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../data/communication_repository.dart';
import '../domain/communication_models.dart';

final communicationRepositoryProvider=Provider<CommunicationRepository>((ref)=>CommunicationRepository(Supabase.instance.client));
final meetingsProvider=FutureProvider.family<List<MeetingRecord>,String>((ref,id)=>ref.watch(communicationRepositoryProvider).meetings(id));
final staffDirectoryProvider=FutureProvider.family<List<Map<String,dynamic>>,String>((ref,id)=>ref.watch(communicationRepositoryProvider).staff(id));
final groupsProvider=FutureProvider.family<List<Map<String,dynamic>>,String>((ref,id)=>ref.watch(communicationRepositoryProvider).groups(id));
final feedProvider=FutureProvider<List<FeedPost>>((ref)=>ref.watch(communicationRepositoryProvider).feed());
final notificationsProvider = StreamProvider.family<List<StaffNotification>, String>((ref, employeeId) {
  final client = Supabase.instance.client;
  final repository = ref.watch(communicationRepositoryProvider);
  final controller = StreamController<List<StaffNotification>>();

  Future<void> refresh() async {
    try {
      controller.add(await repository.notifications(employeeId));
    } catch (error, stackTrace) {
      controller.addError(error, stackTrace);
    }
  }

  // Load the current inbox immediately, then refresh it on database changes.
  refresh();
  final channel = client
      .channel('ddwc-notifications-$employeeId')
      .onPostgresChanges(
        event: PostgresChangeEvent.all,
        schema: 'public',
        table: 'notifications',
        filter: PostgresChangeFilter(
          type: PostgresChangeFilterType.eq,
          column: 'user_id',
          value: employeeId,
        ),
        callback: (_) => refresh(),
      )
      .subscribe();

  ref.onDispose(() {
    client.removeChannel(channel);
    controller.close();
  });
  return controller.stream;
});
