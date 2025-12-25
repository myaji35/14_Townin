import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FilesService } from './files.service';
import { PresignedUrlDto } from './dto/presigned-url.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * Direct Upload (Server-side)
   */
  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file directly to server' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        entityType: {
          type: 'string',
          enum: ['user_profile', 'flyer', 'merchant_logo', 'merchant_photo'],
        },
        entityId: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large' })
  async uploadFile(
    @UploadedFile() file: any,
    @Body() uploadFileDto: UploadFileDto,
    @CurrentUser() user: User,
  ) {
    const uploadedFile = await this.filesService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      user.id,
      uploadFileDto.entityType,
      uploadFileDto.entityId,
    );

    return {
      id: uploadedFile.id,
      url: uploadedFile.url,
      key: uploadedFile.key,
      size: uploadedFile.sizeBytes,
      mimeType: uploadedFile.mimeType,
      createdAt: uploadedFile.createdAt,
    };
  }

  /**
   * Generate Presigned URL (Client-side upload)
   */
  @Post('presigned-url')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Generate presigned URL for client-side S3 upload' })
  @ApiResponse({ status: 200, description: 'Presigned URL generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async getPresignedUrl(@Body() dto: PresignedUrlDto, @CurrentUser() user: User) {
    return this.filesService.generatePresignedUrl(dto, user.id);
  }

  /**
   * Confirm Upload (After client-side S3 upload)
   */
  @Post('confirm')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Confirm upload after client-side S3 upload' })
  @ApiResponse({ status: 201, description: 'Upload confirmed successfully' })
  @ApiResponse({ status: 400, description: 'File not found in S3' })
  async confirmUpload(@Body() dto: ConfirmUploadDto, @CurrentUser() user: User) {
    const file = await this.filesService.confirmUpload(dto, user.id);

    return {
      id: file.id,
      url: file.url,
      thumbnailUrl: file.hasThumbnail
        ? `${file.url.replace(/\.[^.]+$/, '')}_thumbnail.jpg`
        : null,
      mediumUrl: file.hasMedium ? `${file.url.replace(/\.[^.]+$/, '')}_medium.jpg` : null,
      size: file.sizeBytes,
      mimeType: file.mimeType,
      createdAt: file.createdAt,
    };
  }

  /**
   * Get my files
   */
  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my uploaded files' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully' })
  async getMyFiles(
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.filesService.findByUser(user.id, page, limit);
  }

  /**
   * Get file by ID
   */
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiResponse({ status: 200, description: 'File retrieved successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getFile(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.findOne(id);
  }

  /**
   * Get signed download URL
   */
  @Get(':id/download')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get signed download URL' })
  @ApiResponse({ status: 200, description: 'Download URL generated successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async getDownloadUrl(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const url = await this.filesService.getDownloadUrl(id, user.id);
    return { url, expiresIn: 3600 };
  }

  /**
   * Delete file (soft delete)
   */
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete file (soft delete)' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async deleteFile(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    await this.filesService.deleteFile(id, user.id);
    return { message: 'File deleted successfully' };
  }
}
