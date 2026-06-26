import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/widgets/app_shimmer.dart';
import '../../../../core/utils/formatters.dart';

class ProductCard extends StatelessWidget {
  final Map<String, dynamic> item;
  final String type;
  final VoidCallback? onTap;

  const ProductCard({super.key, required this.item, required this.type, this.onTap});

  @override
  Widget build(BuildContext context) {
    final media = item['media'] as List? ?? [];
    final image = media.isNotEmpty && media[0] is Map
        ? (media[0]['url'] as String? ?? '')
        : (item['image'] as String? ?? '');
    final name = item['name'] as String? ?? '';
    final price = item['price'] as int? ?? 0;
    final discountPrice = item['discount_price'] as int?;
    final rating = (item['rating'] as num?)?.toDouble();

    return GestureDetector(
      onTap: onTap,
      child: Card(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: CachedNetworkImage(
                imageUrl: image,
                width: double.infinity, fit: BoxFit.cover,
                placeholder: (_, _) => const AppShimmer(height: 150),
                errorWidget: (_, _, _) => Container(color: Colors.grey[200], child: const Icon(Icons.broken_image, color: Colors.grey)),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, style: AppTextStyles.bodyMedium, maxLines: 2, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(Formatters.currency(price), style: AppTextStyles.titleMedium.copyWith(color: AppColors.primaryColor, fontSize: 13)),
                      if (discountPrice != null) ...[
                        const SizedBox(width: 4),
                        Flexible(
                          child: Text(Formatters.currency(discountPrice), style: AppTextStyles.bodySmall.copyWith(
                            decoration: TextDecoration.lineThrough, fontSize: 10,
                          ), overflow: TextOverflow.ellipsis),
                        ),
                      ],
                    ],
                  ),
                  if (rating != null) ...[
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.star, size: 12, color: AppColors.warningColor),
                        const SizedBox(width: 2),
                        Text(rating.toStringAsFixed(1), style: AppTextStyles.bodySmall.copyWith(fontSize: 10)),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
