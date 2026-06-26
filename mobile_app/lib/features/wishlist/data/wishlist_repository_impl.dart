import '../../../core/api/api_endpoints.dart';
import '../../../core/api/dio_client.dart';
import '../domain/wishlist_repository.dart';

class WishlistRepositoryImpl implements WishlistRepository {
  final _dio = DioClient.instance;

  @override
  Future<List<Map<String, dynamic>>> getWishlist() async {
    return DioClient.safeCall(() async {
      final response = await _dio.get(ApiEndpoints.wishlist);
      final data = response.data['data'];
      if (data is List) return data.cast<Map<String, dynamic>>();
      return [];
    });
  }

  @override
  Future<void> toggleWishlist({String? packageId, String? productId}) async {
    return DioClient.safeCall(() async {
      final body = <String, dynamic>{};
      if (packageId != null) body['package_id'] = packageId;
      if (productId != null) body['product_id'] = productId;
      await _dio.post(ApiEndpoints.wishlistToggle, data: body);
    });
  }

  @override
  Future<void> removeFromWishlist(String packageOrProductId) async {
    return DioClient.safeCall(() async {
      await _dio.delete(ApiEndpoints.wishlistItem(packageOrProductId));
    });
  }
}
