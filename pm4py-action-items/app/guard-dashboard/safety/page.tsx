'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Video, AlertTriangle, MapPin, Phone, Clock, Shield, Radio, Bell } from 'lucide-react';
import Link from 'next/link';

interface SafetyEvent {
    id: string;
    type: 'cctv' | 'emergency' | 'alert' | 'patrol';
    title: string;
    location: string;
    timestamp: string;
    status: 'active' | 'resolved' | 'investigating';
    priority: 'critical' | 'high' | 'medium' | 'low';
    description: string;
}

export default function SafetyMonitoringPage() {
    const [selectedEvent, setSelectedEvent] = useState<SafetyEvent | null>(null);

    const [events] = useState<SafetyEvent[]>([
        {
            id: '1',
            type: 'cctv',
            title: 'CCTV #101 연결 끊김',
            location: '의정부동 A구역',
            timestamp: '2026-01-04 08:10',
            status: 'investigating',
            priority: 'high',
            description: 'CCTV 신호가 감지되지 않습니다. 장비 점검 필요.',
        },
        {
            id: '2',
            type: 'patrol',
            title: '정기 순찰 완료',
            location: '신곡동 B구역',
            timestamp: '2026-01-04 07:45',
            status: 'resolved',
            priority: 'low',
            description: '이상 없음. 모든 지역 정상.',
        },
        {
            id: '3',
            type: 'alert',
            title: '가로등 고장 신고',
            location: '장암동 C구역',
            timestamp: '2026-01-04 06:30',
            status: 'active',
            priority: 'medium',
            description: '주민 신고로 확인 중.',
        },
    ]);

    const [cctvFeeds] = useState([
        { id: '101', location: '의정부동 입구', status: 'offline' },
        { id: '102', location: '신곡동 중앙', status: 'online' },
        { id: '103', location: '장암동 공원', status: 'online' },
        { id: '104', location: '호원동 광장', status: 'online' },
    ]);

    const [emergencyContacts] = useState([
        { name: '경찰서', phone: '112', distance: '500m' },
        { name: '소방서', phone: '119', distance: '800m' },
        { name: '의정부시청', phone: '031-828-2114', distance: '1.2km' },
    ]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">진행 중</Badge>;
            case 'investigating':
                return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">조사 중</Badge>;
            case 'resolved':
                return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">해결됨</Badge>;
            default:
                return null;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical':
                return 'text-red-500';
            case 'high':
                return 'text-orange-500';
            case 'medium':
                return 'text-yellow-500';
            case 'low':
                return 'text-blue-500';
            default:
                return 'text-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Header */}
            <header className="border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/guard-dashboard">
                                <Button variant="ghost" size="sm" className="text-gray-300">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    대시보드
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Shield className="h-6 w-6 text-blue-500" />
                                    안전 모니터링
                                </h1>
                                <p className="text-sm text-gray-400 mt-1">실시간 CCTV 및 안전 이벤트 관리</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-red-600 text-red-400 hover:bg-red-900/20"
                            >
                                <Bell className="mr-2 h-4 w-4" />
                                긴급 신고
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* CCTV Feeds */}
                        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Video className="h-5 w-5 text-blue-500" />
                                    CCTV 피드
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    실시간 카메라 모니터링
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    {cctvFeeds.map((feed) => (
                                        <div
                                            key={feed.id}
                                            className="relative aspect-video rounded-lg overflow-hidden bg-gray-700 border border-gray-600"
                                        >
                                            {feed.status === 'online' ? (
                                                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <Video className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                                                        <p className="text-gray-400 text-sm">CCTV #{feed.id}</p>
                                                        <p className="text-gray-500 text-xs">{feed.location}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full bg-red-900/20 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                                                        <p className="text-red-400 text-sm font-semibold">연결 끊김</p>
                                                        <p className="text-red-300 text-xs">{feed.location}</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2">
                                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${feed.status === 'online'
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                                        : 'bg-red-500/20 text-red-400 border border-red-500/50'
                                                    }`}>
                                                    <div className={`w-2 h-2 rounded-full ${feed.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                                                        }`} />
                                                    {feed.status === 'online' ? 'LIVE' : 'OFFLINE'}
                                                </div>
                                            </div>
                                            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
                                                #{feed.id}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Safety Events */}
                        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Radio className="h-5 w-5 text-amber-500" />
                                    안전 이벤트
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    최근 발생한 이벤트 및 알림
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {events.map((event) => (
                                    <button
                                        key={event.id}
                                        onClick={() => setSelectedEvent(event)}
                                        className={`w-full p-4 rounded-lg border transition-all text-left ${selectedEvent?.id === event.id
                                                ? 'bg-blue-900/30 border-blue-500'
                                                : 'bg-gray-700/30 border-gray-600 hover:border-gray-500'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-start gap-3 flex-1">
                                                <AlertTriangle className={`h-5 w-5 mt-0.5 ${getPriorityColor(event.priority)}`} />
                                                <div className="flex-1">
                                                    <h4 className="text-white font-semibold text-sm">{event.title}</h4>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {event.location}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {event.timestamp}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {getStatusBadge(event.status)}
                                        </div>
                                    </button>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Selected Event Detail */}
                        {selectedEvent && (
                            <Card className="bg-gradient-to-br from-blue-900/20 to-blue-950/20 border-blue-500/50">
                                <CardHeader>
                                    <CardTitle className="text-blue-400 text-sm">이벤트 상세</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="text-white font-semibold mb-2">{selectedEvent.title}</h3>
                                        <p className="text-gray-300 text-sm">{selectedEvent.description}</p>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">위치</span>
                                            <span className="text-white">{selectedEvent.location}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">시간</span>
                                            <span className="text-white">{selectedEvent.timestamp}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">우선순위</span>
                                            <span className={`font-semibold ${getPriorityColor(selectedEvent.priority)}`}>
                                                {selectedEvent.priority}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-blue-700 space-y-2">
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                            조치 시작
                                        </Button>
                                        <Button variant="outline" className="w-full border-blue-600 text-blue-400">
                                            상세 보고서
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Emergency Contacts */}
                        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-red-500" />
                                    긴급 연락망
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {emergencyContacts.map((contact, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30">
                                        <div>
                                            <p className="text-white font-medium">{contact.name}</p>
                                            <p className="text-xs text-gray-400 mt-1">{contact.distance}</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                            onClick={() => window.open(`tel:${contact.phone}`)}
                                        >
                                            <Phone className="h-3 w-3 mr-1" />
                                            {contact.phone}
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Patrol Schedule */}
                        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                            <CardHeader>
                                <CardTitle className="text-white text-sm">순찰 일정</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                {[
                                    { time: '09:00', area: '의정부동 A구역', status: 'completed' },
                                    { time: '12:00', area: '신곡동 B구역', status: 'pending' },
                                    { time: '15:00', area: '장암동 C구역', status: 'pending' },
                                    { time: '18:00', area: '호원동 D구역', status: 'pending' },
                                ].map((schedule, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 rounded bg-gray-700/30">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span className="text-white">{schedule.time}</span>
                                            <span className="text-gray-400">{schedule.area}</span>
                                        </div>
                                        {schedule.status === 'completed' ? (
                                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-xs">완료</Badge>
                                        ) : (
                                            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50 text-xs">대기</Badge>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
