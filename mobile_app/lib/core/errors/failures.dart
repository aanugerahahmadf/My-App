abstract class Failure {
  final String message;
  const Failure(this.message);
}

class NetworkFailure extends Failure {
  const NetworkFailure([super.message = 'Tidak ada koneksi internet']);
}

class ServerFailure extends Failure {
  const ServerFailure([super.message = 'Terjadi kesalahan server']);
}

class AuthFailure extends Failure {
  const AuthFailure([super.message = 'Sesi telah berakhir, silakan login kembali']);
}

class ValidationFailure extends Failure {
  final Map<String, List<String>> errors;
  const ValidationFailure(this.errors, [super.message = 'Validasi gagal']);
}

class NotFoundFailure extends Failure {
  const NotFoundFailure([super.message = 'Data tidak ditemukan']);
}

class UnknownFailure extends Failure {
  const UnknownFailure([super.message = 'Terjadi kesalahan yang tidak diketahui']);
}
