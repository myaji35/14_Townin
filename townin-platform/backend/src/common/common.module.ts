import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SlackService } from './services/slack.service';

@Global()
@Module({
  imports: [HttpModule, ConfigModule],
  providers: [SlackService],
  exports: [SlackService],
})
export class CommonModule {}
