/* eslint-disable prettier/prettier */
export enum Permission {
  MANAGE_PROJECTS = 'MANAGE_PROJECTS',
  ASSIGN_PROJECT = 'ASSIGN_PROJECT',
  VIEW_ALL_PROJECTS = 'VIEW_ALL_PROJECTS',
  MANAGE_USERS = 'MANAGE_USERS',
  VIEW_EMAIL_LOGS = 'VIEW_EMAIL_LOGS',
  CREATE_PROJECT = 'CREATE_PROJECT',
  VIEW_ALL_USERS = "VIEW_ALL_USERS",
  VIEW_OWN_PROJECTS = 'view_own_projects',
  UPDATE_PROJECT_STATUS = 'update_project_status',
  UPDATE_OWN_PROJECT = 'update_own_project',  // Add this if you want a specific permission
}
