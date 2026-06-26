import 'package:dio/dio.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/api/dio_client.dart';
import '../domain/cart_repository.dart';

class CartRepositoryImpl implements CartRepository {
  final Dio _dio;

  CartRepositoryImpl({Dio? dio}) : _dio = dio ?? DioClient.instance;

  @override
  Future<List<Map<String, dynamic>>> getCart() async {
    final response = await _dio.get(ApiEndpoints.cart);
    return (response.data['data'] as List?)?.cast<Map<String, dynamic>>() ?? [];
  }

  @override
  Future<Map<String, dynamic>> addToCart({String? productId, String? packageId, int quantity = 1}) async {
    final body = <String, dynamic>{'quantity': quantity};
    if (productId != null) body['product_id'] = productId;
    if (packageId != null) body['package_id'] = packageId;
    final response = await _dio.post(ApiEndpoints.cartAdd, data: body);
    return response.data['data'] as Map<String, dynamic>;
  }

  @override
  Future<Map<String, dynamic>> updateQuantity(String cartId, int quantity) async {
    final response = await _dio.put(ApiEndpoints.cartItem(cartId), data: {'quantity': quantity});
    return response.data['data'] as Map<String, dynamic>;
  }

  @override
  Future<void> removeFromCart(String cartId) async {
    await _dio.delete(ApiEndpoints.cartItem(cartId));
  }
}
