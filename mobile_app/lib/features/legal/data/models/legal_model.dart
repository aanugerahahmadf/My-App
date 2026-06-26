class FaqItem {
  final String? question;
  final String? answer;

  const FaqItem({this.question, this.answer});

  factory FaqItem.fromJson(Map<String, dynamic> json) {
    return FaqItem(
      question: json['question'] as String? ?? json['q'] as String?,
      answer: json['answer'] as String? ?? json['a'] as String?,
    );
  }
}

class HelpModel {
  final String title;
  final String? subtitle;
  final List<FaqItem> faqs;
  final dynamic contactOptions;

  const HelpModel({
    this.title = 'Help Center',
    this.subtitle,
    this.faqs = const [],
    this.contactOptions,
  });

  factory HelpModel.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>? ?? json;
    final faqsList = data['faqs'] as List? ?? [];
    return HelpModel(
      title: (data['title'] ?? 'Help Center') as String,
      subtitle: data['subtitle'] as String?,
      faqs: faqsList.map((e) => FaqItem.fromJson(e as Map<String, dynamic>)).toList(),
      contactOptions: data['contact_options'],
    );
  }
}

class LegalContent {
  final int? id;
  final String title;
  final dynamic content;
  final String? updatedAt;

  const LegalContent({this.id, required this.title, this.content, this.updatedAt});

  factory LegalContent.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>? ?? json;
    return LegalContent(
      id: data['id'] as int?,
      title: (data['title'] ?? '') as String,
      content: data['content'],
      updatedAt: data['updated_at'] as String?,
    );
  }
}

class AboutModel {
  final String title;
  final String? content;
  final String? mission;
  final String? owner;

  const AboutModel({
    this.title = 'About WeddingApp',
    this.content,
    this.mission,
    this.owner,
  });

  factory AboutModel.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>? ?? json;
    return AboutModel(
      title: (data['title'] ?? 'About WeddingApp') as String,
      content: data['content'] as String?,
      mission: data['mission'] as String?,
      owner: data['owner'] as String?,
    );
  }
}
