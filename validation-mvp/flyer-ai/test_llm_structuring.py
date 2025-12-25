#!/usr/bin/env python3
"""
Test LLM Structuring Capability (without OCR)
Tests Claude's ability to structure Korean product data from raw text
"""

import os
import json
from pathlib import Path
from anthropic import Anthropic

# Mock OCR text samples (realistic Korean flyer text)
MOCK_OCR_SAMPLES = [
    {
        "name": "마트 전단지 - 식품",
        "ocr_text": """
        이마트 주말특가!

        김치찌개용 김치 9,900원 1+1
        국내산 100% 프리미엄 김치

        삼겹살 1kg 12,900원
        신선한 국내산 돼지고기

        사과 5,900원/kg
        청송 꿀사과 특가

        계란 30구 6,900원
        무항생제 1등급
        """,
        "ground_truth": [
            {"product_name": "김치찌개용 김치", "price": "9900", "unit": "원", "promotion": "1+1"},
            {"product_name": "삼겹살", "price": "12900", "unit": "원/kg", "promotion": None},
            {"product_name": "사과", "price": "5900", "unit": "원/kg", "promotion": None},
            {"product_name": "계란", "price": "6900", "unit": "원/30구", "promotion": None}
        ]
    },
    {
        "name": "화장품 할인",
        "ocr_text": """
        올리브영 빅세일!

        설화수 윤조에센스 129,000원
        (정상가 258,000원)
        50% 특가!

        라네즈 워터뱅크 세트 29,900원
        토너+에멀전+크림 3종

        메디힐 마스크팩 9,900원
        10매입 2+1 행사
        """,
        "ground_truth": [
            {"product_name": "설화수 윤조에센스", "price": "129000", "unit": "원", "original_price": "258000", "promotion": "50% 할인"},
            {"product_name": "라네즈 워터뱅크 세트", "price": "29900", "unit": "원", "promotion": None},
            {"product_name": "메디힐 마스크팩", "price": "9900", "unit": "원/10매", "promotion": "2+1"}
        ]
    },
    {
        "name": "치킨 전단지",
        "ocr_text": """
        BBQ 치킨 이벤트!

        황금올리브 18,000원
        오리지널 + 콜라 1.25L 무료

        황금올리브 + 양념치킨 콤보 32,000원
        (각 1마리)

        순살치킨 19,000원
        황금올리브/양념/간장 중 선택

        12/31까지
        """,
        "ground_truth": [
            {"product_name": "황금올리브", "price": "18000", "unit": "원", "promotion": "콜라 1.25L 무료"},
            {"product_name": "황금올리브 + 양념치킨 콤보", "price": "32000", "unit": "원", "promotion": None},
            {"product_name": "순살치킨", "price": "19000", "unit": "원", "promotion": None}
        ]
    },
    {
        "name": "전자제품 할인",
        "ocr_text": """
        하이마트 연말특가

        삼성 갤럭시 버즈2 프로 159,000원
        정상가 229,000원 → 30% 할인

        LG 그램 노트북 15인치
        1,290,000원 (재고한정)

        에어팟 프로 2세대
        298,000원
        애플케어+ 추가시 349,000원
        """,
        "ground_truth": [
            {"product_name": "삼성 갤럭시 버즈2 프로", "price": "159000", "unit": "원", "original_price": "229000", "promotion": "30% 할인"},
            {"product_name": "LG 그램 노트북 15인치", "price": "1290000", "unit": "원", "promotion": None},
            {"product_name": "에어팟 프로 2세대", "price": "298000", "unit": "원", "promotion": None}
        ]
    },
    {
        "name": "카페 메뉴",
        "ocr_text": """
        스타벅스 신메뉴

        아이스 아메리카노 4,500원

        카페라떼 (HOT/ICE) 5,000원

        크리스마스 케이크 라떼 6,500원
        12월 한정 시즌 메뉴

        초콜릿 케이크 5,800원
        아메리카노와 세트 9,000원
        """,
        "ground_truth": [
            {"product_name": "아이스 아메리카노", "price": "4500", "unit": "원", "promotion": None},
            {"product_name": "카페라떼", "price": "5000", "unit": "원", "promotion": None},
            {"product_name": "크리스마스 케이크 라떼", "price": "6500", "unit": "원", "promotion": None},
            {"product_name": "초콜릿 케이크", "price": "5800", "unit": "원", "promotion": None},
            {"product_name": "케이크+아메리카노 세트", "price": "9000", "unit": "원", "promotion": None}
        ]
    }
]


class LLMStructuringTester:
    def __init__(self, api_key: str):
        self.client = Anthropic(api_key=api_key)
        self.total_cost = 0.0

    def structure_text(self, ocr_text: str) -> list:
        """Use Claude to structure OCR text into product JSON"""

        prompt = f"""You are a Korean retail product data extraction expert.

OCR Text from a Korean retail flyer:
{ocr_text}

Extract ALL products mentioned in this flyer and return a JSON array with the following structure:

[
  {{
    "product_name": "제품명 (Korean)",
    "price": "가격 (숫자만, 예: 9900)",
    "unit": "단위 (예: 원, 개, kg)",
    "original_price": "할인 전 가격 (if applicable, else null)",
    "promotion": "프로모션 (예: 1+1, 2+1, 50% 할인, null if none)",
    "description": "간단한 설명 (1-2 sentences)",
    "category": "카테고리 (예: 식품, 화장품, 전자제품)"
  }}
]

Rules:
1. Extract ONLY products with clear prices
2. If price is range (예: 5,000-10,000), use middle value
3. Understand Korean promotions: "1+1" (buy 1 get 1), "2+1", "반값" (half price), "~% 할인" (discount)
4. If original_price not mentioned, set to null
5. Return valid JSON array ONLY (no markdown, no explanation)
"""

        try:
            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2000,
                temperature=0,
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )

            # Calculate cost
            input_tokens = message.usage.input_tokens
            output_tokens = message.usage.output_tokens
            cost = (input_tokens / 1_000_000 * 3) + (output_tokens / 1_000_000 * 15)
            self.total_cost += cost

            # Parse response
            response_text = message.content[0].text.strip()

            # Remove markdown code blocks if present
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
                response_text = response_text.strip()

            products = json.loads(response_text)

            return {
                "success": True,
                "products": products,
                "cost": cost,
                "tokens": {"input": input_tokens, "output": output_tokens}
            }

        except json.JSONDecodeError as e:
            return {
                "success": False,
                "error": f"JSON parsing failed: {e}",
                "raw_response": response_text[:500]
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def calculate_accuracy(self, extracted: list, ground_truth: list) -> dict:
        """Calculate extraction accuracy metrics"""

        if not ground_truth:
            return {"accuracy": 0, "message": "No ground truth"}

        # Match products by name (case-insensitive, partial match)
        extracted_names = {p.get("product_name", "").lower().strip() for p in extracted}
        truth_names = {p.get("product_name", "").lower().strip() for p in ground_truth}

        # Calculate matches
        correct = 0
        for truth_name in truth_names:
            for ext_name in extracted_names:
                # Allow partial matching (핵심 키워드 포함)
                if truth_name in ext_name or ext_name in truth_name:
                    correct += 1
                    break

        total = len(truth_names)
        precision = (correct / len(extracted)) * 100 if extracted else 0
        recall = (correct / total) * 100 if total > 0 else 0
        f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0

        return {
            "correct": correct,
            "total_ground_truth": total,
            "total_extracted": len(extracted),
            "precision": round(precision, 2),
            "recall": round(recall, 2),
            "f1_score": round(f1, 2)
        }


def main():
    print("=" * 70)
    print("Flyer AI - LLM Structuring Test (OCR 없이)")
    print("=" * 70)

    # Check API key
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("\n❌ ANTHROPIC_API_KEY not found in environment")
        print("   Please set it: export ANTHROPIC_API_KEY='your-key-here'")
        return

    tester = LLMStructuringTester(api_key)
    results_dir = Path("results")
    results_dir.mkdir(exist_ok=True)

    all_results = []
    total_correct = 0
    total_ground_truth = 0
    total_extracted = 0

    # Test each sample
    for i, sample in enumerate(MOCK_OCR_SAMPLES, 1):
        print(f"\n{'='*70}")
        print(f"[{i}/{len(MOCK_OCR_SAMPLES)}] {sample['name']}")
        print(f"{'='*70}")
        print(f"\nOCR Text Preview:")
        print(sample['ocr_text'].strip()[:200] + "...")

        # Structure with LLM
        print(f"\n[Processing] Sending to Claude...")
        result = tester.structure_text(sample['ocr_text'])

        if result['success']:
            products = result['products']
            print(f"✓ Extracted {len(products)} products")
            print(f"  Cost: ${result['cost']:.4f}")
            print(f"  Tokens: {result['tokens']['input']} in / {result['tokens']['output']} out")

            # Calculate accuracy
            accuracy = tester.calculate_accuracy(products, sample['ground_truth'])

            print(f"\n[Accuracy Metrics]")
            print(f"  Precision: {accuracy['precision']}%")
            print(f"  Recall: {accuracy['recall']}%")
            print(f"  F1 Score: {accuracy['f1_score']}%")
            print(f"  Matched: {accuracy['correct']}/{accuracy['total_ground_truth']}")

            # Show extracted products
            print(f"\n[Extracted Products]")
            for j, p in enumerate(products, 1):
                promo = f" ({p.get('promotion')})" if p.get('promotion') else ""
                print(f"  {j}. {p.get('product_name')} - {p.get('price')}원{promo}")

            all_results.append({
                "sample_name": sample['name'],
                "success": True,
                "products": products,
                "accuracy": accuracy,
                "cost": result['cost'],
                "tokens": result['tokens']
            })

            total_correct += accuracy['correct']
            total_ground_truth += accuracy['total_ground_truth']
            total_extracted += accuracy['total_extracted']

        else:
            print(f"✗ Failed: {result['error']}")
            all_results.append({
                "sample_name": sample['name'],
                "success": False,
                "error": result['error']
            })

    # Final summary
    print("\n" + "=" * 70)
    print("VALIDATION SUMMARY")
    print("=" * 70)

    successful = [r for r in all_results if r['success']]

    print(f"\nTotal Samples: {len(MOCK_OCR_SAMPLES)}")
    print(f"Successful: {len(successful)}/{len(MOCK_OCR_SAMPLES)}")
    print(f"Total Cost: ${tester.total_cost:.4f}")
    print(f"Avg Cost per Sample: ${tester.total_cost / len(MOCK_OCR_SAMPLES):.4f}")

    if successful:
        avg_precision = sum(r['accuracy']['precision'] for r in successful) / len(successful)
        avg_recall = sum(r['accuracy']['recall'] for r in successful) / len(successful)
        avg_f1 = sum(r['accuracy']['f1_score'] for r in successful) / len(successful)

        print(f"\n[Overall Accuracy]")
        print(f"  Average Precision: {avg_precision:.2f}%")
        print(f"  Average Recall: {avg_recall:.2f}%")
        print(f"  Average F1 Score: {avg_f1:.2f}%")
        print(f"  Total Matched: {total_correct}/{total_ground_truth}")

        # Success criteria
        print(f"\n[Success Criteria Check]")
        if avg_f1 >= 90:
            print("  ✅ EXCELLENT: F1 Score ≥90%")
        elif avg_f1 >= 85:
            print("  ✓ GOOD: F1 Score ≥85%")
        elif avg_f1 >= 70:
            print("  ⚠ ACCEPTABLE: F1 Score ≥70%")
        else:
            print("  ❌ NEEDS IMPROVEMENT: F1 Score <70%")

        if tester.total_cost / len(MOCK_OCR_SAMPLES) <= 0.05:
            print("  ✅ COST: Excellent (≤$0.05/flyer)")
        elif tester.total_cost / len(MOCK_OCR_SAMPLES) <= 0.10:
            print("  ✓ COST: Acceptable (≤$0.10/flyer)")
        else:
            print("  ⚠ COST: Above target (>$0.10/flyer)")

    # Save results
    output_file = results_dir / "llm_structuring_results.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump({
            "total_samples": len(MOCK_OCR_SAMPLES),
            "successful": len(successful),
            "total_cost": round(tester.total_cost, 4),
            "avg_cost_per_sample": round(tester.total_cost / len(MOCK_OCR_SAMPLES), 4),
            "results": all_results
        }, f, ensure_ascii=False, indent=2)

    print(f"\n📄 Results saved to: {output_file}")
    print("=" * 70)


if __name__ == "__main__":
    main()
