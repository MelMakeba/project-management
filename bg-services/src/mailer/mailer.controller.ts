import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  MailerService,
  ProjectAssignmentContext,
  ProjectCompletionContext,
} from './mailer.service';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('test-assignment-email')
  async testAssignmentEmail(@Body() body: { email: string; name: string }) {
    // Create context object for assignment email
    const context: ProjectAssignmentContext = {
      name: body.name,
      projectName: 'Test Project',
      projectDescription: 'This is a test project assignment email',
      dueDate: '2025-07-01',
    };

    return this.mailerService.sendAssignmentEmail(body.email, context);
  }

  @Post('test-completion-email')
  async testCompletionEmail(@Body() body: { email: string; name: string }) {
    // Create context object for completion email
    const context: ProjectCompletionContext = {
      name: body.name,
      projectName: 'Test Project',
      projectDescription: 'This is a test project completion email',
      completedDate: new Date().toLocaleDateString(),
      assignedUser: 'Test User',
    };

    return this.mailerService.sendCompletionEmail(body.email, context);
  }

  @Post('send-direct')
  async sendDirect(
    @Body()
    emailData: {
      email: string;
      subject: string;
      template?: string;
      context?: Record<string, any>;
      html?: string;
      text?: string;
    },
  ) {
    return this.mailerService.sendEmail({
      to: emailData.email,
      subject: emailData.subject,
      template: emailData.template,
      context: emailData.context,
      html: emailData.html,
      text: emailData.text,
    });
  }

  @Get('health')
  async healthCheck() {
    return this.mailerService.healthCheck();
  }
}
