import 'package:flutter/material.dart';
import 'package:fl_writer/screens/home_screen.dart';

void main() {
  // Ensure Flutter bindings are initialized for desktop.
  // WidgetsFlutterBinding.ensureInitialized(); // This might be needed for some plugins or specific desktop setups

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Children\'s Book & Comic Creator',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: const HomeScreen(),
    );
  }
} 