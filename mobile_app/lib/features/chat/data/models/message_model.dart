class MessageModel {
  final int id;
  final int senderId;
  final String? message;
  final String? senderName;
  final bool isMe;
  final bool isBot;
  final List<dynamic>? attachments;
  final Map<String, dynamic>? meta;
  final List<dynamic>? readBy;
  final List<dynamic>? readAt;
  final String? createdAt;

  const MessageModel({
    required this.id,
    required this.senderId,
    this.message,
    this.senderName,
    this.isMe = false,
    this.isBot = false,
    this.attachments,
    this.meta,
    this.readBy,
    this.readAt,
    this.createdAt,
  });

  bool get isRead => readBy != null && readBy!.isNotEmpty;

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    final metaRaw = json['meta'] as Map<String, dynamic>?;
    return MessageModel(
      id: json['id'] as int,
      senderId: (json['sender_id'] ?? json['user_id'] ?? 0) as int,
      message: json['message'] as String?,
      senderName: json['sender_name'] as String?,
      isMe: json['is_me'] as bool? ?? false,
      isBot: metaRaw?['is_bot'] as bool? ?? false,
      attachments: json['attachments'] as List<dynamic>?,
      meta: metaRaw,
      readBy: json['read_by'] as List<dynamic>?,
      readAt: json['read_at'] as List<dynamic>?,
      createdAt: json['created_at'] as String?,
    );
  }
}
