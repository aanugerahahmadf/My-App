import 'dart:io';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/constants/app_sizes.dart';
import '../../../../core/widgets/app_shimmer.dart';
import '../../../../core/widgets/app_empty_state.dart';
import '../../../../core/widgets/app_error_state.dart';
import '../../../../core/api/dio_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../../../search/presentation/widgets/global_search_bar.dart';
import '../../../catalog/presentation/widgets/combined_card.dart';
import '../../data/models/cbir_result_model.dart';
import '../providers/cbir_provider.dart';

class CbirResultPage extends ConsumerStatefulWidget {
  const CbirResultPage({super.key});

  @override
  ConsumerState<CbirResultPage> createState() => _CbirResultPageState();
}

class _CbirResultPageState extends ConsumerState<CbirResultPage> {
  static const _sortOptions = [
    ('Kemiripan', null),
    ('Harga: Terendah', 'price_asc'),
    ('Harga: Tertinggi', 'price_desc'),
    ('Terbaru', 'newest'),
    ('Rating Tertinggi', 'rating_desc'),
  ];

  List<Map<String, dynamic>> _categories = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final extra = GoRouterState.of(context).extra;
      if (extra is File) {
        ref.read(cbirProvider.notifier).search(extra);
      }
    });
    _fetchCategories();
  }

  Future<void> _fetchCategories() async {
    try {
      final res = await DioClient.instance.get(ApiEndpoints.categories);
      final data = res.data['data'];
      if (data is List) {
        if (mounted) setState(() => _categories = data.cast<Map<String, dynamic>>());
      }
    } catch (_) {}
  }

  String _routeType(String cbirType) {
    return cbirType == 'package' ? 'packages' : 'products';
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(cbirProvider);
    return Scaffold(
      body: Column(
        children: [
          Container(
            padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + AppSizes.sm, left: AppSizes.md, right: AppSizes.md, bottom: AppSizes.md),
            decoration: const BoxDecoration(color: AppColors.primaryColor),
            child: const GlobalSearchBar(translucent: true),
          ),
          Expanded(child: _buildBody(context, state)),
        ],
      ),
    );
  }

  Widget _buildBody(BuildContext context, CbirState state) {
    if (state.loading && state.results.isEmpty) {
      return const CustomScrollView(
        slivers: [
          SliverPadding(
            padding: EdgeInsets.all(AppSizes.md),
            sliver: AppShimmerGrid(itemCount: 6, crossAxisCount: 2),
          ),
        ],
      );
    }

    if (state.error != null && state.results.isEmpty) {
      return AppErrorState(
        message: state.error ?? 'error_umum'.tr(),
      );
    }

    if (state.results.isEmpty && state.uploadedImagePath == null) {
      return AppEmptyState(
        title: 'cari_gambar'.tr(),
        subtitle: 'unggah_gambar_cari'.tr(),
      );
    }

    if (state.results.isEmpty) {
      return Column(
        children: [
          _buildImageHeader(state),
          Expanded(
            child: AppEmptyState(
              title: 'hasil_tidak_ditemukan'.tr(),
              subtitle: 'coba_gambar_lain'.tr(),
            ),
          ),
        ],
      );
    }

    return Column(
      children: [
        _buildImageHeader(state),
        _buildFilters(state),
        Expanded(child: _buildResultsGrid(context, state)),
      ],
    );
  }

  Widget _buildImageHeader(CbirState state) {
    if (state.uploadedImagePath == null) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSizes.md, AppSizes.sm, AppSizes.md, 0),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.file(
              File(state.uploadedImagePath!),
              width: 56,
              height: 56,
              fit: BoxFit.cover,
              errorBuilder: (_, _, _) => Container(
                width: 56,
                height: 56,
                color: Colors.grey[200],
                child: const Icon(Icons.broken_image, color: Colors.grey),
              ),
            ),
          ),
          SizedBox(width: AppSizes.md),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('hasil_pencarian_serupa'.tr(),
                  style: AppTextStyles.titleMedium),
              Text('item_count'.tr(namedArgs: {'count': '${state.results.length}'}),
                  style: AppTextStyles.bodySmall),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFilters(CbirState state) {
    final notifier = ref.read(cbirProvider.notifier);
    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSizes.md, AppSizes.sm, AppSizes.md, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 36,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _sortOptions.length,
              separatorBuilder: (_, _) => const SizedBox(width: 8),
              itemBuilder: (_, i) {
                final (label, value) = _sortOptions[i];
                final selected = state.sortBy == value;
                return FilterChip(
                  label: Text(label.tr(), style: TextStyle(fontSize: 12, fontWeight: selected ? FontWeight.w600 : FontWeight.normal)),
                  selected: selected,
                  onSelected: (_) => notifier.setSortBy(value),
                  selectedColor: AppColors.secondaryColor,
                  checkmarkColor: AppColors.primaryColor,
                  visualDensity: VisualDensity.compact,
                );
              },
            ),
          ),
          SizedBox(height: AppSizes.sm),
          Row(
            children: [
              if (_categories.isNotEmpty)
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: AppColors.secondaryColor.withAlpha(30),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: state.categoryId,
                        isExpanded: true,
                        hint: const Text('Semua Kategori', style: TextStyle(fontSize: 12)),
                        items: [
                          const DropdownMenuItem(value: null, child: Text('Semua Kategori', style: TextStyle(fontSize: 12))),
                          ..._categories.map((c) => DropdownMenuItem(
                            value: '${c['id']}',
                            child: Text(c['name'] as String? ?? '', style: const TextStyle(fontSize: 12)),
                          )),
                        ],
                        onChanged: (v) => notifier.setCategoryId(v),
                      ),
                    ),
                  ),
                ),
              const SizedBox(width: AppSizes.sm),
              FilterChip(
                label: Text('diskon'.tr(), style: TextStyle(fontSize: 12, fontWeight: state.hasDiscount == true ? FontWeight.w600 : FontWeight.normal)),
                selected: state.hasDiscount == true,
                onSelected: (v) => notifier.setHasDiscount(v),
                selectedColor: AppColors.secondaryColor,
                checkmarkColor: AppColors.primaryColor,
                visualDensity: VisualDensity.compact,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildResultsGrid(BuildContext context, CbirState state) {
    final items = state.filteredResults;
    return GridView.builder(
      padding: const EdgeInsets.all(AppSizes.md),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.72,
        crossAxisSpacing: AppSizes.md,
        mainAxisSpacing: AppSizes.md,
      ),
      itemCount: items.length,
      itemBuilder: (_, i) => _buildGridItem(items[i]),
    );
  }

  Widget _buildGridItem(CbirResultItem item) {
    return CombinedCard(
      item: item.data,
      type: item.type,
      similarity: item.similarity / 100,
      onTap: () => context.go('/catalog/${_routeType(item.type)}/${item.data.id}'),
    );
  }
}
