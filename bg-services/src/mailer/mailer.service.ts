/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
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
    this.templatesDir = path.join(process.cwd(), 'src', 'templates');
    this.logger.log(`Templates directory: ${this.templatesDir}`);
  }

  private async initializeTransporter() {
    // Check if we're in production or have SMTP settings
    if (
      this.configService.get('NODE_ENV') === 'production' &&
      this.configService.get('SMTP_HOST')
    ) {
      // Use real SMTP settings
      this.transporter = nodemailer.createTransport({
        host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
        port: parseInt(this.configService.get('SMTP_PORT', '587')),
        secure: this.configService.get('SMTP_SECURE', 'false') === 'true',
        auth: {
          user: this.configService.get('SMTP_USER'),
          pass: this.configService.get('SMTP_PASS'),
        },
        tls: {
          rejectUnauthorized: false, // For Gmail
        },
      });
      this.logger.log('Production email transporter initialized');
    } else {
      /* eslint-disable @typescript-eslint/no-unsafe-member-access */
      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      import { Injectable, Logger } from '@nestjs/common';
      import * as nodemailer from 'nodemailer';
      import { ConfigService } from '@nestjs/config';
      import path from 'path';
      import * as fs from 'fs';
      import ejs from 'ejs';

      export interface EmailOptions {
        to: string;
        subject: string;
        template?: string;
        context?: Record<string, any>;
        html?: string;
        text?: string;
      }

      export interface WelcomeEmailContext {
        name: string;
        email: string;
        hotelName?: string;
        supportEmail?: string;
        loginUrl?: string;
      }
      @Injectable()
      export class MailerService {
        private readonly logger = new Logger(MailerService.name);
        private transporter: nodemailer.Transporter;
        private templatesPath: string;

        constructor(private configService: ConfigService) {
          this.templatesPath = path.join(__dirname, '../../../templates/email');
          this.initializeTransporter();
        }
        private initializeTransporter() {
          const smtpConfig = {
            host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
            port: parseInt(this.configService.get<string>('SMTP_PORT', '587')),
            secure:
              this.configService.get<string>('SMTP_SECURE', 'false') === 'true',
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

        async sendEmail(options: EmailOptions): Promise<void> {
          try {
            let html = options.html;

            if (options.template && options.context) {
              html = await this.renderTemplate(
                options.template,
                options.context,
              );
            }

            const mailOptions = {
              from: this.configService.get<string>(
                'SMTP_FROM',
                'earljoe06@gmail.com',
              ),
              to: options.to,
              subject: options.subject,
              html,
              text: options.text,
            };

            const result = await this.transporter.sendMail(mailOptions);
            this.logger.log(
              `Email sent succesfully to ${options.to}: ${result.messageId}`,
            );
          } catch (error) {
            this.logger.error(
              ` Failed to sennd email to ${options.to}: ${error.message}`,
            );
          }
        }

        async sendWelcomeEmail(
          to: string,
          context: WelcomeEmailContext,
        ): Promise<void> {
          const emailOptions: EmailOptions = {
            to,
            subject: `Welcome to ${context.hotelName || 'Our hotel management System'}`,
            template: 'welcome',
            context: {
              ...context,
              loginUrl:
                context.loginUrl ||
                `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000/api/login')}`,
              supportEmail:
                context.supportEmail ||
                `${this.configService.get<string>('SUPPORT_EMAIL', 'hotelq@gmail.com')}`,
              hotelName: context.hotelName || 'Our Hotel',
              currentYear: new Date().getFullYear(),
            },
          };
          await this.sendEmail(emailOptions);
        }

        private async renderTemplate(
          templateName: string,
          context: Record<string, any>,
        ): Promise<string> {
          try {
            /* eslint-disable @typescript-eslint/no-unsafe-member-access */
            /* eslint-disable @typescript-eslint/no-unsafe-assignment */
            import { Injectable, Logger } from '@nestjs/common';
            import * as nodemailer from 'nodemailer';
            import { ConfigService } from '@nestjs/config';
            import path from 'path';
            import * as fs from 'fs';
            import ejs from 'ejs';

            export interface EmailOptions {
              to: string;
              subject: string;
              template?: string;
              context?: Record<string, any>;
              html?: string;
              text?: string;
            }

            export interface WelcomeEmailContext {
              name: string;
              email: string;
              hotelName?: string;
              supportEmail?: string;
              loginUrl?: string;
            }
            @Injectable()
            export class MailerService {
              private readonly logger = new Logger(MailerService.name);
              private transporter: nodemailer.Transporter;
              private templatesPath: string;

              constructor(private configService: ConfigService) {
                this.templatesPath = path.join(
                  __dirname,
                  '../../../templates/email',
                );
                this.initializeTransporter();
              }
              private initializeTransporter() {
                const smtpConfig = {
                  host: this.configService.get<string>(
                    'SMTP_HOST',
                    'smtp.gmail.com',
                  ),
                  port: parseInt(
                    this.configService.get<string>('SMTP_PORT', '587'),
                  ),
                  secure:
                    this.configService.get<string>('SMTP_SECURE', 'false') ===
                    'true',
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

              async sendEmail(options: EmailOptions): Promise<void> {
                try {
                  let html = options.html;

                  if (options.template && options.context) {
                    html = await this.renderTemplate(
                      options.template,
                      options.context,
                    );
                  }

                  const mailOptions = {
                    from: this.configService.get<string>(
                      'SMTP_FROM',
                      'earljoe06@gmail.com',
                    ),
                    to: options.to,
                    subject: options.subject,
                    html,
                    text: options.text,
                  };

                  const result = await this.transporter.sendMail(mailOptions);
                  this.logger.log(
                    `Email sent succesfully to ${options.to}: ${result.messageId}`,
                  );
                } catch (error) {
                  this.logger.error(
                    ` Failed to sennd email to ${options.to}: ${error.message}`,
                  );
                }
              }

              async sendWelcomeEmail(
                to: string,
                context: WelcomeEmailContext,
              ): Promise<void> {
                const emailOptions: EmailOptions = {
                  to,
                  subject: `Welcome to ${context.hotelName || 'Our hotel management System'}`,
                  template: 'welcome',
                  context: {
                    ...context,
                    loginUrl:
                      context.loginUrl ||
                      `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000/api/login')}`,
                    supportEmail:
                      context.supportEmail ||
                      `${this.configService.get<string>('SUPPORT_EMAIL', 'hotelq@gmail.com')}`,
                    hotelName: context.hotelName || 'Our Hotel',
                    currentYear: new Date().getFullYear(),
                  },
                };
                await this.sendEmail(emailOptions);
              }

              private async renderTemplate(
                templateName: string,
                context: Record<string, any>,
              ): Promise<string> {
                try {
                  const templatePath = path.join(
                    this.templatesPath,
                    `${templateName}.ejs`,
                  );

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

                  const html = await ejs.renderFile(
                    templatePath,
                    context,
                    templateOptions,
                  );

                  return html;
                } catch (error) {
                  this.logger.error(
                    `Template rendering failed for ${templateName}: ${error.message}`,
                  );
                  throw error;
                }
              }
            }

            const templatePath = path.join(
              this.templatesPath,
              `${templateName}.ejs`,
            );

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

            const html = await ejs.renderFile(
              templatePath,
              context,
              templateOptions,
            );

            return html;
          } catch (error) {
            this.logger.error(
              `Template rendering failed for ${templateName}: ${error.message}`,
            );
            throw error;
          }
        }
      }

      // Use Ethereal for development/testing
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
    }
  }

  @Cron('*/30 * * * * *')
  async processEmails() {
    this.logger.debug('Processing pending emails');

    const pendingEmails = await this.prisma.emailLog.findMany({
      where: {
        status: 'PENDING',
        attemptCount: { lt: 3 },
      },
      take: 5,
    });

    for (const email of pendingEmails) {
      try {
        let emailContent = email.content;

        if (email.templateName) {
          emailContent = await this.renderTemplate(
            email.templateName,
            (email.templateData as Record<string, any>) || {},
          );
        }

        await this.sendEmail(email.recipient, email.subject, emailContent);

        await this.prisma.emailLog.update({
          where: { id: email.id },
          data: { status: 'SENT' },
        });

        this.logger.log(`Email sent: ${email.id}`);
      } catch (error) {
        this.logger.error(`Failed to send email ${email.id}: ${error.message}`);

        await this.prisma.emailLog.update({
          where: { id: email.id },
          data: {
            status: email.attemptCount >= 2 ? 'FAILED' : 'PENDING',
            attemptCount: { increment: 1 },
          },
        });
      }
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

      try {
        await fs.promises.access(templatePath);
      } catch {
        throw new Error(`Template not found: ${filename} at ${templatePath}`);
      }

      const templateOptions = {
        filename: templatePath,
        cache: process.env.NODE_ENV === 'production',
        compileDebug: process.env.NODE_ENV !== 'production',
      };

      return await ejs.renderFile(templatePath, data, templateOptions);
    } catch (error) {
      this.logger.error(`Error rendering template: ${error.message}`);
      throw error;
    }
  }

  private async sendEmail(to: string, subject: string, html: string) {
    try {
      const result = await this.transporter.sendMail({
        from:
          this.configService.get('SMTP_FROM') ||
          'project-management@example.com',
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent: ${result.messageId}`);
      return result;
    } catch (error) {
      this.logger.error(`Send error details: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  async sendEmailDirectly(email: string, subject: string, templateName: string, templateData: {}, options: EmailOptions) {
    try {
      const { recipient, subject, templateName, templateData, content } =
        options;

      // Render template or use provided content
      let html = content;
      if (templateName && templateData) {
        html = await this.renderTemplate(templateName, templateData);
      }

      if (!html) {
        throw new Error(
          'Email content is required (either content or templateName + templateData)',
        );
      }

      // Send email immediately
      const result = await this.transporter.sendMail({
        from:
          this.configService.get('SMTP_FROM') ||
          'project-management@example.com',
        to: recipient,
        subject,
        html,
      });

      // Log success
      this.logger.log(`Direct email sent to ${recipient}: ${result.messageId}`);

      // Log to database
      const emailLog = await this.prisma.emailLog.create({
        data: {
          recipient,
          subject,
          templateName,
          templateData,
          content: html,
          status: 'SENT',
        },
      });

      return {
        success: true,
        messageId: result.messageId,
        emailId: emailLog.id,
        previewUrl: this.etherealUrl, // For test environments
      };
    } catch (error) {
      this.logger.error(`Direct email error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Specialized email methods
  async sendProjectAssignmentEmail(
    to: string,
    userName: string,
    projectName: string,
    projectDescription: string,
    dueDate: string,
  ) {
    return this.sendEmailDirectly({
      recipient: to,
      subject: `New Project Assignment: ${projectName}`,
      templateName: 'project-assignment',
      templateData: {
        name: userName,
        projectName,
        projectDescription,
        dueDate,
        loginUrl:
          this.configService.get('FRONTEND_URL', 'http://localhost:3000') +
          '/projects',
      },
    });
  }

  async sendProjectCompletionEmail(
    to: string,
    adminName: string,
    projectName: string,
    projectDescription: string,
    completedDate: string,
    assignedUser: string,
    projectId: string,
  ) {
    return this.sendEmailDirectly({
      recipient: to,
      subject: `Project Completion: ${projectName}`,
      templateName: 'project-completion',
      templateData: {
        name: adminName,
        projectName,
        projectDescription,
        completedDate,
        assignedUser,
        viewProjectUrl:
          this.configService.get('FRONTEND_URL', 'http://localhost:3000') +
          `/projects/${projectId}`,
      },
    });
  }
}
