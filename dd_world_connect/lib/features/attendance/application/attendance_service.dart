import 'package:geolocator/geolocator.dart';
import '../data/attendance_repository.dart';
import '../domain/attendance_record.dart';

class AttendanceService {
  AttendanceService(this._repository);
  final AttendanceRepository _repository;

  Future<AttendanceGps> captureGps() async {
    if (!await Geolocator.isLocationServiceEnabled()) {
      throw Exception('Turn on Location Services before recording attendance.');
    }
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) permission = await Geolocator.requestPermission();
    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      throw Exception('Location permission is required for GPS attendance.');
    }
    final position = await Geolocator.getCurrentPosition(locationSettings: const LocationSettings(accuracy: LocationAccuracy.high,timeLimit: Duration(seconds: 20)));
    if (position.accuracy > 150) {
      throw Exception('GPS accuracy is too low (${position.accuracy.toStringAsFixed(0)} m). Move outdoors and try again.');
    }
    return AttendanceGps(latitude: position.latitude,longitude: position.longitude,accuracyMeters: position.accuracy);
  }

  Future<AttendanceRecord> checkIn() async => _repository.checkIn(await captureGps());
  Future<AttendanceRecord> checkOut() async => _repository.checkOut(await captureGps());
  Future<AttendanceRecord?> today() => _repository.todayRecord();
  Future<List<AttendanceRecord>> history({DateTime? from,DateTime? to,String? userId,String? teamId}) => _repository.history(from:from,to:to,userId:userId,teamId:teamId);
  Future<List<Map<String,dynamic>>> teamToday() => _repository.teamAttendanceToday();
  Future<List<Map<String,dynamic>>> summary({required DateTime month,String? teamId}) => _repository.monthlySummary(month:month,teamId:teamId);
  Future<List<Map<String,dynamic>>> leaveRequests() => _repository.leaveRequests();
  Future<void> submitLeave({required String type,required DateTime start,required DateTime end,required String reason}) => _repository.submitLeave(leaveType:type,start:start,end:end,reason:reason);
  Future<void> reviewLeave(String id,{required String status,String? note}) => _repository.reviewLeave(id,status:status,note:note);
}
