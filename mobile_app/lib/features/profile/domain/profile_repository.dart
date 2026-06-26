abstract class ProfileRepository {
  Future<Map<String, dynamic>> getProfile();
  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data);
  Future<String> uploadAvatar(String filePath);
  Future<void> changePassword(String currentPassword, String newPassword);
}
