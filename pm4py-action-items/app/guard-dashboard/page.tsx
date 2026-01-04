'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Video, AlertTriangle, CheckCircle, Clock, FileCheck, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function GuardDashboard() {
    const [stats] = useState({
        pendingApprovals: 3,
        approvedToday: 12,
        rejectedToday: 2,
        activeCCTV: 18,
        totalCCTV: 20,
        activeEvents: 2,
        patrolCompleted: 2,
        patrolPending: 2,
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Header */}
            <header className="border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Shield className="h-7 w-7 text-blue-500" />
                            보안요원 대시보드
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">의정부시 안전 관리 센터</p>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Pending Approvals */}
                    <Card className="bg-gradient-to-br from-amber-900/20 to-amber-950/20 border-amber-500/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-amber-300">승인 대기</CardTitle>
                            <FileCheck className="h-4 w-4 text-amber-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-amber-400 mb-1">
                                {stats.pendingApprovals}건
                            </div>
                            <p className="text-xs text-amber-200">검토 필요</p>
                        </CardContent>
                    </Card>

                    {/* Approved Today */}
                    <Card className="bg-gradient-to-br from-green-900/20 to-green-950/20 border-green-500/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-green-300">오늘 승인</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-400 mb-1">
                                {stats.approvedToday}건
                            </div>
                            <p className="text-xs text-green-200">거절: {stats.rejectedToday}건</p>
                        </CardContent>
                    </Card>

                    {/* CCTV Status */}
                    <Card className="bg-gradient-to-br from-blue-900/20 to-blue-950/20 border-blue-500/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-blue-300">CCTV 상태</CardTitle>
                            <Video className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-400 mb-1">
                                {stats.activeCCTV}/{stats.totalCCTV}
                            </div>
                            <p className="text-xs text-blue-200">정상 작동 중</p>
                        </CardContent>
                    </Card>

                    {/* Active Events */}
                    <Card className="bg-gradient-to-br from-red-900/20 to-red-950/20 border-red-500/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-red-300">진행 이벤트</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-400 mb-1">
                                {stats.activeEvents}건
                            </div>
                            <p className="text-xs text-red-200">조치 필요</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Approval Management */}
                    <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                        <CardHeader>
                            <CardTitle className="text-white">전단지 승인 관리</CardTitle>
                            <CardDescription className="text-gray-400">
                                승인 대기 중인 전단지를 검토하세요
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/guard-dashboard/approvals">
                                <Button variant="outline" className="w-full justify-start border-gray-600 hover:bg-gray-700 text-gray-100">
                                    <FileCheck className="mr-2 h-4 w-4" />
                                    승인 대기 목록 ({stats.pendingApprovals})
                                </Button>
                            </Link>
                            <div className="p-4 bg-amber-900/20 border border-amber-500/50 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-amber-400 mt-0.5" />
                                    <div>
                                        <h4 className="text-amber-400 font-semibold text-sm">긴급 검토 필요</h4>
                                        <p className="text-amber-200 text-xs mt-1">
                                            우선순위 높은 전단지 3건이 승인 대기 중입니다
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Safety Monitoring */}
                    <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                        <CardHeader>
                            <CardTitle className="text-white">안전 모니터링</CardTitle>
                            <CardDescription className="text-gray-400">
                                CCTV 및 안전 이벤트를 관리하세요
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/guard-dashboard/safety">
                                <Button variant="outline" className="w-full justify-start border-gray-600 hover:bg-gray-700 text-gray-100">
                                    <Video className="mr-2 h-4 w-4" />
                                    CCTV 실시간 모니터
                                </Button>
                            </Link>
                            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                                    <div>
                                        <h4 className="text-red-400 font-semibold text-sm">주의 필요</h4>
                                        <p className="text-red-200 text-xs mt-1">
                                            CCTV #101 연결 끊김 ({stats.totalCCTV - stats.activeCCTV}대 오프라인)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                    <CardHeader>
                        <CardTitle className="text-white">최근 활동</CardTitle>
                        <CardDescription className="text-gray-400">
                            오늘 처리된 주요 작업
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                {
                                    time: '08:15',
                                    action: '신규 전단지 검토 완료',
                                    detail: '의정부 신선마트 - 승인 대기 중',
                                    type: 'approval',
                                    status: 'pending'
                                },
                                {
                                    time: '07:45',
                                    action: 'B구역 정기 순찰 완료',
                                    detail: '신곡동 - 이상 없음',
                                    type: 'patrol',
                                    status: 'completed'
                                },
                                {
                                    time: '06:30',
                                    action: '가로등 고장 신고 접수',
                                    detail: '장암동 C구역 - 조치 중',
                                    type: 'alert',
                                    status: 'investigating'
                                },
                                {
                                    time: '05:00',
                                    action: '전단지 승인',
                                    detail: '힐링 요가센터 - 승인',
                                    type: 'approval',
                                    status: 'approved'
                                },
                            ].map((activity, index) => {
                                let icon;
                                let colorClass;

                                if (activity.type === 'approval') {
                                    icon = <FileCheck className="h-5 w-5" />;
                                    colorClass = activity.status === 'approved' ? 'text-green-500' : 'text-amber-500';
                                } else if (activity.type === 'patrol') {
                                    icon = <MapPin className="h-5 w-5" />;
                                    colorClass = 'text-blue-500';
                                } else {
                                    icon = <AlertTriangle className="h-5 w-5" />;
                                    colorClass = 'text-red-500';
                                }

                                return (
                                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                                        <div className={`${colorClass} mt-0.5`}>
                                            {icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-white font-medium">{activity.action}</p>
                                                    <p className="text-sm text-gray-400 mt-1">{activity.detail}</p>
                                                </div>
                                                <span className="text-xs text-gray-500">{activity.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
