import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    example: 'Running Shoes',
    description: 'The name of the category',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'Athletic footwear designed for runners',
    description: 'The description of the category',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'The parent category ID for hierarchical structure',
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  parent_id?: number;
}
