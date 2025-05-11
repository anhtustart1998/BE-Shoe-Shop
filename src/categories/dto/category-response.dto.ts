import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Running Shoes' })
  name: string;

  @ApiPropertyOptional({ example: 'Athletic footwear designed for runners' })
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  parent_id?: number;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updated_at: Date;

  @ApiPropertyOptional({ type: [CategoryResponseDto] })
  subcategories?: CategoryResponseDto[];
}
