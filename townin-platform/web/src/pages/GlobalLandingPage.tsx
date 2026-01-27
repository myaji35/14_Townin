import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './F1OS.css';

const GlobalLandingPage = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, perform global auth here.
        // For demo, just go to launcher.
        navigate('/launcher');
    };

    return (
        <div className="os-landing-container">
            <div className="os-background"></div>
            <div className="os-orb" style={{ background: 'conic-gradient(from 180deg at 50% 50%, #30d158 0deg, #0a84ff 120deg, #30d158 240deg, #30d158 360deg)' }}></div>

            <div className="login-card">
                <h1 className="os-logo" style={{ background: 'linear-gradient(135deg, #30d158 0%, #0a84ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FLUSH</h1>
                <p className="os-subtitle">Secure Identity Provider</p>

                <form onSubmit={handleAuth}>
                    <div className="os-input-group">
                        <input
                            type="email"
                            placeholder="Flush ID"
                            className="os-input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Passkey"
                            className="os-input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="os-btn" style={{ background: '#30d158', color: 'white' }}>
                        {isLogin ? 'Secure Login' : 'Create Vault'}
                    </button>
                </form>

                <div className="os-footer" onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer' }}>
                    {isLogin ? "New to Flush? Create Secure Vault" : "Access Existing Vault"}
                </div>
            </div>
        </div>
    );
};

export default GlobalLandingPage;
