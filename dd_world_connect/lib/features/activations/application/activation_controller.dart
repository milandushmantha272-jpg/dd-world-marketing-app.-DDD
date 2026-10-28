import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';
import '../data/activation_repository.dart';
import '../domain/activation.dart';
import '../../authentication/domain/employee_profile.dart';
final activationRepositoryProvider=Provider<ActivationRepository>((ref)=>ActivationRepository());
final activationHistoryProvider=FutureProvider.autoDispose<List<Activation>>((ref)=>ref.watch(activationRepositoryProvider).history());
final activationStatisticsProvider=FutureProvider.autoDispose<ActivationStatistics>((ref)=>ref.watch(activationRepositoryProvider).statistics());
class ActivationController {
  ActivationController(this._repository);
  final ActivationRepository _repository;
  Future<Activation> recordAndLaunch({required EmployeeProfile employee,required ActivationType type}) async {
    final position=await _currentPosition();
    final record=await _repository.create(employeeId:employee.id,type:type,latitude:position.latitude,longitude:position.longitude);
    // USSD characters are percent-encoded in the tel URI; the record is committed before dialer launch.
    final uri=Uri.parse('tel:${Uri.encodeComponent(type.ussdCode)}');
    if(!await launchUrl(uri,mode:LaunchMode.externalApplication)){
      throw StateError('Activation saved as ${record.id}, but Android could not open the dialer. Open Phone and dial ${type.ussdCode}.');
    }
    return record;
  }
  Future<Position> _currentPosition() async {
    if(!await Geolocator.isLocationServiceEnabled())throw StateError('Turn on Location/GPS to record an activation.');
    var permission=await Geolocator.checkPermission();
    if(permission==LocationPermission.denied)permission=await Geolocator.requestPermission();
    if(permission==LocationPermission.denied||permission==LocationPermission.deniedForever)throw StateError('Location permission is required to record activation GPS coordinates.');
    return Geolocator.getCurrentPosition(locationSettings:const LocationSettings(accuracy:LocationAccuracy.high,timeLimit:Duration(seconds:20)));
  }
}