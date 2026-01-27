import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // Import HttpModule
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule
import { FlushAddressService } from './services/flush-address.service';
import { FlushMailService } from './services/flush-mail.service';
import { FlushPhoneService } from './services/flush-phone.service';
import { FlushController } from './flush.controller';

@Module({
    imports: [
        HttpModule.registerAsync({
            useFactory: () => ({
                timeout: 5000,
                maxRedirects: 5,
            }),
        }),
        ConfigModule,
    ],
    controllers: [FlushController],
    providers: [FlushAddressService, FlushMailService, FlushPhoneService],
    exports: [FlushAddressService, FlushMailService, FlushPhoneService],
})
export class FlushModule { }
