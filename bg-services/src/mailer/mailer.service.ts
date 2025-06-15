/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import * as ejs from 'ejs';
import { PrismaClient } from '../../generated/prisma';

export interface EmailOptions {
  to: string;
  subject: string;
  template?: string;
  context?: Record<string, any>;
  html?: string;
  text?: string;
}

export interface ProjectAssignmentContext {
  name: string;
  projectName: string;
  projectDescription?: string;
  dueDate?: string;
  loginUrl?: string;
}

export interface ProjectCompletionContext {
  name: string;
  projectName: string;
  projectDescription?: string;
  completedDate?: string;
  assignedUser?: string;
  viewProjectUrl?: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;
  private templatesPath: string;

  private prisma: PrismaClient;

  constructor(private configService: ConfigService) {
    this.prisma = new PrismaClient();
    // Using a more direct path approach like the template
    this.templatesPath = path.join(process.cwd(), 'src/templates');
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Simplified configuration following the template
    const smtpConfig = {
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: parseInt(this.configService.get<string>('SMTP_PORT', '587')),
      secure: this.configService.get<string>('SMTP_SECURE', 'false') === 'true',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      tls: {
        rejectUnauthorized: false, // Add this for Gmail
      },
    };

    this.transporter = nodemailer.createTransport(smtpConfig);
    this.logger.log('Email transporter initialized successfully');
  }

  // Simplified sendEmail method following the template
  async sendEmail(
    options: EmailOptions,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      let html = options.html;

      if (options.template && options.context) {
        html = await this.renderTemplate(options.template, options.context);
      }

      const mailOptions = {
        from: this.configService.get<string>(
          'SMTP_FROM',
          this.configService.get<string>('SMTP_USER', ''),
        ),
        to: options.to,
        subject: options.subject,
        html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email sent successfully to ${options.to}: ${result.messageId}`,
      );

      // Log to database but don't let failures stop the flow
      try {
        await this.prisma.emailLog.create({
          data: {
            recipient: options.to,
            subject: options.subject,
            templateName: options.template,
            templateData: options.context,
            content: html || options.text || '',
            status: 'SENT',
            sentAt: new Date(),
          },
        });
      } catch (dbError) {
        this.logger.warn(`Failed to log email to database: ${dbError.message}`);
      }

      return { success: true, messageId: result.messageId };
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${error.message}`,
      );

      // Try to log failure to database
      try {
        await this.prisma.emailLog.create({
          data: {
            recipient: options.to,
            subject: options.subject,
            templateName: options.template,
            templateData: options.context,
            content: options.html || options.text || '',
            status: 'FAILED',
            error: error.message, // Uncomment this line
          },
        });
      } catch (dbError) {
        this.logger.warn(`Failed to log email failure: ${dbError.message}`);
      }

      return { success: false, error: error.message };
    }
  }

  async sendAssignmentEmail(
    to: string,
    context: ProjectAssignmentContext,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const emailOptions: EmailOptions = {
      to,
      subject: `New Project Assignment: ${context.projectName}`,
      template: 'project-assignment',
      context: {
        ...context,
        loginUrl:
          context.loginUrl ||
          `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/projects`,
        dueDate: context.dueDate || 'Not specified',
      },
    };
    return this.sendEmail(emailOptions);
  }

  async sendCompletionEmail(
    to: string,
    context: ProjectCompletionContext,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const emailOptions: EmailOptions = {
      to,
      subject: `Project Completed: ${context.projectName}`,
      template: 'project-completion',
      context: {
        ...context,
        completedDate: context.completedDate || new Date().toLocaleDateString(),
        assignedUser: context.assignedUser || 'Team member',
        viewProjectUrl:
          context.viewProjectUrl ||
          `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/projects`,
      },
    };
    return this.sendEmail(emailOptions);
  }

  private async renderTemplate(
    templateName: string,
    context: Record<string, any>,
  ): Promise<string> {
    try {
      // Simplify the template mapping
      const templateMap = {
        'project-assignment': 'assignment_email.ejs',
        'project-completion': 'completion_project.ejs',
      };

      const filename = templateMap[templateName] || `${templateName}.ejs`;
      const templatePath = path.join(this.templatesPath, filename);

      if (!fs.existsSync(templatePath)) {
        throw new Error(
          `Template ${templateName} not found at ${templatePath}`,
        );
      }

      const templateOptions = {
        filename: templatePath,
        cache: process.env.NODE_ENV === 'production',
        compileDebug: process.env.NODE_ENV !== 'production',
      };

      const html = await ejs.renderFile(templatePath, context, templateOptions);
      return html;
    } catch (error) {
      this.logger.error(
        `Template rendering failed for ${templateName}: ${error.message}`,
      );
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; details?: string }> {
    try {
      // Simple connection check
      await this.transporter.verify();
      return { status: 'ok' };
    } catch (error) {
      return {
        status: 'error',
        details: error.message,
      };
    }
  }
}
