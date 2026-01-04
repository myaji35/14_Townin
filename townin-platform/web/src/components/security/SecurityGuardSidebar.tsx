import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Home, Shield, Camera, AlertTriangle, Settings, Sun, Moon, LogOut } from 'lucide-react';
import './SecurityGuardSidebar.css';

interface SecurityGuardSidebarProps {
  safetyScore?: number;
  activityScore?: number;
  guardName?: string;
  areaName?: string;
  activeNav?: string;
  onNavChange?: (nav: string) => void;
}

export default function SecurityGuardSidebar({
  safetyScore = 92,
  activityScore = 85,
  guardName = '김보안',
  areaName = '의정부 송산1동',
  activeNav = 'dashboard',
  onNavChange,
}: SecurityGuardSidebarProps) {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close settings menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: t('common.home'), icon: Home },
    { id: 'monitoring', label: t('securityGuard.safetyMonitoring'), icon: Shield },
    { id: 'cctv', label: t('securityGuard.cctvStatus'), icon: Camera },
    { id: 'alerts', label: t('securityGuard.emergencyAlerts'), icon: AlertTriangle },
  ];

  const handleNavClick = (navId: string) => {
    if (onNavChange) {
      onNavChange(navId);
    }
  };

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      window.location.href = '/login';
    }
  };

  const handleThemeToggle = () => {
    toggleTheme();
    setIsSettingsOpen(false);
  };

  const getSafetyColor = (score: number) => {
    if (score >= 90) return '#22C55E'; // Green
    if (score >= 70) return '#FBBF24'; // Yellow
    return '#EF4444'; // Red
  };

  return (
    <aside className="security-guard-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand">
          <div className="logo-icon">T</div>
          <div className="brand-text">
            <h1>Townin OS</h1>
            <span>{t('securityGuard.dashboard')}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="nav-menu">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <IconComponent className="nav-icon" size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Safety Score Cards */}
      <div className="sidebar-scrollable">
        <div className="score-card safety">
          <Shield className="background-icon" size={80} strokeWidth={1} />
          <label className="label">{t('securityGuard.safetyScore').toUpperCase()}</label>
          <div className="score-value" style={{ color: getSafetyColor(safetyScore) }}>
            {safetyScore}
            <span className="unit">점</span>
          </div>
          <div className="score-bar">
            <div
              className="score-fill"
              style={{
                width: `${safetyScore}%`,
                backgroundColor: getSafetyColor(safetyScore)
              }}
            ></div>
          </div>
          <div className="score-trend">
            <Shield className="trend-icon" size={14} />
            {safetyScore >= 90 ? t('securityGuard.allClear') : t('securityGuard.needsAttention')}
          </div>
        </div>

        <div className="score-card activity">
          <AlertTriangle className="background-icon" size={80} strokeWidth={1} />
          <label className="label">{t('securityGuard.activityScore').toUpperCase()}</label>
          <div className="score-value">
            {activityScore}
            <span className="unit">점</span>
          </div>
          <div className="score-bar">
            <div
              className="score-fill"
              style={{ width: `${activityScore}%` }}
            ></div>
          </div>
          <div className="score-trend">
            이번 달 활동 우수
          </div>
        </div>

        <div className="info-card">
          <div className="info-item">
            <div className="info-label">{t('securityGuard.myArea')}</div>
            <div className="info-value">{areaName}</div>
          </div>
          <div className="info-item">
            <div className="info-label">{t('securityGuard.areaStatus')}</div>
            <div className="info-value status-online">
              <span className="status-dot"></span>
              {t('securityGuard.online')}
            </div>
          </div>
        </div>
      </div>

      {/* Guard Profile */}
      <div className="user-profile">
        <div className="avatar">
          <Shield size={20} />
        </div>
        <div className="info">
          <div className="name">{guardName}</div>
          <div className="role">{t('securityGuard.areaGuard')}</div>
        </div>

        {/* Settings Menu */}
        <div className="settings-menu-wrapper" ref={settingsRef}>
          <button
            className="settings-toggle-btn"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            aria-label="Settings"
          >
            <Settings size={16} />
          </button>

          {isSettingsOpen && (
            <div className="settings-dropdown">
              <button className="settings-menu-item" onClick={handleThemeToggle}>
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                <span>{theme === 'light' ? '다크 모드' : '라이트 모드'}</span>
              </button>
              <button className="settings-menu-item logout" onClick={handleLogout}>
                <LogOut size={16} />
                <span>로그아웃</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
