#!/usr/bin/env python3
"""
Townin Flyer AI Pipeline - Validation MVP
Converts Korean paper flyer photos to structured product data

Usage:
    python flyer_pipeline.py --input test_flyers/ --output results/
"""

import os
import json
import time
from pathlib import Path
from typing import List, Dict
from dotenv import load_dotenv
from anthropic import Anthropic
from google.cloud import vision
from PIL import Image
import base64

load_dotenv()

class FlyerAIPipeline:
    def __init__(self):
        self.anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.vision_client = vision.ImageAnnotatorClient()
        self.total_cost = 0.0

    def process_flyer(self, image_path: str) -> Dict:
        """
        Main pipeline: Image → Vision AI → OCR → LLM → Structured JSON
        """
        print(f"\n{'='*60}")
        print(f"Processing: {Path(image_path).name}")
        print(f"{'='*60}")

        start_time = time.time()

        # Stage 1: Vision AI - Detect layout and crop product regions
        print("\n[Stage 1] Vision AI: Detecting product regions...")
        image_data = self._load_image(image_path)

        # Stage 2: OCR - Extract Korean text
        print("[Stage 2] OCR: Extracting Korean text...")
        ocr_text = self._extract_text_ocr(image_path)
        print(f"  → Extracted {len(ocr_text)} characters")

        # Stage 3: LLM Structuring - Parse into JSON
        print("[Stage 3] LLM: Structuring product data...")
        structured_data = self._structure_with_llm(ocr_text, image_data)

        # Calculate metrics
        processing_time = time.time() - start_time

        result = {
            "filename": Path(image_path).name,
            "processing_time_seconds": round(processing_time, 2),
            "products": structured_data,
            "ocr_text_length": len(ocr_text),
            "estimated_cost_usd": round(self.total_cost, 4)
        }

        print(f"\n✓ Completed in {processing_time:.2f}s")
        print(f"✓ Found {len(structured_data)} products")
        print(f"✓ Estimated cost: ${self.total_cost:.4f}")

        return result

    def _load_image(self, image_path: str) -> str:
        """Load and encode image for Claude Vision"""
        with open(image_path, "rb") as f:
            image_data = base64.standard_b64encode(f.read()).decode("utf-8")
        return image_data

    def _extract_text_ocr(self, image_path: str) -> str:
        """Extract text using Google Cloud Vision OCR"""
        with open(image_path, "rb") as image_file:
            content = image_file.read()

        image = vision.Image(content=content)
        response = self.vision_client.text_detection(
            image=image,
            image_context={"language_hints": ["ko"]}  # Korean language hint
        )

        if response.error.message:
            raise Exception(f"OCR Error: {response.error.message}")

        texts = response.text_annotations
        if texts:
            return texts[0].description  # Full text
        return ""

    def _structure_with_llm(self, ocr_text: str, image_data: str) -> List[Dict]:
        """Use Claude 3.5 Sonnet to structure OCR text into product JSON"""

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
3. Understand Korean promotions: "1+1" (buy 1 get 1), "2+1", "반값" (half price), "~ 까지" (until date)
4. If original_price not mentioned, set to null
5. Return valid JSON array ONLY (no markdown, no explanation)
"""

        # Call Claude 3.5 Sonnet
        message = self.anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            temperature=0,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )

        # Estimate cost (Claude 3.5 Sonnet: $3/M input, $15/M output)
        input_tokens = message.usage.input_tokens
        output_tokens = message.usage.output_tokens
        cost = (input_tokens / 1_000_000 * 3) + (output_tokens / 1_000_000 * 15)
        self.total_cost += cost

        # Parse JSON response
        response_text = message.content[0].text.strip()

        # Remove markdown code blocks if present
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]

        try:
            products = json.loads(response_text)
            return products
        except json.JSONDecodeError as e:
            print(f"  ⚠ JSON parsing failed: {e}")
            print(f"  Raw response: {response_text[:200]}...")
            return []

    def calculate_accuracy(self, results: Dict, ground_truth: Dict) -> Dict:
        """Compare extracted data with ground truth labels"""
        # This is a simplified accuracy calculation
        # In production, you'd want more sophisticated matching

        extracted_products = results["products"]
        true_products = ground_truth.get("products", [])

        if not true_products:
            return {"accuracy": 0, "message": "No ground truth available"}

        # Simple matching: count correctly extracted product names
        extracted_names = {p["product_name"].lower() for p in extracted_products}
        true_names = {p["product_name"].lower() for p in true_products}

        correct = len(extracted_names & true_names)
        total = len(true_names)

        accuracy = (correct / total * 100) if total > 0 else 0

        return {
            "accuracy_percent": round(accuracy, 2),
            "correct_products": correct,
            "total_products": total,
            "precision": round(correct / len(extracted_products) * 100, 2) if extracted_products else 0,
            "recall": round(correct / total * 100, 2) if total > 0 else 0
        }


def main():
    """Run flyer AI validation on test dataset"""

    # Initialize pipeline
    pipeline = FlyerAIPipeline()

    # Test flyers directory
    test_dir = Path("test_flyers")
    results_dir = Path("results")
    results_dir.mkdir(exist_ok=True)

    # Load ground truth (if exists)
    ground_truth_path = Path("ground_truth.json")
    if ground_truth_path.exists():
        with open(ground_truth_path) as f:
            ground_truth_data = json.load(f)
    else:
        print("⚠ Warning: ground_truth.json not found. Accuracy calculation will be skipped.")
        ground_truth_data = {}

    # Process all test flyers
    all_results = []
    accuracy_scores = []

    # Get all image files
    image_files = list(test_dir.glob("*.jpg")) + list(test_dir.glob("*.png")) + list(test_dir.glob("*.jpeg"))

    if not image_files:
        print(f"❌ No test images found in {test_dir}/")
        print(f"   Please add sample Korean flyer images (*.jpg, *.png, *.jpeg)")
        return

    print(f"\nFound {len(image_files)} test flyers")
    print("="*60)

    for image_path in image_files:
        # Process flyer
        result = pipeline.process_flyer(str(image_path))
        all_results.append(result)

        # Calculate accuracy if ground truth exists
        filename = image_path.name
        if filename in ground_truth_data:
            accuracy = pipeline.calculate_accuracy(result, ground_truth_data[filename])
            result["accuracy"] = accuracy
            accuracy_scores.append(accuracy["accuracy_percent"])
            print(f"  Accuracy: {accuracy['accuracy_percent']}% (Precision: {accuracy['precision']}%, Recall: {accuracy['recall']}%)")

    # Save all results
    output_file = results_dir / "extracted_products.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)

    # Generate summary report
    summary = {
        "total_flyers": len(all_results),
        "avg_processing_time": round(sum(r["processing_time_seconds"] for r in all_results) / len(all_results), 2),
        "total_products_found": sum(len(r["products"]) for r in all_results),
        "total_cost_usd": round(pipeline.total_cost, 4),
        "avg_cost_per_flyer": round(pipeline.total_cost / len(all_results), 4),
    }

    if accuracy_scores:
        summary["avg_accuracy_percent"] = round(sum(accuracy_scores) / len(accuracy_scores), 2)
        summary["min_accuracy"] = round(min(accuracy_scores), 2)
        summary["max_accuracy"] = round(max(accuracy_scores), 2)

    # Print final summary
    print("\n" + "="*60)
    print("VALIDATION SUMMARY")
    print("="*60)
    print(f"Total Flyers Processed: {summary['total_flyers']}")
    print(f"Total Products Found: {summary['total_products_found']}")
    print(f"Avg Processing Time: {summary['avg_processing_time']}s")
    print(f"Total Cost: ${summary['total_cost_usd']}")
    print(f"Avg Cost per Flyer: ${summary['avg_cost_per_flyer']}")

    if accuracy_scores:
        print(f"\nAccuracy Metrics:")
        print(f"  Average: {summary['avg_accuracy_percent']}%")
        print(f"  Range: {summary['min_accuracy']}% - {summary['max_accuracy']}%")

        # Success criteria check
        if summary['avg_accuracy_percent'] >= 90:
            print("\n✅ SUCCESS: Exceeded target accuracy (≥90%)")
        elif summary['avg_accuracy_percent'] >= 85:
            print("\n✓ ACCEPTABLE: Met acceptable accuracy (≥85%)")
        else:
            print("\n❌ FAIL: Below acceptable accuracy (<85%)")

    if summary['avg_processing_time'] <= 5:
        print("✅ SUCCESS: Exceeded target speed (≤5s)")
    elif summary['avg_processing_time'] <= 10:
        print("✓ ACCEPTABLE: Met acceptable speed (≤10s)")
    else:
        print("❌ FAIL: Too slow (>10s)")

    if summary['avg_cost_per_flyer'] <= 0.05:
        print("✅ SUCCESS: Exceeded target cost (≤$0.05)")
    elif summary['avg_cost_per_flyer'] <= 0.10:
        print("✓ ACCEPTABLE: Met acceptable cost (≤$0.10)")
    else:
        print("❌ FAIL: Too expensive (>$0.10)")

    # Save summary
    summary_file = results_dir / "summary_report.json"
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print(f"\n📄 Results saved to:")
    print(f"  - {output_file}")
    print(f"  - {summary_file}")
    print("="*60)


if __name__ == "__main__":
    main()
