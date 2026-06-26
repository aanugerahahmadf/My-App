import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_sizes.dart';

class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final bool disabled;
  final ButtonType type;
  final IconData? icon;
  final double? width;
  final double? height;

  const AppButton({
    super.key,
    required this.label,
    this.onPressed,
    this.loading = false,
    this.disabled = false,
    this.type = ButtonType.primary,
    this.icon,
    this.width,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    final isDisabled = disabled || loading;
    final effectiveWidth = width ?? double.infinity;

    Widget child;
    if (loading) {
      child = const SizedBox(
        width: 22, height: 22,
        child: CircularProgressIndicator(
          strokeWidth: 2.5, color: Colors.white,
        ),
      );
    } else {
      child = Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (icon != null) ...[Icon(icon, size: 20), const SizedBox(width: 8)],
          Text(label),
        ],
      );
    }

    switch (type) {
      case ButtonType.primary:
        return SizedBox(
          width: effectiveWidth,
          height: height ?? 52,
          child: ElevatedButton(
            onPressed: isDisabled ? null : onPressed,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryColor,
              disabledBackgroundColor: AppColors.primaryColor.withAlpha(128),
              elevation: 0,
              shadowColor: AppColors.primaryColor.withAlpha(76),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppSizes.buttonRadius),
              ),
            ),
            child: child,
          ),
        );
      case ButtonType.primaryGradient:
        return SizedBox(
          width: effectiveWidth,
          height: height ?? 52,
          child: DecoratedBox(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppSizes.buttonRadius),
              gradient: AppColors.primaryGradient,
              boxShadow: [
                BoxShadow(
                  color: AppColors.primaryColor.withAlpha(76),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: ElevatedButton(
              onPressed: isDisabled ? null : onPressed,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                disabledBackgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppSizes.buttonRadius),
                ),
              ),
              child: child,
            ),
          ),
        );
      case ButtonType.outline:
        return SizedBox(
          width: effectiveWidth,
          height: height ?? 52,
          child: OutlinedButton(
            onPressed: isDisabled ? null : onPressed,
            style: OutlinedButton.styleFrom(
              side: BorderSide(
                color: isDisabled
                    ? AppColors.primaryColor.withAlpha(77)
                    : AppColors.primaryColor,
              ),
              foregroundColor: isDisabled
                  ? AppColors.primaryColor.withAlpha(128)
                  : AppColors.primaryColor,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppSizes.buttonRadius),
              ),
            ),
            child: child,
          ),
        );
      case ButtonType.text:
        return TextButton(
          onPressed: isDisabled ? null : onPressed,
          style: TextButton.styleFrom(
            foregroundColor: isDisabled
                ? AppColors.primaryColor.withAlpha(128)
                : AppColors.primaryColor,
            textStyle: const TextStyle(fontWeight: FontWeight.w600),
          ),
          child: child,
        );
    }
  }
}

enum ButtonType { primary, primaryGradient, outline, text }
