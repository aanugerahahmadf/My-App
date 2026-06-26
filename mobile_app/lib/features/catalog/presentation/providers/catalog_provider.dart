import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/catalog_repository_impl.dart';
import '../../domain/catalog_repository.dart';

final catalogRepositoryProvider = Provider<CatalogRepository>((ref) {
  return CatalogRepositoryImpl();
});

final catalogPackageListProvider = FutureProvider.family<Map<String, dynamic>, Map<String, dynamic>>((ref, params) async {
  final repo = ref.watch(catalogRepositoryProvider);
  return repo.getPackages(
    categoryId: params['category_id'] as String?,
    search: params['search'] as String?,
    sort: params['sort'] as String?,
    page: (params['page'] as int?) ?? 1,
  );
});

final catalogProductListProvider = FutureProvider.family<Map<String, dynamic>, Map<String, dynamic>>((ref, params) async {
  final repo = ref.watch(catalogRepositoryProvider);
  return repo.getProducts(
    categoryId: params['category_id'] as String?,
    search: params['search'] as String?,
    sort: params['sort'] as String?,
    page: (params['page'] as int?) ?? 1,
  );
});

final catalogDetailProvider = FutureProvider.family<Map<String, dynamic>, ({String type, String id})>((ref, params) async {
  final repo = ref.watch(catalogRepositoryProvider);
  if (params.type == 'packages') {
    return repo.getPackageDetail(params.id);
  }
  return repo.getProductDetail(params.id);
});
