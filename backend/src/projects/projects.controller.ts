/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './../interfaces/project.interface';
import { Permission } from 'src/permissions/permission.enum';
import { RequirePermissions } from 'src/auth/decorator/permission.decorator';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiResponse } from 'src/interfaces/apiResponse';
import { JwtAuthGuard } from 'src/auth/guards/jwt/jwtAuth.guard';
import { CreateProjectDto } from 'src/dto/create.project.dto';
import { UpdateProjectDto } from 'src/dto/update.project.dto';
import { Status } from 'generated/prisma';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.CREATE_PROJECT)
  async createProject(@Body() data: CreateProjectDto): Promise<ApiResponse<Project>> {
    try {
      const result = await this.projectsService.createProject(data);
      return {
        success: result.success,
        data: result.data,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error creating project',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.VIEW_ALL_PROJECTS)
  async getAllProjects(): Promise<ApiResponse<Project[]>> {
    try {
      const result = await this.projectsService.getAllProjects();
      return {
        success: result.success,
        data: result.data,
        message: `Retrieved ${result.data?.length ?? 0} projects successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving projects',
      };
    }
  }

  @Get('status/completed')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.VIEW_ALL_PROJECTS)
  async getCompletedProjects(): Promise<ApiResponse<Project[]>> {
    try {
      const result = await this.projectsService.viewCompletedProjects();
      return {
        success: result.success,
        data: result.data,
        message: `${result.data?.length ?? 0} completed projects retrieved successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving completed projects',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('status/pending')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.VIEW_ALL_PROJECTS)
  async getPendingProjects(): Promise<ApiResponse<Project[]>> {
    try {
      const result = await this.projectsService.viewPendingProjects();
      return {
        success: result.success,
        data: result.data,
        message: `Retrieved ${result.data?.length ?? 0} pending projects successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving pending projects',
      };
    }
  }

  @Get('status/in_progress')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.VIEW_ALL_PROJECTS)
  async getProjects(): Promise<ApiResponse<Project[]>> {
    try {
      const result = await this.projectsService.viewInProgressProjects();
      return {
        success: result.success,
        data: result.data,
        message: `Retrieved ${result.data?.length ?? 0} in_progress projects successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving in_progress projects',
      };
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.VIEW_ALL_PROJECTS)
  async getProjectById(@Param('id') id: string): Promise<ApiResponse<Project>> {
    try {
      const result = await this.projectsService.getProjectById(id);
      return {
        success: result.success,
        data: result.data,
        message: result.message || `Retrieved project with id ${id} successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving project',
      };
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.MANAGE_PROJECTS)
  async updateProject(
    @Param('id') id: string,
    @Body() data: UpdateProjectDto,
  ): Promise<ApiResponse<Project>> {
    try {
      const result = await this.projectsService.updateProject(id, data);
      return {
        success: result.success,
        data: result.data,
        message: result.message || `Updated project with id ${id} successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error updating project',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.VIEW_OWN_PROJECTS)
  async viewOwnProjects(@Param('userId') userId: string): Promise<ApiResponse<Project[]>> {
    try {
      const result = await this.projectsService.viewOwnProject(userId);
      return {
        success: result.success,
        data: result.data ? [result.data] : [],
        message: result.message || `Projects for user ${userId} retrieved successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'You have no assigned projects',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.MANAGE_PROJECTS)
  async deleteProject(@Param('id') id: string): Promise<ApiResponse<null>> {
    try {
      const result = await this.projectsService.deleteProject(id);
      return {
        success: result.success,
        message: result.message || `Deleted project with id ${id} successfully`,
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error deleting project',
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null,
      };
    }
  }

  @Patch(':projectId/assign/:userId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.ASSIGN_PROJECT)
  async assignProjectToUser(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ): Promise<ApiResponse<Project>> {
    try {
      const result = await this.projectsService.assignProjectToUser(projectId, userId);
      return {
        success: result.success,
        data: result.data,
        message: result.message || `Project ${projectId} assigned to user ${userId}`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error assigning project to user',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Patch(':projectId/status')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.UPDATE_PROJECT_STATUS)
  async updateProjectStatus(
    @Param('projectId') projectId: string,
    @Body() body: { status: Status },
  ): Promise<ApiResponse<Project>> {
    try {
      const result = await this.projectsService.updateProjectStatus(projectId, body.status);
      return {
        success: result.success,
        data: result.data,
        message: result.message || `Project ${projectId} status updated`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error updating project status',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
