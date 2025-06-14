/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { ProjectsService } from './projects/projects.service';
import { ProjectsController } from './projects/projects.controller';
import { PermissionModule } from './permissions/permission.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PermissionModule,
    AuthModule,
  ],
  controllers: [
    AppController,
    UsersController,
    ProjectsController,
  ],
  providers: [
    AppService,
    UsersService,
    ProjectsService,
  ],
})
export class AppModule {}
