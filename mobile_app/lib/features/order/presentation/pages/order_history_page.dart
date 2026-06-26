import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/constants/app_sizes.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_empty_state.dart';
import '../../../../core/widgets/app_shimmer.dart';
import '../../../../core/utils/formatters.dart';
import '../providers/order_provider.dart';

class OrderHistoryPage extends ConsumerStatefulWidget {
  const OrderHistoryPage({super.key});

  @override
  ConsumerState<OrderHistoryPage> createState() => _OrderHistoryPageState();
}

class _OrderHistoryPageState extends ConsumerState<OrderHistoryPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String? _activeStatus;

  final _tabs = [
    {'label': 'semua', 'status': null},
    {'label': 'menunggu', 'status': 'pending'},
    {'label': 'status_dikonfirmasi', 'status': 'confirmed'},
    {'label': 'status_diproses', 'status': 'preparing'},
    {'label': 'status_selesai', 'status': 'completed'},
    {'label': 'status_dibatalkan', 'status': 'cancelled'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        setState(() => _activeStatus = _tabs[_tabController.index]['status']);
        ref.read(orderProvider.notifier).fetchOrders(status: _activeStatus, refresh: true);
      }
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(orderProvider.notifier).fetchOrders(refresh: true);
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  String _statusLabel(String? status) {
    switch (status) {
      case 'pending': return 'menunggu'.tr();
      case 'confirmed': return 'status_dikonfirmasi'.tr();
      case 'preparing': return 'status_diproses'.tr();
      case 'event_day': return 'status_hari_h'.tr();
      case 'completed': return 'status_selesai'.tr();
      case 'cancelled': return 'status_dibatalkan'.tr();
      default: return status ?? '-';
    }
  }

  Color _statusColor(String? status) {
    switch (status) {
      case 'pending': return AppColors.warningColor;
      case 'confirmed': case 'preparing': return AppColors.primaryColor;
      case 'event_day': return const Color(0xFF9C27B0);
      case 'completed': return AppColors.successColor;
      case 'cancelled': return AppColors.errorColor;
      default: return AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(orderProvider);
    final notifier = ref.read(orderProvider.notifier);

    return Scaffold(
      appBar: AppBar(title: Text('riwayat_pesanan'.tr())),
      body: Column(
        children: [
          TabBar(
            controller: _tabController,
            isScrollable: true,
            labelColor: AppColors.primaryColor,
            unselectedLabelColor: AppColors.textSecondary,
            indicatorColor: AppColors.primaryColor,
            tabs: _tabs.map((t) => Tab(text: (t['label'] as String).tr())).toList(),
          ),
          Expanded(
            child: state.loading
                ? ListView.builder(
                    padding: const EdgeInsets.all(AppSizes.md),
                    itemCount: 3,
                    itemBuilder: (_, _) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: AppShimmer(height: 140),
                    ),
                  )
                : state.error != null
                    ? Center(child: Text(state.error ?? '', style: AppTextStyles.bodyMedium))
                    : state.orders.isEmpty
                        ? AppEmptyState(title: 'tidak_ada_pesanan'.tr(), subtitle: 'belum_ada_pesanan'.tr(), icon: Icons.receipt_long_outlined)
                        : RefreshIndicator(
                            onRefresh: () => notifier.fetchOrders(status: _activeStatus, refresh: true),
                            child: ListView.builder(
                              padding: const EdgeInsets.all(AppSizes.md),
                              itemCount: state.orders.length + (state.hasMore ? 1 : 0),
                              itemBuilder: (context, index) {
                                if (index == state.orders.length) {
                                  notifier.loadMore(status: _activeStatus);
                                  return const Padding(
                                    padding: EdgeInsets.all(16),
                                    child: Center(child: CircularProgressIndicator()),
                                  );
                                }

                                final order = state.orders[index];
                                final status = order['status'] as String?;
                                final firstItem = order['item'] as Map<String, dynamic>?;

                                return Card(
                                  margin: const EdgeInsets.only(bottom: 12),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  child: InkWell(
                                    onTap: () => context.push('/order/${order['id']}'),
                                    borderRadius: BorderRadius.circular(12),
                                    child: Padding(
                                      padding: const EdgeInsets.all(AppSizes.md),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Text('${'pesanan_no'.tr()} #${order['order_number'] ?? order['id']}', style: AppTextStyles.bodySmall),
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                                decoration: BoxDecoration(
                                                  color: _statusColor(status).withValues(alpha: 0.1),
                                                  borderRadius: BorderRadius.circular(12),
                                                ),
                                                child: Text(
                                                  _statusLabel(status),
                                                  style: AppTextStyles.labelSmall.copyWith(color: _statusColor(status), fontWeight: FontWeight.w600),
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 12),
                                          Row(
                                            children: [
                                              if (firstItem != null)
                                                ClipRRect(
                                                  borderRadius: BorderRadius.circular(8),
                                                  child: Container(
                                                    width: 60, height: 60,
                                                    color: Colors.grey[200],
                                                    child: const Icon(Icons.image, color: Colors.grey),
                                                  ),
                                                ),
                                              if (firstItem != null) const SizedBox(width: 12),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Text(firstItem?['name'] as String? ?? 'orders'.tr(), style: AppTextStyles.bodyMedium),
                                                    Text('item_count'.tr(namedArgs: {'count': '1'}), style: AppTextStyles.bodySmall),
                                                  ],
                                                ),
                                              ),
                                              Column(
                                                crossAxisAlignment: CrossAxisAlignment.end,
                                                children: [
                                                  Text(Formatters.currency(order['total'] as int? ?? 0), style: AppTextStyles.titleMedium.copyWith(color: AppColors.primaryColor)),
                                                  Text(Formatters.date(order['created_at'] as String? ?? ''), style: AppTextStyles.bodySmall),
                                                ],
                                              ),
                                            ],
                                          ),
                                          if (status == 'pending' || order['payment_status'] == 'unpaid') ...[
                                            const SizedBox(height: 12),
                                            Row(
                                              children: [
                                                Expanded(
                                                  child: AppButton(
                                                    label: 'bayar'.tr(),
                                                    onPressed: () => context.push('/payment/${order['id']}'),
                                                  ),
                                                ),
                                                const SizedBox(width: 12),
                                                Expanded(
                                                  child: AppButton(
                                                    label: 'batalkan'.tr(),
                                                    onPressed: () => notifier.cancelOrder('${order['id']}'),
                                                    type: ButtonType.outline,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ],
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }
}
