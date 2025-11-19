import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsInt, IsPositive } from 'class-validator';

export class CreateTerritoryDto {
  @ApiProperty({ example: 'Uttara Sector 10' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  areaId: number;
}

export class UpdateTerritoryDto {
  @ApiProperty({ example: 'Uttara Sector 10 Updated' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  areaId: number;
}

