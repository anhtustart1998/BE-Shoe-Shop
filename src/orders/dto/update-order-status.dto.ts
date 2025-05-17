import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum FulfillmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  SHIPPED = 'shipped',
  DELIVERY = 'delivery',
  CANCELLED = 'cancelled',
}

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: PaymentStatus,
    description: 'Payment status of the order',
  })
  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  payment_status: PaymentStatus;

  @ApiProperty({
    enum: FulfillmentStatus,
    description: 'Fulfillment status of the order',
  })
  @IsEnum(FulfillmentStatus)
  @IsNotEmpty()
  fulfillment_status: FulfillmentStatus;
}
