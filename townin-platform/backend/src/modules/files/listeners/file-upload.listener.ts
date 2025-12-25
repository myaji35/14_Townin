import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FilesService } from '../files.service';

@Injectable()
export class FileUploadListener {
  private readonly logger = new Logger(FileUploadListener.name);

  constructor(private filesService: FilesService) {}

  /**
   * Handle file.uploaded event (Direct upload)
   */
  @OnEvent('file.uploaded')
  async handleFileUploaded(payload: { fileId: string; key: string; buffer: Buffer }) {
    this.logger.log(`Processing image variants for file: ${payload.fileId}`);

    try {
      await this.filesService.processImageVariants(payload.fileId, payload.buffer);
    } catch (error) {
      this.logger.error(
        `Failed to process image variants for file ${payload.fileId}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle file.confirmed event (Presigned URL upload)
   */
  @OnEvent('file.confirmed')
  async handleFileConfirmed(payload: { fileId: string; key: string }) {
    this.logger.log(`File upload confirmed: ${payload.fileId}`);
    // For presigned URL uploads, we don't have the buffer
    // Image processing will be skipped or done via S3 trigger (Lambda)
  }

  /**
   * Handle file.deleted event
   */
  @OnEvent('file.deleted')
  async handleFileDeleted(payload: { fileId: string; key: string }) {
    this.logger.log(`File marked for deletion: ${payload.fileId}`);
    // Actual S3 deletion will be done by a cron job (7 days later)
  }
}
