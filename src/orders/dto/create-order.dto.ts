import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: 'Address ID for delivery' })
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  address_id: number;

  @ApiPropertyOptional({
    example: 'Please handle with care',
    description: 'Special instructions fot the order',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
