```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './F1OS.css';

const SystemLauncherPage = () => {
  const navigate = useNavigate();
  const [connectedApps, setConnectedApps] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const handleConnect = (appId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (connectedApps.includes(appId)) {
        // Disconnect logic
        if (confirm(`Disconnect ${ appId }? Access will be revoked.`)) {
            setConnectedApps(prev => prev.filter(id => id !== appId));
        }
    } else {
        // Connect logic
        setLoading(appId);
        setTimeout(() => { // Simulate API handshake
            setConnectedApps(prev => [...prev, appId]);
            setLoading(null);
        }, 800);
    }
  };

  const handleLaunch = (appId: string) => {
    if (!connectedApps.includes(appId)) return;
    
    if (appId === 'townin') {
      navigate('/user/premium');
    } else {
      alert('System not installed.');
    }
  };

  return (
    <div className="os-landing-container">
      <div className="os-background"></div>
      
      <div style={{ zIndex: 10, textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '40px' }}>Authorize Systems</h2>
        
        <div className="launcher-grid">
            {/* Townin App Card */}
            <div 
                className={`app - icon - container ${ connectedApps.includes('townin') ? 'active' : '' } `}
                onClick={() => handleLaunch('townin')}
                style={{ 
                    background: 'rgba(28, 28, 30, 0.6)', 
                    padding: '30px', 
                    borderRadius: '24px', 
                    backdropFilter: 'blur(20px)',
                    border: connectedApps.includes('townin') ? '1px solid #FF6B6B' : '1px solid rgba(255,255,255,0.1)',
                    cursor: connectedApps.includes('townin') ? 'pointer' : 'default',
                    opacity: connectedApps.includes('townin') ? 1 : 0.7,
                    transition: 'all 0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: '200px'
                }}
            >
            <div className="app-icon" style={{ marginBottom: '20px' }}>T</div>
            <div style={{ marginBottom: '20px', fontWeight: '600' }}>Townin</div>
            
            <button 
                onClick={(e) => handleConnect('townin', e)}
                style={{
                    padding: '8px 20px',
                    borderRadius: '20px',
                    border: 'none',
                    background: connectedApps.includes('townin') ? '#30d158' : 'white',
                    color: connectedApps.includes('townin') ? 'white' : 'black',
                    fontWeight: '600',
                    cursor: 'pointer'
                }}
            >
                {loading === 'townin' ? 'Verifying...' : (connectedApps.includes('townin') ? 'Connected' : 'Connect')}
            </button>
            </div>

            {/* Other Apps (Disabled) */}
            <div style={{ 
                    background: 'rgba(28, 28, 30, 0.4)', 
                    padding: '30px', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    opacity: 0.5, 
                    filter: 'grayscale(100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: '200px'
                }}>
                <div className="app-icon memex">M</div>
                <div style={{ marginBottom: '20px', fontWeight: '600', color: 'white' }}>Memex</div>
                <button style={{ padding: '8px 20px', borderRadius: '20px', border:'none' }} disabled>Coming Soon</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SystemLauncherPage;
```
