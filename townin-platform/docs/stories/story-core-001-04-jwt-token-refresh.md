# Story CORE-001-04: JWT Token Refresh

**Epic**: CORE-001 Authentication & Authorization System
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** logged-in user
**I want to** refresh my access token automatically
**So that** I don't have to log in frequently

## Acceptance Criteria

- [ ] Access Token 만료 감지 (401 Unauthorized)
- [ ] Refresh Token으로 새 Access Token 발급
- [ ] Refresh Token 자동 갱신 (sliding window)
- [ ] 401 에러 시 자동 재시도
- [ ] Refresh Token 만료 시 로그아웃
- [ ] Refresh Token rotation (보안 강화)

## Tasks

### Backend
- [ ] POST /auth/refresh API 구현
- [ ] Refresh Token validation (JWT verify)
- [ ] Refresh Token existence check (Redis)
- [ ] New Access Token generation
- [ ] Sliding window refresh (rotate Refresh Token)
- [ ] Old Refresh Token invalidation
- [ ] Error handling (expired, invalid, not found)

### Frontend
- [ ] Axios interceptor for 401 errors
- [ ] Token refresh logic
- [ ] Automatic retry after token refresh
- [ ] Handle concurrent requests during refresh
- [ ] Logout if refresh fails
- [ ] Token expiry monitoring

### Testing
- [ ] Unit tests: Refresh Token validation
- [ ] Unit tests: Token rotation logic
- [ ] Integration test: successful token refresh
- [ ] Integration test: expired Refresh Token
- [ ] Integration test: invalid Refresh Token
- [ ] E2E test: Access Token expiry → auto refresh → continue

## Technical Notes

```typescript
// Refresh DTO
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

// Refresh Token Response
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string; // New rotated refresh token
}

// Backend: Refresh Token Controller
@Post('refresh')
async refresh(@Body() dto: RefreshTokenDto): Promise<RefreshTokenResponse> {
  // 1. Verify Refresh Token
  const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
    secret: process.env.JWT_REFRESH_SECRET,
  });

  // 2. Check if token exists in Redis
  const storedToken = await this.redis.get(`refresh:${payload.sub}`);
  if (storedToken !== dto.refreshToken) {
    throw new UnauthorizedException('Invalid refresh token');
  }

  // 3. Generate new Access Token
  const accessToken = this.jwtService.sign({
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
  }, { expiresIn: '15m' });

  // 4. Rotate Refresh Token (sliding window)
  const newRefreshToken = this.jwtService.sign({
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
  }, {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '14d'
  });

  // 5. Update Redis
  await this.redis.set(`refresh:${payload.sub}`, newRefreshToken, 'EX', 14 * 24 * 60 * 60);

  return { accessToken, refreshToken: newRefreshToken };
}

// Frontend: Axios Interceptor
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue concurrent requests
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axios(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/auth/refresh', { refreshToken });

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.accessToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + data.accessToken;

        processQueue(null, data.accessToken);
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Logout user
        localStorage.clear();
        window.location.href = '/login';

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

## Dependencies

- **Depends on**: CORE-001-02 (Login), Redis setup
- **Blocks**: All authenticated features requiring long sessions

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tasks completed
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Code reviewed and merged
- [ ] API documentation updated (Swagger)
- [ ] Token rotation working correctly
- [ ] Concurrent refresh requests handled
- [ ] Security audit passed

## Notes

- Refresh Token은 사용 후 즉시 새 토큰으로 교체 (rotation)
- Sliding window 방식으로 Refresh Token 유효기간 연장
- Access Token은 짧게 유지 (15분) → 보안 강화
- Refresh Token은 Redis에 저장하여 즉시 무효화 가능
- 동시 API 호출 시 token refresh 중복 방지 (queue)
- Refresh Token 탈취 시 rotation으로 피해 최소화
