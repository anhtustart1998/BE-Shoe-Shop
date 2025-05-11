import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BrandResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Nike' })
  name: string;

  @ApiPropertyOptional({ example: 'Just Do It' })
  description?: string;

  @ApiPropertyOptional({
    example:
      'https://res.cloudinary.com/sample/image/upload/v1/brands/nike.jpg',
  })
  logo_url?: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
