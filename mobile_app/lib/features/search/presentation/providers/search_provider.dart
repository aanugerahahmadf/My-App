import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/search_repository_impl.dart';
import '../../domain/search_repository.dart';

class SearchState {
  final Map<String, dynamic>? results;
  final bool loading;
  final String? error;

  const SearchState({this.results, this.loading = false, this.error});

  SearchState copyWith({Map<String, dynamic>? results, bool? loading, String? error}) {
    return SearchState(results: results ?? this.results, loading: loading ?? this.loading, error: error);
  }
}

class SearchNotifier extends StateNotifier<SearchState> {
  final SearchRepository _repository;
  SearchNotifier(this._repository) : super(const SearchState());

  Future<void> search(String query, {int page = 1}) async {
    state = state.copyWith(loading: true, error: null);
    try {
      final results = await _repository.search(query, page: page);
      state = state.copyWith(results: results, loading: false);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }
}

final searchProvider = StateNotifierProvider<SearchNotifier, SearchState>((ref) {
  return SearchNotifier(SearchRepositoryImpl());
});
