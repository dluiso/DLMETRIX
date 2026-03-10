import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ── Dashboard stats ───────────────────────────────────────────────────────

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, activeSubscriptions, totalAudits, todayAudits, failedAudits] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        this.prisma.audit.count(),
        this.prisma.audit.count({ where: { createdAt: { gte: today } } }),
        this.prisma.audit.count({ where: { status: 'FAILED' } }),
      ]);

    const revenueResult = await this.prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    });

    return {
      totalUsers,
      activeSubscriptions,
      totalAudits,
      todayAudits,
      failedAudits,
      totalRevenue: revenueResult._sum.amount || 0,
    };
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  async getUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? { OR: [{ email: { contains: search } }, { name: { contains: search } }] }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, name: true, role: true,
          status: true, createdAt: true, lastLoginAt: true,
          _count: { select: { audits: true } },
          subscription: { select: { plan: { select: { name: true } }, status: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateUser(id: string, data: { role?: string; status?: string }) {
    return this.prisma.user.update({
      where: { id },
      data: data as any,
      select: { id: true, email: true, role: true, status: true },
    });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  // ── Audits ────────────────────────────────────────────────────────────────

  async getAllAudits(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [audits, total] = await Promise.all([
      this.prisma.audit.findMany({
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, name: true } } },
      }),
      this.prisma.audit.count(),
    ]);
    return { data: audits, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // ── Plans ─────────────────────────────────────────────────────────────────

  async updatePlan(id: string, data: any) {
    return this.prisma.plan.update({ where: { id }, data });
  }

  async createPlan(data: any) {
    return this.prisma.plan.create({ data });
  }

  // ── Timeseries charts ─────────────────────────────────────────────────────

  async getChartData(days = 14) {
    const result: { date: string; audits: number; users: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const from = new Date();
      from.setDate(from.getDate() - i);
      from.setHours(0, 0, 0, 0);

      const to = new Date(from);
      to.setHours(23, 59, 59, 999);

      const [audits, users] = await Promise.all([
        this.prisma.audit.count({ where: { createdAt: { gte: from, lte: to } } }),
        this.prisma.user.count({ where: { createdAt: { gte: from, lte: to } } }),
      ]);

      result.push({
        date: from.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        audits,
        users,
      });
    }

    return result;
  }

  // ── Monthly revenue chart ─────────────────────────────────────────────────

  async getMonthlyRevenueChart(months = 8) {
    const result: { month: string; revenue: number }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const from = new Date();
      from.setDate(1);
      from.setMonth(from.getMonth() - i);
      from.setHours(0, 0, 0, 0);

      const to = new Date(from);
      to.setMonth(to.getMonth() + 1);
      to.setMilliseconds(-1);

      const agg = await this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED', createdAt: { gte: from, lte: to } },
      });

      result.push({
        month: from.toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        revenue: Number(agg._sum.amount || 0),
      });
    }

    return result;
  }

  // ── Activity logs ─────────────────────────────────────────────────────────

  async getActivityLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } },
      }),
      this.prisma.activityLog.count(),
    ]);
    return { data: logs, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // ── System config ─────────────────────────────────────────────────────────

  async getConfigs() {
    return this.prisma.systemConfig.findMany({ orderBy: { group: 'asc' } });
  }

  async updateConfig(key: string, value: any) {
    return this.prisma.systemConfig.update({
      where: { key },
      data: { value },
    });
  }
}
