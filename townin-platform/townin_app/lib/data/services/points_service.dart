import '../../core/api/api_client.dart';

class PointsService {
  final ApiClient _apiClient;

  PointsService(this._apiClient);

  // Get points balance
  Future<Map<String, dynamic>> getBalance() async {
    final response = await _apiClient.get('/points/balance');
    return response.data;
  }

  // Get transaction history
  Future<TransactionListResponse> getTransactions({
    int page = 1,
    int limit = 20,
    String? type, // 'earn' | 'spend' | 'expire'
  }) async {
    final queryParams = {
      'page': page,
      'limit': limit,
    };

    if (type != null && type.isNotEmpty) {
      queryParams['type'] = type;
    }

    final response = await _apiClient.get(
      '/points/transactions',
      queryParameters: queryParams,
    );

    return TransactionListResponse.fromJson(response.data);
  }

  // Get points summary statistics
  Future<Map<String, dynamic>> getPointsSummary() async {
    final response = await _apiClient.get('/points/summary');
    return response.data;
  }
}

class TransactionListResponse {
  final List<Map<String, dynamic>> data;
  final int total;
  final int page;
  final int limit;
  final bool hasMore;

  TransactionListResponse({
    required this.data,
    required this.total,
    required this.page,
    required this.limit,
    required this.hasMore,
  });

  factory TransactionListResponse.fromJson(Map<String, dynamic> json) {
    final data = (json['data'] as List)
        .map((e) => e as Map<String, dynamic>)
        .toList();
    final total = json['total'] ?? 0;
    final page = json['page'] ?? 1;
    final limit = json['limit'] ?? 20;

    return TransactionListResponse(
      data: data,
      total: total,
      page: page,
      limit: limit,
      hasMore: data.length >= limit,
    );
  }
}
