import 'package:flutter/material.dart';

import '../domain/employee_profile.dart';

class RoleGuard extends StatelessWidget {
  const RoleGuard({
    super.key,
    required this.profile,
    required this.allowedRoles,
    required this.child,
  });

  final EmployeeProfile profile;
  final Set<EmployeeRole> allowedRoles;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    if (allowedRoles.contains(profile.role)) return child;
    return const Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.gpp_bad_outlined, size: 52, color: Color(0xFFB42318)),
                SizedBox(height: 16),
                Text(
                  'Access denied',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 8),
                Text(
                  'Your account does not have permission to open this screen.',
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
