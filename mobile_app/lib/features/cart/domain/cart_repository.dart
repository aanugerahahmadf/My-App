abstract class CartRepository {
  Future<List<Map<String, dynamic>>> getCart();
  Future<Map<String, dynamic>> addToCart({String? productId, String? packageId, int quantity = 1});
  Future<Map<String, dynamic>> updateQuantity(String cartId, int quantity);
  Future<void> removeFromCart(String cartId);
}
