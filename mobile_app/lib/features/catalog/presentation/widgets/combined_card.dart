import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_shadows.dart';
import '../../../../core/widgets/app_shimmer.dart';
import '../../../../core/utils/formatters.dart';
import '../../data/models/item_model.dart';

class CombinedCard extends StatefulWidget {
  final ItemModel item;
  final String type;
  final VoidCallback? onTap;
  final double? similarity;

  const CombinedCard({super.key, required this.item, required this.type, this.onTap, this.similarity});

  @override
  State<CombinedCard> createState() => _CombinedCardState();
}

class _CombinedCardState extends State<CombinedCard> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final media = widget.item.media ?? [];
    final image = media.isNotEmpty && media[0] is Map
        ? (media[0]['url'] as String? ?? '')
        : (widget.item.imageUrl ?? '');
    final name = widget.item.name;
    final price = widget.item.finalPrice.toInt();
    final discountPrice = widget.item.discountPrice?.toInt();
    final rating = widget.item.averageRating;
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) {
        setState(() => _isPressed = false);
        widget.onTap?.call();
      },
      onTapCancel: () => setState(() => _isPressed = false),
      child: AnimatedScale(
        scale: _isPressed ? 0.97 : 1.0,
        duration: const Duration(milliseconds: 150),
        curve: Curves.easeOut,
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            boxShadow: AppShadows.card,
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AspectRatio(
                aspectRatio: 1,
                child: Stack(
                  children: [
                    CachedNetworkImage(
                      imageUrl: image,
                      width: double.infinity, fit: BoxFit.cover,
                      placeholder: (_, _) => const AppShimmer(height: 200),
                      errorWidget: (_, _, _) => Container(color: const Color(0xFFF5F5F5), child: const Icon(Icons.image_outlined, color: Color(0xFFD0D0D0), size: 40)),
                    ),
                    Positioned(
                      top: 0, left: 0, right: 0,
                      child: Container(
                        height: 60,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter, end: Alignment.bottomCenter,
                            colors: [Colors.black.withAlpha(60), Colors.transparent],
                          ),
                        ),
                      ),
                    ),
                    if (discountPrice != null)
                      Positioned(
                        top: 10, right: 10,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.errorColor,
                            borderRadius: BorderRadius.circular(6),
                            boxShadow: [
                              BoxShadow(color: AppColors.errorColor.withAlpha(60), blurRadius: 6, offset: const Offset(0, 2)),
                            ],
                          ),
                          child: Text(
                            '-${((price - discountPrice) / price * 100).round()}%',
                            style: const TextStyle(
                              color: Colors.white, fontSize: 10,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ),
                    if (widget.similarity != null)
                      Positioned(
                        bottom: 8, left: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.black.withAlpha(160),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.auto_awesome, size: 11, color: AppColors.warningColor),
                              const SizedBox(width: 3),
                              Text('${(widget.similarity! * 100).round()}%',
                                style: const TextStyle(
                                  color: Colors.white, fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name,
                      style: const TextStyle(
                        fontSize: 13, fontWeight: FontWeight.w600,
                        color: Color(0xFF1A1A2E), height: 1.3,
                      ),
                      maxLines: 2, overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Expanded(
                          child: Text(Formatters.currency(price),
                            style: const TextStyle(
                              fontSize: 14, fontWeight: FontWeight.w700,
                              color: AppColors.primaryColor,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (discountPrice != null)
                          Padding(
                            padding: const EdgeInsets.only(left: 6),
                            child: Text(Formatters.currency(discountPrice),
                              style: const TextStyle(
                                fontSize: 11, fontWeight: FontWeight.w400,
                                color: AppColors.textTertiary,
                                decoration: TextDecoration.lineThrough,
                              ),
                            ),
                          ),
                      ],
                    ),
                    if (rating > 0) ...[
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Icon(Icons.star_rounded, size: 14, color: AppColors.warningColor.withAlpha(200)),
                          const SizedBox(width: 3),
                          Text(rating.toStringAsFixed(1),
                            style: const TextStyle(
                              fontSize: 11, fontWeight: FontWeight.w500,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
