enum UserRole {
  user('user', '일반 사용자'),
  securityGuard('security_guard', '지역관리자'),
  municipality('municipality', '자치체관리'),
  superAdmin('super_admin', '슈퍼관리자');

  final String value;
  final String displayName;

  const UserRole(this.value, this.displayName);

  static UserRole fromString(String value) {
    return UserRole.values.firstWhere(
      (role) => role.value == value,
      orElse: () => UserRole.user,
    );
  }
}
