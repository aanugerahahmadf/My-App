import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/constants/app_sizes.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../../core/utils/validators.dart';
import '../providers/profile_provider.dart';

class EditProfilePage extends ConsumerStatefulWidget {
  const EditProfilePage({super.key});

  @override
  ConsumerState<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends ConsumerState<EditProfilePage> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _midNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _fullNameController = TextEditingController();
  final _usernameController = TextEditingController();
  final _whatsappController = TextEditingController();
  final _nikController = TextEditingController();
  File? _avatarFile;
  File? _ktpFile;
  File? _selfieFile;
  bool _editing = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final state = ref.read(profileProvider);
      final userData = state.userData;
      if (userData != null) {
        _firstNameController.text = userData['first_name'] as String? ?? '';
        _midNameController.text = userData['mid_name'] as String? ?? '';
        _lastNameController.text = userData['last_name'] as String? ?? '';
        _fullNameController.text = userData['full_name'] as String? ?? '';
        _usernameController.text = userData['username'] as String? ?? '';
        _whatsappController.text = userData['whatsapp'] as String? ?? '';
        _nikController.text = userData['nik'] as String? ?? '';
      }
      ref.read(profileProvider.notifier).fetchCompletion();
    });
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _midNameController.dispose();
    _lastNameController.dispose();
    _fullNameController.dispose();
    _usernameController.dispose();
    _whatsappController.dispose();
    _nikController.dispose();
    super.dispose();
  }

  void _syncFullName() {
    final parts = [
      _firstNameController.text.trim(),
      if (_midNameController.text.trim().isNotEmpty) _midNameController.text.trim(),
      _lastNameController.text.trim(),
    ];
    _fullNameController.text = parts.where((p) => p.isNotEmpty).join(' ');
  }

  Future<void> _pickImage(ValueChanged<File> onPicked) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery, maxWidth: 1024, maxHeight: 1024);
    if (picked != null) {
      onPicked(File(picked.path));
    }
  }

  Future<void> _pickSelfie() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.camera, maxWidth: 1024, maxHeight: 1024, preferredCameraDevice: CameraDevice.front);
    if (picked != null) {
      setState(() => _selfieFile = File(picked.path));
    }
  }

  void _toggleEdit() {
    if (!_editing) {
      setState(() => _editing = true);
      return;
    }
    _save();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    final profileNotifier = ref.read(profileProvider.notifier);

    final data = <String, dynamic>{
      'first_name': _firstNameController.text.trim(),
      'mid_name': _midNameController.text.trim(),
      'last_name': _lastNameController.text.trim(),
      'full_name': _fullNameController.text.trim(),
      'username': _usernameController.text.trim(),
      'whatsapp': _whatsappController.text.trim(),
    };

    try {
      await profileNotifier.updateProfile(data);

      final nik = _nikController.text.trim();
      if (nik.isNotEmpty && nik != (ref.read(profileProvider).userData?['nik'] as String? ?? '')) {
        await profileNotifier.updateNik(nik);
      }

      if (_avatarFile != null) {
        await profileNotifier.uploadAvatar(_avatarFile!.path);
      }

      if (_ktpFile != null) {
        await profileNotifier.uploadKtp(_ktpFile!.path);
      }

      if (_selfieFile != null) {
        await profileNotifier.uploadSelfie(_selfieFile!.path);
      }

      if (mounted) {
        AppSnackBar.show(context, 'profil_berhasil_diperbarui'.tr(), type: SnackBarType.success);
        setState(() => _editing = false);
      }
    } catch (e) {
      if (mounted) {
        AppSnackBar.show(context, 'gagal_update_profil'.tr(), type: SnackBarType.error);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final pState = ref.watch(profileProvider);
    final userData = pState.userData;
    final ktpUrl = pState.ktpUrl ?? userData?['ktp_photo_url'] as String?;
    final selfieUrl = pState.selfieUrl ?? userData?['selfie_photo_url'] as String?;
    final identityVerified = userData?['identity_verified_at'] != null;
    final loading = pState.saving || pState.ktpUploading || pState.selfieUploading;

    return Scaffold(
      appBar: AppBar(title: Text('edit_profil'.tr())),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSizes.lg),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildCompletionBar(pState.completionPercent),
              SizedBox(height: AppSizes.lg),
              _buildAvatarSection(pState),
              SizedBox(height: AppSizes.lg),
              Text('nama'.tr(), style: AppTextStyles.titleMedium),
              SizedBox(height: AppSizes.sm),
              Row(
                children: [
                  Expanded(child: _buildField(
                    label: 'first_name'.tr(),
                    controller: _firstNameController,
                    onChanged: (_) => _syncFullName(),
                  )),
                  SizedBox(width: 8),
                  Expanded(child: _buildField(
                    label: 'mid_name'.tr(),
                    controller: _midNameController,
                    onChanged: (_) => _syncFullName(),
                  )),
                ],
              ),
              SizedBox(height: AppSizes.sm),
              Row(
                children: [
                  Expanded(child: _buildField(
                    label: 'last_name'.tr(),
                    controller: _lastNameController,
                    onChanged: (_) => _syncFullName(),
                  )),
                  SizedBox(width: 8),
                  Expanded(child: _buildField(
                    label: 'nama_lengkap'.tr(),
                    controller: _fullNameController,
                    readOnly: true,
                  )),
                ],
              ),
              SizedBox(height: AppSizes.md),
              _buildField(
                label: 'username'.tr(),
                controller: _usernameController,
                validator: Validators.required,
              ),
              SizedBox(height: AppSizes.md),
              _buildField(
                label: 'whatsapp'.tr(),
                controller: _whatsappController,
                keyboardType: TextInputType.phone,
                validator: Validators.phone,
              ),
              SizedBox(height: AppSizes.lg),
              Text('data_identitas'.tr(), style: AppTextStyles.titleMedium),
              SizedBox(height: AppSizes.sm),
              _buildField(
                label: 'NIK',
                controller: _nikController,
                keyboardType: TextInputType.number,
                validator: (v) {
                  if (v != null && v.isNotEmpty && v.length != 16) return 'NIK harus 16 digit';
                  return null;
                },
              ),
              SizedBox(height: AppSizes.md),
              _buildPhotoCard(
                label: 'foto_ktp'.tr(),
                file: _ktpFile,
                existingUrl: ktpUrl,
                uploading: pState.ktpUploading,
                onPick: () => _pickImage((f) => setState(() => _ktpFile = f)),
              ),
              SizedBox(height: AppSizes.md),
              _buildPhotoCard(
                label: 'selfie_verifikasi'.tr(),
                file: _selfieFile,
                existingUrl: selfieUrl,
                uploading: pState.selfieUploading,
                verified: identityVerified,
                onPick: _pickSelfie,
                hintText: 'ambil_selfie_depan'.tr(),
              ),
              SizedBox(height: AppSizes.xl),
              AppButton(
                label: _editing ? 'simpan'.tr() : 'edit'.tr(),
                loading: loading,
                onPressed: _toggleEdit,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildField({
    required String label,
    required TextEditingController controller,
    bool readOnly = false,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
    ValueChanged<String>? onChanged,
  }) {
    if (!_editing && !readOnly) {
      return Opacity(
        opacity: 0.6,
        child: AbsorbPointer(
          child: AppTextField(
            label: label,
            controller: controller,
            keyboardType: keyboardType,
            validator: validator,
            onChanged: onChanged,
          ),
        ),
      );
    }
    return AppTextField(
      label: label,
      controller: controller,
      keyboardType: keyboardType,
      validator: readOnly ? null : validator,
      onChanged: readOnly ? null : onChanged,
    );
  }

  Widget _buildCompletionBar(int percent) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('kelengkapan_profil'.tr(), style: AppTextStyles.titleSmall),
            Text('$percent%', style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.primaryColor, fontWeight: FontWeight.w600,
            )),
          ],
        ),
        SizedBox(height: AppSizes.sm),
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: LinearProgressIndicator(
            value: percent / 100,
            minHeight: 10,
            backgroundColor: AppColors.secondaryColor.withAlpha(50),
            valueColor: AlwaysStoppedAnimation<Color>(
              percent >= 80 ? Colors.green : (percent >= 50 ? Colors.orange : AppColors.primaryColor),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildAvatarSection(ProfileState pState) {
    return Center(
      child: GestureDetector(
        onTap: _editing ? () => _pickImage((f) => setState(() => _avatarFile = f)) : null,
        child: Stack(
          children: [
            CircleAvatar(
              radius: 48,
              backgroundColor: AppColors.secondaryColor,
              backgroundImage: _avatarFile != null
                  ? FileImage(_avatarFile!)
                  : (pState.userData?['avatar_url'] != null
                      ? CachedNetworkImageProvider(pState.userData!['avatar_url'] as String)
                      : null),
              child: pState.userData?['avatar_url'] == null && _avatarFile == null
                  ? Icon(Icons.camera_alt, size: 28, color: AppColors.primaryColor)
                  : null,
            ),
            if (_editing)
              Positioned(
                bottom: 0, right: 0,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(
                    color: AppColors.primaryColor,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.camera_alt, size: 16, color: Colors.white),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildPhotoCard({
    required String label,
    File? file,
    String? existingUrl,
    bool uploading = false,
    bool verified = false,
    required VoidCallback onPick,
    String? hintText,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.secondaryColor.withAlpha(80)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: SizedBox(
              width: 64,
              height: 64,
              child: file != null
                  ? Image.file(file, fit: BoxFit.cover)
                  : (existingUrl != null
                      ? CachedNetworkImage(imageUrl: existingUrl, fit: BoxFit.cover)
                      : Container(color: AppColors.secondaryColor.withAlpha(40), child: const Icon(Icons.image, color: Colors.grey))),
            ),
          ),
          SizedBox(width: AppSizes.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: AppTextStyles.bodyMedium),
                if (verified) ...[
                  SizedBox(height: 2),
                  Row(
                    children: [
                      Icon(Icons.verified, size: 14, color: Colors.green),
                      SizedBox(width: 4),
                      Text('terverifikasi'.tr(), style: AppTextStyles.bodySmall.copyWith(color: Colors.green)),
                    ],
                  ),
                ],
              ],
            ),
          ),
          if (uploading)
            const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
          else if (_editing)
            IconButton(
              icon: const Icon(Icons.camera_alt),
              onPressed: onPick,
            ),
        ],
      ),
    );
  }
}
