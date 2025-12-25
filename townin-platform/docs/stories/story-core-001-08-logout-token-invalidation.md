# Story CORE-001-08: Logout & Token Invalidation

**Epic**: CORE-001 Authentication & Authorization System
**Priority**: P0 (Critical)
**Story Points**: 2
**Status**: 📋 Planned

## User Story

**As a** logged-in user
**I want to** log out securely
**So that** my session is properly terminated

## Acceptance Criteria

- [ ] 로그아웃 API 호출
- [ ] Refresh Token 삭제 (Redis)
- [ ] Frontend 토큰 제거 (localStorage, cookies)
- [ ] 로그인 페이지로 리다이렉트
- [ ] 로그아웃 후 API 접근 불가 (401)
- [ ] 모든 기기에서 로그아웃 옵션

## Tasks

### Backend
- [ ] POST /auth/logout API 구현
- [ ] POST /auth/logout-all API 구현 (all devices)
- [ ] Refresh Token deletion from Redis
- [ ] Optional: Blacklist Access Token (Redis, until expiry)
- [ ] Logout logging (audit trail)

### Frontend
- [ ] Logout button in navbar/menu
- [ ] Logout confirmation dialog (optional)
- [ ] Token cleanup (localStorage, sessionStorage, cookies)
- [ ] Clear user state (Redux/Context)
- [ ] Redirect to login page
- [ ] "Logout from all devices" option in settings

### Testing
- [ ] Unit tests: Token cleanup
- [ ] Integration test: Logout flow
- [ ] Integration test: Access API after logout (should fail)
- [ ] Integration test: Logout from all devices
- [ ] E2E test: Complete logout flow

## Technical Notes

```typescript
// Logout DTO
export class LogoutDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

// Backend: Logout (Single Device)
@Post('logout')
@UseGuards(JwtAuthGuard)
async logout(@Req() req, @Body() dto: LogoutDto) {
  const user = req.user;

  // Delete refresh token from Redis
  await this.redis.del(`refresh:${user.id}`);

  // Optional: Blacklist access token (until it expires)
  const accessToken = req.headers.authorization?.split(' ')[1];
  if (accessToken) {
    const payload = this.jwtService.decode(accessToken);
    const ttl = payload.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await this.redis.set(`blacklist:${accessToken}`, '1', 'EX', ttl);
    }
  }

  // Log logout event
  await this.auditService.log({
    userId: user.id,
    action: 'LOGOUT',
    timestamp: new Date(),
  });

  return { message: 'Logged out successfully' };
}

// Backend: Logout from All Devices
@Post('logout-all')
@UseGuards(JwtAuthGuard)
async logoutAll(@Req() req) {
  const user = req.user;

  // Delete all refresh tokens for this user
  await this.redis.del(`refresh:${user.id}`);

  // Optional: Track device sessions and delete all
  const pattern = `session:${user.id}:*`;
  const keys = await this.redis.keys(pattern);
  if (keys.length > 0) {
    await this.redis.del(...keys);
  }

  // Log logout all event
  await this.auditService.log({
    userId: user.id,
    action: 'LOGOUT_ALL_DEVICES',
    timestamp: new Date(),
  });

  return { message: 'Logged out from all devices' };
}

// Optional: JWT Auth Guard with Blacklist Check
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private redis: RedisService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    // Check if token is blacklisted
    if (token) {
      const isBlacklisted = await this.redis.get(`blacklist:${token}`);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}

// Frontend: Logout Function
const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');

    await axios.post('/auth/logout', { refreshToken });

    // Clear all tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();

    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Clear app state
    dispatch({ type: 'LOGOUT' });

    // Redirect
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout failed:', error);
    // Force logout anyway
    localStorage.clear();
    window.location.href = '/login';
  }
};

// Frontend: Logout Button
const LogoutButton = () => {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
  };

  return (
    <button onClick={handleLogout} disabled={loading}>
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  );
};

// Frontend: Logout from All Devices
const LogoutAllButton = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogoutAll = async () => {
    try {
      await axios.post('/auth/logout-all');

      localStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      toast.error('Failed to logout from all devices');
    }
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>
        Logout from All Devices
      </button>

      {showConfirm && (
        <ConfirmDialog
          title="Logout from All Devices?"
          message="This will log you out from all browsers and devices."
          onConfirm={handleLogoutAll}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};
```

## Dependencies

- **Depends on**: CORE-001-02 (Login), Redis setup
- **Blocks**: None

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tasks completed
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Code reviewed and merged
- [ ] API documentation updated (Swagger)
- [ ] Token blacklist implemented (optional)
- [ ] Logout audit logging working
- [ ] Frontend logout flow tested

## Notes

- Refresh Token은 즉시 삭제 (Redis)
- Access Token은 짧은 유효기간 (15분) → blacklist 선택적
- Blacklist는 Access Token 만료까지만 유지 (메모리 효율)
- "모든 기기에서 로그아웃" 기능으로 보안 강화
- 로그아웃 실패해도 Frontend는 강제 로그아웃
- Audit log로 로그아웃 이벤트 추적
- 비정상 로그아웃 (브라우저 종료) 시 Refresh Token 자동 만료 (14일)
