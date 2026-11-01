import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../authentication/domain/employee_profile.dart';
import '../data/data_archive_repository.dart';

class BackupCenterDashboardScreen extends StatefulWidget {
  const BackupCenterDashboardScreen({super.key, required this.profile});
  final EmployeeProfile profile;
  @override
  State<BackupCenterDashboardScreen> createState() => _BackupCenterDashboardScreenState();
}

class _BackupCenterDashboardScreenState extends State<BackupCenterDashboardScreen> {
  final repo = DataArchiveRepository();
  List<Map<String, dynamic>> backups = [];
  bool busy = false;
  String? message;
  bool success = true;
  bool get owner => widget.profile.role == EmployeeRole.owner;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    if (!owner) return;
    try {
      final rows = await repo.history();
      if (mounted) setState(() => backups = rows);
    } catch (e) {
      if (mounted) setState(() { message = e.toString(); success = false; });
    }
  }

  Future<void> _create() async {
    if (!owner || busy) return;
    setState(() { busy = true; message = null; });
    try {
      final result = await repo.createYearlyBackup(DateTime.now().year);
      if (mounted) setState(() { success = true; message = 'Verified backup created. Rows: ${result['total_rows'] ?? 0}'; });
      await _load();
    } catch (e) {
      if (mounted) setState(() { success = false; message = e.toString(); });
    } finally { if (mounted) setState(() => busy = false); }
  }

  void _push(Widget page) => Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => page));

  @override
  Widget build(BuildContext context) {
    if (!owner) return const _OwnerOnly();
    final verified = backups.where((b) => b['status'] == 'verified').length;
    final archived = backups.fold<int>(0, (n, b) => n + ((b['archived_count'] as num?)?.toInt() ?? 0));
    return Scaffold(
      appBar: AppBar(title: const Text('Backup Dashboard')),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(padding: const EdgeInsets.all(16), children: [
          Card(child: Padding(padding: const EdgeInsets.all(18), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('DD WORLD CONNECT DATA VAULT', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Owner-only yearly backup, verified archiving, restore and local export controls.'),
            const SizedBox(height: 18),
            Row(children: [
              Expanded(child: _Metric('Verified backups', '$verified')),
              Expanded(child: _Metric('Archived rows', '$archived')),
              Expanded(child: _Metric('Backup batches', '${backups.length}')),
            ]),
            const SizedBox(height: 16),
            SizedBox(width: double.infinity, child: FilledButton.icon(
              onPressed: busy ? null : _create,
              icon: busy ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(Icons.backup),
              label: Text(busy ? 'Creating and verifying…' : 'Create yearly backup'),
            )),
          ]))),
          if (message != null) _Message(message!, success),
          _NavCard('Archive Center', 'Archive records older than 12 months after a verified backup.', Icons.archive, () => _push(ArchiveCenterScreen(profile: widget.profile))),
          _NavCard('Restore Center', 'Restore archived rows from a verified archive batch.', Icons.settings_backup_restore, () => _push(RestoreCenterScreen(profile: widget.profile))),
          _NavCard('Backup History', 'Download ZIP, Excel and PDF; review archive logs.', Icons.history, () => _push(BackupHistoryScreen(profile: widget.profile))),
          const _Notice('The ZIP contains the application database snapshot and exports. Full Supabase project recovery (schema, Auth, Storage objects and configuration) must use Supabase platform backup restore or a tested CLI restore.'),
        ]),
      ),
    );
  }
}

class ArchiveCenterScreen extends StatefulWidget {
  const ArchiveCenterScreen({super.key, required this.profile});
  final EmployeeProfile profile;
  @override
  State<ArchiveCenterScreen> createState() => _ArchiveCenterScreenState();
}

class _ArchiveCenterScreenState extends State<ArchiveCenterScreen> {
  final repo = DataArchiveRepository();
  List<Map<String, dynamic>> backups = [];
  bool loading = true, busy = false;
  String? message;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final rows = await repo.history();
      if (mounted) setState(() { backups = rows.where((b) => b['status'] == 'verified').toList(); loading = false; });
    } catch (e) { if (mounted) setState(() { message = e.toString(); loading = false; }); }
  }

  Future<void> _verifyOtp() async {
    final phone = widget.profile.phoneE164;
    final auth = Supabase.instance.client.auth;
    await auth.signInWithOtp(phone: phone, shouldCreateUser: false);
    if (!mounted) throw StateError('Screen closed.');
    final controller = TextEditingController();
    final token = await showDialog<String>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Text('Owner OTP confirmation'),
        content: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('A one-time code was sent to $phone. Enter it to authorize removal of archived rows from the live database.'),
          const SizedBox(height: 12),
          TextField(controller: controller, keyboardType: TextInputType.number, maxLength: 6, autofillHints: const [AutofillHints.oneTimeCode], decoration: const InputDecoration(labelText: '6-digit OTP')),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(ctx, controller.text.trim()), child: const Text('Verify')),
        ],
      ),
    );
    controller.dispose();
    if (token == null || !RegExp(r'^\d{6}.hasMatch(token)) throw StateError('OTP confirmation was cancelled or invalid.');
    await auth.verifyOTP(phone: phone, token: token, type: OtpType.sms);
  }

  Future<void> _archive(Map<String, dynamic> backup) async {
    if (widget.profile.role != EmployeeRole.owner || busy) return;
    final confirm = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Archive records older than 12 months?'),
      content: const Text('Only rows that exactly match the verified backup snapshot can be deleted. Rows with live dependencies or changed after backup are skipped. Owner OTP confirmation is required.'),
      actions: [TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')), FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Continue'))],
    ));
    if (confirm != true) return;
    setState(() { busy = true; message = null; });
    try {
      await _verifyOtp();
      final result = await repo.archive(backup['id'].toString());
      if (mounted) setState(() => message = 'Archive complete: ${result['archived_count'] ?? 0} records archived.');
      await _load();
    } catch (e) { if (mounted) setState(() => message = e.toString()); }
    finally { if (mounted) setState(() => busy = false); }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.profile.role != EmployeeRole.owner) return const _OwnerOnly();
    return Scaffold(appBar: AppBar(title: const Text('Archive Center')), body: loading
      ? const Center(child: CircularProgressIndicator())
      : RefreshIndicator(onRefresh: _load, child: ListView(padding: const EdgeInsets.all(16), children: [
          const _Notice('A verified backup is mandatory. The database archives only records at least 12 months old, verifies each row against the snapshot and protects parent rows with dependent records.'),
          if (message != null) _Message(message!, !message!.toLowerCase().contains('exception')),
          if (backups.isEmpty) const _Empty('No verified backups. Create a yearly backup first.'),
          ...backups.map((b) => Card(child: ListTile(
            leading: const Icon(Icons.verified_user, color: Colors.green),
            title: Text('Verified backup • ${b['backup_year']}'),
            subtitle: Text('Rows: ${b['total_rows'] ?? 0} • Previously archived: ${b['archived_count'] ?? 0}'),
            trailing: IconButton(onPressed: busy ? null : () => _archive(b), icon: const Icon(Icons.archive)),
          ))),
          if (busy) const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator())),
        ])));
  }
}

class RestoreCenterScreen extends StatefulWidget {
  const RestoreCenterScreen({super.key, required this.profile});
  final EmployeeProfile profile;
  @override
  State<RestoreCenterScreen> createState() => _RestoreCenterScreenState();
}

class _RestoreCenterScreenState extends State<RestoreCenterScreen> {
  final repo = DataArchiveRepository();
  List<Map<String, dynamic>> backups = [];
  bool loading = true, busy = false;
  String? message;

  @override
  void initState() { super.initState(); _load(); }
  Future<void> _load() async {
    try {
      final rows = await repo.history();
      if (mounted) setState(() { backups = rows.where((b) => b['status'] == 'verified' && ((b['archived_count'] as num?)?.toInt() ?? 0) > 0).toList(); loading = false; });
    } catch (e) { if (mounted) setState(() { message = e.toString(); loading = false; }); }
  }

  Future<void> _restore(Map<String, dynamic> backup) async {
    if (widget.profile.role != EmployeeRole.owner || busy) return;
    final ok = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Restore archive batch?'),
      content: const Text('This restores archived records to their original tables. Existing primary-key conflicts are skipped. This is not a full project restore.'),
      actions: [TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')), FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Restore'))],
    ));
    if (ok != true) return;
    setState(() { busy = true; message = null; });
    try {
      final result = await repo.restore(backup['id'].toString());
      if (mounted) setState(() => message = 'Restore complete: ${result['restored_count'] ?? 0} records restored.');
      await _load();
    } catch (e) { if (mounted) setState(() => message = e.toString()); }
    finally { if (mounted) setState(() => busy = false); }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.profile.role != EmployeeRole.owner) return const _OwnerOnly();
    return Scaffold(appBar: AppBar(title: const Text('Restore Center')), body: loading
      ? const Center(child: CircularProgressIndicator())
      : RefreshIndicator(onRefresh: _load, child: ListView(padding: const EdgeInsets.all(16), children: [
          const _Notice('This restores application rows stored in archive_records. Full database, schema, Auth and Storage recovery requires Supabase platform restore or CLI.'),
          if (message != null) _Message(message!, !message!.toLowerCase().contains('exception')),
          if (backups.isEmpty) const _Empty('No archived batches available.'),
          ...backups.map((b) => Card(child: ListTile(
            leading: const Icon(Icons.settings_backup_restore),
            title: Text('Archive batch • ${b['backup_year']}'),
            subtitle: Text('${b['archived_count']} archived rows'),
            trailing: IconButton(onPressed: busy ? null : () => _restore(b), icon: const Icon(Icons.restore)),
          ))),
          if (busy) const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator())),
        ])));
  }
}

class BackupHistoryScreen extends StatefulWidget {
  const BackupHistoryScreen({super.key, required this.profile});
  final EmployeeProfile profile;
  @override
  State<BackupHistoryScreen> createState() => _BackupHistoryScreenState();
}

class _BackupHistoryScreenState extends State<BackupHistoryScreen> {
  final repo = DataArchiveRepository();
  List<Map<String, dynamic>> backups = [], logs = [];
  bool loading = true;
  String? message;
  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final data = await Future.wait([repo.history(), repo.logs()]);
      if (mounted) setState(() { backups = data[0]; logs = data[1]; loading = false; });
    } catch (e) { if (mounted) setState(() { message = e.toString(); loading = false; }); }
  }

  Future<void> _download(Map<String, dynamic> backup, String format) async {
    final path = backup['${format}_path']?.toString();
    if (path == null || path.isEmpty) return;
    final extension = format == 'excel' ? 'xlsx' : format;
    try {
      final saved = await repo.download(path, 'DD-WORLD-${backup['backup_year']}-$format.$extension', extension);
      if (mounted) setState(() => message = saved == null ? 'Download cancelled.' : 'Backup saved to device.');
    } catch (e) { if (mounted) setState(() => message = 'Download failed: $e'); }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.profile.role != EmployeeRole.owner) return const _OwnerOnly();
    return Scaffold(appBar: AppBar(title: const Text('Backup History')), body: loading
      ? const Center(child: CircularProgressIndicator())
      : RefreshIndicator(onRefresh: _load, child: ListView(padding: const EdgeInsets.all(16), children: [
          if (message != null) _Message(message!, !message!.toLowerCase().contains('failed')),
          const Text('Yearly backups', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          if (backups.isEmpty) const _Empty('No backup history found.'),
          ...backups.map((b) => Card(child: Padding(padding: const EdgeInsets.all(14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [Expanded(child: Text('${b['backup_year']} • ${b['status']}'.toUpperCase(), style: const TextStyle(fontWeight: FontWeight.bold))), Text('${b['total_rows'] ?? 0} rows')]),
            const SizedBox(height: 6),
            Text('Created: ${_date(b['created_at'])} • Archived: ${b['archived_count'] ?? 0}'),
            if (b['failure_message'] != null) Text(b['failure_message'].toString(), style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 8),
            Wrap(spacing: 8, children: [
              _Download('ZIP', Icons.folder_zip, b['zip_path'] != null ? () => _download(b, 'zip') : null),
              _Download('Excel', Icons.table_chart, b['excel_path'] != null ? () => _download(b, 'excel') : null),
              _Download('PDF', Icons.picture_as_pdf, b['pdf_path'] != null ? () => _download(b, 'pdf') : null),
            ]),
            if (b['zip_sha256'] != null) SelectableText('SHA-256: ${b['zip_sha256']}', style: const TextStyle(fontSize: 10, color: Color(0xFF667085))),
          ])))),
          const SizedBox(height: 20),
          const Text('Archive audit logs', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          if (logs.isEmpty) const _Empty('No archive or restore actions recorded.'),
          ...logs.map((l) => Card(child: ListTile(
            leading: Icon(l['action'] == 'RESTORE' ? Icons.restore : Icons.archive_outlined),
            title: Text('${l['action']} • ${l['source_table']}'),
            subtitle: Text('${l['affected_count']} rows • ${l['status']} • ${_date(l['created_at'])}'),
          ))),
        ])));
  }
}

class _Metric extends StatelessWidget {
  const _Metric(this.label, this.value);
  final String label, value;
  @override
  Widget build(BuildContext context) => Column(children: [
    Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1F5AA6))),
    Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, color: Color(0xFF667085))),
  ]);
}

class _NavCard extends StatelessWidget {
  const _NavCard(this.title, this.subtitle, this.icon, this.onTap);
  final String title, subtitle;
  final IconData icon;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => Card(child: ListTile(leading: Icon(icon, color: const Color(0xFF1F5AA6)), title: Text(title), subtitle: Text(subtitle), trailing: const Icon(Icons.chevron_right), onTap: onTap));
}

class _Download extends StatelessWidget {
  const _Download(this.label, this.icon, this.onTap);
  final String label;
  final IconData icon;
  final VoidCallback? onTap;
  @override
  Widget build(BuildContext context) => OutlinedButton.icon(onPressed: onTap, icon: Icon(icon, size: 16), label: Text(label));
}

class _Message extends StatelessWidget {
  const _Message(this.text, this.success);
  final String text;
  final bool success;
  @override
  Widget build(BuildContext context) => Card(color: success ? const Color(0xFFEAF7EF) : const Color(0xFFFFF0EF), child: Padding(padding: const EdgeInsets.all(12), child: Text(text, style: TextStyle(color: success ? const Color(0xFF176B3A) : const Color(0xFFB42318)))));
}

class _Notice extends StatelessWidget {
  const _Notice(this.text);
  final String text;
  @override
  Widget build(BuildContext context) => Card(color: const Color(0xFFEFF5FC), child: Padding(padding: const EdgeInsets.all(14), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [const Icon(Icons.info_outline, color: Color(0xFF1F5AA6)), const SizedBox(width: 10), Expanded(child: Text(text, style: const TextStyle(fontSize: 12, height: 1.45)))])));
}

class _Empty extends StatelessWidget {
  const _Empty(this.text);
  final String text;
  @override
  Widget build(BuildContext context) => Padding(padding: const EdgeInsets.all(24), child: Text(text, textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFF667085))));
}

class _OwnerOnly extends StatelessWidget {
  const _OwnerOnly();
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Restricted access')), body: const Center(child: Text('This module is available to the Owner only.')));
}

String _date(Object? value) {
  final date = value == null ? null : DateTime.tryParse(value.toString())?.toLocal();
  if (date == null) return '—';
  return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')} ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
}
).hasMatch(token)) throw StateError('OTP confirmation was cancelled or invalid.');
    await auth.verifyOTP(phone: phone, token: token, type: OtpType.sms);
  }

  Future<void> _archive(Map<String, dynamic> backup) async {
    if (widget.profile.role != EmployeeRole.owner || busy) return;
    final confirm = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Archive records older than 12 months?'),
      content: const Text('Only rows that exactly match the verified backup snapshot can be deleted. Rows with live dependencies or changed after backup are skipped. Owner OTP confirmation is required.'),
      actions: [TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')), FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Continue'))],
    ));
    if (confirm != true) return;
    setState(() { busy = true; message = null; });
    try {
      await _verifyOtp();
      final result = await repo.archive(backup['id'].toString());
      if (mounted) setState(() => message = 'Archive complete: ${result['archived_count'] ?? 0} records archived.');
      await _load();
    } catch (e) { if (mounted) setState(() => message = e.toString()); }
    finally { if (mounted) setState(() => busy = false); }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.profile.role != EmployeeRole.owner) return const _OwnerOnly();
    return Scaffold(appBar: AppBar(title: const Text('Archive Center')), body: loading
      ? const Center(child: CircularProgressIndicator())
      : RefreshIndicator(onRefresh: _load, child: ListView(padding: const EdgeInsets.all(16), children: [
          const _Notice('A verified backup is mandatory. The database archives only records at least 12 months old, verifies each row against the snapshot and protects parent rows with dependent records.'),
          if (message != null) _Message(message!, !message!.toLowerCase().contains('exception')),
          if (backups.isEmpty) const _Empty('No verified backups. Create a yearly backup first.'),
          ...backups.map((b) => Card(child: ListTile(
            leading: const Icon(Icons.verified_user, color: Colors.green),
            title: Text('Verified backup • ${b['backup_year']}'),
            subtitle: Text('Rows: ${b['total_rows'] ?? 0} • Previously archived: ${b['archived_count'] ?? 0}'),
            trailing: IconButton(onPressed: busy ? null : () => _archive(b), icon: const Icon(Icons.archive)),
          ))),
          if (busy) const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator())),
        ])));
  }
}

class RestoreCenterScreen extends StatefulWidget {
  const RestoreCenterScreen({super.key, required this.profile});
  final EmployeeProfile profile;
  @override
  State<RestoreCenterScreen> createState() => _RestoreCenterScreenState();
}

class _RestoreCenterScreenState extends State<RestoreCenterScreen> {
  final repo = DataArchiveRepository();
  List<Map<String, dynamic>> backups = [];
  bool loading = true, busy = false;
  String? message;

  @override
  void initState() { super.initState(); _load(); }
  Future<void> _load() async {
    try {
      final rows = await repo.history();
      if (mounted) setState(() { backups = rows.where((b) => b['status'] == 'verified' && ((b['archived_count'] as num?)?.toInt() ?? 0) > 0).toList(); loading = false; });
    } catch (e) { if (mounted) setState(() { message = e.toString(); loading = false; }); }
  }

  Future<void> _restore(Map<String, dynamic> backup) async {
    if (widget.profile.role != EmployeeRole.owner || busy) return;
    final ok = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Restore archive batch?'),
      content: const Text('This restores archived records to their original tables. Existing primary-key conflicts are skipped. This is not a full project restore.'),
      actions: [TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')), FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Restore'))],
    ));
    if (ok != true) return;
    setState(() { busy = true; message = null; });
    try {
      final result = await repo.restore(backup['id'].toString());
      if (mounted) setState(() => message = 'Restore complete: ${result['restored_count'] ?? 0} records restored.');
      await _load();
    } catch (e) { if (mounted) setState(() => message = e.toString()); }
    finally { if (mounted) setState(() => busy = false); }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.profile.role != EmployeeRole.owner) return const _OwnerOnly();
    return Scaffold(appBar: AppBar(title: const Text('Restore Center')), body: loading
      ? const Center(child: CircularProgressIndicator())
      : RefreshIndicator(onRefresh: _load, child: ListView(padding: const EdgeInsets.all(16), children: [
          const _Notice('This restores application rows stored in archive_records. Full database, schema, Auth and Storage recovery requires Supabase platform restore or CLI.'),
          if (message != null) _Message(message!, !message!.toLowerCase().contains('exception')),
          if (backups.isEmpty) const _Empty('No archived batches available.'),
          ...backups.map((b) => Card(child: ListTile(
            leading: const Icon(Icons.settings_backup_restore),
            title: Text('Archive batch • ${b['backup_year']}'),
            subtitle: Text('${b['archived_count']} archived rows'),
            trailing: IconButton(onPressed: busy ? null : () => _restore(b), icon: const Icon(Icons.restore)),
          ))),
          if (busy) const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator())),
        ])));
  }
}

class BackupHistoryScreen extends StatefulWidget {
  const BackupHistoryScreen({super.key, required this.profile});
  final EmployeeProfile profile;
  @override
  State<BackupHistoryScreen> createState() => _BackupHistoryScreenState();
}

class _BackupHistoryScreenState extends State<BackupHistoryScreen> {
  final repo = DataArchiveRepository();
  List<Map<String, dynamic>> backups = [], logs = [];
  bool loading = true;
  String? message;
  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final data = await Future.wait([repo.history(), repo.logs()]);
      if (mounted) setState(() { backups = data[0]; logs = data[1]; loading = false; });
    } catch (e) { if (mounted) setState(() { message = e.toString(); loading = false; }); }
  }

  Future<void> _download(Map<String, dynamic> backup, String format) async {
    final path = backup['${format}_path']?.toString();
    if (path == null || path.isEmpty) return;
    final extension = format == 'excel' ? 'xlsx' : format;
    try {
      final saved = await repo.download(path, 'DD-WORLD-${backup['backup_year']}-$format.$extension', extension);
      if (mounted) setState(() => message = saved == null ? 'Download cancelled.' : 'Backup saved to device.');
    } catch (e) { if (mounted) setState(() => message = 'Download failed: $e'); }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.profile.role != EmployeeRole.owner) return const _OwnerOnly();
    return Scaffold(appBar: AppBar(title: const Text('Backup History')), body: loading
      ? const Center(child: CircularProgressIndicator())
      : RefreshIndicator(onRefresh: _load, child: ListView(padding: const EdgeInsets.all(16), children: [
          if (message != null) _Message(message!, !message!.toLowerCase().contains('failed')),
          const Text('Yearly backups', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          if (backups.isEmpty) const _Empty('No backup history found.'),
          ...backups.map((b) => Card(child: Padding(padding: const EdgeInsets.all(14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [Expanded(child: Text('${b['backup_year']} • ${b['status']}'.toUpperCase(), style: const TextStyle(fontWeight: FontWeight.bold))), Text('${b['total_rows'] ?? 0} rows')]),
            const SizedBox(height: 6),
            Text('Created: ${_date(b['created_at'])} • Archived: ${b['archived_count'] ?? 0}'),
            if (b['failure_message'] != null) Text(b['failure_message'].toString(), style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 8),
            Wrap(spacing: 8, children: [
              _Download('ZIP', Icons.folder_zip, b['zip_path'] != null ? () => _download(b, 'zip') : null),
              _Download('Excel', Icons.table_chart, b['excel_path'] != null ? () => _download(b, 'excel') : null),
              _Download('PDF', Icons.picture_as_pdf, b['pdf_path'] != null ? () => _download(b, 'pdf') : null),
            ]),
            if (b['zip_sha256'] != null) SelectableText('SHA-256: ${b['zip_sha256']}', style: const TextStyle(fontSize: 10, color: Color(0xFF667085))),
          ])))),
          const SizedBox(height: 20),
          const Text('Archive audit logs', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          if (logs.isEmpty) const _Empty('No archive or restore actions recorded.'),
          ...logs.map((l) => Card(child: ListTile(
            leading: Icon(l['action'] == 'RESTORE' ? Icons.restore : Icons.archive_outlined),
            title: Text('${l['action']} • ${l['source_table']}'),
            subtitle: Text('${l['affected_count']} rows • ${l['status']} • ${_date(l['created_at'])}'),
          ))),
        ])));
  }
}

class _Metric extends StatelessWidget {
  const _Metric(this.label, this.value);
  final String label, value;
  @override
  Widget build(BuildContext context) => Column(children: [
    Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1F5AA6))),
    Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, color: Color(0xFF667085))),
  ]);
}

class _NavCard extends StatelessWidget {
  const _NavCard(this.title, this.subtitle, this.icon, this.onTap);
  final String title, subtitle;
  final IconData icon;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => Card(child: ListTile(leading: Icon(icon, color: const Color(0xFF1F5AA6)), title: Text(title), subtitle: Text(subtitle), trailing: const Icon(Icons.chevron_right), onTap: onTap));
}

class _Download extends StatelessWidget {
  const _Download(this.label, this.icon, this.onTap);
  final String label;
  final IconData icon;
  final VoidCallback? onTap;
  @override
  Widget build(BuildContext context) => OutlinedButton.icon(onPressed: onTap, icon: Icon(icon, size: 16), label: Text(label));
}

class _Message extends StatelessWidget {
  const _Message(this.text, this.success);
  final String text;
  final bool success;
  @override
  Widget build(BuildContext context) => Card(color: success ? const Color(0xFFEAF7EF) : const Color(0xFFFFF0EF), child: Padding(padding: const EdgeInsets.all(12), child: Text(text, style: TextStyle(color: success ? const Color(0xFF176B3A) : const Color(0xFFB42318)))));
}

class _Notice extends StatelessWidget {
  const _Notice(this.text);
  final String text;
  @override
  Widget build(BuildContext context) => Card(color: const Color(0xFFEFF5FC), child: Padding(padding: const EdgeInsets.all(14), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [const Icon(Icons.info_outline, color: Color(0xFF1F5AA6)), const SizedBox(width: 10), Expanded(child: Text(text, style: const TextStyle(fontSize: 12, height: 1.45)))])));
}

class _Empty extends StatelessWidget {
  const _Empty(this.text);
  final String text;
  @override
  Widget build(BuildContext context) => Padding(padding: const EdgeInsets.all(24), child: Text(text, textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFF667085))));
}

class _OwnerOnly extends StatelessWidget {
  const _OwnerOnly();
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Restricted access')), body: const Center(child: Text('This module is available to the Owner only.')));
}

String _date(Object? value) {
  final date = value == null ? null : DateTime.tryParse(value.toString())?.toLocal();
  if (date == null) return '—';
  return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')} ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
}
