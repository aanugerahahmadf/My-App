import 'package:dio/dio.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/api/dio_client.dart';
import '../domain/home_repository.dart';

class HomeRepositoryImpl implements HomeRepository {
  final Dio _dio;

  HomeRepositoryImpl({Dio? dio}) : _dio = dio ?? DioClient.instance;

  @override
  Future<Map<String, dynamic>> getHomeData() async {
    final response = await _dio.get(ApiEndpoints.home);
    return response.data['data'] as Map<String, dynamic>? ?? {};
  }
}
