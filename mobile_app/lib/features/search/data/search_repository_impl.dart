import '../../../core/api/api_endpoints.dart';
import '../../../core/api/dio_client.dart';
import '../domain/search_repository.dart';

class SearchRepositoryImpl implements SearchRepository {
  final _dio = DioClient.instance;

  @override
  Future<Map<String, dynamic>> search(String query, {int page = 1}) async {
    return DioClient.safeCall(() async {
      final response = await _dio.get(ApiEndpoints.search, queryParameters: {
        'query': query,
        'page': page,
      });
      return response.data as Map<String, dynamic>? ?? {};
    });
  }
}
