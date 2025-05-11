import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateBrandDto {
  @ApiPropertyOptional({
    example: 'Nike',
    description: 'Brand name',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'Just Do It',
    description: 'The description of the brand',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example:
      'https://res.cloudinary.com/sample/image/upload/v1/brands/nike.jpg',
    description: 'The URL of the brand logo',
  })
  @IsUrl()
  @IsOptional()
  logo_url?: string;
}
