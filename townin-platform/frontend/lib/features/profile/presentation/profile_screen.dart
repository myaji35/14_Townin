import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../auth/presentation/login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  String _userEmail = '';
  String _userName = '사용자';
  bool _pushEnabled = true;
  bool _locationEnabled = true;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final email = await _storage.read(key: 'user_email');
    final name = await _storage.read(key: 'user_name');

    setState(() {
      _userEmail = email ?? '';
      _userName = name ?? '사용자';
    });
  }

  Future<void> _logout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('로그아웃'),
        content: const Text('정말 로그아웃 하시겠습니까?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('로그아웃'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      // Clear tokens
      await _storage.delete(key: 'access_token');
      await _storage.delete(key: 'refresh_token');
      await _storage.delete(key: 'user_email');
      await _storage.delete(key: 'user_name');

      if (mounted) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (context) => const LoginScreen()),
          (route) => false,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('프로필'),
        backgroundColor: const Color(0xFF6366F1),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Profile Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF6366F1),
                    const Color(0xFF6366F1).withOpacity(0.8),
                  ],
                ),
              ),
              child: Column(
                children: [
                  // Avatar
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.person,
                      size: 40,
                      color: Color(0xFF6366F1),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Name
                  Text(
                    _userName,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),

                  // Email
                  Text(
                    _userEmail,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.white.withOpacity(0.9),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 8),

            // Settings Sections
            _buildSection(
              '계정 설정',
              [
                _buildListTile(
                  Icons.person_outline,
                  '프로필 편집',
                  onTap: () {
                    // TODO: Navigate to edit profile
                  },
                ),
                _buildListTile(
                  Icons.lock_outline,
                  '비밀번호 변경',
                  onTap: () {
                    // TODO: Navigate to change password
                  },
                ),
              ],
            ),

            const Divider(height: 1),

            _buildSection(
              '알림 설정',
              [
                _buildSwitchTile(
                  Icons.notifications_outlined,
                  '푸시 알림',
                  _pushEnabled,
                  (value) {
                    setState(() {
                      _pushEnabled = value;
                    });
                    // TODO: Update push notification settings
                  },
                ),
                _buildSwitchTile(
                  Icons.location_on_outlined,
                  '위치 기반 알림',
                  _locationEnabled,
                  (value) {
                    setState(() {
                      _locationEnabled = value;
                    });
                    // TODO: Update location settings
                  },
                ),
              ],
            ),

            const Divider(height: 1),

            _buildSection(
              '앱 정보',
              [
                _buildListTile(
                  Icons.info_outline,
                  '버전 정보',
                  trailing: const Text(
                    '1.0.0',
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
                _buildListTile(
                  Icons.description_outlined,
                  '이용 약관',
                  onTap: () {
                    // TODO: Show terms of service
                  },
                ),
                _buildListTile(
                  Icons.privacy_tip_outlined,
                  '개인정보 처리방침',
                  onTap: () {
                    // TODO: Show privacy policy
                  },
                ),
              ],
            ),

            const Divider(height: 1),

            _buildSection(
              '기타',
              [
                _buildListTile(
                  Icons.help_outline,
                  '고객 지원',
                  onTap: () {
                    // TODO: Navigate to customer support
                  },
                ),
                _buildListTile(
                  Icons.logout,
                  '로그아웃',
                  textColor: Colors.red,
                  onTap: _logout,
                ),
              ],
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text(
            title,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.grey,
            ),
          ),
        ),
        ...children,
      ],
    );
  }

  Widget _buildListTile(
    IconData icon,
    String title, {
    Widget? trailing,
    VoidCallback? onTap,
    Color? textColor,
  }) {
    return ListTile(
      leading: Icon(icon, color: textColor),
      title: Text(
        title,
        style: TextStyle(color: textColor),
      ),
      trailing: trailing ?? const Icon(Icons.chevron_right, color: Colors.grey),
      onTap: onTap,
    );
  }

  Widget _buildSwitchTile(
    IconData icon,
    String title,
    bool value,
    ValueChanged<bool> onChanged,
  ) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      trailing: Switch(
        value: value,
        onChanged: onChanged,
        activeColor: const Color(0xFF6366F1),
      ),
    );
  }
}
