import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyMember } from '../entities/family-member.entity';
import { CreateFamilyMemberDto } from '../dto/create-family-member.dto';
import { UpdateFamilyMemberDto } from '../dto/update-family-member.dto';
import { createHash } from 'crypto';

/**
 * Family Members Service
 *
 * Manages family member profiles for users
 * - Privacy-first design (no real names, SSN, addresses)
 * - Support for IoT monitoring and care notifications
 */
@Injectable()
export class FamilyMembersService {
  private readonly logger = new Logger(FamilyMembersService.name);
  private readonly MAX_FAMILY_MEMBERS = 10; // Maximum family members per user

  constructor(
    @InjectRepository(FamilyMember)
    private readonly familyMemberRepository: Repository<FamilyMember>,
  ) {}

  /**
   * Create a new family member for a user
   */
  async create(
    userId: string,
    createDto: CreateFamilyMemberDto,
  ): Promise<FamilyMember> {
    // Check if user has reached max family members
    const count = await this.familyMemberRepository.count({
      where: { userId, isActive: true },
    });

    if (count >= this.MAX_FAMILY_MEMBERS) {
      throw new BadRequestException(
        `Maximum ${this.MAX_FAMILY_MEMBERS} family members allowed per user`,
      );
    }

    // Generate hashed ID for privacy
    const familyMemberId = this.generateHashedId(userId, createDto);

    const familyMember = this.familyMemberRepository.create({
      userId,
      familyMemberId,
      ...createDto,
    });

    const saved = await this.familyMemberRepository.save(familyMember);
    this.logger.log(
      `Family member created: ${saved.id} for user ${userId} (${createDto.relationship})`,
    );

    return saved;
  }

  /**
   * Get all family members for a user
   */
  async findAll(userId: string, includeInactive = false): Promise<FamilyMember[]> {
    const where: any = { userId };
    if (!includeInactive) {
      where.isActive = true;
    }

    return this.familyMemberRepository.find({
      where,
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Get a single family member by ID
   */
  async findOne(userId: string, id: string): Promise<FamilyMember> {
    const familyMember = await this.familyMemberRepository.findOne({
      where: { id, userId },
    });

    if (!familyMember) {
      throw new NotFoundException(`Family member with ID ${id} not found`);
    }

    return familyMember;
  }

  /**
   * Update a family member
   */
  async update(
    userId: string,
    id: string,
    updateDto: UpdateFamilyMemberDto,
  ): Promise<FamilyMember> {
    const familyMember = await this.findOne(userId, id);

    Object.assign(familyMember, updateDto);

    const updated = await this.familyMemberRepository.save(familyMember);
    this.logger.log(`Family member updated: ${id} for user ${userId}`);

    return updated;
  }

  /**
   * Soft delete a family member (set isActive to false)
   */
  async remove(userId: string, id: string): Promise<void> {
    const familyMember = await this.findOne(userId, id);
    familyMember.isActive = false;
    await this.familyMemberRepository.save(familyMember);

    this.logger.log(`Family member deactivated: ${id} for user ${userId}`);
  }

  /**
   * Hard delete a family member (permanent deletion)
   */
  async delete(userId: string, id: string): Promise<void> {
    const familyMember = await this.findOne(userId, id);
    await this.familyMemberRepository.remove(familyMember);

    this.logger.log(`Family member permanently deleted: ${id} for user ${userId}`);
  }

  /**
   * Get family members with IoT sensors enabled
   */
  async findWithIotSensors(userId: string): Promise<FamilyMember[]> {
    return this.familyMemberRepository.find({
      where: {
        userId,
        hasIotSensors: true,
        isActive: true,
      },
    });
  }

  /**
   * Get family members with notifications enabled
   */
  async findWithNotificationsEnabled(userId: string): Promise<FamilyMember[]> {
    return this.familyMemberRepository.find({
      where: {
        userId,
        notificationsEnabled: true,
        isActive: true,
      },
    });
  }

  /**
   * Generate a privacy-first hashed ID for family member
   * Uses user ID, timestamp, and relationship for uniqueness
   */
  private generateHashedId(
    userId: string,
    createDto: CreateFamilyMemberDto,
  ): string {
    const timestamp = Date.now();
    const data = `${userId}-${createDto.relationship}-${timestamp}`;
    const hash = createHash('sha256').update(data).digest('hex');
    return `fm_${hash.substring(0, 16)}`;
  }
}
