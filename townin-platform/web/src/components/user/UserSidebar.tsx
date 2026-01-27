import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Settings as SettingsIcon, LogOut, Users, MapPin, Shirt, ShieldCheck } from 'lucide-react';
import './UserSidebar.css';

interface UserSidebarProps {
  currentPoints?: number;
  pointsGained?: number;
  userName?: string;
  userRole?: string;
  activeNav?: string;
  onNavChange?: (nav: string) => void;
}

export default function UserSidebar({
  currentPoints = 2450,
  pointsGained = 350,
  userName = '김민준',
  userRole,
  activeNav = 'flyers',
  onNavChange,
}: UserSidebarProps) {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const displayRole = userRole || t('sidebar.premiumMember');
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);
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
    { id: 'home', label: t('common.home'), icon: '🏠' },
    { id: 'flyers', label: t('common.digitalFlyers'), icon: '🗺️' },
    { id: 'wallet', label: t('common.wallet'), icon: '💳' },
    { id: 'community', label: t('sidebar.community'), icon: '👥' },
  ];

  const filterCategories = [
    { id: 'all', label: t('sidebar.allCategories') },
    { id: 'food', label: t('sidebar.foodDining') },
    { id: 'retail', label: t('sidebar.retailShopping') },
    { id: 'health', label: t('sidebar.healthWellness') },
    { id: 'services', label: t('sidebar.lifeServices') },
  ];

  const handleNavClick = (navId: string) => {
    if (onNavChange) {
      onNavChange(navId);
    }
  };

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    if (confirm('로그아웃 하시겠습니까?')) {
      window.location.href = '/login';
    }
  };

  const handleThemeToggle = () => {
    toggleTheme();
    setIsSettingsOpen(false);
  };

  const toggleFilter = (filterId: string) => {
    if (filterId === 'all') {
      setSelectedFilters(['all']);
    } else {
      let newFilters = selectedFilters.filter(f => f !== 'all');
      if (selectedFilters.includes(filterId)) {
        newFilters = newFilters.filter(f => f !== filterId);
      } else {
        newFilters.push(filterId);
      }
      setSelectedFilters(newFilters.length > 0 ? newFilters : ['all']);
    }
  };

  const progressPercent = (currentPoints % 1000) / 10; // Assuming 1000 points per level

  return (
    <aside className="user-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand">
          <div className="logo-icon">T</div>
          <div className="brand-text">
            <h1>Townin OS</h1>
            <span>{t('sidebar.hyperLocalLife')}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="nav-menu">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Points Card */}
      <div className="sidebar-scrollable">
        <div className="points-card">
          <div className="background-icon">💰</div>
          <label className="label">{t('sidebar.myPointsStatus').toUpperCase()}</label>
          <div className="points-value">
            {currentPoints.toLocaleString()}
            <span className="unit">P</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <div className="points-trend">
            <span className="trend-icon">↑</span>
            {pointsGained}P {t('sidebar.earnedThisWeek')}
          </div>
        </div>

        {/* Filter Categories */}
        <div className="filters">
          <h4 className="filters-title">{t('sidebar.filterCategories').toUpperCase()}</h4>
          <div className="filter-list">
            {filterCategories.map((filter) => (
              <label key={filter.id} className="filter-item">
                <input
                  type="checkbox"
                  checked={selectedFilters.includes(filter.id)}
                  onChange={() => toggleFilter(filter.id)}
                />
                <span className="checkmark"></span>
                <span className="filter-label">{filter.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="user-profile">
        <div className="avatar"></div>
        <div className="info">
          <div className="name">{userName}</div>
          <div className="role">{displayRole}</div>
        </div>

        {/* Settings Menu */}
        <div className="settings-menu-wrapper" ref={settingsRef}>
          <button
            className="settings-toggle-btn"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            aria-label="Settings"
          >
            <SettingsIcon size={16} />
          </button>

          {isSettingsOpen && (
            <div className="settings-dropdown">
              <button
                className="settings-menu-item"
                onClick={() => {
                  handleNavClick('hubs');
                  setIsSettingsOpen(false);
                }}
              >
                <MapPin size={16} />
                <span>관심지역 관리</span>
              </button>
              <button
                className="settings-menu-item"
                onClick={() => {
                  handleNavClick('family');
                  setIsSettingsOpen(false);
                }}
              >
                <Users size={16} />
                <span>가족 구성원 관리</span>
              </button>
              <button
                className="settings-menu-item"
                onClick={() => {
                  window.location.href = '/user/avatar';
                  setIsSettingsOpen(false);
                }}
              >
                <Shirt size={16} />
                <span>My Avatar (Townin Fit)</span>
              </button>
              <button
                className="settings-menu-item"
                onClick={() => {
                  window.location.href = '/user/privacy';
                  setIsSettingsOpen(false);
                }}
              >
                <ShieldCheck size={16} />
                <span>Privacy Center (Flush)</span>
              </button>
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
