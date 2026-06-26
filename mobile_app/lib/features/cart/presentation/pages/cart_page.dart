import 'package:cached_network_image/cached_network_image.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/constants/app_sizes.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_empty_state.dart';
import '../../../../core/utils/formatters.dart';
import '../providers/cart_provider.dart';

class CartPage extends ConsumerWidget {
  const CartPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartState = ref.watch(cartProvider);
    final notifier = ref.read(cartProvider.notifier);

    return Scaffold(
      appBar: AppBar(title: Text('cart'.tr())),
      body: cartState.loading
          ? const _CartShimmer()
          : cartState.error != null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(cartState.error ?? '', style: AppTextStyles.bodyMedium),
                      const SizedBox(height: 16),
                      AppButton(label: 'coba_lagi'.tr(), onPressed: () => notifier.fetchCart(), type: ButtonType.outline),
                    ],
                  ),
                )
              : cartState.items.isEmpty
                  ? AppEmptyState(title: 'keranjang_kosong'.tr(), subtitle: 'tidak_ada_item'.tr(), icon: Icons.shopping_cart_outlined)
                  : Column(
                      children: [
                        Expanded(
                          child: RefreshIndicator(
                            onRefresh: () => notifier.fetchCart(),
                            child: ListView.separated(
                              padding: const EdgeInsets.all(AppSizes.md),
                              itemCount: cartState.items.length,
                              separatorBuilder: (_, _) => const SizedBox(height: 12),
                              itemBuilder: (context, index) {
                                final item = cartState.items[index];
                                final itemData = (item['package'] ?? item['product']) as Map<String, dynamic>? ?? {};
                                final qty = item['quantity'] as int? ?? 1;
                                final price = (itemData['price'] as num?)?.toInt() ?? 0;
                                final imageUrl = (itemData['image_url'] as String?) ?? '';
                                final name = itemData['name'] as String? ?? 'item'.tr();

                                return Card(
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  child: Padding(
                                    padding: const EdgeInsets.all(12),
                                    child: Row(
                                      children: [
                                        ClipRRect(
                                          borderRadius: BorderRadius.circular(8),
                                          child: CachedNetworkImage(
                                            imageUrl: imageUrl,
                                            width: 80, height: 80,
                                            fit: BoxFit.cover,
                                            placeholder: (_, _) => Shimmer.fromColors(
                                              baseColor: Colors.grey[300]!,
                                              highlightColor: Colors.grey[100]!,
                                              child: Container(color: Colors.white),
                                            ),
                                            errorWidget: (_, _, _) => Container(
                                              color: Colors.grey[200],
                                              child: const Icon(Icons.broken_image, color: Colors.grey),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(name, style: AppTextStyles.bodyLarge, maxLines: 2, overflow: TextOverflow.ellipsis),
                                              const SizedBox(height: 4),
                                              Text(Formatters.currency(price), style: AppTextStyles.titleMedium.copyWith(color: AppColors.primaryColor)),
                                            ],
                                          ),
                                        ),
                                        Row(
                                          children: [
                                            IconButton(
                                              icon: const Icon(Icons.remove_circle_outline, color: AppColors.primaryColor),
                                              onPressed: qty > 1 ? () => notifier.updateQty('${item['id']}', qty - 1) : null,
                                            ),
                                            Text('$qty', style: AppTextStyles.titleMedium),
                                            IconButton(
                                              icon: const Icon(Icons.add_circle, color: AppColors.primaryColor),
                                              onPressed: () => notifier.updateQty('${item['id']}', qty + 1),
                                            ),
                                          ],
                                        ),
                                        IconButton(
                                          icon: const Icon(Icons.delete_outline, color: AppColors.errorColor),
                                          onPressed: () => notifier.removeItem('${item['id']}'),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.all(AppSizes.md),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -2))],
                          ),
                          child: SafeArea(
                            child: Column(
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('subtotal'.tr(), style: AppTextStyles.bodyMedium),
                                    Text(Formatters.currency(cartState.subtotal), style: AppTextStyles.titleMedium),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                AppButton(
                                  label: 'lanjut_ke_checkout'.tr(),
                                  onPressed: cartState.items.isEmpty ? null : () => context.push('/checkout'),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
    );
  }
}

class _CartShimmer extends StatelessWidget {
  const _CartShimmer();

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(AppSizes.md),
      itemCount: 3,
      itemBuilder: (_, _) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Shimmer.fromColors(
          baseColor: Colors.grey[300]!,
          highlightColor: Colors.grey[100]!,
          child: Container(
            height: 100,
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
          ),
        ),
      ),
    );
  }
}
