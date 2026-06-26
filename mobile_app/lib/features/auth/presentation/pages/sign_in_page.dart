import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/constants/app_sizes.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../../core/utils/validators.dart';
import '../providers/auth_provider.dart';
import '../providers/biometric_provider.dart';
import '../widgets/auth_header.dart';
import '../widgets/auth_modals.dart';
import '../widgets/social_login_button.dart';

class SignInPage extends ConsumerStatefulWidget {
  const SignInPage({super.key});

  @override
  ConsumerState<SignInPage> createState() => _SignInPageState();
}

class _SignInPageState extends ConsumerState<SignInPage> {
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
      AppSnackBar.show(context, 'setujui_syarat_dulu'.tr(), type: SnackBarType.warning);
      return;
    }
    if (!_rememberMe) {
      AppSnackBar.show(context, 'centang_ingat_saya'.tr(), type: SnackBarType.warning);
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
    final authenticated = await service.authenticate(reason: 'biometric_login'.tr());
    setState(() => _biometricLoading = false);
    if (authenticated && mounted) {
      _emailController.text = creds.email;
      _passwordController.text = creds.password;
      setState(() { _agreeTerms = true; _rememberMe = true; });
      _onLogin();
    } else if (mounted) {
      AppSnackBar.show(context, 'biometric_failed'.tr(), type: SnackBarType.error);
    }
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
        AppSnackBar.show(context, 'login_berhasil'.tr(), type: SnackBarType.success);
        context.go('/home');
      } else if (state is AuthError) {
        AppSnackBar.show(context, state.message, type: SnackBarType.error);
      }
    });

    final isLoading = authState is AuthLoading;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSizes.lg),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: AppSizes.lg),
                AuthHeader(title: 'selamat_datang'.tr(), subtitle: 'masuk_ke_akun'.tr()),
                const SizedBox(height: AppSizes.xl),
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
                      onPressed: () => showForgotPasswordSheet(context),
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
                // Checkbox 1: Setuju Syarat & Ketentuan
                Row(
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
                ),
                const SizedBox(height: AppSizes.sm),
                // Checkbox 2: Ingat Saya
                Row(
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
                ),
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
                      onTap: () => showSignUpSheet(context),
                      child: Text('sign_up'.tr(), style: AppTextStyles.bodyMedium.copyWith(color: AppColors.primaryColor, fontWeight: FontWeight.w600)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
