import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region, RegionLevel } from './entities/region.entity';

@Injectable()
export class RegionsService {
  constructor(
    @InjectRepository(Region)
    private regionsRepository: Repository<Region>,
    @InjectRepository(UserRegion)
    private userRegionsRepository: Repository<UserRegion>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Flyer)
    private flyersRepository: Repository<Flyer>,
  ) {}

  async getAllRegions() {
    return await this.regionsRepository.find({
      relations: ['parent', 'master'],
      order: { level: 'ASC', name: 'ASC' },
    });
  }

  async getRegionHierarchy() {
    // 시 level부터 시작해서 트리 구조로 반환
    const cities = await this.regionsRepository.find({
      where: { level: RegionLevel.CITY },
      relations: ['children', 'children.children', 'master'],
      order: { name: 'ASC' },
    });

    return cities;
  }

  async getRegionStats() {
    const regions = await this.regionsRepository.find({
      where: { level: RegionLevel.NEIGHBORHOOD, isActive: true },
      relations: ['master'],
      order: { livabilityIndex: 'DESC' },
    });

    // 각 지역별 실제 통계 계산
    for (const region of regions) {
      const userCount = await this.userRegionsRepository.count({
        where: { region_id: region.id },
      });

      const merchantCount = await this.usersRepository
        .createQueryBuilder('user')
        .innerJoin('user_regions', 'ur', 'ur.user_id = user.id')
        .where('ur.region_id = :regionId', { regionId: region.id })
        .andWhere('user.role = :role', { role: 'merchant' })
        .getCount();

      const flyerCount = await this.flyersRepository
        .createQueryBuilder('flyer')
        .innerJoin('flyer.merchant', 'merchant')
        .innerJoin('user_regions', 'ur', 'ur.user_id = merchant.id')
        .where('ur.region_id = :regionId', { regionId: region.id })
        .getCount();

      region.totalUsers = userCount;
      region.totalMerchants = merchantCount;
      region.totalFlyers = flyerCount;
    }

    return regions;
  }

  async getRegionDetail(regionId: string) {
    const region = await this.regionsRepository.findOne({
      where: { id: regionId },
      relations: ['parent', 'children', 'master'],
    });

    if (!region) {
      throw new Error('Region not found');
    }

    // 사용자 목록 (최근 10명)
    const userRegions = await this.userRegionsRepository.find({
      where: { region_id: regionId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    // 전단지 목록 (최근 10개)
    const flyers = await this.flyersRepository
      .createQueryBuilder('flyer')
      .innerJoin('flyer.merchant', 'merchant')
      .innerJoin('user_regions', 'ur', 'ur.user_id = merchant.id')
      .where('ur.region_id = :regionId', { regionId })
      .orderBy('flyer.createdAt', 'DESC')
      .limit(10)
      .getMany();

    return {
      region,
      users: userRegions.map(ur => ur.user),
      flyers,
    };
  }

  async createRegion(data: {
    name: string;
    level: RegionLevel;
    code?: string;
    parent_id?: string;
    latitude?: number;
    longitude?: number;
  }) {
    const region = this.regionsRepository.create(data);
    return await this.regionsRepository.save(region);
  }

  async updateRegion(
    regionId: string,
    data: {
      name?: string;
      security_guard_id?: string;
      livabilityIndex?: number;
      safetyScore?: number;
      isActive?: boolean;
    },
  ) {
    await this.regionsRepository.update(regionId, data);
    return await this.regionsRepository.findOne({ where: { id: regionId } });
  }

  async assignMaster(regionId: string, userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'security_guard') {
      throw new Error('User must have security_guard role');
    }

    await this.regionsRepository.update(regionId, {
      master_id: userId,
    });

    return { success: true };
  }

  async getMasterRegions(userId: string) {
    return await this.regionsRepository.find({
      where: { master_id: userId },
      order: { name: 'ASC' },
    });
  }

  async updateLivabilityIndex(regionId: string, index: number) {
    await this.regionsRepository.update(regionId, {
      livabilityIndex: index,
    });
    return { success: true };
  }
}
