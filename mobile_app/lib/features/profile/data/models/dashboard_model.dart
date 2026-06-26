import '../../../auth/data/models/user_model.dart';
import '../../../order/data/models/order_model.dart';

class DashboardStats {
  final int totalOrders;
  final int completedOrders;
  final int pendingOrders;
  final int confirmedOrders;
  final int cancelledOrders;
  final int pendingPayments;
  final int paidOrders;
  final int wishlistCount;
  final int unreadNotifications;
  final double totalSpent;

  const DashboardStats({
    this.totalOrders = 0,
    this.completedOrders = 0,
    this.pendingOrders = 0,
    this.confirmedOrders = 0,
    this.cancelledOrders = 0,
    this.pendingPayments = 0,
    this.paidOrders = 0,
    this.wishlistCount = 0,
    this.unreadNotifications = 0,
    this.totalSpent = 0,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      totalOrders: (json['total_orders'] ?? 0) as int,
      completedOrders: (json['completed_orders'] ?? 0) as int,
      pendingOrders: (json['pending_orders'] ?? 0) as int,
      confirmedOrders: (json['confirmed_orders'] ?? 0) as int,
      cancelledOrders: (json['cancelled_orders'] ?? 0) as int,
      pendingPayments: (json['pending_payments'] ?? 0) as int,
      paidOrders: (json['paid_orders'] ?? 0) as int,
      wishlistCount: (json['wishlist_count'] ?? 0) as int,
      unreadNotifications: (json['unread_notifications'] ?? 0) as int,
      totalSpent: (json['total_spent'] ?? 0).toDouble(),
    );
  }
}

class DashboardData {
  final UserModel? user;
  final DashboardStats stats;
  final List<OrderModel> upcomingEvents;
  final List<OrderModel> recentOrders;

  const DashboardData({
    this.user,
    this.stats = const DashboardStats(),
    this.upcomingEvents = const [],
    this.recentOrders = const [],
  });

  factory DashboardData.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>? ?? json;
    return DashboardData(
      user: data['user'] != null ? UserModel.fromJson(data['user'] as Map<String, dynamic>) : null,
      stats: DashboardStats.fromJson(data['stats'] as Map<String, dynamic>? ?? {}),
      upcomingEvents: _parseList(data['upcoming_events'], (e) => OrderModel.fromJson(e as Map<String, dynamic>)),
      recentOrders: _parseList(data['recent_orders'], (e) => OrderModel.fromJson(e as Map<String, dynamic>)),
    );
  }

  static List<T> _parseList<T>(dynamic list, T Function(dynamic) parser) {
    if (list is List) return list.map(parser).toList();
    return [];
  }
}
