import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Merchant, MerchantStatus } from './merchant.entity';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { MerchantResponseDto } from './dto/merchant-response.dto';
import { ApprovalAction } from './dto/approve-merchant.dto';
import { latLngToCell } from 'h3-js';

@Injectable()
export class MerchantsService {
  private readonly H3_RESOLUTION = 9; // ~174m hexagons

  constructor(
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
  ) {}

  /**
   * Create merchant profile (onboarding)
   */
  async create(
    userId: string,
    dto: CreateMerchantDto,
  ): Promise<MerchantResponseDto> {
    // Check if user already has a merchant profile
    const existing = await this.merchantRepository.findOne({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException(
        'User already has a merchant profile. Use update endpoint instead.',
      );
    }

    // Calculate H3 cell
    const h3CellId = latLngToCell(dto.lat, dto.lng, this.H3_RESOLUTION);

    // Create merchant
    const merchant = this.merchantRepository.create({
      userId,
      businessName: dto.businessName,
      businessNumber: dto.businessNumber,
      phone: dto.phone,
      category: dto.category,
      gridCell: h3CellId,
      address: dto.address,
      latitude: dto.lat,
      longitude: dto.lng,
      openingHours: dto.openingHours,
      logoFileId: dto.logoFileId,
      status: MerchantStatus.PENDING,
    });

    const saved = await this.merchantRepository.save(merchant);

    return this.toResponseDto(saved);
  }

  /**
   * Update merchant profile
   */
  async update(
    userId: string,
    dto: UpdateMerchantDto,
  ): Promise<MerchantResponseDto> {
    const merchant = await this.merchantRepository.findOne({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant profile not found');
    }

    // Update fields
    if (dto.businessName !== undefined) {
      merchant.businessName = dto.businessName;
    }
    if (dto.businessNumber !== undefined) {
      merchant.businessNumber = dto.businessNumber;
    }
    if (dto.phone !== undefined) {
      merchant.phone = dto.phone;
    }
    if (dto.category !== undefined) {
      merchant.category = dto.category;
    }
    if (dto.address !== undefined) {
      merchant.address = dto.address;
    }
    if (dto.openingHours !== undefined) {
      merchant.openingHours = dto.openingHours;
    }
    if (dto.logoFileId !== undefined) {
      merchant.logoFileId = dto.logoFileId;
    }

    // Update location if provided
    if (dto.lat !== undefined && dto.lng !== undefined) {
      merchant.latitude = dto.lat;
      merchant.longitude = dto.lng;
      merchant.gridCell = latLngToCell(dto.lat, dto.lng, this.H3_RESOLUTION);
    }

    const updated = await this.merchantRepository.save(merchant);

    return this.toResponseDto(updated);
  }

  /**
   * Get merchant profile by user ID
   */
  async findByUserId(userId: string): Promise<MerchantResponseDto> {
    const merchant = await this.merchantRepository.findOne({
      where: { userId, isActive: true },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant profile not found for this user');
    }

    return this.toResponseDto(merchant);
  }

  /**
   * Get pending merchants (admin)
   */
  async findPending(): Promise<MerchantResponseDto[]> {
    const merchants = await this.merchantRepository.find({
      where: { status: MerchantStatus.PENDING, isActive: true },
      order: { createdAt: 'ASC' },
    });

    return merchants.map((m) => this.toResponseDto(m));
  }

  /**
   * Approve or reject merchant (admin)
   */
  async approveMerchant(
    merchantId: string,
    action: ApprovalAction,
    rejectionReason?: string,
  ): Promise<MerchantResponseDto> {
    const merchant = await this.merchantRepository.findOne({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    if (merchant.status !== MerchantStatus.PENDING) {
      throw new BadRequestException(
        `Merchant is already ${merchant.status}. Only pending merchants can be approved/rejected.`,
      );
    }

    if (action === ApprovalAction.APPROVE) {
      merchant.status = MerchantStatus.APPROVED;
      merchant.approvedAt = new Date();
      merchant.rejectionReason = null;
    } else {
      merchant.status = MerchantStatus.REJECTED;
      merchant.rejectionReason =
        rejectionReason || 'No reason provided';
    }

    const updated = await this.merchantRepository.save(merchant);

    return this.toResponseDto(updated);
  }

  async findAll(): Promise<Merchant[]> {
    return this.merchantRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByGridCell(gridCell: string): Promise<Merchant[]> {
    return this.merchantRepository.find({
      where: { gridCell, isActive: true },
      order: { totalViews: 'DESC' },
    });
  }

  async findByCity(city: string): Promise<Merchant[]> {
    return this.merchantRepository.find({
      where: {
        gridCell: Like(`${city.toLowerCase()}_%`),
        isActive: true,
      },
      order: { totalViews: 'DESC' },
    });
  }

  async findById(id: string): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOne({
      where: { id, isActive: true },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    return merchant;
  }

  async getStatsByGridCell(gridCell: string) {
    const merchants = await this.findByGridCell(gridCell);

    return {
      gridCell,
      totalMerchants: merchants.length,
      totalFlyers: merchants.reduce((sum, m) => sum + m.totalFlyers, 0),
      totalViews: merchants.reduce((sum, m) => sum + m.totalViews, 0),
      totalClicks: merchants.reduce((sum, m) => sum + m.totalClicks, 0),
      openSignboards: merchants.filter((m) => m.signboardStatus === 'open')
        .length,
    };
  }

  /**
   * Convert entity to response DTO
   */
  private toResponseDto(merchant: Merchant): MerchantResponseDto {
    return {
      id: merchant.id,
      userId: merchant.userId,
      businessName: merchant.businessName,
      businessNumber: merchant.businessNumber,
      phone: merchant.phone,
      category: merchant.category,
      gridCell: merchant.gridCell,
      address: merchant.address,
      lat: merchant.latitude ? Number(merchant.latitude) : null,
      lng: merchant.longitude ? Number(merchant.longitude) : null,
      openingHours: merchant.openingHours,
      logoFileId: merchant.logoFileId,
      status: merchant.status,
      rejectionReason: merchant.rejectionReason,
      signboardStatus: merchant.signboardStatus,
      totalFlyers: merchant.totalFlyers,
      totalViews: merchant.totalViews,
      totalClicks: merchant.totalClicks,
      isActive: merchant.isActive,
      createdAt: merchant.createdAt,
      updatedAt: merchant.updatedAt,
      approvedAt: merchant.approvedAt,
    };
  }
}
