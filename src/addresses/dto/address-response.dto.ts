import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddressResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  user_id: number;

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

  @ApiProperty({ example: true })
  is_default: boolean;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
