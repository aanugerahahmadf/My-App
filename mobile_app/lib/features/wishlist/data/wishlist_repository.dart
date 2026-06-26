import '../../../core/api/api_endpoints.dart';
import '../../../core/api/dio_client.dart';

class WishlistRepository {
  final _dio = DioClient.instance;

  Future<List<Map<String, dynamic>>> getWishlist() async {
    final response = await _dio.get(ApiEndpoints.wishlist);
    final data = response.data['data'];
    if (data is List) return data.cast<Map<String, dynamic>>();
    return [];
  }

  Future<void> toggleWishlist({String? packageId, String? productId}) async {
    final body = <String, dynamic>{};
    if (packageId != null) body['package_id'] = packageId;
    if (productId != null) body['product_id'] = productId;
    await _dio.post(ApiEndpoints.wishlistToggle, data: body);
  }

  Future<void> removeFromWishlist(String packageOrProductId) async {
    await _dio.delete(ApiEndpoints.wishlistItem(packageOrProductId));
  }
}
