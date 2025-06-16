/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ApiResponseService } from '../shared/api-response.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from 'generated/prisma';
import { PermissionModule } from 'src/permissions/permission.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [PermissionModule, MailerModule, ConfigModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, ApiResponseService, PrismaClient],
  exports: [ProjectsService],
})
export class ProjectsModule {}
