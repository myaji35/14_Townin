import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';

export interface ImageVariants {
  thumbnail: Buffer;
  medium: Buffer;
  large: Buffer;
  webp: Buffer;
}

@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);

  /**
   * Generate all image variants (thumbnail, medium, large, webp)
   */
  async generateVariants(buffer: Buffer): Promise<ImageVariants> {
    try {
      const [thumbnail, medium, large, webp] = await Promise.all([
        this.resizeThumbnail(buffer),
        this.resizeMedium(buffer),
        this.resizeLarge(buffer),
        this.convertToWebP(buffer),
      ]);

      this.logger.log('Image variants generated successfully');

      return { thumbnail, medium, large, webp };
    } catch (error) {
      this.logger.error(`Failed to generate image variants: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Resize image to thumbnail (150x150)
   */
  async resizeThumbnail(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(150, 150, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 85 })
      .toBuffer();
  }

  /**
   * Resize image to medium (800x600)
   */
  async resizeMedium(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(800, 600, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();
  }

  /**
   * Resize image to large (1920x1080)
   */
  async resizeLarge(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(1920, 1080, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();
  }

  /**
   * Convert image to WebP format (30% smaller)
   */
  async convertToWebP(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .webp({ quality: 80 })
      .toBuffer();
  }

  /**
   * Auto-rotate image based on EXIF orientation
   */
  async autoRotate(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .rotate() // Auto-rotate based on EXIF
      .toBuffer();
  }

  /**
   * Extract image metadata
   */
  async getMetadata(buffer: Buffer): Promise<sharp.Metadata> {
    return sharp(buffer).metadata();
  }

  /**
   * Optimize image without resizing
   */
  async optimize(buffer: Buffer, mimeType: string): Promise<Buffer> {
    const image = sharp(buffer);

    if (mimeType === 'image/jpeg') {
      return image.jpeg({ quality: 85, progressive: true }).toBuffer();
    } else if (mimeType === 'image/png') {
      return image.png({ compressionLevel: 9 }).toBuffer();
    } else if (mimeType === 'image/webp') {
      return image.webp({ quality: 80 }).toBuffer();
    }

    return buffer;
  }
}
