import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('🔁 Keep-Alive')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check system health' })
  @ApiOkResponse({
    description: 'Health check completed successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
        services: {
          type: 'object',
          properties: {
            app: { type: 'string', example: 'up' },
            database: { type: 'string', example: 'up' },
          },
        },
      },
    },
  })
  checkHealth() {
    return this.healthService.checkHealth();
  }
}
