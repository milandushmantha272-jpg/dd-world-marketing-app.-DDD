import 'dart:typed_data';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/commission_repository.dart';
import '../domain/commission.dart';
final commissionRepositoryProvider=Provider<CommissionRepository>((ref)=>CommissionRepository());
final commissionMonthProvider=StateProvider<DateTime>((ref)=>DateTime(DateTime.now().year,DateTime.now().month,1));
final commissionRecordsProvider=FutureProvider<List<CommissionRecord>>((ref)=>ref.watch(commissionRepositoryProvider).list(month:ref.watch(commissionMonthProvider)));
final commissionStatisticsProvider=FutureProvider<Map<String,dynamic>>((ref)=>ref.watch(commissionRepositoryProvider).statistics(month:ref.watch(commissionMonthProvider)));
final commissionComplaintsProvider=FutureProvider<List<CommissionComplaint>>((ref)=>ref.watch(commissionRepositoryProvider).complaints());
final commissionCommentsProvider=FutureProvider.family<List<Map<String,dynamic>>,String>((ref,id)=>ref.watch(commissionRepositoryProvider).comments(id));
final commissionHistoryProvider=FutureProvider.family<List<Map<String,dynamic>>,String>((ref,id)=>ref.watch(commissionRepositoryProvider).history(id));
class CommissionUploadController extends StateNotifier<AsyncValue<int?>>{CommissionUploadController(this._repository):super(const AsyncValue.data(null));final CommissionRepository _repository;Future<void> upload({required Uint8List bytes,required String fileName,required DateTime month})async{state=const AsyncValue.loading();try{state=AsyncValue.data(await _repository.uploadMonthlyCsv(bytes:bytes,fileName:fileName,month:month));}catch(e,st){state=AsyncValue.error(e,st);}}}
final commissionUploadControllerProvider=StateNotifierProvider<CommissionUploadController,AsyncValue<int?>>((ref)=>CommissionUploadController(ref.watch(commissionRepositoryProvider)));
