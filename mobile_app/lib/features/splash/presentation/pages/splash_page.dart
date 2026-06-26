import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:easy_localization/easy_localization.dart';

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> with SingleTickerProviderStateMixin {
  final _storage = const FlutterSecureStorage();

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    final completer = Completer<void>();
    Timer(const Duration(seconds: 3), () {
      if (!completer.isCompleted) completer.complete();
    });

    String? token;
    try {
      token = await _storage.read(key: 'auth_token');
    } catch (_) {}

    await completer.future;

    if (!mounted) return;

    if (token != null && token.isNotEmpty) {
      context.go('/home');
      return;
    }

    final prefs = await SharedPreferences.getInstance();
    final onboardingSeen = prefs.getBool('onboarding_seen') ?? false;

    if (!mounted) return;

    if (!onboardingSeen) {
      context.go('/onboarding');
    } else {
      context.go('/sign-in');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          Image.asset(
            'assets/images/article/article-4.png',
            fit: BoxFit.cover,
          ),
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withValues(alpha: 0.1),
                  Colors.black.withValues(alpha: 0.5),
                ],
              ),
            ),
          ),
          SafeArea(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(flex: 2),
                Image.asset(
                  'assets/images/logo.png',
                  width: 130,
                  height: 130,
                ).animate().scale(duration: 800.ms, curve: Curves.easeOutBack).fadeIn(duration: 600.ms),
                const SizedBox(height: 20),
                Text(
                  'wedding_organizer'.tr(),
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    shadows: [Shadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 8)],
                  ),
                ).animate().fadeIn(duration: 800.ms, delay: 300.ms).slideY(begin: 0.2, end: 0, duration: 600.ms),
                const SizedBox(height: 8),
                Text(
                  'dekorasi_pernikahan_impian'.tr(),
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white.withValues(alpha: 0.9),
                  ),
                ).animate().fadeIn(duration: 800.ms, delay: 500.ms),
                const Spacer(flex: 3),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
