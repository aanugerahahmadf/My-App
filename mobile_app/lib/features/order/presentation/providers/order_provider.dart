import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/order_repository_impl.dart';
import '../../domain/order_repository.dart';

class OrderState {
  final List<Map<String, dynamic>> orders;
  final bool loading;
  final bool loadingMore;
  final bool creating;
  final String? error;
  final int page;
  final bool hasMore;
  final Map<String, dynamic>? createdOrder;

  const OrderState({
    this.orders = const [],
    this.loading = false,
    this.loadingMore = false,
    this.creating = false,
    this.error,
    this.page = 1,
    this.hasMore = true,
    this.createdOrder,
  });

  OrderState copyWith({
    List<Map<String, dynamic>>? orders,
    bool? loading,
    bool? loadingMore,
    bool? creating,
    String? error,
    int? page,
    bool? hasMore,
    Map<String, dynamic>? createdOrder,
    bool clearError = false,
  }) {
    return OrderState(
      orders: orders ?? this.orders,
      loading: loading ?? this.loading,
      loadingMore: loadingMore ?? this.loadingMore,
      creating: creating ?? this.creating,
      error: clearError ? null : (error ?? this.error),
      page: page ?? this.page,
      hasMore: hasMore ?? this.hasMore,
      createdOrder: createdOrder ?? this.createdOrder,
    );
  }
}

class OrderNotifier extends StateNotifier<OrderState> {
  final OrderRepository _repository;

  OrderNotifier(this._repository) : super(const OrderState());

  Future<void> fetchOrders({String? status, bool refresh = false}) async {
    if (refresh) {
      state = state.copyWith(loading: true, error: null, page: 1, hasMore: true, clearError: true);
    }
    try {
      final orders = await _repository.getOrders(status: status, page: state.page);
      if (refresh || state.page == 1) {
        state = state.copyWith(orders: orders, loading: false, hasMore: orders.length >= 10);
      } else {
        state = state.copyWith(
          orders: [...state.orders, ...orders],
          loadingMore: false,
          hasMore: orders.length >= 10,
        );
      }
    } on DioException catch (e) {
      state = state.copyWith(
        loading: false,
        loadingMore: false,
        error: e.error?.toString() ?? 'Gagal memuat pesanan',
      );
    } catch (e) {
      state = state.copyWith(loading: false, loadingMore: false, error: e.toString());
    }
  }

  Future<void> loadMore({String? status}) async {
    if (!state.hasMore || state.loadingMore) return;
    state = state.copyWith(loadingMore: true, page: state.page + 1);
    await fetchOrders(status: status);
  }

  Future<bool> createOrder(Map<String, dynamic> data) async {
    state = state.copyWith(creating: true, error: null, clearError: true);
    try {
      final order = await _repository.createOrder(data);
      state = state.copyWith(creating: false, createdOrder: order);
      return true;
    } on DioException catch (e) {
      final msg = (e.response?.data as Map<String, dynamic>?)?['message'] as String? ?? 'Gagal membuat pesanan';
      state = state.copyWith(creating: false, error: msg);
      return false;
    } catch (e) {
      state = state.copyWith(creating: false, error: e.toString());
      return false;
    }
  }

  Future<bool> payOrder(String id) async {
    try {
      await _repository.payOrder(id);
      return true;
    } catch (e) {
      state = state.copyWith(error: 'Gagal memproses pembayaran');
      return false;
    }
  }

  Future<bool> cancelOrder(String id) async {
    try {
      await _repository.cancelOrder(id);
      state = state.copyWith(orders: state.orders.where((o) => o['id'].toString() != id).toList());
      return true;
    } catch (e) {
      state = state.copyWith(error: 'Gagal membatalkan pesanan');
      return false;
    }
  }

  void clearCreatedOrder() {
    state = state.copyWith(createdOrder: null);
  }
}

final orderProvider = StateNotifierProvider<OrderNotifier, OrderState>((ref) {
  return OrderNotifier(OrderRepositoryImpl());
});
