import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProductImageItem {
  @ApiProperty({
    example:
      'https://res.cloudinary.com/sample/image/upload/v1/products/shoe.jpg',
    description: 'The image URL',
  })
  @IsUrl()
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
  display_order?: number;
}

export class AddMultipleProductImagesDto {
  @ApiProperty({
    type: [ProductImageItem],
    description: 'Array of product images to add',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageItem)
  images: ProductImageItem[];
}
