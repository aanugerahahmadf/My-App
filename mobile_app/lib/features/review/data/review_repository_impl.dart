import 'package:dio/dio.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/api/dio_client.dart';
import '../domain/review_repository.dart';

class ReviewRepositoryImpl implements ReviewRepository {
  final Dio _dio;

  ReviewRepositoryImpl({Dio? dio}) : _dio = dio ?? DioClient.instance;

  @override
  Future<Map<String, dynamic>> createReview(Map<String, dynamic> data) async {
    final response = await _dio.post(ApiEndpoints.reviews, data: data);
    return response.data['data'] as Map<String, dynamic>;
  }

  @override
  Future<List<Map<String, dynamic>>> getPackageReviews(String packageId) async {
    final response = await _dio.get(ApiEndpoints.packageReviews(packageId));
    return (response.data['data'] as List?)?.cast<Map<String, dynamic>>() ?? [];
  }

  @override
  Future<List<Map<String, dynamic>>> getMyReviews() async {
    final response = await _dio.get(ApiEndpoints.myReviews);
    return (response.data['data'] as List?)?.cast<Map<String, dynamic>>() ?? [];
  }
}
