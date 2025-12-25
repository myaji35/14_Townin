import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserPoints } from './entities/user-points.entity';
import {
  PointTransaction,
  PointTransactionType,
  PointEarnReason,
  PointSpendReason,
} from './entities/point-transaction.entity';
import { EarnPointsDto } from './dto/earn-points.dto';
import { SpendPointsDto } from './dto/spend-points.dto';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(UserPoints)
    private userPointsRepository: Repository<UserPoints>,
    @InjectRepository(PointTransaction)
    private pointTransactionRepository: Repository<PointTransaction>,
    private dataSource: DataSource,
  ) {}

  /**
   * Get or create user points record
   */
  async getUserPoints(userId: string): Promise<UserPoints> {
    let userPoints = await this.userPointsRepository.findOne({
      where: { userId },
    });

    if (!userPoints) {
      userPoints = this.userPointsRepository.create({
        userId,
        totalPoints: 0,
        lifetimeEarned: 0,
        lifetimeSpent: 0,
      });
      userPoints = await this.userPointsRepository.save(userPoints);
    }

    return userPoints;
  }

  /**
   * Earn points (with transaction)
   */
  async earnPoints(
    userId: string,
    dto: EarnPointsDto,
  ): Promise<PointTransaction> {
    return await this.dataSource.transaction(async (manager) => {
      // Get or create user points
      let userPoints = await manager.findOne(UserPoints, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!userPoints) {
        userPoints = manager.create(UserPoints, {
          userId,
          totalPoints: 0,
          lifetimeEarned: 0,
          lifetimeSpent: 0,
        });
      }

      // Update balances
      userPoints.totalPoints += dto.amount;
      userPoints.lifetimeEarned += dto.amount;

      await manager.save(UserPoints, userPoints);

      // Create transaction record
      const transaction = manager.create(PointTransaction, {
        userId,
        type: PointTransactionType.EARNED,
        amount: dto.amount,
        balanceAfter: userPoints.totalPoints,
        reason: dto.reason,
        description: dto.description,
        referenceId: dto.referenceId,
        referenceType: dto.referenceType,
        expiresAt: this.calculateExpiryDate(dto.reason),
      });

      return await manager.save(PointTransaction, transaction);
    });
  }

  /**
   * Spend points (with transaction)
   */
  async spendPoints(
    userId: string,
    dto: SpendPointsDto,
  ): Promise<PointTransaction> {
    return await this.dataSource.transaction(async (manager) => {
      // Get user points with lock
      const userPoints = await manager.findOne(UserPoints, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!userPoints) {
        throw new NotFoundException('User points not found');
      }

      // Check if user has enough points
      if (userPoints.totalPoints < dto.amount) {
        throw new BadRequestException(
          `Insufficient points. Available: ${userPoints.totalPoints}, Required: ${dto.amount}`,
        );
      }

      // Update balances
      userPoints.totalPoints -= dto.amount;
      userPoints.lifetimeSpent += dto.amount;

      await manager.save(UserPoints, userPoints);

      // Create transaction record
      const transaction = manager.create(PointTransaction, {
        userId,
        type: PointTransactionType.SPENT,
        amount: dto.amount,
        balanceAfter: userPoints.totalPoints,
        reason: dto.reason,
        description: dto.description,
        referenceId: dto.referenceId,
        referenceType: dto.referenceType,
      });

      return await manager.save(PointTransaction, transaction);
    });
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: PointTransaction[]; total: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.pointTransactionRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total };
  }

  /**
   * Get points summary
   */
  async getPointsSummary(userId: string): Promise<{
    totalPoints: number;
    lifetimeEarned: number;
    lifetimeSpent: number;
    recentTransactions: PointTransaction[];
  }> {
    const userPoints = await this.getUserPoints(userId);

    const recentTransactions = await this.pointTransactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      totalPoints: userPoints.totalPoints,
      lifetimeEarned: userPoints.lifetimeEarned,
      lifetimeSpent: userPoints.lifetimeSpent,
      recentTransactions,
    };
  }

  /**
   * Calculate expiry date based on earn reason
   */
  private calculateExpiryDate(reason: PointEarnReason): Date | null {
    const now = new Date();

    switch (reason) {
      case PointEarnReason.FLYER_VIEW:
      case PointEarnReason.FLYER_CLICK:
        // Flyer points expire after 30 days
        now.setDate(now.getDate() + 30);
        return now;

      case PointEarnReason.EVENT:
        // Event points expire after 90 days
        now.setDate(now.getDate() + 90);
        return now;

      default:
        // Other points don't expire
        return null;
    }
  }

  /**
   * Admin: Grant points to user
   */
  async adminGrantPoints(
    userId: string,
    amount: number,
    description: string,
  ): Promise<PointTransaction> {
    return await this.earnPoints(userId, {
      reason: PointEarnReason.ADMIN_GRANT,
      amount,
      description,
    });
  }

  /**
   * Admin: Deduct points from user
   */
  async adminDeductPoints(
    userId: string,
    amount: number,
    description: string,
  ): Promise<PointTransaction> {
    return await this.spendPoints(userId, {
      reason: PointSpendReason.ADMIN_DEDUCT,
      amount,
      description,
    });
  }
}
