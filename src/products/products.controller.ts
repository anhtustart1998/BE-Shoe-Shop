import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateProductWithImagesDto } from './dto/create-product-with-images.dto';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { AddMultipleProductImagesDto } from './dto/add-multiple-product-images.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ProductResponseDto } from './dto/product-response.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('👟 Product Management')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  @ApiCreatedResponse({
    description: 'The product has been successfully created.',
    type: ProductResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Bad request. Invalid input data.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires admin role.' })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all products with filtering, sorting, and pagination',
  })
  @ApiOkResponse({
    description: 'Products retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProductResponseDto' },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiOkResponse({
    description: 'Product retrieved successfully.',
    type: ProductResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product (Admin only)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiOkResponse({
    description: 'Product updated successfully.',
    type: ProductResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Bad request. Invalid input data.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires admin role.' })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product (Admin only)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiOkResponse({
    description: 'Product deleted successfully.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Product with ID 1 deleted successfully',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires admin role.' })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  //   Product Images Routes
  @Post('images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add an image to a product (Admin only)' })
  @ApiCreatedResponse({
    description: 'Product image added successfully.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        product_id: { type: 'number' },
        image_url: { type: 'string' },
        is_primary: { type: 'boolean' },
        display_order: { type: 'number' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Bad request. Invalid input data.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires admin role.' })
  async addProductImage(@Body() createProductImageDto: CreateProductImageDto) {
    return this.productsService.addProductImage(createProductImageDto);
  }

  @Delete('images/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove an image from a product (Admin only)' })
  @ApiParam({ name: 'id', description: 'Product Image ID' })
  @ApiOkResponse({
    description: 'Product image deleted successfully.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Product image with ID 1 deleted successfully',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires admin role.' })
  @ApiNotFoundResponse({ description: 'Product image not found.' })
  async removeProductImage(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.removeProductImage(id);
  }

  //   Product Variants Routes
  @Post('variants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a variant to a product (Admin only)' })
  @ApiCreatedResponse({
    description: 'Product variant added successfully.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        product_id: { type: 'number' },
        size: { type: 'string' },
        color: { type: 'string' },
        additional_price: { type: 'number' },
        stock_quantity: { type: 'number' },
        sku: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Bad request. Invalid input data.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires admin role.' })
  async addProductVariant(
    @Body() createProductVariantDto: CreateProductVariantDto,
  ) {
    return this.productsService.addProductVariant(createProductVariantDto);
  }

  @Patch('variants/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product variant (Admin only)' })
  @ApiParam({ name: 'id', description: 'Product Variant ID' })
  @ApiOkResponse({
    description: 'Product variant updated successfully.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        product_id: { type: 'number' },
        size: { type: 'string' },
        color: { type: 'string' },
        additional_price: { type: 'number' },
        stock_quantity: { type: 'number' },
        sku: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Bad request. Invalid input data.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires admin role.' })
  @ApiNotFoundResponse({ description: 'Product variant not found.' })
  updateProductVariant(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductVariantDto: UpdateProductVariantDto,
  ) {
    return this.productsService.updateProductVariant(
      id,
      updateProductVariantDto,
    );
  }

  @Delete('variants/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a variant from a product (Admin only)' })
  @ApiParam({ name: 'id', description: 'Product Variant ID' })
  @ApiOkResponse({
    description: 'Product variant deleted successfully.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Product variant with ID 1 deleted successfully',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires admin role.' })
  @ApiNotFoundResponse({ description: 'Product variant not found.' })
  async removeProductVariant(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.removeProductVariant(id);
  }

  @Get(':id/images')
  @ApiOperation({ summary: 'Get all images for a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiOkResponse({
    description: 'Product images retrieved successfully.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          product_id: { type: 'number' },
          image_url: { type: 'string' },
          is_primary: { type: 'boolean' },
          display_order: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  getAllProductImages(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getAllProductImages(id);
  }

  @Post(':id/images/batch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add multiple images to a product (Admin only)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiCreatedResponse({
    description: 'Product images added successfully.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          product_id: { type: 'number' },
          image_url: { type: 'string' },
          is_primary: { type: 'boolean' },
          display_order: { type: 'number' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Bad request. Invalid input data.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires admin role.' })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  addMultipleProductImages(
    @Param('id', ParseIntPipe) id: number,
    @Body() addMultipleProductImagesDto: AddMultipleProductImagesDto,
  ) {
    return this.productsService.addMultipleProductImages(
      id,
      addMultipleProductImagesDto,
    );
  }

  @Post('with-images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FilesInterceptor('images', 8)) // Max 8 files with field name 'images'
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product with images (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Nike Air Max' },
        description: { type: 'string', example: 'Comfortable running shoes' },
        price: { type: 'number', example: 129.99 },
        discount_price: { type: 'number', example: 99.99 },
        category_id: { type: 'integer', example: 1 },
        brand_id: { type: 'integer', example: 1 },
        stock_quantity: { type: 'integer', example: 100 },
        is_featured: { type: 'boolean', example: true },
        is_active: { type: 'boolean', example: true },
        image_metadata: {
          type: 'string',
          example:
            '[{"is_primary": true, "display_order": 1}, {"is_primary": false, "display_order": 2}]',
          description: 'JSON string of image metadata',
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          maxItems: 8,
          description: 'Product images (max 8 files)',
        },
      },
      required: ['name', 'price', 'category_id', 'brand_id'],
    },
  })
  @ApiCreatedResponse({
    description: 'The product has been successfully created with images.',
    type: ProductResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request. Invalid input data or too many images.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires admin role.' })
  createProductWithImages(
    @Body() createProductDto: CreateProductWithImagesDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productsService.createProductWithImages(
      createProductDto,
      files,
    );
  }
}
