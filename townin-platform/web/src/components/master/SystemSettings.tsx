import { useState } from 'react';
import './SystemSettings.css';

interface SystemConfig {
  general: {
    siteName: string;
    siteUrl: string;
    maintenanceMode: boolean;
    debugMode: boolean;
    timezone: string;
    language: string;
  };
  security: {
    minPasswordLength: number;
    passwordExpiry: number;
    maxLoginAttempts: number;
    sessionTimeout: number;
    twoFactorAuth: boolean;
    ipWhitelist: string[];
  };
  payment: {
    commission: number;
    minTransaction: number;
    maxTransaction: number;
    paymentMethods: string[];
    settlementPeriod: number;
  };
  flyer: {
    maxImageSize: number;
    autoApproval: boolean;
    expiryDays: number;
    maxFlyersPerMerchant: number;
    moderationKeywords: string[];
  };
  notification: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    adminEmail: string;
    notificationTypes: string[];
  };
  api: {
    rateLimit: number;
    apiVersion: string;
    webhookUrl: string;
    apiKeys: Array<{
      name: string;
      key: string;
      created: string;
      lastUsed: string;
    }>;
  };
}

export default function SystemSettings() {
  const [activeSection, setActiveSection] = useState<keyof SystemConfig>('general');
  const [config, setConfig] = useState<SystemConfig>({
    general: {
      siteName: 'Townin Platform',
      siteUrl: 'https://townin.kr',
      maintenanceMode: false,
      debugMode: false,
      timezone: 'Asia/Seoul',
      language: 'ko-KR'
    },
    security: {
      minPasswordLength: 8,
      passwordExpiry: 90,
      maxLoginAttempts: 5,
      sessionTimeout: 30,
      twoFactorAuth: false,
      ipWhitelist: ['127.0.0.1', '192.168.1.0/24']
    },
    payment: {
      commission: 3.5,
      minTransaction: 1000,
      maxTransaction: 10000000,
      paymentMethods: ['card', 'transfer', 'easy', 'cash'],
      settlementPeriod: 7
    },
    flyer: {
      maxImageSize: 5,
      autoApproval: false,
      expiryDays: 30,
      maxFlyersPerMerchant: 10,
      moderationKeywords: ['성인', '도박', '불법', '사기']
    },
    notification: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      adminEmail: 'admin@townin.kr',
      notificationTypes: ['new_user', 'new_flyer', 'payment', 'error']
    },
    api: {
      rateLimit: 100,
      apiVersion: 'v1.0.0',
      webhookUrl: 'https://api.townin.kr/webhook',
      apiKeys: [
        { name: 'Production API', key: 'sk_live_***************', created: '2024-01-01', lastUsed: '2024-03-15' },
        { name: 'Development API', key: 'sk_test_***************', created: '2024-01-15', lastUsed: '2024-03-14' }
      ]
    }
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const handleInputChange = (section: keyof SystemConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setUnsavedChanges(true);
  };

  const handleSave = () => {
    console.log('Saving configuration:', config);
    setUnsavedChanges(false);
    // API 호출하여 설정 저장
  };

  const handleReset = () => {
    console.log('Resetting to default configuration');
    setUnsavedChanges(false);
    // 기본값으로 리셋
  };

  const generateApiKey = () => {
    const newKey = {
      name: `API Key ${config.api.apiKeys.length + 1}`,
      key: 'sk_live_' + Math.random().toString(36).substring(2, 15),
      created: new Date().toISOString().split('T')[0],
      lastUsed: '-'
    };

    setConfig(prev => ({
      ...prev,
      api: {
        ...prev.api,
        apiKeys: [...prev.api.apiKeys, newKey]
      }
    }));
    setUnsavedChanges(true);
  };

  return (
    <div className="system-settings">
      <div className="settings-header">
        <h2>시스템 설정</h2>
        {unsavedChanges && (
          <div className="unsaved-indicator">
            <span className="indicator-dot"></span>
            저장되지 않은 변경사항
          </div>
        )}
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          <button
            className={`sidebar-item ${activeSection === 'general' ? 'active' : ''}`}
            onClick={() => setActiveSection('general')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 6v4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            일반 설정
          </button>
          <button
            className={`sidebar-item ${activeSection === 'security' ? 'active' : ''}`}
            onClick={() => setActiveSection('security')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L3 6v5c0 3.86 2.67 7.47 7 8.35 4.33-.88 7-4.49 7-8.35V6l-7-4z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            보안 설정
          </button>
          <button
            className={`sidebar-item ${activeSection === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveSection('payment')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="5" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 9h16" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            결제 설정
          </button>
          <button
            className={`sidebar-item ${activeSection === 'flyer' ? 'active' : ''}`}
            onClick={() => setActiveSection('flyer')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="4" y="3" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            전단지 설정
          </button>
          <button
            className={`sidebar-item ${activeSection === 'notification' ? 'active' : ''}`}
            onClick={() => setActiveSection('notification')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2C11.1 2 12 2.9 12 4v.29C13.82 4.98 15 6.72 15 8.76v4.41L17 15.17V16H3v-.83l2-2V8.76C5 6.72 6.18 4.98 8 4.29V4c0-1.1.9-2 2-2zM10 18c-.9 0-1.64-.64-1.94-1.5h3.88c-.3.86-1.04 1.5-1.94 1.5z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            알림 설정
          </button>
          <button
            className={`sidebar-item ${activeSection === 'api' ? 'active' : ''}`}
            onClick={() => setActiveSection('api')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 8l-3 3 3 3M13 8l3 3-3 3M11 4l-2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            API 설정
          </button>
        </div>

        <div className="settings-content">
          {activeSection === 'general' && (
            <div className="settings-section">
              <h3>일반 설정</h3>
              <div className="setting-group">
                <label>사이트 이름</label>
                <input
                  type="text"
                  value={config.general.siteName}
                  onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                />
              </div>
              <div className="setting-group">
                <label>사이트 URL</label>
                <input
                  type="url"
                  value={config.general.siteUrl}
                  onChange={(e) => handleInputChange('general', 'siteUrl', e.target.value)}
                />
              </div>
              <div className="setting-group">
                <label>시간대</label>
                <select
                  value={config.general.timezone}
                  onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                >
                  <option value="Asia/Seoul">Asia/Seoul (KST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                </select>
              </div>
              <div className="setting-group">
                <label>언어</label>
                <select
                  value={config.general.language}
                  onChange={(e) => handleInputChange('general', 'language', e.target.value)}
                >
                  <option value="ko-KR">한국어</option>
                  <option value="en-US">English</option>
                  <option value="ja-JP">日本語</option>
                </select>
              </div>
              <div className="setting-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={config.general.maintenanceMode}
                    onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
                  />
                  유지보수 모드
                </label>
                <p className="setting-description">활성화 시 관리자만 사이트 접근 가능</p>
              </div>
              <div className="setting-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={config.general.debugMode}
                    onChange={(e) => handleInputChange('general', 'debugMode', e.target.checked)}
                  />
                  디버그 모드
                </label>
                <p className="setting-description">개발 환경에서만 사용하세요</p>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="settings-section">
              <h3>보안 설정</h3>
              <div className="setting-group">
                <label>최소 비밀번호 길이</label>
                <input
                  type="number"
                  value={config.security.minPasswordLength}
                  onChange={(e) => handleInputChange('security', 'minPasswordLength', parseInt(e.target.value))}
                  min="6"
                  max="32"
                />
                <p className="setting-description">6-32자 사이</p>
              </div>
              <div className="setting-group">
                <label>비밀번호 만료 기간 (일)</label>
                <input
                  type="number"
                  value={config.security.passwordExpiry}
                  onChange={(e) => handleInputChange('security', 'passwordExpiry', parseInt(e.target.value))}
                />
              </div>
              <div className="setting-group">
                <label>최대 로그인 시도 횟수</label>
                <input
                  type="number"
                  value={config.security.maxLoginAttempts}
                  onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                />
              </div>
              <div className="setting-group">
                <label>세션 타임아웃 (분)</label>
                <input
                  type="number"
                  value={config.security.sessionTimeout}
                  onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                />
              </div>
              <div className="setting-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={config.security.twoFactorAuth}
                    onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                  />
                  2단계 인증 활성화
                </label>
              </div>
              <div className="setting-group">
                <label>IP 화이트리스트</label>
                <textarea
                  value={config.security.ipWhitelist.join('\n')}
                  onChange={(e) => handleInputChange('security', 'ipWhitelist', e.target.value.split('\n'))}
                  rows={4}
                  placeholder="한 줄에 하나의 IP 주소"
                />
              </div>
            </div>
          )}

          {activeSection === 'payment' && (
            <div className="settings-section">
              <h3>결제 설정</h3>
              <div className="setting-group">
                <label>플랫폼 수수료 (%)</label>
                <input
                  type="number"
                  value={config.payment.commission}
                  onChange={(e) => handleInputChange('payment', 'commission', parseFloat(e.target.value))}
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>
              <div className="setting-group">
                <label>최소 거래 금액</label>
                <input
                  type="number"
                  value={config.payment.minTransaction}
                  onChange={(e) => handleInputChange('payment', 'minTransaction', parseInt(e.target.value))}
                />
              </div>
              <div className="setting-group">
                <label>최대 거래 금액</label>
                <input
                  type="number"
                  value={config.payment.maxTransaction}
                  onChange={(e) => handleInputChange('payment', 'maxTransaction', parseInt(e.target.value))}
                />
              </div>
              <div className="setting-group">
                <label>정산 주기 (일)</label>
                <input
                  type="number"
                  value={config.payment.settlementPeriod}
                  onChange={(e) => handleInputChange('payment', 'settlementPeriod', parseInt(e.target.value))}
                />
              </div>
              <div className="setting-group">
                <label>결제 방법</label>
                <div className="checkbox-list">
                  {['card', 'transfer', 'easy', 'cash'].map(method => (
                    <label key={method}>
                      <input
                        type="checkbox"
                        checked={config.payment.paymentMethods.includes(method)}
                        onChange={(e) => {
                          const methods = e.target.checked
                            ? [...config.payment.paymentMethods, method]
                            : config.payment.paymentMethods.filter(m => m !== method);
                          handleInputChange('payment', 'paymentMethods', methods);
                        }}
                      />
                      {method === 'card' && '카드 결제'}
                      {method === 'transfer' && '계좌 이체'}
                      {method === 'easy' && '간편 결제'}
                      {method === 'cash' && '현금'}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'flyer' && (
            <div className="settings-section">
              <h3>전단지 설정</h3>
              <div className="setting-group">
                <label>최대 이미지 크기 (MB)</label>
                <input
                  type="number"
                  value={config.flyer.maxImageSize}
                  onChange={(e) => handleInputChange('flyer', 'maxImageSize', parseInt(e.target.value))}
                />
              </div>
              <div className="setting-group">
                <label>기본 만료 기간 (일)</label>
                <input
                  type="number"
                  value={config.flyer.expiryDays}
                  onChange={(e) => handleInputChange('flyer', 'expiryDays', parseInt(e.target.value))}
                />
              </div>
              <div className="setting-group">
                <label>가맹점당 최대 전단지 수</label>
                <input
                  type="number"
                  value={config.flyer.maxFlyersPerMerchant}
                  onChange={(e) => handleInputChange('flyer', 'maxFlyersPerMerchant', parseInt(e.target.value))}
                />
              </div>
              <div className="setting-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={config.flyer.autoApproval}
                    onChange={(e) => handleInputChange('flyer', 'autoApproval', e.target.checked)}
                  />
                  자동 승인
                </label>
                <p className="setting-description">전단지 자동 승인 활성화 (권장하지 않음)</p>
              </div>
              <div className="setting-group">
                <label>차단 키워드</label>
                <textarea
                  value={config.flyer.moderationKeywords.join(', ')}
                  onChange={(e) => handleInputChange('flyer', 'moderationKeywords', e.target.value.split(', '))}
                  rows={3}
                  placeholder="쉼표로 구분"
                />
              </div>
            </div>
          )}

          {activeSection === 'notification' && (
            <div className="settings-section">
              <h3>알림 설정</h3>
              <div className="setting-group">
                <label>관리자 이메일</label>
                <input
                  type="email"
                  value={config.notification.adminEmail}
                  onChange={(e) => handleInputChange('notification', 'adminEmail', e.target.value)}
                />
              </div>
              <div className="setting-group">
                <label>알림 채널</label>
                <div className="checkbox-list">
                  <label>
                    <input
                      type="checkbox"
                      checked={config.notification.emailNotifications}
                      onChange={(e) => handleInputChange('notification', 'emailNotifications', e.target.checked)}
                    />
                    이메일 알림
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={config.notification.pushNotifications}
                      onChange={(e) => handleInputChange('notification', 'pushNotifications', e.target.checked)}
                    />
                    푸시 알림
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={config.notification.smsNotifications}
                      onChange={(e) => handleInputChange('notification', 'smsNotifications', e.target.checked)}
                    />
                    SMS 알림
                  </label>
                </div>
              </div>
              <div className="setting-group">
                <label>알림 유형</label>
                <div className="checkbox-list">
                  {['new_user', 'new_flyer', 'payment', 'error'].map(type => (
                    <label key={type}>
                      <input
                        type="checkbox"
                        checked={config.notification.notificationTypes.includes(type)}
                        onChange={(e) => {
                          const types = e.target.checked
                            ? [...config.notification.notificationTypes, type]
                            : config.notification.notificationTypes.filter(t => t !== type);
                          handleInputChange('notification', 'notificationTypes', types);
                        }}
                      />
                      {type === 'new_user' && '신규 사용자'}
                      {type === 'new_flyer' && '신규 전단지'}
                      {type === 'payment' && '결제 관련'}
                      {type === 'error' && '시스템 오류'}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'api' && (
            <div className="settings-section">
              <h3>API 설정</h3>
              <div className="setting-group">
                <label>API 버전</label>
                <input
                  type="text"
                  value={config.api.apiVersion}
                  onChange={(e) => handleInputChange('api', 'apiVersion', e.target.value)}
                  readOnly
                />
              </div>
              <div className="setting-group">
                <label>Rate Limit (요청/분)</label>
                <input
                  type="number"
                  value={config.api.rateLimit}
                  onChange={(e) => handleInputChange('api', 'rateLimit', parseInt(e.target.value))}
                />
              </div>
              <div className="setting-group">
                <label>Webhook URL</label>
                <input
                  type="url"
                  value={config.api.webhookUrl}
                  onChange={(e) => handleInputChange('api', 'webhookUrl', e.target.value)}
                />
              </div>
              <div className="setting-group">
                <label>API 키</label>
                <div className="api-keys-list">
                  {config.api.apiKeys.map((apiKey, index) => (
                    <div key={index} className="api-key-item">
                      <div className="api-key-info">
                        <div className="api-key-name">{apiKey.name}</div>
                        <div className="api-key-value">{apiKey.key}</div>
                        <div className="api-key-meta">
                          <span>생성: {apiKey.created}</span>
                          <span>마지막 사용: {apiKey.lastUsed}</span>
                        </div>
                      </div>
                      <button className="api-key-delete">삭제</button>
                    </div>
                  ))}
                </div>
                <button className="add-api-key" onClick={generateApiKey}>
                  새 API 키 생성
                </button>
              </div>
            </div>
          )}

          <div className="settings-actions">
            <button className="btn-save" onClick={handleSave} disabled={!unsavedChanges}>
              설정 저장
            </button>
            <button className="btn-reset" onClick={handleReset}>
              기본값으로 재설정
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}