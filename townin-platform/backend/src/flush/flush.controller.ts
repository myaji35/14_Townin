import { Controller, Get, Post, Delete, Body, Param, Logger } from '@nestjs/common';
import { FlushAddressService } from './services/flush-address.service';
import { FlushMailService } from './services/flush-mail.service';
import { FlushPhoneService } from './services/flush-phone.service';

@Controller('flush')
export class FlushController {
    private readonly logger = new Logger(FlushController.name);

    constructor(
        private readonly addressService: FlushAddressService,
        private readonly mailService: FlushMailService,
        private readonly phoneService: FlushPhoneService,
    ) { }

    // --- Address ---
    @Post('address')
    async createAddress(@Body() body: { realAddress: string }) {
        return this.addressService.flushAddress(body.realAddress);
    }

    // --- Email ---
    @Post('email')
    async createEmail(@Body() body: { realEmail: string }) {
        return this.mailService.createRelayEmail(body.realEmail);
    }

    @Delete('email/:virtualAddress')
    async killEmail(@Param('virtualAddress') virtualAddress: string) {
        return this.mailService.activateKillSwitch(virtualAddress);
    }

    // --- Phone ---
    @Post('phone')
    async createPhone(@Body() body: { realPhone: string, type: 'delivery' | 'trade' }) {
        return this.phoneService.createSafePhone(body.realPhone, body.type);
    }

    @Delete('phone/:virtualNumber')
    async killPhone(@Param('virtualNumber') virtualNumber: string) {
        return this.phoneService.blockNumber(virtualNumber);
    }

    // --- Dashboard Data (Mock) ---
    @Get('dashboard/:userId')
    async getDashboard(@Param('userId') userId: string) {
        // Return mock active assets
        return {
            addresses: [
                { id: 'addr_1', alias: 'Home Delivery', token: 'fl_x9ds8...', active: true, usage: 'Courier CJ' },
            ],
            emails: [
                { id: 'mail_1', alias: 'Danggeun Chat', virtual: 'x9d8@mask.townin.com', active: true, usage: 'Used Trade' },
            ],
            phones: [
                { id: 'phone_1', alias: 'Baemin Delivery', virtual: '0504-1234-5678', active: true, usage: 'Food Delivery' },
            ]
        };
    }
}
