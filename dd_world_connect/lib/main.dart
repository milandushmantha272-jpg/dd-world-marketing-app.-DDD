import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'core/config/supabase_config.dart';
import 'features/authentication/presentation/auth_gate.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await Firebase.initializeApp();
  } catch (error) {
    debugPrint('Firebase Messaging is not configured yet: $error');
  }

  if (!SupabaseConfig.isConfigured) {
    runApp(const ConfigurationRequiredApp());
    return;
  }

  try {
    await Supabase.initialize(
      url: SupabaseConfig.url,
      publishableKey: SupabaseConfig.publishableKey,
    );
    runApp(const ProviderScope(child: DDWorldConnectApp()));
  } catch (error, stackTrace) {
    debugPrint('Supabase initialization failed: $error');
    debugPrintStack(stackTrace: stackTrace);
    runApp(const ConfigurationRequiredApp(initializationFailed: true));
  }
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
        inputDecorationTheme: const InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
        ),
      ),
      home: const AuthGate(),
    );
  }
}

class ConfigurationRequiredApp extends StatelessWidget {
  const ConfigurationRequiredApp({super.key, this.initializationFailed = false});
  final bool initializationFailed;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DD WORLD CONNECT Setup',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: DDWorldConnectApp.brandBlue),
      ),
      home: Scaffold(
        body: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(28),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.settings_suggest_outlined, size: 58, color: DDWorldConnectApp.brandBlue),
                    const SizedBox(height: 20),
                    const Text(
                      'DD WORLD CONNECT',
                      style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      initializationFailed
                          ? 'Supabase could not be initialized. Verify the project URL, publishable key, and network connection.'
                          : 'Supabase configuration is required before login can be used.',
                      textAlign: TextAlign.center,
                      style: const TextStyle(height: 1.5),
                    ),
                    const SizedBox(height: 18),
                    const SelectableText(
                      'Build with --dart-define=SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co '
                      '--dart-define=SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Use only the Supabase publishable key in the mobile app. Never include a service-role or secret key.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Color(0xFF667085), fontSize: 12, height: 1.5),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
