/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';
import { JwtService } from './guards/jwt/jwt.service';
import { LoginDto } from 'src/dto/login.dto';
import { RegisterDto } from 'src/dto/register.dto';

@Injectable()
export class AuthService {
  private prisma: PrismaClient;

  constructor(private readonly jwtService: JwtService) {
    this.prisma = new PrismaClient(); 
  }

  // login
async login(data: LoginDto) {
  const user = await this.prisma.user.findUnique({
    where: { email: data.email },
  });
  if (!user) throw new Error('User not found');

  const isValidPassword = await bcrypt.compare(data.password, user.password);
  if (!isValidPassword) throw new Error('Invalid password');

  const token = this.jwtService.generateToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  return { token };
}

// register
async register(data: RegisterDto) {
  const existing = await this.prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) throw new Error('User already exists');

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await this.prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role
    },
  });

  return user;
}

}
