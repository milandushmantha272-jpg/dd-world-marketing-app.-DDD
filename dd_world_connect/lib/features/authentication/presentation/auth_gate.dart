import 'dart:async';

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../data/auth_repository.dart';
import '../domain/employee_profile.dart';
import 'login_screen.dart';
import 'role_guard.dart';
import '../../employees/presentation/employee_management_screen.dart';

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> with WidgetsBindingObserver {
  final _repository = AuthRepository();
  StreamSubscription<AuthState>? _subscription;
  Future<EmployeeProfile>? _profileFuture;
  String? _sessionUserId;
  String? _blockedMessage;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _subscription = Supabase.instance.client.auth.onAuthStateChange.listen(
      (event) => _handleSession(event.session),
    );
    _handleSession(Supabase.instance.client.auth.currentSession);
  }

  void _handleSession(Session? session) {
    if (!mounted) return;
    if (session == null) {
      setState(() {
        _sessionUserId = null;
        _profileFuture = null;
      });
      return;
    }
    if (_sessionUserId == session.user.id && _profileFuture != null) return;
    setState(() {
      _sessionUserId = session.user.id;
      _blockedMessage = null;
      _profileFuture = _loadAuthorizedProfile();
    });
  }

  Future<EmployeeProfile> _loadAuthorizedProfile() async {
    try {
      return await _repository.bootstrapSession();
    } catch (error) {
      final message = error.toString().replaceFirst('Exception: ', '');
      _blockedMessage = message;
      await _repository.signOut();
      rethrow;
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state != AppLifecycleState.resumed) return;
    final session = Supabase.instance.client.auth.currentSession;
    if (session == null || !mounted) return;
    // Re-check employee approval and active-device registration when returning
    // to the foreground, so a revoked device is not left on an authorized screen.
    setState(() {
      _sessionUserId = session.user.id;
      _blockedMessage = null;
      _profileFuture = _loadAuthorizedProfile();
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _subscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_sessionUserId == null || _profileFuture == null) {
      return LoginScreen(message: _blockedMessage);
    }
    return FutureBuilder<EmployeeProfile>(
      future: _profileFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Scaffold(
            body: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircularProgressIndicator(color: Color(0xFF1F5AA6)),
                  SizedBox(height: 16),
                  Text('Verifying employee access and registered device…'),
                ],
              ),
            ),
          );
        }
        if (snapshot.hasError || !snapshot.hasData) {
          return _AccessBlockedScreen(
            message: _blockedMessage ?? 'Unable to verify employee access. Contact the Owner.',
            onContinue: () => setState(() {
              _blockedMessage = null;
              _sessionUserId = null;
              _profileFuture = null;
            }),
          );
        }
        return RoleDashboard(profile: snapshot.requireData);
      },
    );
  }
}

class RoleDashboard extends StatelessWidget {
  const RoleDashboard({super.key, required this.profile});
  final EmployeeProfile profile;

  @override
  Widget build(BuildContext context) {
    final features = switch (profile.role) {
      EmployeeRole.owner => const [
          ('Employees', Icons.people_alt_outlined),
          ('Teams', Icons.groups_2_outlined),
          ('Attendance', Icons.location_on_outlined),
          ('Activations', Icons.trending_up_rounded),
          ('Commissions', Icons.payments_outlined),
          ('Meetings', Icons.event_outlined),
          ('Complaints', Icons.support_agent_outlined),
          ('Reports Center', Icons.assessment_outlined),
        ],
      EmployeeRole.teamLeader => const [
          ('My Team', Icons.groups_2_outlined),
          ('Team Sales', Icons.trending_up_rounded),
          ('Attendance Review', Icons.fact_check_outlined),
          ('Meetings', Icons.event_outlined),
          ('Complaints', Icons.support_agent_outlined),
          ('Team Reports', Icons.assessment_outlined),
        ],
      EmployeeRole.agent => const [
          ('My Attendance', Icons.location_on_outlined),
          ('Submit Activation', Icons.add_chart_outlined),
          ('My Sales', Icons.trending_up_rounded),
          ('My Commission', Icons.payments_outlined),
          ('Meetings', Icons.event_outlined),
          ('Complaints', Icons.support_agent_outlined),
        ],
      EmployeeRole.directAgent => const [
          ('My Attendance', Icons.location_on_outlined),
          ('Submit Activation', Icons.add_chart_outlined),
          ('My Sales', Icons.trending_up_rounded),
          ('My Commission', Icons.payments_outlined),
          ('Owner Messages', Icons.notifications_outlined),
          ('Complaints', Icons.support_agent_outlined),
        ],
    };

    return Scaffold(
      appBar: AppBar(
        title: const Text('DD WORLD CONNECT'),
        actions: [
          IconButton(
            tooltip: 'Sign out',
            onPressed: () async {
              await AuthRepository().signOut();
            },
            icon: const Icon(Icons.logout_rounded),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              color: const Color(0xFF1F5AA6),
              borderRadius: BorderRadius.circular(22),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'DD WORLD MARKETING',
                  style: TextStyle(color: Colors.white70, letterSpacing: 1),
                ),
                const SizedBox(height: 12),
                Text(
                  'Welcome, ${profile.fullName}',
                  style: const TextStyle(color: Colors.white, fontSize: 23, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  '${profile.role.displayName}  •  ${profile.employeeCode}',
                  style: const TextStyle(color: Colors.white),
                ),
              ],
            ),
          ),
          const SizedBox(height: 22),
          const Text('Your workspace', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: features.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.3,
            ),
            itemBuilder: (context, index) {
              final item = features[index];
              return Card(
                clipBehavior: Clip.antiAlias,
                child: InkWell(
                  onTap: (item.$1 == 'Employees' && profile.role == EmployeeRole.owner) || (item.$1 == 'My Team' && profile.role == EmployeeRole.teamLeader)
                      ? () => Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => RoleGuard(profile: profile, allowedRoles: profile.role == EmployeeRole.owner ? const {EmployeeRole.owner} : const {EmployeeRole.teamLeader}, child: EmployeeManagementScreen(canManage: profile.role == EmployeeRole.owner))))
                      : null,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(item.$2, size: 30, color: const Color(0xFF1F5AA6)),
                        const SizedBox(height: 12),
                        Text(item.$1, style: const TextStyle(fontWeight: FontWeight.w600)),
                        if (item.$1 == 'Employees' && profile.role == EmployeeRole.owner || item.$1 == 'My Team' && profile.role == EmployeeRole.teamLeader) const Text('Open module', style: TextStyle(fontSize: 11, color: Color(0xFF667085))),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
          if (profile.role == EmployeeRole.owner) ...[
            const SizedBox(height: 16),
            Card(
              child: ListTile(
                leading: const Icon(Icons.phonelink_lock, color: Color(0xFF1F5AA6)),
                title: const Text('Device registration reset'),
                subtitle: const Text('Revoke an employee’s current device so they can register a replacement.'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => RoleGuard(
                      profile: profile,
                      allowedRoles: const {EmployeeRole.owner},
                      child: const OwnerDeviceResetScreen(),
                    ),
                  ),
                ),
              ),
            ),
          ],
          const SizedBox(height: 12),
          const Text(
            'Feature tiles are role-specific. Business workflows must be implemented and server-authorized before this foundation is used operationally.',
            style: TextStyle(color: Color(0xFF667085), fontSize: 12, height: 1.5),
          ),
        ],
      ),
    );
  }
}

class OwnerDeviceResetScreen extends StatefulWidget {
  const OwnerDeviceResetScreen({super.key});

  @override
  State<OwnerDeviceResetScreen> createState() => _OwnerDeviceResetScreenState();
}

class _OwnerDeviceResetScreenState extends State<OwnerDeviceResetScreen> {
  final _employeeCode = TextEditingController();
  bool _loading = false;
  String? _message;
  bool _success = false;

  @override
  void dispose() {
    _employeeCode.dispose();
    super.dispose();
  }

  Future<void> _reset() async {
    setState(() {
      _loading = true;
      _message = null;
    });
    try {
      await AuthRepository().ownerResetDeviceRegistration(_employeeCode.text);
      if (mounted) {
        setState(() {
          _success = true;
          _message = 'Device registration revoked. The employee can sign in and register a replacement device.';
        });
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _success = false;
          _message = error.toString().replaceFirst('Exception: ', '');
        });
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reset employee device')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text(
            'Revoke the active device for one employee. This action is audited and only the Owner can perform it.',
            style: TextStyle(height: 1.5),
          ),
          const SizedBox(height: 18),
          TextField(
            controller: _employeeCode,
            textCapitalization: TextCapitalization.characters,
            decoration: const InputDecoration(
              labelText: 'Employee code',
              hintText: 'e.g. 9183',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _loading ? null : _reset,
            style: FilledButton.styleFrom(backgroundColor: const Color(0xFF1F5AA6)),
            child: _loading
                ? const CircularProgressIndicator(color: Colors.white)
                : const Text('Revoke active device'),
          ),
          if (_message != null) ...[
            const SizedBox(height: 16),
            Text(
              _message!,
              style: TextStyle(color: _success ? Colors.green.shade800 : Colors.red.shade700),
            ),
          ],
        ],
      ),
    );
  }
}

class _AccessBlockedScreen extends StatelessWidget {
  const _AccessBlockedScreen({required this.message, required this.onContinue});
  final String message;
  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.gpp_bad_outlined, size: 56, color: Color(0xFFB42318)),
                const SizedBox(height: 18),
                const Text('Access not granted', style: TextStyle(fontSize: 23, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                Text(message, textAlign: TextAlign.center),
                const SizedBox(height: 20),
                FilledButton(onPressed: onContinue, child: const Text('Back to sign in')),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
