import {
  Controller, Get, Patch, Delete, Post, Body,
  Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('charts')
  getChartData(@Query('days') days = 14) {
    return this.adminService.getChartData(+days);
  }

  @Get('users')
  getUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(+page, +limit, search);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateUser(id, body);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('audits')
  getAllAudits(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getAllAudits(+page, +limit);
  }

  @Get('payments/chart')
  getRevenueChart(@Query('months') months = 8) {
    return this.adminService.getMonthlyRevenueChart(+months);
  }

  @Get('logs')
  getLogs(@Query('page') page = 1, @Query('limit') limit = 50) {
    return this.adminService.getActivityLogs(+page, +limit);
  }

  @Get('configs')
  getConfigs() {
    return this.adminService.getConfigs();
  }

  @Patch('configs/:key')
  updateConfig(@Param('key') key: string, @Body() body: { value: any }) {
    return this.adminService.updateConfig(key, body.value);
  }

  @Post('plans')
  createPlan(@Body() body: any) {
    return this.adminService.createPlan(body);
  }

  @Patch('plans/:id')
  updatePlan(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updatePlan(id, body);
  }
}
