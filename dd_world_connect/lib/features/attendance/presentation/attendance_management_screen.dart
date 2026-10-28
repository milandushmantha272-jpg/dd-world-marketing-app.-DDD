import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../authentication/domain/employee_profile.dart';
import '../application/attendance_controller.dart';
import '../domain/attendance_record.dart';

const _attendanceBlue = Color(0xFF1F5AA6);

class AttendanceManagementScreen extends ConsumerStatefulWidget {
  const AttendanceManagementScreen({super.key, required this.profile});
  final EmployeeProfile profile;
  @override
  ConsumerState<AttendanceManagementScreen> createState() => _AttendanceManagementScreenState();
}

class _AttendanceManagementScreenState extends ConsumerState<AttendanceManagementScreen> {
  int _tab = 0;
  bool _busy = false;
  String? _message;
  bool get _isOwner => widget.profile.role == EmployeeRole.owner;
  bool get _canViewTeam => _isOwner || widget.profile.role == EmployeeRole.teamLeader;

  Future<void> _runGpsAction(bool checkIn) async {
    setState(() { _busy = true; _message = null; });
    try {
      final service = ref.read(attendanceServiceProvider);
      if (checkIn) {
        await service.checkIn();
      } else {
        await service.checkOut();
      }
      ref.invalidate(todayAttendanceProvider);
      ref.invalidate(attendanceHistoryProvider);
      ref.invalidate(teamAttendanceTodayProvider);
      if (mounted) setState(() => _message = checkIn ? 'GPS check-in recorded successfully.' : 'GPS check-out recorded successfully.');
    } catch (error) {
      if (mounted) setState(() => _message = _friendly(error));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _refresh() async {
    ref.invalidate(todayAttendanceProvider);
    ref.invalidate(attendanceHistoryProvider);
    ref.invalidate(teamAttendanceTodayProvider);
    ref.invalidate(attendanceMonthProvider(DateTime(DateTime.now().year,DateTime.now().month)));
    ref.invalidate(leaveRequestsProvider);
    await Future<void>.delayed(const Duration(milliseconds: 200));
  }

  @override
  Widget build(BuildContext context) {
    final tabs = <String>['Dashboard','History','Reports',if(_canViewTeam) 'Team Attendance','GPS Map','Leave'];
    final currentTab = _tab >= tabs.length ? 0 : _tab;
    return Scaffold(
      appBar: AppBar(title: const Text('Attendance & GPS'), actions: [IconButton(tooltip:'Refresh',onPressed:_refresh,icon:const Icon(Icons.refresh))]),
      body: Column(children: [
        SingleChildScrollView(scrollDirection: Axis.horizontal,padding: const EdgeInsets.symmetric(horizontal: 8,vertical: 8),child: Row(children: [
          for(var i=0;i<tabs.length;i++) Padding(padding: const EdgeInsets.symmetric(horizontal: 3),child: ChoiceChip(label:Text(tabs[i]),selected:currentTab==i,onSelected:(_)=>setState(()=>_tab=i))),
        ])),
        Expanded(child: IndexedStack(index:currentTab,children:[
          _dashboard(),_history(),_reports(),if(_canViewTeam) _teamAttendance(),_gpsMap(),_leave(),
        ])),
      ]),
    );
  }

  Widget _dashboard() {
    final today = ref.watch(todayAttendanceProvider);
    return RefreshIndicator(onRefresh:_refresh,child:ListView(padding:const EdgeInsets.all(16),children:[
      Container(padding:const EdgeInsets.all(18),decoration:BoxDecoration(color:_attendanceBlue,borderRadius:BorderRadius.circular(18)),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
        const Text('DD WORLD MARKETING',style:TextStyle(color:Colors.white70,letterSpacing:1)),
        const SizedBox(height:8),Text(widget.profile.fullName,style:const TextStyle(color:Colors.white,fontSize:22,fontWeight:FontWeight.bold)),
        const SizedBox(height:4),Text('Employee code: ${widget.profile.employeeCode}',style:const TextStyle(color:Colors.white)),
      ])),
      const SizedBox(height:16),
      today.when(loading:()=>const Center(child:CircularProgressIndicator()),error:(e,_)=>_error(e),data:(record){
        final checkedIn=record?.checkInTime!=null;
        final checkedOut=record?.checkOutTime!=null;
        return Card(child:Padding(padding:const EdgeInsets.all(16),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
          const Text("Today's Attendance",style:TextStyle(fontSize:18,fontWeight:FontWeight.bold)),
          const SizedBox(height:10),
          _dataLine('Status',record?.status.label ?? 'Not checked in'),
          _dataLine('Check-in time',_time(record?.checkInTime)),
          _dataLine('Check-out time',_time(record?.checkOutTime)),
          _dataLine('Check-in GPS',_coordinates(record?.checkInLatitude,record?.checkInLongitude)),
          _dataLine('Check-out GPS',_coordinates(record?.checkOutLatitude,record?.checkOutLongitude)),
          const SizedBox(height:14),
          Row(children:[
            Expanded(child:FilledButton.icon(onPressed:_busy||checkedIn?null:()=>_runGpsAction(true),icon:_busy?const SizedBox(width:18,height:18,child:CircularProgressIndicator(strokeWidth:2)):const Icon(Icons.login),label:const Text('GPS Check In'))),
            const SizedBox(width:10),
            Expanded(child:OutlinedButton.icon(onPressed:_busy||!checkedIn||checkedOut?null:()=>_runGpsAction(false),icon:const Icon(Icons.logout),label:const Text('GPS Check Out'))),
          ]),
          if(checkedOut) const Padding(padding:EdgeInsets.only(top:8),child:Text('Attendance complete for today.',style:TextStyle(color:Colors.green))),
        ])));
      }),
      if(_isOwner) _ownerLivePanel(),
      if(_message!=null) Padding(padding:const EdgeInsets.only(top:8),child:Text(_message!,style:TextStyle(color:_message!.contains('successfully')?Colors.green:Theme.of(context).colorScheme.error))),
      const SizedBox(height:8),
      const Text('GPS permission and device location must be enabled. Attendance captures coordinates and reported GPS accuracy.',style:TextStyle(fontSize:12,color:Colors.black54)),
    ]));
  }


  Widget _ownerLivePanel() {
    final result = ref.watch(teamAttendanceTodayProvider);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Owner Live Attendance', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          const Text('Latest attendance records visible under Owner access. Pull down or refresh to update.', style: TextStyle(fontSize: 12, color: Colors.black54)),
          result.when(
            loading: () => const Padding(padding: EdgeInsets.all(12), child: Center(child: CircularProgressIndicator())),
            error: (e, _) => Text(_friendly(e)),
            data: (rows) => rows.isEmpty
                ? const Padding(padding: EdgeInsets.all(12), child: Text('No attendance records recorded today.'))
                : Column(children: rows.take(12).map((row) {
                    final record = AttendanceRecord.fromJson(row);
                    return ListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      leading: Icon(record.checkOutTime == null ? Icons.location_on : Icons.task_alt, color: _attendanceBlue),
                      title: Text(record.employeeName ?? 'Employee'),
                      subtitle: Text('${record.teamName ?? 'No team'} • In ${_time(record.checkInTime)} • Out ${_time(record.checkOutTime)}'),
                      trailing: Text(record.status.label),
                    );
                  }).toList()),
          ),
        ]),
      ),
    );
  }

  Widget _history() {
    final result=ref.watch(attendanceHistoryProvider);
    return result.when(loading:()=>const Center(child:CircularProgressIndicator()),error:(e,_)=>_error(e),data:(records)=>RefreshIndicator(onRefresh:_refresh,child:records.isEmpty?ListView(children:const [SizedBox(height:100),Center(child:Text('No attendance records available.'))]):ListView.builder(padding:const EdgeInsets.all(12),itemCount:records.length,itemBuilder:(context,i){
      final r=records[i];return Card(child:ListTile(leading:const CircleAvatar(child:Icon(Icons.event_available)),title:Text(r.date),subtitle:Text('In: ${_time(r.checkInTime)} • Out: ${_time(r.checkOutTime)}\n${_coordinates(r.checkInLatitude,r.checkInLongitude)}'),isThreeLine:true,trailing:Text(r.status.label),onTap:()=>_showLogs(r)));
    })));
  }

  Future<void> _showLogs(AttendanceRecord record) async {
    final logs=await ref.read(attendanceRepositoryProvider).logs(record.id);
    if(!mounted)return;
    await showModalBottomSheet<void>(context:context,showDragHandle:true,builder:(context)=>ListView(padding:const EdgeInsets.all(16),children:[
      Text('Attendance audit trail • ${record.date}',style:const TextStyle(fontWeight:FontWeight.bold,fontSize:18)),
      for(final log in logs) ListTile(leading:Icon(log['event_type']=='CHECK_IN'?Icons.login:Icons.logout),title:Text((log['event_type']??'Event').toString().replaceAll('_',' ')),subtitle:Text('${log['occurred_at']}\n${_coordinates(_asDouble(log['latitude']),_asDouble(log['longitude']))}')),
    ]));
  }

  Widget _reports() {
    final month=DateTime(DateTime.now().year,DateTime.now().month);
    final result=ref.watch(attendanceMonthProvider(month));
    return result.when(loading:()=>const Center(child:CircularProgressIndicator()),error:(e,_)=>_error(e),data:(items)=>ListView(padding:const EdgeInsets.all(16),children:[
      Text('Monthly Attendance • ${month.year}-${month.month.toString().padLeft(2,'0')}',style:const TextStyle(fontSize:18,fontWeight:FontWeight.bold)),
      const SizedBox(height:12),
      for(final item in items) Card(child:ListTile(leading:const Icon(Icons.bar_chart,color:_attendanceBlue),title:Text((item['status']??'').toString().replaceAll('_',' ')),trailing:Text((item['count']??0).toString(),style:const TextStyle(fontSize:20,fontWeight:FontWeight.bold)))),
      const Padding(padding:EdgeInsets.only(top:12),child:Text('Counts are based on recorded attendance rows for the current calendar month. Missing attendance rows are not inferred as absences.',style:TextStyle(fontSize:12,color:Colors.black54))),
    ]));
  }

  Widget _teamAttendance() {
    final result=ref.watch(teamAttendanceTodayProvider);
    return result.when(loading:()=>const Center(child:CircularProgressIndicator()),error:(e,_)=>_error(e),data:(rows)=>RefreshIndicator(onRefresh:_refresh,child:rows.isEmpty?ListView(children:const [SizedBox(height:100),Center(child:Text('No visible attendance records for today.'))]):ListView.builder(padding:const EdgeInsets.all(12),itemCount:rows.length,itemBuilder:(context,i){
      final record=AttendanceRecord.fromJson(rows[i]);return Card(child:ListTile(leading:const Icon(Icons.person_pin_circle,color:_attendanceBlue),title:Text(record.employeeName??'Employee'),subtitle:Text('${record.employeeCode??''} • ${record.teamName??'No team'}\nIn ${_time(record.checkInTime)} | Out ${_time(record.checkOutTime)}'),isThreeLine:true,trailing:Text(record.status.label)));
    })));
  }

  Widget _gpsMap() {
    final result=ref.watch(attendanceHistoryProvider);
    return result.when(loading:()=>const Center(child:CircularProgressIndicator()),error:(e,_)=>_error(e),data:(records){
      final mapped=records.where((r)=>(r.checkInLatitude!=null&&r.checkInLongitude!=null)||(r.checkOutLatitude!=null&&r.checkOutLongitude!=null)).toList();
      return ListView(padding:const EdgeInsets.all(12),children:[
        const Text('GPS Attendance Locations',style:TextStyle(fontSize:18,fontWeight:FontWeight.bold)),
        const SizedBox(height:6),const Text('Recorded check-in and check-out coordinates. Tap a coordinate to copy it for mapping or audit.',style:TextStyle(color:Colors.black54)),
        if(mapped.isEmpty) const Padding(padding:EdgeInsets.all(32),child:Center(child:Text('No GPS coordinates available for visible attendance records.'))),
        for(final r in mapped) Card(child:Padding(padding:const EdgeInsets.all(12),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
          Text('${r.employeeName??widget.profile.fullName} • ${r.date}',style:const TextStyle(fontWeight:FontWeight.bold)),
          if(r.checkInLatitude!=null&&r.checkInLongitude!=null) ListTile(dense:true,contentPadding:EdgeInsets.zero,leading:const Icon(Icons.login),title:const Text('Check-in location'),subtitle:Text(_coordinates(r.checkInLatitude,r.checkInLongitude)),onTap:()=>_copyCoordinates(r.checkInLatitude!,r.checkInLongitude!)),
          if(r.checkOutLatitude!=null&&r.checkOutLongitude!=null) ListTile(dense:true,contentPadding:EdgeInsets.zero,leading:const Icon(Icons.logout),title:const Text('Check-out location'),subtitle:Text(_coordinates(r.checkOutLatitude,r.checkOutLongitude)),onTap:()=>_copyCoordinates(r.checkOutLatitude!,r.checkOutLongitude!)),
        ]))),
      ]);
    });
  }

  Widget _leave() {
    final requests=ref.watch(leaveRequestsProvider);
    return ListView(padding:const EdgeInsets.all(12),children:[
      if(!_isOwner) Align(alignment:Alignment.centerLeft,child:FilledButton.icon(onPressed:_submitLeave,icon:const Icon(Icons.add),label:const Text('Request Leave / Half Day'))),
      const SizedBox(height:8),
      requests.when(loading:()=>const Center(child:CircularProgressIndicator()),error:(e,_)=>_error(e),data:(rows)=>Column(children:[
        if(rows.isEmpty) const Padding(padding:EdgeInsets.all(24),child:Text('No leave requests visible.')),
        for(final row in rows) Card(child:ListTile(leading:const Icon(Icons.event_busy),title:Text('${row['leave_type']} • ${row['start_date']} – ${row['end_date']}'),subtitle:Text('${(row['employee'] as Map?)?['name']??'Employee'}\n${row['reason']}'),isThreeLine:true,trailing:Text((row['status']??'PENDING').toString()),onTap:_canViewTeam&&row['status']=='PENDING'?()=>_reviewLeave(row):null)),
      ])),
    ]);
  }

  Future<void> _submitLeave() async {
    final reason = TextEditingController();
    var type = 'LEAVE';
    var start = DateTime.now();
    var end = DateTime.now();

    final accepted = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (dialogContext, setDialogState) {
            return AlertDialog(
              title: const Text('Leave Request'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    DropdownButtonFormField<String>(
                      value: type,
                      decoration: const InputDecoration(labelText: 'Type'),
                      items: const [
                        DropdownMenuItem(value: 'LEAVE', child: Text('Leave')),
                        DropdownMenuItem(value: 'HALF_DAY', child: Text('Half Day')),
                      ],
                      onChanged: (value) {
                        setDialogState(() {
                          type = value ?? 'LEAVE';
                        });
                      },
                    ),
                    ListTile(
                      title: Text('Start: ${start.toIso8601String().substring(0, 10)}'),
                      trailing: const Icon(Icons.calendar_today),
                      onTap: () async {
                        final selected = await showDatePicker(
                          context: dialogContext,
                          initialDate: start,
                          firstDate: DateTime.now().subtract(const Duration(days: 365)),
                          lastDate: DateTime.now().add(const Duration(days: 365)),
                        );
                        if (selected != null) {
                          setDialogState(() {
                            start = selected;
                            if (end.isBefore(start)) end = start;
                          });
                        }
                      },
                    ),
                    ListTile(
                      title: Text('End: ${end.toIso8601String().substring(0, 10)}'),
                      trailing: const Icon(Icons.calendar_today),
                      onTap: () async {
                        final selected = await showDatePicker(
                          context: dialogContext,
                          initialDate: end.isBefore(start) ? start : end,
                          firstDate: start,
                          lastDate: DateTime.now().add(const Duration(days: 365)),
                        );
                        if (selected != null) {
                          setDialogState(() {
                            end = selected;
                          });
                        }
                      },
                    ),
                    TextField(
                      controller: reason,
                      minLines: 2,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        labelText: 'Reason (required)',
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(dialogContext).pop(false),
                  child: const Text('Cancel'),
                ),
                FilledButton(
                  onPressed: () => Navigator.of(dialogContext).pop(true),
                  child: const Text('Submit'),
                ),
              ],
            );
          },
        );
      },
    );

    if (accepted != true) {
      reason.dispose();
      return;
    }

    try {
      await ref.read(attendanceServiceProvider).submitLeave(
        type: type,
        start: start,
        end: end,
        reason: reason.text,
      );
      ref.invalidate(leaveRequestsProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Leave request submitted.')),
        );
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_friendly(error))),
        );
      }
    } finally {
      reason.dispose();
    }
  }

  Future<void> _reviewLeave(Map<String,dynamic> row) async {
    final choice=await showModalBottomSheet<String>(context:context,showDragHandle:true,builder:(context)=>SafeArea(child:Column(mainAxisSize:MainAxisSize.min,children:[
      ListTile(leading:const Icon(Icons.check_circle,color:Colors.green),title:const Text('Approve'),onTap:()=>Navigator.pop(context,'APPROVED')),
      ListTile(leading:const Icon(Icons.cancel,color:Colors.red),title:const Text('Reject'),onTap:()=>Navigator.pop(context,'REJECTED')),
    ])));
    if(choice==null)return;
    try{await ref.read(attendanceServiceProvider).reviewLeave(row['id'].toString(),status:choice);ref.invalidate(leaveRequestsProvider);if(mounted)ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('Leave request updated.')));}catch(e){if(mounted)ScaffoldMessenger.of(context).showSnackBar(SnackBar(content:Text(_friendly(e))));}
  }

  Widget _error(Object e)=>Center(child:Padding(padding:const EdgeInsets.all(20),child:Text(_friendly(e),textAlign:TextAlign.center)));
  Widget _dataLine(String label,String value)=>Padding(padding:const EdgeInsets.symmetric(vertical:4),child:Row(crossAxisAlignment:CrossAxisAlignment.start,children:[SizedBox(width:125,child:Text(label,style:const TextStyle(color:Colors.black54))),Expanded(child:Text(value))]));
  String _time(DateTime? value)=>value==null?'—':TimeOfDay.fromDateTime(value.toLocal()).format(context);
  String _coordinates(double? lat,double? lng)=>lat==null||lng==null?'—':'${lat.toStringAsFixed(6)}, ${lng.toStringAsFixed(6)}';
  double? _asDouble(Object? value)=>value is num?value.toDouble():double.tryParse(value?.toString()??'');
  Future<void> _copyCoordinates(double lat,double lng) async {await Clipboard.setData(ClipboardData(text:'$lat,$lng'));if(mounted)ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('Coordinates copied.')));}
  String _friendly(Object error){final raw=error.toString().replaceFirst('Exception: ','').replaceFirst('PostgrestException(message: ','');if(raw.contains('duplicate key')||raw.contains('attendance_user_date_unique_idx'))return 'Attendance has already been recorded for today.';return raw;}
}
