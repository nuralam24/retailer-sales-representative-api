import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRegionDto {
  @ApiProperty({ example: 'Dhaka Division' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;
}

export class UpdateRegionDto {
  @ApiProperty({ example: 'Dhaka Division Updated' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;
}

