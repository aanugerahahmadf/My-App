import 'package:easy_localization/easy_localization.dart';

class Validators {
  static String? required(String? value) {
    if (value == null || value.trim().isEmpty) return 'validasi_wajib_diisi'.tr();
    return null;
  }

  static String? email(String? value) {
    if (value == null || value.trim().isEmpty) return 'validasi_wajib_diisi'.tr();
    final regex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!regex.hasMatch(value)) return 'validasi_email'.tr();
    return null;
  }

  static String? password(String? value) {
    if (value == null || value.trim().isEmpty) return 'validasi_wajib_diisi'.tr();
    if (value.length < 8) return 'password_min_8'.tr();
    if (!value.contains(RegExp(r'[A-Z]'))) return 'password_butuh_huruf_besar'.tr();
    if (!value.contains(RegExp(r'[a-z]'))) return 'password_butuh_huruf_kecil'.tr();
    if (!value.contains(RegExp(r'[0-9]'))) return 'password_butuh_angka'.tr();
    if (!value.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'))) return 'password_butuh_simbol'.tr();
    return null;
  }

  static bool isPasswordStrong(String value) {
    return value.length >= 8
        && value.contains(RegExp(r'[A-Z]'))
        && value.contains(RegExp(r'[a-z]'))
        && value.contains(RegExp(r'[0-9]'))
        && value.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'));
  }

  static String? confirmPassword(String? value, String password) {
    if (value == null || value.trim().isEmpty) return 'validasi_wajib_diisi'.tr();
    if (value != password) return 'validasi_password_cocok'.tr();
    return null;
  }

  static String? phone(String? value) {
    if (value == null || value.trim().isEmpty) return 'validasi_wajib_diisi'.tr();
    final regex = RegExp(r'^\+?[0-9]{10,15}$');
    if (!regex.hasMatch(value)) return 'validasi_nomor'.tr();
    return null;
  }
}
