import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../constants/app_colors.dart';
import '../constants/app_text_styles.dart';
import 'app_bottom_sheet.dart';

class LanguageSelector extends StatelessWidget {
  const LanguageSelector({super.key});

  static const _languages = [
    ('id', 'Bahasa Indonesia'),
    ('en', 'English'),
    ('ms', 'Bahasa Melayu'),
    ('zh', '中文'),
    ('ar', 'العربية'),
    ('ja', '日本語'),
    ('ko', '한국어'),
    ('th', 'ไทย'),
    ('vi', 'Tiếng Việt'),
    ('es', 'Español'),
  ];

  void _showPicker(BuildContext context) {
    final current = context.locale.languageCode;
    AppBottomSheet.show(
      context,
      Column(
        children: _languages.map((lang) {
          final code = lang.$1;
          final name = lang.$2;
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
        }).toList(),
      ),
      title: 'pilih_bahasa'.tr(),
      initial: 0.7,
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentName = _languages.firstWhere(
      (l) => l.$1 == context.locale.languageCode,
      orElse: () => ('id', 'Bahasa Indonesia'),
    ).$2;

    return ListTile(
      leading: const Icon(Icons.language, color: AppColors.primaryColor),
      title: Text('bahasa'.tr(), style: AppTextStyles.bodyMedium),
      subtitle: Text(currentName, style: AppTextStyles.bodySmall),
      trailing: const Icon(Icons.chevron_right, color: AppColors.textSecondary),
      onTap: () => _showPicker(context),
    );
  }
}
