import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:path_provider/path_provider.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/api/dio_client.dart';
import '../domain/cbir_repository.dart';
import 'models/cbir_result_model.dart';

class CbirRepositoryImpl implements CbirRepository {
  @override
  Future<List<CbirResultItem>> searchByImage(File imageFile) async {
    final dir = await getTemporaryDirectory();
    final targetPath =
        '${dir.path}/${DateTime.now().millisecondsSinceEpoch}.jpg';

    final compressed = await FlutterImageCompress.compressAndGetFile(
      imageFile.absolute.path,
      targetPath,
      quality: 70,
      minWidth: 800,
      minHeight: 800,
    );

    final imagePath = compressed?.path ?? imageFile.path;

    final formData = FormData.fromMap({
      'image': await MultipartFile.fromFile(
        imagePath,
        filename: 'search.jpg',
      ),
    });

    final response = await DioClient.instance.post(
      ApiEndpoints.searchImage,
      data: formData,
    );

    final data = response.data['data'];
    if (data is List) {
      return data
          .map((e) => CbirResultItem.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    return [];
  }
}
