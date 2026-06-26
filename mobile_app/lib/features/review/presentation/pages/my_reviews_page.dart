import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/constants/app_sizes.dart';
import '../../../../core/widgets/app_shimmer.dart';
import '../../../../core/widgets/app_empty_state.dart';
import '../../../../core/widgets/app_error_state.dart';
import '../../../../core/utils/formatters.dart';
import '../providers/my_reviews_provider.dart';

class MyReviewsPage extends ConsumerStatefulWidget {
  const MyReviewsPage({super.key});

  @override
  ConsumerState<MyReviewsPage> createState() => _MyReviewsPageState();
}

class _MyReviewsPageState extends ConsumerState<MyReviewsPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(myReviewsProvider.notifier).fetchMyReviews());
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(myReviewsProvider);

    return Scaffold(
      appBar: AppBar(title: Text('ulasan_saya'.tr())),
      body: state.loading
          ? const Center(child: CircularProgressIndicator())
          : state.error != null
              ? AppErrorState(message: state.error!, onRetry: () => ref.read(myReviewsProvider.notifier).fetchMyReviews())
              : state.reviews.isEmpty
                  ? AppEmptyState(
                      icon: Icons.star_border,
                      title: 'tidak_ada_ulasan'.tr(),
                      subtitle: 'anda_belum_ulasan'.tr(),
                    )
                  : RefreshIndicator(
                      onRefresh: () => ref.read(myReviewsProvider.notifier).fetchMyReviews(),
                      child: ListView.builder(
                        padding: const EdgeInsets.all(AppSizes.md),
                        itemCount: state.reviews.length,
                        itemBuilder: (_, i) {
                          final r = state.reviews[i];
                          final package = r['package'] as Map<String, dynamic>?;
                          final media = package?['media'] as List? ?? [];
                          final image = media.isNotEmpty ? (media[0] is Map ? media[0]['url'] : '') : '';
                          final name = package?['name'] as String? ?? 'paket'.tr();
                          final rating = (r['rating'] as num?)?.toInt() ?? 0;
                          final comment = r['comment'] as String? ?? '';
                          final date = r['created_at'] as String? ?? '';

                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            clipBehavior: Clip.antiAlias,
                            child: Padding(
                              padding: const EdgeInsets.all(12),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: CachedNetworkImage(
                                      imageUrl: image,
                                      width: 72,
                                      height: 72,
                                      fit: BoxFit.cover,
                                      placeholder: (_, _) => AppShimmer(width: 72, height: 72),
                                      errorWidget: (_, _, _) => Container(width: 72, height: 72, color: Colors.grey[200], child: const Icon(Icons.broken_image, size: 32)),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(name, style: AppTextStyles.titleMedium),
                                        const SizedBox(height: 4),
                                        Row(
                                          children: List.generate(5, (j) => Icon(
                                            j < rating ? Icons.star : Icons.star_border,
                                            size: 16,
                                            color: Colors.amber,
                                          )),
                                        ),
                                        if (comment.isNotEmpty) ...[
                                          const SizedBox(height: 6),
                                          Text(comment, style: AppTextStyles.bodySmall, maxLines: 3, overflow: TextOverflow.ellipsis),
                                        ],
                                        if (date.isNotEmpty) ...[
                                          const SizedBox(height: 4),
                                          Text(Formatters.date(date), style: AppTextStyles.bodySmall),
                                        ],
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
