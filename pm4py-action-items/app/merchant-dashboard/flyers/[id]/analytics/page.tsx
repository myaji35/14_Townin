'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown, Eye, MousePointerClick, Users, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function FlyerAnalyticsPage({ params }: { params: { id: string } }) {
    const flyerData = {
        title: '유기농 채소 30% 할인',
        period: '2025-12-01 ~ 2025-12-31',
        status: 'active',
    };

    const stats = {
        totalViews: 1240,
        totalClicks: 87,
        pointsGiven: 625,
        conversion: 7.0,
        viewsGrowth: 12.5,
        clicksGrowth: 8.3,
    };

    const dailyData = [
        { date: '12/15', views: 45, clicks: 3 },
        { date: '12/16', views: 62, clicks: 5 },
        { date: '12/17', views: 89, clicks: 8 },
        { date: '12/18', views: 134, clicks: 12 },
        { date: '12/19', views: 156, clicks: 14 },
        { date: '12/20', views: 178, clicks: 16 },
        { date: '12/21', views: 201, clicks: 18 },
    ];

    const topLocations = [
        { location: '의정부동', views: 486, clicks: 35 },
        { location: '신곡동', views: 324, clicks: 22 },
        { location: '장암동', views: 218, clicks: 16 },
        { location: '호원동', views: 156, clicks: 10 },
        { location: '기타', views: 56, clicks: 4 },
    ];

    const hourlyData = [
        { hour: '00-06', views: 12 },
        { hour: '06-09', views: 45 },
        { hour: '09-12', views: 234 },
        { hour: '12-15', views: 356 },
        { hour: '15-18', views: 298 },
        { hour: '18-21', views: 234 },
        { hour: '21-24', views: 61 },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Header */}
            <header className="border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/merchant-dashboard/flyers">
                                <Button variant="ghost" size="sm" className="text-gray-300">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    돌아가기
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-white">{flyerData.title}</h1>
                                <p className="text-sm text-gray-400 mt-1">
                                    📅 {flyerData.period} • 전단지 분석
                                </p>
                            </div>
                        </div>
                        <Link href={`/merchant-dashboard/flyers/${params.id}`}>
                            <Button variant="outline" className="border-gray-600 text-gray-300">
                                전단지 수정
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-blue-900/20 to-blue-950/20 border-blue-500/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-blue-300">총 조회수</CardTitle>
                            <Eye className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-400 mb-1">
                                {stats.totalViews.toLocaleString()}
                            </div>
                            <p className="text-xs flex items-center gap-1 text-emerald-400">
                                <TrendingUp className="h-3 w-3" />
                                +{stats.viewsGrowth}% 지난주 대비
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/20 border-emerald-500/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-300">총 클릭수</CardTitle>
                            <MousePointerClick className="h-4 w-4 text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-emerald-400 mb-1">
                                {stats.totalClicks}
                            </div>
                            <p className="text-xs flex items-center gap-1 text-emerald-400">
                                <TrendingUp className="h-3 w-3" />
                                +{stats.clicksGrowth}% 지난주 대비
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-900/20 to-amber-950/20 border-amber-500/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-amber-300">지급 포인트</CardTitle>
                            <Users className="h-4 w-4 text-amber-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-amber-400 mb-1">
                                {stats.pointsGiven}P
                            </div>
                            <p className="text-xs text-amber-300">
                                약 {(stats.pointsGiven * 100).toLocaleString()}원 상당
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-900/20 to-purple-950/20 border-purple-500/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-purple-300">전환율</CardTitle>
                            <TrendingUp className="h-4 w-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-400 mb-1">
                                {stats.conversion}%
                            </div>
                            <p className="text-xs text-emerald-400">
                                업계 평균 5.2% 초과
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Daily Trend */}
                    <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                        <CardHeader>
                            <CardTitle className="text-white">일별 추이</CardTitle>
                            <CardDescription className="text-gray-400">
                                최근 7일간 조회수 및 클릭수
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {dailyData.map((day, index) => {
                                    const maxViews = Math.max(...dailyData.map(d => d.views));
                                    const viewsPercent = (day.views / maxViews) * 100;
                                    const clicksPercent = (day.clicks / day.views) * 100;

                                    return (
                                        <div key={index} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-400">{day.date}</span>
                                                <div className="flex gap-4">
                                                    <span className="text-blue-400">{day.views} 조회</span>
                                                    <span className="text-emerald-400">{day.clicks} 클릭</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex-1 bg-gray-700/30 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full"
                                                        style={{ width: `${viewsPercent}%` }}
                                                    />
                                                </div>
                                                <div className="w-20 bg-gray-700/30 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full"
                                                        style={{ width: `${clicksPercent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Hourly Distribution */}
                    <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                        <CardHeader>
                            <CardTitle className="text-white">시간대별 분포</CardTitle>
                            <CardDescription className="text-gray-400">
                                활동이 가장 많은 시간대
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {hourlyData.map((hour, index) => {
                                    const maxHourViews = Math.max(...hourlyData.map(h => h.views));
                                    const percent = (hour.views / maxHourViews) * 100;

                                    return (
                                        <div key={index} className="flex items-center gap-4">
                                            <span className="text-sm text-gray-400 w-16">{hour.hour}</span>
                                            <div className="flex-1 bg-gray-700/30 rounded-full h-8 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-amber-500 to-orange-600 h-full rounded-full flex items-center justify-end px-3"
                                                    style={{ width: `${percent}%` }}
                                                >
                                                    {percent > 30 && (
                                                        <span className="text-xs text-white font-semibold">
                                                            {hour.views}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {percent <= 30 && (
                                                <span className="text-sm text-gray-400 w-12">{hour.views}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Location Analysis */}
                <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                    <CardHeader>
                        <CardTitle className="text-white">지역별 분석</CardTitle>
                        <CardDescription className="text-gray-400">
                            전단지가 가장 많이 조회된 지역
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topLocations.map((loc, index) => {
                                const maxLoc = topLocations[0].views;
                                const percent = (loc.views / maxLoc) * 100;
                                const ctr = ((loc.clicks / loc.views) * 100).toFixed(1);

                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl font-bold text-gray-600">
                                                    #{index + 1}
                                                </span>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-amber-500" />
                                                        <span className="text-white font-medium">{loc.location}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400">
                                                        {loc.views} 조회 • {loc.clicks} 클릭 • {ctr}% CTR
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-sm text-gray-400">
                                                {((loc.views / stats.totalViews) * 100).toFixed(1)}%
                                            </span>
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

                {/* Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/20 border-emerald-500/50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <TrendingUp className="h-5 w-5 text-emerald-400 mt-1" />
                                <div>
                                    <h4 className="text-emerald-400 font-semibold mb-1">성과 우수</h4>
                                    <p className="text-emerald-300 text-sm">
                                        전환율이 업계 평균보다 34% 높습니다
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-900/20 to-blue-950/20 border-blue-500/50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-blue-400 mt-1" />
                                <div>
                                    <h4 className="text-blue-400 font-semibold mb-1">최적 시간대</h4>
                                    <p className="text-blue-300 text-sm">
                                        12-15시 사이 조회수가 가장 높습니다
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-900/20 to-amber-950/20 border-amber-500/50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-amber-400 mt-1" />
                                <div>
                                    <h4 className="text-amber-400 font-semibold mb-1">핵심 지역</h4>
                                    <p className="text-amber-300 text-sm">
                                        의정부동에서 39% 조회가 발생합니다
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
