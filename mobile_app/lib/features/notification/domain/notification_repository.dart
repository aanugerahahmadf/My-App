abstract class NotificationRepository {
  Future<List<Map<String, dynamic>>> getNotifications();
  Future<void> markAsRead(String id);
  Future<void> markAllAsRead();
}
