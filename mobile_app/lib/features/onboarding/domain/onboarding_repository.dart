abstract class OnboardingRepository {
  Future<bool> isOnboardingSeen();
  Future<void> setOnboardingSeen();
}
