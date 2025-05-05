import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductQueryDto {
  @ApiPropertyOptional({
    example: 'nike',
    description: 'Search term for product name',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 1, description: 'Filter by category ID' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  category_id?: number;

  @ApiPropertyOptional({ example: 1, description: 'Filter by brand ID' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  brand_id?: number;

  @ApiPropertyOptional({ example: 50, description: 'Minimum price' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  min_price?: number;

  @ApiPropertyOptional({ example: 200, description: 'Maximum price' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  max_price?: number;

  @ApiPropertyOptional({
    example: 'price',
    description: 'Sort by field (name, price, createdAt)',
  })
  @IsString()
  @IsOptional()
  sort_by?: string;

  @ApiPropertyOptional({
    example: 'asc',
    description: 'Sort direction (asc, desc)',
  })
  @IsString()
  @IsOptional()
  sort_direction?: 'asc' | 'desc';

  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Items per page' })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
