import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductVariantDto {
  @ApiPropertyOptional({
    example: '43',
    description: 'The size of the variant',
  })
  @IsString()
  @IsOptional()
  size?: string;

  @ApiPropertyOptional({
    example: 'Red',
    description: 'The color of the variant',
  })
  @IsString()
  @IsOptional()
  color?: string;

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
    example: 25,
    description: 'Stock quantity for this variant',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  stock_quantity?: number;

  @ApiPropertyOptional({
    example: 'NIKE-AIR-43-RED',
    description: 'The SKU of the variant',
  })
  @IsString()
  @IsOptional()
  sku?: string;
}
