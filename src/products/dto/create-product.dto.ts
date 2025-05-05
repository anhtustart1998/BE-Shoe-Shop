import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    example: 'Nike Air Max',
    description: 'The name of the product',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'A comfortable and stylish sneaker',
    description: 'The description of the product',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ example: 129.99, description: 'The price of the product' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({
    example: 99.99,
    description: 'The discounted price of the product',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  discount_price?: number;

  @ApiProperty({ example: 1, description: 'The category ID of the product' })
  @IsInt()
  @Type(() => Number)
  category_id: number;

  @ApiProperty({ example: 1, description: 'The brand ID of the product' })
  @IsInt()
  @Type(() => Number)
  brand_id: number;

  @ApiPropertyOptional({
    example: 100,
    description: 'The stock quantity of the product',
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  stock_quantity?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the product is featured',
  })
  @IsBoolean()
  @IsOptional()
  is_featured?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the product is active',
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
