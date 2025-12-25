# Story CORE-003-07: Data Update Scheduler

**Epic**: CORE-003 Public Data Integration
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** platform
**I want to** automatically update public data
**So that** data stays fresh without manual intervention

## Acceptance Criteria

- [ ] NestJS Scheduler 설정
- [ ] Cron jobs 정의 (Daily, Hourly, Weekly, Monthly)
- [ ] Job 실행 로그
- [ ] 실패 시 재시도
- [ ] 관리자 알림 (실패 시)
- [ ] Job status monitoring dashboard

## Tasks

### Backend
- [ ] Install @nestjs/schedule
- [ ] Configure ScheduleModule
- [ ] Create PublicDataScheduler service
- [ ] Define all cron jobs
- [ ] Implement job logging service
- [ ] Implement retry logic
- [ ] Error notification service
- [ ] Job execution history tracking

### Monitoring
- [ ] Create JobExecutionLog entity
- [ ] Dashboard for job status
- [ ] Alert system integration

### Testing
- [ ] Unit tests: Cron expressions
- [ ] Integration test: Job execution
- [ ] Manual job trigger endpoint

## Technical Notes

```typescript
// Install @nestjs/schedule
npm install @nestjs/schedule

// App Module Configuration
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // ... other modules
  ],
})
export class AppModule {}

// JobExecutionLog Entity
@Entity('job_execution_logs')
export class JobExecutionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  jobName: string;

  @Column({ type: 'enum', enum: JobStatus })
  status: JobStatus;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'int', nullable: true })
  duration: number; // milliseconds

  @Column({ type: 'json', nullable: true })
  result: {
    created?: number;
    updated?: number;
    errors?: number;
  };

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @CreateDateColumn()
  createdAt: Date;
}

enum JobStatus {
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  RETRYING = 'retrying',
}

// Public Data Scheduler
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PublicDataScheduler {
  private readonly logger = new Logger(PublicDataScheduler.name);

  constructor(
    private readonly cctvService: CCTVService,
    private readonly parkingService: ParkingService,
    private readonly safetyInfraService: SafetyInfraService,
    private readonly disasterService: DisasterSafetyService,
    private readonly amenitiesService: PublicAmenitiesService,
    private readonly jobLogger: JobExecutionLoggerService,
  ) {}

  /**
   * Daily jobs at 3 AM
   */
  @Cron('0 3 * * *', {
    name: 'dailyDataUpdate',
    timeZone: 'Asia/Seoul',
  })
  async updateDailyData() {
    const jobName = 'dailyDataUpdate';
    const jobLog = await this.jobLogger.start(jobName);

    try {
      this.logger.log('[Daily] Starting data update...');

      const results = await Promise.allSettled([
        this.cctvService.fetchAndSaveCCTVData(),
        this.amenitiesService.fetchPublicWifi(),
        this.amenitiesService.fetchPublicToilets(),
        this.amenitiesService.fetchEVChargingStations(),
      ]);

      const totals = results.reduce((acc, result) => {
        if (result.status === 'fulfilled') {
          acc.created += result.value.created || 0;
          acc.updated += result.value.updated || 0;
        } else {
          acc.errors++;
        }
        return acc;
      }, { created: 0, updated: 0, errors: 0 });

      await this.jobLogger.success(jobLog.id, totals);
      this.logger.log('[Daily] Data update completed:', totals);

    } catch (error) {
      await this.jobLogger.fail(jobLog.id, error.message);
      this.logger.error('[Daily] Data update failed:', error);
      await this.sendAlert(jobName, error);
    }
  }

  /**
   * Hourly parking availability update (at :05)
   */
  @Cron('5 * * * *', {
    name: 'parkingAvailabilityUpdate',
    timeZone: 'Asia/Seoul',
  })
  async updateParkingAvailability() {
    const jobName = 'parkingAvailabilityUpdate';
    const jobLog = await this.jobLogger.start(jobName);

    try {
      this.logger.log('[Hourly] Updating parking availability...');

      const result = await this.parkingService.fetchParkingAvailability();

      await this.jobLogger.success(jobLog.id, { updated: result.updated });
      this.logger.log(`[Hourly] Updated ${result.updated} parking lots`);

    } catch (error) {
      await this.jobLogger.fail(jobLog.id, error.message);
      this.logger.error('[Hourly] Parking update failed:', error);
    }
  }

  /**
   * Weekly jobs on Sunday at 4 AM
   */
  @Cron('0 4 * * 0', {
    name: 'weeklyDataUpdate',
    timeZone: 'Asia/Seoul',
  })
  async updateWeeklyData() {
    const jobName = 'weeklyDataUpdate';
    const jobLog = await this.jobLogger.start(jobName);

    try {
      this.logger.log('[Weekly] Starting data update...');

      const results = await Promise.allSettled([
        this.safetyInfraService.fetchStreetLights(),
        this.safetyInfraService.fetchEmergencyBells(),
        this.parkingService.fetchParkingCameras(),
      ]);

      const totals = results.reduce((acc, result) => {
        if (result.status === 'fulfilled') {
          acc.created += result.value.created || 0;
          acc.updated += result.value.updated || 0;
        } else {
          acc.errors++;
        }
        return acc;
      }, { created: 0, updated: 0, errors: 0 });

      await this.jobLogger.success(jobLog.id, totals);
      this.logger.log('[Weekly] Data update completed:', totals);

    } catch (error) {
      await this.jobLogger.fail(jobLog.id, error.message);
      this.logger.error('[Weekly] Data update failed:', error);
      await this.sendAlert(jobName, error);
    }
  }

  /**
   * Monthly jobs on 1st day at 5 AM
   */
  @Cron('0 5 1 * *', {
    name: 'monthlyDataUpdate',
    timeZone: 'Asia/Seoul',
  })
  async updateMonthlyData() {
    const jobName = 'monthlyDataUpdate';
    const jobLog = await this.jobLogger.start(jobName);

    try {
      this.logger.log('[Monthly] Starting data update...');

      const results = await Promise.allSettled([
        this.disasterService.fetchFloodHistory(),
        this.disasterService.fetchSnowRemovalBoxes(),
        this.disasterService.fetchSteepSlopes(),
        this.disasterService.fetchEarthquakeShelters(),
      ]);

      const totals = results.reduce((acc, result) => {
        if (result.status === 'fulfilled') {
          acc.created += result.value.created || 0;
          acc.updated += result.value.updated || 0;
        } else {
          acc.errors++;
        }
        return acc;
      }, { created: 0, updated: 0, errors: 0 });

      await this.jobLogger.success(jobLog.id, totals);
      this.logger.log('[Monthly] Data update completed:', totals);

    } catch (error) {
      await this.jobLogger.fail(jobLog.id, error.message);
      this.logger.error('[Monthly] Data update failed:', error);
      await this.sendAlert(jobName, error);
    }
  }

  /**
   * Send alert for job failure
   */
  private async sendAlert(jobName: string, error: Error) {
    // TODO: Integrate with notification service (email, Slack, etc.)
    this.logger.error(`🚨 Job failed: ${jobName}`, error.stack);
  }
}

// Job Execution Logger Service
@Injectable()
export class JobExecutionLoggerService {
  constructor(
    @InjectRepository(JobExecutionLog)
    private readonly jobLogRepo: Repository<JobExecutionLog>,
  ) {}

  async start(jobName: string): Promise<JobExecutionLog> {
    return this.jobLogRepo.save({
      jobName,
      status: JobStatus.RUNNING,
      startTime: new Date(),
    });
  }

  async success(jobId: string, result: any): Promise<void> {
    const log = await this.jobLogRepo.findOne({ where: { id: jobId } });
    const endTime = new Date();

    await this.jobLogRepo.update(jobId, {
      status: JobStatus.SUCCESS,
      endTime,
      duration: endTime.getTime() - log.startTime.getTime(),
      result,
    });
  }

  async fail(jobId: string, errorMessage: string): Promise<void> {
    const log = await this.jobLogRepo.findOne({ where: { id: jobId } });
    const endTime = new Date();

    await this.jobLogRepo.update(jobId, {
      status: JobStatus.FAILED,
      endTime,
      duration: endTime.getTime() - log.startTime.getTime(),
      errorMessage,
      retryCount: log.retryCount + 1,
    });
  }

  async getJobHistory(jobName: string, limit: number = 10): Promise<JobExecutionLog[]> {
    return this.jobLogRepo.find({
      where: { jobName },
      order: { startTime: 'DESC' },
      take: limit,
    });
  }
}

// Manual Job Trigger Controller (for admin)
@Controller('admin/jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class JobsController {
  constructor(private readonly scheduler: PublicDataScheduler) {}

  @Post('trigger/:jobName')
  async triggerJob(@Param('jobName') jobName: string) {
    switch (jobName) {
      case 'dailyDataUpdate':
        await this.scheduler.updateDailyData();
        break;
      case 'weeklyDataUpdate':
        await this.scheduler.updateWeeklyData();
        break;
      case 'monthlyDataUpdate':
        await this.scheduler.updateMonthlyData();
        break;
      default:
        throw new BadRequestException('Invalid job name');
    }

    return { message: `Job ${jobName} triggered successfully` };
  }
}
```

## Dependencies

- **Depends on**: All data collection stories (CORE-003-02 ~ 06)
- **Blocks**: Automated data updates

## Definition of Done

- [ ] All acceptance criteria met
- [ ] @nestjs/schedule installed
- [ ] All cron jobs configured
- [ ] Job logging working
- [ ] Error handling and alerts working
- [ ] Manual trigger endpoint working
- [ ] Tests passing
- [ ] Code reviewed and merged
- [ ] Documentation updated

## Notes

- Cron timezone: Asia/Seoul
- Daily jobs at 3 AM (off-peak)
- Hourly parking updates at :05 (avoid :00 peak)
- Job execution history 저장 (monitoring)
- 실패 시 Alert 발송 (Slack, Email 등)
- SuperAdmin만 수동 실행 가능
- Promise.allSettled로 병렬 실행 (일부 실패해도 계속)
