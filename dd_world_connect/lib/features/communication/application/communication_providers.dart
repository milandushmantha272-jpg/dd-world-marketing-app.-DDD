import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../data/communication_repository.dart';
import '../domain/communication_models.dart';

final communicationRepositoryProvider=Provider<CommunicationRepository>((ref)=>CommunicationRepository(Supabase.instance.client));
final meetingsProvider=FutureProvider.family<List<MeetingRecord>,String>((ref,id)=>ref.watch(communicationRepositoryProvider).meetings(id));
final staffDirectoryProvider=FutureProvider.family<List<Map<String,dynamic>>,String>((ref,id)=>ref.watch(communicationRepositoryProvider).staff(id));
final groupsProvider=FutureProvider.family<List<Map<String,dynamic>>,String>((ref,id)=>ref.watch(communicationRepositoryProvider).groups(id));
final feedProvider=FutureProvider<List<FeedPost>>((ref)=>ref.watch(communicationRepositoryProvider).feed());
final notificationsProvider=FutureProvider.family<List<StaffNotification>,String>((ref,id)=>ref.watch(communicationRepositoryProvider).notifications(id));
