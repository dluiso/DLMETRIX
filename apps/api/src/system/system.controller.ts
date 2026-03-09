import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SystemService } from './system.service';

@ApiTags('system')
@Controller('system')
export class SystemController {
  constructor(private systemService: SystemService) {}

  @Get('config')
  getPublicConfig() {
    return this.systemService.getPublicConfigs();
  }

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' };
  }
}
