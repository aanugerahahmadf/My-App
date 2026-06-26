import '../data/models/history_model.dart';

abstract class HistoryRepository {
  Future<List<HistoryModel>> getHistory();
}
