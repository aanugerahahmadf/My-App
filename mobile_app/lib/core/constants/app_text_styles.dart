import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTextStyles {
  AppTextStyles._();

  static TextStyle displayLarge = GoogleFonts.inter(
    fontSize: 32, fontWeight: FontWeight.w700, color: AppColors.textPrimary,
    letterSpacing: -0.5,
  );
  static TextStyle displayMedium = GoogleFonts.inter(
    fontSize: 28, fontWeight: FontWeight.w600, color: AppColors.textPrimary,
    letterSpacing: -0.3,
  );
  static TextStyle headlineLarge = GoogleFonts.inter(
    fontSize: 24, fontWeight: FontWeight.w600, color: AppColors.textPrimary,
  );
  static TextStyle headlineMedium = GoogleFonts.inter(
    fontSize: 20, fontWeight: FontWeight.w600, color: AppColors.textPrimary,
  );
  static TextStyle headlineSmall = GoogleFonts.inter(
    fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textPrimary,
  );
  static TextStyle titleLarge = GoogleFonts.inter(
    fontSize: 17, fontWeight: FontWeight.w600, color: AppColors.textPrimary,
  );
  static TextStyle titleMedium = GoogleFonts.inter(
    fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary,
  );
  static TextStyle titleSmall = GoogleFonts.inter(
    fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary,
  );
  static TextStyle bodyLarge = GoogleFonts.inter(
    fontSize: 16, fontWeight: FontWeight.w400, color: AppColors.textPrimary,
  );
  static TextStyle bodyMedium = GoogleFonts.inter(
    fontSize: 14, fontWeight: FontWeight.w400, color: AppColors.textPrimary,
  );
  static TextStyle bodySmall = GoogleFonts.inter(
    fontSize: 13, fontWeight: FontWeight.w400, color: AppColors.textSecondary,
  );
  static TextStyle labelLarge = GoogleFonts.inter(
    fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textSecondary,
  );
  static TextStyle labelMedium = GoogleFonts.inter(
    fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textSecondary,
  );
  static TextStyle labelSmall = GoogleFonts.inter(
    fontSize: 11, fontWeight: FontWeight.w500, color: AppColors.textTertiary,
  );
  static TextStyle price = GoogleFonts.inter(
    fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.primaryColor,
  );
  static TextStyle priceSmall = GoogleFonts.inter(
    fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primaryColor,
  );
  static TextStyle button = GoogleFonts.inter(
    fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white,
  );
}
