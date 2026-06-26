import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/legal_repository_impl.dart';
import '../../data/models/legal_model.dart';
import '../../domain/legal_repository.dart';

final legalRepositoryProvider = Provider<LegalRepository>((ref) {
  return LegalRepositoryImpl();
});

final privacyPolicyProvider = FutureProvider<LegalContent>((ref) {
  return ref.read(legalRepositoryProvider).getPrivacyPolicy();
});

final termsOfServiceProvider = FutureProvider<LegalContent>((ref) {
  return ref.read(legalRepositoryProvider).getTermsOfService();
});

final helpCenterProvider = FutureProvider<HelpModel>((ref) {
  return ref.read(legalRepositoryProvider).getHelpCenter();
});
