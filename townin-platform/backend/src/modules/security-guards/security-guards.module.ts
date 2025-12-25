import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityGuardsController } from './security-guards.controller';
import { SecurityGuardsService } from './security-guards.service';
import { SecurityGuard } from './security-guard.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SecurityGuard])],
  controllers: [SecurityGuardsController],
  providers: [SecurityGuardsService],
  exports: [SecurityGuardsService],
})
export class SecurityGuardsModule {}
