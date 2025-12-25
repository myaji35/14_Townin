import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/models/flyer_model.dart';
import '../data/flyer_api_service.dart';

class FlyerDetailScreen extends StatefulWidget {
  final String flyerId;

  const FlyerDetailScreen({
    Key? key,
    required this.flyerId,
  }) : super(key: key);

  @override
  State<FlyerDetailScreen> createState() => _FlyerDetailScreenState();
}

class _FlyerDetailScreenState extends State<FlyerDetailScreen> {
  final FlyerApiService _apiService = FlyerApiService();
  FlyerModel? _flyer;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadFlyer();
    _trackView();
  }

  Future<void> _loadFlyer() async {
    try {
      final flyer = await _apiService.getFlyerById(widget.flyerId);
      setState(() {
        _flyer = flyer;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _trackView() async {
    await _apiService.trackFlyerView(widget.flyerId);
  }

  Future<void> _trackClick() async {
    await _apiService.trackFlyerClick(widget.flyerId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.error_outline,
                        size: 64,
                        color: Colors.grey[400],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _error!,
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey[600],
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          setState(() {
                            _isLoading = true;
                            _error = null;
                          });
                          _loadFlyer();
                        },
                        child: const Text('다시 시도'),
                      ),
                    ],
                  ),
                )
              : _buildContent(),
    );
  }

  Widget _buildContent() {
    if (_flyer == null) return const SizedBox.shrink();

    return CustomScrollView(
      slivers: [
        // App Bar with Image
        SliverAppBar(
          expandedHeight: 300,
          pinned: true,
          flexibleSpace: FlexibleSpaceBar(
            background: Image.network(
              _flyer!.imageUrl,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  color: Colors.grey[300],
                  child: const Icon(
                    Icons.image_not_supported,
                    size: 64,
                    color: Colors.grey,
                  ),
                );
              },
            ),
          ),
        ),

        // Content
        SliverToBoxAdapter(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Category Badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: _getCategoryColor(_flyer!.category),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        _flyer!.categoryDisplayName,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Title
                    Text(
                      _flyer!.title,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    const SizedBox(height: 8),

                    // Stats Row
                    Row(
                      children: [
                        _buildStatChip(
                          Icons.visibility_outlined,
                          '${_flyer!.viewCount}',
                          '조회',
                        ),
                        const SizedBox(width: 8),
                        _buildStatChip(
                          Icons.touch_app_outlined,
                          '${_flyer!.clickCount}',
                          '클릭',
                        ),
                        const Spacer(),
                        Text(
                          DateFormat('yyyy.MM.dd').format(_flyer!.createdAt),
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const Divider(height: 1, thickness: 8),

              // Description
              if (_flyer!.description != null)
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '상세 정보',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        _flyer!.description!,
                        style: const TextStyle(
                          fontSize: 16,
                          height: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),

              const Divider(height: 1, thickness: 8),

              // Merchant Info
              if (_flyer!.merchant != null)
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '상인 정보',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      _buildInfoRow(
                        Icons.store,
                        '상호명',
                        _flyer!.merchant!.businessName,
                      ),
                      if (_flyer!.merchant!.phoneNumber != null)
                        _buildInfoRow(
                          Icons.phone,
                          '전화번호',
                          _flyer!.merchant!.phoneNumber!,
                        ),
                      if (_flyer!.merchant!.address != null)
                        _buildInfoRow(
                          Icons.location_on,
                          '주소',
                          _flyer!.merchant!.address!,
                        ),
                    ],
                  ),
                ),

              const Divider(height: 1, thickness: 8),

              // Additional Info
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '추가 정보',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildInfoRow(
                      Icons.radar,
                      '타겟 반경',
                      '${(_flyer!.targetRadius / 1000).toStringAsFixed(1)}km',
                    ),
                    if (_flyer!.startDate != null)
                      _buildInfoRow(
                        Icons.calendar_today,
                        '시작일',
                        DateFormat('yyyy년 MM월 dd일').format(_flyer!.startDate!),
                      ),
                    if (_flyer!.expiresAt != null)
                      _buildInfoRow(
                        Icons.event_busy,
                        '만료일',
                        DateFormat('yyyy년 MM월 dd일').format(_flyer!.expiresAt!),
                      ),
                  ],
                ),
              ),

              const SizedBox(height: 100), // Bottom padding for FAB
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatChip(IconData icon, String value, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.grey[700]),
          const SizedBox(width: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: Colors.grey[800],
            ),
          ),
          const SizedBox(width: 2),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: Colors.grey[600]),
          const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
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
}
