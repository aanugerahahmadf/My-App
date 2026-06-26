import 'package:dio/dio.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/api/dio_client.dart';
import '../domain/profile_repository.dart';

class ProfileRepositoryImpl implements ProfileRepository {
  final Dio _dio;

  ProfileRepositoryImpl({Dio? dio}) : _dio = dio ?? DioClient.instance;

  Map<String, dynamic> _data(Map<String, dynamic>? resp) {
    final d = resp?['data'];
    if (d is Map<String, dynamic>) return d;
    return resp ?? {};
  }

  @override
  Future<Map<String, dynamic>> getProfile() async {
    final response = await _dio.get(ApiEndpoints.profile);
    return _data(response.data as Map<String, dynamic>?);
  }

  @override
  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final response = await _dio.put(ApiEndpoints.profile, data: data);
    return _data(response.data as Map<String, dynamic>?);
  }

  @override
  Future<String> uploadAvatar(String filePath) async {
    final formData = FormData.fromMap({
      'avatar': await MultipartFile.fromFile(filePath),
    });
    final response = await _dio.post(ApiEndpoints.profileAvatar, data: formData);
    return ((response.data as Map<String, dynamic>?)?['avatar_url'] as String?) ?? '';
  }

  @override
  Future<void> changePassword(String currentPassword, String newPassword) async {
    await _dio.put(ApiEndpoints.changePassword, data: {
      'current_password': currentPassword,
      'new_password': newPassword,
      'new_password_confirmation': newPassword,
    });
  }

  @override
  Future<void> updateNik(String nik) async {
    await _dio.put(ApiEndpoints.profileNik, data: {'nik': nik});
  }

  @override
  Future<String> uploadKtp(String filePath) async {
    final formData = FormData.fromMap({
      'ktp_photo': await MultipartFile.fromFile(filePath),
    });
    final response = await _dio.post(ApiEndpoints.profileKtp, data: formData);
    final d = response.data as Map<String, dynamic>?;
    return ((d?['data'] as Map<String, dynamic>?)?['ktp_photo_url'] as String?) ?? '';
  }

  @override
  Future<Map<String, dynamic>> uploadSelfie(String filePath) async {
    final formData = FormData.fromMap({
      'selfie_photo': await MultipartFile.fromFile(filePath),
    });
    final response = await _dio.post(ApiEndpoints.profileSelfie, data: formData);
    final d = response.data as Map<String, dynamic>?;
    return (d?['data'] as Map<String, dynamic>?) ?? {};
  }

  @override
  Future<Map<String, dynamic>> getCompletion() async {
    final response = await _dio.get(ApiEndpoints.profileCompletion);
    final d = response.data as Map<String, dynamic>?;
    return (d?['data'] as Map<String, dynamic>?) ?? {};
  }
}
