/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Post } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('test-assignment-email')
  async testAssignmentEmail(@Body() body: { email: string; name: string }) {
    return this.mailerService.sendAssignmentEmail({
      email: body.email,
      name: body.name,
      projectName: 'Test Project',
      projectDescription: 'This is a test project assignment email',
      dueDate: '2025-07-01',
    });
  }

  @Post('test-completion-email')
  async testCompletionEmail(@Body() body: { email: string; name: string }) {
    return this.mailerService.sendCompletionEmail({
      email: body.email,
      name: body.name,
      projectName: 'Test Project',
      projectDescription: 'This is a test project completion email',
      completedDate: new Date().toLocaleDateString(),
      assignedUser: 'Test User',
      projectId: '12345',
    });
  }

  @Post('send-direct')
  async sendDirect(@Body() emailData: any) {
    return this.mailerService.sendEmail({
      recipient: emailData.email,
      subject: emailData.subject,
      templateName: emailData.templateName,
      templateData: emailData.templateData,
      content: emailData.content,
    });
  }
}
