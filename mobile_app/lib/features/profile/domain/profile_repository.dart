abstract class ProfileRepository {
  Future<Map<String, dynamic>> getProfile();
  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data);
  Future<String> uploadAvatar(String filePath);
  Future<void> changePassword(String currentPassword, String newPassword);
  Future<void> updateNik(String nik);
  Future<String> uploadKtp(String filePath);
  Future<Map<String, dynamic>> uploadSelfie(String filePath);
  Future<Map<String, dynamic>> getCompletion();
}
