import 'package:flutter/material.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const DDWorldConnectApp());
}

class DDWorldConnectApp extends StatelessWidget {
  const DDWorldConnectApp({super.key});

  static const brandBlue = Color(0xFF1F5AA6);
  static const brandGreen = Color(0xFF8BC53F);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DD WORLD CONNECT',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: brandBlue,
          primary: brandBlue,
          secondary: brandGreen,
          surface: Colors.white,
        ),
        scaffoldBackgroundColor: const Color(0xFFF6F8FB),
        appBarTheme: const AppBarTheme(
          backgroundColor: brandBlue,
          foregroundColor: Colors.white,
          centerTitle: false,
        ),
        cardTheme: CardThemeData(
          elevation: 0,
          color: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
            side: const BorderSide(color: Color(0xFFE6EAF0)),
          ),
        ),
      ),
      home: const FoundationScreen(),
    );
  }
}

class FoundationScreen extends StatelessWidget {
  const FoundationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('DD WORLD CONNECT'),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 16),
            child: Icon(Icons.business_rounded),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [DDWorldConnectApp.brandBlue, Color(0xFF3478C8)],
              ),
              borderRadius: BorderRadius.circular(22),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'DD WORLD MARKETING',
                  style: TextStyle(
                    color: Colors.white70,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 1.1,
                  ),
                ),
                SizedBox(height: 12),
                Text(
                  'Connect your team.\nTrack every activation.',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 26,
                    height: 1.2,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 12),
                Text(
                  'Employee, attendance and sales management in one place.',
                  style: TextStyle(color: Colors.white, fontSize: 14),
                ),
              ],
            ),
          ),
          const SizedBox(height: 22),
          const Text(
            'Operations',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          const Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              _FeatureTile(
                icon: Icons.people_alt_outlined,
                title: 'Employees',
                subtitle: 'Role-based access',
              ),
              _FeatureTile(
                icon: Icons.groups_2_outlined,
                title: 'Teams',
                subtitle: 'Team assignments',
              ),
              _FeatureTile(
                icon: Icons.location_on_outlined,
                title: 'Attendance',
                subtitle: 'GPS check-in/out',
              ),
              _FeatureTile(
                icon: Icons.trending_up_rounded,
                title: 'Activations',
                subtitle: 'Sayuru & Govimithuru',
              ),
              _FeatureTile(
                icon: Icons.payments_outlined,
                title: 'Commissions',
                subtitle: 'Rules & approvals',
              ),
              _FeatureTile(
                icon: Icons.assessment_outlined,
                title: 'Reports',
                subtitle: 'Daily & monthly',
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.info_outline, color: DDWorldConnectApp.brandBlue),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Foundation preview. Authentication, live database access, role-specific navigation and business workflows must be connected and tested before operational use.',
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FeatureTile extends StatelessWidget {
  const _FeatureTile({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 158,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(15),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, color: DDWorldConnectApp.brandBlue, size: 28),
              const SizedBox(height: 14),
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: const TextStyle(color: Color(0xFF667085), fontSize: 12),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
