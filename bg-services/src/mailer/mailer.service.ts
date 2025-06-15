/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs';
import * as path from 'path';
import * as fs from 'fs';

export interface EmailOptions {
  recipient: string;
  subject: string;
  templateName?: string;
  templateData?: Record<string, any>;
  content?: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;
  private templatesDir: string;
  private etherealUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.initializeTransporter();

    // Set up template directory
    if (process.env.NODE_ENV === 'production') {
      this.templatesDir = path.join(process.cwd(), 'dist', 'templates');
    } else {
      this.templatesDir = path.join(process.cwd(), 'src', 'templates');
    }

    this.logger.log(`Templates directory: ${this.templatesDir}`);
  }

  private async initializeTransporter() {
    try {
      // Always use Ethereal for testing to avoid SMTP issues
      const account = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });
      this.etherealUrl = account.web;
      this.logger.log(`Test email account created: ${this.etherealUrl}`);
      this.logger.log(`All sent emails can be viewed at: ${this.etherealUrl}`);
    } catch (error) {
      this.logger.error(
        `Failed to initialize email transporter: ${error.message}`,
      );
      throw error;
    }
  }

  // Send email directly - main method that handles all email sending
  async sendEmail(
    options: EmailOptions,
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const { recipient, subject, templateName, templateData, content } =
        options;

      // Get content either from template or direct content
      let html = content || '';
      if (templateName) {
        html = await this.renderTemplate(templateName, templateData || {});
      }

      if (!html) {
        throw new Error('Email content is required');
      }

      // Send email
      const result = await this.transporter.sendMail({
        from:
          this.configService.get('SMTP_FROM') ||
          'project-management@example.com',
        to: recipient,
        subject,
        html,
      });

      // Log success
      this.logger.log(`Email sent to ${recipient}: ${result.messageId}`);

      // For Ethereal emails, provide preview URL
      const previewUrl = nodemailer.getTestMessageUrl(result);
      if (previewUrl) {
        this.logger.log(`Preview URL: ${previewUrl}`);
      }

      // Log to database for record-keeping
      try {
        await this.prisma.emailLog.create({
          data: {
            recipient,
            subject,
            templateName,
            templateData,
            content: html,
            status: 'SENT',
            sentAt: new Date(),
          },
        });
      } catch (dbError) {
        this.logger.warn(`Failed to log email to database: ${dbError.message}`);
      }

      return {
        success: true,
        url: previewUrl || this.etherealUrl,
      };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);

      // Try to log failure to database
      try {
        await this.prisma.emailLog.create({
          data: {
            recipient: options.recipient,
            subject: options.subject,
            templateName: options.templateName,
            templateData: options.templateData,
            content: options.content || '',
            status: 'FAILED',
            attemptCount: 1,
          },
        });
      } catch (dbError) {
        this.logger.error(`Failed to log email failure: ${dbError.message}`);
      }

      return { success: false, error: error.message };
    }
  }

  private async renderTemplate(
    templateName: string,
    data: Record<string, any>,
  ): Promise<string> {
    try {
      let filename = templateName;

      const templateMap = {
        'project-assignment': 'assignment_email.ejs',
        'project-completion': 'completion_project.ejs',
      };

      if (templateMap[templateName]) {
        filename = templateMap[templateName];
      } else if (!filename.endsWith('.ejs')) {
        filename = `${filename}.ejs`;
      }

      const templatePath = path.join(this.templatesDir, filename);

      // Check if template exists
      try {
        await fs.promises.access(templatePath);
        this.logger.log(`Using template: ${templatePath}`);
      } catch {
        this.logger.error(`Template not found at ${templatePath}`);
        throw new Error(`Template not found: ${filename}`);
      }

      return await ejs.renderFile(templatePath, data);
    } catch (error) {
      this.logger.error(`Error rendering template: ${error.message}`);
      throw error;
    }
  }

  // Convenience methods for specific email types
  async sendAssignmentEmail(options: {
    email: string;
    name: string;
    projectName: string;
    projectDescription?: string;
    dueDate?: string;
  }): Promise<{ success: boolean; url?: string; error?: string }> {
    return this.sendEmail({
      recipient: options.email,
      subject: `New Project Assignment: ${options.projectName}`,
      templateName: 'project-assignment',
      templateData: {
        name: options.name,
        projectName: options.projectName,
        projectDescription: options.projectDescription || '',
        dueDate: options.dueDate || 'Not specified',
        loginUrl:
          this.configService.get('FRONTEND_URL', 'http://localhost:3000') +
          '/projects',
      },
    });
  }

  async sendCompletionEmail(options: {
    email: string;
    name: string;
    projectName: string;
    projectDescription?: string;
    completedDate?: string;
    assignedUser?: string;
    projectId?: string;
  }): Promise<{ success: boolean; url?: string; error?: string }> {
    return this.sendEmail({
      recipient: options.email,
      subject: `Project Completed: ${options.projectName}`,
      templateName: 'project-completion',
      templateData: {
        name: options.name,
        projectName: options.projectName,
        projectDescription: options.projectDescription || '',
        completedDate: options.completedDate || new Date().toLocaleDateString(),
        assignedUser: options.assignedUser || 'Team member',
        viewProjectUrl:
          this.configService.get('FRONTEND_URL', 'http://localhost:3000') +
          `/projects/${options.projectId || ''}`,
      },
    });
  }
}
