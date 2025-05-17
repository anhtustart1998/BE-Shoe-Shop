import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateAddressDto {
  @ApiPropertyOptional({
    example: '123 Main Street',
    description: 'Address line 1',
  })
  @IsString()
  @IsOptional()
  address_line1?: string;

  @ApiPropertyOptional({ example: 'Apt 4B', description: 'Address line 2' })
  @IsString()
  @IsOptional()
  address_line2?: string;

  @ApiPropertyOptional({ example: 'New York', description: 'City name' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'New York', description: 'State name' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: '10001', description: 'Postal code' })
  @IsString()
  @IsOptional()
  postal_code?: string;

  @ApiPropertyOptional({
    example: 'United States',
    description: 'Country name',
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether this is the default address',
  })
  @IsBoolean()
  @IsOptional()
  is_default?: boolean;
}
