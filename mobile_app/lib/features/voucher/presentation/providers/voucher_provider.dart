import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/voucher_repository_impl.dart';
import '../../data/models/voucher_model.dart';
import '../../domain/voucher_repository.dart';

final voucherRepositoryProvider = Provider((ref) => VoucherRepositoryImpl() as VoucherRepository);

final voucherProvider = StateNotifierProvider<VoucherNotifier, VoucherState>((ref) {
  return VoucherNotifier(ref.read(voucherRepositoryProvider));
});

class VoucherState {
  final List<VoucherModel> vouchers;
  final bool loading;
  final String? error;

  const VoucherState({this.vouchers = const [], this.loading = false, this.error});

  VoucherState copyWith({List<VoucherModel>? vouchers, bool? loading, String? error}) {
    return VoucherState(vouchers: vouchers ?? this.vouchers, loading: loading ?? this.loading, error: error);
  }
}

class VoucherNotifier extends StateNotifier<VoucherState> {
  final VoucherRepository _repo;
  VoucherNotifier(this._repo) : super(const VoucherState());

  Future<void> fetchVouchers() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final vouchers = await _repo.getVouchers();
      state = state.copyWith(vouchers: vouchers, loading: false);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<bool> claimVoucher(String id) async {
    try {
      await _repo.claimVoucher(id);
      await fetchVouchers();
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }
}
