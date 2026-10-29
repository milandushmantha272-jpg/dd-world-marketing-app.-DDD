import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/attendance_repository.dart';
import '../domain/attendance_record.dart';
import 'attendance_service.dart';

final attendanceRepositoryProvider = Provider<AttendanceRepository>((ref)=>AttendanceRepository());
final attendanceServiceProvider = Provider<AttendanceService>((ref)=>AttendanceService(ref.watch(attendanceRepositoryProvider)));
final todayAttendanceProvider = FutureProvider<AttendanceRecord?>((ref)=>ref.watch(attendanceServiceProvider).today());
final attendanceHistoryProvider = FutureProvider<List<AttendanceRecord>>((ref)=>ref.watch(attendanceServiceProvider).history());
final teamAttendanceTodayProvider = FutureProvider<List<Map<String,dynamic>>>((ref)=>ref.watch(attendanceServiceProvider).teamToday());
final attendanceMonthProvider = FutureProvider.family<List<Map<String,dynamic>>,DateTime>((ref,month)=>ref.watch(attendanceServiceProvider).summary(month:month));
final leaveRequestsProvider = FutureProvider<List<Map<String,dynamic>>>((ref)=>ref.watch(attendanceServiceProvider).leaveRequests());
