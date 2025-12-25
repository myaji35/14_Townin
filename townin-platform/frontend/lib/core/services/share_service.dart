import 'package:share_plus/share_plus.dart';
import '../models/flyer_model.dart';
import 'deep_link_service.dart';

class ShareService {
  /// Share flyer with Deep Link
  static Future<void> shareFlyer(FlyerModel flyer) async {
    try {
      // Create dynamic link
      final dynamicLink = await DeepLinkService().createFlyerLink(
        flyer.id,
        flyer.title,
      );

      final text = _buildShareTextWithLink(flyer, dynamicLink.toString());

      // Share with text only
      // Note: To share with image, would need to download and cache image first
      await Share.share(
        text,
        subject: flyer.title,
      );
    } catch (e) {
      throw Exception('공유 중 오류가 발생했습니다: $e');
    }
  }

  /// Share flyer with image
  static Future<void> shareFlyerWithImage(
    FlyerModel flyer,
    String imagePath,
  ) async {
    try {
      final text = _buildShareText(flyer);

      await Share.shareXFiles(
        [XFile(imagePath)],
        text: text,
        subject: flyer.title,
      );
    } catch (e) {
      throw Exception('공유 중 오류가 발생했습니다: $e');
    }
  }

  /// Share flyer with URL only (for deep linking)
  static Future<void> shareFlyerUrl(String flyerId, String title) async {
    try {
      final url = 'https://townin.kr/flyers/$flyerId';
      final text = '$title\n\n$url에서 자세히 보기';

      await Share.share(text);
    } catch (e) {
      throw Exception('공유 중 오류가 발생했습니다: $e');
    }
  }

  /// Build share text from flyer data
  static String _buildShareText(FlyerModel flyer) {
    final buffer = StringBuffer();

    // Title
    buffer.writeln(flyer.title);
    buffer.writeln();

    // Description
    if (flyer.description != null && flyer.description!.isNotEmpty) {
      buffer.writeln(flyer.description);
      buffer.writeln();
    }

    // Merchant info
    if (flyer.merchant != null) {
      buffer.writeln('🏪 ${flyer.merchant!.businessName}');
      if (flyer.merchant!.address != null) {
        buffer.writeln('📍 ${flyer.merchant!.address}');
      }
      buffer.writeln();
    }

    // Category
    buffer.writeln('🏷️ ${flyer.categoryDisplayName}');

    // Deep link (when implemented)
    buffer.writeln();
    buffer.writeln('자세히 보기: https://townin.kr/flyers/${flyer.id}');
    buffer.writeln();
    buffer.writeln('📱 Townin - 우리 동네 생활 정보');

    return buffer.toString();
  }

  /// Build share text with dynamic link
  static String _buildShareTextWithLink(FlyerModel flyer, String link) {
    final buffer = StringBuffer();

    // Title
    buffer.writeln(flyer.title);
    buffer.writeln();

    // Description
    if (flyer.description != null && flyer.description!.isNotEmpty) {
      buffer.writeln(flyer.description);
      buffer.writeln();
    }

    // Merchant info
    if (flyer.merchant != null) {
      buffer.writeln('🏪 ${flyer.merchant!.businessName}');
    }

    // Dynamic link
    buffer.writeln();
    buffer.writeln('앱에서 보기: $link');
    buffer.writeln();
    buffer.writeln('📱 Townin - 우리 동네 생활 정보');

    return buffer.toString();
  }

  /// Share result callback
  static Future<void> shareFlyerWithResult(
    FlyerModel flyer,
    Function(ShareResult)? onResult,
  ) async {
    try {
      final text = _buildShareText(flyer);

      final result = await Share.shareWithResult(
        text,
        subject: flyer.title,
      );

      if (onResult != null) {
        onResult(result);
      }
    } catch (e) {
      throw Exception('공유 중 오류가 발생했습니다: $e');
    }
  }
}
