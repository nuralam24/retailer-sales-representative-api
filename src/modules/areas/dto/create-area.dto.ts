import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsInt, IsPositive } from 'class-validator';

export class CreateAreaDto {
  @ApiProperty({ example: 'Uttara' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  regionId: number;
}

export class UpdateAreaDto {
  @ApiProperty({ example: 'Uttara Updated' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  regionId: number;
}

