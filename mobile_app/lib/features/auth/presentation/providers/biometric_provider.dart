import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/biometric_auth_service.dart';

final biometricServiceProvider = Provider<BiometricAuthService>((ref) {
  return BiometricAuthService();
});

final biometricAvailabilityProvider = FutureProvider<bool>((ref) {
  return ref.read(biometricServiceProvider).isAvailable();
});

final biometricTypeNameProvider = FutureProvider<String>((ref) {
  return ref.read(biometricServiceProvider).biometricTypeName;
});
