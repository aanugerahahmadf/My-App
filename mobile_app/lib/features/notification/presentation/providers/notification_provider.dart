import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/notification_repository_impl.dart';
import '../../domain/notification_repository.dart';

class NotificationState {
  final List<Map<String, dynamic>> notifications;
  final bool loading;
  final String? error;

  const NotificationState({
    this.notifications = const [],
    this.loading = false,
    this.error,
  });

  NotificationState copyWith({
    List<Map<String, dynamic>>? notifications,
    bool? loading,
    String? error,
  }) {
    return NotificationState(
      notifications: notifications ?? this.notifications,
      loading: loading ?? this.loading,
      error: error,
    );
  }
}

class NotificationNotifier extends StateNotifier<NotificationState> {
  final NotificationRepository _repository;

  NotificationNotifier(this._repository) : super(const NotificationState());

  Future<void> fetchNotifications() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final notifications = await _repository.getNotifications();
      state = state.copyWith(notifications: notifications, loading: false);
    } on DioException catch (e) {
      state = state.copyWith(
        loading: false,
        error: e.error?.toString() ?? 'Gagal memuat notifikasi',
      );
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> markAsRead(String id) async {
    try {
      await _repository.markAsRead(id);
      state = state.copyWith(
        notifications: state.notifications.map((n) {
          if (n['id'].toString() == id) {
            return {...n, 'read_at': DateTime.now().toIso8601String()};
          }
          return n;
        }).toList(),
      );
    } catch (_) {}
  }

  Future<void> markAllAsRead() async {
    try {
      await _repository.markAllAsRead();
      state = state.copyWith(
        notifications: state.notifications.map((n) {
          return {...n, 'read_at': DateTime.now().toIso8601String()};
        }).toList(),
      );
    } catch (_) {}
  }
}

final notificationListProvider = StateNotifierProvider<NotificationNotifier, NotificationState>((ref) {
  return NotificationNotifier(NotificationRepositoryImpl());
});
