# Townin Technical Validation MVP
**2-Week Sprint to Validate Core Technologies**

## Overview

This directory contains the code and resources for validating Townin's three core technical innovations:

1. **Multimodal Flyer AI** - Vision + OCR + LLM pipeline
2. **GraphRAG Insurance Engine** - Neo4j + LangChain inference
3. **IoT Sensor Integration** - Anomaly detection from motion patterns

**Timeline:** 2 weeks
**Budget:** $500
**Success Criteria:** All three components achieve ≥85% accuracy

---

## Directory Structure

```
validation-mvp/
├── README.md                          # This file
├── requirements.txt                   # Python dependencies
├── .env.example                       # Environment variables template
├── flyer-ai/                          # Validation 1: Multimodal Flyer AI
│   ├── flyer_pipeline.py             # Main pipeline script
│   ├── test_flyers/                  # Sample Korean flyers (10 images)
│   ├── ground_truth.json             # Manual labels for accuracy testing
│   └── results/                      # Output JSON + accuracy reports
├── graphrag/                          # Validation 2: GraphRAG Engine
│   ├── setup_neo4j.py                # Neo4j schema + sample data
│   ├── inference_queries.cypher      # Sample Cypher queries
│   ├── langchain_integration.py      # LangChain + Neo4j integration
│   └── test_recommendations.py       # Accuracy testing
└── iot-sensors/                       # Validation 3: IoT Integration
    ├── sensor_simulator.py           # Simulate sensor data (if hardware delayed)
    ├── anomaly_detector.py           # Pattern analysis + anomaly detection
    ├── message_generator.py          # LLM-based empathetic messages
    └── sample_data/                  # 7-day simulated sensor logs
```

---

## Setup Instructions

### Prerequisites

1. **Python 3.10+** installed
2. **API Keys:**
   - Anthropic API key (Claude 3.5 Sonnet)
   - Google Cloud Vision API key (OCR)
   - Neo4j Aura account (free tier)

### Installation

```bash
# 1. Navigate to this directory
cd validation-mvp

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy environment template and add your API keys
cp .env.example .env
# Edit .env with your actual API keys

# 5. Run validation tests (one at a time or all together)
python flyer-ai/flyer_pipeline.py
python graphrag/test_recommendations.py
python iot-sensors/anomaly_detector.py
```

---

## Validation 1: Flyer AI

### Goal
Extract product data (name, price, image, description) from Korean paper flyer photos with ≥85% accuracy.

### Test Dataset
- 10 sample Korean flyers (variety: supermarket, restaurant, cosmetics, electronics)
- Ground truth manually labeled in `flyer-ai/ground_truth.json`

### Success Metrics
- **Accuracy:** ≥85% fields correctly extracted
- **Speed:** <10 seconds per flyer
- **Cost:** <$0.10 per flyer

### Run Test
```bash
cd flyer-ai
python flyer_pipeline.py
```

**Output:**
- `results/extracted_products.json` - Structured product data
- `results/accuracy_report.txt` - Precision/recall per field type
- `results/processing_stats.json` - Speed and cost analysis

---

## Validation 2: GraphRAG Engine

### Goal
Demonstrate multi-hop reasoning for insurance recommendations with ≥70% acceptance rate.

### Test Dataset
- 100 synthetic users with realistic Korean demographics
- 20 Seoul grid locations with real property/risk data
- 50 insurance products from major Korean insurers

### Success Metrics
- **Recommendation Accuracy:** ≥80%
- **Query Latency:** <2 seconds
- **Explainability Score:** ≥7/10

### Run Test
```bash
cd graphrag

# Step 1: Set up Neo4j schema and populate sample data
python setup_neo4j.py

# Step 2: Test inference queries
python langchain_integration.py

# Step 3: Run accuracy evaluation
python test_recommendations.py
```

**Output:**
- Neo4j database populated with test graph
- `results/recommendation_report.json` - Accuracy metrics
- `results/sample_recommendations.txt` - Example outputs with reasoning

---

## Validation 3: IoT Sensors

### Goal
Detect anomalies (long inactivity, midnight wandering) from motion sensor data with ≥85% accuracy.

### Test Approach
- Use `sensor_simulator.py` to generate 7 days of realistic data (if hardware delayed)
- Or: Deploy 5 Aqara sensors for real data collection
- Analyze patterns and detect anomalies
- Generate empathetic Korean messages via LLM

### Success Metrics
- **Anomaly Detection Accuracy:** ≥85%
- **False Alarm Rate:** <5%
- **Message Satisfaction:** ≥7/10 (subjective, requires human review)

### Run Test
```bash
cd iot-sensors

# Option A: Simulate sensor data (if no hardware yet)
python sensor_simulator.py --days 7 --output sample_data/simulated.json

# Option B: If you have real sensors, skip simulation and use real data

# Detect anomalies
python anomaly_detector.py --input sample_data/simulated.json

# Generate empathetic messages
python message_generator.py --input results/anomalies.json
```

**Output:**
- `sample_data/simulated.json` - 7-day sensor event log
- `results/anomalies.json` - Detected anomalies with timestamps
- `results/messages.txt` - Korean empathetic messages

---

## Cost Breakdown

### API Costs (2-week validation)

| Service | Usage | Cost |
|---------|-------|------|
| **Claude 3.5 Sonnet** | ~100K tokens (flyer AI + IoT messages) | $30 |
| **Google Cloud Vision** | 30 flyer OCR requests | $15 |
| **Neo4j Aura** | Free tier (512MB RAM, sufficient for testing) | $0 |
| **Total API Costs** | | **~$45** |

### Other Costs

| Item | Cost |
|------|------|
| IoT Sensors (5× Aqara + hub) - *optional* | $65 |
| Test flyer products (physical samples) | $20 |
| **Total Non-API Costs** | **$85** |

**Grand Total:** $130 (if using real sensors) or $65 (if simulating)

---

## Success Criteria Summary

### Go/No-Go Decision Matrix

| Component | Metric | Target | Acceptable | Fail |
|-----------|--------|--------|-----------|------|
| **Flyer AI** | Accuracy | ≥90% | ≥85% | <85% |
| | Speed | <5 sec | <10 sec | >10 sec |
| | Cost | <$0.05 | <$0.10 | >$0.10 |
| **GraphRAG** | Recommendation Accuracy | ≥80% | ≥70% | <70% |
| | Latency | <1 sec | <2 sec | >2 sec |
| | Explainability | ≥9/10 | ≥7/10 | <7/10 |
| **IoT** | Anomaly Detection | ≥90% | ≥85% | <85% |
| | False Alarms | <3% | <5% | >5% |
| | Message Quality | ≥9/10 | ≥7/10 | <7/10 |

**Decision:**
- **GO (Full Product Build):** All metrics in Target or Acceptable range
- **PIVOT:** Any metric in Fail range → See contingency plans in technical-validation-plan.md
- **DEFER:** Borderline results → Extend validation by 2 weeks with refined approach

---

## Next Steps After Validation

### If Validation Succeeds
1. **Technical:** Refine pipelines based on learnings, optimize for production
2. **Product:** Start Flutter app MVP with safety maps feature
3. **Business:** Begin apartment complex scouting and Security Guard recruitment
4. **Funding:** Use validation results in investor pitches (proof of technical feasibility)

### If Validation Fails (Any Component)
See `docs/technical-validation-plan.md` Section: "Contingency Plans" for each component

---

## Troubleshooting

### Issue: API rate limits exceeded
**Solution:** Add delays between requests or upgrade to paid tier

### Issue: Neo4j Aura connection timeout
**Solution:** Check firewall settings, ensure IP whitelisted in Aura console

### Issue: Korean text OCR accuracy low
**Solution:** Try Naver Clova OCR as alternative, or increase image preprocessing

### Issue: IoT anomaly detection too sensitive (many false alarms)
**Solution:** Adjust thresholds in `anomaly_detector.py` (increase minimum event count)

---

## Support & Questions

For technical questions about this validation:
- Review detailed plan: `docs/technical-validation-plan.md`
- Check API documentation: Anthropic, Google Cloud Vision, Neo4j
- Contact: [Your Email]

---

**Good luck with the validation! This is the most critical step before full product development.**
