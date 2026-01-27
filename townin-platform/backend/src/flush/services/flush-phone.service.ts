import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FlushPhoneService {
    private readonly logger = new Logger(FlushPhoneService.name);

    /**
     * 가상 번호(050x) 발급 요청
     */
    async createSafePhone(realPhone: string, type: 'delivery' | 'trade'): Promise<{ virtualNumber: string; expiresAt: Date }> {
        // API Call to Flush Server (Mocked for now)
        const prefix = type === 'delivery' ? '0504' : '0505';
        const virtualNumber = `${prefix}-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`;

        this.logger.log(`[FLUSH] Safe Phone Created: ${virtualNumber} -> ${realPhone}`);

        return {
            virtualNumber,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days default
        };
    }

    async blockNumber(virtualNumber: string): Promise<boolean> {
        this.logger.log(`[FLUSH] KILL SWITCH: Phone Number ${virtualNumber} blocked.`);
        return true;
    }
}
