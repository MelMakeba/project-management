/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';
import { JwtService } from './guards/jwt/jwt.service';
import { LoginDto } from 'src/dto/login.dto';
import { RegisterDto } from 'src/dto/register.dto';
import { ApiResponseService } from '../shared/api-response.service';
import { ApiResponse } from '../shared/interfaces/api-response.interfaces';

@Injectable()
export class AuthService {
  private prisma: PrismaClient;

  constructor(
    private readonly jwtService: JwtService,
    private readonly apiResponse: ApiResponseService
  ) {
    this.prisma = new PrismaClient(); 
  }

  // login
  async login(data: LoginDto): Promise<ApiResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      
      if (!user) {
        return this.apiResponse.error('User not found');
      }

      const isValidPassword = await bcrypt.compare(data.password, user.password);
      if (!isValidPassword) {
        return this.apiResponse.error('Invalid password');
      }

      const token = this.jwtService.generateToken({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      return this.apiResponse.success({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }, 'Login successful');
    } catch (error) {
      return this.apiResponse.error(`Login failed: ${error.message}`);
    }
  }

  // register
  async register(data: RegisterDto): Promise<ApiResponse> {
    try {
      const existing = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      
      if (existing) {
        return this.apiResponse.error('User already exists');
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: data.role
        },
      });

      return this.apiResponse.success({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }, 'Registration successful');
    } catch (error) {
      return this.apiResponse.error(`Registration failed: ${error.message}`);
    }
  }
}
