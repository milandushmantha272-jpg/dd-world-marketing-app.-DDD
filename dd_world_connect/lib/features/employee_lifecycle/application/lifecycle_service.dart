import 'dart:typed_data';
import '../data/lifecycle_repository.dart';
import '../domain/lifecycle_models.dart';
class LifecycleService {
 LifecycleService(this.repository);final LifecycleRepository repository;
 Future<List<EmployeeOption>> employees()=>repository.employees();
 Future<List<LifecycleRow>> cards()=>repository.rows('employee_id_cards',order:'issued_at');
 Future<List<LifecycleRow>> documents()=>repository.rows('employee_documents',order:'submitted_at');
 Future<List<LifecycleRow>> leave()=>repository.rows('leave_requests',order:'created_at');
 Future<List<LifecycleRow>> downloads()=>repository.rows('downloads',order:'created_at');
 Future<List<LifecycleRow>> training(String? product)async{var q=repository.db.from('training_materials').select('*').eq('is_published',true);if(product!=null)q=q.eq('product',product);final r=await q.order('sort_order').order('created_at',ascending:false);return r.map((x)=>LifecycleRow.fromJson(Map<String,dynamic>.from(x))).toList();}
 Future<Map<String,dynamic>> issueId(String id)=>repository.issueId(id);
 Future<Map<String,dynamic>> verifyQr(String token)=>repository.verifyQr(token);
 Future<void> uploadDocument(String t,String n,Uint8List b,String m)=>repository.uploadDocument(t,n,b,m);
 Future<String> documentUrl(String p)=>repository.documentUrl(p);
 Future<void> reviewDocument(String id,bool ok,String note)=>repository.reviewDocument(id,ok,note);
 Future<void> applyLeave(String t,DateTime s,DateTime e,String r,String h)=>repository.applyLeave(t,s,e,r,h);
 Future<void> reviewLeave(String id,bool ok,String n)=>repository.reviewLeave(id,ok,n);
 Future<void> uploadFile(String table,String bucket,String title,String desc,String cat,String name,Uint8List b,String mime)=>repository.uploadLibraryFile(table:table,bucket:bucket,title:title,description:desc,category:cat,name:name,bytes:b,mime:mime);
 Future<String> openDownload(LifecycleRow f)=>repository.openDownload(f);
 Future<String> openTraining(LifecycleRow f)=>repository.openTraining(f);
 Future<void> completeTraining(String id)=>repository.completeTraining(id);
}
