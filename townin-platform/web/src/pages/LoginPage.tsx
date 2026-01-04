import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      console.log('Login successful:', response);

      // Redirect based on role
      const { role } = response.user;
      switch (role) {
        case 'user':
          navigate('/user/dashboard');
          break;
        case 'merchant':
          navigate('/ceo/dashboard');
          break;
        case 'security_guard':
          navigate('/security/dashboard');
          break;
        case 'master':
          navigate('/master/dashboard');
          break;
        case 'municipality':
          navigate('/municipality/dashboard');
          break;
        case 'super_admin':
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/user/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Townin</h1>
          <p>프라이버시 우선 초로컬 커뮤니티</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user1@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="townin2025!"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <div className="demo-accounts">
            <p className="demo-title">테스트 계정</p>
            <div className="demo-list">
              <div>👤 고객: user1@example.com → /user/dashboard</div>
              <div>🏪 사장님: merchant1@example.com → /ceo/dashboard</div>
              <div>🛡️ 보안관: guard1@townin.kr → /security/dashboard</div>
              <div>👑 마스터: master@townin.kr → /master/dashboard</div>
              <div>🏛️ 지자체: municipality@uijeongbu.go.kr → /municipality/dashboard</div>
              <div>⚙️ 관리자: admin@townin.kr → /admin/dashboard</div>
              <div className="demo-password">비밀번호: townin2025!</div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
