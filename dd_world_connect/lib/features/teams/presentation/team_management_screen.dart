import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../authentication/domain/employee_profile.dart';
import '../application/team_controller.dart';
import '../application/team_service.dart';
import '../domain/team.dart';

const _brand = Color(0xFF1F5AA6);

class TeamManagementScreen extends ConsumerWidget {
  const TeamManagementScreen({super.key, required this.role});
  final EmployeeRole role;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final result = ref.watch(teamsProvider);
    final status = ref.watch(teamStatusFilterProvider);
    return Scaffold(
      appBar: AppBar(title: Text(role == EmployeeRole.owner ? 'Team Management' : role == EmployeeRole.teamLeader ? 'My Team' : 'Assigned Team')),
      floatingActionButton: role == EmployeeRole.owner ? FloatingActionButton.extended(
        backgroundColor: _brand, foregroundColor: Colors.white, icon: const Icon(Icons.add),
        label: const Text('Create Team'),
        onPressed: () async { final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => const TeamFormScreen())); if (ok == true) ref.invalidate(teamsProvider); },
      ) : null,
      body: RefreshIndicator(
        onRefresh: () async { ref.invalidate(teamsProvider); },
        child: ListView(padding: const EdgeInsets.all(16), children: [
          TextField(onChanged: (v) => ref.read(teamSearchProvider.notifier).state = v,
            decoration: const InputDecoration(prefixIcon: Icon(Icons.search), labelText: 'Search teams', hintText: 'Name or team code', border: OutlineInputBorder())),
          const SizedBox(height: 10),
          DropdownButtonFormField<TeamStatus?>(
            value: status, decoration: const InputDecoration(labelText: 'Filter by status', border: OutlineInputBorder()),
            items: const [
              DropdownMenuItem<TeamStatus?>(value: null, child: Text('All statuses')),
              DropdownMenuItem<TeamStatus?>(value: TeamStatus.active, child: Text('Active')),
              DropdownMenuItem<TeamStatus?>(value: TeamStatus.inactive, child: Text('Inactive')),
              DropdownMenuItem<TeamStatus?>(value: TeamStatus.archived, child: Text('Archived')),
            ],
            onChanged: (v) => ref.read(teamStatusFilterProvider.notifier).state = v,
          ),
          const SizedBox(height: 12),
          result.when(
            loading: () => const Padding(padding: EdgeInsets.all(40), child: Center(child: CircularProgressIndicator())),
            error: (e, _) => _ErrorPanel(message: _error(e), retry: () => ref.invalidate(teamsProvider)),
            data: (teams) => teams.isEmpty
              ? const _EmptyPanel('No teams are assigned or visible to this account.')
              : Column(children: teams.map((team) => Card(
                margin: const EdgeInsets.only(bottom: 10), clipBehavior: Clip.antiAlias,
                child: ListTile(
                  title: Text(team.name, style: const TextStyle(fontWeight: FontWeight.w700)),
                  subtitle: Padding(padding: const EdgeInsets.only(top: 6), child: Text('${team.code} • ${team.employeeCount} members\nLeader: ${team.leaderName ?? 'Not appointed'}')),
                  isThreeLine: true, trailing: _StatusChip(team.status),
                  onTap: () async { await Navigator.push<void>(context, MaterialPageRoute(builder: (_) => TeamDetailsScreen(teamId: team.id, role: role))); ref.invalidate(teamsProvider); },
                ),
              )).toList()),
          ),
          const SizedBox(height: 12),
          const Text('Team visibility and write access are enforced by Supabase Row Level Security.', style: TextStyle(color: Colors.black54, fontSize: 12)),
        ]),
      ),
    );
  }
}

class TeamDetailsScreen extends ConsumerWidget {
  const TeamDetailsScreen({super.key, required this.teamId, required this.role});
  final String teamId; final EmployeeRole role;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isOwner = role == EmployeeRole.owner;
    final canManageRoster = isOwner || role == EmployeeRole.teamLeader;
    final async = ref.watch(teamDetailsProvider(teamId));
    return Scaffold(appBar: AppBar(title: const Text('Team Details')), body: async.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => _ErrorPanel(message: _error(e), retry: () => ref.invalidate(teamDetailsProvider(teamId))),
      data: (team) => ListView(padding: const EdgeInsets.all(16), children: [
        Card(child: Padding(padding: const EdgeInsets.all(18), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [Expanded(child: Text(team.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold))), _StatusChip(team.status)]),
          const SizedBox(height: 8), Text('Team Code: ${team.code}'),
          const SizedBox(height: 8), Text('Team Leader: ${team.leaderName ?? 'Not appointed'}'),
          const SizedBox(height: 8), Text('Created: ${_date(team.createdAt)}'),
          if ((team.description ?? '').trim().isNotEmpty) ...[const SizedBox(height: 8), Text(team.description!)],
          const Divider(height: 26),
          Row(children: [Expanded(child: _Metric('Employees', '${team.employeeCount}', Icons.people_alt_outlined)), Expanded(child: _Metric('Status', team.status.label, Icons.flag_outlined))]),
        ]))),
        if (isOwner) ...[
          _ActionTile(Icons.edit_outlined, 'Edit Team', 'Update team name, code, status and description', () async { final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => TeamFormScreen(team: team))); if (ok == true) { ref.invalidate(teamDetailsProvider(teamId)); ref.invalidate(teamsProvider); } }),
          _ActionTile(Icons.person_add_alt_1, 'Appoint / Remove Team Leader', 'Assign an active, approved employee', () async { final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => AppointTeamLeaderScreen(team: team))); if (ok == true) { ref.invalidate(teamDetailsProvider(teamId)); ref.invalidate(teamsProvider); } }),
          _ActionTile(Icons.swap_horiz, 'Transfer Employee', 'Move an employee into this team', () async { final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => TransferEmployeeScreen(destinationTeamId: teamId))); if (ok == true) { ref.invalidate(teamDetailsProvider(teamId)); ref.invalidate(teamsProvider); } }),
          _ActionTile(Icons.delete_outline, 'Delete Team', 'Only possible if no records depend on this team', () async {
            final ok = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(title: const Text('Delete team?'), content: const Text('Teams with members or historical records cannot be deleted. Archive such teams instead.'), actions: [TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')), FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete'))]));
            if (ok == true) { try { await ref.read(teamRepositoryProvider).delete(team); if (context.mounted) Navigator.pop(context); } catch (e) { if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(_error(e)))); } }
          }),
        ],
        if (canManageRoster) ...[
          _ActionTile(Icons.groups_outlined, 'Team Members', 'View roster, employee codes and roles', () => Navigator.push<void>(context, MaterialPageRoute(builder: (_) => TeamMembersScreen(teamId: teamId)))),
          _ActionTile(Icons.insights_outlined, 'Team Statistics', 'Sales, activations and attendance summary', () => Navigator.push<void>(context, MaterialPageRoute(builder: (_) => TeamStatisticsScreen(teamId: teamId)))),
          _ActionTile(Icons.history, 'Team Transfer History', 'Audit trail of employee transfers', () => Navigator.push<void>(context, MaterialPageRoute(builder: (_) => TeamHistoryScreen(teamId: teamId)))),
          _ActionTile(Icons.manage_history, 'Team Leader History', 'Audit trail of leader appointments', () => Navigator.push<void>(context, MaterialPageRoute(builder: (_) => TeamHistoryScreen(teamId: teamId, leaderHistory: true)))),
        ],
      ]),
    ));
  }
}

class TeamFormScreen extends ConsumerStatefulWidget {
  const TeamFormScreen({super.key, this.team});
  final Team? team;
  @override ConsumerState<TeamFormScreen> createState() => _TeamFormScreenState();
}
class _TeamFormScreenState extends ConsumerState<TeamFormScreen> {
  late final _code = TextEditingController(text: widget.team?.code ?? '');
  late final _name = TextEditingController(text: widget.team?.name ?? '');
  late final _description = TextEditingController(text: widget.team?.description ?? '');
  TeamStatus _status = TeamStatus.active; bool _saving = false; String? _error;
  @override void initState() { super.initState(); _status = widget.team?.status ?? TeamStatus.active; }
  @override void dispose() { _code.dispose(); _name.dispose(); _description.dispose(); super.dispose(); }
  Future<void> _save() async {
    if (_code.text.trim().length < 2 || _name.text.trim().length < 2) { setState(() => _error = 'Enter a team code and name (at least 2 characters).'); return; }
    setState(() { _saving = true; _error = null; });
    try {
      final service = TeamService(ref.read(teamRepositoryProvider));
      if (widget.team == null) { await service.create(code: _code.text, name: _name.text, status: _status, description: _description.text); }
      else { await service.update(widget.team!, code: _code.text, name: _name.text, status: _status, description: _description.text); }
      if (mounted) Navigator.pop(context, true);
    } catch (e) { if (mounted) setState(() => _error = _errorText(e)); }
    finally { if (mounted) setState(() => _saving = false); }
  }
  @override Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: Text(widget.team == null ? 'Create Team' : 'Edit Team')), body: ListView(padding: const EdgeInsets.all(20), children: [
    TextField(controller: _code, textCapitalization: TextCapitalization.characters, decoration: const InputDecoration(labelText: 'Team Code', border: OutlineInputBorder())),
    const SizedBox(height: 14), TextField(controller: _name, decoration: const InputDecoration(labelText: 'Team Name', border: OutlineInputBorder())),
    const SizedBox(height: 14), DropdownButtonFormField<TeamStatus>(value: _status, decoration: const InputDecoration(labelText: 'Team Status', border: OutlineInputBorder()), items: TeamStatus.values.map((s) => DropdownMenuItem(value: s, child: Text(s.label))).toList(), onChanged: (v) { if (v != null) setState(() => _status = v); }),
    const SizedBox(height: 14), TextField(controller: _description, minLines: 3, maxLines: 5, decoration: const InputDecoration(labelText: 'Description', border: OutlineInputBorder())),
    if (_error != null) ...[const SizedBox(height: 12), Text(_error!, style: const TextStyle(color: Colors.red))],
    const SizedBox(height: 20), FilledButton.icon(onPressed: _saving ? null : _save, icon: _saving ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(Icons.save_outlined), label: Text(_saving ? 'Saving…' : 'Save Team'), style: FilledButton.styleFrom(backgroundColor: _brand, padding: const EdgeInsets.all(15))),
  ]));
}

class AppointTeamLeaderScreen extends ConsumerStatefulWidget {
  const AppointTeamLeaderScreen({super.key, required this.team});
  final Team team;
  @override ConsumerState<AppointTeamLeaderScreen> createState() => _AppointTeamLeaderScreenState();
}
class _AppointTeamLeaderScreenState extends ConsumerState<AppointTeamLeaderScreen> {
  String? _leaderId; final _reason = TextEditingController(text: 'Team leader assignment'); bool _loading = true; bool _saving = false; String? _error; List<Map<String, dynamic>> _people = [];
  @override void initState() { super.initState(); _leaderId = widget.team.leaderId; _load(); }
  @override void dispose() { _reason.dispose(); super.dispose(); }
  Future<void> _load() async { try { final rows = await ref.read(teamRepositoryProvider).eligibleLeaders(teamId: widget.team.id); if (mounted) setState(() => _people = rows); } catch (e) { if (mounted) setState(() => _error = _errorText(e)); } finally { if (mounted) setState(() => _loading = false); } }
  Future<void> _save() async { setState(() => _saving = true); try { await ref.read(teamRepositoryProvider).setLeader(widget.team.id, _leaderId, _reason.text); if (mounted) Navigator.pop(context, true); } catch (e) { if (mounted) setState(() => _error = _errorText(e)); } finally { if (mounted) setState(() => _saving = false); } }
  @override Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Appoint Team Leader')), body: _loading ? const Center(child: CircularProgressIndicator()) : ListView(padding: const EdgeInsets.all(20), children: [
    Text(widget.team.name, style: const TextStyle(fontSize: 19, fontWeight: FontWeight.bold)), const SizedBox(height: 16),
    DropdownButtonFormField<String?>(value: _leaderId, decoration: const InputDecoration(labelText: 'Team Leader', border: OutlineInputBorder()), items: [const DropdownMenuItem<String?>(value: null, child: Text('Remove current leader')), ..._people.map((p) => DropdownMenuItem<String?>(value: p['id'].toString(), child: Text('${p['name']} (${p['agent_code'] ?? 'No code'})')))], onChanged: (v) => setState(() => _leaderId = v)),
    const SizedBox(height: 14), TextField(controller: _reason, minLines: 2, maxLines: 3, decoration: const InputDecoration(labelText: 'Reason for change', border: OutlineInputBorder())),
    if (_error != null) ...[const SizedBox(height: 12), Text(_error!, style: const TextStyle(color: Colors.red))],
    const SizedBox(height: 20), FilledButton(onPressed: _saving ? null : _save, style: FilledButton.styleFrom(backgroundColor: _brand), child: Text(_saving ? 'Saving…' : 'Save Team Leader')),
  ]));
}

class TransferEmployeeScreen extends ConsumerStatefulWidget {
  const TransferEmployeeScreen({super.key, this.destinationTeamId});
  final String? destinationTeamId;
  @override ConsumerState<TransferEmployeeScreen> createState() => _TransferEmployeeScreenState();
}
class _TransferEmployeeScreenState extends ConsumerState<TransferEmployeeScreen> {
  List<Map<String, dynamic>> _people = []; List<Team> _teams = []; bool _loading = true; bool _saving = false; String? _employeeId; String? _teamId; String? _error; final _reason = TextEditingController();
  @override void initState() { super.initState(); _teamId = widget.destinationTeamId; _load(); }
  @override void dispose() { _reason.dispose(); super.dispose(); }
  Future<void> _load() async {
    try {
      final people = await ref.read(teamRepositoryProvider).eligibleEmployees();
      final teams = await ref.read(teamRepositoryProvider).list();
      if (mounted) setState(() { _people = people.where((p) => p['role'] != 'team_leader').toList(); _teams = teams.where((t) => t.status == TeamStatus.active).toList(); });
    } catch (e) { if (mounted) setState(() => _error = _errorText(e)); }
    finally { if (mounted) setState(() => _loading = false); }
  }
  Future<void> _save() async {
    if (_employeeId == null || _teamId == null || _reason.text.trim().length < 3) { setState(() => _error = 'Select an employee and destination team, and enter a reason of at least 3 characters.'); return; }
    setState(() { _saving = true; _error = null; });
    try { await ref.read(teamRepositoryProvider).transferEmployee(employeeId: _employeeId!, destinationTeamId: _teamId, reason: _reason.text); if (mounted) Navigator.pop(context, true); }
    catch (e) { if (mounted) setState(() => _error = _errorText(e)); }
    finally { if (mounted) setState(() => _saving = false); }
  }
  @override Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Transfer Employee')), body: _loading ? const Center(child: CircularProgressIndicator()) : ListView(padding: const EdgeInsets.all(20), children: [
    DropdownButtonFormField<String>(value: _employeeId, decoration: const InputDecoration(labelText: 'Employee to transfer', border: OutlineInputBorder()), items: _people.map((p) => DropdownMenuItem(value: p['id'].toString(), child: Text('${p['name']} • ${p['agent_code'] ?? ''}'))).toList(), onChanged: (v) => setState(() => _employeeId = v)),
    const SizedBox(height: 14), DropdownButtonFormField<String>(value: _teamId, decoration: const InputDecoration(labelText: 'Destination Team', border: OutlineInputBorder()), items: _teams.map((t) => DropdownMenuItem(value: t.id, child: Text(t.name))).toList(), onChanged: (v) => setState(() => _teamId = v)),
    const SizedBox(height: 14), TextField(controller: _reason, minLines: 2, maxLines: 3, decoration: const InputDecoration(labelText: 'Transfer reason', border: OutlineInputBorder())),
    if (_error != null) ...[const SizedBox(height: 12), Text(_error!, style: const TextStyle(color: Colors.red))],
    const SizedBox(height: 20), FilledButton(onPressed: _saving ? null : _save, style: FilledButton.styleFrom(backgroundColor: _brand), child: Text(_saving ? 'Transferring…' : 'Transfer Employee')),
  ]));
}

class TeamMembersScreen extends ConsumerWidget {
  const TeamMembersScreen({super.key, required this.teamId});
  final String teamId;
  @override Widget build(BuildContext context, WidgetRef ref) => Scaffold(appBar: AppBar(title: const Text('Team Members')), body: ref.watch(teamMembersProvider(teamId)).when(
    loading: () => const Center(child: CircularProgressIndicator()),
    error: (e, _) => _ErrorPanel(message: _error(e), retry: () => ref.invalidate(teamMembersProvider(teamId))),
    data: (members) => members.isEmpty ? const _EmptyPanel('No current team members.') : ListView.separated(
      padding: const EdgeInsets.all(12), itemCount: members.length, separatorBuilder: (_, __) => const Divider(height: 1),
      itemBuilder: (context, i) { final p = members[i]; return ListTile(leading: CircleAvatar(child: Text((p['name'] ?? '?').toString().substring(0, 1).toUpperCase())), title: Text((p['name'] ?? '').toString()), subtitle: Text('${p['agent_code'] ?? ''} • ${p['phone'] ?? ''}'), trailing: Text((p['role'] ?? '').toString().replaceAll('_', ' '))); },
    ),
  ));
}

class TeamStatisticsScreen extends ConsumerStatefulWidget {
  const TeamStatisticsScreen({super.key, required this.teamId});
  final String teamId;
  @override ConsumerState<TeamStatisticsScreen> createState() => _TeamStatisticsScreenState();
}
class _TeamStatisticsScreenState extends ConsumerState<TeamStatisticsScreen> {
  Future<Team>? _future;
  @override void initState() { super.initState(); _future = _load(); }
  Future<Team> _load() async { final repo = ref.read(teamRepositoryProvider); final team = await repo.get(widget.teamId); return repo.statistics(team); }
  @override Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Team Statistics')), body: FutureBuilder<Team>(future: _future, builder: (context, s) {
    if (s.connectionState != ConnectionState.done) return const Center(child: CircularProgressIndicator());
    if (s.hasError) return _ErrorPanel(message: _error(s.error!), retry: () => setState(() => _future = _load()));
    final team = s.requireData;
    return ListView(padding: const EdgeInsets.all(16), children: [
      Text('${team.name} • Current month', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)), const SizedBox(height: 14),
      GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: 2, mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.25, children: [
        _StatCard('Employees', '${team.employeeCount}', Icons.people_alt_outlined),
        _StatCard('Verified Activations', '${team.activationCount}', Icons.verified_outlined),
        _StatCard('Sales Quantity', '${team.salesQuantity}', Icons.trending_up),
        _StatCard('Sales Amount', 'Rs. ${team.salesAmount.toStringAsFixed(2)}', Icons.payments_outlined),
        _StatCard('Present / Late', '${team.presentCount}', Icons.fact_check_outlined),
        _StatCard('Attendance Records', '${team.attendanceCount}', Icons.calendar_month_outlined),
      ]),
      const SizedBox(height: 14), const Text('Attendance summary uses the current month. Sales and activation figures are read from live database records and remain subject to existing Supabase policies.', style: TextStyle(color: Colors.black54, fontSize: 12, height: 1.4)),
    ]);
  }));
}

class TeamHistoryScreen extends ConsumerWidget {
  const TeamHistoryScreen({super.key, required this.teamId, this.leaderHistory = false});
  final String teamId; final bool leaderHistory;
  @override Widget build(BuildContext context, WidgetRef ref) {
    final data = leaderHistory ? ref.watch(teamLeaderHistoryProvider(teamId)) : ref.watch(teamTransferHistoryProvider(teamId));
    return Scaffold(appBar: AppBar(title: Text(leaderHistory ? 'Team Leader History' : 'Team Transfer History')), body: data.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => _ErrorPanel(message: _error(e), retry: () { if (leaderHistory) { ref.invalidate(teamLeaderHistoryProvider(teamId)); } else { ref.invalidate(teamTransferHistoryProvider(teamId)); } }),
      data: (rows) => rows.isEmpty ? const _EmptyPanel('No history has been recorded yet.') : ListView.separated(
        padding: const EdgeInsets.all(12), itemCount: rows.length, separatorBuilder: (_, __) => const Divider(),
        itemBuilder: (context, i) {
          final r = rows[i];
          final old = r['previous_team'] is Map ? (r['previous_team'] as Map)['name'] : r['previous_leader'] is Map ? (r['previous_leader'] as Map)['name'] : null;
          final next = r['new_team'] is Map ? (r['new_team'] as Map)['name'] : r['new_leader'] is Map ? (r['new_leader'] as Map)['name'] : null;
          final person = r['employee'] is Map ? (r['employee'] as Map)['name'] : null;
          return ListTile(leading: Icon(leaderHistory ? Icons.manage_history : Icons.swap_horiz, color: _brand),
            title: Text(leaderHistory ? '${old ?? 'No previous leader'} → ${next ?? 'No leader'}' : '${person ?? 'Employee'}: ${old ?? 'Unassigned'} → ${next ?? 'Unassigned'}'),
            subtitle: Text('${r['reason'] ?? 'Recorded change'} • ${r['changed_at'] ?? r['transferred_at'] ?? ''}'));
        },
      ),
    ));
  }
}

class _ActionTile extends StatelessWidget {
  const _ActionTile(this.icon, this.title, this.subtitle, this.onTap);
  final IconData icon; final String title, subtitle; final VoidCallback onTap;
  @override Widget build(BuildContext context) => Card(child: ListTile(leading: Icon(icon, color: _brand), title: Text(title), subtitle: Text(subtitle), trailing: const Icon(Icons.chevron_right), onTap: onTap));
}
class _Metric extends StatelessWidget {
  const _Metric(this.label, this.value, this.icon);
  final String label, value; final IconData icon;
  @override Widget build(BuildContext context) => Column(children: [Icon(icon, color: _brand), const SizedBox(height: 6), Text(value, style: const TextStyle(fontWeight: FontWeight.bold)), Text(label, style: const TextStyle(color: Colors.black54, fontSize: 12))]);
}
class _StatCard extends StatelessWidget {
  const _StatCard(this.title, this.value, this.icon);
  final String title, value; final IconData icon;
  @override Widget build(BuildContext context) => Card(child: Padding(padding: const EdgeInsets.all(14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [Icon(icon, color: _brand), const SizedBox(height: 10), Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis), Text(title, style: const TextStyle(color: Colors.black54))])));
}
class _StatusChip extends StatelessWidget {
  const _StatusChip(this.status); final TeamStatus status;
  @override Widget build(BuildContext context) => Chip(label: Text(status.label, style: const TextStyle(fontSize: 11)), visualDensity: VisualDensity.compact, backgroundColor: status == TeamStatus.active ? Colors.green.shade50 : status == TeamStatus.inactive ? Colors.orange.shade50 : Colors.grey.shade200, side: BorderSide.none);
}
class _ErrorPanel extends StatelessWidget {
  const _ErrorPanel({required this.message, required this.retry});
  final String message; final VoidCallback retry;
  @override Widget build(BuildContext context) => Padding(padding: const EdgeInsets.all(24), child: Column(children: [const Icon(Icons.error_outline, color: Colors.red, size: 36), const SizedBox(height: 8), Text(message, textAlign: TextAlign.center), const SizedBox(height: 12), OutlinedButton(onPressed: retry, child: const Text('Retry'))]));
}
class _EmptyPanel extends StatelessWidget {
  const _EmptyPanel(this.message); final String message;
  @override Widget build(BuildContext context) => Padding(padding: const EdgeInsets.all(32), child: Column(children: [const Icon(Icons.groups_outlined, size: 40, color: Colors.black45), const SizedBox(height: 10), Text(message, textAlign: TextAlign.center)]));
}
String _error(Object e) => e.toString().replaceFirst('Exception: ', '');
String _errorText(Object e) => _error(e);
String _date(DateTime? d) => d == null ? '—' : '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
