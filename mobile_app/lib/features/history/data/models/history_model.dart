class HistoryModel {
  final int id;
  final int userId;
  final String? type;
  final int? transactionId;
  final String? referenceNumber;
  final double amount;
  final String? info;
  final String? status;
  final String? notes;
  final String? createdAt;
  final String? updatedAt;

  const HistoryModel({
    required this.id,
    required this.userId,
    this.type,
    this.transactionId,
    this.referenceNumber,
    this.amount = 0,
    this.info,
    this.status,
    this.notes,
    this.createdAt,
    this.updatedAt,
  });

  factory HistoryModel.fromJson(Map<String, dynamic> json) {
    return HistoryModel(
      id: json['id'] as int,
      userId: (json['user_id'] ?? 0) as int,
      type: json['type'] as String?,
      transactionId: json['transaction_id'] as int?,
      referenceNumber: json['reference_number'] as String?,
      amount: (json['amount'] ?? 0).toDouble(),
      info: json['info'] as String?,
      status: json['status'] as String?,
      notes: json['notes'] as String?,
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
    );
  }
}
