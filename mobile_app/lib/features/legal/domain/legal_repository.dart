import '../data/models/legal_model.dart';

abstract class LegalRepository {
  Future<LegalContent> getPrivacyPolicy();
  Future<LegalContent> getTermsOfService();
  Future<HelpModel> getHelpCenter();
}
