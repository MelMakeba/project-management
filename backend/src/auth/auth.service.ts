/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as bcrypt from 'bcryptjs';
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
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
  async login(loginDto: LoginDto): Promise<{ token: string; user: any }> {
    const { email, password } = loginDto;
    
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase(), 
      },
    });
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
   
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Generate actual JWT token
    const payload = { 
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: []  
    };
    
    const token = this.jwtService.sign(payload);
    
    
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      token,
      user: userWithoutPassword
    };
  }

  // register
  async register(registerDto: RegisterDto): Promise<{ token: string; user: any }> {
    try {
      const { email, password, name, role } = registerDto;
      
      if (!email) {
        throw new BadRequestException('Email is required');
      }

      const existingUser = await this.prisma.user.findUnique({
        where: {
          email: email.toLowerCase(),
        },
      });
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const newUser = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: role || 'USER',
        },
      });
      
      const payload = {
        sub: newUser.id,
        email: newUser.email,
        role: newUser.role,
        permissions: []  // Use empty array since permissions don't exist on the user object
      };
      
      const token = this.jwtService.sign(payload);
      
      const { password: _, ...userWithoutPassword } = newUser;
      
      return {
        token,
        user: userWithoutPassword,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
