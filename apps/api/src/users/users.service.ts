import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, role: true,
        status: true, locale: true, avatarUrl: true,
        emailVerified: true, lastLoginAt: true,
        createdAt: true, updatedAt: true,
        subscription: { include: { plan: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; locale?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true, email: true, name: true, locale: true, avatarUrl: true,
      },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new ForbiddenException('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  async getAuditStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, todayCount, completed, failed, user] = await Promise.all([
      this.prisma.audit.count({ where: { userId } }),
      this.prisma.audit.count({ where: { userId, createdAt: { gte: today } } }),
      this.prisma.audit.count({ where: { userId, status: 'COMPLETED' } }),
      this.prisma.audit.count({ where: { userId, status: 'FAILED' } }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    ]);

    const role = user?.role ?? 'PUBLIC';
    const dailyLimit = role === 'PREMIUM' || role === 'ADMIN'
      ? -1
      : role === 'PRO' ? 50 : 10;

    return { total, todayCount, completed, failed, dailyLimit };
  }
}
