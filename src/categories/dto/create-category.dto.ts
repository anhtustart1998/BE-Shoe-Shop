import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Running Shoes',
    description: 'Name of the category',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'A category for running shoes',
    description: 'Description of the category',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'The parent category ID for hierarchical structure',
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  parent_id?: number;
}
