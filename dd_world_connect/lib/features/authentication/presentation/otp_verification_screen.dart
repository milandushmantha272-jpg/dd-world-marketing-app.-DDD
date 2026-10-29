import 'package:flutter/material.dart';

import '../data/auth_repository.dart';

class OtpVerificationScreen extends StatefulWidget {
  const OtpVerificationScreen({super.key, required this.phoneNumber});
  final String phoneNumber;

  @override
  State<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends State<OtpVerificationScreen> {
  final _tokenController = TextEditingController();
  final _repository = AuthRepository();
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _tokenController.dispose();
    super.dispose();
  }

  Future<void> _verify() async {
    FocusScope.of(context).unfocus();
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await _repository.verifyPhoneOtp(
        inputPhone: widget.phoneNumber,
        token: _tokenController.text,
      );
      if (!mounted) return;
      // AuthGate observes Supabase's signed-in event, validates employee status,
      // loads the profile and registers/validates the installation on the server.
      Navigator.of(context).popUntil((route) => route.isFirst);
    } catch (error) {
      if (mounted) {
        setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verify mobile number')),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Icon(Icons.sms_outlined, size: 56, color: Color(0xFF1F5AA6)),
                  const SizedBox(height: 20),
                  const Text(
                    'Enter your OTP',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Enter the 6-digit code sent to ${widget.phoneNumber}.',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Color(0xFF667085)),
                  ),
                  const SizedBox(height: 26),
                  TextField(
                    controller: _tokenController,
                    keyboardType: TextInputType.number,
                    autofillHints: const [AutofillHints.oneTimeCode],
                    maxLength: 6,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 26, letterSpacing: 10),
                    decoration: const InputDecoration(
                      labelText: '6-digit OTP',
                      counterText: '',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  if (_error != null) ...[
                    const SizedBox(height: 12),
                    Text(_error!, style: const TextStyle(color: Colors.red)),
                  ],
                  const SizedBox(height: 20),
                  FilledButton(
                    onPressed: _loading ? null : _verify,
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFF1F5AA6),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: _loading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Text('Verify and continue'),
                  ),
                  TextButton(
                    onPressed: _loading ? null : () => Navigator.of(context).pop(),
                    child: const Text('Change mobile number'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
