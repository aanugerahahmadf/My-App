import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/review_repository_impl.dart';
import '../../domain/review_repository.dart';

class MyReviewsState {
  final List<Map<String, dynamic>> reviews;
  final bool loading;
  final String? error;

  const MyReviewsState({this.reviews = const [], this.loading = false, this.error});

  MyReviewsState copyWith({List<Map<String, dynamic>>? reviews, bool? loading, String? error}) {
    return MyReviewsState(reviews: reviews ?? this.reviews, loading: loading ?? this.loading, error: error);
  }
}

class MyReviewsNotifier extends StateNotifier<MyReviewsState> {
  final ReviewRepository _repository;
  MyReviewsNotifier(this._repository) : super(const MyReviewsState());

  Future<void> fetchMyReviews() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final reviews = await _repository.getMyReviews();
      state = state.copyWith(reviews: reviews, loading: false);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }
}

final myReviewsProvider = StateNotifierProvider<MyReviewsNotifier, MyReviewsState>((ref) {
  return MyReviewsNotifier(ReviewRepositoryImpl());
});
