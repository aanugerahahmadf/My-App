import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/payment_repository_impl.dart';
import '../../domain/payment_repository.dart';

class PaymentState {
  final bool loading;
  final String? error;
  final String? snapToken;
  final String? paymentUrl;
  final Map<String, dynamic>? transaction;

  const PaymentState({this.loading = false, this.error, this.snapToken, this.paymentUrl, this.transaction});

  PaymentState copyWith({
    bool? loading,
    String? error,
    String? snapToken,
    String? paymentUrl,
    Map<String, dynamic>? transaction,
  }) {
    return PaymentState(
      loading: loading ?? this.loading,
      error: error,
      snapToken: snapToken ?? this.snapToken,
      paymentUrl: paymentUrl ?? this.paymentUrl,
      transaction: transaction ?? this.transaction,
    );
  }
}

class PaymentNotifier extends StateNotifier<PaymentState> {
  final PaymentRepository _repository;

  PaymentNotifier(this._repository) : super(const PaymentState());

  Future<bool> initiatePayment(String orderId) async {
    state = const PaymentState(loading: true);
    try {
      final data = await _repository.initiatePayment(orderId);
      state = PaymentState(
        loading: false,
        snapToken: data['snap_token'] as String?,
        paymentUrl: data['payment_url'] as String?,
        transaction: data['transaction'] as Map<String, dynamic>?,
      );
      return true;
    } on DioException catch (e) {
      state = PaymentState(loading: false, error: e.error?.toString() ?? 'Gagal memproses pembayaran');
      return false;
    } catch (e) {
      state = PaymentState(loading: false, error: e.toString());
      return false;
    }
  }

  void reset() {
    state = const PaymentState();
  }
}

final paymentProvider = StateNotifierProvider<PaymentNotifier, PaymentState>((ref) {
  return PaymentNotifier(PaymentRepositoryImpl());
});
