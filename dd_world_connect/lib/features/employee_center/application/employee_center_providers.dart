import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../data/employee_center_repository.dart';
import '../domain/employee_center_models.dart';

final employeeCenterRepositoryProvider=Provider<EmployeeCenterRepository>((ref)=>EmployeeCenterRepository(Supabase.instance.client));
final employeeIdCardProvider=FutureProvider.family<EmployeeIdCardRecord?,String>((ref,id)=>ref.watch(employeeCenterRepositoryProvider).myIdCard(id));
final employeeDocumentsProvider=FutureProvider.family<List<EmployeeDocumentRecord>,({String employeeId,bool owner})>((ref,args)=>ref.watch(employeeCenterRepositoryProvider).documents(args.employeeId,owner:args.owner));
final leaveRequestsProvider=FutureProvider.family<List<LeaveRequestRecord>,({String employeeId,bool owner,bool teamLeader})>((ref,args)=>ref.watch(employeeCenterRepositoryProvider).leaves(args.employeeId,owner:args.owner,teamLeader:args.teamLeader));
final downloadsProvider=FutureProvider<List<SharedMaterialRecord>>((ref)=>ref.watch(employeeCenterRepositoryProvider).downloads());
final trainingMaterialsProvider=FutureProvider<List<SharedMaterialRecord>>((ref)=>ref.watch(employeeCenterRepositoryProvider).training());
