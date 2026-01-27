# Townin x FLUSH Integration Strategy
**Project**: Townin Graph
**Reference**: Project 26_Flush (Zero-Data Backend Infrastructure)
**Protocol**: ulw! (Ultra Light Weight Orchestration)

## 1. Integration Philosophy
"Townin은 사용자의 위치와 신원을 '소유'하지 않고 '중계'합니다."

Townin 플랫폼의 핵심 가치인 '신뢰'를 기술적으로 보증하기 위해, `26_Flush` 프로젝트의 **Zero-Data** 및 **Headless Security** 개념을 전격 도입합니다.

## 2. Core Concepts Adoption

### 2.1. Flush Address (안심 주소 시스템)
Townin에서 발생하는 모든 물류/대면 거래 시, 사용자의 실제 주소는 DB에 영구 저장되지 않습니다.
- **Implementation**: Townin Backend calls external **Flush API** (`POST /api/v1/addresses`).
- **Data Flow**: `Real Address` -> `Flush API` -> `Token` -> `Townin DB (Transient/Short-lived Context only)`. Townin stores *only* the Token.

### 2.2. Flush Mail (안심 연락처)
Townin 커뮤니티 활동 시 개인 이메일/전화번호 노출을 차단합니다.
- **Implementation**: Townin Backend calls external **Flush API** (`POST /api/v1/relay_emails`).
- **Control**: Townin keeps the mapped Virtual Address and triggers `Kill-Switch` API upon context termination.

### 2.3. Polyglot Persistence Structure
- **PostgreSQL**: Stores User Profile and **flush_token_id** (not the address).
- **External Flush Service**: Handles the actual PII storage in ephemeral Redis.

## 3. Implementation Plan (ulw! Workflow)

### [Gemini] Directive
1.  Transform `FlushModule` into an API Client.
2.  Add `FLUSH_API_URL` and `FLUSH_API_KEY` to environment configuration.

### [Open Code] Tasks
- `src/flush/flush.module.ts`: Import `HttpModule` and `ConfigModule`.
- `src/flush/services/flush-address.service.ts`: Implement `POST /addresses` client.
- `src/flush/services/flush-mail.service.ts`: Implement `POST /relay_emails` client.

### [Oh My Open Code] Checks
- Ensure `X-Api-Key` is correctly sent in headers.
- Verify error handling when Flush API is down (Circuit Breaker or Graceful Failure).
- Confirm no PII is logged in Townin logs (except tokens).
