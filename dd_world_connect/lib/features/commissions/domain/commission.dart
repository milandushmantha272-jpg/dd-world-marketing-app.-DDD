enum CommissionStatus { pending, confirmed, notReceived, wrongAmount }
extension CommissionStatusX on CommissionStatus {
 String get databaseValue=>switch(this){CommissionStatus.pending=>'pending',CommissionStatus.confirmed=>'confirmed',CommissionStatus.notReceived=>'not_received',CommissionStatus.wrongAmount=>'wrong_amount'};
 String get label=>switch(this){CommissionStatus.pending=>'Pending confirmation',CommissionStatus.confirmed=>'Received',CommissionStatus.notReceived=>'Not received',CommissionStatus.wrongAmount=>'Wrong amount'};
 static CommissionStatus parse(Object? v)=>switch(v?.toString()){ 'confirmed'=>CommissionStatus.confirmed,'not_received'=>CommissionStatus.notReceived,'wrong_amount'=>CommissionStatus.wrongAmount,_=>CommissionStatus.pending};
}
class CommissionRecord {
 const CommissionRecord({required this.id,required this.employeeId,required this.employeeName,required this.employeeCode,required this.teamId,required this.teamName,required this.periodMonth,required this.amount,required this.currency,required this.status,required this.confirmationNote,required this.confirmedAt,required this.createdAt});
 final String id,employeeId,employeeName,employeeCode,currency;final String? teamId,teamName,confirmationNote;final DateTime periodMonth,createdAt;final double amount;final CommissionStatus status;final DateTime? confirmedAt;
 factory CommissionRecord.fromJson(Map<String,dynamic> j)=>CommissionRecord(id:j['id'].toString(),employeeId:j['employee_id'].toString(),employeeName:(j['employee']?['name']??j['employee_name']??'Employee').toString(),employeeCode:(j['employee']?['agent_code']??j['employee_code']??'').toString(),teamId:j['team_id']?.toString(),teamName:(j['team']?['name']??j['team_name'])?.toString(),periodMonth:DateTime.parse(j['period_month'].toString()),amount:(j['amount'] as num).toDouble(),currency:(j['currency']??'LKR').toString(),status:CommissionStatusX.parse(j['status']),confirmationNote:j['confirmation_note']?.toString(),confirmedAt:j['confirmed_at']==null?null:DateTime.parse(j['confirmed_at'].toString()),createdAt:DateTime.parse(j['created_at'].toString()));
 String get monthLabel=>'${periodMonth.year}-${periodMonth.month.toString().padLeft(2,'0')}';String get formattedAmount=>'$currency ${amount.toStringAsFixed(2)}';
}
class CommissionComplaint {
 const CommissionComplaint({required this.id,required this.commissionId,required this.employeeId,required this.type,required this.message,required this.status,required this.createdAt,this.expectedAmount,this.screenshotPath,this.ownerResponse});
 final String id,commissionId,employeeId,type,message,status;final DateTime createdAt;final double? expectedAmount;final String? screenshotPath,ownerResponse;
 factory CommissionComplaint.fromJson(Map<String,dynamic> j)=>CommissionComplaint(id:j['id'].toString(),commissionId:j['commission_id'].toString(),employeeId:j['employee_id'].toString(),type:j['complaint_type'].toString(),message:j['message'].toString(),status:j['status'].toString(),createdAt:DateTime.parse(j['created_at'].toString()),expectedAmount:(j['expected_amount'] as num?)?.toDouble(),screenshotPath:j['screenshot_path']?.toString(),ownerResponse:j['owner_response']?.toString());
}
