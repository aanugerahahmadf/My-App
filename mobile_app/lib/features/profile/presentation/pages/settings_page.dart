import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/constants/app_sizes.dart';
import '../../../auth/data/biometric_auth_service.dart';
import '../../../auth/presentation/providers/biometric_settings_provider.dart';

class SettingsPage extends ConsumerStatefulWidget {
  const SettingsPage({super.key});

  @override
  ConsumerState<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends ConsumerState<SettingsPage> {
  bool _biometricAvailable = false;

  @override
  void initState() {
    super.initState();
    _checkBiometric();
  }

  Future<void> _checkBiometric() async {
    final available = await BiometricAuthService().isAvailable();
    if (mounted) setState(() => _biometricAvailable = available);
  }

  @override
  Widget build(BuildContext context) {
    final fingerprintEnabled = ref.watch(fingerprintUnlockProvider);
    return Scaffold(
      appBar: AppBar(title: Text('pengaturan'.tr())),
      body: Padding(
        padding: const EdgeInsets.all(AppSizes.md),
        child: Column(
          children: [
            _menuTile(Icons.language, 'bahasa'.tr(), () => context.push('/language')),
            _menuTile(Icons.notifications_outlined, 'pengaturan_notifikasi'.tr(), () => context.push('/notification-settings')),
            _menuTile(Icons.privacy_tip_outlined, 'privasi_ketentuan'.tr(), () => context.push('/legal/privacy-term')),
            if (_biometricAvailable) ...[
              const SizedBox(height: AppSizes.sm),
              Card(
                margin: EdgeInsets.zero,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: SwitchListTile(
                  secondary: Icon(Icons.fingerprint, color: AppColors.primaryColor),
                  title: Text('buka_kunci_sidik_jari'.tr(), style: AppTextStyles.bodyMedium),
                  subtitle: Text('buka_kunci_sidik_jari_subtitle'.tr(), style: AppTextStyles.bodySmall),
                  value: fingerprintEnabled,
                  onChanged: (v) => ref.read(fingerprintUnlockProvider.notifier).setEnabled(v),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _menuTile(IconData icon, String label, VoidCallback onTap) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSizes.sm),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Icon(icon, color: AppColors.primaryColor),
        title: Text(label, style: AppTextStyles.bodyMedium),
        trailing: const Icon(Icons.chevron_right, color: AppColors.textSecondary),
        onTap: onTap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
