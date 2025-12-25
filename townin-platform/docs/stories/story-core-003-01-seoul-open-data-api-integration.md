# Story CORE-003-01: Seoul Open Data API Integration

**Epic**: CORE-003 Public Data Integration
**Priority**: P0 (Critical)
**Story Points**: 2
**Status**: 📋 Planned

## User Story

**As a** developer
**I want to** integrate with Seoul Open Data API
**So that** I can fetch public data

## Acceptance Criteria

- [ ] API 키 발급 및 설정
- [ ] HTTP client 설정 (axios)
- [ ] Rate limiting 처리
- [ ] Error handling 및 재시도 로직
- [ ] API 응답 로깅
- [ ] XML → JSON 파싱

## Tasks

### Backend
- [ ] PublicDataService 생성
- [ ] Axios instance 설정 (base URL, timeout)
- [ ] Rate limiter middleware
- [ ] Retry logic with exponential backoff
- [ ] XML parser integration (xml2js)
- [ ] Response logging
- [ ] Error handling wrapper

### Configuration
- [ ] Environment variables (.env)
- [ ] API key configuration
- [ ] Retry configuration (max retries, backoff)

### Testing
- [ ] Unit tests: XML parsing
- [ ] Integration test: API connection
- [ ] Mock API responses
- [ ] Error scenarios testing

## Technical Notes

```typescript
// Public Data Service
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { parseStringPromise } from 'xml2js';

@Injectable()
export class PublicDataService {
  private readonly logger = new Logger(PublicDataService.name);
  private readonly baseURL: string;
  private readonly apiKey: string;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // ms

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseURL = this.configService.get('SEOUL_API_BASE_URL');
    this.apiKey = this.configService.get('SEOUL_OPEN_DATA_API_KEY');

    // Configure axios instance
    this.httpService.axiosRef.defaults.timeout = 30000;
    this.httpService.axiosRef.defaults.baseURL = this.baseURL;
  }

  /**
   * Fetch data from Seoul Open Data API with retry logic
   */
  async fetchData<T>(endpoint: string, params: any = {}): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.log(`Fetching ${endpoint} (attempt ${attempt}/${this.maxRetries})`);

        const url = `${this.apiKey}/${endpoint}`;
        const response = await firstValueFrom(
          this.httpService.get(url, { params }),
        );

        // Parse XML to JSON if needed
        const data = typeof response.data === 'string'
          ? await this.parseXML(response.data)
          : response.data;

        this.logger.log(`Successfully fetched ${endpoint}`);
        return data as T;

      } catch (error) {
        lastError = error;
        this.logger.warn(`Attempt ${attempt} failed: ${error.message}`);

        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }
      }
    }

    this.logger.error(`Failed to fetch ${endpoint} after ${this.maxRetries} attempts`);
    throw lastError;
  }

  /**
   * Parse XML to JSON
   */
  private async parseXML(xml: string): Promise<any> {
    try {
      const result = await parseStringPromise(xml, {
        explicitArray: false,
        ignoreAttrs: false,
        mergeAttrs: true,
      });
      return result;
    } catch (error) {
      this.logger.error('XML parsing failed:', error);
      throw new Error('Invalid XML response');
    }
  }

  /**
   * Sleep utility for retry delay
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check API health
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Simple API call to verify connectivity
      await this.fetchData('status/check');
      return true;
    } catch (error) {
      this.logger.error('API health check failed:', error);
      return false;
    }
  }
}

// Environment Variables
SEOUL_OPEN_DATA_API_KEY=your-api-key-here
SEOUL_API_BASE_URL=http://openapi.seoul.go.kr:8088

// Module Configuration
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PublicDataService } from './public-data.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  providers: [PublicDataService],
  exports: [PublicDataService],
})
export class PublicDataModule {}

// Example Usage
const cctvData = await publicDataService.fetchData('CCTV정보조회서비스/getCCTVInfo/1/1000');
```

## Dependencies

- **External**: Seoul Open Data API key
- **Libraries**: @nestjs/axios, xml2js
- **Blocks**: All public data collection stories

## Definition of Done

- [ ] All acceptance criteria met
- [ ] PublicDataService implemented
- [ ] API key configured
- [ ] Retry logic working
- [ ] XML parsing working
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Error handling tested
- [ ] Code reviewed and merged
- [ ] Documentation updated

## Notes

- 서울 열린데이터광장 API 키 발급 필수
- API 응답은 XML 또는 JSON 형식
- Rate limit: 1000 requests/day (무료), 10000/day (유료)
- Retry는 exponential backoff으로 구현
- 모든 API 호출에 로깅 추가 (monitoring)
- API 응답 형식 변경 대비 validation 필요
