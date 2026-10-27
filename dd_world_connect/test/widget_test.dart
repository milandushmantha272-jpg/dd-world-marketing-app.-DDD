import 'package:flutter_test/flutter_test.dart';
import 'package:dd_world_connect/main.dart';

void main() {
  testWidgets('shows DD WORLD CONNECT foundation dashboard', (tester) async {
    await tester.pumpWidget(const DDWorldConnectApp());

    expect(find.text('DD WORLD CONNECT'), findsOneWidget);
    expect(find.text('DD WORLD MARKETING'), findsOneWidget);
    expect(find.text('Employees'), findsOneWidget);
    expect(find.text('Attendance'), findsOneWidget);
    expect(find.text('Activations'), findsOneWidget);
  });
}
