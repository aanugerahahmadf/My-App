import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  static const Color primaryColor = Color(0xFFD4537E);
  static const Color primaryDark = Color(0xFFB83A63);
  static const Color primaryLight = Color(0xFFF4C0D1);
  static const Color secondaryColor = Color(0xFFF4C0D1);
  static const Color accentColor = Color(0xFFBA7517);
  static const Color backgroundColor = Color(0xFFF8F6F7);
  static const Color surfaceColor = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFF1A1A2E);
  static const Color textSecondary = Color(0xFF8E8E9A);
  static const Color textTertiary = Color(0xFFB0B0BC);
  static const Color successColor = Color(0xFF10B981);
  static const Color errorColor = Color(0xFFEF4444);
  static const Color warningColor = Color(0xFFF59E0B);
  static const Color infoColor = Color(0xFF3B82F6);
  static const Color shimmerBase = Color(0xFFE8E8EC);
  static const Color shimmerHighlight = Color(0xFFF5F5F8);
  static const Color dividerColor = Color(0xFFF0F0F3);
  static const Color overlayColor = Color(0x883B3B4F);

  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryColor, Color(0xFFE8689A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient primaryGradientH = LinearGradient(
    colors: [primaryColor, Color(0xFFE8689A)],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const List<Color> categoryColors = [
    Color(0xFFFFE8EC),
    Color(0xFFFFF3E0),
    Color(0xFFE8F5E9),
    Color(0xFFE3F2FD),
    Color(0xFFF3E5F5),
    Color(0xFFFFF8E1),
  ];

  static const List<IconData> categoryIcons = [
    Icons.card_giftcard,
    Icons.local_florist,
    Icons.emoji_nature,
    Icons.spa,
    Icons.celebration,
    Icons.palette,
  ];
}
