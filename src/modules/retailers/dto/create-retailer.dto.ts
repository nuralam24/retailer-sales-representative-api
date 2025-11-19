import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsInt, IsPositive, IsOptional, IsPhoneNumber, Min } from 'class-validator';

export class CreateRetailerDto {
  @ApiProperty({ example: 'RET-001234' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  uid: string;

  @ApiProperty({ example: 'Karim Store' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: '+8801712345678' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  regionId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  areaId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  distributorId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  territoryId: number;

  @ApiProperty({ example: 1500, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @ApiProperty({ example: 'Route A, Route B', required: false })
  @IsOptional()
  @IsString()
  routes?: string;

  @ApiProperty({ example: 'Regular customer', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateRetailerDto {
  @ApiProperty({ example: 1500, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @ApiProperty({ example: 'Route A, Route B', required: false })
  @IsOptional()
  @IsString()
  routes?: string;

  @ApiProperty({ example: 'Regular customer, prefers morning visits', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SearchRetailerDto {
  @ApiProperty({ required: false, example: 'Karim' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  regionId?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  areaId?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  distributorId?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  territoryId?: number;

  @ApiProperty({ required: false, example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  page?: number = 1;

  @ApiProperty({ required: false, example: 20, default: 20 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  limit?: number = 20;
}

