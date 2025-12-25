#!/usr/bin/env python3
"""
Anomaly Detection for IoT Sensor Data
Detects unusual patterns in elderly activity monitoring

Anomaly Types:
1. Long Inactivity (장시간 활동 없음) - 낙상/의식불명 위험
2. Midnight Wandering (야간 배회) - 치매/수면장애
3. Irregular Sleep (불규칙한 수면) - 건강 이상 신호
"""

import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Tuple
from collections import defaultdict

class AnomalyDetector:
    def __init__(self, config: Dict = None):
        """
        Initialize anomaly detector with configurable thresholds
        """
        self.config = config or {
            "long_inactivity_hours": 6,  # 6시간 이상 활동 없으면 이상
            "midnight_start_hour": 0,     # 야간 시작 시각 (00:00)
            "midnight_end_hour": 5,       # 야간 종료 시각 (05:00)
            "midnight_event_threshold": 5, # 야간 이벤트 5개 이상이면 이상
            "early_wake_hour": 4,          # 새벽 4시 이전 기상은 이상
            "normal_wake_hour": 6,         # 정상 기상 시각
            "min_daily_events": 20         # 하루 최소 이벤트 수
        }

        self.anomalies = []

    def load_sensor_data(self, file_path: str) -> Dict:
        """Load sensor data from JSON"""
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data

    def detect_all_anomalies(self, data: Dict) -> List[Dict]:
        """Run all anomaly detection algorithms"""
        events = data['events']

        print("=" * 70)
        print("이상 감지 알고리즘 실행 중...")
        print("=" * 70)

        # Group events by day
        events_by_day = self._group_events_by_day(events)

        # 1. Detect long inactivity
        print("\n[1/3] 장시간 활동 없음 감지...")
        long_inactivity = self.detect_long_inactivity(events_by_day)
        self.anomalies.extend(long_inactivity)
        print(f"  → {len(long_inactivity)} 건 발견")

        # 2. Detect midnight wandering
        print("\n[2/3] 야간 배회 감지...")
        midnight_wandering = self.detect_midnight_wandering(events_by_day)
        self.anomalies.extend(midnight_wandering)
        print(f"  → {len(midnight_wandering)} 건 발견")

        # 3. Detect irregular sleep
        print("\n[3/3] 불규칙한 수면 패턴 감지...")
        irregular_sleep = self.detect_irregular_sleep(events_by_day)
        self.anomalies.extend(irregular_sleep)
        print(f"  → {len(irregular_sleep)} 건 발견")

        return self.anomalies

    def _group_events_by_day(self, events: List[Dict]) -> Dict[int, List[Dict]]:
        """Group events by day"""
        events_by_day = defaultdict(list)
        for event in events:
            day = event.get('day', 1)
            events_by_day[day].append(event)
        return dict(events_by_day)

    def detect_long_inactivity(self, events_by_day: Dict) -> List[Dict]:
        """Detect periods of long inactivity (potential fall/emergency)"""
        anomalies = []
        threshold_hours = self.config['long_inactivity_hours']

        for day, events in events_by_day.items():
            if not events:
                continue

            # Sort events by timestamp
            sorted_events = sorted(events, key=lambda x: datetime.fromisoformat(x['timestamp']))

            # Find gaps between events
            for i in range(len(sorted_events) - 1):
                current_time = datetime.fromisoformat(sorted_events[i]['timestamp'])
                next_time = datetime.fromisoformat(sorted_events[i + 1]['timestamp'])

                gap_hours = (next_time - current_time).total_seconds() / 3600

                # Check if gap is during daytime (06:00-22:00)
                if current_time.hour >= 6 and current_time.hour < 22:
                    if gap_hours >= threshold_hours:
                        anomalies.append({
                            "type": "long_inactivity",
                            "severity": "high",
                            "day": day,
                            "start_time": current_time.isoformat(),
                            "end_time": next_time.isoformat(),
                            "duration_hours": round(gap_hours, 1),
                            "last_location": sorted_events[i]['sensor_name'],
                            "description": f"Day {day}: {gap_hours:.1f}시간 동안 활동 없음 ({current_time.strftime('%H:%M')} ~ {next_time.strftime('%H:%M')})",
                            "risk": "낙상, 의식불명, 응급상황 가능성"
                        })

            # Check if last event of the day is too early (before 20:00)
            last_event = sorted_events[-1]
            last_event_time = datetime.fromisoformat(last_event['timestamp'])

            if last_event_time.hour < 20:  # 저녁 8시 전에 마지막 활동
                # Calculate time until end of day
                end_of_day = last_event_time.replace(hour=23, minute=59)
                gap_hours = (end_of_day - last_event_time).total_seconds() / 3600

                if gap_hours >= threshold_hours:
                    anomalies.append({
                        "type": "long_inactivity",
                        "severity": "high",
                        "day": day,
                        "start_time": last_event_time.isoformat(),
                        "end_time": "end_of_day",
                        "duration_hours": round(gap_hours, 1),
                        "last_location": last_event['sensor_name'],
                        "description": f"Day {day}: {last_event_time.strftime('%H:%M')} 이후 활동 없음 (하루 종료까지 {gap_hours:.1f}시간)",
                        "risk": "낙상, 의식불명, 응급상황 가능성"
                    })

        return anomalies

    def detect_midnight_wandering(self, events_by_day: Dict) -> List[Dict]:
        """Detect midnight wandering (potential dementia/sleep disorder)"""
        anomalies = []
        threshold_events = self.config['midnight_event_threshold']
        midnight_start = self.config['midnight_start_hour']
        midnight_end = self.config['midnight_end_hour']

        for day, events in events_by_day.items():
            midnight_events = []

            for event in events:
                event_time = datetime.fromisoformat(event['timestamp'])
                hour = event_time.hour

                # Check if event is in midnight hours (00:00-05:00)
                if hour >= midnight_start and hour < midnight_end:
                    midnight_events.append(event)

            if len(midnight_events) >= threshold_events:
                locations = [e['sensor_name'] for e in midnight_events]
                location_counts = {}
                for loc in locations:
                    location_counts[loc] = location_counts.get(loc, 0) + 1

                anomalies.append({
                    "type": "midnight_wandering",
                    "severity": "medium",
                    "day": day,
                    "event_count": len(midnight_events),
                    "time_range": f"{midnight_events[0]['timestamp']} ~ {midnight_events[-1]['timestamp']}",
                    "locations": location_counts,
                    "description": f"Day {day}: 야간({midnight_start}시-{midnight_end}시) 동안 {len(midnight_events)}회 활동",
                    "risk": "치매 초기 증상, 수면장애, 불안/우울"
                })

        return anomalies

    def detect_irregular_sleep(self, events_by_day: Dict) -> List[Dict]:
        """Detect irregular sleep patterns (early wake, late sleep)"""
        anomalies = []
        early_wake_threshold = self.config['early_wake_hour']

        for day, events in events_by_day.items():
            # Find first event of the day (wake-up time)
            morning_events = [e for e in events if datetime.fromisoformat(e['timestamp']).hour < 12]

            if morning_events:
                sorted_morning = sorted(morning_events, key=lambda x: datetime.fromisoformat(x['timestamp']))
                first_event_time = datetime.fromisoformat(sorted_morning[0]['timestamp'])

                # Check if wake-up is too early
                if first_event_time.hour < early_wake_threshold:
                    anomalies.append({
                        "type": "irregular_sleep",
                        "severity": "low",
                        "day": day,
                        "wake_time": first_event_time.isoformat(),
                        "wake_hour": first_event_time.hour,
                        "first_location": sorted_morning[0]['sensor_name'],
                        "description": f"Day {day}: 새벽 {first_event_time.strftime('%H:%M')} 기상 (정상: 6시 이후)",
                        "risk": "수면 장애, 불면증, 스트레스"
                    })

        return anomalies

    def calculate_accuracy(self, detected_anomalies: List[Dict], events: List[Dict]) -> Dict:
        """Calculate detection accuracy based on ground truth labels"""

        # Extract ground truth from event patterns
        ground_truth_anomalies = set()
        for event in events:
            pattern = event.get('pattern', '')
            day = event.get('day', 0)

            if 'anomaly' in pattern:
                ground_truth_anomalies.add(day)

        # Extract detected anomaly days
        detected_days = set()
        for anomaly in detected_anomalies:
            detected_days.add(anomaly['day'])

        # Calculate metrics
        true_positives = len(ground_truth_anomalies & detected_days)
        false_positives = len(detected_days - ground_truth_anomalies)
        false_negatives = len(ground_truth_anomalies - detected_days)
        true_negatives = 7 - (true_positives + false_positives + false_negatives)

        precision = (true_positives / (true_positives + false_positives) * 100) if (true_positives + false_positives) > 0 else 0
        recall = (true_positives / (true_positives + false_negatives) * 100) if (true_positives + false_negatives) > 0 else 0
        accuracy = ((true_positives + true_negatives) / 7 * 100)
        f1_score = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0

        return {
            "total_days": 7,
            "ground_truth_anomaly_days": len(ground_truth_anomalies),
            "detected_anomaly_days": len(detected_days),
            "true_positives": true_positives,
            "false_positives": false_positives,
            "false_negatives": false_negatives,
            "true_negatives": true_negatives,
            "precision": round(precision, 2),
            "recall": round(recall, 2),
            "accuracy": round(accuracy, 2),
            "f1_score": round(f1_score, 2),
            "ground_truth_days": sorted(list(ground_truth_anomalies)),
            "detected_days": sorted(list(detected_days))
        }


def main():
    """Run anomaly detection on simulated sensor data"""
    print("\n" + "=" * 70)
    print("IoT Anomaly Detection - 7일 센서 데이터 분석")
    print("=" * 70)

    # Load data
    input_file = Path("sample_data/simulated_7days.json")
    if not input_file.exists():
        print(f"\n❌ 데이터 파일이 없습니다: {input_file}")
        print("   먼저 sensor_simulator.py를 실행하세요.")
        return

    detector = AnomalyDetector()
    data = detector.load_sensor_data(input_file)

    print(f"\n✓ 데이터 로드 완료")
    print(f"  기간: {data['metadata']['start_date']} ~ 7일")
    print(f"  총 이벤트: {data['metadata']['total_events']}개")

    # Detect anomalies
    anomalies = detector.detect_all_anomalies(data)

    # Calculate accuracy
    print("\n" + "=" * 70)
    print("정확도 평가")
    print("=" * 70)

    metrics = detector.calculate_accuracy(anomalies, data['events'])

    print(f"\n[Ground Truth vs Detected]")
    print(f"  실제 이상 발생 일수: {metrics['ground_truth_anomaly_days']} (Day {metrics['ground_truth_days']})")
    print(f"  감지된 이상 일수: {metrics['detected_anomaly_days']} (Day {metrics['detected_days']})")

    print(f"\n[Detection Metrics]")
    print(f"  True Positives: {metrics['true_positives']}")
    print(f"  False Positives: {metrics['false_positives']}")
    print(f"  False Negatives: {metrics['false_negatives']}")
    print(f"  True Negatives: {metrics['true_negatives']}")

    print(f"\n[Performance Metrics]")
    print(f"  Accuracy: {metrics['accuracy']}%")
    print(f"  Precision: {metrics['precision']}%")
    print(f"  Recall: {metrics['recall']}%")
    print(f"  F1 Score: {metrics['f1_score']}%")

    # Success criteria check
    print(f"\n[Success Criteria Check]")
    if metrics['accuracy'] >= 90:
        print(f"  ✅ EXCELLENT: Accuracy ≥90%")
    elif metrics['accuracy'] >= 85:
        print(f"  ✓ GOOD: Accuracy ≥85%")
    elif metrics['accuracy'] >= 70:
        print(f"  ⚠ ACCEPTABLE: Accuracy ≥70%")
    else:
        print(f"  ❌ NEEDS IMPROVEMENT: Accuracy <70%")

    if metrics['false_positives'] == 0:
        print(f"  ✅ NO FALSE ALARMS: 오탐 0건")
    elif metrics['false_positives'] <= 1:
        print(f"  ✓ LOW FALSE ALARMS: 오탐 {metrics['false_positives']}건")
    else:
        print(f"  ⚠ HIGH FALSE ALARMS: 오탐 {metrics['false_positives']}건")

    # Display detected anomalies
    print("\n" + "=" * 70)
    print(f"감지된 이상 상황 ({len(anomalies)}건)")
    print("=" * 70)

    for i, anomaly in enumerate(anomalies, 1):
        severity_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}
        emoji = severity_emoji.get(anomaly['severity'], "⚪")

        print(f"\n[{i}] {emoji} {anomaly['type'].upper()}")
        print(f"  Day: {anomaly['day']}")
        print(f"  Severity: {anomaly['severity']}")
        print(f"  Description: {anomaly['description']}")
        print(f"  Risk: {anomaly['risk']}")

        if anomaly['type'] == 'long_inactivity':
            print(f"  Duration: {anomaly['duration_hours']}시간")
            print(f"  Last Location: {anomaly['last_location']}")
        elif anomaly['type'] == 'midnight_wandering':
            print(f"  Event Count: {anomaly['event_count']}")
            print(f"  Locations: {anomaly['locations']}")
        elif anomaly['type'] == 'irregular_sleep':
            print(f"  Wake Time: {datetime.fromisoformat(anomaly['wake_time']).strftime('%H:%M')}")

    # Save results
    results_dir = Path("results")
    results_dir.mkdir(exist_ok=True)

    output_file = results_dir / "anomaly_detection_results.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump({
            "summary": {
                "total_anomalies": len(anomalies),
                "metrics": metrics
            },
            "anomalies": anomalies
        }, f, ensure_ascii=False, indent=2)

    print(f"\n📄 결과 저장: {output_file}")
    print("=" * 70)


if __name__ == "__main__":
    main()
