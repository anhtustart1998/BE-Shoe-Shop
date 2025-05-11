import { ApiProperty } from '@nestjs/swagger';

class ProductVariantDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  product_id: number;

  @ApiProperty({ example: '42' })
  size: string;

  @ApiProperty({ example: 'Black' })
  color: string;

  @ApiProperty({ example: 0 })
  additional_price: number;

  @ApiProperty({ example: 20 })
  stock_quantity: number;

  @ApiProperty({ example: 'NIKE-AIR-42-BLK' })
  sku: string;
}

class ProductDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Nike Air Max 90' })
  name: string;

  @ApiProperty({ example: 'Iconic running shoes with visible air cushioning' })
  description: string;

  @ApiProperty({ example: 129.99 })
  price: number;

  @ApiProperty({ example: 99.99 })
  discount_price: number;

  @ApiProperty({
    example: [
      {
        id: 1,
        product_id: 1,
        image_url:
          'https://res.cloudinary.com/sample/image/upload/v1/products/shoe.jpg',
        is_primary: true,
        display_order: 1,
      },
    ],
  })
  product_images: any[];
}

class CartItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  cart_id: number;

  @ApiProperty({ example: 1 })
  product_variant_id: number;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 99.99 })
  price: number;

  @ApiProperty({ example: 199.98 })
  subtotal: number;

  @ApiProperty({ type: ProductVariantDto })
  product_variants: ProductVariantDto;

  @ApiProperty({ type: ProductDto })
  product: ProductDto;
}

export class CartResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  user_id: number;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiProperty({ type: [CartItemDto] })
  cart_items: CartItemDto[];

  @ApiProperty({ example: 199.98 })
  total: number;

  @ApiProperty({ example: 2 })
  itemCount: number;
}
