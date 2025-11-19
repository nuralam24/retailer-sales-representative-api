import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        const redisClient = createClient({
          socket: {
            host: configService.get('REDIS_HOST') || 'localhost',
            port: configService.get('REDIS_PORT') || 6379,
          },
        });

        redisClient.on('error', (err) => console.error('Redis Client Error', err));

        await redisClient.connect();

        return {
          store: {
            get: async (key: string) => {
              const value = await redisClient.get(key);
              return value ? JSON.parse(value) : null;
            },
            set: async (key: string, value: any, ttl?: number) => {
              const serialized = JSON.stringify(value);
              if (ttl) {
                await redisClient.setEx(key, ttl, serialized);
              } else {
                await redisClient.set(key, serialized);
              }
            },
            del: async (key: string) => {
              await redisClient.del(key);
            },
            reset: async () => {
              await redisClient.flushDb();
            },
            keys: async (pattern: string) => {
              return await redisClient.keys(pattern);
            },
          },
          ttl: configService.get('REDIS_TTL') || 3600,
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class CacheConfigModule {}
