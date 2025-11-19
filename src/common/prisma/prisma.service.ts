import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as colors from 'colors';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private getFormattedTimestamp(): string {
    const now = new Date();
    // Convert to Dhaka time (UTC+6)
    const dhakaTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    return dhakaTime.toISOString().replace('T', ' ').slice(0, 19);
  }

  async onModuleInit() {
    await this.$connect();
    const timestamp = this.getFormattedTimestamp();
    console.log(`[${timestamp}] [DATABASE]: ${colors.green('✅ Prisma connected to database!')}`);
  }

  async onModuleDestroy() {
    await this.$disconnect();
    const timestamp = this.getFormattedTimestamp();
    console.log(`[${timestamp}] [DATABASE]: ${colors.red('❌ Prisma disconnected from database!')}`);
  }
}

