import 'package:flutter/material.dart';

class EmployeeIdCardRecord {
  const EmployeeIdCardRecord({required this.id,required this.employeeId,required this.cardNumber,required this.qrToken,required this.status,required this.employeeName,required this.staffCode,required this.position,required this.teamName,required this.employeePhotoPath,required this.companyLogoPath,required this.issuedAt});
  final String id,employeeId,cardNumber,qrToken,status,employeeName,staffCode,position,teamName;
  final String? employeePhotoPath,companyLogoPath;
  final DateTime issuedAt;
}

class EmployeeDocumentRecord {
  const EmployeeDocumentRecord({required this.id,required this.employeeId,required this.documentType,required this.fileName,required this.mimeType,required this.fileSizeBytes,required this.status,required this.submittedAt,required this.filePath,this.reviewNote});
  final String id,employeeId,documentType,fileName,mimeType,status,filePath;
  final int fileSizeBytes;
  final DateTime submittedAt;
  final String? reviewNote;
  factory EmployeeDocumentRecord.fromJson(Map<String,dynamic> j)=>EmployeeDocumentRecord(id:j['id'] as String,employeeId:j['employee_id'] as String,documentType:j['document_type'] as String,fileName:j['file_name'] as String,mimeType:j['mime_type'] as String,fileSizeBytes:(j['file_size_bytes'] as num).toInt(),status:j['status'] as String,submittedAt:DateTime.parse(j['submitted_at'] as String),filePath:j['file_path'] as String,reviewNote:j['review_note'] as String?);
}

class LeaveRequestRecord {
  const LeaveRequestRecord({required this.id,required this.leaveType,required this.startDate,required this.endDate,required this.reason,required this.status,required this.reviewStage,required this.createdAt,required this.employeeId,this.employeeName,this.reviewNote});
  final String id,leaveType,reason,status,reviewStage,employeeId;\n  final String? employeeName;
  final DateTime startDate,endDate,createdAt;
  final String? reviewNote;
  factory LeaveRequestRecord.fromJson(Map<String,dynamic> j)=>LeaveRequestRecord(id:j['id'] as String,leaveType:j['leave_type'] as String,startDate:DateTime.parse(j['start_date'] as String),endDate:DateTime.parse(j['end_date'] as String),reason:j['reason'] as String,status:j['status'] as String,reviewStage:j['review_stage'] as String,createdAt:DateTime.parse(j['created_at'] as String),employeeId:j['user_id'] as String,employeeName:(j['users'] as Map<String,dynamic>?)?['name'] as String?,reviewNote:j['review_note'] as String?);
}

class EmployeeQrResult {
  const EmployeeQrResult({required this.employeeName,required this.staffCode,required this.teamName,required this.position,required this.status,required this.verified});
  final String employeeName,staffCode,teamName,position,status;
  final bool verified;
  factory EmployeeQrResult.fromJson(Map<String,dynamic> j)=>EmployeeQrResult(employeeName:j['employee_name'] as String,staffCode:j['staff_code'] as String,teamName:j['team_name'] as String,position:j['employee_position'] as String,status:j['status'] as String,verified:j['verified'] as bool);
}

class SharedMaterialRecord {
  const SharedMaterialRecord({required this.id,required this.title,required this.description,required this.category,required this.fileName,required this.filePath,required this.mimeType,required this.fileSizeBytes,required this.createdAt});
  final String id,title,description,category,fileName,filePath,mimeType;
  final int fileSizeBytes;
  final DateTime createdAt;
  factory SharedMaterialRecord.fromJson(Map<String,dynamic> j,{required String category})=>SharedMaterialRecord(id:j['id'] as String,title:j['title'] as String,description:j['description'] as String? ?? '',category:category,fileName:j['file_name'] as String,filePath:j['file_path'] as String,mimeType:j['mime_type'] as String,fileSizeBytes:(j['file_size_bytes'] as num).toInt(),createdAt:DateTime.parse(j['created_at'] as String));
}

const employeeDocumentTypes=<String,String>{'nic_front':'NIC Front','nic_back':'NIC Back','police_report':'Police Report','grama_sevaka_report':'Grama Sevaka Report','education_certificate':'Education Certificate','cv':'CV','previous_employment_record':'Previous Employment Record'};
String rolePosition(String role)=>switch(role){'owner'=>'Owner','team_leader'=>'Team Leader','agent'=>'Agent','direct_agent'=>'Direct Agent',_=>role.replaceAll('_',' ')};
Color documentStatusColor(String status)=>switch(status){'approved'=>Colors.green,'rejected'=>Colors.red,_=>Colors.orange};
