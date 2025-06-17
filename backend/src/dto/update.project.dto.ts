/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string.' })
  @MinLength(2, { message: 'Name must be at least 2 characters long.' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long.' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string.' })
  @Transform(({value}) => value.trim())
  description?: string;

  @IsOptional()
  @IsString({ message: 'End date must be a string.' })
  @Transform(({value}) => value.trim())
  endDate?: string;
}
