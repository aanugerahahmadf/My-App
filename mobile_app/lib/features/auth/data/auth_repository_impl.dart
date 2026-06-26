import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/api/dio_client.dart';
import '../domain/auth_repository.dart';
import 'models/user_model.dart';

class AuthRepositoryImpl implements AuthRepository {
  final Dio _dio;
  final _storage = const FlutterSecureStorage();

  AuthRepositoryImpl({Dio? dio}) : _dio = dio ?? DioClient.instance;

  @override
  Future<UserModel> login({required String email, required String password}) async {
    final response = await _dio.post(
      ApiEndpoints.login,
      data: {'email': email, 'password': password},
    );
    final token = response.data['token'] as String;
    await _storage.write(key: 'auth_token', value: token);
    return UserModel.fromJson(response.data['user'] as Map<String, dynamic>);
  }

  @override
  Future<UserModel> register({
    required String fullName,
    required String username,
    required String email,
    required String whatsapp,
    required String password,
    required String passwordConfirmation,
  }) async {
    final response = await _dio.post(
      ApiEndpoints.register,
      data: {
        'full_name': fullName,
        'username': username,
        'email': email,
        'whatsapp': whatsapp,
        'password': password,
        'password_confirmation': passwordConfirmation,
      },
    );
    final token = response.data['token'] as String;
    await _storage.write(key: 'auth_token', value: token);
    return UserModel.fromJson(response.data['user'] as Map<String, dynamic>);
  }

  @override
  Future<void> logout() async {
    try {
      await _dio.post(ApiEndpoints.logout);
    } catch (_) {}
    await _storage.delete(key: 'auth_token');
  }

  @override
  Future<String> forgotPassword({required String email}) async {
    final response = await _dio.post(
      ApiEndpoints.forgotPassword,
      data: {'email': email},
    );
    return response.data['message'] as String? ?? '';
  }

  @override
  Future<String> resetPassword({
    required String email,
    required String otp,
    required String password,
    required String passwordConfirmation,
  }) async {
    final response = await _dio.post(
      ApiEndpoints.resetPassword,
      data: {
        'email': email,
        'otp': otp,
        'password': password,
        'password_confirmation': passwordConfirmation,
      },
    );
    return response.data['message'] as String? ?? '';
  }

  @override
  Future<String> sendOtp({required String email}) async {
    final response = await _dio.post(
      ApiEndpoints.sendOtp,
      data: {'email': email},
    );
    return response.data['message'] as String? ?? '';
  }

  @override
  Future<String> verifyOtp({required String email, required String otp}) async {
    final response = await _dio.post(
      ApiEndpoints.verifyOtp,
      data: {'email': email, 'otp': otp},
    );
    return response.data['message'] as String? ?? '';
  }

  @override
  Future<UserModel> getProfile() async {
    final response = await _dio.get(ApiEndpoints.user);
    return UserModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  @override
  Future<UserModel> updateProfile(Map<String, dynamic> data) async {
    final response = await _dio.put(ApiEndpoints.profile, data: data);
    return UserModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  @override
  Future<String> uploadAvatar(String filePath) async {
    final formData = FormData.fromMap({
      'avatar': await MultipartFile.fromFile(filePath),
    });
    final response = await _dio.post(ApiEndpoints.profileAvatar, data: formData);
    return response.data['avatar_url'] as String? ?? '';
  }

  @override
  Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: 'auth_token');
    return token != null && token.isNotEmpty;
  }

  @override
  Future<String?> getToken() async {
    return await _storage.read(key: 'auth_token');
  }
}
