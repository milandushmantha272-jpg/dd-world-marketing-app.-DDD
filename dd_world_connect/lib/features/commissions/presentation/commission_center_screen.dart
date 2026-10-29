import 'dart:typed_data';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../authentication/domain/employee_profile.dart';
import '../application/commission_controller.dart';
import '../data/commission_repository.dart';
import '../domain/commission.dart';

class CommissionCenterScreen extends ConsumerWidget {
 const CommissionCenterScreen({super.key,required this.profile});final EmployeeProfile profile;
 bool get _owner=>profile.role==EmployeeRole.owner;bool get _leader=>profile.role==EmployeeRole.teamLeader;
 @override Widget build(BuildContext context,WidgetRef ref){final records=ref.watch(commissionRecordsProvider);final stats=ref.watch(commissionStatisticsProvider);final month=ref.watch(commissionMonthProvider);
 return Scaffold(appBar:AppBar(title:const Text('Commission Center'),actions:[IconButton(onPressed:()=>ref.invalidate(commissionRecordsProvider),icon:const Icon(Icons.refresh))]),body:RefreshIndicator(onRefresh:()async{ref.invalidate(commissionRecordsProvider);ref.invalidate(commissionStatisticsProvider);ref.invalidate(commissionComplaintsProvider);await ref.read(commissionRecordsProvider.future);},child:ListView(padding:const EdgeInsets.all(16),children:[
 Card(child:ListTile(leading:const Icon(Icons.calendar_month),title:Text('Commission period: ${month.year}-${month.month.toString().padLeft(2,'0')}'),subtitle:const Text('Select month to view monthly commissions'),trailing:const Icon(Icons.edit_calendar),onTap:()async{final d=await showDatePicker(context:context,initialDate:month,firstDate:DateTime(2020),lastDate:DateTime(2100),initialDatePickerMode:DatePickerMode.year);if(d!=null)ref.read(commissionMonthProvider.notifier).state=DateTime(d.year,d.month,1);})),
 stats.when(data:(s)=>GridView.count(shrinkWrap:true,physics:const NeverScrollableScrollPhysics(),crossAxisCount:2,childAspectRatio:1.7,children:[_metric('Records','${s['records']}'),_metric('Total','LKR ${(s['total'] as num).toStringAsFixed(2)}'),_metric('Confirmed','LKR ${(s['confirmed'] as num).toStringAsFixed(2)}'),_metric('Open issues','${s['issues']}')]),loading:()=>const LinearProgressIndicator(),error:(e,_)=>_error(e)),
 if(_owner)...[const SizedBox(height:12),FilledButton.icon(onPressed:()=>_upload(context,ref,month),icon:const Icon(Icons.upload_file),label:const Text('Upload monthly CSV report')),const SizedBox(height:8),OutlinedButton.icon(onPressed:()=>_showComplaints(context,ref),icon:const Icon(Icons.report_gmailerrorred),label:const Text('View complaints'))],
 if(_leader)const Padding(padding:EdgeInsets.symmetric(vertical:8),child:Text('Team commission view · comments can be shared with your team')),
 OutlinedButton.icon(onPressed:()=>Navigator.push(context,MaterialPageRoute<void>(builder:(_)=>CommissionHistoryScreen(profile:profile))),icon:const Icon(Icons.history),label:const Text('Commission history')),
 const SizedBox(height:8),const Text('Monthly commissions',style:TextStyle(fontWeight:FontWeight.bold,fontSize:18)),
    records.when(
      data: (items) {
        if (items.isEmpty) {
          return const Padding(padding: EdgeInsets.all(24), child: Text('No commission records for this month.', textAlign: TextAlign.center));
        }
        return Column(children: items.map((c) => Card(
          child: ListTile(
            leading: CircleAvatar(child: Icon(_icon(c.status))),
            title: Text(c.employeeName, maxLines: 1, overflow: TextOverflow.ellipsis),
            subtitle: Text('${c.employeeCode} · ${c.monthLabel} · ${c.status.label}'),
            trailing: Text(c.formattedAmount, style: const TextStyle(fontWeight: FontWeight.bold)),
            onTap: () => Navigator.push(context, MaterialPageRoute<void>(
              builder: (_) => CommissionDetailsScreen(profile: profile, commission: c),
            )),
          ),
        )).toList());
      },
      loading: () => const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator())),
      error: (e, _) => _error(e),
    ),
 ])));
 }
 Widget _metric(String l,String v)=>Card(child:Padding(padding:const EdgeInsets.all(12),child:Column(crossAxisAlignment:CrossAxisAlignment.start,mainAxisAlignment:MainAxisAlignment.center,children:[Text(l,style:const TextStyle(color:Colors.black54)),const SizedBox(height:5),Text(v,style:const TextStyle(fontSize:17,fontWeight:FontWeight.bold),maxLines:1,overflow:TextOverflow.ellipsis)])));
 Widget _error(Object e)=>Padding(padding:const EdgeInsets.all(12),child:Text('Could not load commissions: $e',style:const TextStyle(color:Colors.red)));
 IconData _icon(CommissionStatus s)=>switch(s){CommissionStatus.confirmed=>Icons.check_circle,CommissionStatus.notReceived=>Icons.error_outline,CommissionStatus.wrongAmount=>Icons.warning_amber,CommissionStatus.pending=>Icons.hourglass_top};
 Future<void> _upload(BuildContext context,WidgetRef ref,DateTime month)async{final result=await FilePicker.platform.pickFiles(type:FileType.custom,allowedExtensions:['csv'],withData:true);if(result==null||result.files.single.bytes==null)return;await ref.read(commissionUploadControllerProvider.notifier).upload(bytes:result.files.single.bytes!,fileName:result.files.single.name,month:month);final state=ref.read(commissionUploadControllerProvider);if(!context.mounted)return;if(state.hasError){ScaffoldMessenger.of(context).showSnackBar(SnackBar(content:Text('Upload failed: ${state.error}')));}else{ref.invalidate(commissionRecordsProvider);ref.invalidate(commissionStatisticsProvider);ScaffoldMessenger.of(context).showSnackBar(SnackBar(content:Text('Imported ${state.value} commission records.')));}}
  Future<void> _showComplaints(BuildContext context, WidgetRef ref) async {
    ref.invalidate(commissionComplaintsProvider);
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Consumer(
            builder: (ctx, ref, _) => ref.watch(commissionComplaintsProvider).when(
              data: (items) => items.isEmpty
                  ? const Text('No complaints submitted.')
                  : ListView(
                      shrinkWrap: true,
                      children: items.map((c) => ListTile(
                        title: Text(c.type.replaceAll('_', ' ').toUpperCase()),
                        subtitle: Text('${c.status} · ${c.message}'),
                      )).toList(),
                    ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text('Failed to load complaints: $e'),
            ),
          ),
        ),
      ),
    );
  }
}
class CommissionDetailsScreen extends ConsumerStatefulWidget{const CommissionDetailsScreen({super.key,required this.profile,required this.commission});final EmployeeProfile profile;final CommissionRecord commission;@override ConsumerState<CommissionDetailsScreen> createState()=>_CommissionDetailsScreenState();}
class _CommissionDetailsScreenState extends ConsumerState<CommissionDetailsScreen>{
 final _note=TextEditingController(),_comment=TextEditingController();bool _busy=false;bool get _owner=>widget.profile.role==EmployeeRole.owner;bool get _leader=>widget.profile.role==EmployeeRole.teamLeader;
 @override void dispose(){_note.dispose();_comment.dispose();super.dispose();}
 Future<void> _confirm(CommissionStatus status)async{setState(()=>_busy=true);try{await CommissionRepository().confirm(widget.commission.id,status,note:_note.text);if(mounted){ref.invalidate(commissionRecordsProvider);ref.invalidate(commissionStatisticsProvider);ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('Commission response saved.')));Navigator.pop(context);}}catch(e){if(mounted)ScaffoldMessenger.of(context).showSnackBar(SnackBar(content:Text('Could not save response: $e')));}finally{if(mounted)setState(()=>_busy=false);}}
 Future<void> _addComment()async{if(_comment.text.trim().isEmpty)return;setState(()=>_busy=true);try{await CommissionRepository().addComment(widget.commission.id,_comment.text,shareWithTeam:_leader);_comment.clear();ref.invalidate(commissionCommentsProvider(widget.commission.id));}catch(e){if(mounted)ScaffoldMessenger.of(context).showSnackBar(SnackBar(content:Text('Comment failed: $e')));}finally{if(mounted)setState(()=>_busy=false);}}
 Future<void> _editAmount()async{final amount=TextEditingController(text:widget.commission.amount.toStringAsFixed(2)),note=TextEditingController();final ok=await showDialog<bool>(context:context,builder:(ctx)=>AlertDialog(title:const Text('Edit commission amount'),content:Column(mainAxisSize:MainAxisSize.min,children:[TextField(controller:amount,keyboardType:const TextInputType.numberWithOptions(decimal:true),decoration:const InputDecoration(labelText:'Correct amount')),TextField(controller:note,decoration:const InputDecoration(labelText:'Reason for change'))]),actions:[TextButton(onPressed:()=>Navigator.pop(ctx,false),child:const Text('Cancel')),FilledButton(onPressed:()=>Navigator.pop(ctx,true),child:const Text('Save'))]));if(ok!=true)return;final value=double.tryParse(amount.text);if(value==null||value<0){if(mounted)ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('Enter a valid non-negative amount.')));return;}setState(()=>_busy=true);try{await CommissionRepository().updateAmount(widget.commission.id,value,note:note.text);ref.invalidate(commissionRecordsProvider);ref.invalidate(commissionStatisticsProvider);if(mounted){ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('Commission updated.')));Navigator.pop(context);}}catch(e){if(mounted)ScaffoldMessenger.of(context).showSnackBar(SnackBar(content:Text('Update failed: $e')));}finally{if(mounted)setState(()=>_busy=false);}}
 Future<void> _complaint()async{final message=TextEditingController(),amount=TextEditingController();String type='not_received';Uint8List? bytes;String? name;final ok=await showDialog<bool>(context:context,builder:(ctx)=>StatefulBuilder(builder:(ctx,setD)=>AlertDialog(title:const Text('Commission complaint'),content:SingleChildScrollView(child:Column(mainAxisSize:MainAxisSize.min,children:[DropdownButtonFormField<String>(value:type,items:const [DropdownMenuItem(value:'not_received',child:Text('Not received')),DropdownMenuItem(value:'wrong_amount',child:Text('Wrong amount')),DropdownMenuItem(value:'other',child:Text('Other'))],onChanged:(v)=>setD(()=>type=v??type)),TextField(controller:message,decoration:const InputDecoration(labelText:'Explain the issue'),maxLines:4),TextField(controller:amount,keyboardType:TextInputType.number,decoration:const InputDecoration(labelText:'Expected amount (optional)')),OutlinedButton.icon(onPressed:()async{final file=await ImagePicker().pickImage(source:ImageSource.gallery,imageQuality:80);if(file!=null){bytes=await file.readAsBytes();name=file.name;setD((){});}},icon:const Icon(Icons.attach_file),label:Text(name??'Attach screenshot'))])),actions:[TextButton(onPressed:()=>Navigator.pop(ctx,false),child:const Text('Cancel')),FilledButton(onPressed:()=>Navigator.pop(ctx,true),child:const Text('Submit'))])));if(ok!=true||message.text.trim().length<3)return;setState(()=>_busy=true);try{await CommissionRepository().submitComplaint(commission:widget.commission,type:type,message:message.text,expectedAmount:double.tryParse(amount.text),evidence:bytes,fileName:name);if(mounted){ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('Complaint submitted.')));Navigator.pop(context);}}catch(e){if(mounted)ScaffoldMessenger.of(context).showSnackBar(SnackBar(content:Text('Complaint failed: $e')));}finally{if(mounted)setState(()=>_busy=false);}}
 @override Widget build(BuildContext context){final c=widget.commission;return Scaffold(appBar:AppBar(title:const Text('Commission Details')),body:ListView(padding:const EdgeInsets.all(16),children:[
 Card(child:Padding(padding:const EdgeInsets.all(18),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(c.formattedAmount,style:const TextStyle(fontSize:28,fontWeight:FontWeight.bold)),Text(c.employeeName),Text('Employee code: ${c.employeeCode}'),Text('Team: ${c.teamName??'Direct Agent'}'),Text('Period: ${c.monthLabel}'),Text('Status: ${c.status.label}'),if(c.confirmationNote!=null)Text('Response: ${c.confirmationNote}')] ))),
 if(_owner)FilledButton(onPressed:_busy?null:_editAmount,child:const Text('Edit commission amount')),
 if(!_owner&&!_leader&&c.status!=CommissionStatus.confirmed)...[TextField(controller:_note,decoration:const InputDecoration(labelText:'Optional note'),maxLines:2),const SizedBox(height:8),FilledButton(onPressed:_busy?null:()=>_confirm(CommissionStatus.confirmed),child:const Text('Confirm received')),OutlinedButton(onPressed:_busy?null:()=>_confirm(CommissionStatus.notReceived),child:const Text('Not received')),OutlinedButton(onPressed:_busy?null:()=>_confirm(CommissionStatus.wrongAmount),child:const Text('Wrong amount')),TextButton(onPressed:_busy?null:_complaint,child:const Text('Submit complaint'))],
 if(_owner||_leader)...[const SizedBox(height:12),TextField(controller:_comment,decoration:const InputDecoration(labelText:'Add commission comment'),maxLines:2),FilledButton(onPressed:_busy?null:_addComment,child:Text(_leader?'Share comment with team':'Add owner comment'))],
 const SizedBox(height:18),const Text('Comments',style:TextStyle(fontWeight:FontWeight.bold)),ref.watch(commissionCommentsProvider(c.id)).when(data:(items)=>Column(children:items.map((x)=>ListTile(title:Text(x['author']?['name']?.toString()??'Staff'),subtitle:Text(x['comment'].toString()),trailing:(x['shared_with_team']==true)?const Icon(Icons.groups):null)).toList()),loading:()=>const LinearProgressIndicator(),error:(e,_)=>Text('Comments unavailable: $e')),
 const SizedBox(height:18),const Text('Commission history',style:TextStyle(fontWeight:FontWeight.bold)),ref.watch(commissionHistoryProvider(c.id)).when(data:(items)=>Column(children:items.map((x)=>ListTile(title:Text(x['event_type'].toString()),subtitle:Text(DateTime.parse(x['created_at'].toString()).toLocal().toString())).toList()),loading:()=>const LinearProgressIndicator(),error:(e,_)=>Text('History unavailable: $e')),
    const SizedBox(height: 18),
    const Text('Commission history', style: TextStyle(fontWeight: FontWeight.bold)),
    ref.watch(commissionHistoryProvider(c.id)).when(
      data: (items) => Column(
        children: items.map((x) => ListTile(
          title: Text(x['event_type'].toString()),
          subtitle: Text(DateTime.parse(x['created_at'].toString()).toLocal().toString()),
        )).toList(),
      ),
      loading: () => const LinearProgressIndicator(),
      error: (e, _) => Text('History unavailable: $e'),
    ),
}
class CommissionHistoryScreen extends ConsumerWidget{const CommissionHistoryScreen({super.key,required this.profile});final EmployeeProfile profile;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Commission History')),
      body: FutureBuilder<List<CommissionRecord>>(
        future: ref.watch(commissionRepositoryProvider).list(),
        builder: (context, s) {
          if (s.connectionState != ConnectionState.done) return const Center(child: CircularProgressIndicator());
          if (s.hasError) return Center(child: Text('History unavailable: ${s.error}'));
          final items = s.data ?? const <CommissionRecord>[];
          return ListView(
            children: items.map((c) => ListTile(
              title: Text(c.employeeName),
              subtitle: Text('${c.monthLabel} · ${c.status.label}'),
              trailing: Text(c.formattedAmount),
              onTap: () => Navigator.push(context, MaterialPageRoute<void>(
                builder: (_) => CommissionDetailsScreen(profile: profile, commission: c),
              )),
            )).toList(),
          );
        },
      ),
    );
  }
}
