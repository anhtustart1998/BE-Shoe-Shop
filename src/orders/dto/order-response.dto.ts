import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AddressDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '123 Main Street' })
  address_line1: string;

  @ApiPropertyOptional({ example: 'Apt 4B' })
  address_line2?: string;

  @ApiProperty({ example: 'New York' })
  city: string;

  @ApiPropertyOptional({ example: 'New York' })
  state?: string;

  @ApiProperty({ example: '10001' })
  postal_code: string;

  @ApiProperty({ example: 'United States' })
  country: string;
}

class ProductDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Nike Air Max 90' })
  name: string;

  @ApiProperty({ example: 'Iconic running shoes' })
  description: string;

  @ApiProperty({
    example: [
      {
        id: 1,
        image_url:
          'https://res.cloudinary.com/sample/image/upload/v1/products/shoe.jpg',
        is_primary: true,
      },
    ],
  })
  product_images: any[];
}

class ProductVariantDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '42' })
  size: string;

  @ApiProperty({ example: 'Black' })
  color: string;

  @ApiProperty({ example: 'NIKE-AIR-42-BLK' })
  sku: string;

  @ApiProperty({ type: ProductDto })
  products: ProductDto;
}

class OrderItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  product_variant_id: number;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 99.99 })
  unit_price: number;

  @ApiProperty({ example: 199.98 })
  total_price: number;

  @ApiProperty({ type: ProductVariantDto })
  product_variants: ProductVariantDto;
}

export class OrderResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  user_id: number;

  @ApiProperty({ example: 1 })
  address_id: number;

  @ApiProperty({ example: 'ORD-2023-001' })
  order_number: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  order_date: Date;

  @ApiProperty({ example: 249.97 })
  total_amount: number;

  @ApiProperty({ example: 25.0 })
  tax_amount: number;

  @ApiProperty({ example: 9.99 })
  shipping_amount: number;

  @ApiProperty({ example: 0 })
  discount_amount: number;

  @ApiProperty({ example: 'pending' })
  payment_status: string;

  @ApiProperty({ example: 'pending' })
  fulfillment_status: string;

  @ApiPropertyOptional({ example: 'Please handle with care' })
  notes?: string;

  @ApiProperty({ type: AddressDto })
  addresses: AddressDto;

  @ApiProperty({ type: [OrderItemDto] })
  order_items: OrderItemDto[];

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
