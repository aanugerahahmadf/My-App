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
import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/validators.dart';
import '../../../cart/presentation/providers/cart_provider.dart';
import '../../data/order_repository_impl.dart';

class CheckoutPage extends ConsumerStatefulWidget {
  const CheckoutPage({super.key});

  @override
  ConsumerState<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends ConsumerState<CheckoutPage> {
  final _formKey = GlobalKey<FormState>();
  final _locController = TextEditingController();
  final _notesController = TextEditingController();
  final _voucherController = TextEditingController();
  DateTime? _eventDate;
  bool _creating = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(cartProvider.notifier).fetchCart();
    });
  }

  @override
  void dispose() {
    _locController.dispose();
    _notesController.dispose();
    _voucherController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 7)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      locale: const Locale('id', 'ID'),
    );
    if (picked != null) setState(() => _eventDate = picked);
  }

  Future<void> _submitOrder() async {
    if (!_formKey.currentState!.validate()) return;
    if (_eventDate == null) {
      AppSnackBar.show(context, 'pilih_tanggal_acara'.tr(), type: SnackBarType.warning);
      return;
    }

    final cartState = ref.read(cartProvider);
    if (cartState.items.isEmpty) {
      AppSnackBar.show(context, 'keranjang_kosong'.tr(), type: SnackBarType.warning);
      return;
    }

    setState(() => _creating = true);

    try {
      final first = cartState.items.first;
      final itemData = (first['package'] ?? first['product']) as Map<String, dynamic>? ?? first;
      final hasPackage = first['package_id'] != null || itemData['type'] == 'package';
      final id = first['package_id'] ?? first['product_id'] ?? itemData['id'];
      if (id == null) {
        AppSnackBar.show(context, 'item_tidak_valid'.tr(), type: SnackBarType.error);
        setState(() => _creating = false);
        return;
      }

      final data = <String, dynamic>{
        if (hasPackage) 'package_id': id else 'product_id': id,
        'event_date': _eventDate!.toIso8601String().split('T')[0],
        'location_address': _locController.text.trim(),
        'notes': _notesController.text.trim(),
      };

      final voucher = _voucherController.text.trim();
      if (voucher.isNotEmpty) data['voucher_code'] = voucher;

      final repo = OrderRepositoryImpl();
      final res = await repo.createOrder(data);
      final orderId = res['id'] ?? res['order']?['id'];
      if (orderId == null) throw Exception('gagal_dapat_id'.tr());

      if (mounted) {
        ref.read(cartProvider.notifier).fetchCart();
        AppSnackBar.show(context, 'pesanan_dibuat'.tr(), type: SnackBarType.success);
        context.push('/payment/$orderId');
      }
    } catch (e) {
      if (mounted) {
        AppSnackBar.show(context, 'gagal_buat_pesanan'.tr(), type: SnackBarType.error);
      }
    } finally {
      if (mounted) setState(() => _creating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cartState = ref.watch(cartProvider);
    final items = cartState.items;
    final subtotal = cartState.subtotal;

    return Scaffold(
      appBar: AppBar(title: Text('checkout'.tr())),
      body: cartState.loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(AppSizes.md),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AppTextField(
                      label: 'lokasi_acara'.tr(),
                      controller: _locController,
                      hint: 'masukkan_alamat'.tr(),
                      validator: Validators.required,
                      maxLines: 3,
                    ),
                    SizedBox(height: AppSizes.md),
                    Text('tanggal_acara'.tr(), style: AppTextStyles.bodyLarge),
                    const SizedBox(height: 8),
                    InkWell(
                      onTap: _pickDate,
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey[300]!),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _eventDate != null
                              ? Formatters.date(_eventDate!.toIso8601String())
                              : 'pilih_tanggal'.tr(),
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: _eventDate != null ? AppColors.textPrimary : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                    SizedBox(height: AppSizes.md),
                    AppTextField(
                      label: 'catatan'.tr(),
                      controller: _notesController,
                      hint: 'catatan_tambahan'.tr(),
                      maxLines: 3,
                    ),
                    SizedBox(height: AppSizes.md),
                    AppTextField(
                      label: 'kode_voucher'.tr(),
                      controller: _voucherController,
                      hint: 'masukkan_kode_voucher'.tr(),
                    ),

                    SizedBox(height: AppSizes.lg),
                    Text('item_pesanan'.tr(), style: AppTextStyles.titleMedium),
                    const SizedBox(height: 8),
                    if (items.isEmpty)
                      Padding(
                        padding: EdgeInsets.symmetric(vertical: AppSizes.md),
                        child: Text('tidak_ada_item'.tr()),
                      )
                    else
                      ...items.map((item) {
                        final itemData = (item['package'] ?? item['product']) as Map<String, dynamic>?;
                        final name = itemData?['name'] as String? ?? 'item'.tr();
                        final qty = item['quantity'] as int? ?? 1;
                        final price = (itemData?['price'] as num?)?.toInt() ?? 0;
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(name, style: AppTextStyles.bodyMedium),
                              ),
                              Text('$qty x ${Formatters.currency(price)}',
                                  style: AppTextStyles.bodyMedium),
                            ],
                          ),
                        );
                      }),
                    const Divider(height: AppSizes.lg),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('subtotal'.tr(), style: AppTextStyles.bodyLarge),
                        Text(Formatters.currency(subtotal), style: AppTextStyles.titleMedium),
                      ],
                    ),
                    SizedBox(height: AppSizes.lg),
                    AppButton(
                      label: 'buat_pesanan'.tr(),
                      loading: _creating,
                      onPressed: _submitOrder,
                    ),
                  ],
                ),
              ),
            ),
    );
  }

}
