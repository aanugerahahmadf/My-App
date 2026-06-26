import 'category_model.dart';
import 'review_model.dart';

class ItemModel {
  final int id;
  final int? categoryId;
  final String name;
  final String slug;
  final String? description;
  final double price;
  final double? discountPrice;
  final int stock;
  final bool isActive;
  final bool isFeatured;
  final List<String>? features;
  final String? theme;
  final String? color;
  final int? minCapacity;
  final int? maxCapacity;
  final String? imageUrl;
  final String? videoUrl;
  final List<dynamic>? media;
  final double finalPrice;
  final double averageRating;
  final bool isWishlisted;
  final CategoryModel? category;
  final List<ReviewModel>? reviews;
  final String? weddingFlowersDecorasiId;
  final Map<String, dynamic>? weddingFlowersDecorasi;
  final String? createdAt;
  final String? updatedAt;

  const ItemModel({
    required this.id,
    this.categoryId,
    required this.name,
    required this.slug,
    this.description,
    required this.price,
    this.discountPrice,
    this.stock = 0,
    this.isActive = true,
    this.isFeatured = false,
    this.features,
    this.theme,
    this.color,
    this.minCapacity,
    this.maxCapacity,
    this.imageUrl,
    this.videoUrl,
    this.media,
    this.finalPrice = 0,
    this.averageRating = 0,
    this.isWishlisted = false,
    this.category,
    this.reviews,
    this.weddingFlowersDecorasiId,
    this.weddingFlowersDecorasi,
    this.createdAt,
    this.updatedAt,
  });

  bool get hasDiscount => discountPrice != null && discountPrice! < price;

  String? get categoryName => category?.name;

  factory ItemModel.fromJson(Map<String, dynamic> json) {
    return ItemModel(
      id: json['id'] as int,
      categoryId: json['category_id'] as int?,
      name: (json['name'] ?? '') as String,
      slug: (json['slug'] ?? '') as String,
      description: json['description'] as String?,
      price: (json['price'] ?? 0).toDouble(),
      discountPrice: (json['discount_price'] as num?)?.toDouble(),
      stock: (json['stock'] ?? 0) as int,
      isActive: json['is_active'] as bool? ?? true,
      isFeatured: json['is_featured'] as bool? ?? false,
      features: json['features'] != null ? (json['features'] as List).cast<String>() : null,
      theme: json['theme'] as String?,
      color: json['color'] as String?,
      minCapacity: json['min_capacity'] as int?,
      maxCapacity: json['max_capacity'] as int?,
      imageUrl: json['image_url'] as String?,
      videoUrl: json['video_url'] as String?,
      media: json['media'] as List<dynamic>?,
      finalPrice: (json['final_price'] ?? json['price'] ?? 0).toDouble(),
      averageRating: (json['average_rating'] ?? 0).toDouble(),
      isWishlisted: json['is_wishlisted'] as bool? ?? false,
      category: json['category'] != null ? CategoryModel.fromJson(json['category'] as Map<String, dynamic>) : null,
      reviews: json['reviews'] != null ? (json['reviews'] as List).map((e) => ReviewModel.fromJson(e as Map<String, dynamic>)).toList() : null,
      weddingFlowersDecorasiId: json['wedding_flowers_decorasi_id'] as String?,
      weddingFlowersDecorasi: json['wedding_flowers_decorasi'] as Map<String, dynamic>?,
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id, 'category_id': categoryId, 'name': name, 'slug': slug,
    'description': description, 'price': price, 'discount_price': discountPrice,
    'stock': stock, 'is_active': isActive, 'is_featured': isFeatured,
    'features': features, 'theme': theme, 'color': color,
    'min_capacity': minCapacity, 'max_capacity': maxCapacity,
    'image_url': imageUrl, 'video_url': videoUrl, 'final_price': finalPrice,
    'is_wishlisted': isWishlisted,
    'category': category?.toJson(),
    'wedding_flowers_decorasi_id': weddingFlowersDecorasiId,
    'wedding_flowers_decorasi': weddingFlowersDecorasi,
    'created_at': createdAt, 'updated_at': updatedAt,
  };
}
