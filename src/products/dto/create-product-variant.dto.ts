import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductVariantDto {
  @ApiProperty({ example: 1, description: 'The product ID' })
  @IsInt()
  @Type(() => Number)
  product_id: number;

  @ApiProperty({ example: '42', description: 'The size of the variant' })
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiProperty({ example: 'Black', description: 'The color of the variant' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiPropertyOptional({
    example: 10.0,
    description: 'Additional price for this variant',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  additional_price?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Stock quantity for this variant',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  stock_quantity?: number;

  @ApiProperty({
    example: 'NIKE-AIR-42-BLK',
    description: 'The SKU of the variant',
  })
  @IsString()
  @IsNotEmpty()
  sku: string;
}
