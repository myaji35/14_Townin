import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'presentation/auth/login_screen.dart';
import 'presentation/auth/register_screen.dart';
import 'presentation/home/home_screen.dart';
import 'presentation/home/hub_management_screen.dart';
import 'presentation/points/points_history_screen.dart';
import 'presentation/flyer/flyer_search_screen.dart';
import 'presentation/merchant/merchant_onboarding_screen.dart';
import 'presentation/merchant/digital_signboard_screen.dart';
import 'presentation/guard/security_guard_dashboard_screen.dart';
import 'presentation/maps/safety_map_screen.dart';
import 'presentation/maps/parking_map_screen.dart';
import 'presentation/maps/risk_map_screen.dart';
import 'presentation/maps/life_map_screen.dart';
import 'presentation/ar/ar_flyer_viewer_screen.dart';

void main() {
  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Townin Platform',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      // 홈 화면부터 시작 (테스트용)
      home: const HomeScreen(),
      // 라우팅 설정
      routes: {
        '/login': (context) => const LoginScreen(),
        '/register': (context) => const RegisterScreen(),
        '/home': (context) => const HomeScreen(),
        '/hubs': (context) => const HubManagementScreen(),
        '/points': (context) => const PointsHistoryScreen(),
        '/flyer-search': (context) => const FlyerSearchScreen(),
        '/merchant-onboarding': (context) => const MerchantOnboardingScreen(),
        '/digital-signboard': (context) => const DigitalSignboardScreen(),
        '/guard-dashboard': (context) => const SecurityGuardDashboardScreen(),
        // PUBLIC DATA MAPS
        '/safety-map': (context) => const SafetyMapScreen(),
        '/parking-map': (context) => const ParkingMapScreen(),
        '/risk-map': (context) => const RiskMapScreen(),
        '/life-map': (context) => const LifeMapScreen(),
        // AR
        '/ar-viewer': (context) => const ARFlyerViewerScreen(),
      },
    );
  }
}

