import 'package:flutter/material.dart';
import '../../../core/enums/user_role.dart';
import '../../dashboard/super_admin/super_admin_dashboard.dart';
import '../../dashboard/municipality/municipality_dashboard.dart';
import '../../dashboard/security_guard/security_guard_dashboard.dart';
import '../../dashboard/user/user_dashboard.dart';

class DashboardRouter {
  static Widget getDashboardForRole(UserRole role) {
    switch (role) {
      case UserRole.superAdmin:
        return const SuperAdminDashboard();
      case UserRole.municipality:
        return const MunicipalityDashboard();
      case UserRole.securityGuard:
        return const SecurityGuardDashboard();
      case UserRole.user:
        return const UserDashboard();
    }
  }
}
