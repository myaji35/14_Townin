'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, TrendingUp, Users, DollarSign, BarChart3, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function MerchantDashboard() {
    const [stats] = useState({
        totalFlyers: 12,
        activeFlyers: 8,
        totalViews: 3420,
        totalPoints: 8500,
        conversionRate: 4.2,
        revenue: 256000,
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Header */}
            <header className="border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">머천트 대시보드</h1>
                            <p className="text-sm text-gray-400 mt-1">의정부 신선마트</p>
                        </div>
                        <Link href="/merchant-dashboard/flyers/new">
                            <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-amber-500/30">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                새 전단지 등록
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Total Flyers */}
                    <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50 backdrop-blur-sm hover:border-amber-500/50 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">
                                총 전단지
                            </CardTitle>
                            <Receipt className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white mb-1">
                                {stats.totalFlyers}개
                            </div>
                            <p className="text-xs text-emerald-400">
                                활성: {stats.activeFlyers}개
                            </p>
                        </CardContent>
                    </Card>

                    {/* Total Views */}
                    <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">
                                총 조회수
                            </CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white mb-1">
                                {stats.totalViews.toLocaleString()}
                            </div>
                            <p className="text-xs text-emerald-400">
                                +12.5% 지난달 대비
                            </p>
                        </CardContent>
                    </Card>

                    {/* Total Points */}
                    <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">
                                지급 포인트
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white mb-1">
                                {stats.totalPoints.toLocaleString()}P
                            </div>
                            <p className="text-xs text-gray-400">
                                약 {(stats.totalPoints * 100).toLocaleString()}원 상당
                            </p>
                        </CardContent>
                    </Card>

                    {/* Conversion Rate */}
                    <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50 backdrop-blur-sm hover:border-green-500/50 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">
                                전환율
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white mb-1">
                                {stats.conversionRate}%
                            </div>
                            <p className="text-xs text-emerald-400">
                                +0.8% 지난주 대비
                            </p>
                        </CardContent>
                    </Card>

                    {/* Revenue */}
                    <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50 backdrop-blur-sm hover:border-emerald-500/50 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">
                                예상 매출
                            </CardTitle>
                            <BarChart3 className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white mb-1">
                                {(stats.revenue / 10000).toFixed(0)}만원
                            </div>
                            <p className="text-xs text-emerald-400">
                                +18.2% 지난달 대비
                            </p>
                        </CardContent>
                    </Card>

                    {/* ROI */}
                    <Card className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-500/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-amber-300">
                                투자 대비 수익률 (ROI)
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-amber-400 mb-1">
                                320%
                            </div>
                            <p className="text-xs text-amber-200">
                                포인트 대비 매출 증가율
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Flyer Management */}
                    <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                        <CardHeader>
                            <CardTitle className="text-white">전단지 관리</CardTitle>
                            <CardDescription className="text-gray-400">
                                전단지를 생성, 수정, 삭제할 수 있습니다
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/merchant-dashboard/flyers">
                                <Button variant="outline" className="w-full justify-start border-gray-600 hover:bg-gray-700 text-gray-100">
                                    <Receipt className="mr-2 h-4 w-4" />
                                    전단지 목록
                                </Button>
                            </Link>
                            <Link href="/merchant-dashboard/flyers/new">
                                <Button variant="outline" className="w-full justify-start border-gray-600 hover:bg-gray-700 text-gray-100">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    새 전단지 작성
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Analytics */}
                    <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                        <CardHeader>
                            <CardTitle className="text-white">분석 & 통계</CardTitle>
                            <CardDescription className="text-gray-400">
                                캠페인 성과를 분석하세요
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/merchant-dashboard/analytics">
                                <Button variant="outline" className="w-full justify-start border-gray-600 hover:bg-gray-700 text-gray-100">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    캠페인 분석
                                </Button>
                            </Link>
                            <Link href="/merchant-dashboard/analytics">
                                <Button variant="outline" className="w-full justify-start border-gray-600 hover:bg-gray-700 text-gray-100">
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    성과 리포트
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Digital Signboard */}
                    <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                        <CardHeader>
                            <CardTitle className="text-white">디지털 간판</CardTitle>
                            <CardDescription className="text-gray-400">
                                매장 전자 간판 관리
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/merchant-dashboard/digital-signboard">
                                <Button variant="outline" className="w-full justify-start border-gray-600 hover:bg-gray-700 text-gray-100">
                                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    전자 간판 보기
                                </Button>
                            </Link>
                            <Link href="/merchant-dashboard/digital-signboard/settings">
                                <Button variant="outline" className="w-full justify-start border-gray-600 hover:bg-gray-700 text-gray-100">
                                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    간판 설정
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card className="mt-6 bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                    <CardHeader>
                        <CardTitle className="text-white">최근 활동</CardTitle>
                        <CardDescription className="text-gray-400">
                            지난 7일간의 주요 활동
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { time: '2시간 전', action: '신규 전단지 "겨울 대특가" 승인됨', type: 'success' },
                                { time: '5시간 전', action: '전단지 조회수 1,000회 돌파', type: 'info' },
                                { time: '1일 전', action: '포인트 500P 지급 완료', type: 'success' },
                                { time: '2일 전', action: '전환율 목표 10% 달성', type: 'success' },
                            ].map((activity, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                                    <div className={`w-2 h-2 rounded-full ${activity.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-200">{activity.action}</p>
                                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
