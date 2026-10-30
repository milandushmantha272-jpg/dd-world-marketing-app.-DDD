import 'package:flutter/foundation.dart';

@immutable
class MeetingRecord {
  const MeetingRecord({required this.id,required this.title,required this.description,required this.type,required this.startsAt,required this.endsAt,required this.status,required this.createdBy,this.location,this.meetingUrl,this.teamId});
  final String id,title,description,type,status,createdBy;
  final DateTime startsAt,endsAt;
  final String? location,meetingUrl,teamId;
  factory MeetingRecord.fromJson(Map<String,dynamic> j)=>MeetingRecord(id:j['id'] as String,title:j['title'] as String,description:(j['description']??'') as String,type:j['meeting_type'] as String,startsAt:DateTime.parse(j['starts_at'] as String),endsAt:DateTime.parse(j['ends_at'] as String),status:j['status'] as String,createdBy:j['created_by'] as String,location:j['location'] as String?,meetingUrl:j['meeting_url'] as String?,teamId:j['team_id'] as String?);
}
@immutable
class CommunicationMessage {
 const CommunicationMessage({required this.id,required this.senderId,required this.body,required this.createdAt,required this.type,this.attachmentPath,this.readAt});
 final String id,senderId,body,type;final DateTime createdAt;final String? attachmentPath;final DateTime? readAt;
 factory CommunicationMessage.fromJson(Map<String,dynamic> j)=>CommunicationMessage(id:j['id'] as String,senderId:j['sender_id'] as String,body:(j['body']??'') as String,createdAt:DateTime.parse(j['created_at'] as String),type:j['message_type'] as String,attachmentPath:j['attachment_path'] as String?,readAt:j['read_at']==null?null:DateTime.parse(j['read_at'] as String));
}
@immutable
class FeedPost {
 const FeedPost({required this.id,required this.authorId,required this.authorName,required this.content,required this.createdAt,required this.isAnnouncement,required this.isSuccessStory,this.imagePath,this.videoPath});
 final String id,authorId,authorName,content;final DateTime createdAt;final bool isAnnouncement,isSuccessStory;final String? imagePath,videoPath;
 factory FeedPost.fromJson(Map<String,dynamic> j)=>FeedPost(id:j['id'] as String,authorId:j['author_user_id'] as String,authorName:(j['author_name']??'DD WORLD Staff') as String,content:j['content'] as String,createdAt:DateTime.parse(j['created_at'] as String),isAnnouncement:j['is_announcement'] as bool???false,isSuccessStory:j['is_success_story'] as bool? ?? false,imagePath:j['image_path'] as String?,videoPath:j['video_path'] as String?);
}
@immutable
class StaffNotification {
 const StaffNotification({required this.id,required this.title,required this.body,required this.type,required this.createdAt,required this.isRead});
 final String id,title,body,type;final DateTime createdAt;final bool isRead;
 factory StaffNotification.fromJson(Map<String,dynamic> j)=>StaffNotification(id:j['id'] as String,title:j['title'] as String,body:j['body'] as String,type:j['type'] as String,createdAt:DateTime.parse(j['created_at'] as String),isRead:j['read'] as bool? ?? false);
}
