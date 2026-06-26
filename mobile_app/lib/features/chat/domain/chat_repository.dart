abstract class ChatRepository {
  Future<List<Map<String, dynamic>>> getConversations();
  Future<List<Map<String, dynamic>>> getMessages(String inboxId);
  Future<int> getUnreadCount();
  Future<Map<String, dynamic>> sendMessage({
    required int inboxId,
    required String message,
  });
  Future<Map<String, dynamic>> startConversation();
}
