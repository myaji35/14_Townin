import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Home, CheckCircle, BarChart3, Settings, Sun, Moon, LogOut, TrendingUp } from 'lucide-react';
import './PartnerSidebar.css';

interface PartnerSidebarProps {
  totalEarnings?: number;
  monthlyEarnings?: number;
  partnerName?: string;
  areaName?: string;
  activeNav?: string;
  onNavChange?: (nav: string) => void;
}

export default function PartnerSidebar({
  totalEarnings = 12500,
  monthlyEarnings = 1850,
  partnerName = '김보안',
  areaName = '의정부 송산1동',
  activeNav = 'dashboard',
  onNavChange,
}: PartnerSidebarProps) {
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
    { id: 'approval', label: t('partner.pendingFlyers'), icon: CheckCircle },
    { id: 'analytics', label: t('partner.areaStats'), icon: BarChart3 },
    { id: 'settings', label: t('merchant.settings'), icon: Settings },
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

  return (
    <aside className="partner-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand">
          <div className="logo-icon">T</div>
          <div className="brand-text">
            <h1>Townin OS</h1>
            <span>{t('partner.dashboard')}</span>
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

      {/* Earnings Cards */}
      <div className="sidebar-scrollable">
        <div className="earnings-card">
          <TrendingUp className="background-icon" size={80} strokeWidth={1} />
          <label className="label">{t('partner.totalEarnings').toUpperCase()}</label>
          <div className="earnings-value">
            {totalEarnings.toLocaleString()}
            <span className="unit">P</span>
          </div>
          <div className="earnings-trend">
            <TrendingUp className="trend-icon" size={14} />
            이번 달 {monthlyEarnings.toLocaleString()}P 획득
          </div>
        </div>

        <div className="info-card">
          <div className="info-item">
            <div className="info-label">{t('partner.myArea')}</div>
            <div className="info-value">{areaName}</div>
          </div>
          <div className="info-item">
            <div className="info-label">{t('partner.clickCommission')}</div>
            <div className="info-value">5P {t('partner.perClick')}</div>
          </div>
        </div>
      </div>

      {/* Partner Profile */}
      <div className="user-profile">
        <div className="avatar">
          <span>🛡️</span>
        </div>
        <div className="info">
          <div className="name">{partnerName}</div>
          <div className="role">{t('partner.areaManager')}</div>
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
