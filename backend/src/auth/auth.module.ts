/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from './guards/jwt/jwt.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [JwtModule],
  controllers: [AuthController],
  providers: [AuthService, JwtService,JwtStrategy],
})
export class AuthModule {}
