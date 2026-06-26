abstract class ReviewRepository {
  Future<Map<String, dynamic>> createReview(Map<String, dynamic> data);
  Future<List<Map<String, dynamic>>> getPackageReviews(String packageId);
  Future<List<Map<String, dynamic>>> getMyReviews();
}
