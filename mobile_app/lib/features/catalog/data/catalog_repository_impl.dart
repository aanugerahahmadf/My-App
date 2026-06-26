import '../../../core/api/api_endpoints.dart';
import '../../../core/api/dio_client.dart';
import '../domain/catalog_repository.dart';

class CatalogRepositoryImpl implements CatalogRepository {
  @override
  Future<Map<String, dynamic>> getPackages({
    String? categoryId,
    String? search,
    String? sort,
    int page = 1,
  }) async {
    final response = await DioClient.instance.get(
      ApiEndpoints.packages,
      queryParameters: {
        'category_id': ?categoryId,
        'search': ?search,
        'sort': ?sort,
        'page': page,
      },
    );
    return response.data as Map<String, dynamic>;
  }

  @override
  Future<Map<String, dynamic>> getPackageDetail(String id) async {
    final response = await DioClient.instance.get(
      ApiEndpoints.packageDetail(id),
    );
    return response.data as Map<String, dynamic>;
  }

  @override
  Future<Map<String, dynamic>> getProducts({
    String? categoryId,
    String? search,
    String? sort,
    int page = 1,
  }) async {
    final response = await DioClient.instance.get(
      ApiEndpoints.products,
      queryParameters: {
        'category_id': ?categoryId,
        'search': ?search,
        'sort': ?sort,
        'page': page,
      },
    );
    return response.data as Map<String, dynamic>;
  }

  @override
  Future<Map<String, dynamic>> getProductDetail(String id) async {
    final response = await DioClient.instance.get(
      ApiEndpoints.productDetail(id),
    );
    return response.data as Map<String, dynamic>;
  }
}
