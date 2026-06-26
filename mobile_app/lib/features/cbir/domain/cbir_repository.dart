import 'dart:io';
import '../data/models/cbir_result_model.dart';

abstract class CbirRepository {
  Future<List<CbirResultItem>> searchByImage(File imageFile);
}
