/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import { Permission } from 'src/permissions/permission.enum';
import { UsersService } from './users.service';
import { RequirePermissions } from 'src/auth/decorator/permission.decorator';
import { CreateUserDto } from 'src/dto/create.user.dto';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiResponse } from 'src/shared/interfaces/api-response.interfaces';
import { User } from 'src/interfaces/user.interface';
import { UpdateUserDto } from 'src/dto/update.user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * @Post()
   * @param data 
   * @returns 
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  async createUser(@Body() data: CreateUserDto): Promise<ApiResponse<User>> {
    try {
      const user = await this.usersService.createUser(data);
      return { 
        success: true, 
        message: 'User created successfully',
        data: user 
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Error creating user',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all users
   */
  @Get()
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(Permission.VIEW_ALL_USERS)
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    try {
      const users = await this.usersService.findAll();
      return {
        success: true,
        message: 'Users retrieved successfully',
        data: users,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving users',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get user by ID
   */
  @Get(':id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(Permission.VIEW_ALL_USERS)
  async getUserById(@Param('id') id: string): Promise<ApiResponse<User>> {
    try {
      const user = await this.usersService.findById(id);
      return {
        success: true,
        message: 'User retrieved successfully',
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving user',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get user by email
   */
  @Get('email/:email')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(Permission.VIEW_ALL_USERS)
  async getUserByEmail(@Param('email') email: string): Promise<ApiResponse<User>> {
    try {
      const user = await this.usersService.findByEmail(email);
      return {
        success: true,
        message: 'User retrieved successfully',
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving user',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update user
   */
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(Permission.MANAGE_USERS)
  async updateUser(@Param('id') id: string, @Body() data: UpdateUserDto): Promise<ApiResponse<User>> {
    try {
      const user = await this.usersService.update(id, data);
      return {
        success: true,
        message: 'User updated successfully',
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error updating user',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete user
   */
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(Permission.MANAGE_USERS)
  async deleteUser(@Param('id') id: string): Promise<ApiResponse<null>> {
    try {
      await this.usersService.delete(id);
      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error deleting user',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
