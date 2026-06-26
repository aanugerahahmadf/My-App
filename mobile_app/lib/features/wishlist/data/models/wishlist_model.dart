import '../../../catalog/data/models/item_model.dart';

class WishlistModel {
  final int id;
  final String? resourceType;
  final int? packageId;
  final int? productId;
  final ItemModel? item;
  final String? createdAt;

  const WishlistModel({
    required this.id,
    this.resourceType,
    this.packageId,
    this.productId,
    this.item,
    this.createdAt,
  });

  factory WishlistModel.fromJson(Map<String, dynamic> json) {
    ItemModel? parseItem(Map<String, dynamic> j) {
      if (j.containsKey('name') || j.containsKey('price')) {
        return ItemModel.fromJson(j);
      }
      return null;
    }

    final itemData = json['item'] as Map<String, dynamic>? ??
        (json.containsKey('name') ? json : null);

    return WishlistModel(
      id: json['id'] as int,
      resourceType: json['resource_type'] as String?,
      packageId: json['package_id'] as int?,
      productId: json['product_id'] as int?,
      item: itemData != null ? parseItem(itemData) : null,
      createdAt: json['created_at'] as String?,
    );
  }
}
