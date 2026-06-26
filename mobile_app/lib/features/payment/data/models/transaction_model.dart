class TransactionModel {
  final int id;
  final int userId;
  final int? orderId;
  final String? type;
  final String? referenceNumber;
  final double amount;
  final double adminFee;
  final double totalAmount;
  final String? paymentGateway;
  final String? paymentMethod;
  final String? snapToken;
  final String? paymentUrl;
  final String status;
  final String? paidAt;
  final String? notes;
  final Map<String, dynamic>? metadata;
  final String? createdAt;
  final String? updatedAt;

  const TransactionModel({
    required this.id,
    required this.userId,
    this.orderId,
    this.type,
    this.referenceNumber,
    required this.amount,
    this.adminFee = 0,
    required this.totalAmount,
    this.paymentGateway,
    this.paymentMethod,
    this.snapToken,
    this.paymentUrl,
    required this.status,
    this.paidAt,
    this.notes,
    this.metadata,
    this.createdAt,
    this.updatedAt,
  });

  factory TransactionModel.fromJson(Map<String, dynamic> json) {
    return TransactionModel(
      id: json['id'] as int,
      userId: (json['user_id'] ?? 0) as int,
      orderId: json['order_id'] as int?,
      type: json['type'] as String?,
      referenceNumber: json['reference_number'] as String?,
      amount: (json['amount'] ?? 0).toDouble(),
      adminFee: (json['admin_fee'] ?? 0).toDouble(),
      totalAmount: (json['total_amount'] ?? 0).toDouble(),
      paymentGateway: json['payment_gateway'] as String?,
      paymentMethod: json['payment_method'] as String?,
      snapToken: json['snap_token'] as String?,
      paymentUrl: json['payment_url'] as String?,
      status: (json['status'] ?? 'pending') as String,
      paidAt: json['paid_at'] as String?,
      notes: json['notes'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>?,
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
    );
  }

  bool get isSuccess => status == 'success' || status == 'settlement' || status == 'capture';
  bool get isPending => status == 'pending' || status == 'authorize';
  bool get isFailed => status == 'failed' || status == 'deny' || status == 'cancel' || status == 'expire';
}
