import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../constants/app_colors.dart';

class AppEmptyAnimation extends StatelessWidget {
  final String title;
  final String? subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;
  final IconData icon;

  const AppEmptyAnimation({
    super.key,
    required this.title,
    this.subtitle,
    this.actionLabel,
    this.onAction,
    this.icon = Icons.inbox_outlined,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.primaryLight.withAlpha(77),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 56, color: AppColors.primaryColor.withAlpha(179)),
            ).animate().scale(duration: 600.ms, curve: Curves.easeOutBack).fadeIn(),
            const SizedBox(height: 20),
            Text(title,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Color(0xFF1A1A2E)),
              textAlign: TextAlign.center,
            ).animate().fadeIn(duration: 400.ms, delay: 200.ms).slideY(begin: 0.2, end: 0),
            if (subtitle != null) ...[
              const SizedBox(height: 8),
              Text(subtitle!,
                style: const TextStyle(fontSize: 14, color: Color(0xFF8E8E9A)),
                textAlign: TextAlign.center,
              ).animate().fadeIn(duration: 400.ms, delay: 300.ms),
            ],
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 24),
              FilledButton(
                onPressed: onAction,
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.primaryColor,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                ),
                child: Text(actionLabel!),
              ).animate().fadeIn(duration: 400.ms, delay: 400.ms).slideY(begin: 0.3, end: 0),
            ],
          ],
        ),
      ),
    );
  }
}

class AppLoadingAnimation extends StatelessWidget {
  final double size;
  final String? message;

  const AppLoadingAnimation({super.key, this.size = 48, this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: size,
            height: size,
            child: CircularProgressIndicator(
              strokeWidth: 3,
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryColor),
            ),
          ).animate(onPlay: (controller) => controller.repeat()).shimmer(duration: 1200.ms, color: AppColors.primaryLight),
          if (message != null) ...[
            const SizedBox(height: 16),
            Text(message!,
              style: const TextStyle(fontSize: 14, color: Color(0xFF8E8E9A)),
            ).animate().fadeIn().shake(),
          ],
        ],
      ),
    );
  }
}

class AppSuccessAnimation extends StatelessWidget {
  final String title;
  final String? subtitle;

  const AppSuccessAnimation({
    super.key,
    required this.title,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.successColor.withAlpha(26),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle_rounded, size: 64, color: AppColors.successColor),
            ).animate().scale(duration: 800.ms, curve: Curves.easeOutBack).then().shake(duration: 400.ms),
            const SizedBox(height: 20),
            Text(title,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Color(0xFF1A1A2E)),
              textAlign: TextAlign.center,
            ).animate().fadeIn(duration: 400.ms, delay: 300.ms).slideY(begin: 0.2, end: 0),
            if (subtitle != null) ...[
              const SizedBox(height: 8),
              Text(subtitle!,
                style: const TextStyle(fontSize: 14, color: Color(0xFF8E8E9A)),
                textAlign: TextAlign.center,
              ).animate().fadeIn(duration: 400.ms, delay: 400.ms),
            ],
          ],
        ),
      ),
    );
  }
}

class AppHeartAnimation extends StatefulWidget {
  final double size;
  const AppHeartAnimation({super.key, this.size = 80});

  @override
  State<AppHeartAnimation> createState() => _AppHeartAnimationState();
}

class _AppHeartAnimationState extends State<AppHeartAnimation> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _pulse;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200));
    _pulse = Tween<double>(begin: 1.0, end: 1.15).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
    _controller.repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _pulse,
      builder: (context, child) => Transform.scale(
        scale: _pulse.value,
        child: child,
      ),
      child: Icon(Icons.favorite_rounded, size: widget.size, color: AppColors.primaryColor),
    );
  }
}
