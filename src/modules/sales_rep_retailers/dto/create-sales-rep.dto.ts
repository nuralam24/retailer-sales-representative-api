import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength, IsEnum, IsOptional } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  SALES_REP = 'sales_rep',
}

export class CreateSalesRepDto {
  @ApiProperty({ example: 'karim_ahmed' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  username: string;

  @ApiProperty({ example: 'Karim Ahmed' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: '+8801712345678' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: 'Password123!' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'sales_rep', enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class UpdateSalesRepDto {
  @ApiProperty({ example: 'Karim Ahmed Updated', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ example: '+8801712345678', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ example: 'NewPassword123!', required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
