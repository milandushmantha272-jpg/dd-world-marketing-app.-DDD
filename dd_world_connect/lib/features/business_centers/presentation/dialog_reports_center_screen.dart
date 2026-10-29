import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../authentication/domain/employee_profile.dart';
import '../application/business_center_providers.dart';
import '../data/business_center_repository.dart';
import '../domain/business_records.dart';

class DialogReportsCenterScreen extends ConsumerWidget {
  const DialogReportsCenterScreen({super.key, required this.profile});
  final EmployeeProfile profile;
  bool get _owner => profile.role == EmployeeRole.owner;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Dialog Reports Center'),
          bottom: const TabBar(
            isScrollable: true,
            tabs: [Tab(text: 'Weekly'), Tab(text: 'Monthly'), Tab(text: 'Archive')],
          ),
        ),
        floatingActionButton: _owner
            ? FloatingActionButton.extended(
                onPressed: () => _upload(context, ref),
                icon: const Icon(Icons.upload_file),
                label: const Text('Upload report'),
              )
            : null,
        body: const TabBarView(
          children: [
            _ReportList(type: 'weekly'),
            _ReportList(type: 'monthly'),
            _ArchiveList(),
          ],
        ),
      ),
    );
  }

  Future<void> _upload(BuildContext context, WidgetRef ref) async {
    final title = TextEditingController();
    var type = 'weekly';
    var start = DateTime.now().subtract(const Duration(days: 7));
    var end = DateTime.now();

    final form = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) => AlertDialog(
          title: const Text('Upload Dialog report'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: title,
                  decoration: const InputDecoration(labelText: 'Report title'),
                  textCapitalization: TextCapitalization.sentences,
                ),
                DropdownButtonFormField<String>(
                  value: type,
                  items: const [
                    DropdownMenuItem(value: 'weekly', child: Text('Weekly report')),
                    DropdownMenuItem(value: 'monthly', child: Text('Monthly report')),
                  ],
                  onChanged: (value) => setDialogState(() => type = value ?? type),
                ),
                ListTile(
                  title: const Text('Period start'),
                  subtitle: Text(start.toIso8601String().substring(0, 10)),
                  onTap: () async {
                    final date = await showDatePicker(
                      context: dialogContext,
                      initialDate: start,
                      firstDate: DateTime(2020),
                      lastDate: DateTime(2100),
                    );
                    if (date != null) setDialogState(() => start = date);
                  },
                ),
                ListTile(
                  title: const Text('Period end'),
                  subtitle: Text(end.toIso8601String().substring(0, 10)),
                  onTap: () async {
                    final date = await showDatePicker(
                      context: dialogContext,
                      initialDate: end,
                      firstDate: DateTime(2020),
                      lastDate: DateTime(2100),
                    );
                    if (date != null) setDialogState(() => end = date);
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('Cancel')),
            FilledButton(
              onPressed: () => Navigator.pop(dialogContext, {
                'title': title.text,
                'type': type,
                'start': start,
                'end': end,
              }),
              child: const Text('Choose file'),
            ),
          ],
        ),
      ),
    );
    title.dispose();
    if (form == null) return;

    final file = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: const ['pdf', 'xlsx', 'xls', 'csv'],
      withData: true,
    );
    if (file == null || file.files.single.bytes == null) return;

    try {
      await ref.read(businessCenterRepositoryProvider).uploadDialogReport(
            title: (form['title'] as String),
            type: form['type'] as String,
            start: form['start'] as DateTime,
            end: form['end'] as DateTime,
            fileName: file.files.single.name,
            bytes: file.files.single.bytes!,
          );
      ref.invalidate(dialogReportsProvider('weekly'));
      ref.invalidate(dialogReportsProvider('monthly'));
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Report uploaded successfully.')));
      }
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Upload failed: $error')));
      }
    }
  }
}

class _ReportList extends ConsumerWidget {
  const _ReportList({required this.type});
  final String type;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return RefreshIndicator(
      onRefresh: () async => ref.invalidate(dialogReportsProvider(type)),
      child: ref.watch(dialogReportsProvider(type)).when(
            data: (items) {
              if (items.isEmpty) {
                return ListView(
                  children: [const SizedBox(height: 100), Center(child: Text('No $type reports available.'))],
                );
              }
              return ListView(
                padding: const EdgeInsets.all(12),
                children: items.map((report) => _ReportCard(report: report, archived: false)).toList(),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, _) => Center(child: Text('Unable to load reports: $error')),
          ),
    );
  }
}

class _ArchiveList extends ConsumerWidget {
  const _ArchiveList();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ref.watch(dialogArchiveProvider).when(
          data: (items) {
            if (items.isEmpty) return const Center(child: Text('Archive is empty.'));
            return ListView(
              padding: const EdgeInsets.all(12),
              children: items.map((report) => _ReportCard(report: report, archived: true)).toList(),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => Center(child: Text('Archive unavailable: $error')),
        );
  }
}

class _ReportCard extends ConsumerWidget {
  const _ReportCard({required this.report, required this.archived});
  final DialogReport report;
  final bool archived;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final owner = ref.read(businessCenterRoleProvider) == EmployeeRole.owner;
    return Card(
      child: ListTile(
        leading: Icon(report.mimeType == 'application/pdf' ? Icons.picture_as_pdf : Icons.table_chart),
        title: Text(report.title),
        subtitle: Text(
          '${report.type.toUpperCase()} · ${report.periodLabel}\n'
          '${report.fileName} · ${(report.fileSize / 1024).toStringAsFixed(0)} KB',
        ),
        isThreeLine: true,
        trailing: PopupMenuButton<String>(
          onSelected: (action) => _action(context, ref, action),
          itemBuilder: (_) => [
            const PopupMenuItem(value: 'download', child: Text('Download / Open')),
            if (owner && !archived) const PopupMenuItem(value: 'archive', child: Text('Archive')),
            if (owner) const PopupMenuItem(value: 'delete', child: Text('Delete')),
          ],
        ),
        onTap: () => _action(context, ref, 'download'),
      ),
    );
  }

  Future<void> _action(BuildContext context, WidgetRef ref, String action) async {
    final repository = ref.read(businessCenterRepositoryProvider);
    try {
      if (action == 'download') {
        final url = await repository.downloadDialogReport(report);
        if (!await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication)) {
          throw StateError('Could not open the report URL.');
        }
      } else if (action == 'archive') {
        await repository.archiveDialogReport(report);
        ref.invalidate(dialogReportsProvider('weekly'));
        ref.invalidate(dialogReportsProvider('monthly'));
        ref.invalidate(dialogArchiveProvider);
      } else if (action == 'delete') {
        final confirmed = await showDialog<bool>(
          context: context,
          builder: (dialogContext) => AlertDialog(
            title: const Text('Delete report?'),
            content: const Text('The report will be removed from the active report list and its stored file deleted.'),
            actions: [
              TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Cancel')),
              FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('Delete')),
            ],
          ),
        );
        if (confirmed != true) return;
        await repository.deleteDialogReport(report);
        ref.invalidate(dialogReportsProvider('weekly'));
        ref.invalidate(dialogReportsProvider('monthly'));
        ref.invalidate(dialogArchiveProvider);
      }
      if (context.mounted && action != 'download') {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(action == 'archive' ? 'Report archived.' : 'Report deleted.')),
        );
      }
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Action failed: $error')));
      }
    }
  }
}
