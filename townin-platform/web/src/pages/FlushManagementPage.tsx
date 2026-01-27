import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import './FlushManagementPage.css';

const FlushManagementPage = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>({ addresses: [], emails: [], phones: [] });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // API call to our new controller
            const res = await axios.get('http://localhost:4030/api/v1/flush/dashboard/test-user-123');
            setData(res.data);
        } catch (error) {
            console.error('Failed to fetch flush data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (type: 'address' | 'email' | 'phone') => {
        // In a real app, this would open a modal to input real data
        const mockRealData = {
            address: '서울특별시 강남구 테헤란로 123',
            email: 'my-real-email@gmail.com',
            phone: '010-1234-5678'
        };

        try {
            if (type === 'email') {
                const res = await axios.post('http://localhost:4030/api/v1/flush/email', { realEmail: mockRealData.email });
                setData(prev => ({
                    ...prev,
                    emails: [...prev.emails, { id: Date.now(), alias: 'New Item', virtual: res.data.virtualAddress, active: true }]
                }));
            } else if (type === 'phone') {
                const res = await axios.post('http://localhost:4030/api/v1/flush/phone', { realPhone: mockRealData.phone, type: 'delivery' });
                setData(prev => ({
                    ...prev,
                    phones: [...prev.phones, { id: Date.now(), alias: 'New Delivery', virtual: res.data.virtualNumber, active: true }]
                }));
            } else {
                // Address mock
                const res = await axios.post('http://localhost:4030/api/v1/flush/address', { realAddress: mockRealData.address });
                setData(prev => ({
                    ...prev,
                    addresses: [...prev.addresses, { id: Date.now(), alias: 'New Address', token: res.data.token, active: true }]
                }));
            }
        } catch (error) {
            alert('Failed to generate safe asset. Is Flush Server running?');
        }
    };

    const handleKill = async (type: string, id: string, virtualValue: string) => {
        if (!confirm('정말로 이 연결을 끊으시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

        // Call API (Optimistic update)
        // delete axios.delete(...)

        setData(prev => ({
            ...prev,
            [type + 's']: prev[type + 's'].map(item => item.id === id ? { ...item, active: false } : item)
        }));
    };

    return (
        <div className="flush-management-container">
            <div className="flush-header">
                <h1 className="flush-title">Flush Privacy Center</h1>
                <p className="flush-subtitle">Manage your ephemeral contact points. Connect safely, disconnect instantly.</p>
            </div>

            <div className="flush-grid">
                {/* Flush Addresses */}
                <div className="flush-card">
                    <div className="card-header">
                        <div className="card-icon"><MapPin size={20} color="#007aff" /></div>
                        <span className="card-title">Safe Addresses</span>
                    </div>
                    <div className="asset-list">
                        {data.addresses.map((item: any) => (
                            <div className="asset-item" key={item.id}>
                                <div className="asset-info">
                                    <span className="asset-alias">{item.alias}</span>
                                    <span className="asset-value">{item.token.substr(0, 12)}...</span>
                                </div>
                                <button
                                    className={`kill-btn ${!item.active ? 'killed' : ''}`}
                                    onClick={() => handleKill('addresse', item.id, item.token)}
                                >
                                    {item.active ? 'KILL' : 'EXPIRED'}
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="add-btn" onClick={() => handleCreate('address')}>+ New Safe Address</button>
                </div>

                {/* Flush Emails */}
                <div className="flush-card">
                    <div className="card-header">
                        <div className="card-icon"><Mail size={20} color="#34c759" /></div>
                        <span className="card-title">Relay Emails</span>
                    </div>
                    <div className="asset-list">
                        {data.emails.map((item: any) => (
                            <div className="asset-item" key={item.id}>
                                <div className="asset-info">
                                    <span className="asset-alias">{item.alias} {item.active && '🟢'}</span>
                                    <span className="asset-value">{item.virtual}</span>
                                </div>
                                <button
                                    className={`kill-btn ${!item.active ? 'killed' : ''}`}
                                    onClick={() => handleKill('email', item.id, item.virtual)}
                                >
                                    {item.active ? 'KILL SWITCH' : 'BLOCKED'}
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="add-btn" onClick={() => handleCreate('email')}>+ New Relay Email</button>
                </div>

                {/* Flush Phones */}
                <div className="flush-card">
                    <div className="card-header">
                        <div className="card-icon"><Phone size={20} color="#ff9500" /></div>
                        <span className="card-title">Virtual Phones</span>
                    </div>
                    <div className="asset-list">
                        {data.phones.map((item: any) => (
                            <div className="asset-item" key={item.id}>
                                <div className="asset-info">
                                    <span className="asset-alias">{item.alias}</span>
                                    <span className="asset-value">{item.virtual}</span>
                                </div>
                                <button
                                    className={`kill-btn ${!item.active ? 'killed' : ''}`}
                                    onClick={() => handleKill('phone', item.id, item.virtual)}
                                >
                                    {item.active ? 'DISCONNECT' : 'OFF'}
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="add-btn" onClick={() => handleCreate('phone')}>+ New Virtual Phone</button>
                </div>
            </div>
        </div>
    );
};

export default FlushManagementPage;
