import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_sizes.dart';
import '../../../auth/presentation/widgets/auth_modals.dart';

class LandingPage extends StatelessWidget {
  const LandingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          Image.asset('assets/images/article/article-4.png', fit: BoxFit.cover),
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.transparent,
                  Color(0x800F1B33),
                  Color(0xCC080E1E),
                ],
              ),
            ),
          ),
          Positioned(top: -100, right: -50, child: _blob(300, AppColors.primaryColor.withValues(alpha: 0.15))),
          Positioned(bottom: 80, left: -80, child: _blob(240, AppColors.secondaryColor.withValues(alpha: 0.12))),
          Positioned(top: 240, left: -40, child: _blob(140, AppColors.accentColor.withValues(alpha: 0.08))),
          Positioned(bottom: 340, right: -30, child: _blob(120, AppColors.infoColor.withValues(alpha: 0.06))),
          SafeArea(
            child: Column(
              children: [
                const Spacer(flex: 1),
                _buildButtons(context),
                const SizedBox(height: AppSizes.xxl),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _blob(double size, Color color) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
      ),
    );
  }

  Widget _buildButtons(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSizes.lg),
      child: Column(
        children: [
          Container(
            width: double.infinity,
            height: 56,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(18),
              gradient: const LinearGradient(
                colors: [Color(0xFF0F1B33), Color(0xFF1E3050)],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x400F1B33),
                  blurRadius: 24,
                  offset: Offset(0, 8),
                ),
              ],
            ),
            child: ElevatedButton(
              onPressed: () => showSignInSheet(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'sign_in'.tr(),
                    style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, letterSpacing: 0.5, color: Colors.white),
                  ),
                  const SizedBox(width: 8),
                  const Icon(Icons.arrow_forward_rounded, size: 20, color: Colors.white),
                ],
              ),
            ),
          ).animate().fadeIn(duration: 500.ms, delay: 200.ms).slideY(begin: 0.2, duration: 500.ms),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 56,
            child: OutlinedButton(
              onPressed: () => showSignUpSheet(context),
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.white,
                side: BorderSide(color: Colors.white.withValues(alpha: 0.30), width: 1.2),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                backgroundColor: Colors.white.withValues(alpha: 0.06),
              ),
              child: Text(
                'sign_up'.tr(),
                style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600, letterSpacing: 0.5),
              ),
            ),
          ).animate().fadeIn(duration: 500.ms, delay: 300.ms).slideY(begin: 0.2, duration: 500.ms),
        ],
      ),
    );
  }
}
