/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
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
      // create a new project
      const newProject = await this.prisma.project.create({ data });
      return newProject;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      // handle other errors
      throw new InternalServerErrorException(
        `Error creating project: ${error.message}`,
      );
    }
  }

  // get all projects
  async getAllProjects(): Promise<Project[]>{
    try {
        const allProjects = await this.prisma.project.findMany({
            orderBy: { id: 'asc' },
        });
        return allProjects;
    } catch (error) {
        throw new InternalServerErrorException(' Error fetching projects');
    }
  }

  // get a project by id
  async getProjectById(id: string): Promise<Project>{
    try {
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project) {
            throw new InternalServerErrorException('Project not found');
        }
        return project;
    } catch (error) {
        throw new InternalServerErrorException('Error fetching project');
    }
  }

  // update a project
  async updateProject(id: string, data: UpdateProjectDto): Promise<Project>{
    try {
        // check if project exists
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project) {
            throw new InternalServerErrorException('Project not found');
        }
        // update the project
        const updatedProject = await this.prisma.project.update({ where: { id }, data });
        return updatedProject;
    } catch (error) {
        if (error instanceof ConflictException) {
            throw error;
        }
        throw new InternalServerErrorException('Error updating project')
    }
  }

  // update project status either to in pending, progress or completed
  async updateProjectStatus(id: string, status: Status): Promise<Project>{
    try{
        // check if project exists
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project) {
            throw new InternalServerErrorException('Project not found');
        }
        // update the project status
        const updatedProject = await this.prisma.project.update({
             where: { id }, 
             data: { status },
         });
         return updatedProject;
    } catch (error) {
        if (error instanceof ConflictException) {
            throw error;
        }
        throw new InternalServerErrorException('Error updating project status')
    }
  }

  // delete a project
  async deleteProject(id: string): Promise<void>{
    try {
        // check if project exists
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project) {
            throw new InternalServerErrorException('Project not found');
        }
        // delete the project
        await this.prisma.project.delete({where: { id }});
    } catch (error) {
        if (error instanceof ConflictException) {
            throw error;
        }
    }
  }
}
