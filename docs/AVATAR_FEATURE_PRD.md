# [PRD] Project Townin Fit: Privacy-First AI Avatar for Virtual Try-On
**Protocol**: ulw! (Gemini -> Open Code -> Oh My Open Code)
**Version**: 0.1.0 (Draft)

## 1. 🧠 Gemini: Concept & Strategy

### 1.1. Vision
"내 몸을 가장 잘 아는, 하지만 나를 소유하지 않는 쇼핑 에이전트."
사용자의 신체 정보(키, 몸무게, 품)와 전신 사진을 기반으로 **초개인화된 3D/2.5D 아바타**를 생성합니다. 이 아바타는 의류 구매 시 '가상 피팅(Virtual Try-On)'에 활용되며, **FLUSH 철학**에 따라 원본 생체 데이터(전신 사진)는 생성 즉시 폐기됩니다.

### 1.2. Core Features
1.  **Body Scan (Zero-Retention)**: 전신 사진을 업로드하면 AI가 신체/골격 치수를 추출하고 즉시 사진을 삭제합니다.
2.  **Metric Input**: 키, 몸무게, 평소 입는 사이즈, 체형 특이사항(예: 어깨가 넓음, 허벅지가 굵음)을 보정 데이터로 입력합니다.
3.  **My Twin Avatar**: 추출된 데이터 + 입력 데이터를 합성하여 나만의 'Fit Avatar'를 생성합니다.
4.  **Virtual Fitting**: 판매 중인 의류 상품(3D 모델링 or 2D 이미지)을 아바타에 입혀보고 핏(Fit)을 확인합니다.

### 1.3. Privacy Logic (Flush Integration)
*   **Original Photo**: Process -> Extract Mesh/Landmarks -> **FLUSH IMMEDIATELY**.
*   **Generated Avatar**: 비식별화된 3D Mesh 데이터 형태로 저장 (얼굴은 블러 처리하거나 기본 아바타 얼굴 사용 가능).
*   **User Choice**: "내 얼굴 사용" 옵션 선택 시, 얼굴 텍스처만 별도 암호화하여 로컬(기기) 저장 권장.

---

## 2. 🔨 Open Code: Technical Architecture

### 2.1. Tech Stack
*   **Frontend (Flutter/React)**:
    *   Camera UI with Guide Overlay (전신 촬영 가이드).
    *   Interactive Avatar Viewer (Three.js or Flutter 3D).
*   **AI Engine (Python/FastAPI)**:
    *   **Pose Estimation**: MediaPipe / OpenPose (관절 포인트 추출).
    *   **Human Mesh Recovery (HMR)**: HMR 2.0 or SMPL (2D 이미지 -> 3D 메쉬 변환).
    *   **Measurement Extraction**: 픽셀 단위 측정값을 실제 키(cm) 비율로 변환 로직.
*   **Backend (NestJS)**:
    *   Avatar Metadata Storage (JSON: 어깨 너비, 허리 둘레, 팔 길이 등).
    *   Flush Service Integration (데이터 파기 증명).

### 2.2. Data Flow
1.  Client uploads Image to `Computing Server` (Ephemeral).
2.  AI Engine extracts `SMPL Parameters` (Shape, Pose) & `Texture Map`.
3.  Server calls `Flush Service` to wipe image from memory/disk.
4.  Server saves `SMPL Parameters` to `PostgreSQL` (User Profile).
5.  Client downloads Parameters to render Avatar locally.

---

## 3. 🚑 Oh My Open Code: Risk & Validation

### 3.1. Accuracy Risks
*   **Issue**: 사진 촬영 각도/조명에 따라 치수 오차가 큼 (특히 헐렁한 옷을 입고 찍은 경우).
*   **Solution**:
    *   "타이트한 옷 착용 권장" 가이드라인 필수.
    *   사용자가 입력한 '키/몸무게'를 **Hard Constraint**로 사용하여 AI 추정치를 보정 (Calibration).

### 3.2. Privacy Risks
*   **Issue**: 전신 사진이 서버에 머무르는 짧은 시간 동안 유출될 가능성.
*   **Solution**:
    *   이미지 처리를 **Edge Device (On-Device AI)**에서 수행하는 것을 장기 목표로 함 (TensorFlow Lite / CoreML).
    *   서버 처리 시, 메모리에서만 처리하고 디스크 I/O를 차단하는 **Ramdisk** 환경 사용.

---

## 4. UI/UX Workflow (User Scenario)

### Step 1: Init
- "당신의 핏을 찾아드릴게요. 딱 3가지만 알려주세요."
- Input: 키(cm), 몸무게(kg), 성별.

### Step 2: Scan (Optional but Recommended)
- "더 정확한 핏을 위해 전신 사진이 필요해요. 사진은 분석 후 즉시 사라집니다 (FLUSH Engine)."
- Action: 카메라 촬영 or 갤러리 업로드.
- Feedback: "분석 중... 어깨 너비 추출 완료... 다리 길이 계산 중... 원본 사진 삭제 완료!" (진행 상황 시각화).

### Step 3: Confirmation
- 생성된 3D 마네킹이 화면에 등장.
- "이 체형이 맞나요?" (슬라이더로 미세 조정: 배 살짝 나오게, 어깨 조금 좁게).

### Step 4: Fitting
- 쇼핑몰 상품 상세 페이지에서 "내 아바타에 입히기" 버튼 활성화.
