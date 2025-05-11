import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCartItemDto {
  @ApiProperty({ example: 1, description: 'ID of the cart item' })
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  product_variant_id: number;

  @ApiProperty({
    example: 1,
    description: 'Quantity of the cart item',
    default: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  quantity?: number = 1;
}
