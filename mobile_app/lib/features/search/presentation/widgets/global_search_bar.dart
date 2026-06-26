import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/constants/app_shadows.dart';
import '../../../../core/utils/formatters.dart';
import '../../data/search_repository_impl.dart';
import '../../../cbir/presentation/providers/cbir_provider.dart';

class GlobalSearchBar extends ConsumerStatefulWidget {
  final bool translucent;
  final bool compact;

  const GlobalSearchBar({super.key, this.translucent = false, this.compact = false});

  @override
  ConsumerState<GlobalSearchBar> createState() => _GlobalSearchBarState();
}

class _GlobalSearchBarState extends ConsumerState<GlobalSearchBar> {
  final _controller = TextEditingController();
  final _focusNode = FocusNode();
  final _repo = SearchRepositoryImpl();
  Timer? _debounce;
  OverlayEntry? _overlay;

  List<Map<String, dynamic>> _suggestions = [];
  bool _loadingSuggestions = false;

  @override
  void initState() {
    super.initState();
    _controller.addListener(_onSearchChanged);
    _focusNode.addListener(() {
      if (!_focusNode.hasFocus) _removeOverlay();
    });
  }

  @override
  void dispose() {
    _removeOverlay();
    _controller.removeListener(_onSearchChanged);
    _controller.dispose();
    _focusNode.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged() {
    _debounce?.cancel();
    final query = _controller.text.trim();
    if (query.length < 2) {
      setState(() { _suggestions = []; });
      _removeOverlay();
      return;
    }
    _debounce = Timer(const Duration(milliseconds: 300), () => _fetchSuggestions(query));
  }

  void _removeOverlay() {
    _overlay?.remove();
    _overlay = null;
  }

  void _showOverlay() {
    _removeOverlay();
    _overlay = OverlayEntry(builder: (_) => _buildDropdown());
    Overlay.of(context).insert(_overlay!);
  }

  Future<void> _fetchSuggestions(String query) async {
    _loadingSuggestions = true;
    try {
      final result = await _repo.search(query);
      final raw = result['data'] as Map<String, dynamic>? ?? result;
      final packages = (raw['packages'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      final products = (raw['products'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      final categories = (raw['categories'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      final vouchers = (raw['vouchers'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      final orders = (raw['orders'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      final reviews = (raw['reviews'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      final terms = (raw['terms'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      final privacy = (raw['privacy'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      final helps = (raw['helps'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      final histories = (raw['histories'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      final combined = [
        ...packages.map((e) => e..['_type'] = 'packages'),
        ...products.map((e) => e..['_type'] = 'products'),
        ...categories.map((e) => e..['_type'] = 'categories'),
        ...vouchers.map((e) => e..['_type'] = 'vouchers'),
        ...orders.map((e) => e..['_type'] = 'orders'),
        ...reviews.map((e) => e..['_type'] = 'reviews'),
        ...terms.map((e) => e..['_type'] = 'terms'),
        ...privacy.map((e) => e..['_type'] = 'privacy'),
        ...helps.map((e) => e..['_type'] = 'helps'),
        ...histories.map((e) => e..['_type'] = 'histories'),
      ];
      _suggestions = combined;
    } catch (_) {
      _suggestions = [];
    }
    _loadingSuggestions = false;
    if (mounted) {
      setState(() {});
      if (_suggestions.isNotEmpty && _controller.text.trim().length >= 2) {
        _showOverlay();
      } else {
        _removeOverlay();
      }
    }
  }

  void _navigateToItem(Map<String, dynamic> item) {
    final type = item['_type'] as String? ?? 'packages';
    final id = '${item['id']}';
    _controller.clear();
    _focusNode.unfocus();
    _removeOverlay();
    if (type == 'categories') {
      context.push('/catalog', extra: {'category_id': id, 'category_name': item['name']});
    } else if (type == 'vouchers') {
      context.push('/vouchers/$id', extra: item);
    } else if (type == 'orders') {
      context.push('/order/$id');
    } else if (type == 'terms') {
      context.push('/terms-of-service');
    } else if (type == 'privacy') {
      context.push('/privacy-policy');
    } else if (type == 'helps') {
      context.push('/help-center');
    } else if (type == 'histories') {
      context.push('/history');
    } else if (type == 'reviews') {
      context.push('/my-reviews');
    } else {
      context.push('/catalog/$type/$id');
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    final picked = await ImagePicker().pickImage(source: source, maxWidth: 1024);
    if (picked != null && mounted) {
      ref.read(cbirProvider.notifier).search(File(picked.path));
      if (mounted) context.push('/cbir-result');
    }
  }

  void _showPickerOptions() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Container(
        padding: const EdgeInsets.only(top: 12, bottom: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 36, height: 4,
              decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
            ),
            const SizedBox(height: 24),
            Text('cari_gambar'.tr(),
              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600, color: Color(0xFF1A1A2E)),
            ),
            const SizedBox(height: 24),
            _sheetOption(
              icon: Icons.camera_alt_rounded,
              title: 'kamera'.tr(),
              subtitle: 'ambil_foto_langsung'.tr(),
              onTap: () { context.pop(); _pickImage(ImageSource.camera); },
            ),
            _sheetOption(
              icon: Icons.photo_library,
              title: 'galeri'.tr(),
              subtitle: 'pilih_dari_galeri'.tr(),
              onTap: () { context.pop(); _pickImage(ImageSource.gallery); },
            ),
            _sheetOption(
              icon: Icons.folder,
              title: 'file_manager'.tr(),
              subtitle: 'pilih_dari_penyimpanan'.tr(),
              onTap: () { context.pop(); _pickImage(ImageSource.gallery); },
            ),
            _sheetOption(
              icon: Icons.cloud,
              title: 'google_drive'.tr(),
              subtitle: 'pilih_dari_drive'.tr(),
              onTap: () { context.pop(); _pickImage(ImageSource.gallery); },
            ),
          ],
        ),
      ),
    );
  }

  Widget _sheetOption({
    required IconData icon,
    required String title,
    required String subtitle,
    VoidCallback? onTap,
  }) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 2),
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.primaryLight,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Icon(icon, color: AppColors.primaryColor, size: 22),
      ),
      title: Text(title, style: AppTextStyles.titleMedium),
      subtitle: Text(subtitle, style: AppTextStyles.bodySmall),
      onTap: onTap,
    );
  }

  Color get _textColor => widget.translucent ? Colors.white : const Color(0xFF1A1A2E);
  Color get _hintColor => widget.translucent ? Colors.white.withAlpha(170) : AppColors.textSecondary.withAlpha(170);
  Color get _iconColor => widget.translucent ? Colors.white.withAlpha(170) : AppColors.textSecondary;
  Color get _fillColor => widget.translucent ? Colors.white.withAlpha(40) : const Color(0xFFF5F5F5);

  @override
  Widget build(BuildContext context) {
    final vPadding = widget.compact ? 0.0 : 2.0;

    return Padding(
      padding: EdgeInsets.symmetric(vertical: vPadding),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _controller,
              focusNode: _focusNode,
              decoration: InputDecoration(
                hintText: 'search_hint'.tr(),
                hintStyle: TextStyle(color: _hintColor, fontWeight: FontWeight.w400),
                prefixIcon: Icon(Icons.search_rounded, color: _iconColor, size: 22),
                suffixIcon: _controller.text.isNotEmpty
                    ? IconButton(
                        icon: Icon(Icons.close_rounded, color: _iconColor, size: 20),
                        onPressed: () { _controller.clear(); _removeOverlay(); setState(() {}); },
                      )
                    : null,
                filled: true,
                fillColor: _fillColor,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: widget.translucent ? Colors.white.withAlpha(77) : AppColors.primaryColor.withAlpha(77)),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
              ),
              style: TextStyle(color: _textColor, fontWeight: FontWeight.w400),
            ),
          ),
          const SizedBox(width: 8),
          Container(
            decoration: BoxDecoration(
              color: _fillColor,
              borderRadius: BorderRadius.circular(14),
            ),
            child: IconButton(
              icon: Icon(Icons.camera_alt_rounded, color: _iconColor, size: 22),
              onPressed: _showPickerOptions,
              constraints: const BoxConstraints(minWidth: 44, minHeight: 44),
              splashRadius: 22,
            ),
          ),
          const SizedBox(width: 4),
          Container(
            decoration: BoxDecoration(
              color: _fillColor,
              borderRadius: BorderRadius.circular(14),
            ),
            child: IconButton(
              icon: Icon(Icons.notifications_outlined, color: _iconColor, size: 22),
              onPressed: () => context.push('/notifications'),
              constraints: const BoxConstraints(minWidth: 44, minHeight: 44),
              splashRadius: 22,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLeading(Map<String, dynamic> item, String type) {
    if (type == 'categories') {
      return Container(
        width: 48, height: 48,
        decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(10)),
        child: const Icon(Icons.category_rounded, color: AppColors.primaryColor, size: 24),
      );
    }
    if (type == 'vouchers') {
      return Container(
        width: 48, height: 48,
        decoration: BoxDecoration(color: const Color(0xFFFFF3E0), borderRadius: BorderRadius.circular(10)),
        child: const Icon(Icons.discount_rounded, color: Color(0xFFF57C00), size: 24),
      );
    }
    if (type == 'orders') {
      return Container(
        width: 48, height: 48,
        decoration: BoxDecoration(color: const Color(0xFFE3F2FD), borderRadius: BorderRadius.circular(10)),
        child: const Icon(Icons.receipt_long_rounded, color: Color(0xFF1565C0), size: 24),
      );
    }
    if (type == 'reviews') {
      return Container(
        width: 48, height: 48,
        decoration: BoxDecoration(color: const Color(0xFFFFF8E1), borderRadius: BorderRadius.circular(10)),
        child: const Icon(Icons.star_rounded, color: Color(0xFFF9A825), size: 24),
      );
    }
    if (type == 'terms' || type == 'privacy') {
      return Container(
        width: 48, height: 48,
        decoration: BoxDecoration(color: const Color(0xFFF3E5F5), borderRadius: BorderRadius.circular(10)),
        child: const Icon(Icons.description_rounded, color: Color(0xFF7B1FA2), size: 24),
      );
    }
    if (type == 'helps') {
      return Container(
        width: 48, height: 48,
        decoration: BoxDecoration(color: const Color(0xFFE0F7FA), borderRadius: BorderRadius.circular(10)),
        child: const Icon(Icons.help_outline_rounded, color: Color(0xFF00838F), size: 24),
      );
    }
    if (type == 'histories') {
      return Container(
        width: 48, height: 48,
        decoration: BoxDecoration(color: const Color(0xFFECEFF1), borderRadius: BorderRadius.circular(10)),
        child: const Icon(Icons.history_rounded, color: Color(0xFF546E7A), size: 24),
      );
    }
    final media = item['media'] as List? ?? [];
    final image = media.isNotEmpty && media[0] is Map
        ? (media[0]['url'] as String? ?? '')
        : (item['image'] as String? ?? '');
    return ClipRRect(
      borderRadius: BorderRadius.circular(10),
      child: SizedBox(
        width: 48, height: 48,
        child: image.isNotEmpty
            ? CachedNetworkImage(imageUrl: image, fit: BoxFit.cover,
                errorWidget: (_, _, _) => Container(color: const Color(0xFFF5F5F5), child: const Icon(Icons.image_outlined, size: 22, color: Color(0xFFD0D0D0))))
            : Container(color: const Color(0xFFF5F5F5), child: const Icon(Icons.image_outlined, size: 22, color: Color(0xFFD0D0D0))),
      ),
    );
  }

  Widget _buildTitle(Map<String, dynamic> item, String type) {
    final name = item['name'] as String? ?? '';
    if (type == 'categories') {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(name,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Color(0xFF1A1A2E)),
            maxLines: 1, overflow: TextOverflow.ellipsis,
          ),
        ],
      );
    }
    if (type == 'vouchers') {
      final code = item['code'] as String? ?? '';
      final description = item['description'] as String? ?? '';
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(code,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF1A1A2E)),
          ),
          if (description.isNotEmpty) ...[
            const SizedBox(height: 3),
            Text(description,
              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
              maxLines: 1, overflow: TextOverflow.ellipsis,
            ),
          ],
        ],
      );
    }
    if (type == 'orders') {
      final orderNumber = item['order_number'] as String? ?? name;
      final status = item['status'] as String? ?? '';
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(orderNumber,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1A1A2E)),
            maxLines: 1, overflow: TextOverflow.ellipsis,
          ),
          if (status.isNotEmpty) ...[
            const SizedBox(height: 3),
            Text(status,
              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
            ),
          ],
        ],
      );
    }
    if (type == 'reviews') {
      final comment = item['comment'] as String? ?? name;
      final package = item['package'] as Map<String, dynamic>?;
      final packageName = package?['name'] as String? ?? '';
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (packageName.isNotEmpty)
            Text(packageName,
              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
              maxLines: 1, overflow: TextOverflow.ellipsis,
            ),
          Text(comment,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Color(0xFF1A1A2E)),
            maxLines: 1, overflow: TextOverflow.ellipsis,
          ),
        ],
      );
    }
    if (type == 'histories') {
      final refNumber = item['reference_number'] as String? ?? name;
      final typeLabel = item['type'] as String? ?? '';
      final status = item['status'] as String? ?? '';
      final info = item['info'] as String? ?? '';
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(refNumber,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1A1A2E)),
            maxLines: 1, overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 3),
          Text('${info.isNotEmpty ? "$info · " : ""}$typeLabel${status.isNotEmpty ? " · $status" : ""}',
            style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
            maxLines: 1, overflow: TextOverflow.ellipsis,
          ),
        ],
      );
    }
    if (type == 'terms' || type == 'privacy' || type == 'helps') {
      final snippet = item['name'] as String? ?? name;
      final pageTitle = item['title'] as String? ?? '';
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(snippet,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Color(0xFF1A1A2E)),
            maxLines: 2, overflow: TextOverflow.ellipsis,
          ),
          if (pageTitle.isNotEmpty) ...[
            const SizedBox(height: 3),
            Text(pageTitle,
              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontStyle: FontStyle.italic),
              maxLines: 1, overflow: TextOverflow.ellipsis,
            ),
          ],
        ],
      );
    }
    final price = (item['price'] as num?)?.toInt() ?? 0;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(name,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Color(0xFF1A1A2E)),
          maxLines: 1, overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 3),
        Text(Formatters.currency(price),
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primaryColor),
        ),
      ],
    );
  }

  Widget _buildBadge(String type) {
    String label;
    Color bgColor;
    Color textColor;
    switch (type) {
      case 'packages':
        label = 'paket'.tr();
        bgColor = AppColors.primaryLight;
        textColor = AppColors.primaryColor;
      case 'categories':
        label = 'kategori';
        bgColor = const Color(0xFFE8F5E9);
        textColor = const Color(0xFF2E7D32);
      case 'vouchers':
        label = 'voucher';
        bgColor = const Color(0xFFFFF3E0);
        textColor = const Color(0xFFF57C00);
      case 'orders':
        label = 'pesanan';
        bgColor = const Color(0xFFE3F2FD);
        textColor = const Color(0xFF1565C0);
      case 'reviews':
        label = 'ulasan';
        bgColor = const Color(0xFFFFF8E1);
        textColor = const Color(0xFFF9A825);
      case 'terms':
        label = 'syarat';
        bgColor = const Color(0xFFF3E5F5);
        textColor = const Color(0xFF7B1FA2);
      case 'privacy':
        label = 'privasi';
        bgColor = const Color(0xFFF3E5F5);
        textColor = const Color(0xFF7B1FA2);
      case 'helps':
        label = 'bantuan';
        bgColor = const Color(0xFFE0F7FA);
        textColor = const Color(0xFF00838F);
      case 'histories':
        label = 'riwayat';
        bgColor = const Color(0xFFECEFF1);
        textColor = const Color(0xFF546E7A);
      default:
        label = 'bunga'.tr();
        bgColor = const Color(0xFFEEF2FF);
        textColor = const Color(0xFF4F46E5);
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(6)),
      child: Text(label,
        style: TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: textColor),
      ),
    );
  }

  Widget _buildDropdown() {
    final renderBox = context.findRenderObject() as RenderBox?;
    if (renderBox == null) return const SizedBox.shrink();
    final offset = renderBox.localToGlobal(Offset.zero);
    final top = offset.dy + renderBox.size.height + 6;

    return Stack(
      children: [
        GestureDetector(
          onTap: () { _focusNode.unfocus(); _removeOverlay(); },
          child: Container(color: Colors.transparent),
        ),
        Positioned(
          left: 16,
          right: 16,
          top: top,
          child: Material(
            elevation: 0,
            color: Colors.transparent,
            child: Container(
              constraints: const BoxConstraints(maxHeight: 340),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: AppShadows.elevated,
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: _loadingSuggestions
                    ? const Padding(
                        padding: EdgeInsets.all(16),
                        child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
                      )
                    : _suggestions.isEmpty
                        ? Padding(
                            padding: const EdgeInsets.all(20),
                            child: Center(
                              child: Text('hasil_tidak_ditemukan'.tr(),
                                style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                              ),
                            ),
                          )
                        : ListView.separated(
                            shrinkWrap: true,
                            padding: EdgeInsets.zero,
                            itemCount: _suggestions.length,
                            separatorBuilder: (_, _) => const Divider(height: 1, indent: 64),
                            itemBuilder: (_, i) {
                              final item = _suggestions[i];
                              final type = item['_type'] as String? ?? '';
                              return InkWell(
                                onTap: () => _navigateToItem(item),
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                  child: Row(
                                    children: [
                                      _buildLeading(item, type),
                                      const SizedBox(width: 14),
                                      Expanded(child: _buildTitle(item, type)),
                                      _buildBadge(type),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
