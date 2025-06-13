/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Permission } from '../permissions/permission.enum';
import { Role } from 'generated/prisma';
import { Action } from '../permissions/action.enum';
import { Resource } from '../permissions/resource.enum';

@Injectable()
export class PermissionService {
  private rolePermissions: Record<Role, Permission[]> = {
    ADMIN: [
      Permission.MANAGE_PROJECTS,
      Permission.ASSIGN_PROJECT,
      Permission.VIEW_ALL_PROJECTS,
      Permission.VIEW_ALL_USERS,
      Permission.MANAGE_USERS,
      Permission.VIEW_EMAIL_LOGS,
    ],
    USER: [],
  };

  getRolePermissions(role: Role): Permission[] {
    return this.rolePermissions[role] || [];
  }

  hasPermission(role: Role, permission: Permission): boolean {
    return this.getRolePermissions(role).includes(permission);
  }

  canPerformAction(role: Role, action: Action, resource: Resource): boolean {
    const permissions = this.getRolePermissions(role);
    if (resource === Resource.PROJECT && action === Action.ASSIGN) {
      return permissions.includes(Permission.ASSIGN_PROJECT);
    }
    if (resource === Resource.PROJECT && action === Action.READ) {
      return permissions.includes(Permission.VIEW_ALL_PROJECTS);
    }
    return false;
  }
}
