import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { throttlerConfig } from './common/config/throttler.config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { RegionsModule } from './modules/regions/regions.module';
import { AreasModule } from './modules/areas/areas.module';
import { DistributorsModule } from './modules/distributors/distributors.module';
import { TerritoriesModule } from './modules/territories/territories.module';
import { RetailersModule } from './modules/retailers/retailers.module';
import { SalesRepsModule } from './modules/sales_rep_retailers/sales-reps.module';
import { AdminModule } from './modules/admin/admin.module';
import { CacheConfigModule } from './common/cache/cache.module';
import { AppsController } from './app.controller';
import { WinstonModule } from 'nest-winston';
import { WinstonConfig } from './common/config/winston.config';
import { ScheduleModule } from '@nestjs/schedule';
import { SqlInjectionDetectorMiddleware } from './common/middleware/sql-injection-detector.middleware';
import { XssProtectionMiddleware } from './common/middleware/xss-protection.middleware';
import { env } from './common/config/env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: env.NODE_ENV === 'dev', // Ignore .env in Docker
      expandVariables: true,
    }),
    // Rate Limiting - Prevent DDoS attacks
    ThrottlerModule.forRoot(throttlerConfig),
    ScheduleModule.forRoot(),
    WinstonModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transports: [
          new WinstonConfig().access(configService),
          new WinstonConfig().error(configService),
          new WinstonConfig().format(),
        ],
      }),
      inject: [ConfigService],
    }),
    // Prisma Database Module
    PrismaModule,
    CacheConfigModule,
    AuthModule,
    RegionsModule,
    AreasModule,
    DistributorsModule,
    TerritoriesModule,
    RetailersModule,
    SalesRepsModule,
    AdminModule,
  ],
  controllers: [AppsController],
  providers: [
    // Apply rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply security middlewares to all routes
    consumer
      .apply(SqlInjectionDetectorMiddleware, XssProtectionMiddleware)
      .forRoutes('*');
  }
}
