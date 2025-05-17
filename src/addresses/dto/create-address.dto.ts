import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: '123 Main Street', description: 'Address line 1' })
  @IsString()
  @IsNotEmpty()
  address_line1: string;

  @ApiPropertyOptional({ example: 'Apt 4B', description: 'Address line 2' })
  @IsString()
  @IsOptional()
  address_line2?: string;

  @ApiProperty({ example: 'New York', description: 'City name' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({ example: 'New York', description: 'State name' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ example: '10001', description: 'Postal code' })
  @IsString()
  @IsNotEmpty()
  postal_code: string;

  @ApiProperty({ example: 'United States', description: 'Country name' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether this is the default address',
  })
  @IsBoolean()
  @IsOptional()
  is_default?: boolean;
}
