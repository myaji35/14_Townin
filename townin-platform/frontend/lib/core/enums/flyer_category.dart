enum FlyerCategory {
  food,
  fashion,
  beauty,
  education,
  health,
  entertainment,
  service,
  other;

  String get displayName {
    switch (this) {
      case FlyerCategory.food:
        return '음식';
      case FlyerCategory.fashion:
        return '패션';
      case FlyerCategory.beauty:
        return '뷰티';
      case FlyerCategory.education:
        return '교육';
      case FlyerCategory.health:
        return '건강';
      case FlyerCategory.entertainment:
        return '엔터테인먼트';
      case FlyerCategory.service:
        return '서비스';
      case FlyerCategory.other:
        return '기타';
    }
  }

  static FlyerCategory fromString(String value) {
    return FlyerCategory.values.firstWhere(
      (e) => e.name == value,
      orElse: () => FlyerCategory.other,
    );
  }
}
