import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DigitalSignboard, SignboardStatus } from '../entities/digital-signboard.entity';
import { Merchant } from '../merchant.entity';
import { CreateSignboardDto, UpdateSignboardDto } from '../dto/signboard.dto';

@Injectable()
export class SignboardService {
  constructor(
    @InjectRepository(DigitalSignboard)
    private signboardRepository: Repository<DigitalSignboard>,
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
  ) {}

  /**
   * Create digital signboard
   */
  async createSignboard(
    merchantId: string,
    dto: CreateSignboardDto,
  ): Promise<DigitalSignboard> {
    // Check if merchant exists
    const merchant = await this.merchantRepository.findOne({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Check if signboard already exists
    const existing = await this.signboardRepository.findOne({
      where: { merchantId },
    });

    if (existing) {
      throw new ConflictException('Signboard already exists for this merchant');
    }

    const signboard = this.signboardRepository.create({
      merchantId,
      ...dto,
      status: SignboardStatus.CLOSED,
    });

    return await this.signboardRepository.save(signboard);
  }

  /**
   * Get signboard by merchant ID
   */
  async getSignboardByMerchant(merchantId: string): Promise<DigitalSignboard> {
    const signboard = await this.signboardRepository.findOne({
      where: { merchantId, isActive: true },
      relations: ['merchant'],
    });

    if (!signboard) {
      throw new NotFoundException('Signboard not found for this merchant');
    }

    return signboard;
  }

  /**
   * Update signboard
   */
  async updateSignboard(
    merchantId: string,
    dto: UpdateSignboardDto,
  ): Promise<DigitalSignboard> {
    const signboard = await this.signboardRepository.findOne({
      where: { merchantId },
    });

    if (!signboard) {
      throw new NotFoundException('Signboard not found');
    }

    Object.assign(signboard, dto);

    return await this.signboardRepository.save(signboard);
  }

  /**
   * Open signboard
   */
  async openSignboard(merchantId: string): Promise<DigitalSignboard> {
    const signboard = await this.signboardRepository.findOne({
      where: { merchantId },
    });

    if (!signboard) {
      throw new NotFoundException('Signboard not found');
    }

    if (signboard.status === SignboardStatus.OPEN) {
      throw new BadRequestException('Signboard is already open');
    }

    signboard.status = SignboardStatus.OPEN;
    signboard.openedAt = new Date();

    // Update merchant signboard status
    await this.merchantRepository.update(
      { id: merchantId },
      { signboardStatus: 'open' },
    );

    return await this.signboardRepository.save(signboard);
  }

  /**
   * Close signboard
   */
  async closeSignboard(merchantId: string): Promise<DigitalSignboard> {
    const signboard = await this.signboardRepository.findOne({
      where: { merchantId },
    });

    if (!signboard) {
      throw new NotFoundException('Signboard not found');
    }

    if (signboard.status === SignboardStatus.CLOSED) {
      throw new BadRequestException('Signboard is already closed');
    }

    signboard.status = SignboardStatus.CLOSED;
    signboard.closedAt = new Date();

    // Update merchant signboard status
    await this.merchantRepository.update(
      { id: merchantId },
      { signboardStatus: 'closed' },
    );

    return await this.signboardRepository.save(signboard);
  }

  /**
   * Get all open signboards (for user viewing)
   */
  async getOpenSignboards(
    h3CellId?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: DigitalSignboard[]; total: number }> {
    const skip = (page - 1) * limit;

    const query = this.signboardRepository
      .createQueryBuilder('signboard')
      .leftJoinAndSelect('signboard.merchant', 'merchant')
      .where('signboard.status = :status', { status: SignboardStatus.OPEN })
      .andWhere('signboard.is_active = :isActive', { isActive: true });

    if (h3CellId) {
      query.andWhere('merchant.grid_cell = :h3CellId', { h3CellId });
    }

    const [data, total] = await query
      .orderBy('signboard.total_views', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  /**
   * Track signboard view
   */
  async trackView(signboardId: string): Promise<void> {
    await this.signboardRepository.increment(
      { id: signboardId },
      'totalViews',
      1,
    );
  }

  /**
   * Track signboard click
   */
  async trackClick(signboardId: string): Promise<void> {
    await this.signboardRepository.increment(
      { id: signboardId },
      'totalClicks',
      1,
    );
  }

  /**
   * Get signboard stats
   */
  async getSignboardStats(merchantId: string): Promise<{
    totalViews: number;
    totalClicks: number;
    status: SignboardStatus;
    clickThroughRate: number;
  }> {
    const signboard = await this.getSignboardByMerchant(merchantId);

    const clickThroughRate =
      signboard.totalViews > 0
        ? (signboard.totalClicks / signboard.totalViews) * 100
        : 0;

    return {
      totalViews: signboard.totalViews,
      totalClicks: signboard.totalClicks,
      status: signboard.status,
      clickThroughRate: parseFloat(clickThroughRate.toFixed(2)),
    };
  }
}
