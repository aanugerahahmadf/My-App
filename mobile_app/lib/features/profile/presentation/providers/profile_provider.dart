import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/profile_repository_impl.dart';
import '../../domain/profile_repository.dart';

class ProfileState {
  final Map<String, dynamic>? userData;
  final bool loading;
  final bool saving;
  final String? error;

  const ProfileState({
    this.userData,
    this.loading = false,
    this.saving = false,
    this.error,
  });

  ProfileState copyWith({
    Map<String, dynamic>? userData,
    bool? loading,
    bool? saving,
    String? error,
  }) {
    return ProfileState(
      userData: userData ?? this.userData,
      loading: loading ?? this.loading,
      saving: saving ?? this.saving,
      error: error,
    );
  }
}

class ProfileNotifier extends StateNotifier<ProfileState> {
  final ProfileRepository _repository;

  ProfileNotifier(this._repository) : super(const ProfileState());

  Future<void> fetchProfile() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final data = await _repository.getProfile();
      state = state.copyWith(userData: data, loading: false);
    } on DioException catch (e) {
      state = state.copyWith(
        loading: false,
        error: e.error?.toString() ?? 'Gagal memuat profil',
      );
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> updateProfile(Map<String, dynamic> data) async {
    state = state.copyWith(saving: true, error: null);
    try {
      final result = await _repository.updateProfile(data);
      state = state.copyWith(userData: result, saving: false);
    } on DioException catch (e) {
      state = state.copyWith(
        saving: false,
        error: e.error?.toString() ?? 'Gagal memperbarui profil',
      );
      rethrow;
    } catch (e) {
      state = state.copyWith(saving: false, error: e.toString());
      rethrow;
    }
  }

  Future<String?> uploadAvatar(String filePath) async {
    state = state.copyWith(saving: true, error: null);
    try {
      final avatarUrl = await _repository.uploadAvatar(filePath);
      if (state.userData != null) {
        final updated = Map<String, dynamic>.from(state.userData!)
          ..['avatar_url'] = avatarUrl;
        state = state.copyWith(userData: updated, saving: false);
      } else {
        state = state.copyWith(saving: false);
      }
      return avatarUrl;
    } on DioException catch (e) {
      state = state.copyWith(
        saving: false,
        error: e.error?.toString() ?? 'Gagal mengunggah avatar',
      );
      return null;
    } catch (e) {
      state = state.copyWith(saving: false, error: e.toString());
      return null;
    }
  }

  Future<void> changePassword(String currentPassword, String newPassword) async {
    state = state.copyWith(saving: true, error: null);
    try {
      await _repository.changePassword(currentPassword, newPassword);
      state = state.copyWith(saving: false);
    } on DioException catch (e) {
      state = state.copyWith(
        saving: false,
        error: e.error?.toString() ?? 'Gagal mengubah password',
      );
      rethrow;
    } catch (e) {
      state = state.copyWith(saving: false, error: e.toString());
      rethrow;
    }
  }
}

final profileProvider = StateNotifierProvider<ProfileNotifier, ProfileState>((ref) {
  return ProfileNotifier(ProfileRepositoryImpl());
});
