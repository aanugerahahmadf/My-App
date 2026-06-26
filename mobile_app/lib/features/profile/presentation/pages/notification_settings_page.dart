import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/constants/app_sizes.dart';

class NotificationSettingsPage extends StatefulWidget {
  const NotificationSettingsPage({super.key});

  @override
  State<NotificationSettingsPage> createState() => _NotificationSettingsPageState();
}

class _NotificationSettingsPageState extends State<NotificationSettingsPage> {
  bool _orderUpdates = true;
  bool _promotions = false;
  bool _chatMessages = true;
  bool _wishlistAlerts = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('pengaturan_notifikasi'.tr())),
      body: ListView(
        padding: const EdgeInsets.all(AppSizes.md),
        children: [
          _buildSwitchTile('notifikasi_pesanan'.tr(), 'notifikasi_pesanan_desc'.tr(), _orderUpdates, (v) {
            setState(() => _orderUpdates = v);
          }),
          _buildSwitchTile('notifikasi_promosi'.tr(), 'notifikasi_promosi_desc'.tr(), _promotions, (v) {
            setState(() => _promotions = v);
          }),
          _buildSwitchTile('notifikasi_chat'.tr(), 'notifikasi_chat_desc'.tr(), _chatMessages, (v) {
            setState(() => _chatMessages = v);
          }),
          _buildSwitchTile('notifikasi_favorit'.tr(), 'notifikasi_favorit_desc'.tr(), _wishlistAlerts, (v) {
            setState(() => _wishlistAlerts = v);
          }),
        ],
      ),
    );
  }

  Widget _buildSwitchTile(String title, String subtitle, bool value, ValueChanged<bool> onChanged) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSizes.sm),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: SwitchListTile(
        title: Text(title, style: AppTextStyles.bodyMedium),
        subtitle: Text(subtitle, style: AppTextStyles.bodySmall),
        value: value,
        onChanged: onChanged,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
