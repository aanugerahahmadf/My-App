import 'message_model.dart';

class ConversationModel {
  final int id;
  final String? title;
  final Map<String, dynamic>? otherUser;
  final MessageModel? lastMessage;
  final int unreadCount;
  final String? createdAt;
  final String? updatedAt;

  const ConversationModel({
    required this.id,
    this.title,
    this.otherUser,
    this.lastMessage,
    this.unreadCount = 0,
    this.createdAt,
    this.updatedAt,
  });

  String? get otherUserName => otherUser?['name'] as String?;
  String? get otherUserPhoto => otherUser?['profile_photo'] as String?;
  int? get otherUserId => otherUser?['id'] as int?;

  factory ConversationModel.fromJson(Map<String, dynamic> json) {
    return ConversationModel(
      id: json['id'] as int,
      title: json['title'] as String?,
      otherUser: json['other_user'] as Map<String, dynamic>?,
      lastMessage: json['last_message'] != null
          ? MessageModel.fromJson(json['last_message'] as Map<String, dynamic>)
          : null,
      unreadCount: (json['unread_count'] ?? 0) as int,
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
    );
  }
}
