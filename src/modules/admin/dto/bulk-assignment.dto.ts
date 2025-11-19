import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsPositive, IsArray, ArrayMinSize } from 'class-validator';

export class BulkAssignmentDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  salesRepId: number;

  @ApiProperty({ example: [1, 2, 3, 4, 5], type: [Number] })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  retailerIds: number[];
}

export class BulkUnassignmentDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  salesRepId: number;

  @ApiProperty({ example: [1, 2, 3], type: [Number] })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  retailerIds: number[];
}

export class BulkAssignmentResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  assigned: number;

  @ApiProperty()
  message: string;
}

