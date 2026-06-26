import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/chat_repository_impl.dart';
import '../../domain/chat_repository.dart';

sealed class ChatState {
  const ChatState();
}

class ChatLoading extends ChatState {
  const ChatLoading();
}

class ChatConversationsLoaded extends ChatState {
  final List<Map<String, dynamic>> conversations;
  final int unreadCount;
  const ChatConversationsLoaded(this.conversations, {this.unreadCount = 0});
}

class ChatMessagesLoaded extends ChatState {
  final Map<String, dynamic> conversation;
  final List<Map<String, dynamic>> messages;
  const ChatMessagesLoaded(this.conversation, this.messages);
}

class ChatError extends ChatState {
  final String message;
  const ChatError(this.message);
}

class ChatNotifier extends StateNotifier<ChatState> {
  final ChatRepository _repository;

  ChatNotifier(this._repository) : super(const ChatLoading());

  Future<void> loadConversations() async {
    state = const ChatLoading();
    try {
      final conversations = await _repository.getConversations();
      final unreadCount = await _repository.getUnreadCount();
      state = ChatConversationsLoaded(conversations, unreadCount: unreadCount);
    } on DioException catch (e) {
      state = ChatError(e.error?.toString() ?? 'Gagal memuat percakapan');
    } catch (e) {
      state = ChatError(e.toString());
    }
  }

  Future<void> loadMessages(String conversationId) async {
    state = const ChatLoading();
    try {
      final messages = await _repository.getMessages(conversationId);
      final conversation = <String, dynamic>{'id': conversationId};
      state = ChatMessagesLoaded(conversation, messages);
    } on DioException catch (e) {
      state = ChatError(e.error?.toString() ?? 'Gagal memuat pesan');
    } catch (e) {
      state = ChatError(e.toString());
    }
  }

  Future<void> refreshMessages(String conversationId) async {
    try {
      final messages = await _repository.getMessages(conversationId);
      if (state is ChatMessagesLoaded) {
        final current = state as ChatMessagesLoaded;
        state = ChatMessagesLoaded(current.conversation, messages);
      }
    } catch (_) {}
  }

  Future<void> sendMessage({
    required int inboxId,
    required String message,
    required String senderName,
  }) async {
    try {
      final sent = await _repository.sendMessage(inboxId: inboxId, message: message);
      final constructed = <String, dynamic>{
        'id': sent['id'],
        'message': message,
        'sender_id': sent['user_id'],
        'sender_name': senderName,
        'is_me': true,
        'read_by': <String>[],
        'attachments': <String>[],
        'created_at': sent['created_at'] ?? DateTime.now().toIso8601String(),
      };
      if (state is ChatMessagesLoaded) {
        final current = state as ChatMessagesLoaded;
        final updatedMessages = [...current.messages, constructed];
        state = ChatMessagesLoaded(current.conversation, updatedMessages);
      }
    } on DioException catch (e) {
      throw Exception(e.error?.toString() ?? 'Gagal mengirim pesan');
    }
  }

  Future<int> startConversation() async {
    final result = await _repository.startConversation();
    return result['id'] as int;
  }
}

final chatProvider = StateNotifierProvider<ChatNotifier, ChatState>((ref) {
  return ChatNotifier(ChatRepositoryImpl());
});
