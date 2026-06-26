import 'package:dio/dio.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/api/dio_client.dart';
import '../domain/payment_repository.dart';

class PaymentRepositoryImpl implements PaymentRepository {
  final Dio _dio;

  PaymentRepositoryImpl({Dio? dio}) : _dio = dio ?? DioClient.instance;

  @override
  Future<Map<String, dynamic>> initiatePayment(String orderId) async {
    final response = await _dio.post(ApiEndpoints.bookingPay(orderId));
    return response.data['data'] as Map<String, dynamic>;
  }
}
