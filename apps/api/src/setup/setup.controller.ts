import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SetupService } from './setup.service';
import { SetupNotCompleteGuard } from './setup.guard';

@ApiTags('setup')
@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  /** Returns whether first-time setup has been completed. */
  @Get('status')
  getStatus() {
    return this.setupService.getStatus();
  }

  /** Tests the current database connection. Blocked after setup. */
  @UseGuards(SetupNotCompleteGuard)
  @Post('check-db')
  @HttpCode(200)
  checkDb() {
    return this.setupService.checkDatabase();
  }

  /** Tests a Redis connection. Blocked after setup. */
  @UseGuards(SetupNotCompleteGuard)
  @Post('check-redis')
  @HttpCode(200)
  checkRedis(
    @Body() body: { host: string; port: number; password?: string },
  ) {
    return this.setupService.checkRedis(
      body.host || 'localhost',
      body.port || 6379,
      body.password,
    );
  }

  /** Creates the first admin user and locks down the setup routes. */
  @UseGuards(SetupNotCompleteGuard)
  @Post('complete')
  @HttpCode(200)
  complete(
    @Body()
    body: {
      adminName: string;
      adminEmail: string;
      adminPassword: string;
    },
  ) {
    return this.setupService.completeSetup(body);
  }
}
