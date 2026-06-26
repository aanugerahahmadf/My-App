class NotificationModel {
  final int id;
  final String? type;
  final String? title;
  final String? body;
  final Map<String, dynamic>? data;
  final bool read;
  final String? createdAt;

  const NotificationModel({
    required this.id,
    this.type,
    this.title,
    this.body,
    this.data,
    this.read = false,
    this.createdAt,
  });

  NotificationModel copyWith({DateTime? readAt}) {
    return NotificationModel(
      id: id,
      type: type,
      title: title,
      body: body,
      data: data,
      read: readAt != null ? true : read,
      createdAt: createdAt,
    );
  }

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] as int,
      type: json['type'] as String?,
      title: json['title'] as String? ?? json['data']?['title'] as String?,
      body: json['body'] as String? ?? json['data']?['body'] as String? ?? json['message'] as String?,
      data: json['data'] as Map<String, dynamic>?,
      read: json['read'] as bool? ?? json['read_at'] != null,
      createdAt: json['created_at'] as String?,
    );
  }
}
