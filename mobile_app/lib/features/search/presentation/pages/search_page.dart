import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/constants/app_shadows.dart';
import '../../../../core/utils/formatters.dart';
import '../../data/search_repository_impl.dart';
import '../../../cbir/presentation/providers/cbir_provider.dart';
import 'package:easy_localization/easy_localization.dart';

class SearchPage extends ConsumerStatefulWidget {
  const SearchPage({super.key});

  @override
  ConsumerState<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends ConsumerState<SearchPage> {
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
      final combined = [...packages.map((e) => e..['_type'] = 'packages'), ...products.map((e) => e..['_type'] = 'products')];
      _suggestions = combined.take(5).toList();
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
    context.push('/catalog/$type/$id');
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

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: _controller,
            focusNode: _focusNode,
            decoration: InputDecoration(
              hintText: 'search_hint'.tr(),
              hintStyle: TextStyle(color: Colors.white.withAlpha(170), fontWeight: FontWeight.w400),
              prefixIcon: Icon(Icons.search_rounded, color: Colors.white.withAlpha(170), size: 22),
              suffixIcon: _controller.text.isNotEmpty
                  ? IconButton(
                      icon: Icon(Icons.close_rounded, color: Colors.white.withAlpha(170), size: 20),
                      onPressed: () { _controller.clear(); _removeOverlay(); setState(() {}); },
                    )
                  : null,
              filled: true,
              fillColor: Colors.white.withAlpha(40),
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
                borderSide: BorderSide(color: Colors.white.withAlpha(77)),
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
            ),
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w400),
          ),
        ),
        const SizedBox(width: 8),
        _iconButton(icon: Icons.camera_alt_rounded, onTap: _showPickerOptions),
      ],
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
              constraints: const BoxConstraints(maxHeight: 280),
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
                    : ListView.separated(
                        shrinkWrap: true,
                        padding: EdgeInsets.zero,
                        itemCount: _suggestions.length,
                        separatorBuilder: (_, _) => const Divider(height: 1, indent: 64),
                        itemBuilder: (_, i) {
                          final item = _suggestions[i];
                          final type = item['_type'] as String? ?? '';
                          final media = item['media'] as List? ?? [];
                          final image = media.isNotEmpty && media[0] is Map
                              ? (media[0]['url'] as String? ?? '')
                              : (item['image'] as String? ?? '');
                          final name = item['name'] as String? ?? '';
                          final price = (item['price'] as num?)?.toInt() ?? 0;
                          return InkWell(
                            onTap: () => _navigateToItem(item),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                              child: Row(
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(10),
                                    child: SizedBox(
                                      width: 48, height: 48,
                                      child: image.isNotEmpty
                                          ? CachedNetworkImage(imageUrl: image, fit: BoxFit.cover,
                                              errorWidget: (_, _, _) => Container(color: const Color(0xFFF5F5F5), child: const Icon(Icons.image_outlined, size: 22, color: Color(0xFFD0D0D0))))
                                          : Container(color: const Color(0xFFF5F5F5), child: const Icon(Icons.image_outlined, size: 22, color: Color(0xFFD0D0D0))),
                                    ),
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
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
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: type == 'packages' ? AppColors.primaryLight : const Color(0xFFEEF2FF),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      type == 'packages' ? 'paket'.tr() : 'bunga'.tr(),
                                      style: TextStyle(
                                        fontSize: 9, fontWeight: FontWeight.w600,
                                        color: type == 'packages' ? AppColors.primaryColor : const Color(0xFF4F46E5),
                                      ),
                                    ),
                                  ),
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

  Widget _iconButton({
    required IconData icon,
    VoidCallback? onTap,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withAlpha(30),
        borderRadius: BorderRadius.circular(14),
      ),
      child: IconButton(
        icon: Icon(icon, color: Colors.white, size: 22),
        onPressed: onTap,
        constraints: const BoxConstraints(minWidth: 44, minHeight: 44),
        splashRadius: 22,
      ),
    );
  }
}
