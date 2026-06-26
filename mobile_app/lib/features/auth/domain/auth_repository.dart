import '../data/models/user_model.dart';

abstract class AuthRepository {
  Future<UserModel> login({
    required String email,
    required String password,
  });

  Future<UserModel> register({
    required String fullName,
    required String username,
    required String email,
    required String whatsapp,
    required String password,
    required String passwordConfirmation,
  });

  Future<void> logout();

  Future<String> forgotPassword({required String email});

  Future<String> resetPassword({
    required String email,
    required String otp,
    required String password,
    required String passwordConfirmation,
  });

  Future<String> sendOtp({required String email});

  Future<String> verifyOtp({
    required String email,
    required String otp,
  });

  Future<UserModel> getProfile();

  Future<UserModel> updateProfile(Map<String, dynamic> data);

  Future<String> uploadAvatar(String filePath);

  Future<bool> isLoggedIn();

  Future<String?> getToken();
}
