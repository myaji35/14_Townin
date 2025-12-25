import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/models/flyer_model.dart';
import '../../../core/enums/flyer_status.dart';

class FlyerApprovalScreen extends StatefulWidget {
  const FlyerApprovalScreen({Key? key}) : super(key: key);

  @override
  State<FlyerApprovalScreen> createState() => _FlyerApprovalScreenState();
}

class _FlyerApprovalScreenState extends State<FlyerApprovalScreen> {
  final Dio _dio = DioClient().dio;
  List<FlyerModel> _pendingFlyers = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadPendingFlyers();
  }

  Future<void> _loadPendingFlyers() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await _dio.get('${ApiConstants.flyers}/admin/pending');

      final List<dynamic> data = response.data['data'] ?? [];
      setState(() {
        _pendingFlyers = data.map((json) => FlyerModel.fromJson(json)).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = '전단지 목록을 불러오는데 실패했습니다: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _approveFlyer(String flyerId) async {
    try {
      await _dio.post('${ApiConstants.flyers}/admin/$flyerId/approve');

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('전단지가 승인되었습니다'),
            backgroundColor: Colors.green,
          ),
        );
        _loadPendingFlyers();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('승인 실패: $e')),
        );
      }
    }
  }

  Future<void> _rejectFlyer(String flyerId, String? reason) async {
    try {
      await _dio.post(
        '${ApiConstants.flyers}/admin/$flyerId/reject',
        data: {'reason': reason},
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('전단지가 거부되었습니다'),
            backgroundColor: Colors.orange,
          ),
        );
        _loadPendingFlyers();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('거부 실패: $e')),
        );
      }
    }
  }

  void _showRejectDialog(String flyerId) {
    final TextEditingController reasonController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('전단지 거부'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('거부 사유를 입력해주세요:'),
            const SizedBox(height: 12),
            TextField(
              controller: reasonController,
              maxLines: 3,
              decoration: const InputDecoration(
                hintText: '예: 부적절한 콘텐츠',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _rejectFlyer(flyerId, reasonController.text);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('거부'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('전단지 승인 관리'),
        backgroundColor: const Color(0xFF6366F1),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadPendingFlyers,
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(_error!, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadPendingFlyers,
              child: const Text('다시 시도'),
            ),
          ],
        ),
      );
    }

    if (_pendingFlyers.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.check_circle_outline, size: 64, color: Colors.green[300]),
            const SizedBox(height: 16),
            const Text(
              '승인 대기중인 전단지가 없습니다',
              style: TextStyle(fontSize: 16),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadPendingFlyers,
      child: ListView.builder(
        padding: const EdgeInsets.all(8),
        itemCount: _pendingFlyers.length,
        itemBuilder: (context, index) {
          final flyer = _pendingFlyers[index];
          return _buildFlyerCard(flyer);
        },
      ),
    );
  }

  Widget _buildFlyerCard(FlyerModel flyer) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Flyer Image
          if (flyer.imageUrl.isNotEmpty)
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
              child: AspectRatio(
                aspectRatio: 16 / 9,
                child: Image.network(
                  flyer.imageUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      color: Colors.grey[300],
                      child: const Icon(Icons.broken_image, size: 48),
                    );
                  },
                ),
              ),
            ),

          // Flyer Info
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title
                Text(
                  flyer.title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),

                // Description
                if (flyer.description != null && flyer.description!.isNotEmpty)
                  Text(
                    flyer.description!,
                    style: TextStyle(color: Colors.grey[700]),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                const SizedBox(height: 12),

                // Merchant Info
                if (flyer.merchant != null)
                  Row(
                    children: [
                      Icon(Icons.store, size: 16, color: Colors.grey[600]),
                      const SizedBox(width: 4),
                      Text(
                        flyer.merchant!.businessName,
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                    ],
                  ),
                const SizedBox(height: 8),

                // Category
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.blue[50],
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    flyer.categoryDisplayName,
                    style: const TextStyle(fontSize: 12, color: Colors.blue),
                  ),
                ),
              ],
            ),
          ),

          // Action Buttons
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton.icon(
                  onPressed: () => _showRejectDialog(flyer.id),
                  icon: const Icon(Icons.close, size: 18),
                  label: const Text('거부'),
                  style: TextButton.styleFrom(foregroundColor: Colors.red),
                ),
                const SizedBox(width: 8),
                ElevatedButton.icon(
                  onPressed: () => _approveFlyer(flyer.id),
                  icon: const Icon(Icons.check, size: 18),
                  label: const Text('승인'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
