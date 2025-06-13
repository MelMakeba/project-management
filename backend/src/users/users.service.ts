/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient, Role } from 'generated/prisma';
import { CreateUserDto } from 'src/dto/create.user.dto';
import { User } from 'src/interfaces/user.interface';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from 'src/dto/update.user.dto';

@Injectable()
export class UsersService {
  prisma = new PrismaClient();

  // create a user
  async createUser(data: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });
      if (existingUser) {
        throw new ConflictException(
          `User with email ${data.email} already exists`,
        );
      }

      // harsh passord
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: data.role || Role.USER,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log(`Created a new user ${user.name} with email ${user.email}`);
      return user;
    } catch (error) {
      // catch any errors
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error creating user ${error.message}`,
      );
    }
  }

  // find all the users
  async findAll(): Promise<User[]>{
    try {
        const users = await this.prisma.user.findMany({
            orderBy: { id: 'asc' },
        });
        return users;
    } catch (error) {
        throw new InternalServerErrorException('Error finding all users');
    }
  }

  // find a user by id
  async findById(id: string): Promise<User>{
    try{
        const user = await this.prisma.user.findUnique({
            where: { id },
        })
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return user;
    } catch (error) {
        throw new InternalServerErrorException(`user with id ${id} not found`);
    }
  }

  // update a user
  async update(id: string, data: UpdateUserDto): Promise<User>{
    try{
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        // Check for email conflicts if email is being updated
        if (data.email && data.email !== user.email) {
            const emailConflict = await this.prisma.user.findUnique({
              where: { email: data.email },
            });
            if (emailConflict) {
                throw new ConflictException('Email already exists');
            }
        }
        // hash password if password is being updated
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                ...(data.email && { email: data.email }),
                ...(data.password && { password: data.password }),
                ...(data.name && { name: data.name }),
                ...(data.role && { role: data.role }),

            }

        })
        return updatedUser;
    } catch (error) {
        throw new InternalServerErrorException(`Failed to update user ${id}`);
    }
  }
}
