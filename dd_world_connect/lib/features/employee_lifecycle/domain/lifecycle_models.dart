class EmployeeOption {
 const EmployeeOption({required this.id,required this.name,required this.code});
 final String id,name,code;
 factory EmployeeOption.fromJson(Map<String,dynamic> j)=>EmployeeOption(id:j['id'].toString(),name:(j['name']??'').toString(),code:(j['agent_code']??'').toString());
}
class LifecycleRow {
 const LifecycleRow(this.data);
 final Map<String,dynamic> data;
 String get id=>data['id'].toString();
 String get title=>(data['title']??data['file_name']??data['card_number']??'').toString();
 String get status=>(data['status']??'').toString();
 factory LifecycleRow.fromJson(Map<String,dynamic> j)=>LifecycleRow(Map<String,dynamic>.from(j));
}
