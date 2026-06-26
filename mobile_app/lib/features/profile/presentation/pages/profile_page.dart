import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:go_router/go_router.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/constants/app_sizes.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_shimmer.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../auth/presentation/widgets/auth_modals.dart';
import '../providers/profile_provider.dart';

class ProfilePage extends ConsumerStatefulWidget {
  const ProfilePage({super.key});

  @override
  ConsumerState<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends ConsumerState<ProfilePage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(profileProvider.notifier).fetchProfile());
  }

  Future<void> _logout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('sign_out'.tr()),
        content: Text('apakah_yakin_keluar'.tr()),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text('batal'.tr())),
          AppButton(
            label: 'sign_out'.tr(),
            onPressed: () => Navigator.pop(ctx, true),
            type: ButtonType.primary,
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await const FlutterSecureStorage().delete(key: 'auth_token');
      if (mounted) showSignInSheet(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(profileProvider);
    final userData = state.userData;
    final stats = (userData?['stats'] as Map<String, dynamic>?) ?? {};

    return Scaffold(
      body: state.loading
          ? ListView(
              padding: const EdgeInsets.all(AppSizes.md),
              children: [
                SizedBox(height: AppSizes.xxl),
                Center(child: AppShimmer(width: 96, height: 96, borderRadius: 48)),
                SizedBox(height: AppSizes.md),
                Center(child: AppShimmer(width: 160, height: 20)),
                SizedBox(height: AppSizes.sm),
                Center(child: AppShimmer(width: 120, height: 14)),
                SizedBox(height: AppSizes.lg),
                Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: List.generate(3, (_) => AppShimmer(width: 80, height: 40))),
                SizedBox(height: AppSizes.lg),
                ...List.generate(7, (_) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: AppShimmer(height: 56, borderRadius: 12),
                )),
              ],
            )
          : RefreshIndicator(
              onRefresh: () => ref.read(profileProvider.notifier).fetchProfile(),
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  Container(
                    padding: const EdgeInsets.fromLTRB(AppSizes.md, AppSizes.xxl, AppSizes.md, AppSizes.lg),
                    decoration: const BoxDecoration(
                      color: AppColors.primaryColor,
                      borderRadius: BorderRadius.vertical(bottom: Radius.circular(24)),
                    ),
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 48,
                          backgroundColor: Colors.white.withValues(alpha: 0.2),
                          backgroundImage: userData?['avatar_url'] != null
                              ? CachedNetworkImageProvider(userData!['avatar_url'] as String)
                              : null,
                          child: userData?['avatar_url'] == null
                              ? const Icon(Icons.person, size: 48, color: Colors.white)
                              : null,
                        ),
                        SizedBox(height: AppSizes.md),
                        Text(
                          userData?['full_name'] as String? ?? 'pengguna'.tr(),
                          style: AppTextStyles.titleLarge.copyWith(color: Colors.white),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '@${userData?['username'] as String? ?? ''}',
                          style: AppTextStyles.bodySmall.copyWith(color: Colors.white70),
                        ),
                        Text(
                          userData?['email'] as String? ?? '',
                          style: AppTextStyles.bodySmall.copyWith(color: Colors.white70),
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(AppSizes.md),
                    child: Card(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: AppSizes.md),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            _statItem('total_order'.tr(), '${stats['orders_count'] ?? 0}'),
                            GestureDetector(
                              onTap: () => context.push('/wishlist'),
                              child: _statItem('favorit'.tr(), '${stats['wishlist_count'] ?? 0}'),
                            ),
                            GestureDetector(
                              onTap: () => context.push('/my-reviews'),
                              child: _statItem('ulasan'.tr(), '${stats['reviews_count'] ?? 0}'),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  _buildProfileCompletion(ref),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: AppSizes.md),
                    child: Column(
                      children: [
                        _menuTile(Icons.edit, 'edit_profil'.tr(), () => context.push('/edit-profile')),
                        _menuTile(Icons.card_giftcard, 'voucher_saya'.tr(), () => context.push('/home')),
                        _menuTile(Icons.receipt_long, 'riwayat_pesanan'.tr(), () => context.push('/orders')),
                        _menuTile(Icons.privacy_tip, 'privasi_ketentuan'.tr(), () => AppSnackBar.show(context, 'fitur_segera_hadir'.tr(), type: SnackBarType.info)),
                        _menuTile(Icons.help, 'pusat_bantuan'.tr(), () => AppSnackBar.show(context, 'fitur_segera_hadir'.tr(), type: SnackBarType.info)),
                        _menuTile(Icons.logout, 'sign_out'.tr(), _logout, isDestructive: true),
                      ],
                    ),
                  ),
                  SizedBox(height: AppSizes.xl),
                ],
              ),
            ),
    );
  }

  Widget _buildProfileCompletion(WidgetRef ref) {
    final pState = ref.watch(profileProvider);
    final percent = pState.completionPercent;
    final items = pState.completionItems;

    if (items == null) {
      ref.read(profileProvider.notifier).fetchCompletion();
      return const SizedBox.shrink();
    }

    final missingFields = <String>[
      if (items['nik'] == false) 'NIK',
      if (items['ktp_photo'] == false) 'foto_ktp'.tr(),
      if (items['whatsapp'] == false) 'whatsapp'.tr(),
      if (items['avatar_url'] == false) 'foto_profil'.tr(),
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSizes.md),
      child: Card(
        margin: const EdgeInsets.only(bottom: AppSizes.md),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(AppSizes.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('kelengkapan_profil'.tr(), style: AppTextStyles.titleSmall),
                  Text('$percent%', style: AppTextStyles.bodyMedium.copyWith(
                    color: percent >= 80 ? Colors.green : (percent >= 50 ? Colors.orange : AppColors.primaryColor),
                    fontWeight: FontWeight.w600,
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
              if (missingFields.isNotEmpty) ...[
                SizedBox(height: AppSizes.sm),
                Text('lengkapi_data'.tr(), style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary)),
                SizedBox(height: 4),
                Wrap(
                  spacing: 6,
                  runSpacing: 4,
                  children: missingFields.map((f) => Chip(
                    label: Text(f, style: const TextStyle(fontSize: 11)),
                    visualDensity: VisualDensity.compact,
                    deleteIcon: const Icon(Icons.add, size: 14),
                    onDeleted: () => context.push('/edit-profile'),
                  )).toList(),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _statItem(String label, String value) {
    return Column(
      children: [
        Text(value, style: AppTextStyles.titleLarge.copyWith(color: AppColors.primaryColor, fontWeight: FontWeight.w600)),
        const SizedBox(height: 4),
        Text(label, style: AppTextStyles.bodySmall),
      ],
    );
  }

  Widget _menuTile(IconData icon, String label, VoidCallback onTap, {bool isDestructive = false}) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSizes.sm),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Icon(icon, color: isDestructive ? AppColors.errorColor : AppColors.primaryColor),
        title: Text(label, style: AppTextStyles.bodyMedium.copyWith(
          color: isDestructive ? AppColors.errorColor : AppColors.textPrimary,
        )),
        trailing: const Icon(Icons.chevron_right, color: AppColors.textSecondary),
        onTap: onTap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
