import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
// import 'package:firebase_core/firebase_core.dart';
// import 'package:firebase_messaging/firebase_messaging.dart';
import 'features/auth/presentation/login_screen.dart';
import 'features/flyers/bloc/flyer_bloc.dart';
import 'features/favorites/bloc/favorite_bloc.dart';
import 'features/dashboard/user/user_dashboard.dart';
import 'features/dashboard/super_admin/super_admin_dashboard.dart';
// import 'features/dashboard/merchant/merchant_dashboard.dart';
import 'features/dashboard/test_dashboard.dart';
// import 'core/services/notification_service.dart';
// import 'core/services/push_notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase (temporarily disabled for web compatibility)
  // await Firebase.initializeApp();

  // Register background message handler
  // FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

  // Initialize NotificationService
  // await NotificationService().initialize();

  // Initialize PushNotificationService
  // await PushNotificationService().initialize();

  runApp(const TowninApp());
}

class TowninApp extends StatelessWidget {
  const TowninApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<FlyerBloc>(
          create: (context) => FlyerBloc(),
        ),
        BlocProvider<FavoriteBloc>(
          create: (context) => FavoriteBloc(),
        ),
      ],
      child: MaterialApp(
        title: 'Townin',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF6366F1),
          ),
          useMaterial3: true,
          // fontFamily: 'Pretendard',
        ),
        initialRoute: '/test',
        routes: {
          '/': (context) => const LoginScreen(),
          '/test': (context) => const TestDashboard(),
          '/user': (context) => const UserDashboard(),
          '/admin': (context) => const SuperAdminDashboard(),
          // '/merchant': (context) => const MerchantDashboard(),
        },
      ),
    );
  }
}
