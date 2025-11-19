import {DocumentBuilder} from '@nestjs/swagger';

export const config = new DocumentBuilder()
    .setTitle('Retailer Sales Representative API')
    .setDescription('Retailer Sales Representative API Documentation')
    .setVersion('1.0.0')
    .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token (without "Bearer" prefix)',
        in: 'header',
        name: 'Authorization',
    })
    .build();
