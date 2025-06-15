/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-useless-catch */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient, Project, Status } from 'generated/prisma';
import { CreateProjectDto } from 'src/dto/create.project.dto';
import { UpdateProjectDto } from 'src/dto/update.project.dto';

@Injectable()
export class ProjectsService {
  prisma = new PrismaClient();

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
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error creating project: ${error.message}`,
      );
    }
  }

  // get all projects
  async getAllProjects(): Promise<Project[]> {
    try {
      return await this.prisma.project.findMany({
        orderBy: { id: 'asc' },
      });
    } catch (error) {
      throw new InternalServerErrorException(' Error fetching projects');
    }
  }

  // get a project by id
  async getProjectById(id: string): Promise<Project> {
    try {
      const project = await this.prisma.project.findUnique({ where: { id } });
      if (!project) {
        throw new InternalServerErrorException('Project not found');
      }
      return project;
    } catch (error) {
      console.error('Error retrieving project by ID:', error);
      throw new InternalServerErrorException('Error fetching project');
    }
  }

  // update a project
  async updateProject(id: string, data: UpdateProjectDto): Promise<Project> {
    try {
      const project = await this.prisma.project.findUnique({ where: { id } });
      if (!project) {
        throw new InternalServerErrorException('Project not found');
      }
      return await this.prisma.project.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating project');
    }
  }

  // update project status either to in pending, progress or completed
  async updateProjectStatus(id: string, status: Status): Promise<Project> {
    try {
      const project = await this.prisma.project.findUnique({ where: { id } });
      if (!project) {
        throw new InternalServerErrorException('Project not found');
      }
      if(!project.userId){
        throw new ConflictException('Cannot update status: Project is not assigned to any user');
      }
      return await this.prisma.project.update({
        where: { id },
        data: {
          status: status, 
          isCompleted: status === 'COMPLETED',
          completedAt: status === 'COMPLETED' ? new Date() : null
        },
      });
    } catch (error) {
      console.error("Error occurred while updating project", error);
      throw new InternalServerErrorException('Error updating project status', error.message);
    }
  }
  

  // delete a project
  async deleteProject(id: string): Promise<void> {
    try {
      const project = await this.prisma.project.findUnique({ where: { id } });
      if (!project) {
        throw new InternalServerErrorException('Project not found');
      }
      await this.prisma.project.delete({ where: { id } });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error deleting project');
    }
  }

  async assignProjectToUser(projectId: string, userId: string): Promise<Project> {
    try {
      // check project exists
      const project = await this.prisma.project.findUnique({ where: { id: projectId }});
      if (!project) {
        throw new NotFoundException(`Project with id ${projectId} not found`);
      }
  
      // check user exists
      const user = await this.prisma.user.findUnique({ where: { id: userId }});
      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }
  
      // check if project is already assigned to any user
      if (project.userId) {
        throw new ConflictException('Project is already assigned to a user');
      }
  
      // check if user already has a project (not completed or pending)
      const userHasProject = await this.prisma.project.findMany({ 
        where: { 
          userId,
          status: { notIn: ['COMPLETED', 'PENDING'] }
        }
      });
  
      if (userHasProject.length > 0) {
        throw new ConflictException('User already has an active project');
      }
  
      // assign project to user
      const updatedProject = await this.prisma.project.update({
        where: { id: projectId },
        data: { userId }
      });
  
      return updatedProject;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      // rethrow or handle unexpected errors
      throw new InternalServerErrorException('Unexpected error occurred during project assignment');
    }
  }

  // user to view their assigned project
  async viewOwnProject(userId: string): Promise<Project> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId }});
      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }
  
      const userHasProject = await this.prisma.project.findFirst({
        where: { userId }
      });
      if (!userHasProject) {
        throw new NotFoundException('No project assigned to you');
      }
      return userHasProject;
    } catch (error) {
      throw error;
    }
  }

  // admin to view completed projects where status is COMPLETED ✅
  async viewCompletedProjects(): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: {
        status:Status.COMPLETED,
      },
    });
  }
  

  // admin to view pending projects where status is PENDING 🐧
  async viewPendingProjects(): Promise<Project[]>{
    try{
      // filter projects where status is PENDING
      const pendingProjects = await this.prisma.project.findMany({
        where: {
          status: Status.PENDING
        },
      });
      return pendingProjects;
    } catch (error) {
      throw error;
    }
  }

    // admin to view pending projects where status is PENDING 🐧
    async viewInProgressProjects(): Promise<Project[]>{
      try{
        // filter projects where status is PENDING
        const pendingProjects = await this.prisma.project.findMany({
          where: {
            status: Status.IN_PROGRESS
          },
        });
        return pendingProjects;
      } catch (error) {
        throw error;
      }
    }
}