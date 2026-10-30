import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:pdf/pdf.dart';
import 'package:share_plus/share_plus.dart';
import 'package:cross_file/cross_file.dart';
import '../../authentication/domain/employee_profile.dart';
import '../application/employee_center_providers.dart';
import '../data/employee_center_repository.dart';
import '../domain/employee_center_models.dart';

class EmployeeCenterScreen extends ConsumerStatefulWidget {
 const EmployeeCenterScreen({super.key,required this.profile});
 final EmployeeProfile profile;
 @override ConsumerState<EmployeeCenterScreen> createState()=>_EmployeeCenterScreenState();
}
class _EmployeeCenterScreenState extends ConsumerState<EmployeeCenterScreen> with SingleTickerProviderStateMixin {
 late final TabController tabs;
 bool get owner=>widget.profile.role==EmployeeRole.owner;
 bool get teamLeader=>widget.profile.role==EmployeeRole.teamLeader;
 EmployeeCenterRepository get repo=>ref.read(employeeCenterRepositoryProvider);
 @override void initState(){super.initState();tabs=TabController(length:6,vsync:this);}
 @override void dispose(){tabs.dispose();super.dispose();}
 void msg(String s){if(mounted)ScaffoldMessenger.of(context).showSnackBar(SnackBar(content:Text(s)));}
 Future<void> run(Future<void> Function() f) async {try{await f();msg('Saved successfully');}catch(e){msg(e.toString());}}
 @override Widget build(BuildContext context)=>Scaffold(appBar:AppBar(title:const Text('Employee Center'),bottom:TabBar(controller:tabs,isScrollable:true,tabs:const[Tab(icon:Icon(Icons.badge),text:'ID Card'),Tab(icon:Icon(Icons.qr_code_scanner),text:'QR Verify'),Tab(icon:Icon(Icons.folder),text:'Documents'),Tab(icon:Icon(Icons.event_available),text:'Leave'),Tab(icon:Icon(Icons.download),text:'Downloads'),Tab(icon:Icon(Icons.school),text:'Training')])),body:TabBarView(controller:tabs,children:[idCard(),qrPane(),documents(),leave(),downloads(),training()]));

 Widget idCard()=>ListView(padding:const EdgeInsets.all(16),children:[
  Row(children:[const Expanded(child:Text('Company ID Card',style:TextStyle(fontSize:20,fontWeight:FontWeight.bold))),if(owner)FilledButton.icon(onPressed:issueCard,icon:const Icon(Icons.add_card),label:const Text('Issue ID'))]),
  ref.watch(employeeIdCardProvider(widget.profile.id)).when(loading:()=>const LinearProgressIndicator(),error:(e,_)=>Text(e.toString()),data:(card)=>card==null?const Card(child:Padding(padding:EdgeInsets.all(20),child:Text('Your digital employee ID has not been issued. Contact the Owner.'))):idCardWidget(card))
 ]);
 Widget idCardWidget(EmployeeIdCardRecord c)=>Card(color:const Color(0xFF102F56),child:Padding(padding:const EdgeInsets.all(18),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
  Row(children:[const CircleAvatar(backgroundColor:Colors.white,child:Icon(Icons.business,color:Color(0xFF1F5AA6))),const SizedBox(width:10),const Expanded(child:Text('DD WORLD MARKETING',style:TextStyle(color:Colors.white,fontWeight:FontWeight.bold))),Text(c.status.toUpperCase(),style:const TextStyle(color:Colors.lightGreenAccent))]),
  const Divider(color:Colors.white30,height:28),
  Row(children:[employeePhoto(c),const SizedBox(width:14),Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(c.employeeName,style:const TextStyle(color:Colors.white,fontWeight:FontWeight.bold,fontSize:18)),idLine('Staff Code',c.staffCode),idLine('Position',c.position),idLine('Team',c.teamName),idLine('Card',c.cardNumber)]))]),
  if(c.qrToken.isNotEmpty) ...[const SizedBox(height:16),Center(child:Container(color:Colors.white,padding:const EdgeInsets.all(8),child:QrImageView(data:c.qrToken,size:140))),const Center(child:Text('Scan to verify employee identity',style:TextStyle(color:Colors.white70,fontSize:11)))],
  const SizedBox(height:8),const Text('Verification is available to authenticated DD WORLD CONNECT employees.',style:TextStyle(color:Colors.white60,fontSize:10)),
  Align(alignment:Alignment.centerRight,child:TextButton.icon(onPressed:()=>sharePhysicalCard(c),icon:const Icon(Icons.print,color:Colors.white),label:const Text('Physical ID / Print PDF',style:TextStyle(color:Colors.white))))
 ])));
 Widget employeePhoto(EmployeeIdCardRecord card){final path=card.employeePhotoPath;if(path==null||path.isEmpty)return const CircleAvatar(radius:38,backgroundColor:Colors.white24,child:Icon(Icons.person,color:Colors.white,size:38));if(path.startsWith('http'))return CircleAvatar(radius:38,backgroundImage:NetworkImage(path));return FutureBuilder<String>(future:repo.employeePhotoUrl(path),builder:(ctx,s)=>CircleAvatar(radius:38,backgroundColor:Colors.white24,backgroundImage:s.hasData?NetworkImage(s.data!):null,child:s.hasData?null:const Icon(Icons.person,color:Colors.white,size:38)));}\n Widget idLine(String a,String b)=>Padding(padding:const EdgeInsets.only(top:3),child:Text(a+': '+b,style:const TextStyle(color:Colors.white,fontSize:12)));
 Future<void> sharePhysicalCard(EmployeeIdCardRecord card) async {
  final doc=pw.Document();
  doc.addPage(pw.Page(pageFormat:PdfPageFormat(85.6*PdfPageFormat.mm,54*PdfPageFormat.mm,marginAll:3*PdfPageFormat.mm),build:(ctx)=>pw.Row(crossAxisAlignment:pw.CrossAxisAlignment.start,children:[
   pw.Expanded(child:pw.Column(crossAxisAlignment:pw.CrossAxisAlignment.start,children:[
    pw.Text('DD WORLD MARKETING',style:pw.TextStyle(fontSize:8,fontWeight:pw.FontWeight.bold)),
    pw.SizedBox(height:3),pw.Text(card.employeeName,style:pw.TextStyle(fontSize:9,fontWeight:pw.FontWeight.bold)),
    pw.SizedBox(height:3),pw.Text('Staff Code: '+card.staffCode,style:const pw.TextStyle(fontSize:6.5)),
    pw.Text('Position: '+card.position,style:const pw.TextStyle(fontSize:6.5)),
    pw.Text('Team: '+card.teamName,style:const pw.TextStyle(fontSize:6.5)),
    pw.Text('Card: '+card.cardNumber,style:const pw.TextStyle(fontSize:6.5)),
    pw.Text('Status: '+card.status.toUpperCase(),style:const pw.TextStyle(fontSize:6.5)),
    pw.Spacer(),pw.Text('Employee identification card',style:const pw.TextStyle(fontSize:5))
   ])),
   pw.SizedBox(width:3*PdfPageFormat.mm),
   pw.BarcodeWidget(barcode:pw.Barcode.qrCode(),data:card.qrToken,width:25*PdfPageFormat.mm,height:25*PdfPageFormat.mm)
  ])));
  final bytes=await doc.save();
  await Share.shareXFiles([XFile.fromData(bytes,name:'DD-WORLD-'+card.staffCode+'-ID.pdf',mimeType:'application/pdf')],text:'DD WORLD employee ID card');
 }
 Future<void> issueCard() async {
  if(!owner)return;
  final staff=await repo.employees();if(!mounted||staff.isEmpty)return;
  final id=await showDialog<String>(context:context,builder:(ctx)=>AlertDialog(title:const Text('Issue Employee ID'),content:SizedBox(width:320,child:ListView(shrinkWrap:true,children:staff.map((e)=>ListTile(title:Text(e['name'] as String),subtitle:Text(e['agent_code'] as String? ?? ''),onTap:()=>Navigator.pop(ctx,e['id'] as String))).toList())),actions:[TextButton(onPressed:()=>Navigator.pop(ctx),child:const Text('Cancel'))]));
  if(id==null)return;
  await run(()async{final card=await repo.issueIdCard(employeeId:id,issuerId:widget.profile.id);if(!mounted)return;await showDialog<void>(context:context,builder:(ctx)=>AlertDialog(title:const Text('ID issued'),content:Column(mainAxisSize:MainAxisSize.min,children:[Text(card.employeeName),QrImageView(data:card.qrToken,size:180)]),actions:[TextButton(onPressed:()=>Navigator.pop(ctx),child:const Text('Close'))]));ref.invalidate(employeeIdCardProvider(widget.profile.id));});
 }

 Widget qrPane()=>_QrPane(verify:repo.verifyQr);

 Widget documents()=>ListView(padding:const EdgeInsets.all(16),children:[
  Row(children:[const Expanded(child:Text('Document Vault',style:TextStyle(fontSize:20,fontWeight:FontWeight.bold))),if(!owner)FilledButton.icon(onPressed:uploadDocument,icon:const Icon(Icons.upload_file),label:const Text('Upload'))]),
  const Text('Private employee documents: NIC, police report, Grama Sevaka report, education certificates, CV and employment records.'),
  ref.watch(employeeDocumentsProvider((employeeId:widget.profile.id,owner:owner))).when(loading:()=>const LinearProgressIndicator(),error:(e,_)=>Text(e.toString()),data:(items)=>Column(children:items.map((d)=>Card(child:ListTile(leading:Icon(Icons.description,color:documentStatusColor(d.status)),title:Text(employeeDocumentTypes[d.documentType]??d.documentType),subtitle:Text(d.fileName+' • '+d.status.toUpperCase()),trailing:PopupMenuButton<String>(onSelected:(v){if(v=='open')openDoc(d);if(v=='yes')reviewDoc(d,true);if(v=='no')reviewDoc(d,false);},itemBuilder:(_)=>[const PopupMenuItem(value:'open',child:Text('View / Download')),if(owner&&d.status=='pending')const PopupMenuItem(value:'yes',child:Text('Approve')),if(owner&&d.status=='pending')const PopupMenuItem(value:'no',child:Text('Reject'))]))).toList()))
 ]);
 Future<void> uploadDocument() async {
  final pick=await FilePicker.platform.pickFiles(withData:true,type:FileType.custom,allowedExtensions:['pdf','jpg','jpeg','png','webp']);if(pick==null||pick.files.isEmpty)return;
  String type='nic_front';if(!mounted)return;
  final selected=await showDialog<String>(context:context,builder:(ctx)=>StatefulBuilder(builder:(ctx,set)=>AlertDialog(title:const Text('Select document type'),content:DropdownButtonFormField<String>(value:type,items:employeeDocumentTypes.entries.map((e)=>DropdownMenuItem(value:e.key,child:Text(e.value))).toList(),onChanged:(v)=>set(()=>type=v??type)),actions:[TextButton(onPressed:()=>Navigator.pop(ctx),child:const Text('Cancel')),FilledButton(onPressed:()=>Navigator.pop(ctx,type),child:const Text('Upload'))])));
  if(selected==null)return;
  await run(()async{await repo.uploadDocument(employeeId:widget.profile.id,file:pick.files.single,type:selected);ref.invalidate(employeeDocumentsProvider((employeeId:widget.profile.id,owner:owner)));});
 }
 Future<void> openDoc(EmployeeDocumentRecord d) async {final url=await repo.documentUrl(d.filePath);await launchUrl(Uri.parse(url),mode:LaunchMode.externalApplication);}
 Future<void> reviewDoc(EmployeeDocumentRecord d,bool approve) async {
  final note=TextEditingController();final ok=await showDialog<bool>(context:context,builder:(ctx)=>AlertDialog(title:Text(approve?'Approve document':'Reject document'),content:TextField(controller:note,decoration:const InputDecoration(labelText:'Review note'),maxLines:3),actions:[TextButton(onPressed:()=>Navigator.pop(ctx,false),child:const Text('Cancel')),FilledButton(onPressed:()=>Navigator.pop(ctx,true),child:const Text('Confirm'))]));
  if(ok!=true)return;await run(()async{await repo.reviewDocument(documentId:d.id,approve:approve,note:note.text);ref.invalidate(employeeDocumentsProvider((employeeId:widget.profile.id,owner:owner)));});
 }

 Widget leave()=>ListView(padding:const EdgeInsets.all(16),children:[
  Row(children:[const Expanded(child:Text('Leave Management',style:TextStyle(fontSize:20,fontWeight:FontWeight.bold))),if(!owner&&!teamLeader)FilledButton.icon(onPressed:applyLeave,icon:const Icon(Icons.add),label:const Text('Apply'))]),
  const Text('Workflow: Team Leader review, then final Owner approval. Direct Agents without a team are routed to Owner.'),
  ref.watch(leaveRequestsProvider((employeeId:widget.profile.id,owner:owner,teamLeader:teamLeader))).when(loading:()=>const LinearProgressIndicator(),error:(e,_)=>Text(e.toString()),data:(items)=>Column(children:items.map((l)=>Card(child:ListTile(title:Text((l.employeeName==null?'':l.employeeName!+' • ')+l.leaveType.replaceAll('_',' ').toUpperCase()),subtitle:Text(l.startDate.toString().substring(0,10)+' to '+l.endDate.toString().substring(0,10)+'\n'+l.reason+'\n'+l.reviewStage.replaceAll('_',' ')),isThreeLine:true,trailing:(owner||teamLeader)&&['PENDING_TEAM_LEADER','PENDING_OWNER'].contains(l.reviewStage)?PopupMenuButton<String>(onSelected:(v)=>reviewLeave(l,v=='approve'),itemBuilder:(_)=>[const PopupMenuItem(value:'approve',child:Text('Approve')),const PopupMenuItem(value:'reject',child:Text('Reject'))]):Text(l.status))).toList()))
 ]);
 Future<void> applyLeave() async {
  final reason=TextEditingController();String type='annual';bool morning=true;DateTime start=DateTime.now().add(const Duration(days:1)),end=start;
  final ok=await showDialog<bool>(context:context,builder:(ctx)=>StatefulBuilder(builder:(ctx,set)=>AlertDialog(title:const Text('Apply for Leave'),content:SingleChildScrollView(child:Column(mainAxisSize:MainAxisSize.min,children:[
   DropdownButtonFormField<String>(value:type,decoration:const InputDecoration(labelText:'Leave type'),items:const[DropdownMenuItem(value:'annual',child:Text('Annual Leave')),DropdownMenuItem(value:'casual',child:Text('Casual Leave')),DropdownMenuItem(value:'sick',child:Text('Sick Leave')),DropdownMenuItem(value:'half_day',child:Text('Half Day Leave'))],onChanged:(v)=>set(()=>type=v??type)),
   ListTile(title:const Text('Start date'),subtitle:Text(start.toString().substring(0,10)),onTap:()async{final d=await showDatePicker(context:ctx,initialDate:start,firstDate:DateTime.now().subtract(const Duration(days:365)),lastDate:DateTime.now().add(const Duration(days:730)));if(d!=null)set((){start=d;if(end.isBefore(start))end=start;});}),
   if(type!='half_day')ListTile(title:const Text('End date'),subtitle:Text(end.toString().substring(0,10)),onTap:()async{final d=await showDatePicker(context:ctx,initialDate:end.isBefore(start)?start:end,firstDate:start,lastDate:DateTime.now().add(const Duration(days:730)));if(d!=null)set(()=>end=d);}),
   if(type=='half_day')SwitchListTile(value:morning,title:const Text('Morning half day'),onChanged:(v)=>set(()=>morning=v)),
   TextField(controller:reason,maxLines:3,decoration:const InputDecoration(labelText:'Reason'))
  ])),actions:[TextButton(onPressed:()=>Navigator.pop(ctx,false),child:const Text('Cancel')),FilledButton(onPressed:()=>Navigator.pop(ctx,true),child:const Text('Submit'))])));
  if(ok!=true)return;
  await run(()async{await repo.applyLeave(employeeId:widget.profile.id,leaveType:type,start:start,end:type=='half_day'?start:end,reason:reason.text,halfDayMorning:morning);ref.invalidate(leaveRequestsProvider((employeeId:widget.profile.id,owner:owner,teamLeader:teamLeader)));});
 }
 Future<void> reviewLeave(LeaveRequestRecord l,bool approve) async {
  final note=TextEditingController();final ok=await showDialog<bool>(context:context,builder:(ctx)=>AlertDialog(title:Text(approve?'Approve leave':'Reject leave'),content:TextField(controller:note,decoration:const InputDecoration(labelText:'Review note')),actions:[TextButton(onPressed:()=>Navigator.pop(ctx,false),child:const Text('Cancel')),FilledButton(onPressed:()=>Navigator.pop(ctx,true),child:const Text('Confirm'))]));
  if(ok!=true)return;await run(()async{await repo.reviewLeave(leaveId:l.id,approve:approve,note:note.text);ref.invalidate(leaveRequestsProvider((employeeId:widget.profile.id,owner:owner,teamLeader:teamLeader)));});
 }

 Widget downloads()=>ListView(padding:const EdgeInsets.all(16),children:[
  Row(children:[const Expanded(child:Text('Download Center',style:TextStyle(fontSize:20,fontWeight:FontWeight.bold))),if(owner)IconButton(onPressed:uploadDownload,icon:const Icon(Icons.upload_file))]),
  ref.watch(downloadsProvider).when(loading:()=>const LinearProgressIndicator(),error:(e,_)=>Text(e.toString()),data:(items)=>Column(children:items.map((m)=>Card(child:ListTile(leading:const Icon(Icons.insert_drive_file),title:Text(m.title),subtitle:Text(m.category+' • '+m.fileName),trailing:IconButton(icon:const Icon(Icons.download),onPressed:()=>openMaterial(m,'dd-downloads',false)))).toList()))
 ]);
 Future<void> uploadDownload() async {
  final pick=await FilePicker.platform.pickFiles(withData:true);if(pick==null||pick.files.isEmpty)return;
  final title=TextEditingController(),desc=TextEditingController();String category='pdf_report';if(!mounted)return;
  final ok=await showDialog<bool>(context:context,builder:(ctx)=>StatefulBuilder(builder:(ctx,set)=>AlertDialog(title:const Text('Publish company file'),content:Column(mainAxisSize:MainAxisSize.min,children:[TextField(controller:title,decoration:const InputDecoration(labelText:'Title')),TextField(controller:desc,decoration:const InputDecoration(labelText:'Description')),DropdownButtonFormField<String>(value:category,items:const[DropdownMenuItem(value:'pdf_report',child:Text('PDF Report')),DropdownMenuItem(value:'excel_report',child:Text('Excel Report')),DropdownMenuItem(value:'training_file',child:Text('Training File')),DropdownMenuItem(value:'company_file',child:Text('Company File'))],onChanged:(v)=>set(()=>category=v??category))]),actions:[TextButton(onPressed:()=>Navigator.pop(ctx,false),child:const Text('Cancel')),FilledButton(onPressed:()=>Navigator.pop(ctx,true),child:const Text('Publish'))])));
  if(ok!=true)return;await run(()async{await repo.uploadSharedFile(title:title.text,description:desc.text,category:category,file:pick.files.single,uploaderId:widget.profile.id);ref.invalidate(downloadsProvider);});
 }
 Future<void> openMaterial(SharedMaterialRecord m,String bucket,bool trainingItem) async {
  await run(()async{if(trainingItem){await repo.logTrainingView(m.id,widget.profile.id);}else{await repo.logDownload(m.id,widget.profile.id);}final url=await repo.materialUrl(bucket,m.filePath);await launchUrl(Uri.parse(url),mode:LaunchMode.externalApplication);});
 }

 Widget training()=>ListView(padding:const EdgeInsets.all(16),children:[
  Row(children:[const Expanded(child:Text('Training Center',style:TextStyle(fontSize:20,fontWeight:FontWeight.bold))),if(owner)IconButton(onPressed:uploadTraining,icon:const Icon(Icons.add_circle))]),
  const Text('Sayuru Training • Govi Mithuru Training'),
  ref.watch(trainingMaterialsProvider).when(loading:()=>const LinearProgressIndicator(),error:(e,_)=>Text(e.toString()),data:(items)=>Column(children:items.map((m)=>Card(child:ListTile(leading:Icon(m.category=='video'?Icons.play_circle:m.category=='pdf'?Icons.picture_as_pdf:Icons.slideshow),title:Text(m.title),subtitle:Text(m.description.isEmpty?m.fileName:m.description),trailing:IconButton(icon:const Icon(Icons.open_in_new),onPressed:()=>openMaterial(m,'dd-training-materials',true)))).toList()))
 ]);
 Future<void> uploadTraining() async {
  final pick=await FilePicker.platform.pickFiles(withData:true,type:FileType.custom,allowedExtensions:['mp4','mov','pdf','ppt','pptx']);if(pick==null||pick.files.isEmpty)return;
  final title=TextEditingController(),desc=TextEditingController();String product='sayuru',kind='video';if(!mounted)return;
  final ok=await showDialog<bool>(context:context,builder:(ctx)=>StatefulBuilder(builder:(ctx,set)=>AlertDialog(title:const Text('Add training material'),content:Column(mainAxisSize:MainAxisSize.min,children:[TextField(controller:title,decoration:const InputDecoration(labelText:'Title')),TextField(controller:desc,decoration:const InputDecoration(labelText:'Description')),DropdownButtonFormField<String>(value:product,items:const[DropdownMenuItem(value:'sayuru',child:Text('Sayuru')),DropdownMenuItem(value:'govimithuru',child:Text('Govimithuru'))],onChanged:(v)=>set(()=>product=v??product)),DropdownButtonFormField<String>(value:kind,items:const[DropdownMenuItem(value:'video',child:Text('Video')),DropdownMenuItem(value:'pdf',child:Text('PDF')),DropdownMenuItem(value:'presentation',child:Text('Presentation'))],onChanged:(v)=>set(()=>kind=v??kind))]),actions:[TextButton(onPressed:()=>Navigator.pop(ctx,false),child:const Text('Cancel')),FilledButton(onPressed:()=>Navigator.pop(ctx,true),child:const Text('Publish'))])));
  if(ok!=true)return;await run(()async{await repo.uploadTraining(title:title.text,description:desc.text,product:product,materialType:kind,file:pick.files.single,uploaderId:widget.profile.id);ref.invalidate(trainingMaterialsProvider);});
 }
}

class _QrPane extends StatefulWidget {
 const _QrPane({required this.verify});final Future<EmployeeQrResult> Function(String) verify;
 @override State<_QrPane> createState()=>_QrPaneState();
}
class _QrPaneState extends State<_QrPane> {
 bool busy=false,scanned=false;EmployeeQrResult? result;String? error;
 Future<void> scan(String token) async {if(busy||scanned)return;scanned=true;setState(()=>busy=true);try{final r=await widget.verify(token);if(mounted)setState(()=>result=r);}catch(e){if(mounted)setState(()=>error=e.toString());}finally{if(mounted)setState(()=>busy=false);}}
 @override Widget build(BuildContext context)=>ListView(padding:const EdgeInsets.all(16),children:[
  const Text('QR Verification',style:TextStyle(fontSize:20,fontWeight:FontWeight.bold)),
  const Text('Scan a company employee ID. Active DD WORLD CONNECT login is required.'),
  const SizedBox(height:12),
  SizedBox(height:300,child:ClipRRect(borderRadius:BorderRadius.circular(16),child:MobileScanner(onDetect:(capture){if(capture.barcodes.isNotEmpty){final v=capture.barcodes.first.rawValue;if(v!=null)scan(v);}}))),
  if(busy)const Center(child:CircularProgressIndicator()),
  if(error!=null)Text(error!,style:const TextStyle(color:Colors.red)),
  if(result!=null)Card(child:Padding(padding:const EdgeInsets.all(16),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(result!.verified?'VERIFIED EMPLOYEE':'NOT ACTIVE',style:TextStyle(fontWeight:FontWeight.bold,color:result!.verified?Colors.green:Colors.red)),Text('Name: '+result!.employeeName),Text('Staff Code: '+result!.staffCode),Text('Team: '+result!.teamName),Text('Position: '+result!.position),Text('Status: '+result!.status)]))),
  OutlinedButton.icon(onPressed:()=>setState((){result=null;error=null;scanned=false;}),icon:const Icon(Icons.refresh),label:const Text('Scan another ID'))
 ]);
}
