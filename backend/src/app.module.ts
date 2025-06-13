/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { ProjectsService } from './projects/projects.service';
import { ProjectsController } from './projects/projects.controller';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { PermissionModule } from './permissions/permission.module';

@Module({
  imports: [PermissionModule],
  controllers: [
    AppController,
    UsersController,
    ProjectsController,
    AuthController,
    UsersController,
  ],
  providers: [
    AppService,
    UsersService,
    ProjectsService,
    AuthService,
    UsersService,
  ],
})
export class AppModule {}
