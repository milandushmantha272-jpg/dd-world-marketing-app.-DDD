import 'dart:typed_data';

class DialogReport {
  const DialogReport({required this.id,required this.type,required this.title,required this.periodStart,required this.periodEnd,required this.filePath,required this.fileName,required this.mimeType,required this.fileSize,required this.createdAt,required this.archivedAt});
  final String id,type,title,filePath,fileName,mimeType;
  final DateTime periodStart,periodEnd,createdAt;
  final int fileSize;
  final DateTime? archivedAt;
  factory DialogReport.fromJson(Map<String,dynamic> j)=>DialogReport(id:j['id'].toString(),type:j['report_type'].toString(),title:j['title'].toString(),periodStart:DateTime.parse(j['period_start'].toString()),periodEnd:DateTime.parse(j['period_end'].toString()),filePath:j['file_path'].toString(),fileName:j['file_name'].toString(),mimeType:j['mime_type'].toString(),fileSize:(j['file_size_bytes'] as num).toInt(),createdAt:DateTime.parse(j['created_at'].toString()),archivedAt:j['archived_at']==null?null:DateTime.parse(j['archived_at'].toString()));
  String get periodLabel=>' ${periodStart.toIso8601String().substring(0,10)} — ${periodEnd.toIso8601String().substring(0,10)}';
}
class EzCashRecord {
  const EzCashRecord({required this.id,required this.employeeId,required this.employeeName,required this.employeeCode,required this.teamId,required this.periodMonth,required this.amount,required this.status,required this.createdAt,this.paidAt,this.reference,this.numberLast4,this.ownerNote});
  final String id,employeeId,employeeName,employeeCode,status;
  final String? teamId,reference,numberLast4,ownerNote;
  final DateTime periodMonth,createdAt;
  final DateTime? paidAt;
  final double amount;
  factory EzCashRecord.fromJson(Map<String,dynamic> j){final employee=j['employee'];return EzCashRecord(id:j['id'].toString(),employeeId:j['employee_id'].toString(),employeeName:employee is Map?(employee['name']?.toString()??'Employee'):'Employee',employeeCode:employee is Map?(employee['agent_code']?.toString()??''):'',teamId:j['team_id']?.toString(),periodMonth:DateTime.parse(j['period_month'].toString()),amount:(j['amount'] as num).toDouble(),status:j['status'].toString(),createdAt:DateTime.parse(j['created_at'].toString()),paidAt:j['paid_at']==null?null:DateTime.parse(j['paid_at'].toString()),reference:j['payment_reference']?.toString(),numberLast4:j['payment_number_last4']?.toString(),ownerNote:j['owner_note']?.toString());}
  String get amountLabel=>'LKR ${amount.toStringAsFixed(2)}';
}
class CommissionComplaintThread {
  const CommissionComplaintThread({required this.id,required this.commissionId,required this.employeeId,required this.type,required this.message,required this.status,required this.createdAt,this.employeeName,this.employeeCode,this.expectedAmount,this.ownerResponse});
  final String id,commissionId,employeeId,type,message,status;
  final DateTime createdAt;
  final String? employeeName,employeeCode,ownerResponse;
  final double? expectedAmount;
  factory CommissionComplaintThread.fromJson(Map<String,dynamic> j){final employee=j['employee'];return CommissionComplaintThread(id:j['id'].toString(),commissionId:j['commission_id'].toString(),employeeId:j['employee_id'].toString(),type:(j['complaint_type']??j['type']??'other').toString(),message:j['message'].toString(),status:j['status'].toString(),createdAt:DateTime.parse(j['created_at'].toString()),employeeName:employee is Map?employee['name']?.toString():null,employeeCode:employee is Map?employee['agent_code']?.toString():null,expectedAmount:j['expected_amount']==null?null:(j['expected_amount'] as num).toDouble(),ownerResponse:j['owner_response']?.toString());}
}
String reportMimeType(String fileName){final n=fileName.toLowerCase();if(n.endsWith('.pdf'))return 'application/pdf';if(n.endsWith('.xlsx'))return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';if(n.endsWith('.xls'))return 'application/vnd.ms-excel';if(n.endsWith('.csv'))return 'text/csv';throw const FormatException('Only PDF, Excel (.xlsx/.xls), and CSV files are supported.');}
String imageMimeType(String fileName){final n=fileName.toLowerCase();if(n.endsWith('.png'))return 'image/png';if(n.endsWith('.webp'))return 'image/webp';if(n.endsWith('.pdf'))return 'application/pdf';return 'image/jpeg';}
