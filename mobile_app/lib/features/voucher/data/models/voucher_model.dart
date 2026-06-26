class VoucherModel {
  final int id;
  final String code;
  final String? description;
  final double discountAmount;
  final String discountType;
  final double minPurchase;
  final String? expiresAt;
  final bool isActive;
  final bool? isGlobal;
  final int? maxUses;
  final int? usesCount;
  final String? createdAt;
  final String? updatedAt;

  const VoucherModel({
    required this.id,
    required this.code,
    this.description,
    required this.discountAmount,
    required this.discountType,
    this.minPurchase = 0,
    this.expiresAt,
    this.isActive = true,
    this.isGlobal,
    this.maxUses,
    this.usesCount,
    this.createdAt,
    this.updatedAt,
  });

  bool get isPercentage => discountType == 'percentage';
  bool get isFixed => discountType == 'fixed';
  bool get isExpired => expiresAt != null ? DateTime.tryParse(expiresAt!)?.isBefore(DateTime.now()) ?? false : false;

  double calculateDiscount(double total) {
    if (total < minPurchase) return 0;
    if (isPercentage) return total * (discountAmount / 100);
    return discountAmount;
  }

  factory VoucherModel.fromJson(Map<String, dynamic> json) {
    return VoucherModel(
      id: json['id'] as int,
      code: (json['code'] ?? '') as String,
      description: json['description'] as String?,
      discountAmount: (json['discount_amount'] ?? 0).toDouble(),
      discountType: (json['discount_type'] ?? 'fixed') as String,
      minPurchase: (json['min_purchase'] ?? 0).toDouble(),
      expiresAt: json['expires_at'] as String?,
      isActive: json['is_active'] as bool? ?? true,
      isGlobal: json['is_global'] as bool?,
      maxUses: json['max_uses'] as int?,
      usesCount: json['uses_count'] as int?,
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id, 'code': code, 'description': description,
    'discount_amount': discountAmount, 'discount_type': discountType,
    'min_purchase': minPurchase, 'expires_at': expiresAt,
    'is_active': isActive, 'is_global': isGlobal,
    'max_uses': maxUses, 'uses_count': usesCount,
  };
}
