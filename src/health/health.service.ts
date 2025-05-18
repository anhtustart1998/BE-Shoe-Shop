import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private prisma: PrismaService) {}

  async checkHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        app: 'up',
        database: await this.pingDatabase(),
      },
    };
  }

  async pingDatabase(): Promise<'up' | 'down'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'up';
    } catch (error) {
      this.logger.error('Database ping failed', error);
      return 'down';
    }
  }

  //   Run every 5 minutes
  @Cron('0 */5 * * * *')
  async keepAlive() {
    this.logger.log('Running keep-alive check...');
    const health = await this.checkHealth();

    if (health.services.database === 'down') {
      this.logger.error('Database is down during keep-alive check');
    } else {
      this.logger.log('Keep-alive check completed successfully');
    }

    return health;
  }

  //  Run every day at midnight to clean up expired sessions ot temporary data
  @Cron('0 0 0 * * *')
  async dailyMaintenance() {
    this.logger.log('Running daily maintenance...');

    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const deletedCarts = await this.prisma.carts.updateMany({
        where: {
          status: 'active',
          updatedAt: {
            lt: oneWeekAgo,
          },
          isDeleted: false,
        },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      this.logger.log(
        `Maintenance completed: Cleaned up ${deletedCarts.count} inactive carts`,
      );
    } catch (error) {
      this.logger.error('Error during daily maintenance', error);
    }
  }
}
