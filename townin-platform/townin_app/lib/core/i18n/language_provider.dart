import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'app_localizations.dart';

/// Language state (ko or en)
final languageProvider = StateNotifierProvider<LanguageNotifier, String>((ref) {
  return LanguageNotifier();
});

/// Localization provider
final localizationProvider = Provider<AppLocalizations>((ref) {
  final languageCode = ref.watch(languageProvider);
  return AppLocalizations(languageCode);
});

class LanguageNotifier extends StateNotifier<String> {
  static const String _key = 'townin-language';

  LanguageNotifier() : super('ko') {
    _loadLanguage();
  }

  Future<void> _loadLanguage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedLanguage = prefs.getString(_key);
      if (savedLanguage != null && (savedLanguage == 'ko' || savedLanguage == 'en')) {
        state = savedLanguage;
      }
    } catch (e) {
      // If error, default to Korean
      state = 'ko';
    }
  }

  Future<void> setLanguage(String languageCode) async {
    if (languageCode != 'ko' && languageCode != 'en') return;

    state = languageCode;

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_key, languageCode);
    } catch (e) {
      // Handle error silently
    }
  }

  void toggleLanguage() {
    setLanguage(state == 'ko' ? 'en' : 'ko');
  }
}
