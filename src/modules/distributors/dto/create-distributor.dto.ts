import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDistributorDto {
  @ApiProperty({ example: 'ABC Distributors Ltd' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;
}

export class UpdateDistributorDto {
  @ApiProperty({ example: 'ABC Distributors Ltd Updated' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;
}

