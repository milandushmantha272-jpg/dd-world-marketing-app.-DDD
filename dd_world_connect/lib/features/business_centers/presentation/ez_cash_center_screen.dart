import 'dart:typed_data';

import 'package:excel/excel.dart' as xl;
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../authentication/domain/employee_profile.dart';
import '../application/business_center_providers.dart';
import '../data/business_center_repository.dart';
import '../domain/business_records.dart';

typedef EzCashEditCallback = Future<void> Function(
  BuildContext context,
  WidgetRef ref, {
  EzCashRecord? record,
});

class EzCashCenterScreen extends ConsumerWidget {
  const EzCashCenterScreen({super.key, required this.profile});
  final EmployeeProfile profile;
  bool get _owner => profile.role == EmployeeRole.owner;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('EZ Cash Center'),
          bottom: const TabBar(tabs: [Tab(text: 'Monthly Records'), Tab(text: 'Reports & Exports')]),
        ),
        floatingActionButton: _owner
            ? FloatingActionButton.extended(
                onPressed: () => _edit(context, ref),
                icon: const Icon(Icons.add),
                label: const Text('Add record'),
              )
            : null,
        body: TabBarView(
          children: [
            _EzCashRecordsTab(profile: profile, onEdit: _edit),
            _EzCashReportsTab(profile: profile),
          ],
        ),
      ),
    );
  }

  Future<void> _edit(BuildContext context, WidgetRef ref, {EzCashRecord? record}) async {
    final employees = await ref.read(businessCenterRepositoryProvider).employees();
    if (!context.mounted) return;
    if (employees.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No active approved employees found.')),
      );
      return;
    }

    var employeeId = record?.employeeId ?? employees.first['id'].toString();
    var month = record?.periodMonth ?? DateTime(DateTime.now().year, DateTime.now().month, 1);
    var status = record?.status ?? 'pending';
    final amount = TextEditingController(text: record?.amount.toStringAsFixed(2) ?? '');
    final reference = TextEditingController(text: record?.reference ?? '');
    final last4 = TextEditingController(text: record?.numberLast4 ?? '');
    final note = TextEditingController(text: record?.ownerNote ?? '');

    final save = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) => AlertDialog(
          title: Text(record == null ? 'Add EZ Cash record' : 'Edit EZ Cash record'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<String>(
                  value: employeeId,
                  decoration: const InputDecoration(labelText: 'Employee'),
                  items: employees
                      .map((employee) => DropdownMenuItem(
                            value: employee['id'].toString(),
                            child: Text('${employee['name']} · ${employee['agent_code'] ?? ''}'),
                          ))
                      .toList(),
                  onChanged: record == null
                      ? (value) => setDialogState(() => employeeId = value ?? employeeId)
                      : null,
                ),
                ListTile(
                  title: const Text('Month'),
                  subtitle: Text('${month.year}-${month.month.toString().padLeft(2, '0')}'),
                  trailing: const Icon(Icons.calendar_month),
                  onTap: () async {
                    final selected = await showDatePicker(
                      context: dialogContext,
                      initialDate: month,
                      firstDate: DateTime(2020),
                      lastDate: DateTime(2100),
                      initialDatePickerMode: DatePickerMode.year,
                    );
                    if (selected != null) {
                      setDialogState(() => month = DateTime(selected.year, selected.month, 1));
                    }
                  },
                ),
                TextField(
                  controller: amount,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(labelText: 'Amount (LKR)'),
                ),
                DropdownButtonFormField<String>(
                  value: status,
                  decoration: const InputDecoration(labelText: 'Status'),
                  items: const [
                    DropdownMenuItem(value: 'pending', child: Text('Pending')),
                    DropdownMenuItem(value: 'paid', child: Text('Paid')),
                    DropdownMenuItem(value: 'failed', child: Text('Failed')),
                    DropdownMenuItem(value: 'cancelled', child: Text('Cancelled')),
                  ],
                  onChanged: (value) => setDialogState(() => status = value ?? status),
                ),
                TextField(
                  controller: reference,
                  decoration: const InputDecoration(labelText: 'Payment reference (optional)'),
                ),
                TextField(
                  controller: last4,
                  maxLength: 4,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Payment number — last 4 digits only'),
                ),
                TextField(
                  controller: note,
                  maxLines: 2,
                  decoration: const InputDecoration(labelText: 'Owner note'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Cancel')),
            FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('Save')),
          ],
        ),
      ),
    );
    if (save != true) {
      amount.dispose();
      reference.dispose();
      last4.dispose();
      note.dispose();
      return;
    }

    final value = double.tryParse(amount.text);
    if (value == null || !value.isFinite || value < 0) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Enter a valid amount.')));
      }
      return;
    }
    try {
      final employee = employees.firstWhere((row) => row['id'].toString() == employeeId);
      await ref.read(businessCenterRepositoryProvider).saveEzCashRecord(
            id: record?.id,
            employeeId: employeeId,
            teamId: employee['team_id']?.toString(),
            month: month,
            amount: value,
            status: status,
            reference: reference.text,
            last4: last4.text.trim().isEmpty ? null : last4.text.trim(),
            note: note.text,
            paidAt: status == 'paid' ? (record?.paidAt ?? DateTime.now()) : null,
          );
      ref.invalidate(ezCashRecordsProvider(null));
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('EZ Cash record saved.')));
      }
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Save failed: $error')));
      }
    } finally {
      amount.dispose();
      reference.dispose();
      last4.dispose();
      note.dispose();
    }
  }
}

class _EzCashRecordsTab extends ConsumerStatefulWidget {
  const _EzCashRecordsTab({required this.profile, required this.onEdit});
  final EmployeeProfile profile;
  final EzCashEditCallback onEdit;

  @override
  ConsumerState<_EzCashRecordsTab> createState() => _EzCashRecordsTabState();
}

class _EzCashRecordsTabState extends ConsumerState<_EzCashRecordsTab> {
  DateTime? _month = DateTime(DateTime.now().year, DateTime.now().month, 1);

  @override
  Widget build(BuildContext context) {
    final records = ref.watch(ezCashRecordsProvider(_month));
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 8, 12, 0),
          child: Row(
            children: [
              const Expanded(child: Text('Filter month', style: TextStyle(fontWeight: FontWeight.bold))),
              TextButton.icon(
                onPressed: () async {
                  final selected = await showDatePicker(
                    context: context,
                    initialDate: _month ?? DateTime.now(),
                    firstDate: DateTime(2020),
                    lastDate: DateTime(2100),
                    initialDatePickerMode: DatePickerMode.year,
                  );
                  if (selected != null) setState(() => _month = DateTime(selected.year, selected.month, 1));
                },
                icon: const Icon(Icons.calendar_month),
                label: Text(_month == null
                    ? 'All months'
                    : '${_month!.year}-${_month!.month.toString().padLeft(2, '0')}'),
              ),
              IconButton(
                tooltip: 'All months',
                onPressed: () => setState(() => _month = null),
                icon: const Icon(Icons.filter_alt_off),
              ),
            ],
          ),
        ),
        Expanded(
          child: records.when(
            data: (items) {
              final total = items.fold<double>(0, (sum, record) => sum + record.amount);
              return RefreshIndicator(
                onRefresh: () async => ref.invalidate(ezCashRecordsProvider(_month)),
                child: ListView(
                  padding: const EdgeInsets.all(12),
                  children: [
                    Card(
                      child: ListTile(
                        title: const Text('Visible total'),
                        subtitle: Text('${items.length} records'),
                        trailing: Text('LKR ${total.toStringAsFixed(2)}',
                            style: const TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                    if (items.isEmpty)
                      const Padding(
                        padding: EdgeInsets.all(30),
                        child: Text('No EZ Cash records for this period.', textAlign: TextAlign.center),
                      ),
                    ...items.map((record) => Card(
                          child: ListTile(
                            leading: Icon(record.status == 'paid'
                                ? Icons.check_circle
                                : record.status == 'failed'
                                    ? Icons.error_outline
                                    : Icons.payments_outlined),
                            title: Text(record.employeeName),
                            subtitle: Text(
                              '${record.employeeCode} · ${record.periodMonth.year}-'
                              '${record.periodMonth.month.toString().padLeft(2, '0')} · '
                              '${record.status.toUpperCase()}',
                            ),
                            trailing: widget.profile.role == EmployeeRole.owner
                                ? PopupMenuButton<String>(
                                    onSelected: (action) async {
                                      if (action == 'edit') {
                                        await widget.onEdit(context, ref, record: record);
                                      } else if (action == 'delete') {
                                        final confirmed = await showDialog<bool>(
                                          context: context,
                                          builder: (dialogContext) => AlertDialog(
                                            title: const Text('Delete record?'),
                                            content: const Text('This action is recorded in history.'),
                                            actions: [
                                              TextButton(
                                                onPressed: () => Navigator.pop(dialogContext, false),
                                                child: const Text('Cancel'),
                                              ),
                                              FilledButton(
                                                onPressed: () => Navigator.pop(dialogContext, true),
                                                child: const Text('Delete'),
                                              ),
                                            ],
                                          ),
                                        );
                                        if (confirmed == true) {
                                          try {
                                            await ref.read(businessCenterRepositoryProvider)
                                                .deleteEzCashRecord(record.id);
                                            ref.invalidate(ezCashRecordsProvider(_month));
                                          } catch (error) {
                                            if (context.mounted) {
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                SnackBar(content: Text('Delete failed: $error')),
                                              );
                                            }
                                          }
                                        }
                                      }
                                    },
                                    itemBuilder: (_) => const [
                                      PopupMenuItem(value: 'edit', child: Text('Edit record')),
                                      PopupMenuItem(value: 'delete', child: Text('Delete record')),
                                    ],
                                  )
                                : Text(record.amountLabel),
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute<void>(
                                builder: (_) => _EzCashDetails(
                                  record: record,
                                  profile: widget.profile,
                                  onEdit: widget.onEdit,
                                ),
                              ),
                            ),
                          ),
                        )),
                  ],
                ),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, _) => Center(child: Text('Could not load EZ Cash: $error')),
          ),
        ),
      ],
    );
  }
}

class _EzCashDetails extends ConsumerWidget {
  const _EzCashDetails({required this.record, required this.profile, required this.onEdit});
  final EzCashRecord record;
  final EmployeeProfile profile;
  final EzCashEditCallback onEdit;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isOwner = profile.role == EmployeeRole.owner;
    return Scaffold(
      appBar: AppBar(
        title: const Text('EZ Cash Details'),
        actions: [
          if (isOwner)
            IconButton(
              tooltip: 'Edit record',
              icon: const Icon(Icons.edit),
              onPressed: () => onEdit(context, ref, record: record),
            ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(record.amountLabel, style: Theme.of(context).textTheme.headlineMedium),
                  Text(record.employeeName),
                  Text('Code: ${record.employeeCode}'),
                  Text('Month: ${record.periodMonth.year}-${record.periodMonth.month.toString().padLeft(2, '0')}'),
                  Text('Status: ${record.status}'),
                  if (record.paidAt != null) Text('Paid: ${record.paidAt}'),
                  if (record.reference != null) Text('Reference: ${record.reference}'),
                  if (record.numberLast4 != null) Text('Payment number ending ${record.numberLast4}'),
                  if (record.ownerNote != null) Text('Owner note: ${record.ownerNote}'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          const Text('Change history', style: TextStyle(fontWeight: FontWeight.bold)),
          FutureBuilder<List<Map<String, dynamic>>>(
            future: ref.read(businessCenterRepositoryProvider).ezCashHistory(record.id),
            builder: (context, snapshot) {
              if (snapshot.connectionState != ConnectionState.done) return const LinearProgressIndicator();
              if (snapshot.hasError) return Text('History unavailable: ${snapshot.error}');
              final history = snapshot.data ?? [];
              if (history.isEmpty) return const Text('No history entries.');
              return Column(
                children: history.map((item) => ListTile(
                  title: Text(item['event_type'].toString()),
                  subtitle: Text(item['created_at'].toString()),
                )).toList(),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _EzCashReportsTab extends ConsumerWidget {
  const _EzCashReportsTab({required this.profile});
  final EmployeeProfile profile;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final records = ref.watch(ezCashRecordsProvider(null));
    final reports = ref.watch(ezCashReportsProvider);
    final owner = profile.role == EmployeeRole.owner;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Export visible records', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        const SizedBox(height: 8),
        records.when(
          data: (items) => Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _exportExcel(context, items),
                  icon: const Icon(Icons.table_view),
                  label: const Text('Excel'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _exportPdf(context, items),
                  icon: const Icon(Icons.picture_as_pdf),
                  label: const Text('PDF'),
                ),
              ),
            ],
          ),
          loading: () => const LinearProgressIndicator(),
          error: (error, _) => Text('Records unavailable: $error'),
        ),
        const Divider(height: 32),
        Row(
          children: [
            const Expanded(child: Text('Uploaded reports', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18))),
            if (owner)
              IconButton(
                onPressed: () => _upload(context, ref),
                icon: const Icon(Icons.upload_file),
                tooltip: 'Upload report',
              ),
          ],
        ),
        reports.when(
          data: (items) {
            if (items.isEmpty) return const Text('No uploaded EZ Cash reports.');
            return Column(
              children: items.map((report) => ListTile(
                leading: Icon(report['mime_type'] == 'application/pdf' ? Icons.picture_as_pdf : Icons.table_chart),
                title: Text(report['title'].toString()),
                subtitle: Text('${report['period_month']} · ${report['file_name']}'),
                trailing: IconButton(
                  icon: const Icon(Icons.download),
                  onPressed: () async {
                    try {
                      final url = await ref.read(businessCenterRepositoryProvider)
                          .ezCashReportUrl(report['file_path'].toString());
                      if (!await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication)) {
                        throw StateError('Could not open report.');
                      }
                    } catch (error) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Download failed: $error')),
                        );
                      }
                    }
                  },
                ),
              )).toList(),
            );
          },
          loading: () => const LinearProgressIndicator(),
          error: (error, _) => Text('Reports unavailable: $error'),
        ),
      ],
    );
  }

  Future<void> _upload(BuildContext context, WidgetRef ref) async {
    final title = TextEditingController();
    var month = DateTime(DateTime.now().year, DateTime.now().month, 1);
    final proceed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) => AlertDialog(
          title: const Text('Upload EZ Cash report'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: title, decoration: const InputDecoration(labelText: 'Title')),
              ListTile(
                title: const Text('Month'),
                subtitle: Text('${month.year}-${month.month.toString().padLeft(2, '0')}'),
                onTap: () async {
                  final date = await showDatePicker(
                    context: dialogContext,
                    initialDate: month,
                    firstDate: DateTime(2020),
                    lastDate: DateTime(2100),
                  );
                  if (date != null) setDialogState(() => month = DateTime(date.year, date.month, 1));
                },
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Cancel')),
            FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('Choose file')),
          ],
        ),
      ),
    );
    title.dispose();
    if (proceed != true) return;

    final file = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: const ['pdf', 'xlsx', 'xls', 'csv'],
      withData: true,
    );
    if (file == null || file.files.single.bytes == null) return;
    try {
      await ref.read(businessCenterRepositoryProvider).uploadEzCashReport(
            title: title.text,
            month: month,
            fileName: file.files.single.name,
            bytes: file.files.single.bytes!,
          );
      ref.invalidate(ezCashReportsProvider);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Report uploaded.')));
      }
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Upload failed: $error')));
      }
    }
  }

  Future<void> _exportExcel(BuildContext context, List<EzCashRecord> records) async {
    final workbook = xl.Excel.createExcel();
    final sheet = workbook['EZ Cash'];
    sheet.appendRow([
      'Employee',
      'Code',
      'Month',
      'Amount (LKR)',
      'Status',
      'Paid At',
      'Reference',
    ].map(xl.TextCellValue.new).toList());
    for (final record in records) {
      sheet.appendRow([
        xl.TextCellValue(record.employeeName),
        xl.TextCellValue(record.employeeCode),
        xl.TextCellValue('${record.periodMonth.year}-${record.periodMonth.month.toString().padLeft(2, '0')}'),
        xl.DoubleCellValue(record.amount),
        xl.TextCellValue(record.status),
        xl.TextCellValue(record.paidAt?.toIso8601String() ?? ''),
        xl.TextCellValue(record.reference ?? ''),
      ]);
    }
    final bytes = workbook.encode();
    if (bytes == null) throw StateError('Excel export failed.');
    await Share.shareXFiles(
      [XFile.fromData(Uint8List.fromList(bytes), mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', name: 'ez_cash_report.xlsx')],
      subject: 'EZ Cash Excel report',
    );
  }

  Future<void> _exportPdf(BuildContext context, List<EzCashRecord> records) async {
    final document = pw.Document();
    document.addPage(
      pw.MultiPage(
        build: (_) => [
          pw.Header(level: 0, child: pw.Text('DD WORLD CONNECT — EZ Cash Report')),
          pw.Text('Generated: ${DateTime.now().toIso8601String()}'),
          pw.SizedBox(height: 12),
          pw.Table(
            border: pw.TableBorder.all(),
            children: [
              pw.TableRow(
                children: ['Employee', 'Code', 'Month', 'Amount LKR', 'Status']
                    .map((value) => pw.Padding(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text(value, style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 8)),
                        ))
                    .toList(),
              ),
              ...records.map((record) => pw.TableRow(
                    children: [
                      record.employeeName,
                      record.employeeCode,
                      '${record.periodMonth.year}-${record.periodMonth.month.toString().padLeft(2, '0')}',
                      record.amount.toStringAsFixed(2),
                      record.status,
                    ]
                        .map((value) => pw.Padding(
                              padding: const pw.EdgeInsets.all(4),
                              child: pw.Text(value, style: const pw.TextStyle(fontSize: 8)),
                            ))
                        .toList(),
                  )),
            ],
          ),
        ],
      ),
    );
    final bytes = await document.save();
    await Share.shareXFiles(
      [XFile.fromData(bytes, mimeType: 'application/pdf', name: 'ez_cash_report.pdf')],
      subject: 'EZ Cash PDF report',
    );
  }
}
