import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from '../../merchants/merchant.entity';
import { Flyer } from '../../flyers/flyer.entity';
import { User } from '../../users/user.entity';
import { PointsService } from '../../points/points.service';
import { PointEarnReason, PointSpendReason } from '../../points/entities/point-transaction.entity';

export interface ApproveMerchantDto {
  merchantId: string;
  isApproved: boolean;
  rejectionReason?: string;
}

export interface ApproveFlyerDto {
  flyerId: string;
  isApproved: boolean;
  rejectionReason?: string;
}

export interface ManagePointsDto {
  userId: string;
  amount: number;
  reason: string;
}

@Injectable()
export class AdminManagementService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Flyer)
    private readonly flyerRepository: Repository<Flyer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly pointsService: PointsService,
  ) {}

  /**
   * Approve or reject a merchant
   */
  async approveMerchant(dto: ApproveMerchantDto) {
    const merchant = await this.merchantRepository.findOne({
      where: { id: dto.merchantId },
      relations: ['user'],
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    merchant.isVerified = dto.isApproved;

    if (!dto.isApproved && dto.rejectionReason) {
      // Store rejection reason in description or create a separate field
      merchant.description = `[REJECTED] ${dto.rejectionReason}`;
    }

    await this.merchantRepository.save(merchant);

    // Send notification to merchant (to be implemented with notifications module)
    // await this.notificationService.sendMerchantStatusUpdate(merchant);

    return {
      success: true,
      merchant: {
        id: merchant.id,
        businessName: merchant.businessName,
        isVerified: merchant.isVerified,
      },
      message: dto.isApproved
        ? 'Merchant approved successfully'
        : 'Merchant rejected',
    };
  }

  /**
   * Approve or reject a flyer
   */
  async approveFlyer(dto: ApproveFlyerDto) {
    const flyer = await this.flyerRepository.findOne({
      where: { id: dto.flyerId },
      relations: ['merchant', 'merchant.user'],
    });

    if (!flyer) {
      throw new NotFoundException('Flyer not found');
    }

    flyer.status = dto.isApproved ? 'approved' : 'rejected';

    if (!dto.isApproved && dto.rejectionReason) {
      // Store rejection reason
      flyer.content = `${flyer.content}\n\n[REJECTION REASON] ${dto.rejectionReason}`;
    }

    await this.flyerRepository.save(flyer);

    // Send notification to merchant
    // await this.notificationService.sendFlyerStatusUpdate(flyer);

    return {
      success: true,
      flyer: {
        id: flyer.id,
        title: flyer.title,
        status: flyer.status,
        merchantName: flyer.merchant.businessName,
      },
      message: dto.isApproved
        ? 'Flyer approved successfully'
        : 'Flyer rejected',
    };
  }

  /**
   * Get pending merchant approvals
   */
  async getPendingMerchants(page: number = 1, limit: number = 20) {
    const [merchants, total] = await this.merchantRepository.findAndCount({
      where: { isVerified: false },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: merchants,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get pending flyer approvals
   */
  async getPendingFlyers(page: number = 1, limit: number = 20) {
    const [flyers, total] = await this.flyerRepository.findAndCount({
      where: { status: 'pending' },
      relations: ['merchant', 'merchant.user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: flyers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Grant points to a user (admin action)
   */
  async grantPoints(dto: ManagePointsDto) {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const transaction = await this.pointsService.earnPoints(dto.userId, {
      reason: PointEarnReason.ADMIN_GRANT,
      amount: dto.amount,
      referenceType: 'admin',
      referenceId: dto.reason,
    });

    return {
      success: true,
      transaction,
      message: `Successfully granted ${dto.amount} points to ${user.displayName || user.email}`,
    };
  }

  /**
   * Deduct points from a user (admin action)
   */
  async deductPoints(dto: ManagePointsDto) {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const transaction = await this.pointsService.spendPoints(dto.userId, {
      reason: PointSpendReason.ADMIN_DEDUCT,
      amount: dto.amount,
      referenceType: 'admin',
      referenceId: dto.reason,
    });

    return {
      success: true,
      transaction,
      message: `Successfully deducted ${dto.amount} points from ${user.displayName || user.email}`,
    };
  }

  /**
   * Get all users with filters
   */
  async getUsers(filters: {
    role?: 'user' | 'merchant' | 'admin';
    isActive?: boolean;
    isVerified?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const where: any = {};

    if (filters.role) where.role = filters.role;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.isVerified !== undefined) where.isVerified = filters.isVerified;

    const [users, total] = await this.userRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Toggle user active status
   */
  async toggleUserStatus(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = !user.isActive;
    await this.userRepository.save(user);

    return {
      success: true,
      userId: user.id,
      isActive: user.isActive,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    };
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete
    user.deletedAt = new Date();
    user.isActive = false;
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}
