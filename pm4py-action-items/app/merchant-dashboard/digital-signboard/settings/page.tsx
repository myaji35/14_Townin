'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Monitor, Clock, Wifi, Power, Settings as SettingsIcon, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignboardSettingsPage() {
    const router = useRouter();
    const [settings, setSettings] = useState({
        displayName: '의정부 신선마트',
        location: '매장 입구',
        autoPlay: true,
        interval: 5000,
        startTime: '09:00',
        endTime: '22:00',
        brightness: 80,
        volume: 50,
        showQR: true,
        showClock: true,
        transition: 'fade',
        selectedFlyers: ['1', '2', '3', '4'],
    });

    const handleSave = () => {
        // TODO: Save settings to backend
        console.log('Saving settings:', settings);
        alert('설정이 저장되었습니다!');
    };

    const handleChange = (key: string, value: any) => {
        setSettings({ ...settings, [key]: value });
    };

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
                                <h1 className="text-2xl font-bold text-white">디지털 간판 설정</h1>
                                <p className="text-sm text-gray-400 mt-1">전자 간판 디스플레이 설정 관리</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/merchant-dashboard/digital-signboard">
                                <Button variant="outline" className="border-gray-600 text-gray-300">
                                    <Monitor className="mr-2 h-4 w-4" />
                                    미리보기
                                </Button>
                            </Link>
                            <Button
                                onClick={handleSave}
                                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                저장하기
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Settings Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Display Settings */}
                        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Monitor className="h-5 w-5 text-amber-500" />
                                    디스플레이 설정
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    화면 표시 및 레이아웃 설정
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="displayName" className="text-gray-300">디스플레이 이름</Label>
                                    <input
                                        id="displayName"
                                        value={settings.displayName}
                                        onChange={(e) => handleChange('displayName', e.target.value)}
                                        className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="location" className="text-gray-300">설치 위치</Label>
                                    <input
                                        id="location"
                                        value={settings.location}
                                        onChange={(e) => handleChange('location', e.target.value)}
                                        className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="brightness" className="text-gray-300">밝기: {settings.brightness}%</Label>
                                        <input
                                            id="brightness"
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={settings.brightness}
                                            onChange={(e) => handleChange('brightness', Number(e.target.value))}
                                            className="w-full mt-2"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="volume" className="text-gray-300">볼륨: {settings.volume}%</Label>
                                        <input
                                            id="volume"
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={settings.volume}
                                            onChange={(e) => handleChange('volume', Number(e.target.value))}
                                            className="w-full mt-2"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="transition" className="text-gray-300">화면 전환 효과</Label>
                                    <select
                                        id="transition"
                                        value={settings.transition}
                                        onChange={(e) => handleChange('transition', e.target.value)}
                                        className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    >
                                        <option value="fade">페이드</option>
                                        <option value="slide">슬라이드</option>
                                        <option value="zoom">줌</option>
                                        <option value="flip">플립</option>
                                    </select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Playback Settings */}
                        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-500" />
                                    재생 설정
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    자동 재생 및 시간 설정
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                                    <div>
                                        <Label className="text-gray-300">자동 재생</Label>
                                        <p className="text-sm text-gray-400 mt-1">전단지 자동 슬라이드쇼</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.autoPlay}
                                            onChange={(e) => handleChange('autoPlay', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                    </label>
                                </div>

                                <div>
                                    <Label htmlFor="interval" className="text-gray-300">전환 간격</Label>
                                    <select
                                        id="interval"
                                        value={settings.interval}
                                        onChange={(e) => handleChange('interval', Number(e.target.value))}
                                        className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    >
                                        <option value={3000}>3초</option>
                                        <option value={5000}>5초</option>
                                        <option value={7000}>7초</option>
                                        <option value={10000}>10초</option>
                                        <option value={15000}>15초</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="startTime" className="text-gray-300">시작 시간</Label>
                                        <input
                                            id="startTime"
                                            type="time"
                                            value={settings.startTime}
                                            onChange={(e) => handleChange('startTime', e.target.value)}
                                            className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="endTime" className="text-gray-300">종료 시간</Label>
                                        <input
                                            id="endTime"
                                            type="time"
                                            value={settings.endTime}
                                            onChange={(e) => handleChange('endTime', e.target.value)}
                                            className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Display Options */}
                        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <SettingsIcon className="h-5 w-5 text-purple-500" />
                                    표시 옵션
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    추가 정보 표시 설정
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                                    <div>
                                        <Label className="text-gray-300">QR 코드 표시</Label>
                                        <p className="text-sm text-gray-400 mt-1">모바일 연동 QR 코드</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.showQR}
                                            onChange={(e) => handleChange('showQR', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                                    <div>
                                        <Label className="text-gray-300">시계 표시</Label>
                                        <p className="text-sm text-gray-400 mt-1">현재 시각 표시</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.showClock}
                                            onChange={(e) => handleChange('showClock', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                    </label>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Status Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Device Status */}
                        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Power className="h-5 w-5 text-green-500" />
                                    디바이스 상태
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-500/50 rounded-lg">
                                    <span className="text-green-400 font-medium">온라인</span>
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">디바이스 ID</span>
                                        <span className="text-white font-mono">SB-001</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">IP 주소</span>
                                        <span className="text-white font-mono">192.168.1.100</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">마지막 업데이트</span>
                                        <span className="text-white">방금 전</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Network Status */}
                        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Wifi className="h-5 w-5 text-blue-500" />
                                    네트워크
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">연결 상태</span>
                                        <span className="text-emerald-400 font-semibold">양호</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">신호 강도</span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className="w-1.5 bg-emerald-500 rounded-full"
                                                    style={{ height: `${i * 4}px` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">업로드/다운로드</span>
                                        <span className="text-white text-sm">50/100 Mbps</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                            <CardHeader>
                                <CardTitle className="text-white">빠른 작업</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
                                    onClick={() => {/* Restart signboard */ }}
                                >
                                    <Power className="mr-2 h-4 w-4" />
                                    디스플레이 재시작
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
                                    onClick={() => {/* Clear cache */ }}
                                >
                                    <SettingsIcon className="mr-2 h-4 w-4" />
                                    캐시 삭제
                                </Button>
                                <Link href="/merchant-dashboard/digital-signboard">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
                                    >
                                        <Monitor className="mr-2 h-4 w-4" />
                                        전체화면 보기
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
