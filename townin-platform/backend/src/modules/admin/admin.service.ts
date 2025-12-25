import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Flyer } from '../flyers/flyer.entity';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Flyer)
    private flyersRepository: Repository<Flyer>,
  ) {}

  async getSystemStats() {
    const totalUsers = await this.usersRepository.count();
    const totalFlyers = await this.flyersRepository.count();

    const usersByRole = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    const activeFlyers = await this.flyersRepository.count({
      where: { isActive: true },
    });

    return {
      totalUsers,
      totalFlyers,
      activeFlyers,
      usersByRole: usersByRole.map(item => ({
        role: item.role,
        count: parseInt(item.count),
      })),
    };
  }

  async getAllUsers() {
    const users = await this.usersRepository.find({
      select: ['id', 'email', 'role', 'isActive', 'createdAt', 'lastLoginAt'],
      order: { createdAt: 'DESC' },
    });

    return users;
  }

  async getRecentActivities() {
    // Get recent users (last 10)
    const recentUsers = await this.usersRepository.find({
      select: ['email', 'role', 'createdAt'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // Get recent flyers (last 10)
    const recentFlyers = await this.flyersRepository.find({
      select: ['id', 'title', 'createdAt'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      recentUsers: recentUsers.map(u => ({
        type: 'user_created',
        message: `새로운 ${this.getRoleLabel(u.role)} 계정 생성: ${u.email}`,
        timestamp: u.createdAt,
      })),
      recentFlyers: recentFlyers.map(f => ({
        type: 'flyer_created',
        message: `새로운 전단지 등록: ${f.title}`,
        timestamp: f.createdAt,
      })),
    };
  }

  async toggleUserActive(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    user.isActive = !user.isActive;
    await this.usersRepository.save(user);
    return { success: true, user };
  }

  async updateUserRole(id: string, role: UserRole) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    user.role = role;
    await this.usersRepository.save(user);
    return { success: true, user };
  }

  async deleteUser(id: string) {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('User not found');
    }
    return { success: true, message: 'User deleted successfully' };
  }

  async getAllFlyers() {
    const flyers = await this.flyersRepository.find({
      relations: ['merchant'],
      order: { createdAt: 'DESC' },
    });

    return flyers.map(flyer => ({
      id: flyer.id,
      title: flyer.title,
      description: flyer.description,
      merchantName: flyer.merchant?.businessName,
      isActive: flyer.isActive,
      createdAt: flyer.createdAt,
      expiresAt: flyer.expiresAt,
    }));
  }

  async toggleFlyerActive(id: string) {
    const flyer = await this.flyersRepository.findOne({ where: { id } });
    if (!flyer) {
      throw new Error('Flyer not found');
    }
    flyer.isActive = !flyer.isActive;
    await this.flyersRepository.save(flyer);
    return { success: true, flyer };
  }

  async deleteFlyer(id: string) {
    const result = await this.flyersRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Flyer not found');
    }
    return { success: true, message: 'Flyer deleted successfully' };
  }

  private getRoleLabel(role: string): string {
    const labels = {
      user: '일반 사용자',
      merchant: '상인',
      security_guard: '보안요원',
      municipality: '공무원',
      super_admin: '관리자',
    };
    return labels[role] || role;
  }
}
