/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { Permission } from './permission.enum';
import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { PermissionService } from '../permissions/permission.service';
import { JwtAuthGuard } from '../auth/guards/jwt/jwtAuth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermissions } from '../auth/decorator/permission.decorator';
import {
  CurrentUser,
  CurrentUserData,
} from '../auth/decorator/currentUser/currentUser.decorator';
import { Role } from 'generated/prisma';
import { Action } from '../permissions/action.enum';
import { Resource } from '../permissions/resource.enum';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('my-permissions')
  getMyPermissions(@CurrentUser() user: CurrentUserData) {
    const permissions = this.permissionService.getRolePermissions(
      user.role as Role,
    );
    return {
      role: user.role,
      permissions,
      permissionCount: permissions.length,
    };
  }

  @Get('role/:role')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Permission.MANAGE_USERS)
  getRolePermissions(@Param('role') role: Role) {
    const permissions = this.permissionService.getRolePermissions(role);
    return {
      role,
      permissions,
      permissionCount: permissions.length,
    };
  }

  @Get('check/:permission')
  checkPermission(
    @Param('permission') permission: Permission,
    @CurrentUser() user: CurrentUserData,
  ) {
    const hasPermission = this.permissionService.hasPermission(
      user.role as Role,
      permission,
    );
    return {
      permission,
      hasPermission,
      role: user.role,
    };
  }

  @Get('check-action')
  checkAction(
    @Query('action') action: Action,
    @Query('resource') resource: Resource,
    @CurrentUser() user: CurrentUserData,
  ) {
    const canPerform = this.permissionService.canPerformAction(
      user.role as Role,
      action,
      resource,
    );
    return {
      action,
      resource,
      canPerform,
      role: user.role,
    };
  }

  @Get('all-permissions')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Permission.MANAGE_USERS)
  getAllPermissions() {
    return {
      permissions: Object.values(Permission),
      resources: Object.values(Resource),
      actions: Object.values(Action),
    };
  }
}
