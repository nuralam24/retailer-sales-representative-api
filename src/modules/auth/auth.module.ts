import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SalesRepsModule } from '../sales_rep_retailers/sales-reps.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { env } from '../../common/config/env.config';

@Module({
  imports: [
    SalesRepsModule,
    PassportModule,
    JwtModule.register({
      secret: env.JWT_SECRET || '@!$#@!**@#$%^&*()_+',
      signOptions: { expiresIn: env.JWT_EXPIRES_IN as any },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
