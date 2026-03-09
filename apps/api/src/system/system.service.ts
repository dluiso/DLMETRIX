import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SystemService {
  constructor(private prisma: PrismaService) {}

  async getPublicConfigs() {
    const configs = await this.prisma.systemConfig.findMany({
      where: { isPublic: true },
    });
    return configs.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, any>);
  }

  async logActivity(data: {
    userId?: string;
    action: string;
    entity?: string;
    entityId?: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.activityLog.create({ data });
  }
}
