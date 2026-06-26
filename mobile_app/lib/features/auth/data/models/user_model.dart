class UserModel {
  final int id;
  final String fullName;
  final String? firstName;
  final String? midName;
  final String? lastName;
  final String username;
  final String email;
  final String? whatsapp;
  final String? phone;
  final String? avatar;
  final String? avatarUrl;
  final String? gender;
  final String? address;
  final String? weddingDate;
  final double balance;
  final bool darkMode;

  const UserModel({
    required this.id,
    required this.fullName,
    this.firstName,
    this.midName,
    this.lastName,
    required this.username,
    required this.email,
    this.whatsapp,
    this.phone,
    this.avatar,
    this.avatarUrl,
    this.gender,
    this.address,
    this.weddingDate,
    this.balance = 0,
    this.darkMode = false,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as int,
      fullName: (json['full_name'] ?? json['name'] ?? '') as String,
      firstName: json['first_name'] as String?,
      midName: json['mid_name'] as String?,
      lastName: json['last_name'] as String?,
      username: (json['username'] ?? '') as String,
      email: (json['email'] ?? '') as String,
      whatsapp: json['whatsapp'] as String?,
      phone: json['phone'] as String?,
      avatar: json['avatar'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      gender: json['gender'] as String?,
      address: json['address'] as String?,
      weddingDate: json['wedding_date'] as String?,
      balance: (json['balance'] ?? 0).toDouble(),
      darkMode: json['dark_mode'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'full_name': fullName,
      'first_name': firstName,
      'mid_name': midName,
      'last_name': lastName,
      'username': username,
      'email': email,
      'whatsapp': whatsapp,
      'phone': phone,
      'avatar': avatar,
      'avatar_url': avatarUrl,
      'gender': gender,
      'address': address,
      'wedding_date': weddingDate,
      'balance': balance,
      'dark_mode': darkMode,
    };
  }

  UserModel copyWith({
    int? id,
    String? fullName,
    String? firstName,
    String? midName,
    String? lastName,
    String? username,
    String? email,
    String? whatsapp,
    String? phone,
    String? avatar,
    String? avatarUrl,
    String? gender,
    String? address,
    String? weddingDate,
    double? balance,
    bool? darkMode,
  }) {
    return UserModel(
      id: id ?? this.id,
      fullName: fullName ?? this.fullName,
      firstName: firstName ?? this.firstName,
      midName: midName ?? this.midName,
      lastName: lastName ?? this.lastName,
      username: username ?? this.username,
      email: email ?? this.email,
      whatsapp: whatsapp ?? this.whatsapp,
      phone: phone ?? this.phone,
      avatar: avatar ?? this.avatar,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      gender: gender ?? this.gender,
      address: address ?? this.address,
      weddingDate: weddingDate ?? this.weddingDate,
      balance: balance ?? this.balance,
      darkMode: darkMode ?? this.darkMode,
    );
  }
}
