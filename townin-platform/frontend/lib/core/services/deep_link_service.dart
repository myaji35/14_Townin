import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';
import 'package:flutter/material.dart';

class DeepLinkService {
  static final DeepLinkService _instance = DeepLinkService._internal();

  factory DeepLinkService() => _instance;

  DeepLinkService._internal();

  final FirebaseDynamicLinks _dynamicLinks = FirebaseDynamicLinks.instance;

  /// Initialize deep linking
  Future<void> initialize(BuildContext context) async {
    // Handle deep link when app is opened from terminated state
    final PendingDynamicLinkData? initialLink =
        await _dynamicLinks.getInitialLink();

    if (initialLink != null) {
      _handleDeepLink(initialLink.link, context);
    }

    // Handle deep link when app is in background or foreground
    _dynamicLinks.onLink.listen(
      (dynamicLinkData) {
        _handleDeepLink(dynamicLinkData.link, context);
      },
      onError: (error) {
        print('Deep link error: $error');
      },
    );
  }

  /// Create dynamic link for flyer
  Future<Uri> createFlyerLink(String flyerId, String flyerTitle) async {
    final DynamicLinkParameters parameters = DynamicLinkParameters(
      uriPrefix: 'https://townin.page.link', // Your Firebase Dynamic Links domain
      link: Uri.parse('https://townin.kr/flyers/$flyerId'),
      androidParameters: const AndroidParameters(
        packageName: 'kr.townin.app',
        minimumVersion: 1,
      ),
      iosParameters: const IOSParameters(
        bundleId: 'kr.townin.app',
        minimumVersion: '1.0.0',
        appStoreId: '123456789', // Your App Store ID
      ),
      socialMetaTagParameters: SocialMetaTagParameters(
        title: flyerTitle,
        description: 'Townin에서 확인하세요',
        imageUrl: Uri.parse('https://townin.kr/og-image.jpg'),
      ),
    );

    final ShortDynamicLink shortLink =
        await _dynamicLinks.buildShortLink(parameters);

    return shortLink.shortUrl;
  }

  /// Handle incoming deep link
  void _handleDeepLink(Uri deepLink, BuildContext context) {
    print('Received deep link: $deepLink');

    final path = deepLink.path;
    final queryParams = deepLink.queryParameters;

    if (path.contains('/flyers/')) {
      // Extract flyer ID from path
      final flyerId = path.split('/').last;
      _navigateToFlyer(context, flyerId);
    } else if (queryParams.containsKey('flyerId')) {
      // Extract flyer ID from query parameter
      final flyerId = queryParams['flyerId']!;
      _navigateToFlyer(context, flyerId);
    } else if (path.contains('/favorites')) {
      _navigateToFavorites(context);
    } else if (path.contains('/map')) {
      _navigateToMap(context);
    } else {
      // Unknown path - navigate to home
      _navigateToHome(context);
    }
  }

  /// Navigate to flyer detail
  void _navigateToFlyer(BuildContext context, String flyerId) {
    // TODO: Import and use actual FlyerDetailScreen
    // Navigator.of(context).pushNamed('/flyer/$flyerId');
    print('Navigate to flyer: $flyerId');
  }

  /// Navigate to favorites
  void _navigateToFavorites(BuildContext context) {
    // TODO: Import and use actual FavoritesScreen
    // Navigator.of(context).pushNamed('/favorites');
    print('Navigate to favorites');
  }

  /// Navigate to map
  void _navigateToMap(BuildContext context) {
    // TODO: Import and use actual MapScreen
    // Navigator.of(context).pushNamed('/map');
    print('Navigate to map');
  }

  /// Navigate to home
  void _navigateToHome(BuildContext context) {
    // TODO: Navigate to home screen
    // Navigator.of(context).pushNamed('/');
    print('Navigate to home');
  }
}
