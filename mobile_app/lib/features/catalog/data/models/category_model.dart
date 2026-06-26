class CategoryModel {
  final int id;
  final String name;
  final String slug;
  final String? icon;
  final String? color;
  final String? description;
  final int? packagesCount;

  const CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.icon,
    this.color,
    this.description,
    this.packagesCount,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'] as int,
      name: (json['name'] ?? '') as String,
      slug: (json['slug'] ?? '') as String,
      icon: json['icon'] as String?,
      color: json['color'] as String?,
      description: json['description'] as String?,
      packagesCount: json['packages_count'] as int?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id, 'name': name, 'slug': slug, 'icon': icon,
    'color': color, 'description': description,
    'packages_count': packagesCount,
  };

  CategoryModel copyWith({
    int? id, String? name, String? slug, String? icon,
    String? color, String? description, int? packagesCount,
  }) => CategoryModel(
    id: id ?? this.id, name: name ?? this.name, slug: slug ?? this.slug,
    icon: icon ?? this.icon, color: color ?? this.color,
    description: description ?? this.description,
    packagesCount: packagesCount ?? this.packagesCount,
  );
}
