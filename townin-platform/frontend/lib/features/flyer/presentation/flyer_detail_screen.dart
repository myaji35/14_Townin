import 'package:flutter/material.dart';
import '../data/flyer_repository.dart';

class FlyerDetailScreen extends StatefulWidget {
  final String flyerId;
  final String flyerTitle;

  const FlyerDetailScreen({
    super.key,
    required this.flyerId,
    required this.flyerTitle,
  });

  @override
  State<FlyerDetailScreen> createState() => _FlyerDetailScreenState();
}

class _FlyerDetailScreenState extends State<FlyerDetailScreen> {
  final _flyerRepository = FlyerRepository();

  Map<String, dynamic>? _flyerData;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadFlyerData();
    // Increment view count when screen opens
    _flyerRepository.incrementViewCount(widget.flyerId);
  }

  Future<void> _loadFlyerData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final data = await _flyerRepository.getFlyerById(widget.flyerId);

      setState(() {
        _flyerData = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: Text(widget.flyerTitle),
        backgroundColor: const Color(0xFF6366F1),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {
              // TODO: Implement share functionality
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('오류가 발생했습니다: $_error'),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadFlyerData,
                        child: const Text('다시 시도'),
                      ),
                    ],
                  ),
                )
              : SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Flyer Image
                      AspectRatio(
                        aspectRatio: 4 / 3,
                        child: Image.network(
                          _flyerData?['imageUrl'] ?? '',
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              color: Colors.grey[300],
                              child: const Icon(
                                Icons.image_not_supported,
                                size: 80,
                                color: Colors.grey,
                              ),
                            );
                          },
                        ),
                      ),

                      // Flyer Info
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Title
                            Text(
                              _flyerData?['title'] ?? '',
                              style: Theme.of(context)
                                  .textTheme
                                  .headlineSmall
                                  ?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                            const SizedBox(height: 8),

                            // Description
                            if (_flyerData?['description'] != null)
                              Text(
                                _flyerData!['description'],
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyLarge
                                    ?.copyWith(
                                      color: Colors.grey[600],
                                    ),
                              ),
                            const SizedBox(height: 16),

                            // Merchant Info
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.grey[300]!),
                              ),
                              child: Row(
                                children: [
                                  const Icon(
                                    Icons.store,
                                    color: Color(0xFF6366F1),
                                    size: 24,
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      _flyerData?['merchant']?['businessName'] ?? '알 수 없음',
                                      style: Theme.of(context)
                                          .textTheme
                                          .titleMedium
                                          ?.copyWith(
                                            fontWeight: FontWeight.w600,
                                          ),
                                    ),
                                  ),
                                  Row(
                                    children: [
                                      Icon(
                                        Icons.visibility,
                                        size: 16,
                                        color: Colors.grey[600],
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        '${_flyerData?['viewCount'] ?? 0}',
                                        style: TextStyle(
                                          color: Colors.grey[600],
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 24),

                            // Products Section
                            if (_flyerData?['products'] != null &&
                                (_flyerData!['products'] as List).isNotEmpty) ...[
                              Text(
                                '특가 상품',
                                style: Theme.of(context)
                                    .textTheme
                                    .titleLarge
                                    ?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                              const SizedBox(height: 12),

                              // Products List
                              ...(_flyerData!['products'] as List)
                                  .map((product) => _buildProductCard(product))
                                  .toList(),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildProductCard(Map<String, dynamic> product) {
    final price = product['price'];
    final originalPrice = product['originalPrice'];
    final hasDiscount = originalPrice != null && originalPrice > price;
    final discountPercent = hasDiscount
        ? ((originalPrice - price) / originalPrice * 100).round()
        : 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Product Image Placeholder
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              _getCategoryIcon(product['category']),
              size: 40,
              color: Colors.grey[400],
            ),
          ),
          const SizedBox(width: 16),

          // Product Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Product Name
                Text(
                  product['productName'] ?? '',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 4),

                // Promotion Tag
                if (product['promotion'] != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEF4444).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      product['promotion'],
                      style: const TextStyle(
                        color: Color(0xFFEF4444),
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                const SizedBox(height: 8),

                // Price Row
                Row(
                  children: [
                    if (hasDiscount) ...[
                      Text(
                        '₩${originalPrice.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}',
                        style: TextStyle(
                          decoration: TextDecoration.lineThrough,
                          color: Colors.grey[600],
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEF4444),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '$discountPercent%',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                    ],
                    Text(
                      '₩${price.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF6366F1),
                          ),
                    ),
                  ],
                ),

                // Unit
                if (product['unit'] != null)
                  Text(
                    product['unit'],
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 14,
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  IconData _getCategoryIcon(String? category) {
    switch (category) {
      case 'fruits':
        return Icons.apple;
      case 'household':
        return Icons.cleaning_services;
      case 'food':
        return Icons.restaurant;
      case 'beverage':
        return Icons.local_drink;
      default:
        return Icons.shopping_bag;
    }
  }
}
