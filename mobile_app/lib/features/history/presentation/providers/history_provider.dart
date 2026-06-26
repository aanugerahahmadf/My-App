import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/history_repository_impl.dart';
import '../../data/models/history_model.dart';
import '../../domain/history_repository.dart';

class HistoryState {
  final List<HistoryModel> items;
  final bool loading;
  final String? error;

  const HistoryState({this.items = const [], this.loading = false, this.error});

  HistoryState copyWith({List<HistoryModel>? items, bool? loading, String? error}) {
    return HistoryState(items: items ?? this.items, loading: loading ?? this.loading, error: error);
  }
}

class HistoryNotifier extends StateNotifier<HistoryState> {
  final HistoryRepository _repository;
  HistoryNotifier(this._repository) : super(const HistoryState());

  Future<void> fetchHistory() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final items = await _repository.getHistory();
      state = state.copyWith(items: items, loading: false);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }
}

final historyRepositoryProvider = Provider((ref) => HistoryRepositoryImpl() as HistoryRepository);

final historyProvider = StateNotifierProvider<HistoryNotifier, HistoryState>((ref) {
  return HistoryNotifier(ref.read(historyRepositoryProvider));
});
