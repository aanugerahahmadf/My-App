import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import '../../../../core/api/api_endpoints.dart';
import '../../../../core/api/dio_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/constants/app_sizes.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_snackbar.dart';
import 'package:easy_localization/easy_localization.dart';

class OtpEmailVerificationPage extends StatefulWidget {
  final String? email;

  const OtpEmailVerificationPage({super.key, this.email});

  @override
  State<OtpEmailVerificationPage> createState() => _OtpEmailVerificationPageState();
}

class _OtpEmailVerificationPageState extends State<OtpEmailVerificationPage> {
  final _otpControllers = List.generate(6, (_) => TextEditingController());
  final _otpFocusNodes = List.generate(6, (_) => FocusNode());
  int _resendSeconds = 60;
  Timer? _resendTimer;
  bool _verifying = false;
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    _startResendTimer();
  }

  @override
  void dispose() {
    for (final c in _otpControllers) {
      c.dispose();
    }
    for (final f in _otpFocusNodes) {
      f.dispose();
    }
    _resendTimer?.cancel();
    super.dispose();
  }

  void _startResendTimer() {
    _resendSeconds = 60;
    _resendTimer?.cancel();
    _resendTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_resendSeconds == 0) {
        timer.cancel();
      }
      setState(() => _resendSeconds--);
    });
  }

  void _onOtpChanged(int index, String value) {
    if (value.isNotEmpty && index < 5) {
      _otpFocusNodes[index + 1].requestFocus();
    }
  }

  Future<void> _onVerify() async {
    final otp = _otpControllers.map((c) => c.text).join();
    if (otp.length < 6) {
      AppSnackBar.show(context, 'masukkan_6_digit'.tr(), type: SnackBarType.error);
      return;
    }

    setState(() => _verifying = true);

    try {
      await DioClient.instance.post(
        ApiEndpoints.verifyOtp,
        data: {
          'email': widget.email,
          'otp': otp,
        },
      );

      if (mounted) {
        AppSnackBar.show(context, 'email_berhasil_diverifikasi'.tr(), type: SnackBarType.success);
        context.go('/sign-in');
      }
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] as String? ?? 'gagal_memverifikasi_otp'.tr();
      if (mounted) {
        AppSnackBar.show(context, msg, type: SnackBarType.error);
      }
    } finally {
      if (mounted) setState(() => _verifying = false);
    }
  }

  Future<void> _onResend() async {
    if (_resendSeconds > 0 || _sending) return;

    setState(() => _sending = true);

    try {
      await DioClient.instance.post(
        ApiEndpoints.sendOtp,
        data: {'email': widget.email},
      );

      if (mounted) {
        AppSnackBar.show(context, 'otp_dikirim_ulang'.tr(), type: SnackBarType.success);
        _startResendTimer();
      }
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] as String? ?? 'gagal_mengirim_ulang_otp'.tr();
      if (mounted) {
        AppSnackBar.show(context, msg, type: SnackBarType.error);
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => context.pop(),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(AppSizes.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('verifikasi_email'.tr(), style: AppTextStyles.headlineMedium),
            SizedBox(height: AppSizes.xs),
            Text(
              widget.email != null
                  ? 'masukkan_kode_otp'.tr(namedArgs: {'email': widget.email!})
                  : 'masukkan_kode_otp_umum'.tr(),
              style: AppTextStyles.bodyLarge.copyWith(color: AppColors.textSecondary),
            ),
            SizedBox(height: AppSizes.xl),
            Form(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: List.generate(6, (i) {
                  return SizedBox(
                    width: 48,
                    height: 56,
                    child: TextFormField(
                      controller: _otpControllers[i],
                      focusNode: _otpFocusNodes[i],
                      textAlign: TextAlign.center,
                      keyboardType: TextInputType.number,
                      maxLength: 1,
                      style: AppTextStyles.titleLarge,
                      decoration: InputDecoration(
                        counterText: '',
                        filled: true,
                        fillColor: AppColors.backgroundColor,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: AppColors.secondaryColor),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: AppColors.primaryColor, width: 2),
                        ),
                      ),
                      onChanged: (v) => _onOtpChanged(i, v),
                    ),
                  );
                }),
              ),
            ),
            SizedBox(height: AppSizes.xl),
            AppButton(
              label: 'verifikasi'.tr(),
              loading: _verifying,
              onPressed: _onVerify,
            ),
            SizedBox(height: AppSizes.md),
            Center(
              child: TextButton(
                onPressed: _resendSeconds > 0 || _sending ? null : _onResend,
                child: Text(
                  _sending
                      ? 'mengirim'.tr()
                      : _resendSeconds > 0
                          ? '${'kirim_ulang'.tr()} ($_resendSeconds)'
                          : 'kirim_ulang'.tr(),
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: _resendSeconds > 0 ? AppColors.textSecondary : AppColors.primaryColor,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
