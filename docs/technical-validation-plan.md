# Townin Technical Validation Plan
**Flyer AI Prototype & Core Technology Proof-of-Concept**

---

**Document Version:** 1.0
**Date:** 2025-11-30
**Author:** Mary (Business Analyst) with Technical Architect collaboration recommended
**Validation Timeline:** 2 weeks (MVP), 6 weeks (full validation)

---

## Executive Summary

**Objective:** Validate technical feasibility of Townin's three core innovations before full product development:
1. **Multimodal Flyer AI** (Vision + OCR + LLM pipeline)
2. **GraphRAG Insurance Engine** (Neo4j + LangChain inference)
3. **IoT Sensor Integration** (Low-cost motion sensors + AI interpretation)

**Success Criteria:**
- Flyer AI: ≥85% accuracy in extracting product data from Korean flyers
- GraphRAG: Demonstrate multi-hop inference (User → Location → Risk → Insurance)
- IoT: Prove anomaly detection from sensor patterns

**Resource Budget:** $500 (2-week MVP), $2,000 (6-week full validation)

**Risk Mitigation:** If any component fails validation, pivot strategy documented for each.

---

## Validation 1: Multimodal Flyer AI Pipeline

### Business Criticality: **HIGH**
**Why:** SMB digitalization is the "killer app" differentiator. If flyer scanning doesn't work, entire business model weakens.

### Technical Hypothesis
"A pipeline combining Vision AI + OCR + LLM can convert a photo of a Korean paper flyer into structured product data (name, price, image, description) with ≥85% accuracy in <10 seconds."

---

### Validation Approach

#### Phase 1: Proof-of-Concept (Week 1)
**Goal:** Demonstrate pipeline works on 10 sample flyers

**Tech Stack:**
- **Vision AI:** Claude 3.5 Sonnet (best Korean performance per market research)
- **OCR:** Google Cloud Vision API (backup: Naver Clova OCR)
- **LLM:** Claude 3.5 Sonnet (text understanding + structuring)
- **Framework:** Python + LangChain

**Test Dataset:**
- Collect 10 real Korean flyers (supermarket, restaurant, cosmetics, electronics)
- Variety: Color/BW, dense/sparse layout, handwritten/printed prices
- Ground truth: Manually label all products, prices, promotions

**Pipeline Stages:**
```python
Input: Flyer photo (JPEG)
  ↓
Stage 1: Vision AI - Detect layout, crop product regions
  • Claude 3.5 Sonnet vision
  • Prompt: "Identify all product sections in this Korean flyer. Return bounding boxes."
  ↓
Stage 2: OCR - Extract text from each product region
  • Google Cloud Vision API (Korean language pack)
  • Output: Raw text per product
  ↓
Stage 3: LLM Structuring - Parse text into JSON
  • Claude 3.5 Sonnet
  • Prompt: "Extract: product_name, price, unit, promotion (e.g., 1+1), description"
  • Output: Structured JSON
  ↓
Stage 4: Image Enhancement - Crop and enhance product photos
  • PIL/OpenCV for cropping
  • Optional: Remove background for cleaner e-commerce look
  ↓
Output: JSON array of products ready for database insert
```

**Success Metrics:**
- ✅ **Accuracy:** ≥85% fields correctly extracted (compare to ground truth)
- ✅ **Speed:** <10 seconds per flyer (acceptable for merchant upload)
- ✅ **Cost:** <$0.10 per flyer (sustainable at ₩50 revenue per flyer view)

**Deliverable:** Python script + 10-flyer test results spreadsheet

---

#### Phase 2: Edge Case Testing (Week 2)
**Goal:** Identify failure modes and improve robustness

**Additional Test Cases (20 flyers):**
1. **Poor Photo Quality:** Blurry, shadowed, crumpled flyers
2. **Complex Layouts:** Multi-column, rotated text, overlapping images
3. **Handwritten Elements:** Prices written by marker, circled specials
4. **Mixed Languages:** Korean + English (brand names, imported goods)
5. **Promotions:** 1+1, 2+1, "한정판매" (limited sale), "~ 까지" (until date)

**Error Analysis:**
- Log all failures with root cause categorization
- Calculate precision/recall per field type (name: 92%, price: 88%, etc.)
- Identify patterns: "Fails on dark backgrounds" → adjust preprocessing

**Improvement Iterations:**
1. Adjust Vision AI prompts for better cropping
2. Add preprocessing (contrast enhancement, rotation correction)
3. Fine-tune LLM prompts with few-shot examples

**Success Criteria:**
- ≥85% accuracy maintained across diverse flyer types
- Clear documentation of unsupported cases (e.g., "Video QR codes not extracted")

---

#### Phase 3: Merchant Usability Test (Week 3-4, if budget allows)
**Goal:** Validate real merchants can use the tool

**Process:**
1. Recruit 5 small business owners (coffee shop, grocery, salon, restaurant, retail)
2. Give them smartphone app mockup (Flutter prototype or even just mobile web form)
3. Ask them to photograph and upload 3 flyers each
4. Measure:
   - Time to complete upload (target: <2 minutes)
   - Satisfaction score (1-10, target: ≥8)
   - Error rate requiring manual correction (target: <20%)

**Feedback Collection:**
- "What was confusing?"
- "Would you pay ₩50 per flyer view for this?"
- "What's missing?"

**Pivot Trigger:**
- If <60% accuracy or merchants unwilling to pay → Consider simpler "flyer hosting" without AI parsing (just display photo, no structured data)

---

### Validation Metrics & Thresholds

| Metric | Target | Acceptable | Fail |
|--------|--------|-----------|------|
| **Field Extraction Accuracy** | ≥90% | ≥85% | <85% |
| **Processing Speed** | <5 sec | <10 sec | >10 sec |
| **Cost per Flyer** | <$0.05 | <$0.10 | >$0.10 |
| **Merchant Usability Score** | ≥9/10 | ≥7/10 | <7/10 |
| **Promotion Understanding** | ≥85% | ≥70% | <70% |

**Go/No-Go Decision:**
- **GO:** If all metrics in "Target" or "Acceptable" range
- **PIVOT:** If any metric in "Fail" range → See contingency plans below

---

### Contingency Plans (If Validation Fails)

#### Scenario A: Low Accuracy (<85%)
**Root Cause Likely:** Korean language nuances, complex layouts
**Pivot Options:**
1. **Human-in-Loop:** AI extracts, merchant reviews/corrects (still 10x faster than manual)
2. **Simplified Input:** Merchants fill form while AI auto-fills from photo (hybrid)
3. **Niche Focus:** Only support simple layouts (grocery flyers) initially, expand later

#### Scenario B: High Cost (>$0.10/flyer)
**Root Cause Likely:** API costs higher than estimated
**Pivot Options:**
1. **Open-Source Models:** Use Llama 3.2 Vision (free) instead of Claude (requires GPU hosting ~$100/mo)
2. **Batch Processing:** Process flyers overnight in batches to use cheaper non-real-time APIs
3. **Freemium Limit:** Free for 10 flyers/month, charge for additional (shift cost to high-volume merchants)

#### Scenario C: Merchants Don't Trust AI
**Root Cause Likely:** Fear of errors, lack of control
**Pivot Options:**
1. **Preview-Approve Workflow:** Show AI results, merchant clicks "Approve" or edits before publishing
2. **Gradual Rollout:** Start with "AI assistant" positioning, not "AI automation"
3. **Transparency:** Show confidence scores per field ("Price: 95% confident")

---

## Validation 2: GraphRAG Insurance Inference Engine

### Business Criticality: **MEDIUM-HIGH**
**Why:** Core differentiation and high-margin revenue (lead fees), but not needed until Phase 3 (12+ months out). Validate feasibility now, full build later.

### Technical Hypothesis
"A Neo4j knowledge graph combined with LangChain can perform multi-hop reasoning to recommend relevant insurance products based on user location, behavior, and IoT data with ≥70% user acceptance rate."

---

### Validation Approach

#### Phase 1: Graph Schema Design (Week 1)
**Goal:** Define optimal graph structure for insurance inference

**Node Types:**
```
User (anonymous ID, age_range, household_type)
Location (grid_cell, property_value_tier, flood_risk, crime_rate)
Behavior (flyer_category_views, search_keywords, movement_patterns)
IoT_Pattern (activity_level, sleep_regularity, anomaly_count)
Risk_Factor (type: health, property, accident)
Insurance_Product (category, coverage_type, target_demographic)
```

**Relationship Types:**
```
(User)-[:LIVES_IN]->(Location)
(User)-[:EXHIBITS]->(Behavior)
(User)-[:HAS_PATTERN]->(IoT_Pattern)
(Location)-[:HAS_RISK]->(Risk_Factor)
(Behavior)-[:INDICATES]->(Risk_Factor)
(Risk_Factor)-[:COVERED_BY]->(Insurance_Product)
```

**Sample Graph (Synthetic Data):**
- Create 100 synthetic users with realistic Korean demographics
- 20 Seoul grid locations with real property/risk data (from Seoul Open Data)
- 50 insurance products (real products from Samsung Life, KB, Hanwha)

**Deliverable:** Neo4j Aura instance with populated test graph

---

#### Phase 2: Inference Query Development (Week 2-3)
**Goal:** Demonstrate multi-hop reasoning queries

**Example Inference 1: Flood Risk + Home Ownership → Property Insurance**
```cypher
// Find users in flood-prone areas who view home improvement flyers
MATCH (u:User)-[:LIVES_IN]->(loc:Location)-[:HAS_RISK]->(r:Risk_Factor {type: 'flood'})
MATCH (u)-[:EXHIBITS]->(b:Behavior {category: 'home_improvement'})
MATCH (r)-[:COVERED_BY]->(ins:Insurance_Product {category: 'property'})
WHERE loc.property_value_tier >= 3  // Mid-high value homes
RETURN u.id, ins.name,
       "Lives in flood zone + interested in home improvement" AS reasoning
```

**Example Inference 2: Senior Activity Anomaly + Care Product Interest → Care Insurance**
```cypher
// Find users with irregular IoT patterns viewing senior care flyers
MATCH (u:User)-[:HAS_PATTERN]->(iot:IoT_Pattern)
MATCH (u)-[:EXHIBITS]->(b:Behavior {category: 'senior_care'})
MATCH (iot)-[:INDICATES]->(r:Risk_Factor {type: 'health_decline'})
MATCH (r)-[:COVERED_BY]->(ins:Insurance_Product {category: 'care'})
WHERE iot.anomaly_count > 5  // Frequent irregularities
RETURN u.id, ins.name,
       "Anomaly patterns + care interest" AS reasoning
```

**LangChain Integration:**
```python
from langchain.chains import GraphCypherQAChain
from langchain.graphs import Neo4jGraph

# Connect to Neo4j
graph = Neo4jGraph(url="neo4j+s://xxx.aura.com", username="neo4j", password="xxx")

# Natural language query
question = "Which insurance should I recommend for a user in Gangnam who frequently searches for health products?"

# LangChain generates Cypher query, executes, summarizes result
chain = GraphCypherQAChain.from_llm(llm=claude, graph=graph)
result = chain.run(question)
# Output: "Care insurance (Samsung Care Plus) - User shows health interest in high-stress area"
```

**Success Metrics:**
- ✅ Correct insurance category recommended: ≥80%
- ✅ Reasoning explainability: Understandable by non-technical FP
- ✅ Query latency: <2 seconds (acceptable for co-pilot UI)

---

#### Phase 3: Acceptance Testing (Week 4, optional)
**Goal:** Validate recommendations resonate with users

**Method:**
1. Generate 20 recommendations from synthetic user profiles
2. Show to 10 insurance FPs: "Would you recommend this product to this customer profile?"
3. Measure agreement rate (target: ≥70%)

**Feedback:**
- "What's missing in the reasoning?"
- "Is this recommendation defensible to the customer?"
- "Would this help you avoid compliance issues?"

---

### Validation Metrics & Thresholds

| Metric | Target | Acceptable | Fail |
|--------|--------|-----------|------|
| **Recommendation Accuracy** | ≥80% | ≥70% | <70% |
| **FP Acceptance Rate** | ≥80% | ≥70% | <70% |
| **Query Latency** | <1 sec | <2 sec | >2 sec |
| **Explainability Score (1-10)** | ≥9 | ≥7 | <7 |

**Go/No-Go Decision:**
- **GO:** Acceptable range or better → Proceed with Phase 3 product development
- **DEFER:** Borderline → Collect more real user data before productizing
- **PIVOT:** Fail range → Use simpler rule-based recommendations instead of GraphRAG

---

### Contingency Plans (If GraphRAG Fails)

#### Scenario A: Poor Recommendation Quality
**Pivot:** Use rule-based heuristics instead of graph inference
- "If flood zone + property value >$300K → Property insurance"
- Still valuable, just less sophisticated

#### Scenario B: FPs Don't Trust AI
**Pivot:** Position as "research assistant" not "recommender"
- Show data patterns, let FP make final call
- Reduce liability, maintain value

#### Scenario C: Too Slow for Real-Time
**Pivot:** Pre-compute recommendations nightly
- Batch process instead of on-demand queries
- Acceptable for non-urgent use cases

---

## Validation 3: IoT Sensor Integration & Anomaly Detection

### Business Criticality: **MEDIUM**
**Why:** Critical for lock-in strategy, but Phase 2 feature (6+ months). Validate partner compatibility now.

### Technical Hypothesis
"Low-cost Zigbee motion sensors (<$10) can provide sufficient data granularity for AI to detect anomalies (long inactivity, midnight wandering) and generate empathetic family updates."

---

### Validation Approach

#### Phase 1: Hardware Selection (Week 1)
**Goal:** Identify compatible, cost-effective sensors

**Candidate Sensors:**
| Brand/Model | Price | Battery Life | Protocol | Availability (Korea) |
|-------------|-------|--------------|----------|---------------------|
| Aqara Motion P1 | $8 | 2 years | Zigbee | ✅ Coupang, 11st |
| Sonoff SNZB-03 | $6 | 1.5 years | Zigbee | ✅ AliExpress (2-week ship) |
| Samsung SmartThings | $15 | 2 years | Zigbee | ✅ Retail stores |
| Tuya PIR | $5 | 1 year | Zigbee/WiFi | ✅ AliExpress |

**Selection Criteria:**
1. **Price:** <$10 (target $30-50 for 3-sensor home kit)
2. **Battery Life:** >1 year (minimize maintenance)
3. **Availability:** Purchasable in Korea without import hassle
4. **API Access:** Cloud API or local hub integration (Home Assistant, Zigbee2MQTT)

**Recommendation:** **Aqara Motion P1** (best balance of price, reliability, Korean availability)

**Purchase for Testing:** 5 sensors ($40) + Zigbee hub ($25) = **$65 total**

---

#### Phase 2: Data Collection Simulation (Week 2)
**Goal:** Validate sensor data is rich enough for AI inference

**Test Setup:**
1. Install 3 sensors in tester's home (living room, bedroom, bathroom)
2. Collect 7 days of motion event data
3. Log timestamps: [motion detected, no motion detected]

**Sample Data Format:**
```json
{
  "sensor_id": "living_room",
  "timestamp": "2025-12-01T14:32:15Z",
  "event": "motion_detected"
}
```

**Analysis:**
- Calculate activity patterns: Most active hours, sedentary periods
- Detect anomalies: Midnight bathroom trips (>3 = potential health issue), all-day inactivity

**Baseline Patterns (Expected):**
- Morning activity spike (7-9am)
- Evening activity spike (6-10pm)
- Low nighttime activity (11pm-6am)

**Anomalies to Detect:**
1. **Long Inactivity:** No motion for >6 hours during daytime
2. **Midnight Wandering:** >3 motion events between 12-4am
3. **Irregular Sleep:** Motion in bedroom during daytime (unusual napping pattern)

---

#### Phase 3: AI Interpretation (Week 3)
**Goal:** Convert sensor patterns into empathetic messages

**LLM Prompt Template:**
```
You are a family care AI assistant. Based on the following motion sensor data from [name]'s home, generate a warm, reassuring message for their adult child.

Data:
- Total motion events today: 45 (average: 38)
- Most active time: 7:30am - 9:00am
- Longest inactive period: 2 hours (afternoon nap)
- Midnight bathroom visits: 1

Guidelines:
- Be warm and positive
- Avoid medical language or alarm (unless true emergency)
- Frame data as "they're doing well" when possible
- Suggest gentle check-in if concerning pattern

Output: 2-3 sentence message in Korean
```

**Sample Outputs:**
- **Normal Day:** "어머니가 오늘 아침 일찍 활동하셨어요! 평소보다 활발하신 하루를 보내고 계십니다 😊"
  - (Mom was active early this morning! She's having a more energetic day than usual 😊)

- **Anomaly (Gentle):** "오늘 어머니께서 조금 조용한 하루를 보내셨네요. 주말이라 푹 쉬시는 걸 수도 있어요. 시간 되실 때 안부 전화 한 통 어떠세요?"
  - (Mom had a quieter day today. She might be resting since it's the weekend. How about a check-in call when you have time?)

**Success Metrics:**
- ✅ Message tone: Non-alarmist yet informative (subjective, review with 5 testers)
- ✅ Accuracy: Reflects actual data patterns (compare to ground truth)
- ✅ Actionability: Clear suggestion when anomaly detected

---

#### Phase 4: Alert Threshold Tuning (Week 4)
**Goal:** Avoid false alarms while catching real issues

**Alert Types & Thresholds (Initial):**
| Alert | Condition | Urgency | Notification |
|-------|-----------|---------|--------------|
| **Emergency** | No motion >12 hours | High | Immediate push + call |
| **Concern** | Midnight activity >5 events | Medium | Next morning summary |
| **Info** | Unusual but not alarming | Low | Weekly digest |

**Testing:**
- Simulate scenarios (testers act out: fell asleep early, traveled overnight, etc.)
- Measure false positive rate (target: <5%)

**Iteration:**
- Adjust thresholds based on feedback
- Add context: "No motion + door sensor shows 'away'" = traveling (not emergency)

---

### Validation Metrics & Thresholds

| Metric | Target | Acceptable | Fail |
|--------|--------|-----------|------|
| **Anomaly Detection Accuracy** | ≥90% | ≥85% | <85% |
| **False Alarm Rate** | <3% | <5% | >5% |
| **Message Satisfaction (1-10)** | ≥9 | ≥7 | <7 |
| **Hardware Cost (3-sensor kit)** | <$40 | <$50 | >$50 |

**Go/No-Go Decision:**
- **GO:** If acceptable thresholds met → Proceed with Phase 2 IoT product launch
- **PIVOT:** If fails → Partner with existing care services (CareRing) instead of building in-house

---

### Contingency Plans (If IoT Validation Fails)

#### Scenario A: Sensors Too Unreliable (High False Alarms)
**Pivot:** Require multi-sensor confirmation before alerting
- Bedroom + bathroom both inactive → Higher confidence of issue

#### Scenario B: Cost Too High (>$50 per kit)
**Pivot:** Partner with telecom (SK/KT) to bundle sensors with mobile plans
- Subsidize hardware cost with data/service revenue

#### Scenario C: Users Find Messages "Creepy"
**Pivot:** Opt-in explicit consent + full transparency dashboard
- Show raw data, let users decide how much AI interprets

---

## Overall Validation Timeline & Budget

### 2-Week MVP Sprint (Minimum Validation)

**Week 1:**
- Day 1-2: Flyer AI pipeline setup + 10 sample tests
- Day 3-4: GraphRAG schema design + sample data population
- Day 5: IoT sensor purchase + initial setup

**Week 2:**
- Day 1-3: Flyer AI edge case testing (20 more flyers)
- Day 4-5: GraphRAG query development + inference demo
- Day 6-7: IoT data collection + anomaly detection

**Budget: $500**
- Claude API: $100
- Google Cloud Vision: $50
- Neo4j Aura (free tier): $0
- IoT sensors + hub: $65
- Test flyer collection: $20 (buy sample products)
- Merchant interview incentives: $200 (₩50K × 5 = ₩250K)
- Contingency: $65

---

### 6-Week Full Validation (Comprehensive)

**Weeks 1-2:** MVP Sprint (as above)

**Weeks 3-4:**
- Merchant usability testing (5 merchants × 3 flyers each)
- GraphRAG FP acceptance testing (10 insurance professionals)
- IoT alert threshold tuning (1 week of live data)

**Weeks 5-6:**
- Integration testing: All three components working together
- Documentation: Technical specs, API schemas, lessons learned
- Go/No-Go decision meeting

**Budget: $2,000**
- API costs (extended testing): $300
- Merchant incentives: $500
- FP consultant fees: $600
- Additional IoT sensors (larger test): $200
- Developer time (if hiring contractor): $400
- Contingency: $0

---

## Success Metrics Summary

### Critical Go/No-Go Criteria (Must Pass ALL)
1. ✅ **Flyer AI Accuracy:** ≥85%
2. ✅ **GraphRAG Recommendation Acceptance:** ≥70%
3. ✅ **IoT Anomaly Detection Accuracy:** ≥85%
4. ✅ **Total Validation Cost:** <$2,500

### Ideal Metrics (Nice to Have)
- Flyer AI: ≥90% accuracy, <5 sec processing
- GraphRAG: ≥80% FP acceptance, explainable reasoning
- IoT: <3% false alarms, ≥9/10 message satisfaction

---

## Risk Assessment & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Flyer AI fails on Korean text** | Medium | High | Use Clova OCR (Naver), fine-tune prompts |
| **GraphRAG too slow** | Low | Medium | Pre-compute recommendations (batch) |
| **IoT sensors unreliable** | Low | Medium | Multi-sensor confirmation logic |
| **Validation budget overrun** | Medium | Low | Start with 2-week MVP, extend only if promising |
| **Merchants reject AI tool** | Medium | High | Pivot to human-in-loop hybrid approach |

---

## Post-Validation Next Steps

### If Validation Succeeds (All Green)
1. **Proceed to Phase 1 Development:** Safety maps + merchant onboarding MVP
2. **Hire/Contract:** Senior full-stack developer + Flutter specialist
3. **Set up Infrastructure:** AWS/GCP accounts, Neo4j production instance
4. **Regulatory:** PIPA compliance audit, insurance partnership legal review

### If Validation Partially Succeeds (Some Yellow/Red)
1. **Prioritize:** Build only validated components first
2. **Defer:** Delay failed components to Phase 2-3
3. **Pivot:** Implement contingency plans (see component sections above)

### If Validation Fails (Critical Red)
1. **Fundamental Pivot:** Reconsider business model
   - Option A: Simpler "local info aggregator" (no AI automation)
   - Option B: B2B SaaS for municipalities (smart city platform)
   - Option C: Acqui-hire target (sell validated tech to incumbent)

---

## Appendix A: Test Data & Resources

### Flyer Test Dataset
**Source:** Visit 5 local businesses in Bundang/Gangnam, request physical flyers
- Supermarket: E-Mart, Homeplus
- Restaurant: Korean BBQ, café
- Cosmetics: Olive Young, local shop
- Electronics: Hi-Mart
- **Total:** 30 flyers (10 POC + 20 edge cases)

### GraphRAG Synthetic Data Generator
**Script:** Python script to generate realistic user profiles
```python
import random

def generate_user(user_id):
    return {
        "id": user_id,
        "age_range": random.choice(["25-34", "35-44", "45-54", "55-64", "65+"]),
        "household_type": random.choice(["single", "couple", "family_young", "family_senior"]),
        "location_grid": random.choice(["gangnam_03", "bundang_12", "mapo_08"]),
        "behaviors": random.sample(["grocery", "health", "home_improvement", "senior_care"], k=2)
    }

# Generate 100 users
users = [generate_user(i) for i in range(100)]
```

### IoT Data Simulator (If Hardware Delays)
```python
import random
from datetime import datetime, timedelta

def simulate_day(activity_level="normal"):
    events = []
    current_time = datetime.now().replace(hour=0, minute=0)

    # Morning activity (7-9am)
    for _ in range(random.randint(10, 15)):
        current_time += timedelta(minutes=random.randint(5, 20))
        events.append({"time": current_time, "sensor": "living_room", "event": "motion"})

    # ... (continue for day/evening/night patterns)

    # Anomaly injection (if requested)
    if activity_level == "anomaly":
        # Add midnight wandering
        midnight = datetime.now().replace(hour=2, minute=30)
        events.append({"time": midnight, "sensor": "bathroom", "event": "motion"})

    return events
```

---

**Document Control:**
- **Author:** Mary, Business Analyst
- **Technical Review Needed:** Yes (recommend Architect review before execution)
- **Validation Start Date:** TBD (recommend within 2 weeks of project approval)
- **Related Documents:** project-brief.md, market-research.md

**End of Technical Validation Plan**
