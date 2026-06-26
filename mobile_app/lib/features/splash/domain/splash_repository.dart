abstract class SplashRepository {
  Future<bool> isLoggedIn();
  Future<bool> isOnboardingSeen();
  Future<void> setOnboardingSeen();
}
