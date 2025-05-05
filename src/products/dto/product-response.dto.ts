import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CategoryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Running Shoes' })
  name: string;
}

class BrandDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Nike' })
  name: string;
}

class ProductImageDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example:
      'https://res.cloudinary.com/sample/image/upload/v1/products/shoe.jpg',
  })
  image_url: string;

  @ApiProperty({ example: true })
  is_primary: boolean;

  @ApiProperty({ example: 1 })
  display_order: number;
}

class ProductVariantDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '42' })
  size: string;

  @ApiProperty({ example: 'Black' })
  color: string;

  @ApiPropertyOptional({ example: 10.0 })
  additional_price?: number;

  @ApiProperty({ example: 20 })
  stock_quantity: number;

  @ApiProperty({ example: 'NIKE-AIR-42-BLK' })
  sku: string;
}

export class ProductResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Nike Air Max' })
  name: string;

  @ApiPropertyOptional({
    example: 'Comfortable running shoes with air cushioning',
  })
  description?: string;

  @ApiProperty({ example: 129.99 })
  price: number;

  @ApiPropertyOptional({ example: 99.99 })
  discount_price?: number;

  @ApiProperty({ type: () => CategoryDto })
  categories: CategoryDto;

  @ApiProperty({ type: () => BrandDto })
  brands: BrandDto;

  @ApiProperty({ example: 100 })
  stock_quantity: number;

  @ApiProperty({ example: true })
  is_featured: boolean;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ type: [ProductImageDto] })
  product_images: ProductImageDto[];

  @ApiProperty({ type: [ProductVariantDto] })
  product_variants: ProductVariantDto[];

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
