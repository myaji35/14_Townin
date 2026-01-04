import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';

enum StoreStatus {
  open,
  closed,
  away,
  busy,
}

class DigitalSignboardScreen extends ConsumerStatefulWidget {
  const DigitalSignboardScreen({super.key});

  @override
  ConsumerState<DigitalSignboardScreen> createState() =>
      _DigitalSignboardScreenState();
}

class _DigitalSignboardScreenState
    extends ConsumerState<DigitalSignboardScreen> {
  StoreStatus _currentStatus = StoreStatus.open;
  String _customMessage = '';
  final _messageController = TextEditingController();

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  String _getStatusText(StoreStatus status) {
    switch (status) {
      case StoreStatus.open:
        return '영업 중';
      case StoreStatus.closed:
        return '영업 종료';
      case StoreStatus.away:
        return '잠시 자리 비움';
      case StoreStatus.busy:
        return '대기 중 (혼잡)';
    }
  }

  Color _getStatusColor(StoreStatus status) {
    switch (status) {
      case StoreStatus.open:
        return AppTheme.success;
      case StoreStatus.closed:
        return AppTheme.error;
      case StoreStatus.away:
        return AppTheme.warning;
      case StoreStatus.busy:
        return AppTheme.info;
    }
  }

  IconData _getStatusIcon(StoreStatus status) {
    switch (status) {
      case StoreStatus.open:
        return Icons.check_circle;
      case StoreStatus.closed:
        return Icons.cancel;
      case StoreStatus.away:
        return Icons.access_time;
      case StoreStatus.busy:
        return Icons.people;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgApp,
      appBar: AppBar(
        title: const Text('디지털 간판'),
        backgroundColor: AppTheme.bgSidebar,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.space4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 현재 상태 프리뷰
            _buildStatusPreview(),
            const SizedBox(height: AppTheme.space6),

            // 상태 선택
            const Text(
              '매장 상태 선택',
              style: TextStyle(
                color: AppTheme.textPrimary,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: AppTheme.space4),
            _buildStatusOptions(),
            const SizedBox(height: AppTheme.space6),

            // 메시지 입력
            const Text(
              '추가 메시지 (선택)',
              style: TextStyle(
                color: AppTheme.textPrimary,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: AppTheme.space4),
            _buildMessageInput(),
            const SizedBox(height: AppTheme.space6),

            // 저장 버튼
            _buildSaveButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusPreview() {
    return Container(
      padding: const EdgeInsets.all(AppTheme.space6),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            _getStatusColor(_currentStatus).withOpacity(0.2),
            _getStatusColor(_currentStatus).withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
        border: Border.all(
          color: _getStatusColor(_currentStatus).withOpacity(0.3),
          width: 2,
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppTheme.space3),
                decoration: BoxDecoration(
                  color: _getStatusColor(_currentStatus).withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  _getStatusIcon(_currentStatus),
                  color: _getStatusColor(_currentStatus),
                  size: 32,
                ),
              ),
              const SizedBox(width: AppTheme.space4),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '의정부 맛집',
                      style: TextStyle(
                        color: AppTheme.textSecondary,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: AppTheme.space1),
                    Text(
                      _getStatusText(_currentStatus),
                      style: TextStyle(
                        color: _getStatusColor(_currentStatus),
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (_customMessage.isNotEmpty) ...[
            const SizedBox(height: AppTheme.space4),
            Container(
              padding: const EdgeInsets.all(AppTheme.space3),
              decoration: BoxDecoration(
                color: AppTheme.bgCard,
                borderRadius: BorderRadius.circular(AppTheme.radiusMd),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.message,
                    color: AppTheme.accentGold,
                    size: 16,
                  ),
                  const SizedBox(width: AppTheme.space2),
                  Expanded(
                    child: Text(
                      _customMessage,
                      style: const TextStyle(
                        color: AppTheme.textPrimary,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatusOptions() {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: AppTheme.space3,
      mainAxisSpacing: AppTheme.space3,
      childAspectRatio: 1.2,
      children: StoreStatus.values.map((status) {
        final isSelected = _currentStatus == status;
        return GestureDetector(
          onTap: () {
            setState(() {
              _currentStatus = status;
            });
          },
          child: Container(
            padding: const EdgeInsets.all(AppTheme.space4),
            decoration: BoxDecoration(
              color: isSelected
                  ? _getStatusColor(status).withOpacity(0.15)
                  : AppTheme.bgCard,
              borderRadius: BorderRadius.circular(AppTheme.radiusMd),
              border: Border.all(
                color: isSelected
                    ? _getStatusColor(status)
                    : Colors.white.withOpacity(0.05),
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  _getStatusIcon(status),
                  color: isSelected
                      ? _getStatusColor(status)
                      : AppTheme.textMuted,
                  size: 40,
                ),
                const SizedBox(height: AppTheme.space3),
                Text(
                  _getStatusText(status),
                  style: TextStyle(
                    color: isSelected
                        ? _getStatusColor(status)
                        : AppTheme.textSecondary,
                    fontSize: 14,
                    fontWeight:
                        isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildMessageInput() {
    return Container(
      padding: const EdgeInsets.all(AppTheme.space4),
      decoration: BoxDecoration(
        color: AppTheme.bgCard,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        border: Border.all(
          color: Colors.white.withOpacity(0.05),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextField(
            controller: _messageController,
            maxLines: 3,
            maxLength: 100,
            style: const TextStyle(color: AppTheme.textPrimary),
            decoration: const InputDecoration(
              hintText: '예: "런치 세트 30% 할인 중입니다!"',
              hintStyle: TextStyle(color: AppTheme.textMuted),
              border: InputBorder.none,
              contentPadding: EdgeInsets.zero,
            ),
            onChanged: (value) {
              setState(() {
                _customMessage = value;
              });
            },
          ),
          const SizedBox(height: AppTheme.space3),
          Row(
            children: [
              _buildQuickMessageChip('점심시간 11:30-14:00'),
              const SizedBox(width: AppTheme.space2),
              _buildQuickMessageChip('오늘의 특선 메뉴'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickMessageChip(String message) {
    return GestureDetector(
      onTap: () {
        setState(() {
          _messageController.text = message;
          _customMessage = message;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppTheme.space3,
          vertical: AppTheme.space2,
        ),
        decoration: BoxDecoration(
          color: AppTheme.bgCardHover,
          borderRadius: BorderRadius.circular(AppTheme.radiusPill),
          border: Border.all(
            color: Colors.white.withOpacity(0.1),
          ),
        ),
        child: Text(
          message,
          style: const TextStyle(
            color: AppTheme.textSecondary,
            fontSize: 11,
          ),
        ),
      ),
    );
  }

  Widget _buildSaveButton() {
    return ElevatedButton(
      onPressed: () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${_getStatusText(_currentStatus)} 상태로 변경되었습니다'),
            backgroundColor: _getStatusColor(_currentStatus),
            behavior: SnackBarBehavior.floating,
          ),
        );
      },
      style: ElevatedButton.styleFrom(
        padding: const EdgeInsets.symmetric(vertical: 16),
        minimumSize: const Size(double.infinity, 56),
        backgroundColor: _getStatusColor(_currentStatus),
        foregroundColor: Colors.white,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(_getStatusIcon(_currentStatus)),
          const SizedBox(width: AppTheme.space2),
          Text(
            '${_getStatusText(_currentStatus)} 상태로 변경',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
