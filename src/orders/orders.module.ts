import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PrismaModule } from 'prisma/prisma.module';
import { CartsModule } from 'src/carts/carts.module';

@Module({
  imports: [PrismaModule, CartsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
