import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  IsInt,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateProductWithImagesDto {
  @ApiProperty({
    example: 'Nike Air Max',
    description: 'The name of the product',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Comfortable running shoes with air cushioning',
    description: 'The description of the product',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 129.99, description: 'The price of the product' })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    example: 99.99,
    description: 'The discounted price of the product',
  })
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  discount_price?: number;

  @ApiProperty({ example: 1, description: 'The category ID of the product' })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  category_id: number;

  @ApiProperty({ example: 1, description: 'The brand ID of the product' })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  brand_id: number;

  @ApiPropertyOptional({
    example: 100,
    description: 'The stock quantity of the product',
  })
  @Transform(({ value }) => (value ? parseInt(value) : 0))
  @IsInt()
  @IsOptional()
  stock_quantity?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the product is featured',
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  is_featured?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the product is active',
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  // Image metadata will be passed as JSON strings
  @ApiPropertyOptional({
    example:
      '[{"is_primary": true, "display_order": 1}, {"is_primary": false, "display_order": 2}]',
    description: 'JSON string of image metadata array',
  })
  @IsString()
  @IsOptional()
  image_metadata?: string;
}
