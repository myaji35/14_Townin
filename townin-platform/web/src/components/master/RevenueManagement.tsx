import { useState, useEffect } from 'react';
import './RevenueManagement.css';

interface RevenueData {
  date: string;
  revenue: number;
  transactions: number;
  avgTransaction: number;
}

interface PaymentMethod {
  method: string;
  amount: number;
  percentage: number;
  icon: string;
}

interface TopMerchant {
  id: string;
  name: string;
  revenue: number;
  transactions: number;
  growth: number;
}

interface CategoryRevenue {
  category: string;
  revenue: number;
  percentage: number;
  trend: number;
}

export default function RevenueManagement() {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [avgTransactionValue, setAvgTransactionValue] = useState(0);
  const [growthRate, setGrowthRate] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [topMerchants, setTopMerchants] = useState<TopMerchant[]>([]);
  const [categoryRevenue, setCategoryRevenue] = useState<CategoryRevenue[]>([]);

  useEffect(() => {
    // Mock 데이터 로드
    setRevenueData([
      { date: '2024-03-01', revenue: 3450000, transactions: 234, avgTransaction: 14744 },
      { date: '2024-03-02', revenue: 4120000, transactions: 312, avgTransaction: 13205 },
      { date: '2024-03-03', revenue: 3890000, transactions: 298, avgTransaction: 13054 },
      { date: '2024-03-04', revenue: 5230000, transactions: 412, avgTransaction: 12694 },
      { date: '2024-03-05', revenue: 4780000, transactions: 367, avgTransaction: 13024 },
      { date: '2024-03-06', revenue: 5890000, transactions: 445, avgTransaction: 13236 },
      { date: '2024-03-07', revenue: 6230000, transactions: 489, avgTransaction: 12740 },
      { date: '2024-03-08', revenue: 5450000, transactions: 423, avgTransaction: 12884 },
      { date: '2024-03-09', revenue: 4890000, transactions: 378, avgTransaction: 12936 },
      { date: '2024-03-10', revenue: 5120000, transactions: 401, avgTransaction: 12768 },
    ]);

    setTotalRevenue(125340000);
    setTotalTransactions(9876);
    setAvgTransactionValue(12693);
    setGrowthRate(15.7);

    setPaymentMethods([
      { method: '카드결제', amount: 67890000, percentage: 54.2, icon: '💳' },
      { method: '계좌이체', amount: 31230000, percentage: 24.9, icon: '🏦' },
      { method: '간편결제', amount: 18900000, percentage: 15.1, icon: '📱' },
      { method: '현금', amount: 7320000, percentage: 5.8, icon: '💵' },
    ]);

    setTopMerchants([
      { id: '1', name: '바삭바삭치킨', revenue: 8900000, transactions: 567, growth: 23.4 },
      { id: '2', name: '행복마트', revenue: 7650000, transactions: 892, growth: 12.3 },
      { id: '3', name: '패션의정원', revenue: 6230000, transactions: 234, growth: 45.6 },
      { id: '4', name: '카페드림', revenue: 5890000, transactions: 678, growth: -5.2 },
      { id: '5', name: '예쁜미용실', revenue: 4560000, transactions: 123, growth: 8.9 },
    ]);

    setCategoryRevenue([
      { category: '음식점', revenue: 45670000, percentage: 36.4, trend: 12.3 },
      { category: '카페', revenue: 23450000, percentage: 18.7, trend: 8.9 },
      { category: '소매', revenue: 19870000, percentage: 15.9, trend: -2.1 },
      { category: '미용', revenue: 15670000, percentage: 12.5, trend: 15.6 },
      { category: '운동', revenue: 12340000, percentage: 9.8, trend: 23.4 },
      { category: '기타', revenue: 8340000, percentage: 6.7, trend: 5.2 },
    ]);
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const getMaxRevenue = () => {
    return Math.max(...revenueData.map(d => d.revenue));
  };

  return (
    <div className="revenue-management">
      <div className="revenue-header">
        <h2>수익 관리</h2>
        <div className="period-selector">
          <button
            className={selectedPeriod === 'day' ? 'active' : ''}
            onClick={() => setSelectedPeriod('day')}
          >
            일간
          </button>
          <button
            className={selectedPeriod === 'week' ? 'active' : ''}
            onClick={() => setSelectedPeriod('week')}
          >
            주간
          </button>
          <button
            className={selectedPeriod === 'month' ? 'active' : ''}
            onClick={() => setSelectedPeriod('month')}
          >
            월간
          </button>
          <button
            className={selectedPeriod === 'year' ? 'active' : ''}
            onClick={() => setSelectedPeriod('year')}
          >
            연간
          </button>
        </div>
      </div>

      {/* 핵심 지표 */}
      <div className="revenue-stats">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">총 수익</div>
            <div className="stat-value">{formatCurrency(totalRevenue)}</div>
            <div className={`stat-change ${growthRate > 0 ? 'positive' : 'negative'}`}>
              {growthRate > 0 ? '↑' : '↓'} {Math.abs(growthRate)}%
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">총 거래</div>
            <div className="stat-value">{formatNumber(totalTransactions)}건</div>
            <div className="stat-change positive">↑ 12.3%</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <div className="stat-label">평균 거래액</div>
            <div className="stat-value">{formatCurrency(avgTransactionValue)}</div>
            <div className="stat-change negative">↓ 2.1%</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-label">성장률</div>
            <div className="stat-value">{growthRate}%</div>
            <div className="stat-sub">전월 대비</div>
          </div>
        </div>
      </div>

      {/* 수익 차트 */}
      <div className="revenue-chart-container">
        <div className="chart-header">
          <h3>수익 추이</h3>
          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-color" style={{ background: '#667eea' }}></span>
              수익
            </span>
            <span className="legend-item">
              <span className="legend-color" style={{ background: '#10b981' }}></span>
              거래
            </span>
          </div>
        </div>
        <div className="revenue-chart">
          {revenueData.map((data, index) => (
            <div key={index} className="chart-bar-group">
              <div className="chart-values">
                <span className="revenue-value">{(data.revenue / 1000000).toFixed(1)}M</span>
                <span className="transaction-value">{data.transactions}</span>
              </div>
              <div className="chart-bars">
                <div
                  className="revenue-bar"
                  style={{ height: `${(data.revenue / getMaxRevenue()) * 200}px` }}
                ></div>
                <div
                  className="transaction-bar"
                  style={{ height: `${(data.transactions / 500) * 200}px` }}
                ></div>
              </div>
              <div className="chart-label">{data.date.substring(5)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="revenue-grid">
        {/* 결제 방법별 분석 */}
        <div className="revenue-card">
          <h3>결제 방법별 현황</h3>
          <div className="payment-methods">
            {paymentMethods.map((method, index) => (
              <div key={index} className="payment-method">
                <div className="method-icon">{method.icon}</div>
                <div className="method-info">
                  <div className="method-name">{method.method}</div>
                  <div className="method-amount">{formatCurrency(method.amount)}</div>
                </div>
                <div className="method-percentage">
                  <div className="percentage-value">{method.percentage}%</div>
                  <div className="percentage-bar">
                    <div
                      className="percentage-fill"
                      style={{ width: `${method.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 상위 가맹점 */}
        <div className="revenue-card">
          <h3>상위 가맹점</h3>
          <div className="top-merchants">
            <table>
              <thead>
                <tr>
                  <th>순위</th>
                  <th>가맹점</th>
                  <th>수익</th>
                  <th>거래</th>
                  <th>성장률</th>
                </tr>
              </thead>
              <tbody>
                {topMerchants.map((merchant, index) => (
                  <tr key={merchant.id}>
                    <td className="rank">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && index + 1}
                    </td>
                    <td className="merchant-name">{merchant.name}</td>
                    <td className="merchant-revenue">{formatCurrency(merchant.revenue)}</td>
                    <td className="merchant-transactions">{merchant.transactions}</td>
                    <td className={`merchant-growth ${merchant.growth > 0 ? 'positive' : 'negative'}`}>
                      {merchant.growth > 0 ? '↑' : '↓'} {Math.abs(merchant.growth)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 카테고리별 수익 */}
        <div className="revenue-card">
          <h3>카테고리별 수익</h3>
          <div className="category-revenue">
            {categoryRevenue.map((category, index) => (
              <div key={index} className="category-item">
                <div className="category-header">
                  <span className="category-name">{category.category}</span>
                  <span className="category-amount">{formatCurrency(category.revenue)}</span>
                </div>
                <div className="category-bar-container">
                  <div
                    className="category-bar"
                    style={{
                      width: `${category.percentage}%`,
                      background: `hsl(${250 + index * 30}, 70%, 60%)`
                    }}
                  ></div>
                </div>
                <div className="category-footer">
                  <span className="category-percentage">{category.percentage}%</span>
                  <span className={`category-trend ${category.trend > 0 ? 'positive' : 'negative'}`}>
                    {category.trend > 0 ? '↑' : '↓'} {Math.abs(category.trend)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 수익 예측 */}
        <div className="revenue-card">
          <h3>수익 예측</h3>
          <div className="revenue-forecast">
            <div className="forecast-item">
              <div className="forecast-period">이번 달 예상</div>
              <div className="forecast-amount">{formatCurrency(145000000)}</div>
              <div className="forecast-confidence">신뢰도 85%</div>
            </div>
            <div className="forecast-item">
              <div className="forecast-period">다음 달 예상</div>
              <div className="forecast-amount">{formatCurrency(156000000)}</div>
              <div className="forecast-confidence">신뢰도 72%</div>
            </div>
            <div className="forecast-divider"></div>
            <div className="forecast-summary">
              <p>AI 분석 결과:</p>
              <ul>
                <li>주말 수익이 평일 대비 35% 높음</li>
                <li>저녁 시간대(18-21시) 거래 집중</li>
                <li>음식점 카테고리 성장세 지속</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 수익 관리 도구 */}
      <div className="revenue-tools">
        <button className="tool-btn export">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 10v3a1 1 0 001 1h10a1 1 0 001-1v-3M8 2v8M8 2L5 5M8 2l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          보고서 내보내기
        </button>
        <button className="tool-btn settings">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 1v2M8 13v2M15 8h-2M3 8H1M13 13l-1.5-1.5M4.5 4.5L3 3M13 3l-1.5 1.5M4.5 11.5L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          수익 설정
        </button>
        <button className="tool-btn analysis">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 12L6 8L9 10L14 4M14 4V8M14 4H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          상세 분석
        </button>
      </div>
    </div>
  );
}