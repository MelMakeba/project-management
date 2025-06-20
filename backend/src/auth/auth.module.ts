/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from './guards/jwt/jwt.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ApiResponseService } from 'src/shared/api-response.service';


@Module({
  imports: [JwtModule],
  controllers: [AuthController],
  providers: [AuthService, JwtService,JwtStrategy, ApiResponseService],
})
export class AuthModule {}
