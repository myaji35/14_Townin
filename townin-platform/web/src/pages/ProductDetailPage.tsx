import React, { useState, useEffect } from 'react';
import { Shirt, Ruler, CheckCircle } from 'lucide-react';
import axios from 'axios';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
    const [loading, setLoading] = useState(false);
    const [recommendation, setRecommendation] = useState<any>(null);
    const [selectedSize, setSelectedSize] = useState('M');

    // Mock Product Data
    const product = {
        id: 'prod_123',
        name: 'Townin Signature Hoodie',
        price: '₩89,000',
        colors: ['Black', 'Gray', 'Navy'],
        sizes: ['S', 'M', 'L', 'XL'],
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=500'
    };

    const checkFit = async () => {
        setLoading(true);
        try {
            // API call to backend Endpoint we prepared earlier: POST /api/v1/avatar/:userId/recommend-size
            const response = await axios.post('http://localhost:4030/api/v1/avatar/test-user-123/recommend-size', {
                productId: product.id,
                category: 'top' // hoodie is a top
            });

            setRecommendation(response.data);
            if (response.data.recommendedSize) {
                setSelectedSize(response.data.recommendedSize);
            }
        } catch (error) {
            console.error('Failed to get recommendation:', error);
            // Fallback
            setRecommendation({
                recommendedSize: 'L',
                fitDescription: 'Based on your height 178cm, we recommend L.',
                matchScore: 85
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Auto-check fit on load if user is logged in (simulated)
        checkFit();
    }, []);

    return (
        <div className="product-page-container">
            <div className="product-grid">
                {/* Image Section */}
                <div className="product-image-section">
                    <img src={product.image} alt={product.name} className="product-main-image" />
                    <div className="flush-shield-badge">
                        🛡️ Zero-Data Fitting Active
                    </div>
                </div>

                {/* Info Section */}
                <div className="product-info-section">
                    <div className="product-header">
                        <h2 className="brand-name">Townin Originals</h2>
                        <h1 className="product-name">{product.name}</h1>
                        <p className="product-price">{product.price}</p>
                    </div>

                    {/* AI Recommendation Card */}
                    <div className="ai-fit-card">
                        <div className="ai-fit-header">
                            <Shirt size={20} className="ai-icon" />
                            <span className="ai-title">Townin Fit Recommendation</span>
                        </div>

                        {loading ? (
                            <div className="ai-loading">Analyzing your fit...</div>
                        ) : recommendation ? (
                            <div className="ai-result">
                                <div className="ai-score-ring">
                                    <span className="score">{recommendation.matchScore}%</span>
                                    <span className="label">Match</span>
                                </div>
                                <div className="ai-text">
                                    <strong className="recommend-size">Size {recommendation.recommendedSize}</strong>
                                    <p className="fit-desc">{recommendation.fitDescription}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="ai-error">Fit analysis unavailable.</div>
                        )}
                    </div>

                    {/* Size Selector */}
                    <div className="option-group">
                        <label>Size</label>
                        <div className="size-grid">
                            {product.sizes.map(size => (
                                <button
                                    key={size}
                                    className={`size-btn ${selectedSize === size ? 'selected' : ''} ${recommendation?.recommendedSize === size ? 'recommended' : ''}`}
                                    onClick={() => setSelectedSize(size)}
                                >
                                    {size}
                                    {recommendation?.recommendedSize === size && <span className="rec-badge">Fit</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button className="add-to-cart-btn">Add to Bag - {product.price}</button>

                    <p className="flush-note">
                        * Your body data is processed via <strong>FLUSH Protocol</strong> and is never stored permanently.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
