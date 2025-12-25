import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { File } from './entities/file.entity';
import { S3Service } from './services/s3.service';
import { ImageProcessingService } from './services/image-processing.service';
import { PresignedUrlDto } from './dto/presigned-url.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private s3Service: S3Service,
    private imageProcessingService: ImageProcessingService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {
    this.maxFileSize = parseInt(
      this.configService.get<string>('MAX_FILE_SIZE') || '10485760',
      10,
    );
    this.allowedMimeTypes = (
      this.configService.get<string>('ALLOWED_MIME_TYPES') || 'image/jpeg,image/png,image/webp'
    ).split(',');
  }

  /**
   * Direct upload (server-side)
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    userId: string,
    entityType?: string,
    entityId?: string,
  ): Promise<File> {
    // Validate file
    this.validateFile(buffer.length, mimeType);

    // Generate S3 key
    const key = this.s3Service.generateKey(originalName, entityType || 'general');

    // Upload to S3
    const { url } = await this.s3Service.uploadFile(buffer, key, mimeType);

    // Save metadata to DB
    const file = this.fileRepository.create({
      originalName,
      key,
      url,
      sizeBytes: buffer.length,
      mimeType,
      extension: path.extname(originalName),
      uploadedBy: userId,
      entityType,
      entityId,
    });

    const savedFile = await this.fileRepository.save(file);

    // Emit event for background image processing
    if (this.isImage(mimeType)) {
      this.eventEmitter.emit('file.uploaded', {
        fileId: savedFile.id,
        key: savedFile.key,
        buffer,
      });
    }

    this.logger.log(`File uploaded: ${savedFile.id} (${originalName})`);

    return savedFile;
  }

  /**
   * Generate presigned URL for client-side upload
   */
  async generatePresignedUrl(dto: PresignedUrlDto, userId: string): Promise<{
    presignedUrl: string;
    key: string;
    expiresIn: number;
    uploadId: string;
  }> {
    // Validate file
    this.validateFile(dto.fileSize, dto.fileType);

    // Generate S3 key
    const key = this.s3Service.generateKey(dto.fileName, dto.entityType || 'general');

    // Generate presigned URL
    const expiresIn = parseInt(
      this.configService.get<string>('PRESIGNED_URL_EXPIRES_IN') || '900',
      10,
    );
    const presignedUrl = await this.s3Service.getPresignedUploadUrl(key, dto.fileType, expiresIn);

    // Generate upload ID for confirmation
    const uploadId = uuidv4();

    // Store upload metadata temporarily (can use Redis for production)
    // For now, we'll skip this and rely on confirmation DTO

    this.logger.log(`Generated presigned URL for: ${dto.fileName}`);

    return {
      presignedUrl,
      key,
      expiresIn,
      uploadId,
    };
  }

  /**
   * Confirm upload after client-side S3 upload
   */
  async confirmUpload(dto: ConfirmUploadDto, userId: string): Promise<File> {
    // Verify file exists in S3
    const exists = await this.s3Service.fileExists(dto.key);
    if (!exists) {
      throw new BadRequestException('File not found in S3');
    }

    // Extract entity type from key
    const entityType = dto.key.split('/')[0];

    // Save metadata to DB
    const file = this.fileRepository.create({
      originalName: dto.originalName,
      key: dto.key,
      url: this.s3Service.getPublicUrl(dto.key),
      sizeBytes: dto.size,
      mimeType: dto.mimeType,
      extension: path.extname(dto.originalName),
      uploadedBy: userId,
      entityType,
    });

    const savedFile = await this.fileRepository.save(file);

    // Emit event for background image processing
    if (this.isImage(dto.mimeType)) {
      this.eventEmitter.emit('file.confirmed', {
        fileId: savedFile.id,
        key: savedFile.key,
      });
    }

    this.logger.log(`Upload confirmed: ${savedFile.id} (${dto.originalName})`);

    return savedFile;
  }

  /**
   * Get file by ID
   */
  async findOne(id: string): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  /**
   * Get files by user
   */
  async findByUser(userId: string, page: number = 1, limit: number = 20): Promise<{
    data: File[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [data, total] = await this.fileRepository.findAndCount({
      where: { uploadedBy: userId, isDeleted: false },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  /**
   * Get signed download URL (for protected files)
   */
  async getDownloadUrl(id: string, userId: string): Promise<string> {
    const file = await this.findOne(id);

    // Check permission (owner or admin)
    if (file.uploadedBy !== userId) {
      // TODO: Add admin role check
      throw new BadRequestException('Unauthorized');
    }

    const url = await this.s3Service.getPresignedDownloadUrl(file.key);

    this.logger.log(`Generated download URL for file: ${id}`);

    return url;
  }

  /**
   * Soft delete file
   */
  async deleteFile(id: string, userId: string): Promise<void> {
    const file = await this.findOne(id);

    // Check permission (owner or admin)
    if (file.uploadedBy !== userId) {
      // TODO: Add admin role check
      throw new BadRequestException('Unauthorized');
    }

    // Soft delete
    await this.fileRepository.update(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });

    this.logger.log(`File soft deleted: ${id}`);

    // Emit event for actual S3 deletion (scheduled cleanup)
    this.eventEmitter.emit('file.deleted', { fileId: id, key: file.key });
  }

  /**
   * Process image variants (background job)
   */
  async processImageVariants(fileId: string, buffer?: Buffer): Promise<void> {
    const file = await this.findOne(fileId);

    // If buffer not provided, download from S3
    // For now, we'll skip this as it requires downloading the file
    if (!buffer) {
      this.logger.warn(`Buffer not provided for image processing: ${fileId}`);
      return;
    }

    try {
      // Generate variants
      const variants = await this.imageProcessingService.generateVariants(buffer);

      // Upload variants to S3
      const thumbnailKey = this.s3Service.getVariantKey(file.key, 'thumbnail');
      const mediumKey = this.s3Service.getVariantKey(file.key, 'medium');
      const largeKey = this.s3Service.getVariantKey(file.key, 'large');
      const webpKey = this.s3Service.getVariantKey(file.key, 'webp');

      await Promise.all([
        this.s3Service.uploadFile(variants.thumbnail, thumbnailKey, 'image/jpeg'),
        this.s3Service.uploadFile(variants.medium, mediumKey, 'image/jpeg'),
        this.s3Service.uploadFile(variants.large, largeKey, 'image/jpeg'),
        this.s3Service.uploadFile(variants.webp, webpKey, 'image/webp'),
      ]);

      // Update file metadata
      await this.fileRepository.update(fileId, {
        hasThumbnail: true,
        hasMedium: true,
        hasLarge: true,
        hasWebp: true,
      });

      this.logger.log(`Image variants processed for file: ${fileId}`);
    } catch (error) {
      this.logger.error(`Failed to process image variants: ${error.message}`, error.stack);
    }
  }

  /**
   * Validate file size and MIME type
   */
  private validateFile(size: number, mimeType: string): void {
    if (size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size (${this.maxFileSize / 1024 / 1024}MB)`,
      );
    }

    if (!this.allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }
  }

  /**
   * Check if MIME type is image
   */
  private isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }
}
