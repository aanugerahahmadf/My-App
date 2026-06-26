import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/cbir_repository_impl.dart';
import '../../data/models/cbir_result_model.dart';
import '../../domain/cbir_repository.dart';

final cbirRepositoryProvider = Provider<CbirRepository>((ref) {
  return CbirRepositoryImpl();
});

class CbirState {
  final List<CbirResultItem> results;
  final bool loading;
  final String? error;
  final String? uploadedImagePath;

  final String? sortBy;
  final String? categoryId;
  final bool? hasDiscount;
  final int? minRating;

  const CbirState({
    this.results = const [],
    this.loading = false,
    this.error,
    this.uploadedImagePath,
    this.sortBy,
    this.categoryId,
    this.hasDiscount,
    this.minRating,
  });

  List<CbirResultItem> get filteredResults {
    var items = results;

    if (categoryId != null) {
      items = items.where((e) => '${e.data.categoryId}' == categoryId).toList();
    }

    if (hasDiscount == true) {
      items = items.where((e) => e.data.discountPrice != null && e.data.discountPrice! > 0).toList();
    }

    if (minRating != null && minRating! > 0) {
      items = items.where((e) => e.data.averageRating >= minRating!).toList();
    }

    switch (sortBy) {
      case 'price_asc':
        items = List.from(items)..sort((a, b) => a.data.finalPrice.compareTo(b.data.finalPrice));
        break;
      case 'price_desc':
        items = List.from(items)..sort((a, b) => b.data.finalPrice.compareTo(a.data.finalPrice));
        break;
      case 'newest':
        items = List.from(items)..sort((a, b) => (b.data.createdAt ?? '').compareTo(a.data.createdAt ?? ''));
        break;
      case 'rating_desc':
        items = List.from(items)..sort((a, b) => b.data.averageRating.compareTo(a.data.averageRating));
        break;
      default:
        items = List.from(items)..sort((a, b) => b.similarity.compareTo(a.similarity));
    }

    return items;
  }

  CbirState copyWith({
    List<CbirResultItem>? results,
    bool? loading,
    String? error,
    String? uploadedImagePath,
    bool clearError = false,
    String? sortBy,
    bool clearSortBy = false,
    String? categoryId,
    bool clearCategoryId = false,
    bool? hasDiscount,
    bool clearHasDiscount = false,
    int? minRating,
    bool clearMinRating = false,
  }) {
    return CbirState(
      results: results ?? this.results,
      loading: loading ?? this.loading,
      error: clearError ? null : (error ?? this.error),
      uploadedImagePath: uploadedImagePath ?? this.uploadedImagePath,
      sortBy: clearSortBy ? null : (sortBy ?? this.sortBy),
      categoryId: clearCategoryId ? null : (categoryId ?? this.categoryId),
      hasDiscount: clearHasDiscount ? null : (hasDiscount ?? this.hasDiscount),
      minRating: clearMinRating ? null : (minRating ?? this.minRating),
    );
  }
}

class CbirNotifier extends StateNotifier<CbirState> {
  final CbirRepository _repository;

  CbirNotifier(this._repository) : super(const CbirState());

  Future<void> search(File image) async {
    state = state.copyWith(
      loading: true,
      error: null,
      clearError: true,
      uploadedImagePath: image.path,
    );

    try {
      final results = await _repository.searchByImage(image);
      state = state.copyWith(results: results, loading: false);
    } on DioException catch (e) {
      final message = e.response?.data?['message'] as String? ?? 'Pencarian gagal. Silakan coba lagi.';
      state = state.copyWith(loading: false, error: message);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  void setSortBy(String? value) {
    state = state.copyWith(sortBy: value, clearSortBy: value == null);
  }

  void setCategoryId(String? value) {
    state = state.copyWith(categoryId: value, clearCategoryId: value == null);
  }

  void setHasDiscount(bool? value) {
    state = state.copyWith(hasDiscount: value, clearHasDiscount: value == null || value == false);
  }

  void setMinRating(int? value) {
    state = state.copyWith(minRating: value, clearMinRating: value == null);
  }

  void reset() {
    state = const CbirState();
  }
}

final cbirProvider = StateNotifierProvider<CbirNotifier, CbirState>((ref) {
  return CbirNotifier(ref.watch(cbirRepositoryProvider));
});
