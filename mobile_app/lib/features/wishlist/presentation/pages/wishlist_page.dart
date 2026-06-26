import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/constants/app_sizes.dart';
import '../../../../core/widgets/app_shimmer.dart';
import '../../../../core/widgets/app_empty_state.dart';
import '../../../../core/widgets/app_error_state.dart';
import '../../../../core/utils/formatters.dart';
import 'package:easy_localization/easy_localization.dart';
import '../providers/wishlist_provider.dart';

class WishlistPage extends ConsumerStatefulWidget {
  const WishlistPage({super.key});

  @override
  ConsumerState<WishlistPage> createState() => _WishlistPageState();
}

class _WishlistPageState extends ConsumerState<WishlistPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(wishlistProvider.notifier).fetchWishlist());
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(wishlistProvider);

    return Scaffold(
      appBar: AppBar(title: Text('favorit'.tr())),
      body: state.loading
          ? const Center(child: CircularProgressIndicator())
          : state.error != null
              ? AppErrorState(message: state.error!, onRetry: () => ref.read(wishlistProvider.notifier).fetchWishlist())
              : state.items.isEmpty
                  ? AppEmptyState(
                      icon: Icons.favorite_border,
                      title: 'wishlist_kosong'.tr(),
                      subtitle: 'tambah_favorit_hint'.tr(),
                    )
                  : RefreshIndicator(
                      onRefresh: () => ref.read(wishlistProvider.notifier).fetchWishlist(),
                      child: GridView.builder(
                        padding: const EdgeInsets.all(AppSizes.md),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 0.7,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                        ),
                        itemCount: state.items.length,
                        itemBuilder: (_, i) {
                          final item = state.items[i];
                          final pkg = (item['package'] ?? item['product']) as Map<String, dynamic>? ?? {};
                          final media = pkg['media'] as List? ?? [];
                          final image = media.isNotEmpty ? (media[0] is Map ? media[0]['url'] : '') : '';
                          final name = pkg['name'] as String? ?? '';
                          final price = (pkg['price'] as num?)?.toInt() ?? 0;

                          return Card(
                            clipBehavior: Clip.antiAlias,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  child: Stack(
                                    children: [
                                      CachedNetworkImage(
                                        imageUrl: image,
                                        width: double.infinity,
                                        fit: BoxFit.cover,
                                        placeholder: (_, _) => AppShimmer(height: 150),
                                        errorWidget: (_, _, _) => Container(color: Colors.grey[200], child: const Icon(Icons.broken_image)),
                                      ),
                                      Positioned(
                                        top: 6, right: 6,
                                        child: GestureDetector(
                                          onTap: () => ref.read(wishlistProvider.notifier).remove(item),
                                          child: Container(
                                            padding: const EdgeInsets.all(4),
                                            decoration: const BoxDecoration(
                                              color: Colors.white,
                                              shape: BoxShape.circle,
                                            ),
                                            child: const Icon(Icons.close, size: 16, color: AppColors.errorColor),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Padding(
                                  padding: const EdgeInsets.all(8),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(name, style: AppTextStyles.bodyMedium, maxLines: 2, overflow: TextOverflow.ellipsis),
                                      const SizedBox(height: 4),
                                      Text(Formatters.currency(price), style: AppTextStyles.titleMedium.copyWith(color: AppColors.primaryColor)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
