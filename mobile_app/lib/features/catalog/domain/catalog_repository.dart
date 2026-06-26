abstract class CatalogRepository {
  Future<Map<String, dynamic>> getPackages({String? categoryId, String? search, String? sort, int page = 1});
  Future<Map<String, dynamic>> getPackageDetail(String id);
  Future<Map<String, dynamic>> getProducts({String? categoryId, String? search, String? sort, int page = 1});
  Future<Map<String, dynamic>> getProductDetail(String id);
}
