import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/widgets/app_button.dart';
import '../providers/payment_provider.dart';

class MidtransWebviewPage extends ConsumerStatefulWidget {
  final String orderId;

  const MidtransWebviewPage({super.key, required this.orderId});

  @override
  ConsumerState<MidtransWebviewPage> createState() => _MidtransWebviewPageState();
}

class _MidtransWebviewPageState extends ConsumerState<MidtransWebviewPage> {
  WebViewController? _controller;
  bool _loading = true;
  bool _handled = false;

  @override
  void initState() {
    super.initState();
    _initPayment();
  }

  @override
  void dispose() {
    _handled = true;
    super.dispose();
  }

  Future<void> _initPayment() async {
    final success = await ref.read(paymentProvider.notifier).initiatePayment(widget.orderId);
    if (!mounted) return;

    final state = ref.read(paymentProvider);
    final url = state.paymentUrl ?? state.snapToken;

    if (success && url != null) {
      _controller = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..setNavigationDelegate(
          NavigationDelegate(
            onPageStarted: (_) => setState(() => _loading = true),
            onPageFinished: (_) => setState(() => _loading = false),
            onUrlChange: (change) {
              if (_handled) return;
              final currentUrl = change.url ?? '';
              if (currentUrl.contains('finish') || currentUrl.contains('success')) {
                _handled = true;
                _showResultDialog('pembayaran_berhasil'.tr(), 'msg_payment_success'.tr(), Icons.check_circle, AppColors.successColor, true);
              } else if (currentUrl.contains('unfinish') || currentUrl.contains('pending')) {
                _handled = true;
                _showResultDialog('pembayaran_belum_selesai'.tr(), 'msg_payment_pending'.tr(), Icons.access_time, AppColors.warningColor, false);
              } else if (currentUrl.contains('cancel')) {
                _handled = true;
                _showResultDialog('pembayaran_dibatalkan'.tr(), 'msg_payment_cancelled'.tr(), Icons.cancel, AppColors.errorColor, false);
              } else if (currentUrl.contains('error') || currentUrl.contains('failed')) {
                _handled = true;
                _showResultDialog('pembayaran_gagal'.tr(), 'msg_payment_failed'.tr(), Icons.error, AppColors.errorColor, false);
              }
            },
          ),
        )
        ..loadRequest(Uri.parse(url));
      setState(() {});
    } else {
      _showError();
    }
  }

  void _showResultDialog(String title, String message, IconData icon, Color color, bool success) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 8),
            Icon(icon, size: 64, color: color),
            const SizedBox(height: 16),
            Text(title, style: AppTextStyles.titleLarge.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text(message, style: AppTextStyles.bodyMedium, textAlign: TextAlign.center),
            const SizedBox(height: 20),
            AppButton(
              label: success ? 'lihat_pesanan'.tr() : 'kembali'.tr(),
              onPressed: () {
                context.pop();
                context.pop();
                if (success) context.push('/orders');
              },
            ),
            if (!success) ...[
              const SizedBox(height: 8),
              AppButton(
                label: 'coba_lagi'.tr(),
                onPressed: () {
                  context.pop();
                  _handled = false;
                  _initPayment();
                },
                type: ButtonType.text,
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showError() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 64, color: AppColors.errorColor),
            const SizedBox(height: 16),
            Text('pembayaran_gagal'.tr(), style: AppTextStyles.titleLarge.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text(ref.read(paymentProvider).error ?? 'error_coba_lagi'.tr(), style: AppTextStyles.bodyMedium, textAlign: TextAlign.center),
            const SizedBox(height: 20),
            AppButton(label: 'coba_lagi'.tr(), onPressed: () { context.pop(); _initPayment(); }),
            const SizedBox(height: 8),
            AppButton(label: 'kembali'.tr(), onPressed: () { context.pop(); context.pop(); }, type: ButtonType.text),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final paymentState = ref.watch(paymentProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('pembayaran'.tr()),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () {
            showDialog(
              context: context,
              builder: (ctx) => AlertDialog(
                title: Text('batalkan_pembayaran_konfirmasi'.tr()),
                content: Text('yakin_tinggalkan_pembayaran'.tr()),
                actions: [
                  TextButton(onPressed: () => context.pop(), child: Text('lanjutkan_bayar'.tr())),
                  TextButton(onPressed: () { context.pop(); context.pop(); }, child: Text('ya_batalkan'.tr())),
                ],
              ),
            );
          },
        ),
      ),
      body: paymentState.loading || _loading
          ? const Center(child: CircularProgressIndicator())
          : paymentState.error != null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.error_outline, size: 64, color: AppColors.errorColor),
                      const SizedBox(height: 16),
                      Text(paymentState.error!, style: const TextStyle(color: AppColors.errorColor), textAlign: TextAlign.center),
                      const SizedBox(height: 16),
                      AppButton(label: 'coba_lagi'.tr(), onPressed: _initPayment, type: ButtonType.outline),
                    ],
                  ),
                )
              : _controller != null
                  ? WebViewWidget(controller: _controller!)
                  : const SizedBox.shrink(),
    );
  }
}
