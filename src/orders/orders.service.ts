import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  UpdateOrderStatusDto,
  PaymentStatus,
  FulfillmentStatus,
} from './dto/update-order-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { CartsService } from 'src/carts/carts.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartsService: CartsService,
  ) {}

  async createOrder(userId: number, createOrderDto: CreateOrderDto) {
    // Get user's active cart
    const cart = await this.cartsService.getUserCart(userId);

    if (!cart || cart.cart_items?.length === 0) {
      throw new BadRequestException(`Cart with id of ${cart.id} is empty`);
    }

    // Check the address belongs to user
    const address = await this.prisma.addresses.findFirst({
      where: {
        id: createOrderDto.address_id,
        user_id: userId,
        isDeleted: false,
      },
    });

    if (!address) {
      throw new NotFoundException(
        `Address with ID ${createOrderDto.address_id} not found`,
      );
    }

    // Check the stock is enough or not
    for (const item of cart?.cart_items ?? []) {
      const variant = await this.prisma.product_variants.findUnique({
        where: { id: item.product_variant_id },
      });

      if (!variant || variant.stock_quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${variant?.sku}. Available: ${variant?.stock_quantity}, Required: ${item.quantity}`,
        );
      }
    }

    const orderNumber = await this.generateOrderNumber();

    const subtotal = cart.total;
    if (!subtotal) {
      throw new BadRequestException('Cart subtotal is missing');
    }
    const taxRate = 0.1; // 10 % Tax Rate
    const taxAmount = subtotal?.times(taxRate);
    const shippingAmount = (subtotal ?? new Decimal(0)).greaterThan(100)
      ? new Decimal(0)
      : new Decimal(9.99);
    const totalAmount = subtotal.plus(taxAmount).plus(shippingAmount);

    // Create order in a transaction
    const order = await this.prisma.$transaction(async (prisma) => {
      // Create order
      const newOrder = await prisma.orders.create({
        data: {
          user_id: userId,
          address_id: createOrderDto.address_id,
          order_number: orderNumber,
          total_amount: totalAmount,
          tax_amount: taxAmount,
          shipping_amount: shippingAmount,
          discount_amount: 0,
          payment_status: PaymentStatus.PENDING,
          fulfillment_status: FulfillmentStatus.PENDING,
          notes: createOrderDto.notes,
        },
      });

      // Create order items and update stock
      for (const cartItem of cart.cart_items ?? []) {
        await prisma.order_items.create({
          data: {
            order_id: newOrder.id,
            product_variant_id: cartItem.product_variant_id,
            quantity: cartItem.quantity,
            unit_price: cartItem.price,
            total_price: cartItem.subtotal,
          },
        });

        // Update product variant stock
        await prisma.product_variants.update({
          where: { id: cartItem.product_variant_id },
          data: {
            stock_quantity: {
              decrement: cartItem.quantity,
            },
          },
        });
      }

      // Mark cart as completed and clear items
      await prisma.carts.update({
        where: { id: cart.id },
        data: { status: 'completed' },
      });

      await prisma.cart_items.updateMany({
        where: { cart_id: cart.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      return newOrder;
    });

    // Return order with full details
    return this.findOne(order.id);
  }

  async findAll(userId: number, query: OrderQueryDto) {
    const { payment_status, fulfillment_status, page = 1, limit = 10 } = query;

    const where: any = {
      user_id: userId,
      isDeleted: false,
    };

    if (payment_status) {
      where.payment_status = payment_status;
    }

    if (fulfillment_status) {
      where.fulfillment_status = fulfillment_status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.prisma.orders.count({ where });

    const orders = await this.prisma.orders.findMany({
      where,
      skip,
      take: limit,
      orderBy: { order_date: 'desc' },
      include: {
        addresses: true,
        order_items: {
          include: {
            product_variants: {
              include: {
                products: {
                  include: {
                    product_images: {
                      where: { is_primary: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const order = await this.prisma.orders.findUnique({
      where: { id },
      include: {
        addresses: true,
        order_items: {
          include: {
            product_variants: {
              include: {
                products: {
                  include: {
                    product_images: {
                      where: { isDeleted: false },
                      orderBy: { display_order: 'asc' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order || order.isDeleted) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findUserOrder(userId: number, orderId: number) {
    const order = await this.findOne(orderId);

    if (order.user_id !== userId) {
      throw new NotFoundException(`Order with ID of ${orderId} not found`);
    }

    return order;
  }

  async updateOrderStatus(
    id: number,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    await this.findOne(id);

    const updatedOrder = await this.prisma.orders.update({
      where: { id },
      data: {
        payment_status: updateOrderStatusDto.payment_status,
        fulfillment_status: updateOrderStatusDto.fulfillment_status,
      },
    });

    return updatedOrder;
  }

  async cancelOrder(userId: number, orderId: number) {
    const order = await this.findUserOrder(userId, orderId);

    // Check if order can be cancelled
    if (
      order.fulfillment_status === FulfillmentStatus.DELIVERY ||
      order.fulfillment_status === FulfillmentStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Order cannot be cancelled since it is delivered or cancelled already!',
      );
    }

    await this.prisma.$transaction(async (prisma) => {
      await prisma.orders.update({
        where: { id: orderId },
        data: {
          fulfillment_status: FulfillmentStatus.CANCELLED,
        },
      });

      // Restore stock for each order item
      for (const item of order.order_items) {
        await prisma.product_variants.update({
          where: { id: item.product_variant_id },
          data: {
            stock_quantity: {
              increment: item.quantity,
            },
          },
        });
      }
    });

    return {
      message: `Order ${order.order_number} has been cancelled successfully!`,
    };
  }

  // Admin Methods
  async findAllAdmin(query: OrderQueryDto) {
    const { payment_status, fulfillment_status, page = 1, limit = 10 } = query;

    // Build where clause
    const where: any = {
      isDeleted: false,
    };

    if (payment_status) {
      where.payment_status = payment_status;
    }

    if (fulfillment_status) {
      where.fulfillment_status = fulfillment_status;
    }

    const skip = (page - 1) * limit;
    const total = await this.prisma.orders.count({ where });

    const orders = await this.prisma.orders.findMany({
      where,
      skip,
      take: limit,
      orderBy: { order_date: 'desc' },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        addresses: true,
        order_items: {
          include: {
            product_variants: {
              include: {
                products: {
                  include: {
                    product_images: {
                      where: { is_primary: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
      },
    };
  }

  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrderCount = await this.prisma.orders.count({
      where: {
        order_date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const orderNumber = `ORD-${year}${month}-${String(todayOrderCount + 1).padStart(4, '0')}`;
    return orderNumber;
  }
}
