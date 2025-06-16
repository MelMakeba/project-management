/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { PrismaClient, Project, Status } from 'generated/prisma';
import { CreateProjectDto } from 'src/dto/create.project.dto';
import { UpdateProjectDto } from 'src/dto/update.project.dto';
import { ApiResponseService } from '../shared/api-response.service';
import { ApiResponse } from '../shared/interfaces/api-response.interfaces';

@Injectable()
export class ProjectsService {
  private prisma: PrismaClient;

  constructor(private readonly apiResponse: ApiResponseService) {
    this.prisma = new PrismaClient();
  }

  // create a project
  async createProject(
    data: CreateProjectDto,
  ): Promise<ApiResponse<Project | null>> {
    try {
      const newProject = await this.prisma.project.create({
        data: {
          ...data,
          endDate: new Date(data.endDate),
        },
      });
      return this.apiResponse.success(
        newProject,
        'Project created successfully',
      );
    } catch (error) {
      return this.apiResponse.error(
        `Error creating project: ${error.message}`,
        null,
      );
    }
  }

  // get all projects
  async getAllProjects(): Promise<ApiResponse<Project[]>> {
    try {
      const projects = await this.prisma.project.findMany({
        orderBy: { id: 'asc' },
      });
      return this.apiResponse.success(
        projects,
        'Projects retrieved successfully',
      );
    } catch (error) {
      // Add type assertion to tell TypeScript this is definitely a Project[] and not null
      return this.apiResponse.error(
        'Error fetching projects',
        [] as Project[],
      ) as ApiResponse<Project[]>;
    }
  }

  // get a project by id
  async getProjectById(id: string): Promise<ApiResponse<Project | null>> {
    try {
      const project = await this.prisma.project.findUnique({ where: { id } });
      if (!project) {
        return this.apiResponse.error('Project not found', null);
      }
      return this.apiResponse.success(
        project,
        'Project retrieved successfully',
      );
    } catch (error) {
      return this.apiResponse.error(
        `Error fetching project: ${error.message}`,
        null,
      );
    }
  }

  // update a project
  async updateProject(
    id: string,
    data: UpdateProjectDto,
  ): Promise<ApiResponse<Project | null>> {
    try {
      const project = await this.prisma.project.findUnique({ where: { id } });
      if (!project) {
        return this.apiResponse.error('Project not found', null);
      }

      const updatedProject = await this.prisma.project.update({
        where: { id },
        data,
      });

      return this.apiResponse.success(
        updatedProject,
        'Project updated successfully',
      );
    } catch (error) {
      return this.apiResponse.error(
        `Error updating project: ${error.message}`,
        null,
      );
    }
  }

  // update project status either to pending, in progress or completed
  async updateProjectStatus(
    id: string,
    status: Status,
  ): Promise<ApiResponse<Project | null>> {
    try {
      const project = await this.prisma.project.findUnique({ where: { id } });
      if (!project) {
        return this.apiResponse.error('Project not found', null);
      }

      if (!project.userId) {
        return this.apiResponse.error(
          'Cannot update status: Project is not assigned to any user',
          null,
        );
      }

      const updatedProject = await this.prisma.project.update({
        where: { id },
        data: {
          status: status,
          isCompleted: status === 'COMPLETED',
          completedAt: status === 'COMPLETED' ? new Date() : null,
        },
      });

      return this.apiResponse.success(
        updatedProject,
        `Project status updated to ${status}`,
      );
    } catch (error) {
      console.error('Error occurred while updating project', error);
      return this.apiResponse.error(
        `Error updating project status: ${error.message}`,
        null,
      );
    }
  }

  // delete a project
  async deleteProject(id: string): Promise<ApiResponse<null>> {
    try {
      const project = await this.prisma.project.findUnique({ where: { id } });
      if (!project) {
        return this.apiResponse.error('Project not found');
      }

      await this.prisma.project.delete({ where: { id } });
      return this.apiResponse.success(null, 'Project deleted successfully');
    } catch (error) {
      return this.apiResponse.error(`Error deleting project: ${error.message}`);
    }
  }

  // assign project to user
  async assignProjectToUser(
    projectId: string,
    userId: string,
  ): Promise<ApiResponse<Project | null>> {
    try {
      // check project exists
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        return this.apiResponse.error(
          `Project with id ${projectId} not found`,
          null,
        );
      }

      // check user exists
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return this.apiResponse.error(`User with id ${userId} not found`, null);
      }

      // check if project is already assigned to any user
      if (project.userId) {
        return this.apiResponse.error(
          'Project is already assigned to a user',
          null,
        );
      }

      // check if user already has a project (not completed or pending)
      const userHasProject = await this.prisma.project.findMany({
        where: {
          userId,
          status: { notIn: ['COMPLETED', 'PENDING'] },
        },
      });

      if (userHasProject.length > 0) {
        return this.apiResponse.error(
          'User already has an active project',
          null,
        );
      }

      // assign project to user
      const updatedProject = await this.prisma.project.update({
        where: { id: projectId },
        data: {
          userId,
          status: Status.IN_PROGRESS,
        },
        include: {
          assignedUser: true,
        },
      });

      return this.apiResponse.success(
        updatedProject,
        'Project assigned successfully',
      );
    } catch (error) {
      return this.apiResponse.error(
        `Error assigning project: ${error.message}`,
        null,
      );
    }
  }

  // user to view their assigned project
  async viewOwnProject(userId: string): Promise<ApiResponse<Project | null>> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return this.apiResponse.error(`User with id ${userId} not found`, null);
      }

      const userHasProject = await this.prisma.project.findFirst({
        where: { userId },
      });

      if (!userHasProject) {
        return this.apiResponse.error('No project assigned to you', null);
      }

      return this.apiResponse.success(userHasProject, 'Your assigned project');
    } catch (error) {
      return this.apiResponse.error(
        `Error retrieving assigned project: ${error.message}`,
        null,
      );
    }
  }

  // admin to view completed projects
  async viewCompletedProjects(): Promise<ApiResponse<Project[]>> {
    try {
      const completedProjects = await this.prisma.project.findMany({
        where: {
          status: Status.COMPLETED,
        },
        include: {
          assignedUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return this.apiResponse.success(
        completedProjects,
        'Completed projects retrieved successfully',
      );
    } catch (error) {
      return this.apiResponse.error(
        `Error fetching completed projects: ${error.message}`,
        [] as Project[],
      ) as ApiResponse<Project[]>;
    }
  }

  // admin to view pending projects
  async viewPendingProjects(): Promise<ApiResponse<Project[]>> {
    try {
      const pendingProjects = await this.prisma.project.findMany({
        where: {
          status: Status.PENDING,
        },
      });

      return this.apiResponse.success(
        pendingProjects,
        'Pending projects retrieved successfully',
      );
    } catch (error) {
      return this.apiResponse.error(
        `Error fetching pending projects: ${error.message}`,
        [] as Project[],
      ) as ApiResponse<Project[]>;
    }
  }

  // admin to view in progress projects
  async viewInProgressProjects(): Promise<ApiResponse<Project[]>> {
    try {
      const inProgressProjects = await this.prisma.project.findMany({
        where: {
          status: Status.IN_PROGRESS,
        },
        include: {
          assignedUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return this.apiResponse.success(
        inProgressProjects,
        'In progress projects retrieved successfully',
      );
    } catch (error) {
      return this.apiResponse.error(
        `Error fetching in-progress projects: ${error.message}`,
        [] as Project[],
      ) as ApiResponse<Project[]>;
    }
  }
}
