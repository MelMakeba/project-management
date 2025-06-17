/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, Project, Status } from 'generated/prisma';
import { CreateProjectDto } from 'src/dto/create.project.dto';
import { UpdateProjectDto } from 'src/dto/update.project.dto';
import { MailerService } from '../mailer/mailer.service';
import { ApiResponseService } from '../shared/api-response.service';

@Injectable()
export class ProjectsService {
  private prisma: PrismaClient;

  constructor(
    private readonly apiResponse: ApiResponseService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService, // Add this
  ) {
    this.prisma = new PrismaClient();
  }

  // create a project
  async createProject(data: CreateProjectDto): Promise<Project> {
    try {
      const newProject = await this.prisma.project.create({
        data: {
          ...data,
          endDate: new Date(data.endDate),
        },
      });
      return newProject;
    } catch (error) {
      throw new Error(`Error creating project: ${error.message}`);
    }
  }

  // get all projects
  async getAllProjects(): Promise<Project[]> {
    try {
      return await this.prisma.project.findMany({
        orderBy: { id: 'asc' },
      });
    } catch (error) {
      throw new Error(`Error fetching projects: ${error.message}`);
    }
  }

  // get a project by id
  async getProjectById(id: string): Promise<Project> {
    try {
      const project = await this.prisma.project.findUnique({ where: { id } });
      if (!project) {
        throw new Error(`Project with id ${id} not found`);
      }
      return project;
    } catch (error) {
      throw new Error(`Error fetching project: ${error.message}`);
    }
  }

  // update a project
  async updateProject(id: string, data: UpdateProjectDto): Promise<Project> {
    try {
      const project = await this.prisma.project.findUnique({ where: { id } });
      if (!project) {
        throw new Error(`Project with id ${id} not found`);
      }

      return await this.prisma.project.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new Error(`Error updating project: ${error.message}`);
    }
  }

  // update project status either to pending, in progress or completed
  async updateProjectStatus(
    id: string,
    status: Status,
    userId?: string,
  ): Promise<Project> {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id },
        include: {
          assignedUser: true,
        },
      });

      if (!project) {
        throw new Error(`Project with id ${id} not found`);
      }

      if (!project.userId) {
        throw new Error(
          'Cannot update status: Project is not assigned to any user',
        );
      }

      // If userId is provided (user making the request), verify they own the project
      if (userId && project.userId !== userId) {
        throw new Error('You are not authorized to update this project');
      }

      // Only allow users to mark projects as completed
      if (userId && status !== 'COMPLETED') {
        throw new Error('Users can only mark projects as completed');
      }

      const updatedProject = await this.prisma.project.update({
        where: { id },
        data: {
          status,
          isCompleted: status === 'COMPLETED',
          completedAt: status === 'COMPLETED' ? new Date() : null,
        },
        include: {
          assignedUser: true,
        },
      });

      // Send email to admin if project is marked as completed
      if (status === 'COMPLETED') {
        // Get admin email from config
        const adminEmail = this.configService.get<string>(
          'ADMIN_EMAIL',
          'melissamakeba@gmail.com',
        );

        await this.mailerService
          .sendCompletionEmail(adminEmail, {
            name: 'Admin',
            projectName: updatedProject.name,
            projectDescription: updatedProject.description,
            completedDate: new Date().toLocaleDateString(),
            assignedUser: updatedProject.assignedUser?.name || 'A user',
          })
          .catch((error) => {
            console.error('Failed to send completion email to admin:', error);
            // Continue execution even if email fails
          });
      }

      return updatedProject;
    } catch (error) {
      throw new Error(`Error updating project status: ${error.message}`);
    }
  }

  // delete a project
  async deleteProject(id: string): Promise<void> {
    try {
      const project = await this.prisma.project.findUnique({ where: { id } });
      if (!project) {
        throw new Error(`Project with id ${id} not found`);
      }

      await this.prisma.project.delete({ where: { id } });
    } catch (error) {
      throw new Error(`Error deleting project: ${error.message}`);
    }
  }

  // assign project to user
  async assignProjectToUser(
    projectId: string,
    userId: string,
  ): Promise<Project> {
    try {
      // Check project exists
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new Error(`Project with id ${projectId} not found`);
      }

      // Check user exists
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error(`User with id ${userId} not found`);
      }

      // Check if project is already assigned
      if (project.userId) {
        throw new Error('Project is already assigned to a user');
      }

      // Check if user already has ANY project assigned (regardless of status)
      const userProjects = await this.prisma.project.findFirst({
        where: {
          userId,
        },
      });

      if (userProjects) {
        throw new Error('User already has a project assigned');
      }

      // Assign project to user
      const assignedProject = await this.prisma.project.update({
        where: { id: projectId },
        data: {
          userId,
          status: Status.IN_PROGRESS,
        },
        include: {
          assignedUser: true,
        },
      });

      // Send email notification to the user
      if (assignedProject.assignedUser && assignedProject.assignedUser.email) {
        await this.mailerService
          .sendAssignmentEmail(assignedProject.assignedUser.email, {
            name: assignedProject.assignedUser.name || 'User',
            projectName: assignedProject.name,
            projectDescription: assignedProject.description,
            dueDate: assignedProject.endDate.toLocaleDateString(),
          })
          .catch((error) => {
            console.error('Failed to send assignment email:', error);
            // Continue execution even if email fails
          });
      }

      return assignedProject;
    } catch (error) {
      throw new Error(`Error assigning project: ${error.message}`);
    }
  }

  // view user's assigned project
  async viewOwnProject(userId: string): Promise<Project[]> {
    try {
      // Check user exists
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error(`User with id ${userId} not found`);
      }

      // Get user's projects
      const projects = await this.prisma.project.findMany({
        where: { userId },
      });

      if (projects.length === 0) {
        throw new Error('No projects assigned to this user');
      }

      return projects;
    } catch (error) {
      throw new Error(`Error retrieving user projects: ${error.message}`);
    }
  }

  // admin to view completed projects
  async viewCompletedProjects(): Promise<Project[]> {
    try {
      return await this.prisma.project.findMany({
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
    } catch (error) {
      throw new Error(`Error fetching completed projects: ${error.message}`);
    }
  }

  // admin to view pending projects
  async viewPendingProjects(): Promise<Project[]> {
    try {
      return await this.prisma.project.findMany({
        where: {
          status: Status.PENDING,
        },
      });
    } catch (error) {
      throw new Error(`Error fetching pending projects: ${error.message}`);
    }
  }

  // admin to view in-progress projects
  async viewInProgressProjects(): Promise<Project[]> {
    try {
      return await this.prisma.project.findMany({
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
    } catch (error) {
      throw new Error(`Error fetching in-progress projects: ${error.message}`);
    }
  }

  // Add this method to allow users to update their own projects
  async updateOwnProject(
    id: string,
    userId: string,
    data: UpdateProjectDto,
  ): Promise<Project> {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id },
        include: { assignedUser: true },
      });

      if (!project) {
        throw new Error(`Project with id ${id} not found`);
      }

      // Check if the project is assigned to this user
      if (project.userId !== userId) {
        throw new Error('You are not authorized to update this project');
      }

      // Users should only be able to update certain fields, not all
      const allowedUpdateData: Partial<UpdateProjectDto> = {
        // Allow users to update name and description only
        name: data.name,
        description: data.description,
        // Status updates are handled by updateProjectStatus method
      };

      return await this.prisma.project.update({
        where: { id },
        data: allowedUpdateData,
      });
    } catch (error) {
      throw new Error(`Error updating project: ${error.message}`);
    }
  }
}
