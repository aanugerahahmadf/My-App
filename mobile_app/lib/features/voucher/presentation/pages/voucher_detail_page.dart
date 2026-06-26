import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/constants/app_sizes.dart';
import '../../../../core/utils/formatters.dart';
import '../../data/models/voucher_model.dart';

class VoucherDetailPage extends ConsumerWidget {
  final VoucherModel voucher;
  const VoucherDetailPage({super.key, required this.voucher});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: Text(voucher.code)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSizes.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSizes.lg),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFFF57C00), Color(0xFFFF9800)]),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  const Icon(Icons.discount_rounded, color: Colors.white, size: 48),
                  const SizedBox(height: 12),
                  Text(voucher.code,
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white),
                  ),
                  if (voucher.description != null) ...[
                    const SizedBox(height: 6),
                    Text(voucher.description!,
                      style: const TextStyle(fontSize: 13, color: Colors.white70),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: AppSizes.md),
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(AppSizes.md),
                child: Column(
                  children: [
                    _infoRow(Icons.local_offer, 'diskon'.tr(), voucher.isPercentage
                        ? '${voucher.discountAmount}%'
                        : Formatters.currency(voucher.discountAmount.toInt())),
                    const Divider(),
                    _infoRow(Icons.shopping_bag, 'minimal_pembelian'.tr(), Formatters.currency(voucher.minPurchase.toInt())),
                    const Divider(),
                    _infoRow(Icons.access_time, 'kedaluwarsa'.tr(), voucher.expiresAt ?? '-'),
                    if (voucher.maxUses != null) ...[
                      const Divider(),
                      _infoRow(Icons.repeat, 'maksimal_pemakaian'.tr(), '${voucher.maxUses}'),
                    ],
                    const Divider(),
                    _infoRow(Icons.info_outline, 'status'.tr(), voucher.isActive ? 'Aktif' : 'Tidak Aktif'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.textSecondary),
          const SizedBox(width: 12),
          Expanded(
            child: Text(label, style: AppTextStyles.bodyMedium),
          ),
          Text(value, style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
