import 'package:sqflite/sqflite.dart';
import '../../../core/database/database_helper.dart';

class FlyerCacheRepository {
  final DatabaseHelper _dbHelper = DatabaseHelper();

  // Cache a flyer with its products
  Future<void> cacheFlyer(Map<String, dynamic> flyerData) async {
    final db = await _dbHelper.database;

    await db.transaction((txn) async {
      // Cache flyer
      await txn.insert(
        'flyers',
        {
          'id': flyerData['id'],
          'merchant_id': flyerData['merchantId'],
          'merchant_name': flyerData['merchant']?['businessName'],
          'title': flyerData['title'],
          'description': flyerData['description'],
          'image_url': flyerData['imageUrl'],
          'view_count': flyerData['viewCount'] ?? 0,
          'click_count': flyerData['clickCount'] ?? 0,
          'is_active': flyerData['isActive'] ? 1 : 0,
          'valid_from': flyerData['validFrom'],
          'valid_until': flyerData['validUntil'],
          'grid_cell': flyerData['gridCell'],
          'created_at': flyerData['createdAt'],
          'cached_at': DateTime.now().toIso8601String(),
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );

      // Cache products if available
      if (flyerData['products'] != null && flyerData['products'] is List) {
        for (var product in flyerData['products']) {
          await txn.insert(
            'flyer_products',
            {
              'id': product['id'],
              'flyer_id': flyerData['id'],
              'product_name': product['productName'],
              'price': product['price'],
              'original_price': product['originalPrice'],
              'promotion': product['promotion'],
              'category': product['category'],
              'display_order': product['displayOrder'] ?? 0,
            },
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        }
      }
    });
  }

  // Cache multiple flyers
  Future<void> cacheFlyers(List<Map<String, dynamic>> flyers) async {
    for (var flyer in flyers) {
      await cacheFlyer(flyer);
    }
  }

  // Get all cached flyers
  Future<List<Map<String, dynamic>>> getCachedFlyers() async {
    final db = await _dbHelper.database;

    final List<Map<String, dynamic>> flyerMaps = await db.query(
      'flyers',
      where: 'is_active = ?',
      whereArgs: [1],
      orderBy: 'created_at DESC',
    );

    return flyerMaps.map((flyerMap) {
      return {
        'id': flyerMap['id'],
        'merchantId': flyerMap['merchant_id'],
        'merchant': {
          'businessName': flyerMap['merchant_name'],
        },
        'title': flyerMap['title'],
        'description': flyerMap['description'],
        'imageUrl': flyerMap['image_url'],
        'viewCount': flyerMap['view_count'],
        'clickCount': flyerMap['click_count'],
        'isActive': flyerMap['is_active'] == 1,
        'validFrom': flyerMap['valid_from'],
        'validUntil': flyerMap['valid_until'],
        'gridCell': flyerMap['grid_cell'],
        'createdAt': flyerMap['created_at'],
      };
    }).toList();
  }

  // Get cached flyer by ID with products
  Future<Map<String, dynamic>?> getCachedFlyerById(String id) async {
    final db = await _dbHelper.database;

    final List<Map<String, dynamic>> flyerMaps = await db.query(
      'flyers',
      where: 'id = ?',
      whereArgs: [id],
      limit: 1,
    );

    if (flyerMaps.isEmpty) return null;

    final flyerMap = flyerMaps.first;

    // Get products
    final List<Map<String, dynamic>> productMaps = await db.query(
      'flyer_products',
      where: 'flyer_id = ?',
      whereArgs: [id],
      orderBy: 'display_order ASC',
    );

    return {
      'id': flyerMap['id'],
      'merchantId': flyerMap['merchant_id'],
      'merchant': {
        'businessName': flyerMap['merchant_name'],
      },
      'title': flyerMap['title'],
      'description': flyerMap['description'],
      'imageUrl': flyerMap['image_url'],
      'viewCount': flyerMap['view_count'],
      'clickCount': flyerMap['click_count'],
      'isActive': flyerMap['is_active'] == 1,
      'validFrom': flyerMap['valid_from'],
      'validUntil': flyerMap['valid_until'],
      'gridCell': flyerMap['grid_cell'],
      'createdAt': flyerMap['created_at'],
      'products': productMaps.map((productMap) {
        return {
          'id': productMap['id'],
          'productName': productMap['product_name'],
          'price': productMap['price'],
          'originalPrice': productMap['original_price'],
          'promotion': productMap['promotion'],
          'category': productMap['category'],
          'displayOrder': productMap['display_order'],
        };
      }).toList(),
    };
  }

  // Check if cache is stale (older than 1 hour)
  Future<bool> isCacheStale() async {
    final db = await _dbHelper.database;

    final List<Map<String, dynamic>> result = await db.query(
      'flyers',
      columns: ['cached_at'],
      orderBy: 'cached_at DESC',
      limit: 1,
    );

    if (result.isEmpty) return true;

    final cachedAt = DateTime.parse(result.first['cached_at'] as String);
    final now = DateTime.now();
    final difference = now.difference(cachedAt);

    return difference.inHours >= 1;
  }

  // Clear flyer cache
  Future<void> clearCache() async {
    final db = await _dbHelper.database;
    await db.delete('flyer_products');
    await db.delete('flyers');
  }
}
