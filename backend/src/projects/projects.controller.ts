/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
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
  // @RequirePermissions(Action.CREATE)
  @RequirePermissions(Permission.CREATE_PROJECT)
  async createProject(
    @Body() data: CreateProjectDto,
  ): Promise<ApiResponse<Project>> {
    try {
      const project = await this.projectsService.createProject(data);
      return {
        success: true,
        data: project,
        message: 'Project created successfully',
      };
    } catch (error) {
      console.error('Create project error:', error);
      return {
        success: false,
        message: 'Error creating project',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  // @RequirePermissions(Action.READ)
  @RequirePermissions(Permission.VIEW_ALL_PROJECTS)
  async getAllProjects(): Promise<ApiResponse<Project[]>> {
    try {
      const projects = await this.projectsService.getAllProjects();
      return {
        success: true,
        data: projects,
        message: `Retrieved ${projects.length} projects successfully`,
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
    console.log('✅ /projects/completed endpoint hit');
    try {
      const projects = await this.projectsService.viewCompletedProjects(); 
      console.log('✅ Completed projects from DB:', projects);
      return {
        success: true,
        data: projects,
        message: `${projects.length} completed projects retrieved successfully`,
      };
    } catch (error) {
      console.log('Error retrieving completed projects:', error);
      return {
        success: false,
        message: 'Error retrieving completed projects',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * @Get() pending projects
   * @param id 
   * @returns 
   */
  @Get('status/pending')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.VIEW_ALL_PROJECTS)
  async getPendingProjects(): Promise<ApiResponse<Project[]>>{
    try {
      const projects = await this.projectsService.viewPendingProjects();
      return {
        success: true,
        data: projects,
        message: `Retrieved ${projects.length} pending projects successfully`,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving pending projects',
      }
    }
  }

  /**
   * @Get()
   * @param id 
   * @returns project[]
   */
  @Get('status/in_progress')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.VIEW_ALL_PROJECTS)
  async getProjects(): Promise<ApiResponse<Project[]>>{
    try {
      const projects = await this.projectsService.viewInProgressProjects();
      return {
        success: true,
        data: projects,
        message: `Retrieved ${projects.length} in_progress projects successfully`,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving in_progress projects',
      }
    }
  }

  // get ProjectById
  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  // @RequirePermissions(Action.READ)
  @RequirePermissions(Permission.VIEW_ALL_PROJECTS)
  async getProjectById(@Param('id') id: string): Promise<ApiResponse<Project>> {
    try {
      const project = await this.projectsService.getProjectById(id);
      return {
        success: true,
        data: project,
        message: `Retrieved project with id ${id} successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving project',
      };
    }
  }

  

  // edit or update project (User Role)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  // @RequirePermissions(Action.UPDATE)
  @RequirePermissions(Permission.MANAGE_PROJECTS)
  async updateProject(
    @Param('id') id: string,
    @Body() data: UpdateProjectDto,
  ): Promise<ApiResponse<Project>> {
    try {
      const project = await this.projectsService.updateProject(id, data);
      if (!project) {
        return {
          success: false,
          message: `Project with id ${id} not found`,
        };
      }
      return {
        success: true,
        data: project,
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


      /**
     * @Get() view own projects
     * @ params userId
     * @ return projects
     */
      @Get('user/:userId')
      @UseGuards(JwtAuthGuard, PermissionGuard)
      @RequirePermissions(Permission.VIEW_OWN_PROJECTS)
      async viewOwnProjects(@Param('userId') userId: string): Promise<ApiResponse<Project>>{
        try{
          const projects = await this.projectsService.viewOwnProject(userId);
          return{
            success: true,
            data: projects,
            message: `Projects of user with id (${userId}) viewed successfully`
          }
        } catch (error) {
          console.error('Error',error)
          return{
            success: false,
            message: 'You have no assigned projects',
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        }
      }
  
  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  // @RequirePermissions(Action.DELETE)
  @RequirePermissions(Permission.MANAGE_PROJECTS)
  async deleteProject(@Param('id') id: string): Promise<ApiResponse<null>> {
    try {
      await this.projectsService.deleteProject(id);
      return {
        success: true,
        message: `Deleted project with id ${id} successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error deleting project',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * @PATCH() assign ProjectToUser
   * @ param @Patch(':projectId/assign/:userId')
   * @ param @UseGuards(JwtAuthGuard, PermissionGuard)
   * @ return project 
   */
  @Patch(':projectId/assign/:userId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.ASSIGN_PROJECT)
  async assignProjectToUser(@Param('projectId') projectId: string, @Param('userId') userId: string): Promise<ApiResponse<Project>>{
    try {
      const project = await this.projectsService.assignProjectToUser(projectId, userId);
      return{
        success: true,
        data: project,
        message: `Project with id ${projectId} assigned to user with id ${userId} successfully`
      }
    } catch (error) {
      return{
        success: false,
        message: 'Error assigning project to user',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * @ PATCH() update Project status 
   * @ param userId and projectId
   * @ return project
   */
  @Patch(':projectId/status')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.UPDATE_PROJECT_STATUS)
  async updateProjectStatus(@Param('projectId') projectId: string, @Body() body: {status: Status}): Promise<ApiResponse<Project>>{
    try {
      const project = await this.projectsService.updateProjectStatus(projectId, body.status);
      return{
        success: true,
        data: project,
        message: `Project with id ${projectId} status updated successfully`
      }
      } catch (error) {
        return{
          success: false,
          message: 'Error updating project status',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }

    /**
     * get all completed projects where status is COMPLETED
     * @Get()
     * @ UseGuards(JwtAuthGuard, PermissionGuard)
     * @ RequirePermissions(Permission.GET_COMPLETED_PROJECTS)
     * @ return projects[]
     */
    
  }