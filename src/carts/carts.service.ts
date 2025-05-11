import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CartsService {
  constructor(private prisma: PrismaService) {}

  async getUserCart(userId: number) {
    // Find active cart for user or create a new one
    let cart = await this.prisma.carts.findFirst({
      where: {
        user_id: userId,
        status: 'active',
        isDeleted: false,
      },
    });

    if (!cart) {
      cart = await this.prisma.carts.create({
        data: {
          user_id: userId,
          status: 'active',
        },
      });
    }

    // Get cart items with product variants and products
    const cartWithItems = await this.prisma.carts.findUnique({
      where: { id: cart.id },
      include: {
        cart_items: {
          where: { isDeleted: false },
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

    // Calculate total
    const cartItems = cartWithItems?.cart_items.map((item) => {
      const product = item.product_variants.products;
      const price = (product.discount_price || product.price).plus(
        item.product_variants.additional_price || 0,
      );

      return {
        ...item,
        price,
        subtotal: price.times(item.quantity),
        product: product,
      };
    });

    const total = cartItems?.reduce(
      (sum, item) => sum.plus(item.subtotal),
      new Decimal(0),
    );
    const itemCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0);

    return {
      ...cartWithItems,
      cart_items: cartItems,
      total,
      itemCount,
    };
  }

  async addItemToCart(userId: number, createCartItemDto: CreateCartItemDto) {
    // Check if product variant exists or not
    const productVariant = await this.prisma.product_variants.findUnique({
      where: { id: createCartItemDto.product_variant_id },
      include: {
        products: true,
      },
    });

    if (!productVariant || productVariant.isDeleted) {
      throw new NotFoundException(
        `Product variant with ID ${createCartItemDto.product_variant_id} not found`,
      );
    }

    if (createCartItemDto.quantity == null) {
      throw new BadRequestException(`Quantiry is required!`);
    }

    if (productVariant.stock_quantity < createCartItemDto.quantity) {
      throw new NotFoundException(
        `Product variant with ID ${productVariant.stock_quantity} not found`,
      );
    }

    if (!productVariant.products.is_active) {
      throw new BadRequestException(`Product is not available for purchase`);
    }

    let cart = await this.prisma.carts.findFirst({
      where: {
        user_id: userId,
        status: 'active',
        isDeleted: false,
      },
    });

    if (!cart) {
      cart = await this.prisma.carts.create({
        data: {
          user_id: userId,
          status: 'active',
        },
      });
    }

    const product = productVariant.products;
    const price = (product.discount_price || product.price).plus(
      productVariant.additional_price || 0,
    );

    const existingCartItem = await this.prisma.cart_items.findFirst({
      where: {
        cart_id: cart.id,
        product_variant_id: productVariant.id,
        isDeleted: false,
      },
    });

    if (existingCartItem) {
      const newQuantity =
        existingCartItem.quantity + createCartItemDto.quantity;

      if (productVariant.stock_quantity < newQuantity) {
        throw new BadRequestException(
          `Not enough stock. Available: ${productVariant.stock_quantity}`,
        );
      }

      const updatedCartItem = await this.prisma.cart_items.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: newQuantity,
          price,
        },
      });

      return this.getUserCart(userId);
    } else {
      const newCartItem = await this.prisma.cart_items.create({
        data: {
          cart_id: cart.id,
          product_variant_id: productVariant.id,
          quantity: createCartItemDto.quantity,
          price,
        },
      });

      return this.getUserCart(userId);
    }
  }

  async updateCartItem(
    userId: number,
    cartItemId: number,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    const cart = await this.prisma.carts.findFirst({
      where: {
        user_id: userId,
        status: 'active',
        isDeleted: false,
      },
    });

    if (!cart) {
      throw new NotFoundException('Active cart not found');
    }

    const cartItem = await this.prisma.cart_items.findFirst({
      where: {
        id: cartItemId,
        cart_id: cart.id,
        isDeleted: false,
      },
      include: {
        product_variants: true,
      },
    });

    if (
      !cartItem?.product_variants ||
      cartItem.product_variants.stock_quantity == null ||
      cartItem.product_variants.stock_quantity < updateCartItemDto.quantity
    ) {
      throw new BadRequestException(
        `Not enough stock. Avilable: ${cartItem?.product_variants.stock_quantity}`,
      );
    }

    await this.prisma.cart_items.update({
      where: { id: cartItemId },
      data: {
        quantity: updateCartItemDto.quantity,
      },
    });

    return this.getUserCart(userId);
  }

  async removeCartItem(userId: number, cartItemId: number) {
    const cart = await this.prisma.carts.findFirst({
      where: {
        user_id: userId,
        status: 'active',
        isDeleted: false,
      },
    });

    if (!cart) {
      throw new NotFoundException('Active cart not found');
    }

    const cartItem = await this.prisma.cart_items.findFirst({
      where: {
        id: cartItemId,
        cart_id: cart.id,
        isDeleted: false,
      },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }

    await this.prisma.cart_items.update({
      where: { id: cartItemId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    return this.getUserCart(userId);
  }

  async clearCart(userId: number) {
    const cart = await this.prisma.carts.findFirst({
      where: {
        user_id: userId,
        status: 'active',
        isDeleted: false,
      },
    });

    if (!cart) {
      throw new NotFoundException('Active cart not found');
    }

    await this.prisma.cart_items.updateMany({
      where: {
        cart_id: cart.id,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    return { message: 'Cart cleared successfully' };
  }
}
