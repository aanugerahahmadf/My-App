import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/constants/app_sizes.dart';

class VoucherCard extends StatelessWidget {
  final Map<String, dynamic> voucher;

  const VoucherCard({super.key, required this.voucher});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 8),
      padding: const EdgeInsets.all(AppSizes.md),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [AppColors.primaryColor, AppColors.secondaryColor]),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(voucher['name'] as String? ?? '', style: AppTextStyles.titleMedium.copyWith(color: Colors.white)),
          const SizedBox(height: 4),
          Text(voucher['description'] as String? ?? '', style: AppTextStyles.bodySmall.copyWith(color: Colors.white70)),
          if (voucher['discount'] != null) ...[
            const SizedBox(height: 8),
            Text('${'diskon'.tr()} ${voucher['discount']}%', style: AppTextStyles.titleLarge.copyWith(color: Colors.white)),
          ],
        ],
      ),
    );
  }
}
