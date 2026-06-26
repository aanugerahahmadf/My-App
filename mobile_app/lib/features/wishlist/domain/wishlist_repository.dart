abstract class WishlistRepository {
  Future<List<Map<String, dynamic>>> getWishlist();
  Future<void> toggleWishlist({String? packageId, String? productId});
  Future<void> removeFromWishlist(String packageOrProductId);
}
