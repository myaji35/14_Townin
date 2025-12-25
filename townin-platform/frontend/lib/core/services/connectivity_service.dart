import 'dart:async';
import 'package:dio/dio.dart';

class ConnectivityService {
  static final ConnectivityService _instance = ConnectivityService._internal();
  factory ConnectivityService() => _instance;
  ConnectivityService._internal();

  bool _isOnline = true;
  final _statusController = StreamController<bool>.broadcast();

  bool get isOnline => _isOnline;
  Stream<bool> get onConnectivityChanged => _statusController.stream;

  Future<void> initialize() async {
    // Check initial connectivity
    await checkConnectivity();

    // Periodically check connectivity (every 30 seconds)
    Timer.periodic(const Duration(seconds: 30), (timer) {
      checkConnectivity();
    });
  }

  Future<bool> checkConnectivity() async {
    try {
      final dio = Dio();
      dio.options.connectTimeout = const Duration(seconds: 5);
      dio.options.receiveTimeout = const Duration(seconds: 5);

      // Try to ping a reliable server (Google DNS)
      final response = await dio.get('https://www.google.com');

      final wasOffline = !_isOnline;
      _isOnline = response.statusCode == 200;

      if (wasOffline && _isOnline) {
        print('Connection restored');
        _statusController.add(true);
      } else if (!wasOffline && !_isOnline) {
        print('Connection lost');
        _statusController.add(false);
      }

      return _isOnline;
    } catch (e) {
      final wasOnline = _isOnline;
      _isOnline = false;

      if (wasOnline) {
        print('Connection lost');
        _statusController.add(false);
      }

      return false;
    }
  }

  void dispose() {
    _statusController.close();
  }
}
