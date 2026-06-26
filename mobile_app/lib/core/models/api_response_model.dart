import 'pagination_model.dart';

class ApiResponse<T> {
  final String? status;
  final String? message;
  final T? data;
  final PaginationMeta? pagination;
  final Map<String, List<String>>? errors;

  const ApiResponse({
    this.status,
    this.message,
    this.data,
    this.pagination,
    this.errors,
  });

  bool get isSuccess => status == 'success' || status == 'ok';

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? parser,
  ) {
    PaginationMeta? pagination;
    final paginationData = json['pagination'] as Map<String, dynamic>? ??
        json['meta'] as Map<String, dynamic>?;
    if (paginationData != null) {
      pagination = PaginationMeta.fromJson(paginationData);
    }

    T? parsedData;
    if (parser != null) {
      final rawData = json['data'];
      if (rawData != null) {
        parsedData = parser(rawData);
      }
    }

    Map<String, List<String>>? errors;
    if (json['errors'] is Map) {
      errors = (json['errors'] as Map<String, dynamic>).map(
        (k, v) => MapEntry(k, v is List ? v.cast<String>() : [v.toString()]),
      );
    }

    return ApiResponse(
      status: json['status'] as String?,
      message: json['message'] as String?,
      data: parser != null ? parsedData : json['data'] as T?,
      pagination: pagination,
      errors: errors,
    );
  }
}
