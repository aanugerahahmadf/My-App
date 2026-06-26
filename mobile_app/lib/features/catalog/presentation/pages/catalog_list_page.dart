import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_sizes.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/app_shimmer.dart';
import '../../../../core/widgets/app_empty_state.dart';
import '../../../../core/widgets/app_error_state.dart';
import '../../../../core/utils/formatters.dart';
import '../providers/catalog_provider.dart';

class CatalogListPage extends ConsumerStatefulWidget {
  final String type;
  const CatalogListPage({super.key, required this.type});

  @override
  ConsumerState<CatalogListPage> createState() => _CatalogListPageState();
}

class _CatalogListPageState extends ConsumerState<CatalogListPage> {
  final ScrollController _scrollController = ScrollController();
  final List<Map<String, dynamic>> _items = [];
  int _page = 1;
  bool _hasMore = true;
  bool _loadingMore = false;
  bool _loading = true;
  String? _error;
  String? _selectedSort;

  static const _sortOptions = [
    ('Semua', null),
    ('Termurah', 'price_asc'),
    ('Termahal', 'price_desc'),
    ('Terbaru', 'newest'),
  ];

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    _fetchData();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
            _scrollController.position.maxScrollExtent - 200 &&
        _hasMore &&
        !_loadingMore) {
      _fetchMore();
    }
  }

  Future<void> _fetchData() async {
    setState(() {
      _loading = true;
      _error = null;
      _page = 1;
      _items.clear();
    });
    try {
      final repo = ref.read(catalogRepositoryProvider);
      final res = widget.type == 'packages'
          ? await repo.getPackages(sort: _selectedSort, page: 1)
          : await repo.getProducts(sort: _selectedSort, page: 1);
      final data = res['data'];
      final list = _extractList(data);
      _items.addAll(list);
      _hasMore = list.length >= 10;
    } catch (e) {
      _error = e.toString();
    }
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _fetchMore() async {
    setState(() => _loadingMore = true);
    _page++;
    try {
      final repo = ref.read(catalogRepositoryProvider);
      final res = widget.type == 'packages'
          ? await repo.getPackages(sort: _selectedSort, page: _page)
          : await repo.getProducts(sort: _selectedSort, page: _page);
      final data = res['data'];
      final list = _extractList(data);
      _items.addAll(list);
      _hasMore = list.length >= 10;
    } catch (_) {}
    if (mounted) setState(() => _loadingMore = false);
  }

  List<Map<String, dynamic>> _extractList(dynamic data) {
    if (data is List) return data.cast<Map<String, dynamic>>();
    if (data is Map && data['data'] is List) {
      return (data['data'] as List).cast<Map<String, dynamic>>();
    }
    return [];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.type == 'packages' ? 'paket_pernikahan'.tr() : 'bunga'.tr()),
        centerTitle: true,
      ),
      body: Column(
        children: [
          _buildFilterChips(),
          Expanded(child: _buildBody()),
        ],
      ),
    );
  }

  Widget _buildFilterChips() {
    return SizedBox(
      height: 48,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppSizes.md),
        itemCount: _sortOptions.length,
        separatorBuilder: (_, _) => SizedBox(width: AppSizes.sm),
        itemBuilder: (_, i) {
          final (label, value) = _sortOptions[i];
          return FilterChip(
            label: Text(label.tr()),
            selected: _selectedSort == value,
            onSelected: (_) {
              setState(() => _selectedSort = value);
              _fetchData();
            },
            selectedColor: AppColors.secondaryColor,
            checkmarkColor: AppColors.primaryColor,
          );
        },
      ),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return CustomScrollView(
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.all(AppSizes.md),
            sliver: const AppShimmerGrid(itemCount: 6, crossAxisCount: 2),
          ),
        ],
      );
    }

    if (_error != null) {
      return AppErrorState(message: _error!, onRetry: _fetchData);
    }

    if (_items.isEmpty) {
      return AppEmptyState(
        title: 'tidak_ada_data'.tr(),
        subtitle: 'belum_ada_item_tersedia'.tr(namedArgs: {'type': widget.type == 'packages' ? 'paket'.tr() : 'bunga'.tr()}),
      );
    }

    return RefreshIndicator(
      onRefresh: _fetchData,
      child: CustomScrollView(
        controller: _scrollController,
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.all(AppSizes.md),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.7,
                crossAxisSpacing: AppSizes.md,
                mainAxisSpacing: AppSizes.md,
              ),
              delegate: SliverChildBuilderDelegate(
                (_, i) {
                  final item = _items[i];
                  final media = item['media'] as List? ?? [];
                  final image = media.isNotEmpty && media[0] is Map
                      ? (media[0]['url'] as String? ?? '')
                      : (item['image'] as String? ?? '');
                  return AppCard(
                    imageUrl: image,
                    name: item['name'] as String? ?? '',
                    price: Formatters.currency(item['price'] as int? ?? 0),
                    badge: item['discount_price'] != null ? 'diskon'.tr() : null,
                    rating: (item['rating'] as num?)?.toDouble(),
                    onTap: () =>
                        context.go('/catalog/${widget.type}/${item['id']}'),
                  );
                },
                childCount: _items.length,
              ),
            ),
          ),
          if (_loadingMore)
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.all(AppSizes.md),
                child: Center(child: CircularProgressIndicator()),
              ),
            ),
        ],
      ),
    );
  }
}
