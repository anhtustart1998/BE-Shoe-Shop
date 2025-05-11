import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCartItemDto {
  @ApiProperty({ example: 1, description: 'ID of the cart item' })
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  quantity: number;
}
