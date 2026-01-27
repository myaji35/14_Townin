import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class FlushMailService {
    private readonly logger = new Logger(FlushMailService.name);
    private readonly apiUrl: string;
    private readonly apiKey: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.apiUrl = this.configService.get<string>('FLUSH_API_URL', 'http://localhost:3001');
        this.apiKey = this.configService.get<string>('FLUSH_API_KEY', '');
    }

    /**
     * Request FLUSH Server to create a relay email.
     * Endpoint: POST /api/v1/relay_emails
     */
    async createRelayEmail(realEmail: string): Promise<{ virtualAddress: string; expiresAt: Date }> {
        try {
            const { data } = await firstValueFrom(
                this.httpService.post(
                    `${this.apiUrl}/api/v1/relay_emails`,
                    { data: realEmail },
                    { headers: { 'X-Api-Key': this.apiKey } },
                ),
            );

            if (!data.success) {
                throw new InternalServerErrorException(data.message || 'Failed to create relay email');
            }

            return {
                virtualAddress: data.virtual_address,
                expiresAt: new Date(data.expires_at),
            };
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Request FLUSH Server to activate kill-switch for a virtual address.
     * (Assuming an endpoint exists, e.g., DELETE /api/v1/relay_emails/:virtual_address or similar)
     * Based on PRD, this is a "Kill Switch". Let's assume DELETE method.
     */
    async activateKillSwitch(virtualAddress: string): Promise<boolean> {
        try {
            // Note: The specific endpoint for kill-switch wasn't explicitly in the README sample, 
            // but implied by "Kill Switch". We assume a RESTful DELETE or a specific action.
            // Let's implement DELETE /api/v1/relay_emails/:id/kill based on common patterns 
            // or simply DELETE /api/v1/relay_emails/:virtual_address

            // For this implementation, we will try the RESTful delete.
            const { data } = await firstValueFrom(
                this.httpService.delete(
                    `${this.apiUrl}/api/v1/relay_emails/${virtualAddress}`,
                    { headers: { 'X-Api-Key': this.apiKey } },
                ),
            );

            return data.success;
        } catch (error) {
            this.handleError(error);
            return false;
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
