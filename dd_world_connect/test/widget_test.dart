import 'package:flutter_test/flutter_test.dart';
import 'package:dd_world_connect/main.dart';

void main() {
  testWidgets('requires explicit Supabase configuration before login', (tester) async {
    await tester.pumpWidget(const ConfigurationRequiredApp());

    expect(find.text('DD WORLD CONNECT'), findsOneWidget);
    expect(find.textContaining('Supabase configuration is required'), findsOneWidget);
    expect(find.textContaining('SUPABASE_PUBLISHABLE_KEY'), findsOneWidget);
  });
}
