import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/models/flyer_model.dart';

class FlyerCard extends StatelessWidget {
  final FlyerModel flyer;
  final VoidCallback onTap;
  final bool? isFavorited;
  final VoidCallback? onFavoriteToggle;
  final VoidCallback? onShare;

  const FlyerCard({
    Key? key,
    required this.flyer,
    required this.onTap,
    this.isFavorited,
    this.onFavoriteToggle,
    this.onShare,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      clipBehavior: Clip.antiAlias,
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Flyer Image with Favorite Button
            Stack(
              children: [
                AspectRatio(
                  aspectRatio: 16 / 9,
                  child: Image.network(
                flyer.imageUrl,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    color: Colors.grey[300],
                    child: const Icon(
                      Icons.image_not_supported,
                      size: 48,
                      color: Colors.grey,
                    ),
                  );
                },
                loadingBuilder: (context, child, loadingProgress) {
                  if (loadingProgress == null) return child;
                  return Container(
                    color: Colors.grey[200],
                    child: Center(
                      child: CircularProgressIndicator(
                        value: loadingProgress.expectedTotalBytes != null
                            ? loadingProgress.cumulativeBytesLoaded /
                                loadingProgress.expectedTotalBytes!
                            : null,
                      ),
                    ),
                  );
                },
                  ),
                ),
                // Favorite Button (top right)
                if (onFavoriteToggle != null)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Material(
                      color: Colors.white,
                      shape: const CircleBorder(),
                      elevation: 2,
                      child: InkWell(
                        onTap: onFavoriteToggle,
                        customBorder: const CircleBorder(),
                        child: Padding(
                          padding: const EdgeInsets.all(8),
                          child: Icon(
                            isFavorited == true
                                ? Icons.favorite
                                : Icons.favorite_border,
                            color: isFavorited == true ? Colors.red : Colors.grey[600],
                            size: 24,
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),

            // Content
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category Badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: _getCategoryColor(flyer.category),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      flyer.categoryDisplayName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),

                  const SizedBox(height: 8),

                  // Title
                  Text(
                    flyer.title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),

                  if (flyer.description != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      flyer.description!,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[700],
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],

                  const SizedBox(height: 8),

                  // Merchant Info
                  if (flyer.merchant != null)
                    Row(
                      children: [
                        Icon(
                          Icons.store,
                          size: 16,
                          color: Colors.grey[600],
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            flyer.merchant!.businessName,
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey[600],
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),

                  const SizedBox(height: 8),

                  // Stats Row
                  Row(
                    children: [
                      _buildStatItem(
                        Icons.visibility_outlined,
                        _formatCount(flyer.viewCount),
                      ),
                      const SizedBox(width: 12),
                      _buildStatItem(
                        Icons.touch_app_outlined,
                        _formatCount(flyer.clickCount),
                      ),
                      const Spacer(),
                      // Share button
                      if (onShare != null)
                        IconButton(
                          icon: Icon(
                            Icons.share_outlined,
                            size: 20,
                            color: Colors.grey[600],
                          ),
                          onPressed: onShare,
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                        ),
                      const SizedBox(width: 8),
                      Text(
                        _formatDate(flyer.createdAt),
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[500],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(IconData icon, String count) {
    return Row(
      children: [
        Icon(icon, size: 16, color: Colors.grey[600]),
        const SizedBox(width: 4),
        Text(
          count,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  Color _getCategoryColor(category) {
    switch (category.name) {
      case 'food':
        return Colors.orange;
      case 'fashion':
        return Colors.purple;
      case 'beauty':
        return Colors.pink;
      case 'education':
        return Colors.blue;
      case 'health':
        return Colors.green;
      case 'entertainment':
        return Colors.red;
      case 'service':
        return Colors.teal;
      default:
        return Colors.grey;
    }
  }

  String _formatCount(int count) {
    if (count >= 1000) {
      return '${(count / 1000).toStringAsFixed(1)}k';
    }
    return count.toString();
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays > 7) {
      return DateFormat('yyyy.MM.dd').format(date);
    } else if (difference.inDays > 0) {
      return '${difference.inDays}일 전';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}시간 전';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}분 전';
    } else {
      return '방금 전';
    }
  }
}
