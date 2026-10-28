import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../authentication/domain/employee_profile.dart';
import '../application/activation_controller.dart';
import '../domain/activation.dart';

class ActivationCenterScreen extends ConsumerStatefulWidget {
  const ActivationCenterScreen({super.key,required this.profile});
  final EmployeeProfile profile;
  @override ConsumerState<ActivationCenterScreen> createState()=>_ActivationCenterScreenState();
}
class _ActivationCenterScreenState extends ConsumerState<ActivationCenterScreen>{
  bool _saving=false,_error=false; String? _message;
  Future<void> _activate(ActivationType type) async {
    setState(()=>{_saving=true,_message=null,_error=false});
    try{
      final record=await ActivationController(ref.read(activationRepositoryProvider)).recordAndLaunch(employee:widget.profile,type:type);
      ref.invalidate(activationHistoryProvider);ref.invalidate(activationStatisticsProvider);
      if(mounted)setState(()=>_message='${type.displayName} record saved at ${record.createdAt}. Complete the USSD flow in the Phone app.');
    }catch(e){if(mounted)setState(()=>{_error=true,_message=e.toString().replaceFirst('Exception: ','')});}
    finally{if(mounted)setState(()=>_saving=false);}
  }
  @override Widget build(BuildContext context)=>Scaffold(
    appBar:AppBar(title:const Text('Activation Center')),
    body:RefreshIndicator(onRefresh:()async{ref.invalidate(activationHistoryProvider);ref.invalidate(activationStatisticsProvider);await ref.read(activationStatisticsProvider.future);},
      child:ListView(padding:const EdgeInsets.all(16),children:[
        Container(padding:const EdgeInsets.all(20),decoration:BoxDecoration(color:const Color(0xFF1F5AA6),borderRadius:BorderRadius.circular(20)),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
          const Text('DIALOG SALES ACTIVATION',style:TextStyle(color:Colors.white70,letterSpacing:1)),const SizedBox(height:8),
          Text(widget.profile.fullName,style:const TextStyle(color:Colors.white,fontSize:21,fontWeight:FontWeight.bold)),
          Text('${widget.profile.role.displayName} • ${widget.profile.employeeCode}',style:const TextStyle(color:Colors.white))])),
        const SizedBox(height:18),const Text('Start an activation',style:TextStyle(fontSize:20,fontWeight:FontWeight.bold)),const SizedBox(height:10),
        _ActivationButton(title:'SAYURU',code:'*828#',color:const Color(0xFF1F5AA6),icon:Icons.phone_in_talk,busy:_saving,onTap:()=>_activate(ActivationType.sayuru)),
        const SizedBox(height:12),_ActivationButton(title:'GOVIMITHURU',code:'*616#',color:const Color(0xFF367C2B),icon:Icons.eco_outlined,busy:_saving,onTap:()=>_activate(ActivationType.govimithuru)),
        if(_message!=null)...[const SizedBox(height:12),Card(color:_error?const Color(0xFFFFF0F0):const Color(0xFFEAF7EA),child:Padding(padding:const EdgeInsets.all(14),child:Text(_message!,style:TextStyle(color:_error?Colors.red.shade800:Colors.green.shade900))))],
        const SizedBox(height:20),const Text('Activation statistics',style:TextStyle(fontSize:20,fontWeight:FontWeight.bold)),const SizedBox(height:10),
        ref.watch(activationStatisticsProvider).when(loading:()=>const Center(child:CircularProgressIndicator()),error:(e,_)=>_ErrorCard(message:e.toString(),onRetry:()=>ref.invalidate(activationStatisticsProvider)),data:(s)=>Column(children:[
          Row(children:[Expanded(child:_StatCard(label:'Today',value:s.daily,icon:Icons.today)),Expanded(child:_StatCard(label:'This week',value:s.weekly,icon:Icons.date_range)),Expanded(child:_StatCard(label:'This month',value:s.monthly,icon:Icons.calendar_month))]),
          Card(child:Column(children:ActivationType.values.map((t)=>ListTile(title:Text(t.displayName),subtitle:Text(t.ussdCode),trailing:Text('${s.byType[t]??0}',style:const TextStyle(fontSize:20,fontWeight:FontWeight.bold)))).toList()))])),
        const SizedBox(height:20),Row(mainAxisAlignment:MainAxisAlignment.spaceBetween,children:[const Text('Activation history',style:TextStyle(fontSize:20,fontWeight:FontWeight.bold)),TextButton(onPressed:()=>Navigator.push(context,MaterialPageRoute<void>(builder:(_)=>ActivationHistoryScreen(profile:widget.profile))),child:const Text('View all'))]),
        ref.watch(activationHistoryProvider).when(loading:()=>const Center(child:CircularProgressIndicator()),error:(e,_)=>_ErrorCard(message:e.toString(),onRetry:()=>ref.invalidate(activationHistoryProvider)),data:(items)=>items.isEmpty?const Card(child:Padding(padding:EdgeInsets.all(20),child:Text('No activation records yet.'))):Column(children:items.take(5).map((a)=>_ActivationTile(activation:a,onTap:()=>Navigator.push(context,MaterialPageRoute<void>(builder:(_)=>ActivationDetailsScreen(activation:a)))).toList())),
      ])),
  );
}
class ActivationHistoryScreen extends ConsumerWidget {
  const ActivationHistoryScreen({super.key,required this.profile}); final EmployeeProfile profile;
  @override Widget build(BuildContext context,WidgetRef ref)=>Scaffold(appBar:AppBar(title:const Text('Activation History')),body:ref.watch(activationHistoryProvider).when(
    loading:()=>const Center(child:CircularProgressIndicator()),error:(e,_)=>_ErrorCard(message:e.toString(),onRetry:()=>ref.invalidate(activationHistoryProvider)),
    data:(items)=>items.isEmpty?const Center(child:Text('No activation records found.')):ListView.separated(padding:const EdgeInsets.all(12),itemCount:items.length,separatorBuilder:(_,__)=>const SizedBox(height:6),itemBuilder:(context,i)=>_ActivationTile(activation:items[i],onTap:()=>Navigator.push(context,MaterialPageRoute<void>(builder:(_)=>ActivationDetailsScreen(activation:items[i]))))))));
}
class ActivationStatisticsScreen extends ConsumerWidget {
  const ActivationStatisticsScreen({super.key});
  @override Widget build(BuildContext context,WidgetRef ref)=>Scaffold(appBar:AppBar(title:const Text('Activation Statistics')),body:ref.watch(activationStatisticsProvider).when(
    loading:()=>const Center(child:CircularProgressIndicator()),error:(e,_)=>_ErrorCard(message:e.toString(),onRetry:()=>ref.invalidate(activationStatisticsProvider)),
    data:(s)=>ListView(padding:const EdgeInsets.all(16),children:[_StatCard(label:'Daily activations',value:s.daily,icon:Icons.today),_StatCard(label:'Weekly activations',value:s.weekly,icon:Icons.date_range),_StatCard(label:'Monthly activations',value:s.monthly,icon:Icons.calendar_month),Card(child:Column(children:ActivationType.values.map((t)=>ListTile(title:Text(t.displayName),subtitle:Text(t.ussdCode),trailing:Text('${s.byType[t]??0}'))).toList()))])));
}
class ActivationDetailsScreen extends StatelessWidget {
  const ActivationDetailsScreen({super.key,required this.activation});final Activation activation;
  @override Widget build(BuildContext context)=>Scaffold(appBar:AppBar(title:const Text('Activation Details')),body:ListView(padding:const EdgeInsets.all(16),children:[Card(child:Column(children:[
    ListTile(leading:const Icon(Icons.bolt),title:Text(activation.type.displayName),subtitle:Text(activation.type.ussdCode),trailing:Chip(label:Text(activation.status))),
    const Divider(height:1),_DetailRow('Employee',activation.employeeName),_DetailRow('Employee code',activation.employeeCode),_DetailRow('Team',activation.teamName??'Direct Agent / Unassigned'),_DetailRow('Date and time',activation.createdAt.toString()),_DetailRow('GPS latitude',activation.latitude.toStringAsFixed(6)),_DetailRow('GPS longitude',activation.longitude.toStringAsFixed(6)),_DetailRow('Record ID',activation.id)]))]));
}
class _ActivationButton extends StatelessWidget {
  const _ActivationButton({required this.title,required this.code,required this.color,required this.icon,required this.busy,required this.onTap});
  final String title,code;final Color color;final IconData icon;final bool busy;final VoidCallback onTap;
  @override Widget build(BuildContext context)=>Card(clipBehavior:Clip.antiAlias,child:InkWell(onTap:busy?null:onTap,child:Padding(padding:const EdgeInsets.all(18),child:Row(children:[
    Container(width:54,height:54,decoration:BoxDecoration(color:color.withValues(alpha:.1),borderRadius:BorderRadius.circular(14)),child:Icon(icon,color:color,size:30)),const SizedBox(width:14),
    Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(title,style:TextStyle(color:color,fontSize:18,fontWeight:FontWeight.bold)),const SizedBox(height:4),Text('Dial $code',style:const TextStyle(color:Color(0xFF667085)))])),
    if(busy)const SizedBox(width:22,height:22,child:CircularProgressIndicator(strokeWidth:2))else Icon(Icons.arrow_forward,color:color)]))));
}
class _StatCard extends StatelessWidget {
  const _StatCard({required this.label,required this.value,required this.icon});final String label;final int value;final IconData icon;
  @override Widget build(BuildContext context)=>Card(child:Padding(padding:const EdgeInsets.all(12),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Icon(icon,color:const Color(0xFF1F5AA6)),const SizedBox(height:10),Text('$value',style:const TextStyle(fontSize:25,fontWeight:FontWeight.bold)),Text(label,style:const TextStyle(fontSize:12,color:Color(0xFF667085)))])));
}
class _ActivationTile extends StatelessWidget {
  const _ActivationTile({required this.activation,required this.onTap});final Activation activation;final VoidCallback onTap;
  @override Widget build(BuildContext context)=>Card(child:ListTile(onTap:onTap,leading:CircleAvatar(child:Icon(activation.type==ActivationType.sayuru?Icons.phone_android:Icons.eco_outlined)),title:Text(activation.type.displayName),subtitle:Text('${activation.employeeName} • ${activation.createdAt}'),trailing:const Icon(Icons.chevron_right)));
}
class _DetailRow extends StatelessWidget {
  const _DetailRow(this.label,this.value);final String label,value;
  @override Widget build(BuildContext context)=>Padding(padding:const EdgeInsets.symmetric(horizontal:16,vertical:11),child:Row(crossAxisAlignment:CrossAxisAlignment.start,children:[SizedBox(width:120,child:Text(label,style:const TextStyle(color:Color(0xFF667085)))),const SizedBox(width:12),Expanded(child:SelectableText(value,style:const TextStyle(fontWeight:FontWeight.w500)))]));
}
class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.message,required this.onRetry});final String message;final VoidCallback onRetry;
  @override Widget build(BuildContext context)=>Card(child:Padding(padding:const EdgeInsets.all(16),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[const Icon(Icons.error_outline,color:Colors.red),const SizedBox(height:8),Text(message),TextButton(onPressed:onRetry,child:const Text('Retry'))])));
}
