import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/constants/app_colors.dart';
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
  final _fullNameController = TextEditingController();
  final _usernameController = TextEditingController();
  final _whatsappController = TextEditingController();
  File? _avatarFile;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final userData = ref.read(profileProvider).userData;
      if (userData != null) {
        _fullNameController.text = userData['full_name'] as String? ?? '';
        _usernameController.text = userData['username'] as String? ?? '';
        _whatsappController.text = userData['whatsapp'] as String? ?? '';
      }
    });
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _usernameController.dispose();
    _whatsappController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery, maxWidth: 512, maxHeight: 512);
    if (picked != null) {
      setState(() => _avatarFile = File(picked.path));
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    final profileNotifier = ref.read(profileProvider.notifier);

    final data = <String, dynamic>{
      'full_name': _fullNameController.text.trim(),
      'username': _usernameController.text.trim(),
      'whatsapp': _whatsappController.text.trim(),
    };

    try {
      await profileNotifier.updateProfile(data);

      if (_avatarFile != null) {
        await profileNotifier.uploadAvatar(_avatarFile!.path);
      }

      if (mounted) {
        AppSnackBar.show(context, 'profil_berhasil_diperbarui'.tr(), type: SnackBarType.success);
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        AppSnackBar.show(context, 'gagal_update_profil'.tr(), type: SnackBarType.error);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(profileProvider);

    return Scaffold(
      appBar: AppBar(title: Text('edit_profil'.tr())),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSizes.lg),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              GestureDetector(
                onTap: _pickImage,
                child: Stack(
                  children: [
                    CircleAvatar(
                      radius: 48,
                      backgroundColor: AppColors.secondaryColor,
                      backgroundImage: _avatarFile != null
                          ? FileImage(_avatarFile!)
                          : (state.userData?['avatar_url'] != null
                              ? NetworkImage(state.userData!['avatar_url'] as String)
                              : null),
                      child: state.userData?['avatar_url'] == null && _avatarFile == null
                          ? Icon(Icons.camera_alt, size: 28, color: AppColors.primaryColor)
                          : null,
                    ),
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
              SizedBox(height: AppSizes.lg),
              AppTextField(
                label: 'nama_lengkap'.tr(),
                controller: _fullNameController,
                validator: Validators.required,
              ),
              SizedBox(height: AppSizes.md),
              AppTextField(
                label: 'username'.tr(),
                controller: _usernameController,
                validator: Validators.required,
              ),
              SizedBox(height: AppSizes.md),
              AppTextField(
                label: 'whatsapp'.tr(),
                controller: _whatsappController,
                keyboardType: TextInputType.phone,
                validator: Validators.phone,
              ),
              SizedBox(height: AppSizes.xl),
              AppButton(
                label: 'simpan'.tr(),
                loading: state.saving,
                onPressed: _save,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
