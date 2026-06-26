import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/constants/app_sizes.dart';
import '../../../../core/widgets/app_empty_state.dart';
import '../../../../core/utils/formatters.dart';
import '../providers/notification_provider.dart';

class NotificationPage extends ConsumerStatefulWidget {
  const NotificationPage({super.key});

  @override
  ConsumerState<NotificationPage> createState() => _NotificationPageState();
}

class _NotificationPageState extends ConsumerState<NotificationPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(notificationListProvider.notifier).fetchNotifications();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(notificationListProvider);
    final notifier = ref.read(notificationListProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: Text('notifikasi'.tr()),
        actions: [
          if (state.notifications.any((n) => n['read_at'] == null))
            TextButton(
              onPressed: () => notifier.markAllAsRead(),
              child: Text('tandai_dibaca'.tr()),
            ),
        ],
      ),
      body: state.loading
          ? const Center(child: CircularProgressIndicator())
          : state.error != null
              ? Center(child: Text(state.error!, style: AppTextStyles.bodyMedium))
              : state.notifications.isEmpty
                  ? AppEmptyState(
                      title: 'tidak_ada_notifikasi'.tr(),
                      subtitle: 'belum_ada_notifikasi_saat_ini'.tr(),
                      icon: Icons.notifications_outlined,
                    )
                  : RefreshIndicator(
                      onRefresh: () => notifier.fetchNotifications(),
                      child: ListView.separated(
                        padding: const EdgeInsets.all(AppSizes.sm),
                        itemCount: state.notifications.length,
                        separatorBuilder: (_, _) => const Divider(height: 1),
                        itemBuilder: (context, index) {
                          final notif = state.notifications[index];
                          final isRead = notif['read_at'] != null;
                          final title = notif['title'] as String? ?? 'notifikasi'.tr();
                          final body = notif['body'] as String? ?? notif['message'] as String? ?? '';
                          final time = notif['created_at'] as String? ?? '';

                          return ListTile(
                            leading: CircleAvatar(
                              backgroundColor: isRead ? Colors.grey[200] : AppColors.secondaryColor,
                              child: Icon(
                                _getNotificationIcon(notif['type'] as String?),
                                color: isRead ? AppColors.textSecondary : AppColors.primaryColor,
                                size: 20,
                              ),
                            ),
                            title: Text(
                              title,
                              style: AppTextStyles.bodyMedium.copyWith(
                                fontWeight: isRead ? FontWeight.normal : FontWeight.w600,
                              ),
                            ),
                            subtitle: Text(
                              body,
                              style: AppTextStyles.bodySmall,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            trailing: Text(
                              Formatters.timeAgo(time),
                              style: AppTextStyles.labelSmall,
                            ),
                            onTap: () {
                              if (!isRead) notifier.markAsRead(notif['id'].toString());
                            },
                          );
                        },
                      ),
                    ),
    );
  }

  IconData _getNotificationIcon(String? type) {
    switch (type) {
      case 'order': return Icons.receipt_long;
      case 'payment': return Icons.payment;
      case 'chat': return Icons.chat;
      case 'promo': return Icons.local_offer;
      default: return Icons.notifications;
    }
  }
}
