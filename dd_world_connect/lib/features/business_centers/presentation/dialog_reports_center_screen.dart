import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../authentication/domain/employee_profile.dart';
import '../application/business_center_providers.dart';
import '../domain/business_records.dart';

class DialogReportsCenterScreen extends ConsumerWidget {
 const DialogReportsCenterScreen({super.key,required this.profile});
 final EmployeeProfile profile;
 bool get _owner=>profile.role==EmployeeRole.owner;
 @override Widget build(BuildContext context,WidgetRef ref)=>DefaultTabController(length:3,child:Scaffold(
 appBar:AppBar(title:const Text('Dialog Reports Center'),bottom:const TabBar(isScrollable:true,tabs:[Tab(text:'Weekly'),Tab(text:'Monthly'),Tab(text:'Archive')])),
 floatingActionButton:_owner?FloatingActionButton.extended(onPressed:()=>_upload(context,ref),icon:const Icon(Icons.upload_file),label:const Text('Upload report')):null,
 body:TabBarView(children:[
 _ReportList(type:'weekly',profile:profile),
 _ReportList(type:'monthly',profile:profile),
 _ArchiveList(profile:profile),
 ])));
 Future<void> _upload(BuildContext context,WidgetRef ref)async{
 final title=TextEditingController();DateTime start=DateTime.now().subtract(const Duration(days:7)),end=DateTime.now();String type='weekly';
 final form=await showDialog<Map<String,dynamic>>(context:context,builder:(ctx)=>StatefulBuilder(builder:(ctx,setDialog)=>AlertDialog(title:const Text('Upload Dialog report'),content:SingleChildScrollView(child:Column(mainAxisSize:MainAxisSize.min,children:[
 TextField(controller:title,decoration:const InputDecoration(labelText:'Report title'),textCapitalization:TextCapitalization.sentences),
 DropdownButtonFormField<String>(value:type,items:const[DropdownMenuItem(value:'weekly',child:Text('Weekly report')),DropdownMenuItem(value:'monthly',child:Text('Monthly report'))],onChanged:(v)=>setDialog(()=>type=v??type)),
 ListTile(title:const Text('Period start'),subtitle:Text(start.toLocal().toString().split(' ').first),onTap:()async{final d=await showDatePicker(context:ctx,initialDate:start,firstDate:DateTime(2020),lastDate:DateTime(2100));if(d!=null)setDialog(()=>start=d);}),
 ListTile(title:const Text('Period end'),subtitle:Text(end.toLocal().toString().split(' ').first),onTap:()async{final d=await showDatePicker(context:ctx,initialDate:end,firstDate:DateTime(2020),lastDate:DateTime(2100));if(d!=null)setDialog(()=>end=d);}),
 ])),actions:[TextButton(onPressed:()=>Navigator.pop(ctx),child:const Text('Cancel')),FilledButton(onPressed:()=>Navigator.pop(ctx,{'title':title.text,'type':type,'start':start,'end':end}),child:const Text('Choose file'))]));
 if(form==null)return;
 final file=await FilePicker.platform.pickFiles(type:FileType.custom,allowedExtensions:const['pdf','xlsx','xls','csv'],withData:true);
 if(file==null||file.files.single.bytes==null)return;
 try{await ref.read(businessCenterRepositoryProvider).uploadDialogReport(title:(form['title'] as String),type:form['type'] as String,start:form['start'] as DateTime,end:form['end'] as DateTime,fileName:file.files.single.name,bytes:file.files.single.bytes!);ref.invalidate(dialogReportsProvider('weekly'));ref.invalidate(dialogReportsProvider('monthly'));if(context.mounted)ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('Report uploaded successfully.')));}catch(e){if(context.mounted)ScaffoldMessenger.of(context).showSnackBar(SnackBar(content:Text('Upload failed: $e')));}
 }
}
class _ReportList extends ConsumerWidget{
 const _ReportList({required this.type,required this.profile});final String type;final EmployeeProfile profile;
 @override Widget build(BuildContext context,WidgetRef ref)=>RefreshIndicator(onRefresh:()async=>ref.invalidate(dialogReportsProvider(type)),child:ref.watch(dialogReportsProvider(type)).when(data:(items)=>items.isEmpty?ListView(children:[const SizedBox(height:100),Center(child:Text('No $type reports available.'))]):ListView(padding:const EdgeInsets.all(12),children:items.map((r)=>_ReportCard(report:r,profile:profile,archive:false)).toList()),loading:()=>const Center(child:CircularProgressIndicator()),error:(e,_)=>Center(child:Text('Unable to load reports: $e'))));
}
class _ArchiveList extends ConsumerWidget{
 const _ArchiveList({required this.profile});final EmployeeProfile profile;
 @override Widget build(BuildContext context,WidgetRef ref)=>ref.watch(dialogArchiveProvider).when(data:(items)=>items.isEmpty?const Center(child:Text('Archive is empty.')):ListView(padding:const EdgeInsets.all(12),children:items.map((r)=>_ReportCard(report:r,profile:profile,archive:true)).toList()),loading:()=>const Center(child:CircularProgressIndicator()),error:(e,_)=>Center(child:Text('Archive unavailable: $e')));
}
class _ReportCard extends ConsumerWidget{
 const _ReportCard({required this.report,required this.profile,required this.archive});final DialogReport report;final EmployeeProfile profile;final bool archive;
 @override Widget build(BuildContext context,WidgetRef ref){final owner=profile.role==EmployeeRole.owner;return Card(child:ListTile(leading:Icon(report.mimeType=='application/pdf'?Icons.picture_as_pdf:Icons.table_chart),title:Text(report.title),subtitle:Text('${report.type.toUpperCase()} · ${report.periodLabel}\n${report.fileName} · ${(report.fileSize/1024).toStringAsFixed(0)} KB'),isThreeLine:true,trailing:PopupMenuButton<String>(onSelected:(v)=>_action(context,ref,v),itemBuilder:(_)=>[const PopupMenuItem(value:'download',child:Text('Download / Open')),if(owner&&!archive)const PopupMenuItem(value:'archive',child:Text('Archive')),if(owner)const PopupMenuItem(value:'delete',child:Text('Delete'))]),onTap:()=>_action(context,ref,'download')));}
 Future<void> _action(BuildContext context,WidgetRef ref,String action)async{final repo=ref.read(businessCenterRepositoryProvider);try{if(action=='download'){final url=await repo.downloadDialogReport(report);if(!await launchUrl(Uri.parse(url),mode:LaunchMode.externalApplication))throw StateError('Could not open the report URL.');}else if(action=='archive'){await repo.archiveDialogReport(report);ref.invalidate(dialogReportsProvider('weekly'));ref.invalidate(dialogReportsProvider('monthly'));ref.invalidate(dialogArchiveProvider);}else if(action=='delete'){final yes=await showDialog<bool>(context:context,builder:(ctx)=>AlertDialog(title:const Text('Delete report?'),content:const Text('The report will be removed from the active report list and its file deleted.'),actions:[TextButton(onPressed:()=>Navigator.pop(ctx,false),child:const Text('Cancel')),FilledButton(onPressed:()=>Navigator.pop(ctx,true),child:const Text('Delete'))]));if(yes!=true)return;await repo.deleteDialogReport(report);ref.invalidate(dialogReportsProvider('weekly'));ref.invalidate(dialogReportsProvider('monthly'));ref.invalidate(dialogArchiveProvider);}if(context.mounted&&action!='download')ScaffoldMessenger.of(context).showSnackBar(SnackBar(content:Text(action=='archive'?'Report archived.':'Report deleted.')));}catch(e){if(context.mounted)ScaffoldMessenger.of(context).showSnackBar(SnackBar(content:Text('Action failed: $e')));}}
}
