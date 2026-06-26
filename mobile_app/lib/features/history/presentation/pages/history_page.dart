import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../presentation/providers/history_provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/utils/formatters.dart';

class HistoryPage extends ConsumerStatefulWidget {
  const HistoryPage({super.key});

  @override
  ConsumerState<HistoryPage> createState() => _HistoryPageState();
}

class _HistoryPageState extends ConsumerState<HistoryPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(historyProvider.notifier).fetchHistory());
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(historyProvider);
    return Scaffold(
      appBar: AppBar(title: Text('riwayat'.tr())),
      body: state.loading
          ? const Center(child: CircularProgressIndicator())
          : state.error != null
              ? Center(child: Text(state.error!, style: AppTextStyles.bodyMedium))
              : state.items.isEmpty
                  ? Center(child: Text('belum_ada_riwayat'.tr()))
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: state.items.length,
                      separatorBuilder: (_, _) => const Divider(),
                      itemBuilder: (context, index) {
                        final item = state.items[index];
                        return ListTile(
                          leading: CircleAvatar(
                            backgroundColor: AppColors.primaryColor,
                            child: Text(item.amount.toStringAsFixed(0), style: const TextStyle(color: Colors.white, fontSize: 12)),
                          ),
                          title: Text(item.type ?? 'riwayat_transaksi'.tr(), style: AppTextStyles.bodyMedium),
                          subtitle: Text(item.createdAt ?? '', style: AppTextStyles.bodySmall),
                          trailing: Text(
                            Formatters.currency(item.amount.toInt()),
                            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.primaryColor, fontWeight: FontWeight.bold),
                          ),
                        );
                      },
                    ),
    );
  }
}
