import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_endpoints.dart';
import '../../../../core/api/dio_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_sizes.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_shimmer.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../legal/presentation/providers/legal_provider.dart';
import '../providers/auth_provider.dart';
import '../providers/biometric_provider.dart';
import 'auth_header.dart';
import 'social_login_button.dart';

enum AgreementMode { wizard, terms, privacy }

void showAgreementModal(BuildContext context, {AgreementMode mode = AgreementMode.wizard, VoidCallback? onAgreed}) {
  showDialog(
    context: context,
    useSafeArea: false,
    builder: (_) => _AgreementModal(mode: mode, onAgreed: onAgreed),
  );
}

class _AgreementModal extends StatefulWidget {
  final AgreementMode mode;
  final VoidCallback? onAgreed;
  const _AgreementModal({this.mode = AgreementMode.wizard, this.onAgreed});

  @override
  State<_AgreementModal> createState() => _AgreementModalState();
}

class _AgreementModalState extends State<_AgreementModal> {
  late int _step;

  @override
  void initState() {
    super.initState();
    _step = widget.mode == AgreementMode.wizard ? 1 : (widget.mode == AgreementMode.terms ? 1 : 2);
  }

  void _close() => Navigator.of(context).pop();

  @override
  Widget build(BuildContext context) {
    final isWizard = widget.mode == AgreementMode.wizard;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      insetPadding: const EdgeInsets.all(AppSizes.md),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: SizedBox(
          height: MediaQuery.of(context).size.height * 0.75,
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: AppSizes.md, vertical: AppSizes.md),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border(bottom: BorderSide(color: AppColors.dividerColor)),
                ),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: _close,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                    const SizedBox(width: AppSizes.sm),
                    Expanded(
                      child: Text(
                        _step == 1 ? 'ketentuan_layanan'.tr() : 'kebijakan_privasi'.tr(),
                        style: AppTextStyles.titleMedium,
                        textAlign: TextAlign.center,
                      ),
                    ),
                    if (isWizard)
                      Text(
                        _step == 1 ? 'langkah_1_dari_2'.tr() : 'langkah_2_dari_2'.tr(),
                        style: AppTextStyles.labelSmall,
                      )
                    else
                      const SizedBox(width: 40),
                  ],
                ),
              ),
              Expanded(
                child: _step == 1
                    ? _LegalContentView(
                        provider: termsOfServiceProvider,
                        isWizard: isWizard,
                        onNext: isWizard ? () => setState(() => _step = 2) : null,
                        onClose: !isWizard ? _close : null,
                      )
                    : _LegalContentView(
                        provider: privacyPolicyProvider,
                        isWizard: isWizard,
                        onNext: null,
                        onAgreed: isWizard
                            ? () {
                                widget.onAgreed?.call();
                                _close();
                              }
                            : null,
                        onClose: !isWizard ? _close : null,
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LegalContentView extends ConsumerWidget {
  final dynamic provider;
  final bool isWizard;
  final VoidCallback? onNext;
  final VoidCallback? onAgreed;
  final VoidCallback? onClose;

  const _LegalContentView({
    required this.provider,
    this.isWizard = false,
    this.onNext,
    this.onAgreed,
    this.onClose,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(provider);

    return async.when(
      loading: () => const Center(child: AppShimmer(width: 200, height: 16)),
      error: (err, _) => Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSizes.md),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, size: 48, color: AppColors.textSecondary),
              const SizedBox(height: 12),
              Text('gagal_memuat_halaman'.tr(),
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 14, color: AppColors.textSecondary)),
              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: () => ref.invalidate(provider),
                icon: const Icon(Icons.refresh, size: 18),
                label: Text('coba_lagi'.tr()),
              ),
            ],
          ),
        ),
      ),
      data: (content) => Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppSizes.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(content.title,
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  if (content.updatedAt != null) ...[
                    const SizedBox(height: 8),
                    Text('${'terakhir_diperbarui'.tr()}: ${content.updatedAt}',
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  ],
                  const SizedBox(height: 16),
                  Text(
                    content.content is String
                        ? content.content as String
                        : (content.content?['text'] as String? ?? ''),
                    style: const TextStyle(fontSize: 14, height: 1.6),
                  ),
                ],
              ),
            ),
          ),
          if (onNext != null || onAgreed != null || onClose != null)
            Container(
              padding: const EdgeInsets.all(AppSizes.md),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: AppColors.dividerColor)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  if (onNext != null)
                    AppButton(
                      label: 'lanjutkan'.tr(),
                      onPressed: onNext,
                      type: ButtonType.primary,
                      width: 140,
                    ),
                  if (onAgreed != null)
                    AppButton(
                      label: 'saya_mengerti_setuju'.tr(),
                      onPressed: onAgreed,
                      type: ButtonType.primary,
                      width: 200,
                    ),
                  if (onClose != null)
                    AppButton(
                      label: 'tutup'.tr(),
                      onPressed: onClose,
                      type: ButtonType.outline,
                      width: 120,
                    ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

Future<void> showSignInSheet(BuildContext context) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    backgroundColor: Colors.transparent,
    builder: (_) => const _AuthSheetWrapper(child: _SignInSheetContent()),
  );
}

Future<void> showSignUpSheet(BuildContext context) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    backgroundColor: Colors.transparent,
    builder: (_) => const _AuthSheetWrapper(child: _SignUpSheetContent()),
  );
}

Future<void> showForgotPasswordSheet(BuildContext context) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    backgroundColor: Colors.transparent,
    builder: (_) => const _AuthSheetWrapper(child: _ForgotPasswordSheetContent()),
  );
}

class _AuthSheetWrapper extends StatelessWidget {
  final Widget child;
  const _AuthSheetWrapper({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 8),
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.textTertiary.withValues(alpha: 0.4),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Flexible(child: child),
        ],
      ),
    );
  }
}

class _SignInSheetContent extends ConsumerStatefulWidget {
  const _SignInSheetContent();

  @override
  ConsumerState<_SignInSheetContent> createState() => _SignInSheetContentState();
}

class _SignInSheetContentState extends ConsumerState<_SignInSheetContent> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _agreeTerms = false;
  bool _rememberMe = false;
  bool _biometricAvailable = false;
  bool _hasSavedCredentials = false;
  bool _biometricLoading = false;

  @override
  void initState() {
    super.initState();
    _checkBiometric();
  }

  Future<void> _checkBiometric() async {
    final service = ref.read(biometricServiceProvider);
    final available = await service.isAvailable();
    final saved = await service.hasSavedCredentials();
    if (mounted) {
      setState(() {
        _biometricAvailable = available;
        _hasSavedCredentials = saved;
      });
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _onLogin() {
    if (!_formKey.currentState!.validate()) return;
    if (!_agreeTerms) {
      _showWarning('setujui_syarat_dulu'.tr());
      return;
    }
    if (!_rememberMe) {
      _showWarning('centang_ingat_saya'.tr());
      return;
    }
    ref.read(authProvider.notifier).login(
      email: _emailController.text.trim(),
      password: _passwordController.text,
    );
  }

  Future<void> _onBiometricLogin() async {
    final service = ref.read(biometricServiceProvider);
    final creds = await service.getCredentials();
    if (creds == null) return;

    setState(() => _biometricLoading = true);
    final authenticated = await service.authenticate(
      reason: 'biometric_login'.tr(),
    );
    setState(() => _biometricLoading = false);

    if (authenticated && mounted) {
      _emailController.text = creds.email;
      _passwordController.text = creds.password;
      setState(() {
        _agreeTerms = true;
        _rememberMe = true;
      });
      _onLogin();
    } else if (mounted) {
      _showWarning('biometric_failed'.tr());
    }
  }

  void _showWarning(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: AppColors.warningColor),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    ref.listen<AuthState>(authProvider, (_, state) {
      if (state is AuthAuthenticated) {
        if (_rememberMe && _biometricAvailable) {
          ref.read(biometricServiceProvider).saveCredentials(
            _emailController.text.trim(),
            _passwordController.text,
          );
        }
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('login_berhasil'.tr()), backgroundColor: AppColors.successColor),
        );
        context.go('/home');
      } else if (state is AuthError) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(state.message), backgroundColor: AppColors.errorColor),
        );
      }
    });

    final isLoading = authState is AuthLoading;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(AppSizes.lg, AppSizes.sm, AppSizes.lg, AppSizes.lg),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AuthHeader(title: 'selamat_datang'.tr(), subtitle: 'masuk_ke_akun'.tr()),
            const SizedBox(height: AppSizes.lg),
            AppTextField(
              label: 'email'.tr(),
              hint: 'masukkan_email'.tr(),
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              validator: Validators.email,
              prefixIcon: const Icon(Icons.email_outlined),
            ),
            const SizedBox(height: AppSizes.md),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text('password'.tr(), style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
                TextButton(
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  onPressed: () {
                    Navigator.of(context).pop();
                    showForgotPasswordSheet(context);
                  },
                  child: Text('lupa_password'.tr(), style: AppTextStyles.bodyMedium.copyWith(color: AppColors.primaryColor)),
                ),
              ],
            ),
            const SizedBox(height: 4),
            AppTextField(
              hint: 'masukkan_password'.tr(),
              controller: _passwordController,
              obscureText: _obscurePassword,
              validator: Validators.password,
              prefixIcon: const Icon(Icons.lock_outlined),
              suffixIcon: IconButton(
                icon: Icon(_obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined),
                onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
              ),
            ),
            const SizedBox(height: AppSizes.md),
            _agreementCheckbox(),
            const SizedBox(height: AppSizes.sm),
            _rememberCheckbox(),
            const SizedBox(height: AppSizes.md),
            AppButton(
              label: 'sign_in'.tr(),
              loading: isLoading,
              disabled: !_agreeTerms || !_rememberMe,
              onPressed: _onLogin,
              type: ButtonType.primaryGradient,
            ),
            const SizedBox(height: AppSizes.lg),
            Row(
              children: [
                const Expanded(child: Divider()),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSizes.md),
                  child: Text('atau'.tr(), style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
                ),
                const Expanded(child: Divider()),
              ],
            ),
            const SizedBox(height: AppSizes.md),
            SocialLoginButton(provider: SocialProvider.google, enabled: _agreeTerms && _rememberMe, onPressed: () {}),
            SocialLoginButton(provider: SocialProvider.facebook, enabled: _agreeTerms && _rememberMe, onPressed: () {}),
            if (_hasSavedCredentials && _biometricAvailable) ...[
              const SizedBox(height: AppSizes.sm),
              AppButton(
                label: 'biometric_login'.tr(),
                loading: _biometricLoading,
                onPressed: _onBiometricLogin,
                type: ButtonType.outline,
                icon: Icons.fingerprint,
              ),
            ],
            const SizedBox(height: AppSizes.lg),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('belum_punya_akun'.tr(), style: AppTextStyles.bodyMedium),
                GestureDetector(
                  onTap: () {
                    Navigator.of(context).pop();
                    showSignUpSheet(context);
                  },
                  child: Text('sign_up'.tr(), style: AppTextStyles.bodyMedium.copyWith(color: AppColors.primaryColor, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _agreementCheckbox() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        SizedBox(
          width: 24,
          height: 24,
          child: Checkbox(
            value: _agreeTerms,
            onChanged: (v) {
              if (v == true) {
                showAgreementModal(context, mode: AgreementMode.wizard, onAgreed: () {
                  setState(() => _agreeTerms = true);
                });
              } else {
                setState(() => _agreeTerms = false);
              }
            },
            activeColor: AppColors.primaryColor,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: GestureDetector(
            onTap: () {
              if (!_agreeTerms) {
                showAgreementModal(context, mode: AgreementMode.wizard, onAgreed: () {
                  setState(() => _agreeTerms = true);
                });
              } else {
                setState(() => _agreeTerms = false);
              }
            },
            child: RichText(
              text: TextSpan(
                style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                children: [
                  TextSpan(text: '${'saya_menyetujui'.tr()} '),
                  WidgetSpan(
                    child: GestureDetector(
                      onTap: () => showAgreementModal(context, mode: AgreementMode.terms),
                      child: Text(
                        'syarat_ketentuan'.tr(),
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.primaryColor,
                          fontWeight: FontWeight.w600,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ),
                  const TextSpan(text: ' & '),
                  WidgetSpan(
                    child: GestureDetector(
                      onTap: () => showAgreementModal(context, mode: AgreementMode.privacy),
                      child: Text(
                        'kebijakan_privasi'.tr(),
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.primaryColor,
                          fontWeight: FontWeight.w600,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _rememberCheckbox() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        SizedBox(
          width: 24,
          height: 24,
          child: Checkbox(
            value: _rememberMe,
            onChanged: (v) => setState(() => _rememberMe = v ?? false),
            activeColor: AppColors.primaryColor,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: GestureDetector(
            onTap: () => setState(() => _rememberMe = !_rememberMe),
            child: Text(
              'ingat_saya'.tr(),
              style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
            ),
          ),
        ),
      ],
    );
  }
}

class _SignUpSheetContent extends ConsumerStatefulWidget {
  const _SignUpSheetContent();

  @override
  ConsumerState<_SignUpSheetContent> createState() => _SignUpSheetContentState();
}

class _SignUpSheetContentState extends ConsumerState<_SignUpSheetContent> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _whatsappController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _agreeTerms = false;
  bool _rememberMe = false;
  File? _avatarFile;

  @override
  void dispose() {
    _fullNameController.dispose();
    _usernameController.dispose();
    _emailController.dispose();
    _whatsappController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery, maxWidth: 512, maxHeight: 512);
    if (picked != null) {
      setState(() => _avatarFile = File(picked.path));
    }
  }

  void _onRegister() {
    if (!_formKey.currentState!.validate()) return;
    if (!_agreeTerms) {
      _showWarning('setujui_syarat_dulu'.tr());
      return;
    }
    if (!_rememberMe) {
      _showWarning('centang_ingat_saya'.tr());
      return;
    }
    ref.read(authProvider.notifier).register(
      fullName: _fullNameController.text.trim(),
      username: _usernameController.text.trim(),
      email: _emailController.text.trim(),
      whatsapp: _whatsappController.text.trim(),
      password: _passwordController.text,
      passwordConfirmation: _confirmPasswordController.text,
    );
  }

  void _showWarning(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: AppColors.warningColor),
    );
  }

  Widget _buildPasswordStrength(String password) {
    final checks = [
      password.length >= 8,
      password.contains(RegExp(r'[A-Z]')),
      password.contains(RegExp(r'[a-z]')),
      password.contains(RegExp(r'[0-9]')),
      password.contains(RegExp(r'[!@#\$%^&*(),.?":{}|<>]')),
    ];
    final score = checks.where((c) => c).length;
    final (label, color, value) = switch (score) {
      0 || 1 => ('password_weak'.tr(), AppColors.errorColor, 0.2),
      2 || 3 => ('password_medium'.tr(), AppColors.warningColor, 0.5),
      _ => ('password_strong'.tr(), AppColors.successColor, 0.9),
    };
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: value,
            minHeight: 4,
            backgroundColor: AppColors.dividerColor,
            valueColor: AlwaysStoppedAnimation(color),
          ),
        ),
        const SizedBox(height: 4),
        Text(label, style: AppTextStyles.labelSmall.copyWith(color: color)),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    ref.listen<AuthState>(authProvider, (_, state) {
      if (state is AuthAuthenticated) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('registrasi_berhasil'.tr()), backgroundColor: AppColors.successColor),
        );
        context.go('/home');
      } else if (state is AuthError) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(state.message), backgroundColor: AppColors.errorColor),
        );
      }
    });

    final isLoading = authState is AuthLoading;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(AppSizes.lg, AppSizes.sm, AppSizes.lg, AppSizes.lg),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: AppSizes.sm),
            Center(child: Image.asset('assets/images/logo.png', width: 64, height: 64)),
            const SizedBox(height: AppSizes.sm),
            Center(child: Text('daftar_akun'.tr(), style: AppTextStyles.headlineMedium)),
            const SizedBox(height: AppSizes.xs),
            Center(child: Text('isi_data_diri'.tr(), style: AppTextStyles.bodyLarge.copyWith(color: AppColors.textSecondary))),
            const SizedBox(height: AppSizes.lg),
            Center(
              child: GestureDetector(
                onTap: _pickImage,
                child: Stack(
                  children: [
                    CircleAvatar(
                      radius: 48,
                      backgroundColor: AppColors.secondaryColor,
                      backgroundImage: _avatarFile != null ? FileImage(_avatarFile!) : null,
                      child: _avatarFile == null
                          ? Icon(Icons.camera_alt, size: 28, color: AppColors.primaryColor)
                          : null,
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: AppColors.primaryColor,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.camera_alt, size: 16, color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppSizes.lg),
            AppTextField(
              label: 'nama_lengkap'.tr(),
              hint: 'masukkan_nama_lengkap'.tr(),
              controller: _fullNameController,
              validator: Validators.required,
            ),
            const SizedBox(height: AppSizes.md),
            AppTextField(
              label: 'username'.tr(),
              hint: 'masukkan_username'.tr(),
              controller: _usernameController,
              validator: Validators.required,
            ),
            const SizedBox(height: AppSizes.md),
            AppTextField(
              label: 'email'.tr(),
              hint: 'masukkan_email'.tr(),
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              validator: Validators.email,
            ),
            const SizedBox(height: AppSizes.md),
            AppTextField(
              label: 'whatsapp'.tr(),
              hint: 'phone_hint'.tr(),
              controller: _whatsappController,
              keyboardType: TextInputType.phone,
              validator: Validators.phone,
            ),
            const SizedBox(height: AppSizes.md),
            AppTextField(
              label: 'password'.tr(),
              hint: 'minimal_6_karakter'.tr(),
              controller: _passwordController,
              obscureText: _obscurePassword,
              validator: Validators.password,
              onChanged: (_) => setState(() {}),
              suffixIcon: IconButton(
                icon: Icon(_obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined),
                onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
              ),
            ),
            if (_passwordController.text.isNotEmpty) ...[
              const SizedBox(height: 6),
              _buildPasswordStrength(_passwordController.text),
            ],
            const SizedBox(height: AppSizes.md),
            AppTextField(
              label: 'konfirmasi_password'.tr(),
              hint: 'ulangi_password'.tr(),
              controller: _confirmPasswordController,
              obscureText: _obscureConfirmPassword,
              validator: (v) => Validators.confirmPassword(v, _passwordController.text),
              suffixIcon: IconButton(
                icon: Icon(_obscureConfirmPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined),
                onPressed: () => setState(() => _obscureConfirmPassword = !_obscureConfirmPassword),
              ),
            ),
            const SizedBox(height: AppSizes.md),
            _agreementCheckbox(),
            const SizedBox(height: AppSizes.sm),
            _rememberCheckbox(),
            const SizedBox(height: AppSizes.lg),
            AppButton(
              label: 'daftar_sekarang'.tr(),
              loading: isLoading,
              disabled: !_agreeTerms || !_rememberMe,
              onPressed: _onRegister,
            ),
            const SizedBox(height: AppSizes.lg),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('sudah_punya_akun'.tr(), style: AppTextStyles.bodyMedium),
                GestureDetector(
                  onTap: () {
                    Navigator.of(context).pop();
                    showSignInSheet(context);
                  },
                  child: Text('sign_in'.tr(), style: AppTextStyles.bodyMedium.copyWith(color: AppColors.primaryColor, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
            const SizedBox(height: AppSizes.lg),
          ],
        ),
      ),
    );
  }

  Widget _agreementCheckbox() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        SizedBox(
          width: 24,
          height: 24,
          child: Checkbox(
            value: _agreeTerms,
            onChanged: (v) {
              if (v == true) {
                showAgreementModal(context, mode: AgreementMode.wizard, onAgreed: () {
                  setState(() => _agreeTerms = true);
                });
              } else {
                setState(() => _agreeTerms = false);
              }
            },
            activeColor: AppColors.primaryColor,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: GestureDetector(
            onTap: () {
              if (!_agreeTerms) {
                showAgreementModal(context, mode: AgreementMode.wizard, onAgreed: () {
                  setState(() => _agreeTerms = true);
                });
              } else {
                setState(() => _agreeTerms = false);
              }
            },
            child: RichText(
              text: TextSpan(
                style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                children: [
                  TextSpan(text: '${'saya_menyetujui'.tr()} '),
                  WidgetSpan(
                    child: GestureDetector(
                      onTap: () => showAgreementModal(context, mode: AgreementMode.terms),
                      child: Text(
                        'syarat_ketentuan'.tr(),
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.primaryColor,
                          fontWeight: FontWeight.w600,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ),
                  const TextSpan(text: ' & '),
                  WidgetSpan(
                    child: GestureDetector(
                      onTap: () => showAgreementModal(context, mode: AgreementMode.privacy),
                      child: Text(
                        'kebijakan_privasi'.tr(),
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.primaryColor,
                          fontWeight: FontWeight.w600,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _rememberCheckbox() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        SizedBox(
          width: 24,
          height: 24,
          child: Checkbox(
            value: _rememberMe,
            onChanged: (v) => setState(() => _rememberMe = v ?? false),
            activeColor: AppColors.primaryColor,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: GestureDetector(
            onTap: () => setState(() => _rememberMe = !_rememberMe),
            child: Text(
              'ingat_saya'.tr(),
              style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
            ),
          ),
        ),
      ],
    );
  }
}

class _ForgotPasswordSheetContent extends StatefulWidget {
  const _ForgotPasswordSheetContent();

  @override
  State<_ForgotPasswordSheetContent> createState() => _ForgotPasswordSheetContentState();
}

class _ForgotPasswordSheetContentState extends State<_ForgotPasswordSheetContent> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  void _onSendResetCode() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);

    try {
      await DioClient.instance.post(
        ApiEndpoints.forgotPassword,
        data: {'email': _emailController.text.trim()},
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('reset_dikirim'.tr()), backgroundColor: AppColors.successColor),
      );
      Navigator.of(context).pop();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('gagal_kirim_reset'.tr()), backgroundColor: AppColors.errorColor),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(AppSizes.lg, AppSizes.sm, AppSizes.lg, AppSizes.lg),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: AppSizes.sm),
            Text('lupa_password'.tr(), style: AppTextStyles.headlineMedium),
            const SizedBox(height: AppSizes.xs),
            Text(
              'masukkan_email_reset'.tr(),
              style: AppTextStyles.bodyLarge.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: AppSizes.xl),
            AppTextField(
              label: 'email'.tr(),
              hint: 'masukkan_email'.tr(),
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              validator: Validators.email,
            ),
            const SizedBox(height: AppSizes.xl),
            AppButton(
              label: 'kirim_kode_reset'.tr(),
              loading: _loading,
              onPressed: _onSendResetCode,
            ),
            const SizedBox(height: AppSizes.md),
          ],
        ),
      ),
    );
  }
}
