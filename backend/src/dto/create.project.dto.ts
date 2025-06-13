/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString({ message: 'Project name must be a string' })
  @IsNotEmpty({ message: 'Project name is required' })
  @Transform(({ value }) => value.trim())
  name: string;

  // validate the project description
  @IsString({ message: 'Project description must be a string' })
  @IsNotEmpty({ message: 'Project description is required' })
  @Transform(({ value }) => value.trim())
  description: string;

  // validate the project end date
  @IsString({ message: 'Project end date must be a string' })
  @IsNotEmpty({ message: 'Project end date is required' })
  @Transform(({ value }) => value.trim())
  endDate: string;
}
