import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/constants/app_sizes.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_shimmer.dart';
import '../../../../core/widgets/app_empty_state.dart';
import '../providers/voucher_provider.dart';
import '../../data/models/voucher_model.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/utils/formatters.dart';

class VoucherListPage extends ConsumerStatefulWidget {
  const VoucherListPage({super.key});

  @override
  ConsumerState<VoucherListPage> createState() => _VoucherListPageState();
}

class _VoucherListPageState extends ConsumerState<VoucherListPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(voucherProvider.notifier).fetchVouchers());
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(voucherProvider);

    return Scaffold(
      appBar: AppBar(title: Text('voucher_saya'.tr())),
      body: state.loading
          ? ListView.builder(
              padding: const EdgeInsets.all(AppSizes.md),
              itemCount: 4,
              itemBuilder: (_, _) => Padding(
                padding: const EdgeInsets.only(bottom: AppSizes.md),
                child: AppShimmer(height: 140, borderRadius: AppSizes.cardRadius),
              ),
            )
          : state.error != null
              ? Center(child: Text(state.error!, style: AppTextStyles.bodyMedium))
              : state.vouchers.isEmpty
                  ? AppEmptyState(
                      icon: Icons.card_giftcard_outlined,
                      title: 'tidak_ada_voucher'.tr(),
                      subtitle: 'belum_ada_voucher'.tr(),
                    )
                  : RefreshIndicator(
                      onRefresh: () => ref.read(voucherProvider.notifier).fetchVouchers(),
                      child: ListView.builder(
                        padding: const EdgeInsets.all(AppSizes.md),
                        itemCount: state.vouchers.length,
                        itemBuilder: (_, i) => _buildVoucherCard(state.vouchers[i]),
                      ),
                    ),
    );
  }

  Widget _buildVoucherCard(VoucherModel voucher) {
    final name = voucher.code;
    final desc = voucher.description ?? '';
    final discount = voucher.discountAmount.toInt();
    final isExpired = voucher.isExpired;
    final id = voucher.id.toString();

    final discountLabel = voucher.isPercentage
        ? 'diskon_persen'.tr(namedArgs: {'discount': '$discount'})
        : Formatters.currency(discount);

    return Container(
      margin: const EdgeInsets.only(bottom: AppSizes.md),
      decoration: BoxDecoration(
        gradient: isExpired
            ? null
            : AppColors.primaryGradient,
        color: isExpired ? Colors.grey[200] : null,
        borderRadius: BorderRadius.circular(AppSizes.cardRadius),
        boxShadow: [
          BoxShadow(
            color: (isExpired ? Colors.black : AppColors.primaryColor).withAlpha(20),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppSizes.cardRadius),
        child: Padding(
          padding: const EdgeInsets.all(AppSizes.md),
          child: Row(
            children: [
              Container(
                width: 72, height: 72,
                decoration: BoxDecoration(
                  color: Colors.white.withAlpha(51),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(Icons.card_giftcard, color: Colors.white, size: 32),
              ),
              const SizedBox(width: AppSizes.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: AppTextStyles.titleMedium.copyWith(
                      color: isExpired ? AppColors.textSecondary : Colors.white,
                      fontWeight: FontWeight.w600,
                    )),
                    const SizedBox(height: 4),
                    Text(desc, style: AppTextStyles.bodySmall.copyWith(
                      color: isExpired ? AppColors.textTertiary : Colors.white70,
                    )),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        if (discount > 0) ...[
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.white.withAlpha(51),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(discountLabel, style: AppTextStyles.labelSmall.copyWith(
                              color: isExpired ? AppColors.textSecondary : Colors.white,
                              fontWeight: FontWeight.w600,
                            )),
                          ),
                          const SizedBox(width: 8),
                        ],
                        Text(name, style: AppTextStyles.labelSmall.copyWith(
                          color: isExpired ? AppColors.textTertiary : Colors.white60,
                          letterSpacing: 1.5,
                        )),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AppSizes.sm),
              if (isExpired)
                Text('kedaluwarsa'.tr(), style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary))
              else
                SizedBox(
                  width: 72,
                  child: AppButton(
                    label: 'klaim'.tr(),
                    onPressed: () => _claimVoucher(id),
                    type: ButtonType.primary,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _claimVoucher(String id) async {
    final success = await ref.read(voucherProvider.notifier).claimVoucher(id);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(success ? 'voucher_berhasil_diklaim'.tr() : 'gagal_klaim_voucher'.tr()),
        backgroundColor: success ? AppColors.successColor : AppColors.errorColor,
      ));
    }
  }
}
