import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_sizes.dart';
import '../../../../core/widgets/app_empty_state.dart';
import '../../../../core/widgets/app_error_state.dart';
import '../../data/models/item_model.dart';
import '../widgets/combined_card.dart';
import '../providers/catalog_provider.dart';

class CatalogCombinedPage extends ConsumerStatefulWidget {
  const CatalogCombinedPage({super.key});

  @override
  ConsumerState<CatalogCombinedPage> createState() => _CatalogCombinedPageState();
}

class _CatalogCombinedPageState extends ConsumerState<CatalogCombinedPage> {
  bool _loading = true;
  String? _error;
  final List<_CatalogItem> _items = [];

  @override
  void initState() {
    super.initState();
    _fetchAll();
  }

  Future<void> _fetchAll() async {
    setState(() { _loading = true; _error = null; _items.clear(); });
    try {
      final repo = ref.read(catalogRepositoryProvider);
      final results = await Future.wait([
        repo.getPackages(page: 1),
        repo.getProducts(page: 1),
      ]);
      final packages = _extractList(results[0]).map((e) => _CatalogItem(e, 'packages')).toList();
      final products = _extractList(results[1]).map((e) => _CatalogItem(e, 'products')).toList();
      _items.addAll(packages);
      _items.addAll(products);
      _items.shuffle();
    } catch (e) {
      _error = e.toString();
    }
    if (mounted) setState(() => _loading = false);
  }

  List<Map<String, dynamic>> _extractList(dynamic data) {
    if (data is List) return data.cast<Map<String, dynamic>>();
    if (data is Map) {
      if (data['data'] is List) return (data['data'] as List).cast<Map<String, dynamic>>();
    }
    return [];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('katalog'.tr()), centerTitle: true),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null) {
      return AppErrorState(message: _error!, onRetry: _fetchAll);
    }
    if (_items.isEmpty) {
      return AppEmptyState(title: 'katalog_kosong'.tr(), subtitle: 'katalog_kosong_subtitle'.tr());
    }
    return RefreshIndicator(
      onRefresh: _fetchAll,
      child: GridView.builder(
        padding: const EdgeInsets.all(AppSizes.md),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.7,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
        ),
        itemCount: _items.length,
        itemBuilder: (_, i) {
          final ci = _items[i];
          return CombinedCard(
            item: ItemModel.fromJson(ci.data),
            type: ci.type,
            onTap: () => context.go('/catalog/${ci.type}/${ci.data['id']}'),
          );
        },
      ),
    );
  }
}

class _CatalogItem {
  final Map<String, dynamic> data;
  final String type;
  const _CatalogItem(this.data, this.type);
}
