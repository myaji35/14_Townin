'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, DollarSign, Target, Users, Calendar, Download } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState('7days');

    const overallStats = {
        totalCampaigns: 12,
        activeCampaigns: 8,
        totalViews: 8420,
        totalClicks: 356,
        totalPoints: 8900,
        avgConversion: 4.2,
        roi: 320,
        revenue: 2856000,
    };

    const topCampaigns = [
        {
            id: '1',
            title: '유기농 채소 30% 할인',
            views: 1240,
            clicks: 87,
            conversion: 7.0,
            revenue: 456000,
            status: 'excellent',
        },
        {
            id: '2',
            title: '겨울 대특가 세일',
            views: 856,
            clicks: 42,
            conversion: 4.9,
            revenue: 324000,
            status: 'good',
        },
        {
            id: '3',
            title: '주말 한정 특가',
            views: 643,
            clicks: 32,
            conversion: 5.0,
            revenue: 287000,
            status: 'good',
        },
        {
            id: '4',
            title: '회원 전용 할인',
            views: 512,
            clicks: 18,
            conversion: 3.5,
            revenue: 198000,
            status: 'average',
        },
    ];

    const monthlyData = [
        { month: '7월', views: 4200, clicks: 180, revenue: 1200000 },
        { month: '8월', views: 5100, clicks: 220, revenue: 1450000 },
        { month: '9월', views: 6300, clicks: 280, revenue: 1820000 },
        { month: '10월', views: 7200, clicks: 310, revenue: 2180000 },
        { month: '11월', views: 7800, clicks: 340, revenue: 2520000 },
        { month: '12월', views: 8420, clicks: 356, revenue: 2856000 },
    ];

    const categoryPerformance = [
        { category: '식품', campaigns: 5, views: 3240, conversion: 5.2, revenue: 1124000 },
        { category: '시즌 특가', campaigns: 3, views: 2180, conversion: 4.8, revenue: 856000 },
        { category: '웰니스', campaigns: 2, views: 1560, conversion: 3.9, revenue: 512000 },
        { category: '카페', campaigns: 2, views: 1440, conversion: 3.5, revenue: 364000 },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Header */}
            <header className="border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/merchant-dashboard">
                                <Button variant="ghost" size="sm" className="text-gray-300">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    대시보드
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-white">캠페인 종합 분석</h1>
                                <p className="text-sm text-gray-400 mt-1">전체 캠페인 성과 리포트</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            >
                                <option value="7days">최근 7일</option>
                                <option value="30days">최근 30일</option>
                                <option value="3months">최근 3개월</option>
                                <option value="6months">최근 6개월</option>
                            </select>
                            <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
                                <Download className="mr-2 h-4 w-4" />
                                리포트 다운로드
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-blue-900/20 to-blue-950/20 border-blue-500/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-blue-300">전체 조회수</CardTitle>
                            <Users className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-400 mb-1">
                                {overallStats.totalViews.toLocaleString()}
                            </div>
                            <p className="text-xs text-emerald-400">+18.2% 전월 대비</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/20 border-emerald-500/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-300">평균 전환율</CardTitle>
                            <Target className="h-4 w-4 text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-emerald-400 mb-1">
                                {overallStats.avgConversion}%
                            </div>
                            <p className="text-xs text-emerald-400">업계 평균 3.2%</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-900/20 to-purple-950/20 border-purple-500/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-purple-300">투자 대비 수익</CardTitle>
                            <TrendingUp className="h-4 w-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-400 mb-1">
                                {overallStats.roi}%
                            </div>
                            <p className="text-xs text-purple-300">ROI</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-900/20 to-amber-950/20 border-amber-500/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-amber-300">총 매출</CardTitle>
                            <DollarSign className="h-4 w-4 text-amber-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-amber-400 mb-1">
                                {(overallStats.revenue / 10000).toFixed(0)}만원
                            </div>
                            <p className="text-xs text-emerald-400">+24.8% 전월 대비</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Trend */}
                <Card className="mb-8 bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                    <CardHeader>
                        <CardTitle className="text-white">월별 성과 추이</CardTitle>
                        <CardDescription className="text-gray-400">
                            최근 6개월간 조회수, 클릭수, 매출
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {monthlyData.map((month, index) => {
                                const maxRevenue = Math.max(...monthlyData.map(m => m.revenue));
                                const revenuePercent = (month.revenue / maxRevenue) * 100;
                                const maxViews = Math.max(...monthlyData.map(m => m.views));
                                const viewsPercent = (month.views / maxViews) * 100;

                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-300 font-medium w-16">{month.month}</span>
                                            <div className="flex gap-6 text-xs">
                                                <span className="text-blue-400">{month.views.toLocaleString()} 조회</span>
                                                <span className="text-emerald-400">{month.clicks} 클릭</span>
                                                <span className="text-amber-400">{(month.revenue / 10000).toFixed(0)}만원</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1 bg-gray-700/30 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full"
                                                    style={{ width: `${viewsPercent}%` }}
                                                />
                                            </div>
                                            <div className="flex-1 bg-gray-700/30 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-amber-500 to-orange-600 h-full rounded-full"
                                                    style={{ width: `${revenuePercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Top Performing Campaigns */}
                    <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                        <CardHeader>
                            <CardTitle className="text-white">성과 우수 캠페인</CardTitle>
                            <CardDescription className="text-gray-400">
                                전환율 기준 상위 캠페인
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topCampaigns.map((campaign, index) => {
                                    const statusColor = {
                                        excellent: 'emerald',
                                        good: 'blue',
                                        average: 'amber',
                                    }[campaign.status];

                                    return (
                                        <Link
                                            key={campaign.id}
                                            href={`/merchant-dashboard/flyers/${campaign.id}/analytics`}
                                            className="block"
                                        >
                                            <div className="p-4 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-2xl font-bold text-gray-600">
                                                            #{index + 1}
                                                        </span>
                                                        <div>
                                                            <h4 className="text-white font-medium">{campaign.title}</h4>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {campaign.views.toLocaleString()} 조회 • {campaign.clicks} 클릭
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-${statusColor}-400 text-sm font-semibold`}>
                                                        {campaign.conversion}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-400">
                                                        매출: {(campaign.revenue / 10000).toFixed(0)}만원
                                                    </span>
                                                    <div className={`px-2 py-1 bg-${statusColor}-500/20 text-${statusColor}-400 rounded-full`}>
                                                        {campaign.status === 'excellent' && '우수'}
                                                        {campaign.status === 'good' && '양호'}
                                                        {campaign.status === 'average' && '보통'}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Category Performance */}
                    <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                        <CardHeader>
                            <CardTitle className="text-white">카테고리별 성과</CardTitle>
                            <CardDescription className="text-gray-400">
                                카테고리별 전환율 및 매출
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {categoryPerformance.map((cat, index) => {
                                    const maxRevenue = Math.max(...categoryPerformance.map(c => c.revenue));
                                    const percent = (cat.revenue / maxRevenue) * 100;

                                    return (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-white font-medium">{cat.category}</h4>
                                                    <p className="text-xs text-gray-400">
                                                        {cat.campaigns}개 캠페인 • {cat.views.toLocaleString()} 조회
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-amber-400 font-semibold">
                                                        {(cat.revenue / 10000).toFixed(0)}만원
                                                    </div>
                                                    <div className="text-xs text-emerald-400">
                                                        {cat.conversion}% 전환
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-gray-700/30 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-amber-500 to-orange-600 h-full rounded-full"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recommendations */}
                <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                    <CardHeader>
                        <CardTitle className="text-white">AI 추천</CardTitle>
                        <CardDescription className="text-gray-400">
                            데이터 기반 개선 제안
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg bg-emerald-900/20 border border-emerald-500/50">
                                <TrendingUp className="h-6 w-6 text-emerald-400 mb-3" />
                                <h4 className="text-emerald-400 font-semibold mb-2">식품 카테고리 강화</h4>
                                <p className="text-sm text-emerald-300">
                                    식품 카테고리의 전환율이 가장 높습니다. 추가 캠페인을 고려하세요.
                                </p>
                            </div>

                            <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-500/50">
                                <Calendar className="h-6 w-6 text-blue-400 mb-3" />
                                <h4 className="text-blue-400 font-semibold mb-2">점심 시간대 타겟팅</h4>
                                <p className="text-sm text-blue-300">
                                    12-15시 조회수가 42% 높습니다. 이 시간대에 프로모션을 집중하세요.
                                </p>
                            </div>

                            <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-500/50">
                                <Target className="h-6 w-6 text-amber-400 mb-3" />
                                <h4 className="text-amber-400 font-semibold mb-2">포인트 최적화</h4>
                                <p className="text-sm text-amber-300">
                                    25P 캠페인의 ROI가 350%입니다. 유사한 포인트 전략을 사용하세요.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
