import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import Redis from 'ioredis';

const SETUP_FLAG = path.join(process.cwd(), '.setup-complete');

@Injectable()
export class SetupService {
  constructor(private prisma: PrismaService) {}

  isComplete(): boolean {
    return fs.existsSync(SETUP_FLAG);
  }

  getStatus() {
    return { complete: this.isComplete() };
  }

  async checkDatabase(): Promise<{ ok: boolean; message: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const userCount = await this.prisma.user.count();
      return {
        ok: true,
        message: `Database connected. ${userCount} user(s) found.`,
      };
    } catch (err: any) {
      return { ok: false, message: err.message || 'Database connection failed' };
    }
  }

  async checkRedis(
    host: string,
    port: number,
    password?: string,
  ): Promise<{ ok: boolean; message: string }> {
    const client = new Redis({
      host,
      port,
      password: password || undefined,
      connectTimeout: 5000,
      lazyConnect: true,
    });

    try {
      await client.connect();
      await client.ping();
      client.disconnect();
      return { ok: true, message: `Redis connected at ${host}:${port}` };
    } catch (err: any) {
      client.disconnect();
      return { ok: false, message: err.message || 'Redis connection failed' };
    }
  }

  async completeSetup(dto: {
    adminName: string;
    adminEmail: string;
    adminPassword: string;
  }): Promise<{ ok: boolean; message: string }> {
    if (this.isComplete()) {
      throw new ForbiddenException('Setup already completed');
    }

    if (dto.adminPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    // Check if admin already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.adminEmail },
    });

    if (existing) {
      // If user exists, upgrade to ADMIN
      await this.prisma.user.update({
        where: { email: dto.adminEmail },
        data: { role: 'ADMIN', status: 'ACTIVE', emailVerified: true },
      });
    } else {
      const passwordHash = await bcrypt.hash(dto.adminPassword, 12);
      await this.prisma.user.create({
        data: {
          name: dto.adminName,
          email: dto.adminEmail,
          passwordHash,
          role: 'ADMIN',
          status: 'ACTIVE',
          emailVerified: true,
          locale: 'en',
        },
      });
    }

    // Write the setup-complete flag file
    fs.writeFileSync(SETUP_FLAG, new Date().toISOString(), 'utf8');

    return { ok: true, message: 'Setup completed successfully' };
  }
}
