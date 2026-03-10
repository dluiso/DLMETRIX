import {
  Controller, Post, Get, Delete, Body, Param, Query,
  UseGuards, Req, Optional, Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuditsService } from './audits.service';
import { CreateAuditDto } from './dto/create-audit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Request } from 'express';

@ApiTags('audits')
@Controller('audits')
export class AuditsController {
  constructor(private auditsService: AuditsService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Create a new audit (public or authenticated)' })
  async createAudit(
    @Body() dto: CreateAuditDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress;

    return this.auditsService.createAudit(dto, user, ipAddress);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user audit history' })
  @ApiQuery({ name: 'page',      required: false })
  @ApiQuery({ name: 'limit',     required: false })
  @ApiQuery({ name: 'status',    required: false })
  @ApiQuery({ name: 'search',    required: false })
  @ApiQuery({ name: 'sortField', required: false })
  @ApiQuery({ name: 'sortDir',   required: false })
  getUserAudits(
    @CurrentUser() user: any,
    @Query('page')      page = 1,
    @Query('limit')     limit = 20,
    @Query('status')    status?: string,
    @Query('search')    search?: string,
    @Query('sortField') sortField = 'createdAt',
    @Query('sortDir')   sortDir: 'asc' | 'desc' = 'desc',
  ) {
    return this.auditsService.getUserAudits(user.id, +page, +limit, {
      status, search, sortField, sortDir,
    });
  }

  @Get('history/export')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export audit history as CSV' })
  async exportHistory(@CurrentUser() user: any, @Res() res: Response) {
    const csv = await this.auditsService.exportHistoryCsv(user.id);
    const filename = `dlmetrix-audits-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent public audits' })
  getRecentAudits(@Query('limit') limit = 10) {
    return this.auditsService.getRecentPublicAudits(+limit);
  }

  @Get('compare')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Compare two domains' })
  compareDomains(
    @CurrentUser() user: any,
    @Query('domain1') domain1: string,
    @Query('domain2') domain2: string,
  ) {
    return this.auditsService.compareDomains(domain1, domain2, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit result by ID' })
  getAudit(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.auditsService.getAudit(id, user?.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an audit' })
  deleteAudit(@Param('id') id: string, @CurrentUser() user: any) {
    return this.auditsService.deleteAudit(id, user.id);
  }
}
