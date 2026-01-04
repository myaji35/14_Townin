import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ko' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Load from localStorage or default to Korean
    const saved = localStorage.getItem('townin-language') as Language;
    return saved || 'ko';
  });

  useEffect(() => {
    localStorage.setItem('townin-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

// Translation data
const translations: Record<Language, any> = {
  ko: {
    common: {
      home: '홈',
      digitalFlyers: 'Digital Flyers',
      safetyMap: '안전지도',
      flyers: '전단지',
      points: '포인트',
      myInfo: '내정보',
      location: '위치',
      notifications: '알림',
      wallet: '내 지갑',
    },
    sidebar: {
      myPoints: '내 포인트',
      myPointsStatus: '내 포인트 현황',
      pointsGained: '이번 달 획득',
      earnedThisWeek: '이번 주 획득',
      streak: '일 연속',
      premiumMember: '프리미엄 회원',
      navigation: '탐색',
      filterCategories: '카테고리 필터',
      allCategories: '전체 카테고리',
      foodDining: '음식 & 식당',
      retailShopping: '쇼핑 & 소매',
      healthWellness: '건강 & 웰니스',
      lifeServices: '생활 서비스',
      community: '커뮤니티',
      hyperLocalLife: 'Hyper-local Life',
    },
    dashboard: {
      greeting: '환영합니다',
      graphragTitle: 'AI GraphRAG 분석 완료',
      graphragDescription: '2,340개의 로컬 전단지를 분석하여 맞춤형 추천을 제공합니다.',
      recommendedForYou: '이번 주 추천',
      loadMore: '더 많은 전단지 보기',
      personalizedHelp: '맞춤형 도움',
      earnPoints: '포인트 받기',
      earnPointsValue: '{{points}}P 받기',
      badge: {
        new: 'NEW',
        hot: 'HOT',
        aiRecommended: 'AI 추천',
      },
    },
    flyer: {
      distance: '거리',
      category: '카테고리',
      viewCount: '조회수',
      clickCount: '클릭수',
      aiPick: 'AI 선택',
      earnPoints: '포인트 받기',
    },
    location: {
      gyeonggi: '경기도',
      uijeongbu: '의정부시',
      uijeongbuFull: '경기도 의정부시',
    },
    category: {
      all: '전체',
      food: '음식 & 식당',
      health: '건강 & 웰니스',
      retail: '쇼핑 & 소매',
      entertainment: '엔터테인먼트',
    },
    merchant: {
      welcome: '환영합니다',
      dashboard: '사장님 대시보드',
      businessName: '매장명',
      activeFlyers: '활성 전단지',
      totalViews: '총 조회수',
      totalClicks: '총 클릭수',
      clickRate: '클릭률',
      createFlyer: '새 전단지 등록',
      manageFlyers: '내 전단지 관리',
      performance: '성과 분석',
      settings: '매장 관리',
      feedback: '고객 피드백',
      active: '활성',
      inactive: '비활성',
      views: '조회',
      clicks: '클릭',
      edit: '수정',
      delete: '삭제',
      activate: '활성화',
      deactivate: '비활성화',
    },
    partner: {
      welcome: '환영합니다',
      dashboard: '지역 관리자',
      areaManager: '지역 파트너',
      myArea: '담당 구역',
      pendingFlyers: '승인 대기 전단지',
      approvedFlyers: '승인 완료',
      totalEarnings: '총 수익',
      earnedPoints: '획득 포인트',
      clickCommission: '클릭 수수료',
      approveFlyer: '승인',
      rejectFlyer: '반려',
      areaStats: '구역 통계',
      activeUsers: '활동 사용자',
      activeMerchants: '활동 사장님',
      recentActivities: '최근 활동',
      approve: '승인',
      reject: '반려',
      pending: '대기중',
      approved: '승인됨',
      rejected: '반려됨',
      viewDetails: '상세보기',
      earnings: '수익',
      commission: '수수료',
      perClick: '클릭당',
    },
    securityGuard: {
      welcome: '환영합니다',
      dashboard: '보안관 대시보드',
      areaGuard: '지역 보안관',
      myArea: '담당 구역',
      safetyScore: '안전도 점수',
      activityScore: '활동 점수',
      totalPatrols: '순찰 횟수',
      incidentReports: '사고 보고',
      areaStatus: '구역 상태',
      safetyMonitoring: '안전 모니터링',
      cctvStatus: 'CCTV 상태',
      emergencyAlerts: '긴급 알림',
      patrolHistory: '순찰 내역',
      reportIncident: '사고 신고',
      viewMap: '지도 보기',
      allClear: '이상 없음',
      needsAttention: '주의 필요',
      critical: '긴급',
      online: '정상',
      offline: '오프라인',
    },
    master: {
      welcome: '환영합니다',
      dashboard: '마스터 대시보드',
      systemMaster: '시스템 마스터',
      overview: '시스템 개요',
      partnerManagement: '파트너 관리',
      totalRevenue: '총 수익',
      monthlyRevenue: '월 수익',
      totalPartners: '총 파트너',
      activePartners: '활성 파트너',
      totalUsers: '총 사용자',
      activeUsers: '활성 사용자',
      totalFlyers: '총 전단지',
      pendingFlyers: '승인 대기',
      systemHealth: '시스템 상태',
      partnerPerformance: '파트너 성과',
      regionalStats: '지역별 통계',
      revenueAnalytics: '수익 분석',
      topPartners: '우수 파트너',
      recentActivities: '최근 활동',
    },
  },
  en: {
    common: {
      home: 'Home',
      digitalFlyers: 'Digital Flyers',
      safetyMap: 'Safety Map',
      flyers: 'Flyers',
      points: 'Points',
      myInfo: 'My Info',
      location: 'Location',
      notifications: 'Notifications',
      wallet: 'My Wallet',
    },
    sidebar: {
      myPoints: 'My Points',
      pointsGained: 'Gained This Month',
      streak: 'Day Streak',
      premiumMember: 'Premium Member',
      navigation: 'Navigation',
    },
    dashboard: {
      greeting: 'Welcome',
      graphragTitle: 'AI GraphRAG Analysis Complete',
      graphragDescription: 'We\'ve analyzed 2,340 local flyers and personalized recommendations based on your preferences, location patterns, and community insights.',
      recommendedForYou: 'Recommended For You',
      loadMore: 'Load More Flyers',
      personalizedHelp: 'Personalized Help',
      earnPoints: 'Earn Points',
      earnPointsValue: 'Earn {{points}}P',
      badge: {
        new: 'NEW',
        hot: 'HOT',
        aiRecommended: 'AI Recommended',
      },
    },
    flyer: {
      distance: 'Distance',
      category: 'Category',
      viewCount: 'Views',
      clickCount: 'Clicks',
      aiPick: 'AI Pick',
      earnPoints: 'Earn Points',
    },
    location: {
      gyeonggi: 'Gyeonggi-do',
      uijeongbu: 'Uijeongbu',
      uijeongbuFull: 'Uijeongbu, Gyeonggi-do',
    },
    category: {
      all: 'All',
      food: 'Food & Dining',
      health: 'Health & Wellness',
      retail: 'Retail Shopping',
      entertainment: 'Entertainment',
    },
    merchant: {
      welcome: 'Welcome',
      dashboard: 'Merchant Dashboard',
      businessName: 'Business Name',
      activeFlyers: 'Active Flyers',
      totalViews: 'Total Views',
      totalClicks: 'Total Clicks',
      clickRate: 'Click Rate',
      createFlyer: 'Create New Flyer',
      manageFlyers: 'Manage My Flyers',
      performance: 'Performance Analytics',
      settings: 'Store Settings',
      feedback: 'Customer Feedback',
      active: 'Active',
      inactive: 'Inactive',
      views: 'Views',
      clicks: 'Clicks',
      edit: 'Edit',
      delete: 'Delete',
      activate: 'Activate',
      deactivate: 'Deactivate',
    },
    partner: {
      welcome: 'Welcome',
      dashboard: 'Area Manager',
      areaManager: 'Community Partner',
      myArea: 'My Area',
      pendingFlyers: 'Pending Approval',
      approvedFlyers: 'Approved',
      totalEarnings: 'Total Earnings',
      earnedPoints: 'Earned Points',
      clickCommission: 'Click Commission',
      approveFlyer: 'Approve',
      rejectFlyer: 'Reject',
      areaStats: 'Area Statistics',
      activeUsers: 'Active Users',
      activeMerchants: 'Active Merchants',
      recentActivities: 'Recent Activities',
      approve: 'Approve',
      reject: 'Reject',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      viewDetails: 'View Details',
      earnings: 'Earnings',
      commission: 'Commission',
      perClick: 'per click',
    },
    securityGuard: {
      welcome: 'Welcome',
      dashboard: 'Security Guard',
      areaGuard: 'Area Guard',
      myArea: 'My Area',
      safetyScore: 'Safety Score',
      activityScore: 'Activity Score',
      totalPatrols: 'Total Patrols',
      incidentReports: 'Incident Reports',
      areaStatus: 'Area Status',
      safetyMonitoring: 'Safety Monitoring',
      cctvStatus: 'CCTV Status',
      emergencyAlerts: 'Emergency Alerts',
      patrolHistory: 'Patrol History',
      reportIncident: 'Report Incident',
      viewMap: 'View Map',
      allClear: 'All Clear',
      needsAttention: 'Needs Attention',
      critical: 'Critical',
      online: 'Online',
      offline: 'Offline',
    },
    master: {
      welcome: 'Welcome',
      dashboard: 'Master Dashboard',
      systemMaster: 'System Master',
      overview: 'System Overview',
      partnerManagement: 'Partner Management',
      totalRevenue: 'Total Revenue',
      monthlyRevenue: 'Monthly Revenue',
      totalPartners: 'Total Partners',
      activePartners: 'Active Partners',
      totalUsers: 'Total Users',
      activeUsers: 'Active Users',
      totalFlyers: 'Total Flyers',
      pendingFlyers: 'Pending Approval',
      systemHealth: 'System Health',
      partnerPerformance: 'Partner Performance',
      regionalStats: 'Regional Statistics',
      revenueAnalytics: 'Revenue Analytics',
      topPartners: 'Top Partners',
      recentActivities: 'Recent Activities',
    },
  },
};
