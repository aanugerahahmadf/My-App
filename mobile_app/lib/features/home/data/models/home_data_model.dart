import '../../../catalog/data/models/category_model.dart';
import '../../../catalog/data/models/item_model.dart';
import '../../../voucher/data/models/voucher_model.dart';

class UpcomingOrder {
  final int id;
  final String? eventDate;
  final String status;
  final double totalPrice;
  final String? notes;
  final ItemModel? package;

  const UpcomingOrder({
    required this.id,
    this.eventDate,
    required this.status,
    required this.totalPrice,
    this.notes,
    this.package,
  });

  factory UpcomingOrder.fromJson(Map<String, dynamic> json) {
    return UpcomingOrder(
      id: json['id'] as int,
      eventDate: json['event_date'] as String?,
      status: (json['status'] ?? 'pending') as String,
      totalPrice: (json['total_price'] ?? 0).toDouble(),
      notes: json['notes'] as String?,
      package: json['package'] != null
          ? ItemModel.fromJson(json['package'] as Map<String, dynamic>)
          : null,
    );
  }
}

class HomeData {
  final List<CategoryModel> categories;
  final List<ItemModel> featuredPackages;
  final List<VoucherModel> vouchers;
  final List<ItemModel> flashSale;
  final List<UpcomingOrder> upcomingOrders;
  final int unreadNotifications;
  final int unreadMessages;

  const HomeData({
    this.categories = const [],
    this.featuredPackages = const [],
    this.vouchers = const [],
    this.flashSale = const [],
    this.upcomingOrders = const [],
    this.unreadNotifications = 0,
    this.unreadMessages = 0,
  });

  factory HomeData.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>? ?? json;
    return HomeData(
      categories: _parseList(data['categories'], (e) => CategoryModel.fromJson(e as Map<String, dynamic>)),
      featuredPackages: _parseList(data['featured_packages'], (e) => ItemModel.fromJson(e as Map<String, dynamic>)),
      vouchers: _parseList(data['vouchers'], (e) => VoucherModel.fromJson(e as Map<String, dynamic>)),
      flashSale: _parseList(data['flash_sale'], (e) => ItemModel.fromJson(e as Map<String, dynamic>)),
      upcomingOrders: _parseList(data['upcoming_bookings'], (e) => UpcomingOrder.fromJson(e as Map<String, dynamic>)),
      unreadNotifications: (data['unread_notifications'] ?? 0) as int,
      unreadMessages: (data['unread_messages'] ?? 0) as int,
    );
  }

  static List<T> _parseList<T>(dynamic list, T Function(dynamic) parser) {
    if (list is List) return list.map(parser).toList();
    return [];
  }
}
