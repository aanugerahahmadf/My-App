import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/cart_repository_impl.dart';
import '../../domain/cart_repository.dart';

class CartState {
  final List<Map<String, dynamic>> items;
  final bool loading;
  final String? error;

  CartState({this.items = const [], this.loading = false, this.error});

  CartState copyWith({List<Map<String, dynamic>>? items, bool? loading, String? error}) {
    return CartState(
      items: items ?? this.items,
      loading: loading ?? this.loading,
      error: error,
    );
  }

  int get subtotal {
    int total = 0;
    for (final item in items) {
      final qty = item['quantity'] as int? ?? 1;
      final itemData = (item['package'] ?? item['product']) as Map<String, dynamic>?;
      final price = (itemData?['price'] as num?)?.toInt() ?? 0;
      total += price * qty;
    }
    return total;
  }
}

class CartNotifier extends StateNotifier<CartState> {
  final CartRepository _repository;

  CartNotifier(this._repository) : super(CartState());

  Future<void> fetchCart() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final items = await _repository.getCart();
      state = CartState(items: items, loading: false);
    } on DioException catch (e) {
      state = state.copyWith(loading: false, error: e.error?.toString() ?? 'Gagal memuat keranjang');
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<bool> addItem({String? productId, String? packageId, int quantity = 1}) async {
    try {
      await _repository.addToCart(productId: productId, packageId: packageId, quantity: quantity);
      await fetchCart();
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> updateQty(String cartId, int quantity) async {
    if (quantity < 1) {
      await removeItem(cartId);
      return true;
    }
    try {
      final updated = await _repository.updateQuantity(cartId, quantity);
      state = state.copyWith(
        items: state.items.map((item) {
          if ('${item['id']}' == cartId) return updated;
          return item;
        }).toList(),
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<void> removeItem(String cartId) async {
    try {
      await _repository.removeFromCart(cartId);
      state = state.copyWith(
        items: state.items.where((item) => '${item['id']}' != cartId).toList(),
      );
    } catch (e) {
      state = state.copyWith(error: 'Gagal menghapus item');
    }
  }
}

final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier(CartRepositoryImpl());
});
