import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ApiResponseService } from '../shared/api-response.service';
import { PrismaClient } from 'generated/prisma';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, ApiResponseService, PrismaClient],
  exports: [ProjectsService],
})
export class ProjectsModule {}
