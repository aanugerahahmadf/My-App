import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_sizes.dart';
import '../../../../core/widgets/app_shimmer.dart';
import '../providers/legal_provider.dart';

class PrivacyPolicyPage extends ConsumerWidget {
  const PrivacyPolicyPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(privacyPolicyProvider);

    return Scaffold(
      appBar: AppBar(title: Text('kebijakan_privasi'.tr())),
      body: async.when(
        loading: () => const Center(child: AppShimmer(width: 200, height: 16)),
        error: (err, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(AppSizes.md),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline, size: 48, color: AppColors.textSecondary),
                const SizedBox(height: 12),
                Text('gagal_memuat_halaman'.tr(), textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: () => ref.invalidate(privacyPolicyProvider),
                  icon: const Icon(Icons.refresh, size: 18),
                  label: Text('coba_lagi'.tr()),
                ),
              ],
            ),
          ),
        ),
        data: (content) => SingleChildScrollView(
          padding: const EdgeInsets.all(AppSizes.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(content.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
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
    );
  }
}
