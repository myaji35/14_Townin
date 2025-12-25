import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityGuard } from './security-guard.entity';

@Injectable()
export class SecurityGuardsService {
  constructor(
    @InjectRepository(SecurityGuard)
    private securityGuardRepository: Repository<SecurityGuard>,
  ) {}

  async findAll(): Promise<SecurityGuard[]> {
    return this.securityGuardRepository.find({
      relations: ['user'],
      where: { isActive: true },
    });
  }

  async findByUserId(userId: string): Promise<SecurityGuard> {
    const guard = await this.securityGuardRepository.findOne({
      where: { userId, isActive: true },
      relations: ['user'],
    });

    if (!guard) {
      throw new NotFoundException('Security guard not found');
    }

    return guard;
  }

  async findByDistrict(district: string): Promise<SecurityGuard[]> {
    return this.securityGuardRepository.find({
      where: { assignedDistrict: district, isActive: true },
      relations: ['user'],
    });
  }

  async getPerformance(userId: string) {
    const guard = await this.findByUserId(userId);

    return {
      guardId: guard.id,
      badgeName: guard.badgeName,
      assignedDistrict: guard.assignedDistrict,
      assignedGridCell: guard.assignedGridCell,
      totalEarnings: parseFloat(guard.totalEarnings.toString()),
      totalAdViews: guard.totalAdViews,
      averageRevenuePerView: guard.totalAdViews > 0
        ? parseFloat((parseFloat(guard.totalEarnings.toString()) / guard.totalAdViews).toFixed(2))
        : 0,
    };
  }
}
