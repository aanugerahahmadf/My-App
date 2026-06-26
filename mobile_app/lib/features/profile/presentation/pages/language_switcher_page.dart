import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/constants/app_sizes.dart';

class LanguageSwitcherPage extends StatelessWidget {
  const LanguageSwitcherPage({super.key});

  static const _languages = [
    ('id', 'lang_id'),
    ('en', 'lang_en'),
    ('ms', 'lang_ms'),
    ('zh', 'lang_zh'),
    ('ar', 'lang_ar'),
    ('ja', 'lang_ja'),
    ('ko', 'lang_ko'),
    ('th', 'lang_th'),
    ('vi', 'lang_vi'),
    ('es', 'lang_es'),
  ];

  @override
  Widget build(BuildContext context) {
    final current = context.locale.languageCode;
    return Scaffold(
      appBar: AppBar(title: Text('pilih_bahasa'.tr())),
      body: ListView.separated(
        padding: const EdgeInsets.all(AppSizes.md),
        itemCount: _languages.length,
        separatorBuilder: (_, _) => const Divider(height: 1),
        itemBuilder: (_, i) {
          final code = _languages[i].$1;
          final name = _languages[i].$2.tr();
          final isActive = code == current;
          return ListTile(
            leading: Icon(
              isActive ? Icons.radio_button_checked : Icons.radio_button_off,
              color: isActive ? AppColors.primaryColor : AppColors.textSecondary,
            ),
            title: Text(name, style: AppTextStyles.bodyMedium.copyWith(
              color: isActive ? AppColors.primaryColor : AppColors.textPrimary,
              fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
            )),
            onTap: () {
              context.setLocale(Locale(code));
              Navigator.pop(context);
            },
          );
        },
      ),
    );
  }
}
