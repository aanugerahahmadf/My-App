abstract class SearchRepository {
  Future<Map<String, dynamic>> search(String query, {int page = 1});
}
