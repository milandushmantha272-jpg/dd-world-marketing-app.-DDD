import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../authentication/domain/employee_profile.dart';
import '../application/business_center_providers.dart';
import '../domain/business_records.dart';

class CommissionComplaintsCenterScreen extends ConsumerWidget {
  const CommissionComplaintsCenterScreen({super.key, required this.profile});
  final EmployeeProfile profile;

  bool get _owner => profile.role == EmployeeRole.owner;
  bool get _canSubmit => profile.role == EmployeeRole.agent || profile.role == EmployeeRole.directAgent;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final complaints = ref.watch(complaintThreadsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Commission Complaints')),
      floatingActionButton: _canSubmit
          ? FloatingActionButton.extended(
              onPressed: () => _newComplaint(context, ref),
              icon: const Icon(Icons.add),
              label: const Text('New complaint'),
            )
          : null,
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(complaintThreadsProvider),
        child: complaints.when(
          data: (items) {
            if (items.isEmpty) {
              return ListView(
                children: const [
                  SizedBox(height: 120),
                  Center(child: Text('No commission complaints.')),
                ],
              );
            }
            return ListView(
              padding: const EdgeInsets.all(12),
              children: [
                if (_owner)
                  Padding(
                    padding: const EdgeInsets.all(8),
                    child: Text(
                      '${items.where((c) => c.status == 'open').length} open · '
                      '${items.where((c) => c.status == 'under_review').length} under review · '
                      '${items.where((c) => c.status == 'resolved').length} resolved · '
                      '${items.where((c) => c.status == 'rejected').length} rejected',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ),
                ...items.map(
                  (complaint) => Card(
                    child: ListTile(
                      leading: Icon(
                        complaint.status == 'resolved'
                            ? Icons.check_circle
                            : complaint.status == 'rejected'
                                ? Icons.cancel
                                : Icons.pending_actions,
                      ),
                      title: Text(complaint.type.replaceAll('_', ' ').toUpperCase()),
                      subtitle: Text(
                        '${complaint.employeeName ?? 'Employee'} · ${complaint.status.toUpperCase()}\n'
                        '${complaint.message}',
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                      ),
                      isThreeLine: true,
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute<void>(
                          builder: (_) => _ComplaintDetails(profile: profile, complaint: complaint),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => Center(child: Text('Complaints unavailable: $error')),
        ),
      ),
    );
  }

  Future<void> _newComplaint(BuildContext context, WidgetRef ref) async {
    final client = Supabase.instance.client;
    final commissions = await client
        .from('commissions')
        .select('id,period_month,amount,currency,status')
        .order('period_month', ascending: false)
        .limit(100);
    if (!context.mounted) return;
    if (commissions.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No commission record is available to attach a complaint to.')),
      );
      return;
    }

    final message = TextEditingController();
    final expectedAmount = TextEditingController();
    var commissionId = commissions.first['id'].toString();
    var complaintType = 'not_received';
    PlatformFile? attachment;

    final submitted = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) => AlertDialog(
          title: const Text('New commission complaint'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<String>(
                  value: complaintType,
                  decoration: const InputDecoration(labelText: 'Complaint type'),
                  items: const [
                    DropdownMenuItem(value: 'not_received', child: Text('Not received')),
                    DropdownMenuItem(value: 'wrong_amount', child: Text('Wrong amount')),
                    DropdownMenuItem(value: 'late_payment', child: Text('Late payment')),
                    DropdownMenuItem(value: 'other', child: Text('Other')),
                  ],
                  onChanged: (value) => setDialogState(() => complaintType = value ?? complaintType),
                ),
                DropdownButtonFormField<String>(
                  value: commissionId,
                  decoration: const InputDecoration(labelText: 'Commission record'),
                  items: commissions
                      .map(
                        (row) => DropdownMenuItem(
                          value: row['id'].toString(),
                          child: Text('${row['period_month']} · LKR ${row['amount']}'),
                        ),
                      )
                      .toList(),
                  onChanged: (value) => setDialogState(() => commissionId = value ?? commissionId),
                ),
                TextField(
                  controller: message,
                  minLines: 3,
                  maxLines: 5,
                  decoration: const InputDecoration(labelText: 'Explain the issue'),
                ),
                TextField(
                  controller: expectedAmount,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(labelText: 'Expected amount (optional)'),
                ),
                OutlinedButton.icon(
                  onPressed: () async {
                    final result = await FilePicker.platform.pickFiles(
                      type: FileType.custom,
                      allowedExtensions: const ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
                      withData: true,
                    );
                    if (result != null && result.files.single.bytes != null) {
                      setDialogState(() => attachment = result.files.single);
                    }
                  },
                  icon: const Icon(Icons.attach_file),
                  label: Text(attachment?.name ?? 'Attach screenshot / PDF'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Cancel')),
            FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('Submit')),
          ],
        ),
      ),
    );

    if (submitted != true || message.text.trim().length < 3) return;
    try {
      await ref.read(businessCenterRepositoryProvider).submitComplaint(
            commissionId: commissionId,
            type: complaintType,
            message: message.text,
            expectedAmount: double.tryParse(expectedAmount.text),
            attachment: attachment?.bytes,
            fileName: attachment?.name,
          );
      ref.invalidate(complaintThreadsProvider);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Complaint submitted.')));
      }
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Submission failed: $error')));
      }
    } finally {
      message.dispose();
      expectedAmount.dispose();
    }
  }
}

class _ComplaintDetails extends ConsumerStatefulWidget {
  const _ComplaintDetails({required this.profile, required this.complaint});
  final EmployeeProfile profile;
  final CommissionComplaintThread complaint;

  @override
  ConsumerState<_ComplaintDetails> createState() => _ComplaintDetailsState();
}

class _ComplaintDetailsState extends ConsumerState<_ComplaintDetails> {
  final _message = TextEditingController();
  final _resolution = TextEditingController();
  bool _busy = false;

  bool get _owner => widget.profile.role == EmployeeRole.owner;

  @override
  void dispose() {
    _message.dispose();
    _resolution.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final complaint = widget.complaint;
    return Scaffold(
      appBar: AppBar(title: const Text('Complaint Details')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(complaint.type.replaceAll('_', ' ').toUpperCase(),
                      style: Theme.of(context).textTheme.titleLarge),
                  Text('Status: ${complaint.status.toUpperCase()}'),
                  Text('Employee: ${complaint.employeeName ?? widget.profile.fullName}'),
                  const SizedBox(height: 8),
                  Text(complaint.message),
                  if (complaint.expectedAmount != null)
                    Text('Expected amount: LKR ${complaint.expectedAmount!.toStringAsFixed(2)}'),
                  if (complaint.ownerResponse != null) Text('Owner response: ${complaint.ownerResponse}'),
                ],
              ),
            ),
          ),
          const Text('Conversation', style: TextStyle(fontWeight: FontWeight.bold)),
          FutureBuilder<List<Map<String, dynamic>>>(
            future: ref.read(businessCenterRepositoryProvider).complaintMessages(complaint.id),
            builder: (context, snapshot) {
              if (snapshot.connectionState != ConnectionState.done) {
                return const LinearProgressIndicator();
              }
              if (snapshot.hasError) return Text('Messages unavailable: ${snapshot.error}');
              final messages = snapshot.data ?? [];
              if (messages.isEmpty) return const Padding(padding: EdgeInsets.all(12), child: Text('No messages yet.'));
              return Column(
                children: messages
                    .map(
                      (item) => ListTile(
                        title: Text(item['sender'] is Map
                            ? (item['sender']['name']?.toString() ?? 'Employee')
                            : 'Employee'),
                        subtitle: Text(item['message'].toString()),
                        trailing: Text(item['created_at'].toString().substring(0, 10),
                            style: const TextStyle(fontSize: 10)),
                      ),
                    )
                    .toList(),
              );
            },
          ),
          TextField(controller: _message, decoration: const InputDecoration(labelText: 'Add message'), maxLines: 2),
          FilledButton(
            onPressed: _busy ? null : _sendMessage,
            child: const Text('Send message'),
          ),
          if (_owner && complaint.status == 'open') ...[
            const Divider(height: 32),
            TextField(controller: _resolution, decoration: const InputDecoration(labelText: 'Resolution note'), maxLines: 3),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _busy ? null : () => _resolve(reject: true),
                    child: const Text('Reject'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: FilledButton(
                    onPressed: _busy ? null : () => _resolve(reject: false),
                    child: const Text('Resolve'),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Future<void> _sendMessage() async {
    setState(() => _busy = true);
    try {
      await ref.read(businessCenterRepositoryProvider).addComplaintMessage(widget.complaint.id, _message.text);
      _message.clear();
      if (mounted) setState(() {});
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Message sent.')));
    } catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Message failed: $error')));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _resolve({required bool reject}) async {
    setState(() => _busy = true);
    try {
      await ref.read(businessCenterRepositoryProvider).resolveComplaint(
            widget.complaint.id,
            reject: reject,
            response: _resolution.text,
          );
      ref.invalidate(complaintThreadsProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(reject ? 'Complaint rejected.' : 'Complaint resolved.')),
        );
        Navigator.pop(context);
      }
    } catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Resolution failed: $error')));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }
}
