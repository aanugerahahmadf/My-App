class ReviewModel {
  final int id;
  final int userId;
  final int? packageId;
  final int? productId;
  final int rating;
  final String? title;
  final String? comment;
  final Map<String, dynamic>? user;
  final Map<String, dynamic>? package;
  final Map<String, dynamic>? product;
  final String? createdAt;
  final String? updatedAt;

  const ReviewModel({
    required this.id,
    required this.userId,
    this.packageId,
    this.productId,
    required this.rating,
    this.title,
    this.comment,
    this.user,
    this.package,
    this.product,
    this.createdAt,
    this.updatedAt,
  });

  String? get userName => user?['full_name'] as String? ?? user?['name'] as String?;
  String? get userAvatar => user?['avatar_url'] as String?;

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: json['id'] as int,
      userId: (json['user_id'] ?? 0) as int,
      packageId: json['package_id'] as int?,
      productId: json['product_id'] as int?,
      rating: (json['rating'] ?? 5) as int,
      title: json['title'] as String?,
      comment: json['comment'] as String?,
      user: json['user'] as Map<String, dynamic>?,
      package: json['package'] as Map<String, dynamic>?,
      product: json['product'] as Map<String, dynamic>?,
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
    );
  }
}
