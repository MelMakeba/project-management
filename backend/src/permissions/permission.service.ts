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
      Permission.CREATE_PROJECT,
    ],
    USER: [Permission.VIEW_OWN_PROJECTS, Permission.UPDATE_PROJECT_STATUS],
  };

  getRolePermissions(role: Role): Permission[] {
    return this.rolePermissions[role] || [];
  }

  hasPermission(role: Role, permission: Permission): boolean {
    return this.getRolePermissions(role).includes(permission);
  }

  canPerformAction(role: Role, action: Action, resource: Resource): boolean {
    const permissions = this.getRolePermissions(role);

    // Project-related permissions
    if (resource === Resource.PROJECT) {
      switch (action) {
        case Action.CREATE:
          return permissions.includes(Permission.CREATE_PROJECT);
        case Action.READ:
          return (
            permissions.includes(Permission.VIEW_ALL_PROJECTS) ||
            permissions.includes(Permission.VIEW_OWN_PROJECTS)
          );
        case Action.UPDATE:
          return (
            permissions.includes(Permission.MANAGE_PROJECTS) ||
            permissions.includes(Permission.UPDATE_PROJECT_STATUS) // This covers status updates only
          );
        case Action.DELETE:
          return permissions.includes(Permission.MANAGE_PROJECTS);
        case Action.ASSIGN:
          return permissions.includes(Permission.ASSIGN_PROJECT);
        default:
          return false;
      }
    }

    // User-related permissions
    if (resource === Resource.USER) {
      switch (action) {
        case Action.CREATE:
          // Any user can register themselves, handled separately in auth controller
          return false;
        case Action.READ:
          return permissions.includes(Permission.VIEW_ALL_USERS);
        case Action.UPDATE:
        case Action.DELETE:
          return permissions.includes(Permission.MANAGE_USERS);
        default:
          return false;
      }
    }

    // Email log permissions
    if (resource === Resource.EMAIL_LOG) {
      return permissions.includes(Permission.VIEW_EMAIL_LOGS);
    }

    return false;
  }
}
