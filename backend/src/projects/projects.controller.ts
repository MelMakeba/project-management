/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
  Res,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './../interfaces/project.interface';
import { Permission } from 'src/permissions/permission.enum';
import { RequirePermissions } from 'src/auth/decorator/permission.decorator';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiResponse } from '../shared/interfaces/api-response.interfaces';
import { JwtAuthGuard } from 'src/auth/guards/jwt/jwtAuth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CreateProjectDto } from 'src/dto/create.project.dto';
import { UpdateProjectDto } from 'src/dto/update.project.dto';
import { Status } from 'generated/prisma';
import { Response } from 'express';

@ApiTags('projects')
@ApiBearerAuth('JWT-auth')
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
        success: true,
        data: result as unknown as Project,
        message: 'Project created successfully',
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
        success: true,
        data: result as unknown as Project[],
        message: `Retrieved ${result.length} projects successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving projects',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('status/completed')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.VIEW_ALL_PROJECTS)
  async getCompletedProjects(): Promise<ApiResponse<Project[]>> {
    try {
      const projects = await this.projectsService.viewCompletedProjects();
      console.log('✅ Completed projects from DB:', projects);
      return {
        success: true,
        data: projects as unknown as Project[],
        message: `${projects.length} completed projects retrieved successfully`,
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
        success: true,
        data: result as unknown as Project[],
        message: `Retrieved ${result.length} pending projects successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving pending projects',
        error: error instanceof Error ? error.message : 'Unknown error',
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
        success: true,
        data: result as unknown as Project[],
        message: `Retrieved ${result.length} in_progress projects successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving in_progress projects',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.VIEW_ALL_PROJECTS)
  async getProjectById(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const project = await this.projectsService.getProjectById(id);
      response.status(HttpStatus.OK).json({
        success: true,
        data: project,
        message: `Retrieved project with id ${id} successfully`,
      });
    } catch (error) {
      // Return 404 for "not found" errors
      if (error.message.includes('not found')) {
        response.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Project not found',
          error: error.message,
        });
      } else {
        // Return 500 for other errors
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Error retrieving project',
          error: error.message,
        });
      }
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
        success: true,
        data: result as unknown as Project,
        message: `Updated project with id ${id} successfully`,
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
  async viewOwnProjects(
    @Param('userId') userId: string,
  ): Promise<ApiResponse<Project[]>> {
    try {
      const projects = await this.projectsService.viewOwnProject(userId);
      return {
        success: true,
        data: projects as unknown as Project[],
        message: `Projects of user with id (${userId}) viewed successfully`,
      };
    } catch (error) {
      console.error('Error', error);
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
      await this.projectsService.deleteProject(id);
      return {
        success: true,
        message: `Deleted project with id ${id} successfully`,
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
      const result = await this.projectsService.assignProjectToUser(
        projectId,
        userId,
      );
      return  {
        success: true,
        data: result as unknown as Project,
        message: `Project ${projectId} assigned to user ${userId}`,
      };
    } catch (error) {
      return  {
        success: false,
        message: 'Error assigning project to user',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.MANAGE_PROJECTS)
  async updateProjectStatus(
    @Param('id') id: string,
    @Body() body: { status: Status },
  ): Promise<Project> {
    return this.projectsService.updateProjectStatus(id, body.status);
  }

  // User endpoint to mark their own project as completed
  @Patch('user/:id/complete')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.UPDATE_PROJECT_STATUS)
  async completeOwnProject(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<Project> {
    // Extract user ID from token
    const userId = req.user.sub;
    // Users can only set status to COMPLETED
    return this.projectsService.updateProjectStatus(id, 'COMPLETED', userId);
  }

  // Add this endpoint for users to update their own projects
  @Patch('user/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.VIEW_OWN_PROJECTS) // Using existing user permission
  async updateOwnProject(
    @Param('id') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req: any,
  ): Promise<Project> {
    // Extract user ID from the JWT token
    const userId = req.user.sub;
    return this.projectsService.updateOwnProject(
      projectId,
      userId,
      updateProjectDto,
    );
  }
}
