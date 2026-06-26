import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

final bottomNavIndexProvider = StateProvider<int>((ref) => 0);

class MainShell extends ConsumerWidget {
  final StatefulNavigationShell navigationShell;
  const MainShell({super.key, required this.navigationShell});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentIndex = ref.watch(bottomNavIndexProvider);
    final authState = ref.watch(authProvider);
    final avatarUrl = authState is AuthAuthenticated
        ? (authState.user.avatarUrl ?? authState.user.avatar)
        : null;
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: _ModernBottomBar(
        currentIndex: currentIndex,
        avatarUrl: avatarUrl,
        onTap: (index) {
          ref.read(bottomNavIndexProvider.notifier).state = index;
          navigationShell.goBranch(index);
        },
      ),
    );
  }
}

class _ModernBottomBar extends StatelessWidget {
  final int currentIndex;
  final String? avatarUrl;
  final ValueChanged<int> onTap;

  const _ModernBottomBar({required this.currentIndex, this.avatarUrl, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final items = [
      _BarItem(Icons.home_outlined, Icons.home, 'home'.tr()),
      _BarItem(Icons.receipt_long_outlined, Icons.receipt_long, 'orders'.tr()),
      _BarItem(Icons.chat_bubble_outline_rounded, Icons.chat_bubble_rounded, 'chat'.tr()),
      _BarItem(Icons.shopping_cart_outlined, Icons.shopping_cart, 'cart'.tr()),
      _BarItem(Icons.person_outline_rounded, Icons.person_rounded, 'profile'.tr()),
    ];

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(16),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(8, 6, 8, 6),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(items.length, (i) {
              final item = items[i];
              final isSelected = i == currentIndex;
              final isCenter = i == 2;
              final isProfile = i == 4;

              if (isCenter) {
                return _buildCenterButton(item, isSelected, () => onTap(i));
              }
              return _buildTab(item, isSelected, isProfile, () => onTap(i));
            }),
          ),
        ),
      ),
    );
  }

  Widget _buildTab(_BarItem item, bool isSelected, bool isProfile, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.secondaryColor.withAlpha(90) : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 250),
              transitionBuilder: (child, anim) => ScaleTransition(scale: anim, child: child),
              child: isProfile && avatarUrl != null
                  ? CircleAvatar(
                      key: ValueKey('avatar_$isSelected'),
                      radius: 13,
                      backgroundImage: CachedNetworkImageProvider(avatarUrl!),
                    )
                  : Icon(
                      isSelected ? item.activeIcon : item.icon,
                      key: ValueKey(isSelected),
                      size: 24,
                      color: isSelected ? AppColors.primaryColor : AppColors.textSecondary,
                    ),
            ),
            const SizedBox(height: 2),
            AnimatedDefaultTextStyle(
              duration: const Duration(milliseconds: 250),
              style: TextStyle(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                color: isSelected ? AppColors.primaryColor : AppColors.textSecondary,
              ),
              child: Text(item.label),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCenterButton(_BarItem item, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOutBack,
        width: 54,
        height: 54,
        decoration: BoxDecoration(
          gradient: isSelected ? AppColors.primaryGradient : LinearGradient(
            colors: [AppColors.primaryColor.withAlpha(204), AppColors.secondaryColor],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: AppColors.primaryColor.withAlpha(isSelected ? 102 : 64),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Icon(
          isSelected ? item.activeIcon : item.icon,
          color: Colors.white,
          size: 26,
        ),
      ),
    );
  }
}

class _BarItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  _BarItem(this.icon, this.activeIcon, this.label);
}
