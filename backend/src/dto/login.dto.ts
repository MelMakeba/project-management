import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// Login DTO class
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
