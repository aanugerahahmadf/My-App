import '../../../catalog/data/models/item_model.dart';

class OrderModel {
  final int id;
  final int userId;
  final String? userName;
  final int? packageId;
  final int? productId;
  final String title;
  final String orderNumber;
  final double totalPrice;
  final String status;
  final String? paymentStatus;
  final String? bookingDate;
  final String? eventDate;
  final String? notes;
  final String? resourceType;
  final int? quantity;
  final String? bookingTime;
  final double? subtotal;
  final double? discount;
  final double? shippingCost;
  final double? tax;
  final String? locationAddress;
  final String? adminPhone;
  final String? transactionId;
  final String? paymentMethod;
  final String? vaNumber;
  final String? paidAt;
  final Map<String, dynamic>? payment;
  final Map<String, dynamic>? shippingAddress;
  final ItemModel? item;
  final ItemModel? package;
  final ItemModel? product;
  final String? createdAt;
  final String? updatedAt;

  const OrderModel({
    required this.id,
    required this.userId,
    this.userName,
    this.packageId,
    this.productId,
    required this.title,
    required this.orderNumber,
    required this.totalPrice,
    required this.status,
    this.paymentStatus,
    this.bookingDate,
    this.eventDate,
    this.notes,
    this.resourceType,
    this.quantity,
    this.bookingTime,
    this.subtotal,
    this.discount,
    this.shippingCost,
    this.tax,
    this.locationAddress,
    this.adminPhone,
    this.transactionId,
    this.paymentMethod,
    this.vaNumber,
    this.paidAt,
    this.payment,
    this.shippingAddress,
    this.item,
    this.package,
    this.product,
    this.createdAt,
    this.updatedAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'] as int,
      userId: (json['user_id'] ?? 0) as int,
      userName: json['user_name'] as String?,
      packageId: json['package_id'] as int?,
      productId: json['product_id'] as int?,
      title: (json['title'] ?? 'Pesanan') as String,
      orderNumber: (json['order_number'] ?? '') as String,
      totalPrice: (json['total_price'] ?? 0).toDouble(),
      status: (json['status'] ?? 'pending') as String,
      paymentStatus: json['payment_status'] as String?,
      bookingDate: json['booking_date'] as String?,
      eventDate: json['event_date'] as String?,
      notes: json['notes'] as String?,
      resourceType: json['resource_type'] as String?,
      quantity: json['quantity'] as int?,
      bookingTime: json['booking_time'] as String?,
      subtotal: (json['subtotal'] as num?)?.toDouble(),
      discount: (json['discount'] as num?)?.toDouble(),
      shippingCost: (json['shipping_cost'] as num?)?.toDouble(),
      tax: (json['tax'] as num?)?.toDouble(),
      locationAddress: json['location_address'] as String?,
      adminPhone: json['admin_phone'] as String?,
      transactionId: json['transaction_id'] as String?,
      paymentMethod: json['payment_method'] as String?,
      vaNumber: json['va_number'] as String?,
      paidAt: json['paid_at'] as String?,
      payment: json['payment'] as Map<String, dynamic>?,
      shippingAddress: json['shipping_address'] as Map<String, dynamic>?,
      item: json['item'] != null ? ItemModel.fromJson(json['item'] as Map<String, dynamic>) : null,
      package: json['package'] != null ? ItemModel.fromJson(json['package'] as Map<String, dynamic>) : null,
      product: json['product'] != null ? ItemModel.fromJson(json['product'] as Map<String, dynamic>) : null,
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
    );
  }

  String? get itemImageUrl => item?.imageUrl ?? package?.imageUrl ?? product?.imageUrl;
  String? get itemName => item?.name ?? package?.name ?? product?.name;
}
