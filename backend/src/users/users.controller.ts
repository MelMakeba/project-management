/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
import { ApiResponse } from 'src/interfaces/apiResponse';
import { User } from 'src/interfaces/user.interface';
import { UpdateUserDto } from 'src/dto/update.user.dto';
import { Action } from 'src/permissions/action.enum';

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
  @UseGuards(PermissionGuard)
  @RequirePermissions(Action.CREATE)
  @RequirePermissions(Permission.MANAGE_USERS)
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
        message: 'User created successfully',
        error: error instanceof Error ? error.message : 'Unknown error',
     };
    }
  }

  /**
   * @ Get all users
   * @ return User[]
   */
  @Get()
  @UseGuards(PermissionGuard)
  @RequirePermissions(Action.READ)
  @RequirePermissions(Permission.VIEW_ALL_USERS)
  async getAllUsers(): Promise<ApiResponse<User[]>>{
    try{
        const users = await this.usersService.findAll();
        return {
            success: true,
            message: 'Users retrieved successfully',
            data: users
        }
    } catch(error){
        return {
            success: false,
            message: 'Error retrieving users',
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
  }

  /**
   *  @ Get user by id
   *  @param id: string
   *  @ return User
   */
  @Get(':id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Action.READ)
  @RequirePermissions(Permission.VIEW_ALL_USERS)
  async getUserById(@Param('id') id: string): Promise<ApiResponse<User>>{
    try{
        const user = await this.usersService.findById(id);
        return {
            success: true,
            message: 'User retrieved successfully',
            data: user
        }
    } catch(error){
        return {
            success: false,
            message: 'Error retrieving user',
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
  }

  /**
   *  @Get user by email
   *  @param email: string
   *  @ return User
   */
  @Get('email/:email')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Action.READ)
  @RequirePermissions(Permission.VIEW_ALL_USERS)
  async getUserByEmail(@Param('email') email: string): Promise<ApiResponse<User>>{
    try{
        const user = await this.usersService.findByEmail(email);
        return {
            success: true,
            message: 'User retrieved successfully',
            data: user
        }
    } catch(error){
        return {
            success: false,
            message: 'Error retrieving user',
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
  }

  /**
   *  @Update user
   *  @param user: User
   *  @ return User
   */
  @Patch(':id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Action.UPDATE)
  @RequirePermissions(Permission.MANAGE_USERS)
  async updateUser(@Param('id') id: string, @Body() data: UpdateUserDto): Promise<ApiResponse<User>>{
    try{
        const user = await this.usersService.update(id, data);
        return {
            success: true,
            message: 'User updated successfully',
            data: user
        }
    } catch(error){
        return {
            success: false,
            message: 'Error updating user',
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
  }

  /**
   *  @Delete user
   *  @param id: string
   *  @ return User
   */
  @Delete(':id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Action.DELETE)
  @RequirePermissions(Permission.MANAGE_USERS)
  async deleteUser(@Param('id') id: string): Promise<ApiResponse<null>>{
    try{
        await this.usersService.delete(id);
        return {
            success: true,
            message: 'User deleted successfully',
        }
    } catch(error){
        return {
            success: false,
            message: 'Error deleting user',
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
  }
}