/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Project } from './../interfaces/project.interface';
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
import { Permission } from 'src/permissions/permission.enum';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { RequirePermissions } from 'src/auth/decorator/permission.decorator';
import { Action } from 'src/permissions/action.enum';
import { ApiResponse } from 'src/interfaces/apiResponse';
import { CreateProjectDto } from 'src/dto/create.project.dto';
import { UpdateProjectDto } from 'src/dto/update.project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * @Post()
   * @param data 
   * @returns 
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionGuard)
  @RequirePermissions(Action.CREATE)
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
      return {
        success: false,
        message: 'Error creating project',
      };
    }
  }

  /**
   * @Get()
   * @param query
   * @ return project[]
   */
  @Get()
  @UseGuards(PermissionGuard)
  @RequirePermissions(Action.READ)
  @RequirePermissions(Permission.VIEW_ALL_PROJECTS)
  async getAllProjects(): Promise<ApiResponse<Project[]>>{
    try{
      const projects = await this.projectsService.getAllProjects();
      return {
        success: true,
        data: projects,
        message: `Retrieved ${projects.length} projects successfully`,
      }
    } catch(error){
      return {
        success: false,
        message: 'Error retrieving projects',
      }
    }
  }

  /**
   * @ Get() project by id
   * @ param id string
   * @ return project
   */
  @Get(':id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Action.READ)
  @RequirePermissions(Permission.VIEW_ALL_PROJECTS)
  async getProjectById(@Param('id') id: string): Promise<ApiResponse<Project>>{
    try{
      const project = await this.projectsService.getProjectById(id);
      return{
        success: true,
        data: project,
        message: `Retrieved project with id ${id} successfully`,
      }
    } catch(error){
      return {
        success: false,
        message: 'Error retrieving project',
      }
    }
  }

  /**
   * @Update () project
   * @param id string
   * @ param project
   */
  @Patch(':id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Action.UPDATE)
  @RequirePermissions(Permission.MANAGE_PROJECTS)
  async updateProject(@Param('id') id: string, @Body() data: UpdateProjectDto): Promise<ApiResponse<Project>>{
    try{
      const project = await this.projectsService.updateProject(id, data);
      if(!project){
        return {
          success: false,
          message: `Project with id ${id} not found`,
        }
      }
      return{
        success: true,
        data: project,
        message: `Updated project with id ${id} successfully`,
      }
    } catch(error){
      return {
        success: false,
        message: 'Error updating project',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }

  }

  // delete project
  /**
   * @ Delete () project
   * @ param id string
   * @ return null
   */
  @Delete(':id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Action.DELETE)
  @RequirePermissions(Permission.MANAGE_PROJECTS)
  async deleteProject(@Param('id') id: string): Promise<ApiResponse<null>>{
    try{
      await this.projectsService.deleteProject(id);
      return {
        success: true,
        message: `Deleted project with id ${id} successfully`,
      }
    } catch(error){
      return {
        success: false,
        message: 'Error deleting project',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}
