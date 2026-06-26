import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/home_repository_impl.dart';
import '../../domain/home_repository.dart';

final homeRepositoryProvider = Provider<HomeRepository>((ref) {
  return HomeRepositoryImpl();
});

final homeDataProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final repo = ref.watch(homeRepositoryProvider);
  return repo.getHomeData();
});
