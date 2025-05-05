import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductImageDto {
  @ApiProperty({ example: 1, description: 'The product ID' })
  @IsInt()
  @Type(() => Number)
  product_id: number;

  @ApiProperty({
    example:
      'https://res.cloudinary.com/sample/image/upload/v1/products/shoe.jpg',
    description: 'The image URL',
  })
  @IsString()
  @IsNotEmpty()
  image_url: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether this is the primary image',
  })
  @IsBoolean()
  @IsOptional()
  is_primary?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'The display order of the image',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  display_order?: number;
}
