import React, { useState } from 'react';
import './AvatarCreatePage.css';
import axios from 'axios';

const AvatarCreatePage = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        height: 175,
        weight: 70,
        gender: 'male' as 'male' | 'female',
        topFit: 'regular',
        bottomFit: 'regular'
    });
    const [result, setResult] = useState<any>(null);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // API call to backend
            const response = await axios.post('http://localhost:4030/api/v1/avatar/test-user-123', {
                height: Number(formData.height),
                weight: Number(formData.weight),
                gender: formData.gender
            });

            setResult(response.data);
        } catch (error) {
            console.error('Failed to create avatar:', error);
            alert('아바타 생성 실패! 서버가 실행 중인지 확인해주세요.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="avatar-create-container">
            <div className="avatar-header">
                <h1 className="avatar-title">Townin Fit</h1>
                <div className="flush-badge">
                    🛡️ Zero-Data Scan
                </div>
            </div>

            <div className="avatar-preview-area">
                {loading ? (
                    <div className="loading-spinner">Scanning...</div>
                ) : (
                    <div className="avatar-model">
                        {/* Placeholder for 3D Model */}
                        <div className="avatar-placeholder">🧍</div>
                        {result && (
                            <>
                                <div className="metric-tag tag-height" style={{ top: '20%', left: '10%' }}>
                                    📏 {result.measurements.shoulderWidth}cm (어깨)
                                </div>
                                <div className="metric-tag tag-weight" style={{ bottom: '20%', right: '10%' }}>
                                    📐 {result.measurements.waistCircumference}cm (허리)
                                </div>
                            </>
                        )}
                        {!result && (
                            <>
                                <div className="metric-tag tag-height">Height: {formData.height}cm</div>
                                <div className="metric-tag tag-weight">Weight: {formData.weight}kg</div>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="form-panel">
                <div className="input-group">
                    <label className="input-label">기본 정보 (Body Metrics)</label>
                    <div className="input-row">
                        <input
                            type="number"
                            className="text-input"
                            value={formData.height}
                            onChange={e => setFormData({ ...formData, height: Number(e.target.value) })}
                            placeholder="Height (cm)"
                        />
                        <input
                            type="number"
                            className="text-input"
                            value={formData.weight}
                            onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })}
                            placeholder="Weight (kg)"
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label className="input-label">Fit Preference - Top</label>
                    <div className="toggle-group">
                        {['tight', 'regular', 'loose'].map(fit => (
                            <button
                                key={fit}
                                className={`toggle-option ${formData.topFit === fit ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, topFit: fit as any })}
                            >
                                {fit.charAt(0).toUpperCase() + fit.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Processing via FLUSH...' : 'Create AI Avatar'}
                </button>
            </div>

            {result && (
                <div className="result-overlay" onClick={() => setResult(null)}>
                    <div className="result-card" onClick={e => e.stopPropagation()}>
                        <h2>🎉 Avatar Created!</h2>
                        <p>Your measurements adhere to <strong>Flush Protocol</strong>.</p>
                        <div style={{ margin: '20px 0', textAlign: 'left', background: '#f5f5f7', padding: '15px', borderRadius: '12px' }}>
                            <p>🔹 <strong>Inseam:</strong> {result.measurements.inseam}cm</p>
                            <p>🔹 <strong>Thigh:</strong> {result.measurements.thighCircumference}cm</p>
                            <p>🔹 <strong>Arm:</strong> {result.measurements.armLength}cm</p>
                            <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                                * Original data flushed. Only mesh tokens retained.
                            </p>
                        </div>
                        <button className="submit-btn" onClick={() => setResult(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvatarCreatePage;
