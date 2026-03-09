import { PrismaClient, UserRole, UserStatus, PlanTier } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Plans ────────────────────────────────────────────
  const freePlan = await prisma.plan.upsert({
    where: { id: 'plan-free' },
    update: {},
    create: {
      id: 'plan-free',
      name: 'Free',
      tier: PlanTier.FREE,
      description: 'Basic auditing for individuals',
      priceMonthly: 0,
      priceYearly: 0,
      auditsPerDay: 10,
      historyDays: 7,
      maxDomains: 1,
      hasExport: false,
      hasComparisons: false,
      hasApi: false,
      hasWhiteLabel: false,
      features: ['10 audits/day', '7-day history', 'Basic reports'],
      sortOrder: 0,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { id: 'plan-pro' },
    update: {},
    create: {
      id: 'plan-pro',
      name: 'Pro',
      tier: PlanTier.PRO,
      description: 'For professionals and small teams',
      priceMonthly: 29,
      priceYearly: 290,
      auditsPerDay: 50,
      historyDays: 90,
      maxDomains: 10,
      hasExport: true,
      hasComparisons: true,
      hasApi: false,
      hasWhiteLabel: false,
      features: [
        '50 audits/day',
        '90-day history',
        'PDF & CSV export',
        'Domain comparisons',
        'Priority support',
      ],
      sortOrder: 1,
    },
  });

  const premiumPlan = await prisma.plan.upsert({
    where: { id: 'plan-premium' },
    update: {},
    create: {
      id: 'plan-premium',
      name: 'Premium',
      tier: PlanTier.PREMIUM,
      description: 'Unlimited access for agencies',
      priceMonthly: 79,
      priceYearly: 790,
      auditsPerDay: -1,
      historyDays: -1,
      maxDomains: -1,
      hasExport: true,
      hasComparisons: true,
      hasApi: true,
      hasWhiteLabel: true,
      features: [
        'Unlimited audits',
        'Unlimited history',
        'Full export suite',
        'API access',
        'White-label reports',
        'Dedicated support',
      ],
      sortOrder: 2,
    },
  });

  console.log(`✅ Plans created: ${freePlan.name}, ${proPlan.name}, ${premiumPlan.name}`);

  // ── Admin user ───────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dlmetrix.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Administrator',
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  console.log(`✅ Admin user: ${admin.email}`);

  // ── System config ────────────────────────────────────
  const configs = [
    { key: 'site_name',          value: 'DLMETRIX',            group: 'general', isPublic: true  },
    { key: 'site_url',           value: 'https://dlmetrix.com', group: 'general', isPublic: true  },
    { key: 'anonymous_limit',    value: 10,                    group: 'limits',  isPublic: false },
    { key: 'maintenance_mode',   value: false,                 group: 'general', isPublic: true  },
    { key: 'allow_registration', value: true,                  group: 'general', isPublic: true  },
    { key: 'paypal_mode',        value: 'sandbox',             group: 'payment', isPublic: false },
  ];

  for (const cfg of configs) {
    await prisma.systemConfig.upsert({
      where: { key: cfg.key },
      update: {},
      create: {
        key: cfg.key,
        value: cfg.value as any,
        group: cfg.group,
        isPublic: cfg.isPublic,
      },
    });
  }

  console.log(`✅ System configs seeded`);
  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
