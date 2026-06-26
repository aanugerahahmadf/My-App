abstract class PaymentRepository {
  Future<Map<String, dynamic>> initiatePayment(String orderId);
}
