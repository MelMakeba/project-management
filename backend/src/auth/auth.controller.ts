/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from 'src/dto/login.dto';
import { RegisterDto } from 'src/dto/register.dto';
import { Response } from 'express';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() data: LoginDto, @Res() response: Response): Promise<void> {
    try {
      const result = await this.authService.login(data);
      
      let token = '';
      if (typeof result === 'object' && result !== null) {
        token = result.token || '';
      } else if (typeof result === 'string') {
        token = result;
      }
      
      response.status(HttpStatus.OK).json({
        token: token,
        success: true,
        message: 'You have logged in successfully',
        data: { 
          token: token,
          user: result.user || null
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      
      response.status(HttpStatus.UNAUTHORIZED).json({
        token: '',
        success: false,
        message: error.message || 'Invalid credentials',
        data: { token: '' },
      });
    }
  }

  @Post('register')
  async register(@Body() data: RegisterDto, @Res() response: Response): Promise<void> {
    try {
      const result = await this.authService.register(data);
      
      response.status(HttpStatus.CREATED).json({
        token: result.token,
        success: true,
        message: 'User has been registered successfully',
        data: result.user,
      });
    } catch (error) {
      let statusCode = HttpStatus.BAD_REQUEST;
      
      if (error.message.includes('already exists')) {
        statusCode = HttpStatus.CONFLICT;
      }
      
      response.status(statusCode).json({
        token: '',
        success: false,
        message: error.message || 'Registration failed',
        data: null,
      });
    }
  }
}

