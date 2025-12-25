#!/usr/bin/env python3
"""
Empathetic Message Generator for IoT Anomalies
Generates Korean empathetic messages for family care notifications

Note: This is a template-based version (no API required)
For production, use LLM (Claude/GPT) for more natural messages
"""

import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict

class MessageGenerator:
    def __init__(self):
        # Template-based messages (API 없이 동작)
        self.templates = {
            "long_inactivity": {
                "family": [
                    "{time} 이후 어머니께서 활동이 감지되지 않았습니다. 전화로 안부를 확인해보시는 것이 좋을 것 같습니다.",
                    "오늘 {time}부터 {duration}시간 동안 활동이 없으셨어요. 괜찮으신지 확인이 필요합니다.",
                    "어머니가 {location}에서 마지막 활동 후 오랜 시간 움직임이 없습니다. 안전 확인이 필요합니다."
                ],
                "professional": [
                    "[긴급] {duration}시간 이상 활동 감지 안됨. 즉시 확인 필요",
                    "낙상 또는 응급상황 가능성. {time} 이후 무응답 상태"
                ]
            },
            "midnight_wandering": {
                "family": [
                    "어머니께서 새벽 {time_range} 사이에 {count}번 움직이셨어요. 잠을 제대로 주무시지 못하신 것 같습니다.",
                    "오늘 밤 수면이 불안정하셨습니다. 낮에 편안히 쉬실 수 있도록 도와드리는 것이 좋겠습니다.",
                    "야간에 자주 깨어나셨어요. 불편하신 점이나 걱정거리가 있으신지 여쭤봐 주세요."
                ],
                "professional": [
                    "야간 배회 {count}회 감지. 치매 초기 증상 또는 수면장애 가능성",
                    "수면 패턴 이상. 전문의 상담 권장"
                ]
            },
            "irregular_sleep": {
                "family": [
                    "어머니께서 오늘 새벽 {time}에 일찍 일어나셨어요. 잠을 푹 주무시지 못하신 것 같습니다.",
                    "평소보다 이른 시간에 기상하셨습니다. 밤에 불편하신 점은 없으셨는지 확인해보세요.",
                    "수면 시간이 부족하신 것 같아요. 낮에 피곤해하시진 않으실지 걱정됩니다."
                ],
                "professional": [
                    "불규칙한 수면 패턴 감지. 불면증 또는 스트레스 가능성",
                    "수면의 질 저하. 생활 패턴 점검 필요"
                ]
            }
        }

    def generate_message(self, anomaly: Dict, tone: str = "family") -> Dict:
        """Generate empathetic message for an anomaly"""

        anomaly_type = anomaly['type']
        severity = anomaly['severity']

        if anomaly_type not in self.templates:
            return {
                "anomaly_type": anomaly_type,
                "severity": severity,
                "message": "이상 패턴이 감지되었습니다.",
                "tone": tone
            }

        # Select template
        templates = self.templates[anomaly_type][tone]
        template = templates[0]  # Use first template for simplicity

        # Fill in variables
        if anomaly_type == "long_inactivity":
            start_time = datetime.fromisoformat(anomaly['start_time'])
            message = template.format(
                time=start_time.strftime('%H시 %M분'),
                duration=int(anomaly['duration_hours']),
                location=anomaly['last_location']
            )

        elif anomaly_type == "midnight_wandering":
            time_range_str = anomaly.get('time_range', '')
            if ' ~ ' in time_range_str:
                start_str, end_str = time_range_str.split(' ~ ')
                start = datetime.fromisoformat(start_str.strip())
                end = datetime.fromisoformat(end_str.strip())
                time_range = f"{start.strftime('%H:%M')} ~ {end.strftime('%H:%M')}"
            else:
                time_range = "새벽 시간"

            message = template.format(
                time_range=time_range,
                count=anomaly['event_count']
            )

        elif anomaly_type == "irregular_sleep":
            wake_time = datetime.fromisoformat(anomaly['wake_time'])
            message = template.format(
                time=wake_time.strftime('%H시 %M분')
            )

        else:
            message = "이상 패턴이 감지되었습니다."

        # Add severity indicator
        severity_prefix = {
            "high": "🔴 [긴급]",
            "medium": "🟡 [주의]",
            "low": "🟢 [참고]"
        }

        prefix = severity_prefix.get(severity, "")

        return {
            "anomaly_type": anomaly_type,
            "severity": severity,
            "day": anomaly['day'],
            "message": f"{prefix} {message}",
            "tone": tone,
            "timestamp": datetime.now().isoformat(),
            "recommendation": self._get_recommendation(anomaly_type, severity)
        }

    def _get_recommendation(self, anomaly_type: str, severity: str) -> str:
        """Get actionable recommendation"""

        recommendations = {
            "long_inactivity": {
                "high": "즉시 전화 또는 방문하여 안전을 확인하세요. 응답이 없으면 119에 연락하세요.",
                "medium": "전화로 안부를 확인하고, 불편한 점이 있는지 여쭤보세요.",
                "low": "편한 시간에 연락하여 안부를 확인해보세요."
            },
            "midnight_wandering": {
                "high": "치매 전문의 상담을 고려해보세요.",
                "medium": "수면 환경을 점검하고, 낮 활동량을 늘려보세요.",
                "low": "충분한 휴식을 취하실 수 있도록 도와드리세요."
            },
            "irregular_sleep": {
                "high": "불면증 치료를 위해 병원 방문을 권장합니다.",
                "medium": "수면 시간과 환경을 점검해보세요.",
                "low": "낮잠을 줄이고 규칙적인 수면 패턴을 유지하도록 도와주세요."
            }
        }

        return recommendations.get(anomaly_type, {}).get(severity, "전문가와 상담하세요.")

    def generate_all_messages(self, anomalies: List[Dict], tone: str = "family") -> List[Dict]:
        """Generate messages for all anomalies"""
        messages = []
        for anomaly in anomalies:
            message = self.generate_message(anomaly, tone)
            messages.append(message)
        return messages


def main():
    """Generate empathetic messages for detected anomalies"""

    print("\n" + "=" * 70)
    print("공감형 메시지 생성 (Template-based, API 없음)")
    print("=" * 70)

    # Load anomaly detection results
    results_file = Path("results/anomaly_detection_results.json")
    if not results_file.exists():
        print(f"\n❌ 이상 감지 결과 파일이 없습니다: {results_file}")
        print("   먼저 anomaly_detector.py를 실행하세요.")
        return

    with open(results_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    anomalies = data['anomalies']

    print(f"\n✓ {len(anomalies)}건의 이상 상황 로드")

    # Generate messages
    generator = MessageGenerator()

    print("\n" + "=" * 70)
    print("가족용 메시지 생성")
    print("=" * 70)

    family_messages = generator.generate_all_messages(anomalies, tone="family")

    for i, msg in enumerate(family_messages, 1):
        print(f"\n[{i}] Day {msg['day']} - {msg['anomaly_type'].upper()}")
        print(f"  {msg['message']}")
        print(f"\n  💡 추천 행동:")
        print(f"  {msg['recommendation']}")

    print("\n" + "=" * 70)
    print("전문가용 메시지 생성")
    print("=" * 70)

    professional_messages = generator.generate_all_messages(anomalies, tone="professional")

    for i, msg in enumerate(professional_messages, 1):
        print(f"\n[{i}] Day {msg['day']} - {msg['anomaly_type'].upper()}")
        print(f"  {msg['message']}")

    # Save messages
    output_file = Path("results/generated_messages.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump({
            "family_messages": family_messages,
            "professional_messages": professional_messages,
            "total_messages": len(family_messages)
        }, f, ensure_ascii=False, indent=2)

    print(f"\n📄 메시지 저장: {output_file}")

    # Message quality evaluation (subjective, manual review needed)
    print("\n" + "=" * 70)
    print("메시지 품질 평가")
    print("=" * 70)

    print(f"\n[자동 평가 불가 - 수동 리뷰 필요]")
    print(f"✓ 생성된 메시지 수: {len(family_messages)} × 2 (가족용/전문가용)")
    print(f"✓ 공감성: 템플릿 기반 (LLM 사용 시 더 자연스러움)")
    print(f"✓ 실용성: 구체적인 추천 행동 포함")
    print(f"✓ 한국어 존댓말: 적용")

    print("\n[Success Criteria]")
    print("  ⚠ LLM 미사용으로 품질 정량 평가 제한")
    print("  ✓ 템플릿 기반 메시지 생성 성공")
    print("  ✓ 이상 유형별 맞춤 메시지 제공")
    print("  ✓ 실행 가능한 권장사항 포함")

    print("\n💡 Production에서는 Claude API 사용 권장")
    print("   - 더 자연스럽고 상황에 맞는 메시지")
    print("   - 개인화된 표현")
    print("   - 감정적 뉘앙스 개선")

    print("=" * 70)


if __name__ == "__main__":
    main()
