import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly cloudfrontDomain: string;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION') || 'ap-northeast-2';
    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME') || 'townin-uploads-prod';
    this.cloudfrontDomain = this.configService.get<string>('CLOUDFRONT_DOMAIN') || '';

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  /**
   * Generate S3 key with proper folder structure
   * Pattern: {entityType}/{year}/{month}/{uuid}/{filename}
   */
  generateKey(fileName: string, entityType: string = 'general'): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const uuid = uuidv4();
    const ext = path.extname(fileName);
    const sanitizedName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9-_]/g, '_');

    return `${entityType}/${year}/${month}/${uuid}/${sanitizedName}${ext}`;
  }

  /**
   * Upload file buffer to S3
   */
  async uploadFile(
    buffer: Buffer,
    key: string,
    mimeType: string,
  ): Promise<{ key: string; url: string }> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      });

      await this.s3Client.send(command);

      const url = this.getPublicUrl(key);

      this.logger.log(`File uploaded successfully: ${key}`);

      return { key, url };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get presigned URL for client-side upload
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 900, // 15 minutes
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });

      this.logger.log(`Generated presigned upload URL for: ${key}`);

      return url;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get presigned URL for file download (protected files)
   */
  async getPresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });

      this.logger.log(`Generated presigned download URL for: ${key}`);

      return url;
    } catch (error) {
      this.logger.error(
        `Failed to generate presigned download URL: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);

      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Check if file exists in S3
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get public URL (CloudFront or S3)
   */
  getPublicUrl(key: string): string {
    if (this.cloudfrontDomain) {
      return `https://${this.cloudfrontDomain}/${key}`;
    }
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Get variant key (thumbnail, medium, large, webp)
   */
  getVariantKey(originalKey: string, variant: 'thumbnail' | 'medium' | 'large' | 'webp'): string {
    const parsed = path.parse(originalKey);
    const dir = parsed.dir;
    const name = parsed.name;
    const ext = variant === 'webp' ? '.webp' : parsed.ext;

    return `${dir}/${name}_${variant}${ext}`;
  }
}
