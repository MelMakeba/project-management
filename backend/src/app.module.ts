import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { PermissionModule } from './permissions/permission.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PermissionModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    MailerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
