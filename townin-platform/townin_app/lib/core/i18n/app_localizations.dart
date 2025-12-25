/// App Localizations for Korean and English
class AppLocalizations {
  final String languageCode;

  AppLocalizations(this.languageCode);

  static AppLocalizations of(String languageCode) {
    return AppLocalizations(languageCode);
  }

  // Common
  String get home => _getValue('home', ko: '홈', en: 'Home');
  String get digitalFlyers => _getValue('digitalFlyers', ko: 'Digital Flyers', en: 'Digital Flyers');
  String get safetyMap => _getValue('safetyMap', ko: '안전지도', en: 'Safety Map');
  String get flyers => _getValue('flyers', ko: '전단지', en: 'Flyers');
  String get points => _getValue('points', ko: '포인트', en: 'Points');
  String get myInfo => _getValue('myInfo', ko: '내정보', en: 'My Info');
  String get location => _getValue('location', ko: '위치', en: 'Location');
  String get notifications => _getValue('notifications', ko: '알림', en: 'Notifications');

  // Dashboard
  String get greeting => _getValue('greeting', ko: '환영합니다', en: 'Welcome');
  String get graphragTitle => _getValue('graphragTitle', ko: 'AI GraphRAG 분석 완료', en: 'AI GraphRAG Analysis Complete');
  String get graphragDescription => _getValue(
    'graphragDescription',
    ko: '2,340개의 로컬 전단지를 분석하여 맞춤형 추천을 제공합니다.',
    en: 'We\'ve analyzed 2,340 local flyers and personalized recommendations based on your preferences.',
  );
  String get recommendedForYou => _getValue('recommendedForYou', ko: '이번 주 추천', en: 'This Week\'s Recommendations');
  String get loadMore => _getValue('loadMore', ko: '더 많은 전단지 보기', en: 'Load More Flyers');
  String get personalizedHelp => _getValue('personalizedHelp', ko: '맞춤형 도움', en: 'Personalized Help');
  String get earnPoints => _getValue('earnPoints', ko: '포인트 받기', en: 'Earn Points');

  // Badges
  String get badgeNew => _getValue('badgeNew', ko: 'NEW', en: 'NEW');
  String get badgeHot => _getValue('badgeHot', ko: 'HOT', en: 'HOT');
  String get badgeAiRecommended => _getValue('badgeAiRecommended', ko: 'AI 추천', en: 'AI Recommended');

  // Flyer
  String get distance => _getValue('distance', ko: '거리', en: 'Distance');
  String get category => _getValue('category', ko: '카테고리', en: 'Category');
  String get viewCount => _getValue('viewCount', ko: '조회수', en: 'Views');
  String get clickCount => _getValue('clickCount', ko: '클릭수', en: 'Clicks');

  // Location
  String get seoul => _getValue('seoul', ko: '서울', en: 'Seoul');
  String get gangnam => _getValue('gangnam', ko: '강남', en: 'Gangnam');
  String get seoulGangnam => _getValue('seoulGangnam', ko: 'Seoul, Gangnam', en: 'Seoul, Gangnam');

  // Helper method
  String _getValue(String key, {required String ko, required String en}) {
    return languageCode == 'ko' ? ko : en;
  }

  // Helper method for values with parameters
  String earnPointsValue(int points) {
    return languageCode == 'ko' ? '${points}P 받기' : 'Earn ${points}P';
  }
}
