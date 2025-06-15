import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';

@Controller('mailer')
export class MailerController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  @Post('test-assignment-email')
  async testAssignmentEmail(@Body() body: { email: string; name: string }) {
    const { email, name } = body;

    // Create a test email log entry
    const emailLog = await this.prisma.emailLog.create({
      data: {
        recipient: email,
        subject: 'Test: Project Assignment',
        templateName: 'project-assignment', // Will be mapped to 'assignment email.ejs'
        templateData: {
          name: name,
          projectName: 'Test Project',
          projectDescription: 'This is a test project assignment',
          dueDate: new Date().toLocaleDateString(),
          loginUrl: 'http://localhost:3000/login',
        },
        content: 'Test project assignment email',
      },
    });

    return {
      success: true,
      message: 'Test email queued',
      emailId: emailLog.id,
    };
  }

  @Post('test-completion-email')
  async testCompletionEmail(@Body() body: { email: string; name: string }) {
    const { email, name } = body;

    const emailLog = await this.prisma.emailLog.create({
      data: {
        recipient: email,
        subject: 'Test: Project Completion',
        templateName: 'project-completion', // Will be mapped to 'completion_project.ejs'
        templateData: {
          name: name,
          projectName: 'Test Project',
          projectDescription: 'This is a test project that was completed',
          completedDate: new Date().toLocaleDateString(),
          assignedUser: 'Test User',
          viewProjectUrl: 'http://localhost:3000/projects/123',
        },
        content: 'Test project completion email',
      },
    });

    return {
      success: true,
      message: 'Test email queued',
      emailId: emailLog.id,
    };
  }

  @Post('send-direct')
  async sendDirectEmail(
    @Body()
    body: {
      email: string;
      name: string;
      subject: string;
      templateName: string;
    },
  ) {
    const { email, name, subject, templateName } = body;

    let templateData = {};

    // Set template data based on template name
    if (templateName === 'project-assignment') {
      templateData = {
        name,
        projectName: 'Direct Test Project',
        projectDescription: 'This is a direct test email',
        dueDate: new Date().toLocaleDateString(),
        loginUrl: 'http://localhost:3000/login',
      };
    } else if (templateName === 'project-completion') {
      templateData = {
        name,
        projectName: 'Direct Test Project',
        projectDescription: 'This is a direct test email',
        completedDate: new Date().toLocaleDateString(),
        assignedUser: name,
        viewProjectUrl: 'http://localhost:3000/projects/123',
      };
    }

    return this.mailerService.sendEmailDirectly({
      recipient: email,
      subject,
      templateName,
      templateData,
      content: null,
    });
  }
}
