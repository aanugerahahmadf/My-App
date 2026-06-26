import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class AppSnackBar {
  static void show(BuildContext context, String message, {SnackBarType type = SnackBarType.info}) {
    final colors = {
      SnackBarType.success: AppColors.successColor,
      SnackBarType.error: AppColors.errorColor,
      SnackBarType.warning: AppColors.warningColor,
      SnackBarType.info: AppColors.primaryColor,
    };

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: colors[type],
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        margin: const EdgeInsets.all(16),
        dismissDirection: DismissDirection.horizontal,
        duration: const Duration(seconds: 3),
      ),
    );
  }
}

enum SnackBarType { success, error, warning, info }
