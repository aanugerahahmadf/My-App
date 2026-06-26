import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/profile_repository_impl.dart';
import '../../domain/profile_repository.dart';

class ProfileState {
  final Map<String, dynamic>? userData;
  final bool loading;
  final bool saving;
  final String? error;
  final int completionPercent;
  final Map<String, dynamic>? completionItems;
  final bool ktpUploading;
  final bool selfieUploading;
  final String? ktpUrl;
  final String? selfieUrl;

  const ProfileState({
    this.userData,
    this.loading = false,
    this.saving = false,
    this.error,
    this.completionPercent = 0,
    this.completionItems,
    this.ktpUploading = false,
    this.selfieUploading = false,
    this.ktpUrl,
    this.selfieUrl,
  });

  ProfileState copyWith({
    Map<String, dynamic>? userData,
    bool? loading,
    bool? saving,
    String? error,
    int? completionPercent,
    Map<String, dynamic>? completionItems,
    bool? ktpUploading,
    bool? selfieUploading,
    String? ktpUrl,
    String? selfieUrl,
  }) {
    return ProfileState(
      userData: userData ?? this.userData,
      loading: loading ?? this.loading,
      saving: saving ?? this.saving,
      error: error,
      completionPercent: completionPercent ?? this.completionPercent,
      completionItems: completionItems ?? this.completionItems,
      ktpUploading: ktpUploading ?? this.ktpUploading,
      selfieUploading: selfieUploading ?? this.selfieUploading,
      ktpUrl: ktpUrl ?? this.ktpUrl,
      selfieUrl: selfieUrl ?? this.selfieUrl,
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

  Future<void> fetchCompletion() async {
    try {
      final result = await _repository.getCompletion();
      state = state.copyWith(
        completionPercent: (result['completion_percent'] as num?)?.toInt() ?? 0,
        completionItems: result['items'] as Map<String, dynamic>?,
      );
    } catch (_) {}
  }

  Future<void> updateNik(String nik) async {
    state = state.copyWith(saving: true, error: null);
    try {
      await _repository.updateNik(nik);
      final updated = Map<String, dynamic>.from(state.userData ?? {})..['nik'] = nik;
      state = state.copyWith(userData: updated, saving: false);
      await fetchCompletion();
    } on DioException catch (e) {
      state = state.copyWith(saving: false, error: e.error?.toString() ?? 'Gagal memperbarui NIK');
      rethrow;
    } catch (e) {
      state = state.copyWith(saving: false, error: e.toString());
      rethrow;
    }
  }

  Future<String?> uploadKtp(String filePath) async {
    state = state.copyWith(ktpUploading: true, error: null);
    try {
      final url = await _repository.uploadKtp(filePath);
      state = state.copyWith(ktpUrl: url, ktpUploading: false);
      if (state.userData != null) {
        final updated = Map<String, dynamic>.from(state.userData!)..['ktp_photo_url'] = url;
        state = state.copyWith(userData: updated);
      }
      await fetchCompletion();
      return url;
    } on DioException catch (e) {
      state = state.copyWith(ktpUploading: false, error: e.error?.toString() ?? 'Gagal mengunggah KTP');
      return null;
    } catch (e) {
      state = state.copyWith(ktpUploading: false, error: e.toString());
      return null;
    }
  }

  Future<Map<String, dynamic>?> uploadSelfie(String filePath) async {
    state = state.copyWith(selfieUploading: true, error: null);
    try {
      final result = await _repository.uploadSelfie(filePath);
      state = state.copyWith(
        selfieUrl: result['selfie_photo_url'] as String?,
        selfieUploading: false,
      );
      if (state.userData != null) {
        final updated = Map<String, dynamic>.from(state.userData!)
          ..['selfie_photo_url'] = result['selfie_photo_url']
          ..['identity_verified_at'] = result['identity_verified_at'];
        state = state.copyWith(userData: updated);
      }
      await fetchCompletion();
      return result;
    } on DioException catch (e) {
      state = state.copyWith(selfieUploading: false, error: e.error?.toString() ?? 'Gagal mengunggah selfie');
      return null;
    } catch (e) {
      state = state.copyWith(selfieUploading: false, error: e.toString());
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
