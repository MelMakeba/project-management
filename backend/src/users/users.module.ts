import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ApiResponseService } from '../shared/api-response.service';
import { PrismaClient } from 'generated/prisma';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ApiResponseService, PrismaClient],
  exports: [UsersService],
})
export class UsersModule {}
