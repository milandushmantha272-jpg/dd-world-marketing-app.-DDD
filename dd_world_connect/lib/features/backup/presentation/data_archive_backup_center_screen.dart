import 'dart:typed_data';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../authentication/data/auth_repository.dart';
import '../../authentication/domain/employee_profile.dart';

class DataArchiveBackupCenterScreen extends StatefulWidget {
  const DataArchiveBackupCenterScreen({super.key, required this.profile});
  final EmployeeProfile profile;
  @override
  State<DataArchiveBackupCenterScreen> createState() => _DataArchiveBackupCenterScreenState();
}

class _DataArchiveBackupCenterScreenState extends State<DataArchiveBackupCenterScreen> with SingleTickerProviderStateMixin {
  final repo = BackupArchiveRepository();
  late final TabController tabs;
  late Future<List<Map<String, dynamic>>> history;
  bool busy = false;
  String? message;
  @override
  void initState() { super.initState(); tabs = TabController(length: 4, vsync: this); history = repo.history(); }
  @override
  void dispose() { tabs.dispose(); super.dispose(); }
  void refresh() => setState(() => history = repo.history());
  void notify(String value) { if (mounted) setState(() => message = value); }

  Future<void> createBackup() async {
    if (busy) return;
    setState(() { busy = true; message = null; });
    try {
      final result = await repo.createYearlyBackup(DateTime.now().year);
      notify('Verified backup created. ${result['total_rows'] ?? 0} database rows included.');
      refresh(); tabs.animateTo(3);
    } catch (e) { notify(e.toString()); }
    finally { if (mounted) setState(() => busy = false); }
  }

  Future<void> archive(Map<String, dynamic> backup) async {
    if (busy || backup['status'] != 'verified') return;
    setState(() { busy = true; message = null; });
    try {
      final auth = AuthRepository();
      await auth.sendPhoneOtp(widget.profile.phoneE164);
      if (!mounted) return;
      final controller = TextEditingController();
      String? code;
      try {
        code = await showDialog<String>(context: context, barrierDismissible: false, builder: (ctx) => AlertDialog(
          title: const Text('Owner OTP confirmation'),
          content: TextField(controller: controller, autofocus: true, maxLength: 6, keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Enter 6-digit OTP', border: OutlineInputBorder())),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            FilledButton(onPressed: () => Navigator.pop(ctx, controller.text.trim()), child: const Text('Verify')),
          ],
        ));
      } finally { controller.dispose(); }
      if (code == null || code.isEmpty) { notify('Archive cancelled. No records deleted.'); return; }
      await auth.verifyPhoneOtp(inputPhone: widget.profile.phoneE164, token: code);
      final result = await repo.archive(backup['id'].toString());
      notify('Archive completed. ${result['archived_count'] ?? 0} rows archived.');
      refresh();
    } catch (e) { notify(e.toString()); }
    finally { if (mounted) setState(() => busy = false); }
  }

  Future<void> restore(Map<String, dynamic> backup) async {
    if (busy) return;
    final ok = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Restore archived data?'),
      content: const Text('Original records will be reinserted. Existing rows with matching primary keys will not be overwritten.'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
        FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Restore')),
      ],
    ));
    if (ok != true) return;
    setState(() { busy = true; message = null; });
    try { final result = await repo.restore(backup['id'].toString()); notify('Restore completed. ${result['restored_count'] ?? 0} rows restored.'); refresh(); }
    catch (e) { notify(e.toString()); }
    finally { if (mounted) setState(() => busy = false); }
  }

  Future<void> download(String? path, String filename) async {
    if (busy || path == null || path.isEmpty) return;
    setState(() { busy = true; message = null; });
    try {
      final bytes = await repo.download(path);
      final saved = await FilePicker.platform.saveFile(dialogTitle: 'Save DD WORLD backup', fileName: filename, bytes: bytes);
      notify(saved == null ? 'Download cancelled.' : 'File saved locally.');
    } catch (e) { notify(e.toString()); }
    finally { if (mounted) setState(() => busy = false); }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.profile.role != EmployeeRole.owner) return const Scaffold(body: Center(child: Text('Owner access only.')));
    return Scaffold(
      appBar: AppBar(title: const Text('Data Archive & Backup'), bottom: TabBar(controller: tabs, isScrollable: true, tabs: const [
        Tab(text: 'Dashboard'), Tab(text: 'Archive'), Tab(text: 'Restore'), Tab(text: 'History'),
      ])),
      body: Column(children: [
        if (busy) const LinearProgressIndicator(minHeight: 2),
        if (message != null) ListTile(dense: true, title: Text(message!), trailing: IconButton(onPressed: () => setState(() => message = null), icon: const Icon(Icons.close))),
        Expanded(child: FutureBuilder<List<Map<String, dynamic>>>(future: history, builder: (context, snap) {
          final rows = snap.data ?? <Map<String, dynamic>>[];
          return TabBarView(controller: tabs, children: [
            _Dashboard(rows: rows, busy: busy, create: createBackup, refresh: refresh),
            _Archive(rows: rows, busy: busy, archive: archive),
            _Restore(rows: rows, busy: busy, restore: restore),
            _History(rows: rows, busy: busy, download: download, refresh: refresh),
          ]);
        })),
      ]),
    );
  }
}

class BackupArchiveRepository {
  BackupArchiveRepository({SupabaseClient? client}) : client = client ?? Supabase.instance.client;
  final SupabaseClient client;
  Future<List<Map<String, dynamic>>> history() async {
    final data = await client.from('backup_history').select().order('created_at', ascending: false).limit(100);
    return data.map((r) => Map<String, dynamic>.from(r)).toList();
  }
  Future<Map<String, dynamic>> createYearlyBackup(int year) async {
    final response = await client.functions.invoke('data-archive-backup', body: {'backup_year': year});
    if (response.status < 200 || response.status >= 300) throw Exception(_error(response.data));
    if (response.data is! Map) throw Exception('Invalid backup response.');
    final result = Map<String, dynamic>.from(response.data as Map);
    if (result['success'] != true || result['status'] != 'verified') throw Exception(_error(result));
    return result;
  }
  Future<Map<String, dynamic>> archive(String id) async {
    final r = await client.rpc('archive_old_records', params: {'p_backup_id': id});
    if (r is! Map) throw Exception('Invalid archive response.');
    return Map<String, dynamic>.from(r);
  }
  Future<Map<String, dynamic>> restore(String id) async {
    final r = await client.rpc('restore_archive_batch', params: {'p_batch_id': id});
    if (r is! Map) throw Exception('Invalid restore response.');
    return Map<String, dynamic>.from(r);
  }
  Future<Uint8List> download(String path) => client.storage.from('dd-backups').download(path);
  String _error(Object? value) => value is Map ? (value['error'] ?? value['message'] ?? 'Backup failed').toString() : (value?.toString() ?? 'Backup failed');
}

class _Dashboard extends StatelessWidget {
  const _Dashboard({required this.rows, required this.busy, required this.create, required this.refresh});
  final List<Map<String, dynamic>> rows; final bool busy; final VoidCallback create, refresh;
  @override
  Widget build(BuildContext context) {
    final done = rows.where((r) => r['status'] == 'verified').toList();
    return ListView(padding: const EdgeInsets.all(16), children: [
      const _Info('Owner-only backup center', 'Creates a full public database snapshot. Excel, PDF and ZIP exports are private and SHA-256 verified before the backup is marked complete.'),
      _Metric('Verified backups', '${done.length}'),
      _Metric('Latest backup', done.isEmpty ? 'Not created' : _date(done.first['completed_at'])),
      FilledButton.icon(onPressed: busy ? null : create, icon: const Icon(Icons.backup), label: const Text('Create Yearly Backup')),
      OutlinedButton.icon(onPressed: refresh, icon: const Icon(Icons.refresh), label: const Text('Refresh')),
      const Text('Supabase Auth identities and binary files in Storage buckets are not included in this database snapshot.', style: TextStyle(fontSize: 12, color: Colors.grey)),
    ]);
  }
}

class _Archive extends StatelessWidget {
  const _Archive({required this.rows, required this.busy, required this.archive});
  final List<Map<String, dynamic>> rows; final bool busy; final Future<void> Function(Map<String, dynamic>) archive;
  @override
  Widget build(BuildContext context) {
    final eligible = rows.where((r) {
      final m = r['manifest']; final n = m is Map ? int.tryParse('${m['archive_candidate_rows']}') ?? 0 : 0;
      return r['status'] == 'verified' && n > 0 && r['archived_at'] == null;
    });
    return ListView(padding: const EdgeInsets.all(16), children: [
      const _Info('Archive records older than 12 months', 'Owner OTP is required immediately before deletion. Only rows exactly matching the verified backup snapshot are deleted. Changed rows remain live.'),
      if (eligible.isEmpty) const Text('No pending archive batches. Create a verified backup first.'),
      for (final b in eligible) Card(child: ListTile(
        title: Text('Backup year ${b['backup_year']}'),
        subtitle: Text('${(b['manifest'] as Map?)?['archive_candidate_rows'] ?? 0} eligible rows • ${_date(b['completed_at'])}'),
        trailing: FilledButton(onPressed: busy ? null : () => archive(b), child: const Text('Archive')),
      )),
    ]);
  }
}

class _Restore extends StatelessWidget {
  const _Restore({required this.rows, required this.busy, required this.restore});
  final List<Map<String, dynamic>> rows; final bool busy; final Future<void> Function(Map<String, dynamic>) restore;
  @override
  Widget build(BuildContext context) {
    final batches = rows.where((r) => r['status'] == 'verified' && (int.tryParse('${r['archived_count'] ?? 0}') ?? 0) > 0);
    return ListView(padding: const EdgeInsets.all(16), children: [
      const _Info('Restore Center', 'Restores archived records from the original snapshot. Existing rows with the same primary key are not overwritten.'),
      if (batches.isEmpty) const Text('No archived batches available.'),
      for (final b in batches) Card(child: ListTile(
        title: Text('Archive batch ${b['backup_year']}'),
        subtitle: Text('${b['archived_count']} rows • ${_date(b['archived_at'])}'),
        trailing: FilledButton.tonal(onPressed: busy ? null : () => restore(b), child: const Text('Restore')),
      )),
    ]);
  }
}

class _History extends StatelessWidget {
  const _History({required this.rows, required this.busy, required this.download, required this.refresh});
  final List<Map<String, dynamic>> rows; final bool busy; final Future<void> Function(String?, String) download; final VoidCallback refresh;
  @override
  Widget build(BuildContext context) => ListView(padding: const EdgeInsets.all(16), children: [
    Row(children: [const Expanded(child: Text('Backup History', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18))), IconButton(onPressed: refresh, icon: const Icon(Icons.refresh))]),
    if (rows.isEmpty) const Text('No backup history.'),
    for (final b in rows) Card(child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Year ${b['backup_year']} • ${(b['status'] ?? 'unknown').toString().toUpperCase()}', style: const TextStyle(fontWeight: FontWeight.bold)),
      Text('${_date(b['created_at'])} • ${b['total_rows'] ?? 0} rows'),
      if (b['failure_message'] != null) Text(b['failure_message'].toString(), style: const TextStyle(color: Colors.red)),
      if (b['status'] == 'verified') Wrap(spacing: 6, children: [
        OutlinedButton(onPressed: busy ? null : () => download(b['zip_path']?.toString(), 'dd-world-${b['backup_year']}.zip'), child: const Text('ZIP')),
        OutlinedButton(onPressed: busy ? null : () => download(b['excel_path']?.toString(), 'dd-world-${b['backup_year']}.xlsx'), child: const Text('Excel')),
        OutlinedButton(onPressed: busy ? null : () => download(b['pdf_path']?.toString(), 'dd-world-${b['backup_year']}.pdf'), child: const Text('PDF')),
      ]),
    ]))),
  ]);
}

class _Info extends StatelessWidget {
  const _Info(this.title, this.body); final String title, body;
  @override
  Widget build(BuildContext context) => Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    Text(title, style: const TextStyle(fontWeight: FontWeight.bold)), const SizedBox(height: 6), Text(body, style: const TextStyle(height: 1.45)),
  ])));
}
class _Metric extends StatelessWidget {
  const _Metric(this.label, this.value); final String label, value;
  @override
  Widget build(BuildContext context) => Card(child: ListTile(title: Text(label), trailing: Text(value, style: const TextStyle(fontWeight: FontWeight.bold))));
}
String _date(Object? value) {
  if (value == null) return '—';
  final d = DateTime.tryParse(value.toString())?.toLocal();
  if (d == null) return value.toString();
  return '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')} ${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
}
