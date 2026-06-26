import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/constants/app_sizes.dart';
import '../../../../core/widgets/app_button.dart';

class SocialLoginButton extends StatelessWidget {
  final SocialProvider provider;
  final VoidCallback? onPressed;
  final bool enabled;

  const SocialLoginButton({super.key, required this.provider, this.onPressed, this.enabled = true});

  @override
  Widget build(BuildContext context) {
    final map = {
      SocialProvider.google: ('masuk_dengan_google'.tr(), Icons.g_mobiledata),
      SocialProvider.facebook: ('masuk_dengan_facebook'.tr(), Icons.facebook),
      SocialProvider.apple: ('masuk_dengan_apple'.tr(), Icons.apple),
    };
    final (label, icon) = map[provider]!;
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSizes.sm),
      child: AppButton(
        label: label,
        type: ButtonType.outline,
        icon: icon,
        onPressed: enabled ? onPressed : null,
        disabled: !enabled,
        height: 50,
      ),
    );
  }
}

enum SocialProvider { google, facebook, apple }
