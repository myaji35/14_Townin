import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { File } from '../entities/file.entity';
import { S3Service } from './s3.service';

@Injectable()
export class FileCleanupService {
  private readonly logger = new Logger(FileCleanupService.name);
  private readonly deletionDelayDays = 7; // Days to wait before actual deletion

  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private s3Service: S3Service,
  ) {}

  /**
   * Clean up soft-deleted files from S3
   * Runs daily at 2:00 AM KST
   */
  @Cron('0 2 * * *', {
    name: 'cleanup-deleted-files',
    timeZone: 'Asia/Seoul',
  })
  async cleanupDeletedFiles() {
    this.logger.log('Starting file cleanup job...');

    const deletionThreshold = new Date();
    deletionThreshold.setDate(deletionThreshold.getDate() - this.deletionDelayDays);

    try {
      // Find files marked for deletion 7+ days ago
      const filesToDelete = await this.fileRepository.find({
        where: {
          isDeleted: true,
          deletedAt: LessThan(deletionThreshold),
        },
        take: 100, // Process in batches
      });

      this.logger.log(`Found ${filesToDelete.length} files to delete from S3`);

      let deletedCount = 0;
      let errorCount = 0;

      for (const file of filesToDelete) {
        try {
          // Delete original file
          await this.s3Service.deleteFile(file.key);

          // Delete variants if they exist
          if (file.hasThumbnail) {
            await this.s3Service.deleteFile(this.s3Service.getVariantKey(file.key, 'thumbnail'));
          }
          if (file.hasMedium) {
            await this.s3Service.deleteFile(this.s3Service.getVariantKey(file.key, 'medium'));
          }
          if (file.hasLarge) {
            await this.s3Service.deleteFile(this.s3Service.getVariantKey(file.key, 'large'));
          }
          if (file.hasWebp) {
            await this.s3Service.deleteFile(this.s3Service.getVariantKey(file.key, 'webp'));
          }

          // Remove from database
          await this.fileRepository.remove(file);

          deletedCount++;
          this.logger.log(`Deleted file from S3 and DB: ${file.key}`);
        } catch (error) {
          this.logger.error(`Failed to delete file ${file.key}: ${error.message}`, error.stack);
          errorCount++;
        }
      }

      this.logger.log(
        `File cleanup completed. Deleted: ${deletedCount}, Errors: ${errorCount}`,
      );
    } catch (error) {
      this.logger.error(`File cleanup job failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Clean up expired presigned upload records (optional)
   * Runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'cleanup-orphaned-uploads',
    timeZone: 'Asia/Seoul',
  })
  async cleanupOrphanedUploads() {
    // TODO: Implement cleanup for files that were uploaded to S3
    // but never confirmed (confirmed via /confirm endpoint)
    // This requires tracking upload sessions (e.g., in Redis)
    this.logger.log('Orphaned upload cleanup - Not yet implemented');
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSizeBytes: number;
    deletedFiles: number;
    byEntityType: Record<string, number>;
  }> {
    const totalFiles = await this.fileRepository.count({
      where: { isDeleted: false },
    });

    const deletedFiles = await this.fileRepository.count({
      where: { isDeleted: true },
    });

    const { totalSize } = await this.fileRepository
      .createQueryBuilder('file')
      .select('SUM(file.size_bytes)', 'totalSize')
      .where('file.is_deleted = false')
      .getRawOne();

    // Get counts by entity type
    const byEntityTypeRaw = await this.fileRepository
      .createQueryBuilder('file')
      .select('file.entity_type', 'entityType')
      .addSelect('COUNT(*)', 'count')
      .where('file.is_deleted = false')
      .groupBy('file.entity_type')
      .getRawMany();

    const byEntityType: Record<string, number> = {};
    for (const row of byEntityTypeRaw) {
      byEntityType[row.entityType || 'unknown'] = parseInt(row.count, 10);
    }

    return {
      totalFiles,
      totalSizeBytes: parseInt(totalSize || '0', 10),
      deletedFiles,
      byEntityType,
    };
  }
}
