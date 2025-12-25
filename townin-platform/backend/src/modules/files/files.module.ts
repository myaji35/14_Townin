import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { FilesController } from './files.controller';
import { FilesAdminController } from './controllers/files-admin.controller';
import { FilesService } from './files.service';
import { S3Service } from './services/s3.service';
import { ImageProcessingService } from './services/image-processing.service';
import { FileCleanupService } from './services/file-cleanup.service';
import { FileUploadListener } from './listeners/file-upload.listener';
import { File } from './entities/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([File]), ConfigModule],
  controllers: [FilesController, FilesAdminController],
  providers: [
    FilesService,
    S3Service,
    ImageProcessingService,
    FileCleanupService,
    FileUploadListener,
  ],
  exports: [FilesService, S3Service, ImageProcessingService],
})
export class FilesModule {}
