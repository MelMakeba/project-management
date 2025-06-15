/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    if (err || !user) {
      console.log('Token validation failed:', err instanceof Error ? err.message : 'No user found');
      throw err || new UnauthorizedException();
    }
    return user;
  }
}