import { env } from './common/config/env.config';

import {AppModule} from './app.module';
import {NestFactory} from '@nestjs/core';
import {ValidationPipe, VersioningType} from '@nestjs/common';
import {SwaggerModule} from '@nestjs/swagger';
import {config} from './common/config/swagger.config';
import {CORS_CONFIG} from './common/config/cors.config';
import {NestExpressApplication} from '@nestjs/platform-express';
import {CustomLogger} from './common/logger/customLogger';
import { UnauthorizedExceptionFilter } from './common/logger/unauthorizedException';
import { BadRequestExceptionFilter } from './common/logger/badRequestException';
import { NotFoundExceptionFilter } from './common/logger/notFoundException';
import { ForbiddenExceptionFilter } from './common/logger/forbiddenException';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import * as express from 'express';
import helmet from 'helmet';
import { PrismaService } from './common/prisma/prisma.service';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: new CustomLogger()
    });
    const APP_ROUTE_PREFIX = 'api';

    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: [`'self'`],
                styleSrc: [`'self'`, `'unsafe-inline'`],
                imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
                scriptSrc: [`'self'`, `'https:'`, `'unsafe-inline'`],
            },
        },
        crossOriginEmbedderPolicy: false, // Required for Swagger UI
    }));

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
        forbidNonWhitelisted: false,
    }));
    app.enableCors(CORS_CONFIG);
    app.setGlobalPrefix(APP_ROUTE_PREFIX);
    app.set('trust proxy', true);
    app.enableVersioning({defaultVersion: '1', type: VersioningType.URI,});
    app.useGlobalFilters(
        new NotFoundExceptionFilter(),
        new BadRequestExceptionFilter(),
        new UnauthorizedExceptionFilter(),
        new ForbiddenExceptionFilter(),
    );

    // Security: Audit logging for write operations
    app.useGlobalInterceptors(new AuditLogInterceptor());

    SwaggerModule.setup(`${APP_ROUTE_PREFIX}/docs`, app, SwaggerModule.createDocument(app, config), {
        swaggerOptions: {
            cacheControl: true,
            docExpansion: 'list', // list -> auto collapse is on, none -> auto collapse is off
            persistAuthorization: true, // token is not auto logout, when link is refresh
        }
    });

    if (!env.PORT) {
        throw new Error('PORT is not defined in the environment variables');
    }
    
    await app.listen(env.PORT);
    
    // Convert to Dhaka time (UTC+6)
    const now = new Date();
    const dhakaTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const timestamp = dhakaTime.toISOString().replace('T', ' ').slice(0, 19);
    console.log(`[${timestamp}] [SERVER]: 📚 Swagger docs available at: http://localhost:${env.PORT}/${APP_ROUTE_PREFIX}/docs`);
}

bootstrap();
