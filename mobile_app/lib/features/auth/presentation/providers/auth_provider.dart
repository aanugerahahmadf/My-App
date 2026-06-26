import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../../core/api/api_endpoints.dart';
import '../../../../core/api/dio_client.dart';
import '../../data/models/user_model.dart';

sealed class AuthState {
  const AuthState();
}

class AuthInitial extends AuthState {
  const AuthInitial();
}

class AuthLoading extends AuthState {
  const AuthLoading();
}

class AuthAuthenticated extends AuthState {
  final UserModel user;
  const AuthAuthenticated(this.user);
}

class AuthError extends AuthState {
  final String message;
  const AuthError(this.message);
}

class AuthNotifier extends StateNotifier<AuthState> {
  final _storage = const FlutterSecureStorage();
  final Dio _dio = DioClient.instance;

  AuthNotifier() : super(const AuthInitial());

  Future<void> login({required String email, required String password}) async {
    state = const AuthLoading();
    try {
      final response = await _dio.post(
        ApiEndpoints.login,
        data: {'email': email, 'password': password},
      );
      final respData = response.data as Map<String, dynamic>? ?? {};
      final inner = respData['data'] as Map<String, dynamic>? ?? respData;
      final token = inner['token'] as String?;
      final userMap = inner['user'] as Map<String, dynamic>?;
      if (token == null || userMap == null) throw Exception('Login gagal');
      final user = UserModel.fromJson(userMap);
      await _storage.write(key: 'auth_token', value: token);
      state = AuthAuthenticated(user);
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] as String? ?? 'Login gagal';
      state = AuthError(msg);
    } catch (e) {
      state = AuthError('Terjadi kesalahan');
    }
  }

  Future<void> register({
    required String fullName,
    required String username,
    required String email,
    required String whatsapp,
    required String password,
    required String passwordConfirmation,
  }) async {
    state = const AuthLoading();
    try {
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
      final respData = response.data as Map<String, dynamic>? ?? {};
      final inner = respData['data'] as Map<String, dynamic>? ?? respData;
      final token = inner['token'] as String?;
      final userMap = inner['user'] as Map<String, dynamic>?;
      if (token == null || userMap == null) throw Exception('Registrasi gagal');
      final user = UserModel.fromJson(userMap);
      await _storage.write(key: 'auth_token', value: token);
      state = AuthAuthenticated(user);
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] as String? ?? 'Registrasi gagal';
      state = AuthError(msg);
    } catch (e) {
      state = AuthError('Terjadi kesalahan');
    }
  }

  Future<void> logout() async {
    state = const AuthLoading();
    try {
      await _dio.post(ApiEndpoints.logout);
    } catch (_) {}
    await _storage.delete(key: 'auth_token');
    state = const AuthInitial();
  }

  Future<void> checkAuth() async {
    state = const AuthLoading();
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null || token.isEmpty) {
        state = const AuthInitial();
        return;
      }
      final response = await _dio.get(ApiEndpoints.user);
      final userMap = (response.data as Map<String, dynamic>?)?['data'] as Map<String, dynamic>?;
      if (userMap == null) throw Exception('Gagal memuat profil');
      final user = UserModel.fromJson(userMap);
      state = AuthAuthenticated(user);
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        await _storage.delete(key: 'auth_token');
      }
      state = const AuthInitial();
    } catch (_) {
      state = const AuthInitial();
    }
  }

  Future<void> updateProfile(Map<String, dynamic> data) async {
    try {
      final response = await _dio.put(ApiEndpoints.profile, data: data);
      final userMap = (response.data as Map<String, dynamic>?)?['data'] as Map<String, dynamic>?;
      if (userMap == null) throw Exception('Gagal update profil');
      final user = UserModel.fromJson(userMap);
      state = AuthAuthenticated(user);
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] as String? ?? 'Gagal update profil';
      state = AuthError(msg);
    }
  }

  Future<String> uploadAvatar(String filePath) async {
    try {
      final formData = FormData.fromMap({
        'avatar': await MultipartFile.fromFile(filePath),
      });
      final response = await _dio.post(ApiEndpoints.profileAvatar, data: formData);
      final respData = response.data as Map<String, dynamic>? ?? {};
      final userMap = respData['data'] as Map<String, dynamic>?;
      if (userMap != null) {
        state = AuthAuthenticated(UserModel.fromJson(userMap));
      }
      return (respData['avatar_url'] as String?) ?? '';
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] as String? ?? 'Gagal upload avatar';
      state = AuthError(msg);
      rethrow;
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
