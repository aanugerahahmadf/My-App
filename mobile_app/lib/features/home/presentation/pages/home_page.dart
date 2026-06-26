import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/api/api_endpoints.dart';
import '../../../../core/api/dio_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/constants/app_sizes.dart';
import '../../../../core/widgets/app_shimmer.dart';
import '../../../search/presentation/widgets/global_search_bar.dart';
import '../../../../features/catalog/data/catalog_repository_impl.dart';
import '../../../../features/catalog/data/models/item_model.dart';
import '../../../../features/catalog/presentation/widgets/combined_card.dart';
import '../../../../features/auth/presentation/providers/auth_provider.dart';
import '../widgets/menu_card.dart';
import '../widgets/voucher_card.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  Map<String, dynamic>? _homeData;
  bool _loading = true;
  final _pageController = PageController();
  List<Map<String, dynamic>> _combinedItems = [];
  bool _catalogLoading = false;
  List<Map<String, dynamic>> _categories = [];
  String? _selectedCategoryId;
  bool _hasDiscountOnly = false;
  double _minRating = 0;
  String _sortBy = 'latest';

  List<Map<String, dynamic>> get _filteredItems {
    var items = List<Map<String, dynamic>>.from(_combinedItems);

    if (_selectedCategoryId != null) {
      items = items.where((e) => '${e['category_id']}' == _selectedCategoryId).toList();
    }
    if (_hasDiscountOnly) {
      items = items.where((e) => e['discount_price'] != null && (e['discount_price'] as int) > 0).toList();
    }
    if (_minRating > 0) {
      items = items.where((e) => ((e['rating'] as num?)?.toDouble() ?? 0) >= _minRating).toList();
    }

    switch (_sortBy) {
      case 'price_asc':
        items.sort((a, b) => ((a['price'] as int?) ?? 0).compareTo((b['price'] as int?) ?? 0));
      case 'price_desc':
        items.sort((a, b) => ((b['price'] as int?) ?? 0).compareTo((a['price'] as int?) ?? 0));
      case 'rating_desc':
        items.sort((a, b) => ((b['rating'] as num?)?.toDouble() ?? 0).compareTo((a['rating'] as num?)?.toDouble() ?? 0));
      case 'most_ordered':
        items.sort((a, b) => ((b['ordered_count'] as int?) ?? 0).compareTo((a['ordered_count'] as int?) ?? 0));
    }
    return items;
  }

  @override
  void initState() {
    super.initState();
    _fetchHome();
    _fetchCatalog();
    _fetchCategories();
    _startAutoScroll();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _fetchHome() async {
    if (_homeData == null) setState(() => _loading = true);
    try {
      final dio = DioClient.instance;
      final response = await dio.get(ApiEndpoints.home);
      if (mounted) {
        setState(() {
          _homeData = response.data['data'] as Map<String, dynamic>?;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _fetchCatalog() async {
    setState(() => _catalogLoading = true);
    try {
      final repo = CatalogRepositoryImpl();
      final results = await Future.wait([
        repo.getPackages(page: 1),
        repo.getProducts(page: 1),
      ]);
      final packages = _extractList(results[0]).map((e) => e..['_type'] = 'packages').toList();
      final products = _extractList(results[1]).map((e) => e..['_type'] = 'products').toList();
      _combinedItems = [...packages, ...products]..shuffle();
    } catch (_) {}
    if (mounted) setState(() => _catalogLoading = false);
  }

  List<Map<String, dynamic>> _extractList(dynamic data) {
    if (data is List) return data.cast<Map<String, dynamic>>();
    if (data is Map && data['data'] is List) return (data['data'] as List).cast<Map<String, dynamic>>();
    return [];
  }

  Future<void> _fetchCategories() async {
    try {
      final res = await DioClient.instance.get(ApiEndpoints.categories);
      final data = res.data['data'];
      if (data is List && mounted) {
        setState(() => _categories = data.cast<Map<String, dynamic>>());
      }
    } catch (_) {}
  }

  void _startAutoScroll() {
    Future.delayed(const Duration(seconds: 3), () {
      if (!mounted) return;
      final vouchers = _homeData?['vouchers'] as List? ?? [];
      if (vouchers.isEmpty) return;
      final next = (_pageController.page?.toInt() ?? 0) + 1;
      if (next < vouchers.length) {
        _pageController.animateToPage(next, duration: const Duration(milliseconds: 500), curve: Curves.easeInOut);
      } else {
        _pageController.animateToPage(0, duration: const Duration(milliseconds: 500), curve: Curves.easeInOut);
      }
      _startAutoScroll();
    });
  }

  @override
  Widget build(BuildContext context) {
    final vouchers = (_homeData?['vouchers'] as List?)?.cast<Map<String, dynamic>>() ?? [];

    return Scaffold(
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async {
                await Future.wait([_fetchHome(), _fetchCatalog()]);
              },
              child: CustomScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                slivers: [
                  _buildHeader(),
                  SliverToBoxAdapter(child: _buildMenuSection()),
                  if (vouchers.isNotEmpty) SliverToBoxAdapter(child: _buildVoucherSection(vouchers)),
                  SliverToBoxAdapter(child: _buildCatalogHeader()),
                  if (_catalogLoading && _combinedItems.isEmpty)
                    const SliverPadding(
                      padding: EdgeInsets.symmetric(horizontal: AppSizes.md),
                      sliver: AppShimmerGrid(),
                    )
                  else if (_filteredItems.isEmpty)
                    SliverFillRemaining(
                      hasScrollBody: false,
                      child: Center(child: Text('tidak_ada_produk'.tr(), style: AppTextStyles.bodyMedium)),
                    )
                  else
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(AppSizes.md, 0, AppSizes.md, AppSizes.xxl),
                      sliver: SliverGrid(
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 0.7,
                          crossAxisSpacing: AppSizes.md,
                          mainAxisSpacing: AppSizes.md,
                        ),
                        delegate: SliverChildBuilderDelegate(
                          (_, i) {
                            final item = _filteredItems[i];
                            final type = item['_type'] as String? ?? 'packages';
                            return CombinedCard(
                              item: ItemModel.fromJson(item),
                              type: type,
                              onTap: () => context.push('/catalog/$type/${item['id']}'),
                            );
                          },
                          childCount: _filteredItems.length,
                        ),
                      ),
                    ),
                ],
              ),
            ),
    );
  }

  Widget _buildHeader() {
    return SliverToBoxAdapter(
      child: Container(
        padding: const EdgeInsets.fromLTRB(AppSizes.md, AppSizes.xxl, AppSizes.md, AppSizes.lg),
        decoration: const BoxDecoration(
          gradient: AppColors.primaryGradient,
          borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
        ),
        child: Column(
          children: [
            Row(
              children: [
                Consumer(builder: (_, ref, _) {
                  final authState = ref.watch(authProvider);
                  if (authState is AuthAuthenticated) {
                    final u = authState.user;
                    final avatarUrl = u.avatarUrl ?? u.avatar;
                    return CircleAvatar(
                      radius: 22,
                      backgroundColor: Colors.white,
                      backgroundImage: avatarUrl != null ? CachedNetworkImageProvider(avatarUrl) : null,
                      child: avatarUrl == null
                          ? const Icon(Icons.person, color: AppColors.primaryColor, size: 22)
                          : null,
                    );
                  }
                  return const CircleAvatar(
                    radius: 22,
                    backgroundColor: Colors.white,
                    child: Icon(Icons.person, color: AppColors.primaryColor, size: 22),
                  );
                }),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'selamat_datang'.tr(),
                        style: AppTextStyles.labelMedium.copyWith(color: Colors.white70),
                      ),
                      Consumer(builder: (_, ref, _) {
                        final authState = ref.watch(authProvider);
                        final name = authState is AuthAuthenticated ? authState.user.fullName : 'pengguna'.tr();
                        return Text(
                          name,
                          style: AppTextStyles.titleLarge.copyWith(color: Colors.white),
                        );
                      }),
                    ],
                  ),
                ),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withAlpha(30),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.notifications_outlined, color: Colors.white),
                    onPressed: () => context.push('/notifications'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSizes.md),
            const GlobalSearchBar(translucent: true),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(AppSizes.md, AppSizes.lg, AppSizes.md, AppSizes.sm),
          child: Text('layanan'.tr(), style: AppTextStyles.titleLarge),
        ),
        SizedBox(
          height: 90,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: AppSizes.md),
            children: [
              MenuCard(
                label: 'paket_bunga'.tr(),
                icon: Icons.card_giftcard,
                color: AppColors.categoryColors[0],
                onTap: () => context.push('/catalog/packages'),
              ),
              MenuCard(
                label: 'katalog_bunga'.tr(),
                icon: Icons.local_florist,
                color: AppColors.categoryColors[1],
                onTap: () => context.push('/catalog/products'),
              ),
              MenuCard(
                label: 'ulasan'.tr(),
                icon: Icons.star,
                color: AppColors.categoryColors[2],
                onTap: () => context.push('/my-reviews'),
              ),
              MenuCard(
                label: 'favorit'.tr(),
                icon: Icons.favorite,
                color: AppColors.categoryColors[3],
                onTap: () => context.push('/wishlist'),
              ),
              MenuCard(
                label: 'cari_gambar'.tr(),
                icon: Icons.image_search,
                color: AppColors.categoryColors[4],
                onTap: () => context.push('/cbir-result'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildVoucherSection(List<Map<String, dynamic>> vouchers) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(AppSizes.md, AppSizes.sm, AppSizes.md, AppSizes.sm),
          child: Text('promo_spesial'.tr(), style: AppTextStyles.titleLarge),
        ),
        SizedBox(
          height: 140,
          child: PageView.builder(
            controller: _pageController,
            itemCount: vouchers.length,
            itemBuilder: (context, index) => VoucherCard(voucher: vouchers[index]),
          ),
        ),
      ],
    );
  }

  Widget _buildCatalogHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSizes.md, AppSizes.md, AppSizes.md, AppSizes.sm),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('rekomendasi'.tr(), style: AppTextStyles.titleLarge),
              TextButton(
                onPressed: () => context.push('/catalog'),
                child: Text('lihat_semua'.tr()),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              if (_categories.isNotEmpty)
                Container(
                  height: 38,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  decoration: BoxDecoration(
                    color: AppColors.secondaryColor.withAlpha(30),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedCategoryId,
                      hint: const Text('Kategori', style: TextStyle(fontSize: 12)),
                      isDense: true,
                      items: [
                        const DropdownMenuItem(value: null, child: Text('Semua', style: TextStyle(fontSize: 12))),
                        ..._categories.map((c) => DropdownMenuItem(
                          value: '${c['id']}',
                          child: Text('${c['name']}', style: const TextStyle(fontSize: 12)),
                        )),
                      ],
                      onChanged: (v) => setState(() => _selectedCategoryId = v),
                    ),
                  ),
                ),
              const SizedBox(width: 6),
              FilterChip(
                label: const Text('Diskon', style: TextStyle(fontSize: 11)),
                selected: _hasDiscountOnly,
                visualDensity: VisualDensity.compact,
                onSelected: (v) => setState(() => _hasDiscountOnly = v),
              ),
              const SizedBox(width: 6),
              _buildRatingChip(),
            ],
          ),
          const SizedBox(height: 6),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _sortChip('latest', 'Terbaru'),
                const SizedBox(width: 6),
                _sortChip('price_asc', 'Harga ↑'),
                const SizedBox(width: 6),
                _sortChip('price_desc', 'Harga ↓'),
                const SizedBox(width: 6),
                _sortChip('rating_desc', 'Rating'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRatingChip() {
    return FilterChip(
      avatar: Icon(Icons.star, size: 14, color: _minRating > 0 ? Colors.amber : null),
      label: Text(_minRating > 0 ? '$_minRating' : 'Rating', style: const TextStyle(fontSize: 11)),
      selected: _minRating > 0,
      visualDensity: VisualDensity.compact,
      onSelected: (v) {
        if (!v) {
          setState(() => _minRating = 0);
        } else {
          setState(() {
            _minRating = _minRating == 0 ? 4 : (_minRating == 4 ? 5 : 0);
          });
        }
      },
    );
  }

  Widget _sortChip(String value, String label) {
    final selected = _sortBy == value;
    return ChoiceChip(
      label: Text(label, style: TextStyle(fontSize: 11, color: selected ? Colors.white : null)),
      selected: selected,
      visualDensity: VisualDensity.compact,
      onSelected: (_) => setState(() => _sortBy = value),
    );
  }
}
