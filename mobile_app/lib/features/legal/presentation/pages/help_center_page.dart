import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_sizes.dart';
import '../../../../core/widgets/app_shimmer.dart';
import '../providers/legal_provider.dart';

class HelpCenterPage extends ConsumerStatefulWidget {
  const HelpCenterPage({super.key});

  @override
  ConsumerState<HelpCenterPage> createState() => _HelpCenterPageState();
}

class _HelpCenterPageState extends ConsumerState<HelpCenterPage> {
  final Set<int> _expandedFaqs = {};

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(helpCenterProvider);

    return Scaffold(
      appBar: AppBar(title: Text('pusat_bantuan'.tr())),
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
                  onPressed: () => ref.invalidate(helpCenterProvider),
                  icon: const Icon(Icons.refresh, size: 18),
                  label: Text('coba_lagi'.tr()),
                ),
              ],
            ),
          ),
        ),
        data: (help) => ListView(
          padding: const EdgeInsets.all(AppSizes.md),
          children: [
            if (help.subtitle != null)
              Padding(
                padding: const EdgeInsets.only(bottom: AppSizes.md),
                child: Text(help.subtitle!, style: TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.5)),
              ),
            ...help.faqs.asMap().entries.map((entry) {
              final i = entry.key;
              final faq = entry.value;
              final isExpanded = _expandedFaqs.contains(i);
              return Card(
                margin: const EdgeInsets.only(bottom: AppSizes.sm),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: Column(
                  children: [
                    ListTile(
                      title: Text(faq.question ?? '', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                      trailing: Icon(isExpanded ? Icons.expand_less : Icons.expand_more, color: AppColors.textSecondary),
                      onTap: () {
                        setState(() {
                          if (isExpanded) { _expandedFaqs.remove(i); }
                          else { _expandedFaqs.add(i); }
                        });
                      },
                    ),
                    if (isExpanded && faq.answer != null)
                      Padding(
                        padding: const EdgeInsets.fromLTRB(AppSizes.md, 0, AppSizes.md, AppSizes.md),
                        child: Text(faq.answer!, style: TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.5)),
                      ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
