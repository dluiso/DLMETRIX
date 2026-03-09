import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from 'bullmq';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuditsModule } from './audits/audits.module';
import { PlansModule } from './plans/plans.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { AuditEngineModule } from './audit-engine/audit-engine.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { SystemModule } from './system/system.module';
import { I18nModule } from './i18n/i18n.module';
import { SetupModule } from './setup/setup.module';
import configuration from './config/configuration';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get('THROTTLE_TTL', 60000),
            limit: config.get('THROTTLE_LIMIT', 100),
          },
        ],
      }),
    }),

    // Scheduler
    ScheduleModule.forRoot(),

    // Bull queue (Redis)
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get('REDIS_PORT', 6379),
          password: config.get('REDIS_PASSWORD'),
        },
      }),
    }),

    // Core modules
    PrismaModule,
    I18nModule,
    WebsocketsModule,
    SystemModule,
    SetupModule,

    // Feature modules
    AuthModule,
    UsersModule,
    AuditsModule,
    PlansModule,
    PaymentsModule,
    AdminModule,
    AuditEngineModule,
  ],
})
export class AppModule {}
