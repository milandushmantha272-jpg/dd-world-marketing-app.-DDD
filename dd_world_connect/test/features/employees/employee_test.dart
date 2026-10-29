import 'package:flutter_test/flutter_test.dart';
import 'package:dd_world_connect/features/employees/domain/employee.dart';

void main() {
  group('EmployeeStatus mapping', () {
    test('maps all lifecycle statuses from database values', () {
      expect(EmployeeStatusX.fromDb('ACTIVE'), EmployeeStatus.active);
      expect(EmployeeStatusX.fromDb('SUSPENDED'), EmployeeStatus.suspended);
      expect(EmployeeStatusX.fromDb('BLACKLISTED'), EmployeeStatus.blacklisted);
      expect(EmployeeStatusX.fromDb('RESIGNED'), EmployeeStatus.resigned);
    });
  });
  group('Employee role mapping', () {
    test('maps explicit roles and distinguishes direct agents by team assignment', () {
      expect(EmployeeRoleX.fromDb('owner'), EmployeeRole.owner);
      expect(EmployeeRoleX.fromDb('team_leader'), EmployeeRole.teamLeader);
      expect(EmployeeRoleX.fromDb('agent', teamId:'team-1'), EmployeeRole.agent);
      expect(EmployeeRoleX.fromDb('agent'), EmployeeRole.directAgent);
    });
  });
  test('parses nested profile and team data', () {
    final employee = Employee.fromJson({
      'id':'employee-1','agent_code':'1234','name':'Test Employee','phone':'+94771234567',
      'role':'agent','status':'active','employment_status':'ACTIVE','id_approval_status':'APPROVED',
      'team_id':'team-1','teams':{'id':'team-1','name':'Dilshan'},
      'employee_profiles':{'nic':'123456789V','address':'Colombo','date_of_birth':'1998-04-10','join_date':'2026-01-01'}
    });
    expect(employee.code,'1234');
    expect(employee.teamName,'Dilshan');
    expect(employee.nic,'123456789V');
    expect(employee.dateOfBirth,DateTime(1998,4,10));
  });
}
