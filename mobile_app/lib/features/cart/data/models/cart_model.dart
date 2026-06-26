import '../../../catalog/data/models/item_model.dart';

class CartModel {
  final int id;
  final int userId;
  final int? productId;
  final int? packageId;
  final int quantity;
  final Map<String, dynamic>? meta;
  final ItemModel? product;
  final ItemModel? package;
  final String? createdAt;
  final String? updatedAt;

  const CartModel({
    required this.id,
    required this.userId,
    this.productId,
    this.packageId,
    this.quantity = 1,
    this.meta,
    this.product,
    this.package,
    this.createdAt,
    this.updatedAt,
  });

  ItemModel? get item => product ?? package;
  double get subtotal => (item?.finalPrice ?? 0) * quantity;

  factory CartModel.fromJson(Map<String, dynamic> json) {
    return CartModel(
      id: json['id'] as int,
      userId: (json['user_id'] ?? 0) as int,
      productId: json['product_id'] as int?,
      packageId: json['package_id'] as int?,
      quantity: (json['quantity'] ?? 1) as int,
      meta: json['meta'] as Map<String, dynamic>?,
      product: json['product'] != null ? ItemModel.fromJson(json['product'] as Map<String, dynamic>) : null,
      package: json['package'] != null ? ItemModel.fromJson(json['package'] as Map<String, dynamic>) : null,
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id, 'user_id': userId, 'product_id': productId,
    'package_id': packageId, 'quantity': quantity, 'meta': meta,
  };
}
