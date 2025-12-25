import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../theme/app_theme.dart';
import '../i18n/language_provider.dart';

class LanguageToggle extends ConsumerWidget {
  const LanguageToggle({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final language = ref.watch(languageProvider);
    final isKorean = language == 'ko';

    return GestureDetector(
      onTap: () {
        ref.read(languageProvider.notifier).toggleLanguage();
      },
      child: Container(
        width: 120,
        height: 36,
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: AppTheme.bgCard,
          border: Border.all(
            color: Colors.white.withOpacity(0.05),
            width: 1,
          ),
          borderRadius: BorderRadius.circular(AppTheme.radiusPill),
        ),
        child: Stack(
          children: [
            // Animated slider
            AnimatedPositioned(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,
              left: isKorean ? 4 : 60,
              top: 4,
              bottom: 4,
              child: Container(
                width: 52,
                decoration: BoxDecoration(
                  color: AppTheme.accentGold,
                  borderRadius: BorderRadius.circular(AppTheme.radiusPill),
                  boxShadow: AppTheme.glowGold,
                ),
              ),
            ),
            // Text options
            Row(
              children: [
                Expanded(
                  child: Center(
                    child: Text(
                      '한글',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: isKorean ? AppTheme.bgApp : AppTheme.textMuted,
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: Center(
                    child: Text(
                      'EN',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: !isKorean ? AppTheme.bgApp : AppTheme.textMuted,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
