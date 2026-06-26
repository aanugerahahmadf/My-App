import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/constants/app_sizes.dart';
import '../../../../core/widgets/app_empty_state.dart';
import '../../../../core/utils/formatters.dart';
import '../providers/chat_provider.dart';

class ChatListPage extends ConsumerStatefulWidget {
  const ChatListPage({super.key});

  @override
  ConsumerState<ChatListPage> createState() => _ChatListPageState();
}

class _ChatListPageState extends ConsumerState<ChatListPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(chatProvider.notifier).loadConversations();
    });
  }

  Future<void> _startConversation() async {
    try {
      final notifier = ref.read(chatProvider.notifier);
      final inboxId = await notifier.startConversation();
      if (mounted) {
        context.push('/chat/$inboxId');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('gagal_mulai_percakapan'.tr())),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final chatState = ref.watch(chatProvider);

    return Scaffold(
      appBar: AppBar(title: Text('pesan'.tr())),
      body: chatState is ChatLoading
          ? const Center(child: CircularProgressIndicator())
          : chatState is ChatConversationsLoaded
              ? chatState.conversations.isEmpty
                  ? AppEmptyState(
                      title: 'tidak_ada_pesan'.tr(),
                      subtitle: 'belum_ada_percakapan'.tr(),
                      icon: Icons.chat_outlined,
                    )
                  : RefreshIndicator(
                      onRefresh: () => ref.read(chatProvider.notifier).loadConversations(),
                      child: ListView.separated(
                        padding: const EdgeInsets.all(AppSizes.sm),
                        itemCount: chatState.conversations.length,
                        separatorBuilder: (_, _) => const Divider(height: 1),
                        itemBuilder: (context, index) {
                          final conv = chatState.conversations[index];
                          final otherUser = conv['other_user'] as Map<String, dynamic>? ?? {};
                          final name = otherUser['name'] as String? ?? conv['title'] as String? ?? 'Admin';
                          final avatarUrl = otherUser['profile_photo'] as String?;
                          final lastMsgData = conv['last_message'] as Map<String, dynamic>?;
                          final lastMsg = lastMsgData?['message'] as String? ?? '';
                          final lastTime = lastMsgData?['created_at'] as String? ?? conv['updated_at'] as String? ?? '';
                          final unread = conv['unread_count'] as int? ?? 0;

                          return ListTile(
                            leading: CircleAvatar(
                              backgroundColor: AppColors.secondaryColor,
                              backgroundImage: avatarUrl != null && avatarUrl.isNotEmpty ? NetworkImage(avatarUrl) : null,
                              child: avatarUrl == null || avatarUrl.isEmpty
                                  ? const Icon(Icons.person, color: AppColors.primaryColor)
                                  : null,
                            ),
                            title: Text(name, style: AppTextStyles.bodyLarge),
                            subtitle: Text(
                              lastMsg,
                              style: AppTextStyles.bodySmall,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            trailing: Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(Formatters.timeAgo(lastTime), style: AppTextStyles.labelSmall),
                                if (unread > 0) ...[
                                  const SizedBox(height: 4),
                                  Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: const BoxDecoration(
                                      color: AppColors.errorColor,
                                      shape: BoxShape.circle,
                                    ),
                                    child: Text(
                                      unread > 9 ? '9+' : '$unread',
                                      style: AppTextStyles.labelSmall.copyWith(color: Colors.white, fontSize: 10),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            onTap: () => context.push('/chat/${conv['id']}'),
                          );
                        },
                      ),
                    )
              : chatState is ChatError
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(chatState.message, style: AppTextStyles.bodyMedium),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: _startConversation,
                            child: Text('mulai_chat_admin'.tr()),
                          ),
                        ],
                      ),
                    )
                  : const SizedBox.shrink(),
      floatingActionButton: chatState is ChatConversationsLoaded
          ? FloatingActionButton(
              onPressed: _startConversation,
              backgroundColor: AppColors.primaryColor,
              child: const Icon(Icons.chat, color: Colors.white),
            )
          : null,
    );
  }
}
