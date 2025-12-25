import { Controller, Get, UseGuards } from '@nestjs/common';
import { FileCleanupService } from '../services/file-cleanup.service';

/**
 * Admin File Management APIs
 * Requires super_admin role (TODO: Add RoleGuard)
 */
@Controller('admin/files')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('super_admin')
export class FilesAdminController {
  constructor(private readonly fileCleanupService: FileCleanupService) {}

  /**
   * Get file storage statistics
   * GET /api/admin/files/stats
   */
  @Get('stats')
  async getStats() {
    const stats = await this.fileCleanupService.getStorageStats();

    return {
      ...stats,
      totalSizeMB: (stats.totalSizeBytes / 1024 / 1024).toFixed(2),
      avgFileSizeBytes: stats.totalFiles > 0
        ? Math.round(stats.totalSizeBytes / stats.totalFiles)
        : 0,
    };
  }

  /**
   * Get storage usage breakdown
   * GET /api/admin/files/storage-usage
   */
  @Get('storage-usage')
  async getStorageUsage() {
    const stats = await this.fileCleanupService.getStorageStats();

    const usageByType = Object.entries(stats.byEntityType).map(([type, count]) => ({
      type,
      count,
      percentage: ((count / stats.totalFiles) * 100).toFixed(2),
    }));

    return {
      totalFiles: stats.totalFiles,
      totalSizeMB: (stats.totalSizeBytes / 1024 / 1024).toFixed(2),
      usageByType,
      deletedFiles: stats.deletedFiles,
    };
  }

  /**
   * Trigger manual cleanup (for testing)
   * POST /api/admin/files/cleanup
   */
  // @Post('cleanup')
  // async triggerCleanup() {
  //   await this.fileCleanupService.cleanupDeletedFiles();
  //   return { message: 'Cleanup job triggered' };
  // }
}
