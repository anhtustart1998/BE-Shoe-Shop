import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { CartResponseDto } from './dto/cart-response.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('🛒 Cart Management')
@Controller('carts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user cart' })
  @ApiOkResponse({
    description: 'Cart retrieved successfully.',
    type: CartResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  getUserCart(@GetUser('id') userId: number) {
    return this.cartsService.getUserCart(userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiCreatedResponse({
    description: 'Item added to cart successfully.',
    type: CartResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Bad request. Invalid input data, product not active, or not enough stock.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiNotFoundResponse({ description: 'Product variant not found.' })
  addItemToCart(
    @GetUser('id') userId: number,
    @Body() createCartItemDto: CreateCartItemDto,
  ) {
    return this.cartsService.addItemToCart(userId, createCartItemDto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'id', description: 'Cart Item ID' })
  @ApiOkResponse({
    description: 'Cart item updated successfully.',
    type: CartResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request. Invalid input data or not enough stock.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiNotFoundResponse({ description: 'Cart or cart item not found.' })
  updateCartItem(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) cartItemId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartsService.updateCartItem(
      userId,
      cartItemId,
      updateCartItemDto,
    );
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'id', description: 'Cart Item ID' })
  @ApiOkResponse({
    description: 'Cart item removed successfully.',
    type: CartResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiNotFoundResponse({ description: 'Cart or cart item not found.' })
  removeCartItem(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) cartItemId: number,
  ) {
    return this.cartsService.removeCartItem(userId, cartItemId);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear cart' })
  @ApiOkResponse({
    description: 'Cart cleared successfully.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Cart cleared successfully',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiNotFoundResponse({ description: 'Cart not found.' })
  clearCart(@GetUser('id') userId: number) {
    return this.cartsService.clearCart(userId);
  }
}
