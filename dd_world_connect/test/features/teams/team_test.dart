import 'package:flutter_test/flutter_test.dart';
import 'package:dd_world_connect/features/teams/domain/team.dart';

void main() {
  group('TeamStatus mapping', () {
    test('serializes all statuses using database values', () {
      expect(TeamStatus.active.dbValue, 'ACTIVE');
      expect(TeamStatus.inactive.dbValue, 'INACTIVE');
      expect(TeamStatus.archived.dbValue, 'ARCHIVED');
    });

    test('parses stored status values and defaults unknown values to active', () {
      expect(TeamStatusX.fromDb('INACTIVE'), TeamStatus.inactive);
      expect(TeamStatusX.fromDb('ARCHIVED'), TeamStatus.archived);
      expect(TeamStatusX.fromDb('active'), TeamStatus.active);
      expect(TeamStatusX.fromDb(null), TeamStatus.active);
    });
  });

  group('Team model', () {
    test('parses database row and embedded leader relation', () {
      final team = Team.fromJson({
        'id': 'team-1',
        'team_code': 'DILSHAN',
        'name': 'Dilshan Team',
        'status': 'ACTIVE',
        'description': 'Field sales team',
        'leader_id': 'user-1',
        'leader': {'id': 'user-1', 'name': 'Ishara Dilshan'},
        'created_at': '2026-10-01T00:00:00Z',
      }, employeeCount: 9);
      expect(team.id, 'team-1');
      expect(team.code, 'DILSHAN');
      expect(team.leaderId, 'user-1');
      expect(team.leaderName, 'Ishara Dilshan');
      expect(team.employeeCount, 9);
      expect(team.status, TeamStatus.active);
    });

    test('statistics preserve team identity and set metrics', () {
      const team = Team(id: 't', code: 'T-1', name: 'Team One', status: TeamStatus.active, employeeCount: 4);
      final result = team.withStatistics(activations: 7, quantity: 18, amount: 2400, present: 3, attendance: 5);
      expect(result.id, team.id);
      expect(result.employeeCount, 4);
      expect(result.activationCount, 7);
      expect(result.salesQuantity, 18);
      expect(result.salesAmount, 2400);
      expect(result.presentCount, 3);
      expect(result.attendanceCount, 5);
    });
  });
}
