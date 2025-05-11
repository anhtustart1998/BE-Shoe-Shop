import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'Nike', description: 'Brand name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Nike is a global brand',
    description: 'Brand description',
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
