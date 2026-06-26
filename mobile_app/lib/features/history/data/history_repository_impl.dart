import '../../../core/api/api_endpoints.dart';
import '../../../core/api/dio_client.dart';
import '../domain/history_repository.dart';
import 'models/history_model.dart';

class HistoryRepositoryImpl implements HistoryRepository {
  final _dio = DioClient.instance;

  @override
  Future<List<HistoryModel>> getHistory() async {
    return DioClient.safeCall(() async {
      final response = await _dio.get(ApiEndpoints.walletHistory);
      final data = response.data['data'] as List? ?? [];
      return data.map((e) => HistoryModel.fromJson(e as Map<String, dynamic>)).toList();
    });
  }
}
