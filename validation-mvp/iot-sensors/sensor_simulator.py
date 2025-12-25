#!/usr/bin/env python3
"""
IoT Sensor Simulator for Townin Family Care
Simulates realistic motion sensor data for elderly monitoring

Generates:
- Normal daily patterns (활동적인 일상)
- Anomaly scenarios (이상 패턴)
  1. Long inactivity (장시간 활동 없음)
  2. Midnight wandering (야간 배회)
  3. Irregular sleep patterns (불규칙한 수면)
"""

import json
import random
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict

class SensorSimulator:
    def __init__(self, seed: int = 42):
        random.seed(seed)

        # Sensor locations
        self.sensors = {
            "living_room": "거실",
            "bedroom": "안방",
            "kitchen": "부엌",
            "bathroom": "화장실",
            "entrance": "현관"
        }

    def generate_normal_day(self, date: datetime, user_profile: str = "active_senior") -> List[Dict]:
        """Generate normal daily activity pattern"""
        events = []

        if user_profile == "active_senior":
            # 활동적인 어르신 패턴
            # 06:00-07:00 기상
            wake_time = date.replace(hour=6, minute=random.randint(0, 60))
            events.extend(self._morning_routine(wake_time))

            # 07:30-08:30 아침식사
            breakfast = wake_time + timedelta(hours=1, minutes=random.randint(0, 30))
            events.extend(self._meal_activity(breakfast, "아침"))

            # 09:00-12:00 오전 활동 (TV, 독서, 외출)
            morning_activities = breakfast + timedelta(hours=1)
            events.extend(self._daytime_activity(morning_activities, duration_hours=3))

            # 12:00-13:00 점심
            lunch = date.replace(hour=12, minute=random.randint(0, 30))
            events.extend(self._meal_activity(lunch, "점심"))

            # 14:00-18:00 오후 활동
            afternoon = lunch + timedelta(hours=1)
            events.extend(self._daytime_activity(afternoon, duration_hours=4))

            # 18:30-19:30 저녁식사
            dinner = date.replace(hour=18, minute=random.randint(30, 60))
            events.extend(self._meal_activity(dinner, "저녁"))

            # 20:00-22:00 저녁 활동 (TV, 가족 통화)
            evening = dinner + timedelta(hours=1)
            events.extend(self._evening_activity(evening, duration_hours=2))

            # 22:00-22:30 취침 준비
            bedtime_prep = date.replace(hour=22, minute=0)
            events.extend(self._bedtime_routine(bedtime_prep))

        elif user_profile == "low_mobility_senior":
            # 활동량 적은 어르신
            wake_time = date.replace(hour=7, minute=random.randint(0, 60))
            events.extend(self._morning_routine(wake_time))

            breakfast = wake_time + timedelta(hours=1)
            events.extend(self._meal_activity(breakfast, "아침"))

            # 긴 휴식 시간 (TV, 낮잠)
            rest_period = breakfast + timedelta(hours=1)
            events.extend(self._low_activity_period(rest_period, duration_hours=5))

            lunch = date.replace(hour=13, minute=0)
            events.extend(self._meal_activity(lunch, "점심"))

            afternoon_rest = lunch + timedelta(hours=1)
            events.extend(self._low_activity_period(afternoon_rest, duration_hours=4))

            dinner = date.replace(hour=19, minute=0)
            events.extend(self._meal_activity(dinner, "저녁"))

            bedtime_prep = date.replace(hour=21, minute=0)
            events.extend(self._bedtime_routine(bedtime_prep))

        return sorted(events, key=lambda x: x['timestamp'])

    def _morning_routine(self, start_time: datetime) -> List[Dict]:
        """기상 루틴"""
        events = []
        current = start_time

        # 침실 → 화장실
        events.append(self._create_event(current, "bedroom", "motion"))
        current += timedelta(minutes=random.randint(1, 3))

        events.append(self._create_event(current, "bathroom", "motion"))
        events.append(self._create_event(current, "bathroom", "door_open"))
        current += timedelta(minutes=random.randint(5, 15))

        events.append(self._create_event(current, "bathroom", "door_close"))

        # 거실로 이동
        current += timedelta(minutes=random.randint(1, 2))
        events.append(self._create_event(current, "living_room", "motion"))

        return events

    def _meal_activity(self, start_time: datetime, meal_type: str) -> List[Dict]:
        """식사 활동"""
        events = []
        current = start_time

        # 부엌 이동
        events.append(self._create_event(current, "kitchen", "motion"))

        # 부엌 활동 (요리/식사 준비)
        for _ in range(random.randint(3, 8)):
            current += timedelta(minutes=random.randint(2, 5))
            events.append(self._create_event(current, "kitchen", "motion"))

        # 식사 (거실 or 부엌)
        eating_location = random.choice(["living_room", "kitchen"])
        current += timedelta(minutes=5)
        events.append(self._create_event(current, eating_location, "motion"))

        # 식사 중 간헐적 움직임
        for _ in range(random.randint(2, 4)):
            current += timedelta(minutes=random.randint(3, 8))
            events.append(self._create_event(current, eating_location, "motion"))

        return events

    def _daytime_activity(self, start_time: datetime, duration_hours: int) -> List[Dict]:
        """일반적인 낮 활동"""
        events = []
        end_time = start_time + timedelta(hours=duration_hours)
        current = start_time

        while current < end_time:
            # 거실, 침실, 화장실 사이 랜덤 이동
            location = random.choice(["living_room", "bedroom", "bathroom", "kitchen"])
            events.append(self._create_event(current, location, "motion"))

            # 다음 활동까지 간격
            current += timedelta(minutes=random.randint(10, 30))

        return events

    def _low_activity_period(self, start_time: datetime, duration_hours: int) -> List[Dict]:
        """활동량 적은 시간 (TV 시청, 낮잠)"""
        events = []
        end_time = start_time + timedelta(hours=duration_hours)
        current = start_time

        # 주로 거실에서 활동
        events.append(self._create_event(current, "living_room", "motion"))

        while current < end_time:
            # 긴 간격으로 가끔 움직임
            current += timedelta(minutes=random.randint(30, 60))
            if current < end_time:
                location = random.choice(["living_room", "bathroom"])
                events.append(self._create_event(current, location, "motion"))

        return events

    def _evening_activity(self, start_time: datetime, duration_hours: int) -> List[Dict]:
        """저녁 활동 (TV, 독서)"""
        events = []
        end_time = start_time + timedelta(hours=duration_hours)
        current = start_time

        # 주로 거실
        events.append(self._create_event(current, "living_room", "motion"))

        while current < end_time:
            current += timedelta(minutes=random.randint(20, 40))
            if current < end_time:
                location = random.choice(["living_room", "bathroom", "kitchen"])
                events.append(self._create_event(current, location, "motion"))

        return events

    def _bedtime_routine(self, start_time: datetime) -> List[Dict]:
        """취침 루틴"""
        events = []
        current = start_time

        # 화장실
        events.append(self._create_event(current, "bathroom", "motion"))
        events.append(self._create_event(current, "bathroom", "door_open"))
        current += timedelta(minutes=random.randint(5, 10))
        events.append(self._create_event(current, "bathroom", "door_close"))

        # 침실
        current += timedelta(minutes=random.randint(2, 5))
        events.append(self._create_event(current, "bedroom", "motion"))

        return events

    def _create_event(self, timestamp: datetime, sensor_id: str, event_type: str) -> Dict:
        """센서 이벤트 생성"""
        return {
            "timestamp": timestamp.isoformat(),
            "sensor_id": sensor_id,
            "sensor_name": self.sensors[sensor_id],
            "event_type": event_type,
            "battery": random.randint(85, 100)
        }

    def generate_anomaly_long_inactivity(self, date: datetime, start_hour: int = 14) -> List[Dict]:
        """이상 패턴: 장시간 활동 없음 (낙상, 의식불명 가능성)"""
        events = []

        # 정상 오전 활동
        morning = self.generate_normal_day(date, "active_senior")
        events = [e for e in morning if datetime.fromisoformat(e['timestamp']).hour < start_hour]

        # start_hour 이후 활동 없음 (6시간 이상)
        last_event_time = datetime.fromisoformat(events[-1]['timestamp'])

        # 6시간 후에도 활동 없음 → 이상
        # (정상적이라면 화장실, 간식 등으로 움직여야 함)

        return events

    def generate_anomaly_midnight_wandering(self, date: datetime) -> List[Dict]:
        """이상 패턴: 야간 배회 (치매, 수면장애)"""
        events = []

        # 정상 낮 활동
        daytime = self.generate_normal_day(date, "active_senior")
        events = [e for e in daytime if datetime.fromisoformat(e['timestamp']).hour < 22]

        # 정상 취침
        bedtime = date.replace(hour=22, minute=30)
        events.extend(self._bedtime_routine(bedtime))

        # 야간 배회 (02:00-04:00)
        midnight = date.replace(hour=2, minute=random.randint(0, 30)) + timedelta(days=1)
        for _ in range(random.randint(5, 10)):
            location = random.choice(["living_room", "kitchen", "bathroom", "entrance"])
            events.append(self._create_event(midnight, location, "motion"))
            midnight += timedelta(minutes=random.randint(5, 15))

        return sorted(events, key=lambda x: x['timestamp'])

    def generate_anomaly_irregular_sleep(self, date: datetime) -> List[Dict]:
        """이상 패턴: 불규칙한 수면 (새벽 기상, 밤샘)"""
        events = []

        # 정상 낮 활동
        daytime = self.generate_normal_day(date, "active_senior")
        events = [e for e in daytime if datetime.fromisoformat(e['timestamp']).hour < 22]

        # 취침
        bedtime = date.replace(hour=22, minute=0)
        events.extend(self._bedtime_routine(bedtime))

        # 새벽 3시에 기상하여 계속 활동
        early_wake = date.replace(hour=3, minute=0) + timedelta(days=1)
        events.append(self._create_event(early_wake, "bedroom", "motion"))

        current = early_wake + timedelta(minutes=5)
        for _ in range(10):
            location = random.choice(["living_room", "kitchen", "bathroom"])
            events.append(self._create_event(current, location, "motion"))
            current += timedelta(minutes=random.randint(10, 20))

        return sorted(events, key=lambda x: x['timestamp'])


def main():
    """7일간 센서 데이터 생성 (정상 5일 + 이상 2일)"""
    print("=" * 70)
    print("IoT Sensor Simulator - 7일간 데이터 생성")
    print("=" * 70)

    simulator = SensorSimulator()
    all_data = []

    # 시작 날짜
    start_date = datetime(2024, 11, 24)

    # Day 1-3: 정상 패턴 (활동적)
    for day in range(3):
        date = start_date + timedelta(days=day)
        print(f"\n[Day {day+1}] {date.strftime('%Y-%m-%d')} - 정상 (활동적)")
        events = simulator.generate_normal_day(date, "active_senior")

        for event in events:
            event['day'] = day + 1
            event['pattern'] = "normal_active"
            all_data.append(event)

        print(f"  ✓ {len(events)} 이벤트 생성")

    # Day 4-5: 정상 패턴 (활동량 적음)
    for day in range(3, 5):
        date = start_date + timedelta(days=day)
        print(f"\n[Day {day+1}] {date.strftime('%Y-%m-%d')} - 정상 (활동량 적음)")
        events = simulator.generate_normal_day(date, "low_mobility_senior")

        for event in events:
            event['day'] = day + 1
            event['pattern'] = "normal_low_activity"
            all_data.append(event)

        print(f"  ✓ {len(events)} 이벤트 생성")

    # Day 6: 이상 - 장시간 활동 없음
    day = 5
    date = start_date + timedelta(days=day)
    print(f"\n[Day {day+1}] {date.strftime('%Y-%m-%d')} - ⚠️ 이상: 장시간 활동 없음")
    events = simulator.generate_anomaly_long_inactivity(date, start_hour=14)

    for event in events:
        event['day'] = day + 1
        event['pattern'] = "anomaly_long_inactivity"
        all_data.append(event)

    print(f"  ✓ {len(events)} 이벤트 생성")
    print(f"  ⚠️ 14시 이후 활동 없음 (6시간 이상)")

    # Day 7: 이상 - 야간 배회
    day = 6
    date = start_date + timedelta(days=day)
    print(f"\n[Day {day+1}] {date.strftime('%Y-%m-%d')} - ⚠️ 이상: 야간 배회")
    events = simulator.generate_anomaly_midnight_wandering(date)

    for event in events:
        event['day'] = day + 1
        event['pattern'] = "anomaly_midnight_wandering"
        all_data.append(event)

    print(f"  ✓ {len(events)} 이벤트 생성")
    print(f"  ⚠️ 새벽 2-4시 사이 활발한 활동")

    # 저장
    output_dir = Path("sample_data")
    output_dir.mkdir(exist_ok=True)
    output_file = output_dir / "simulated_7days.json"

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump({
            "metadata": {
                "start_date": start_date.strftime("%Y-%m-%d"),
                "duration_days": 7,
                "total_events": len(all_data),
                "sensors": simulator.sensors
            },
            "events": all_data
        }, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 70)
    print(f"✓ 총 {len(all_data)} 이벤트 생성 완료")
    print(f"📄 저장 위치: {output_file}")
    print("=" * 70)

    # 통계
    print(f"\n[통계]")
    print(f"  정상 (활동적): Day 1-3")
    print(f"  정상 (활동량 적음): Day 4-5")
    print(f"  이상 (장시간 활동 없음): Day 6")
    print(f"  이상 (야간 배회): Day 7")


if __name__ == "__main__":
    main()
