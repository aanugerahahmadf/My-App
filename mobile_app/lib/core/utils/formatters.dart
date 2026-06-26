import 'package:easy_localization/easy_localization.dart';

class Formatters {
  static String currency(int amount) {
    final format = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);
    return format.format(amount);
  }

  static String date(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('dd MMM yyyy', 'id').format(date);
    } catch (_) {
      return dateStr;
    }
  }

  static String dateTime(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('dd MMM yyyy HH:mm', 'id').format(date);
    } catch (_) {
      return dateStr;
    }
  }

  static String timeAgo(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      final now = DateTime.now();
      final diff = now.difference(date);

      if (diff.inMinutes < 1) return 'baru_saja'.tr();
      if (diff.inMinutes < 60) return 'x_menit_lalu'.tr(namedArgs: {'count': '${diff.inMinutes}'});
      if (diff.inHours < 24) return 'x_jam_lalu'.tr(namedArgs: {'count': '${diff.inHours}'});
      if (diff.inDays < 7) return 'x_hari_lalu'.tr(namedArgs: {'count': '${diff.inDays}'});
      return DateFormat('dd MMM', 'id').format(date);
    } catch (_) {
      return dateStr;
    }
  }

  static String similarity(double score) {
    return '${(score * 100).toStringAsFixed(0)}%';
  }
}
