import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class FlushAddressService {
    private readonly logger = new Logger(FlushAddressService.name);
    private readonly apiUrl: string;
    private readonly apiKey: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        // Default to a separate port (e.g., 3001) or a specific URL for FLUSH service if not defined
        this.apiUrl = this.configService.get<string>('FLUSH_API_URL', 'http://localhost:3001');
        this.apiKey = this.configService.get<string>('FLUSH_API_KEY', '');

        if (!this.apiKey) {
            this.logger.warn('FLUSH_API_KEY is not set. FlushAddressService will fail.');
        }
    }

    /**
     * Request FLUSH Server to tokenize a real address.
     * Endpoint: POST /api/v1/addresses
     */
    async flushAddress(realAddress: string): Promise<{ token: string; expiresAt: Date }> {
        try {
            const { data } = await firstValueFrom(
                this.httpService.post(
                    `${this.apiUrl}/api/v1/addresses`,
                    { data: realAddress },
                    { headers: { 'X-Api-Key': this.apiKey } },
                ),
            );

            if (!data.success) {
                throw new InternalServerErrorException(data.message || 'Failed to flush address');
            }

            return {
                token: data.token_id,
                expiresAt: new Date(data.expires_at),
            };
        } catch (error) {
            this.handleError(error);
            throw error; // Rethrow after logging
        }
    }

    /**
     * Request FLUSH Server to reveal a tokenized address.
     * Endpoint: GET /api/v1/addresses/:token_id
     */
    async revealAddress(tokenId: string): Promise<string | null> {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(
                    `${this.apiUrl}/api/v1/addresses/${tokenId}`,
                    { headers: { 'X-Api-Key': this.apiKey } },
                ),
            );

            if (!data.success) {
                return null;
            }
            return data.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 410) {
                this.logger.warn(`Address token ${tokenId} is gone (expired).`);
                return null;
            }
            this.handleError(error);
            return null;
        }
    }

    private handleError(error: any) {
        if (error instanceof AxiosError) {
            this.logger.error(`Flush API Error: ${error.message}`, error.response?.data);
        } else {
            this.logger.error(`Internal Error: ${error}`);
        }
    }
}
