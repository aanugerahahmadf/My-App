import 'package:dio/dio.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/api/dio_client.dart';
import '../domain/legal_repository.dart';
import 'models/legal_model.dart';

class LegalRepositoryImpl implements LegalRepository {
  final Dio _dio = DioClient.instance;

  @override
  Future<LegalContent> getPrivacyPolicy() async {
    return DioClient.safeCall(() async {
      final res = await _dio.get(ApiEndpoints.legalPrivacy);
      return LegalContent.fromJson(res.data);
    });
  }

  @override
  Future<LegalContent> getTermsOfService() async {
    return DioClient.safeCall(() async {
      final res = await _dio.get(ApiEndpoints.legalTerms);
      return LegalContent.fromJson(res.data);
    });
  }

  @override
  Future<HelpModel> getHelpCenter() async {
    return DioClient.safeCall(() async {
      final res = await _dio.get(ApiEndpoints.legalHelp);
      return HelpModel.fromJson(res.data);
    });
  }
}
