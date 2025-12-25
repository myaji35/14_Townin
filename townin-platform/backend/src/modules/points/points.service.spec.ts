import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PointsService } from './points.service';
import { UserPoints } from './entities/user-points.entity';
import { PointTransaction, PointTransactionType, PointEarnReason, PointSpendReason } from './entities/point-transaction.entity';

describe('PointsService', () => {
  let service: PointsService;
  let userPointsRepository: Repository<UserPoints>;
  let pointTransactionRepository: Repository<PointTransaction>;
  let dataSource: DataSource;
  let eventEmitter: EventEmitter2;

  const mockUserId = 'test-user-id';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointsService,
        {
          provide: getRepositoryToken(UserPoints),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PointTransaction),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PointsService>(PointsService);
    userPointsRepository = module.get<Repository<UserPoints>>(
      getRepositoryToken(UserPoints),
    );
    pointTransactionRepository = module.get<Repository<PointTransaction>>(
      getRepositoryToken(PointTransaction),
    );
    dataSource = module.get<DataSource>(DataSource);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('earnPoints', () => {
    it('should earn points successfully for new user', async () => {
      const earnDto = {
        reason: PointEarnReason.PROFILE_COMPLETE,
        amount: 50,
        referenceType: 'profile',
        referenceId: 'profile-id',
      };

      const mockUserPoints = {
        id: 'points-id',
        userId: mockUserId,
        totalPoints: 0,
        lifetimeEarned: 0,
        lifetimeSpent: 0,
      };

      const mockTransaction = {
        id: 'transaction-id',
        userId: mockUserId,
        type: PointTransactionType.EARNED,
        amount: 50,
        balanceAfter: 50,
        reason: earnDto.reason,
      };

      // Mock transaction callback
      (dataSource.transaction as jest.Mock).mockImplementation(
        async (callback) => {
          const manager = {
            findOne: jest.fn().mockResolvedValue(null),
            create: jest.fn((entity, data) => {
              if (entity === UserPoints) return { ...mockUserPoints, ...data };
              if (entity === PointTransaction) return mockTransaction;
            }),
            save: jest.fn((entity, data) => {
              if (data.totalPoints !== undefined) {
                return { ...mockUserPoints, ...data };
              }
              return mockTransaction;
            }),
          };
          return callback(manager);
        },
      );

      const result = await service.earnPoints(mockUserId, earnDto);

      expect(result).toBeDefined();
      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('should add points to existing user balance', async () => {
      const earnDto = {
        reason: PointEarnReason.FLYER_VIEW,
        amount: 1,
      };

      const existingUserPoints = {
        id: 'points-id',
        userId: mockUserId,
        totalPoints: 100,
        lifetimeEarned: 150,
        lifetimeSpent: 50,
      };

      (dataSource.transaction as jest.Mock).mockImplementation(
        async (callback) => {
          const manager = {
            findOne: jest
              .fn()
              .mockResolvedValue({ ...existingUserPoints }),
            create: jest.fn().mockReturnValue({
              userId: mockUserId,
              type: PointTransactionType.EARNED,
              amount: 1,
              balanceAfter: 101,
            }),
            save: jest.fn((entity, data) => {
              if (data.totalPoints) {
                return { ...existingUserPoints, totalPoints: 101, lifetimeEarned: 151 };
              }
              return data;
            }),
          };
          return callback(manager);
        },
      );

      const result = await service.earnPoints(mockUserId, earnDto);

      expect(result).toBeDefined();
    });
  });

  describe('spendPoints', () => {
    it('should spend points successfully', async () => {
      const spendDto = {
        reason: PointSpendReason.FLYER_TARGET_AREA,
        amount: 30,
        referenceType: 'flyer',
        referenceId: 'flyer-id',
      };

      const existingUserPoints = {
        id: 'points-id',
        userId: mockUserId,
        totalPoints: 100,
        lifetimeEarned: 150,
        lifetimeSpent: 50,
      };

      (dataSource.transaction as jest.Mock).mockImplementation(
        async (callback) => {
          const manager = {
            findOne: jest.fn().mockResolvedValue({ ...existingUserPoints }),
            create: jest.fn().mockReturnValue({
              userId: mockUserId,
              type: PointTransactionType.SPENT,
              amount: 30,
              balanceAfter: 70,
            }),
            save: jest.fn((entity, data) => {
              if (data.totalPoints !== undefined) {
                return { ...existingUserPoints, totalPoints: 70, lifetimeSpent: 80 };
              }
              return data;
            }),
          };
          return callback(manager);
        },
      );

      const result = await service.spendPoints(mockUserId, spendDto);

      expect(result).toBeDefined();
    });

    it('should throw error if insufficient balance', async () => {
      const spendDto = {
        reason: PointSpendReason.FLYER_TARGET_AREA,
        amount: 150,
      };

      const existingUserPoints = {
        id: 'points-id',
        userId: mockUserId,
        totalPoints: 100,
        lifetimeEarned: 150,
        lifetimeSpent: 50,
      };

      (dataSource.transaction as jest.Mock).mockImplementation(
        async (callback) => {
          const manager = {
            findOne: jest.fn().mockResolvedValue({ ...existingUserPoints }),
          };
          return callback(manager);
        },
      );

      await expect(
        service.spendPoints(mockUserId, spendDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getBalance', () => {
    it('should return user points balance', async () => {
      const mockBalance = {
        userId: mockUserId,
        totalPoints: 100,
        lifetimeEarned: 150,
        lifetimeSpent: 50,
      };

      jest.spyOn(userPointsRepository, 'findOne').mockResolvedValue(mockBalance as any);

      const result = await service.getBalance(mockUserId);

      expect(result).toEqual(mockBalance);
      expect(userPointsRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userPointsRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getBalance(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTransactions', () => {
    it('should return paginated transaction history', async () => {
      const mockTransactions = [
        {
          id: 'tx-1',
          userId: mockUserId,
          type: PointTransactionType.EARNED,
          amount: 50,
          createdAt: new Date(),
        },
        {
          id: 'tx-2',
          userId: mockUserId,
          type: PointTransactionType.SPENT,
          amount: 20,
          createdAt: new Date(),
        },
      ];

      jest
        .spyOn(pointTransactionRepository, 'find')
        .mockResolvedValue(mockTransactions as any);
      jest.spyOn(pointTransactionRepository, 'count').mockResolvedValue(2);

      const result = await service.getTransactions(mockUserId, 1, 10);

      expect(result.data).toEqual(mockTransactions);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });
  });
});
