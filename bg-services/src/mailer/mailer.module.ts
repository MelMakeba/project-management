import { Module } from '@nestjs/common';
import { MailerController } from './mailer.controller';
import { MailerService } from './mailer.service';
import { ApiResponseService } from '../shared/api-response.service';
import { PrismaClient } from '../../generated/prisma';

@Module({
  imports: [PrismaClient],
  controllers: [MailerController],
  providers: [MailerService, ApiResponseService],
  exports: [MailerService, ApiResponseService],
})
export class MailerModule {}
