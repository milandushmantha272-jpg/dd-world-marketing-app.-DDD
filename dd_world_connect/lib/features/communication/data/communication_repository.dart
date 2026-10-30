import 'dart:typed_data';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../domain/communication_models.dart';

class CommunicationRepository {
  CommunicationRepository(this.client);
  final SupabaseClient client;

  Future<String?> teamId(String employeeId) async {
    final row=await client.from('users').select('team_id').eq('id',employeeId).maybeSingle();
    return row?['team_id'] as String?;
  }

  Future<List<MeetingRecord>> meetings(String employeeId) async {
    final rows=await client.from('meetings').select().isFilter('deleted_at',null).order('starts_at');
    final team=await teamId(employeeId);
    return rows.where((r)=>r['team_id']==null||r['team_id']==team).map(MeetingRecord.fromJson).toList();
  }

  Future<void> createMeeting({required String employeeId,required String role,required String title,required String description,required String type,required DateTime startsAt,required DateTime endsAt,String? location,String? meetingUrl,String? teamId}) async {
    if(role!='owner'&&role!='team_leader') throw const AuthException('Only Owner and Team Leader can create meetings.');
    if(role=='team_leader'&&(teamId==null||teamId!=await this.teamId(employeeId))) throw const AuthException('Team Leaders can create meetings only for their own team.');
    await client.from('meetings').insert({'created_by':employeeId,'title':title.trim(),'description':description.trim(),'meeting_type':type,'starts_at':startsAt.toUtc().toIso8601String(),'ends_at':endsAt.toUtc().toIso8601String(),'location':location,'meeting_url':meetingUrl,'team_id':teamId});
  }

  Future<void> markAttendance({required String meetingId,required String employeeId}) async {
    await client.from('meeting_attendance').upsert({'meeting_id':meetingId,'employee_id':employeeId,'attendance_status':'attending','marked_at':DateTime.now().toUtc().toIso8601String()},onConflict:'meeting_id,employee_id');
  }

  Future<List<Map<String,dynamic>>> staff(String employeeId) async {
    final rows=await client.from('users').select('id,name,role,team_id').eq('status','active').order('name');
    return rows.where((r)=>r['id']!=employeeId).toList();
  }

  Future<String> openOrCreateConversation({required String employeeId,required String otherEmployeeId}) async {
    final mine=await client.from('conversation_members').select('conversation_id').eq('employee_id',employeeId);
    final ids=mine.map((e)=>e['conversation_id'] as String).toList();
    if(ids.isNotEmpty){
      final theirs=await client.from('conversation_members').select('conversation_id').eq('employee_id',otherEmployeeId).inFilter('conversation_id',ids);
      if(theirs.isNotEmpty)return theirs.first['conversation_id'] as String;
    }
    final row=await client.from('conversations').insert({'created_by':employeeId}).select('id').single();
    final id=row['id'] as String;
    await client.from('conversation_members').insert([{'conversation_id':id,'employee_id':employeeId},{'conversation_id':id,'employee_id':otherEmployeeId}]);
    return id;
  }

  Future<List<CommunicationMessage>> directMessages(String conversationId) async {
    final rows=await client.from('conversation_messages').select().eq('conversation_id',conversationId).order('created_at');
    return rows.map(CommunicationMessage.fromJson).toList();
  }

  Future<void> sendDirectMessage({required String conversationId,required String employeeId,required String body,String? attachmentPath,String? mimeType}) async {
    if(body.trim().isEmpty&&attachmentPath==null)return;
    await client.from('conversation_messages').insert({'conversation_id':conversationId,'sender_id':employeeId,'body':body.trim(),'message_type':attachmentPath==null?'text':'image','attachment_path':attachmentPath,'attachment_mime_type':mimeType});
    await client.from('conversations').update({'last_message_at':DateTime.now().toUtc().toIso8601String()}).eq('id',conversationId);
  }

  Future<List<Map<String,dynamic>>> groups(String employeeId) async {
    final rows=await client.from('group_members').select('group_id,groups(id,name,group_type,team_id,is_announcement_only)').eq('employee_id',employeeId);
    return rows.map((e)=>e['groups'] as Map<String,dynamic>).toList();
  }

  Future<List<Map<String,dynamic>>> groupMessages(String groupId) async {
    final rows=await client.from('group_messages').select('id,body,message_type,sender_id,created_at,attachment_path').eq('group_id',groupId).isFilter('deleted_at',null).order('created_at');
    return rows;
  }

  Future<void> sendGroupMessage({required String groupId,required String employeeId,required String body,String? attachmentPath,String? mimeType,bool announcement=false}) async {
    if(body.trim().isEmpty&&attachmentPath==null)return;
    await client.from('group_messages').insert({'group_id':groupId,'sender_id':employeeId,'body':body.trim(),'message_type':announcement?'announcement':attachmentPath==null?'text':'image','attachment_path':attachmentPath,'attachment_mime_type':mimeType});
  }

  Future<List<FeedPost>> feed() async {
    final rows=await client.from('community_posts').select().eq('status','published').isFilter('deleted_at',null).order('created_at',ascending:false).limit(100);
    return rows.map(FeedPost.fromJson).toList();
  }

  Future<void> createPost({required String employeeId,required String authorName,required String content,required bool announcement,required bool successStory,String? imagePath,String? videoPath}) async {
    await client.from('community_posts').insert({'author_user_id':employeeId,'author_name':authorName,'content':content.trim(),'post_type':announcement?'announcement':successStory?'success_story':'discussion','is_announcement':announcement,'is_success_story':successStory,'image_path':imagePath,'video_path':videoPath,'audience':'all','status':'published'});
  }


  Future<void> createGroup({required String employeeId,required String role,required String name,required String groupType,String? teamId}) async {
    if(role!='owner'&&!(role=='team_leader'&&groupType=='team')) throw const AuthException('Only Owner can create organization groups; Team Leaders can create their own team groups.');
    if(role=='team_leader'&&(teamId==null||teamId!=await this.teamId(employeeId))) throw const AuthException('Team Leader group must belong to their own team.');
    final group=await client.from('groups').insert({'name':name.trim(),'group_type':groupType,'team_id':groupType=='team'?teamId:null,'created_by':employeeId,'is_announcement_only':false}).select('id').single();
    var query=client.from('users').select('id').eq('status','active').eq('employment_status','ACTIVE');
    if(groupType=='team') query=query.eq('team_id',teamId!);
    if(groupType=='team_leaders') query=query.eq('role','team_leader');
    if(groupType=='direct_agents') query=query.eq('role','direct_agent');
    final people=await query;
    final members=people.map((p)=>{'group_id':group['id'],'employee_id':p['id'],'added_by':employeeId}).toList();
    if(!members.any((m)=>m['employee_id']==employeeId)) members.add({'group_id':group['id'],'employee_id':employeeId,'added_by':employeeId});
    await client.from('group_members').insert(members);
  }

  Future<String> uploadMedia({required String authUid,required Uint8List bytes,required String fileName,required String mimeType}) async {
    if(bytes.isEmpty||bytes.length>52428800) throw const FormatException('Media must be between 1 byte and 50 MB.');
    if(!mimeType.startsWith('image/')&&!mimeType.startsWith('video/')) throw const FormatException('Only image and video files are supported.');
    final safe=fileName.replaceAll(RegExp(r'[^A-Za-z0-9._-]'),'_');
    final path=authUid+'/'+DateTime.now().microsecondsSinceEpoch.toString()+'_'+safe;
    await client.storage.from('dd-world-communication').uploadBinary(path,bytes,fileOptions:FileOptions(contentType:mimeType,upsert:false));
    return path;
  }

  Future<String> signedMediaUrl(String path) => client.storage.from('dd-world-communication').createSignedUrl(path,3600);

  Future<void> comment({required String postId,required String employeeId,required String body}) async {
    await client.from('community_comments').insert({'post_id':postId,'author_user_id':employeeId,'body':body.trim()});
  }

  Future<void> toggleLike({required String postId,required String employeeId}) async {
    final old=await client.from('community_reactions').select('post_id').eq('post_id',postId).eq('user_id',employeeId).eq('reaction_type','like').maybeSingle();
    if(old==null){await client.from('community_reactions').insert({'post_id':postId,'user_id':employeeId,'reaction_type':'like'});}
    else{await client.from('community_reactions').delete().eq('post_id',postId).eq('user_id',employeeId).eq('reaction_type','like');}
  }

  Future<List<StaffNotification>> notifications(String employeeId) async {
    final rows=await client.from('notifications').select().eq('user_id',employeeId).order('created_at',ascending:false).limit(100);
    return rows.map(StaffNotification.fromJson).toList();
  }

  Future<void> markNotificationRead(String id) async {
    await client.from('notifications').update({'read':true}).eq('id',id);
  }
}
