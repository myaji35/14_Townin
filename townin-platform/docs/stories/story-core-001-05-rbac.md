# Story CORE-001-05: Role-Based Access Control (RBAC)

**Epic**: CORE-001 Authentication & Authorization System
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** platform administrator
**I want to** control access based on user roles
**So that** users only access authorized features

## Acceptance Criteria

- [ ] 5개 역할 정의 (User, Merchant, SecurityGuard, Municipality, SuperAdmin)
- [ ] Role guard decorator (@Roles)
- [ ] API endpoint별 role 제한
- [ ] Frontend route별 role 제한
- [ ] 권한 없음 에러 (403 Forbidden)
- [ ] Role hierarchy 지원 (SuperAdmin > Municipality > SecurityGuard > Merchant > User)

## Tasks

### Backend
- [ ] UserRole enum 정의
- [ ] @Roles decorator 구현
- [ ] RolesGuard 구현
- [ ] Role validation middleware
- [ ] Apply guards to controllers
- [ ] API endpoint role configuration
- [ ] 403 Forbidden error response

### Frontend
- [ ] Role-based routing (React Router)
- [ ] Conditional UI rendering based on role
- [ ] Protected routes component
- [ ] Role check utility function
- [ ] Redirect unauthorized users

### Testing
- [ ] Unit tests: Role guard logic
- [ ] Unit tests: Role hierarchy
- [ ] Integration test: Access with correct role
- [ ] Integration test: Access with wrong role
- [ ] E2E test: Role-based navigation

## Technical Notes

```typescript
// User Role Enum
export enum UserRole {
  USER = 'user',
  MERCHANT = 'merchant',
  SECURITY_GUARD = 'security_guard',
  MUNICIPALITY = 'municipality',
  SUPER_ADMIN = 'super_admin',
}

// Role hierarchy (higher number = higher privilege)
export const ROLE_HIERARCHY = {
  [UserRole.USER]: 1,
  [UserRole.MERCHANT]: 2,
  [UserRole.SECURITY_GUARD]: 3,
  [UserRole.MUNICIPALITY]: 4,
  [UserRole.SUPER_ADMIN]: 5,
};

// @Roles Decorator
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

// Roles Guard
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

// Usage in Controller
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MUNICIPALITY)
  getAllUsers() {
    // Only SuperAdmin and Municipality can access
  }

  @Delete('users/:id')
  @Roles(UserRole.SUPER_ADMIN)
  deleteUser(@Param('id') id: string) {
    // Only SuperAdmin can delete users
  }
}

@Controller('merchants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MerchantController {
  @Get('me/flyers')
  @Roles(UserRole.MERCHANT)
  getMyFlyers(@Req() req) {
    // Only Merchants can access their flyers
  }
}

// Frontend: Role-based routing (React)
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

// Usage
<Route
  path="/admin/*"
  element={
    <ProtectedRoute allowedRoles={['super_admin', 'municipality']}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/merchant/*"
  element={
    <ProtectedRoute allowedRoles={['merchant']}>
      <MerchantDashboard />
    </ProtectedRoute>
  }
/>

// Frontend: Conditional rendering
const Navbar = () => {
  const user = useAuth();

  return (
    <nav>
      <Link to="/">Home</Link>

      {user?.role === 'merchant' && (
        <Link to="/merchant/flyers">My Flyers</Link>
      )}

      {['super_admin', 'municipality'].includes(user?.role) && (
        <Link to="/admin">Admin Panel</Link>
      )}
    </nav>
  );
};
```

## Dependencies

- **Depends on**: CORE-001-01 (User Entity), CORE-001-02 (JWT Auth)
- **Blocks**: All role-specific features (Admin, Merchant, etc.)

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tasks completed
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Code reviewed and merged
- [ ] API documentation updated with role requirements
- [ ] Frontend routes protected
- [ ] 403 error handling implemented
- [ ] Security audit passed

## Notes

- SuperAdmin은 모든 권한 보유
- Municipality는 관할 지역 관리 권한
- SecurityGuard는 담당 Grid Cell 관리 권한
- Merchant는 자신의 상점과 전단지만 관리 가능
- User는 일반 사용자 기능만 접근 가능
- Role hierarchy를 통해 상위 역할이 하위 역할 권한 포함 가능 (선택적)
