import 'package:dio/dio.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/api/dio_client.dart';
import '../domain/chat_repository.dart';

class ChatRepositoryImpl implements ChatRepository {
  final Dio _dio;

  ChatRepositoryImpl({Dio? dio}) : _dio = dio ?? DioClient.instance;

  @override
  Future<List<Map<String, dynamic>>> getConversations() async {
    final response = await _dio.get(ApiEndpoints.conversations);
    return (response.data['data'] as List?)?.cast<Map<String, dynamic>>() ?? [];
  }

  @override
  Future<List<Map<String, dynamic>>> getMessages(String inboxId) async {
    final response = await _dio.get(ApiEndpoints.conversationMessages(inboxId));
    final data = response.data['data'];
    if (data is List) return data.cast<Map<String, dynamic>>();
    return [];
  }

  @override
  Future<int> getUnreadCount() async {
    final response = await _dio.get(ApiEndpoints.unreadCount);
    return (response.data['data']?['unread_count'] as int?) ?? 0;
  }

  @override
  Future<Map<String, dynamic>> sendMessage({
    required int inboxId,
    required String message,
  }) async {
    final response = await _dio.post(ApiEndpoints.messagesSend, data: {
      'inbox_id': inboxId,
      'message': message,
    });
    return response.data['data'] as Map<String, dynamic>;
  }

  @override
  Future<Map<String, dynamic>> startConversation() async {
    final response = await _dio.post(ApiEndpoints.messagesStart);
    return response.data['data'] as Map<String, dynamic>;
  }
}
