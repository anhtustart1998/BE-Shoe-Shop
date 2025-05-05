import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createProduct(createProductDto: CreateProductDto) {
    const category = await this.prisma.categories.findUnique({
      where: { id: createProductDto.category_id },
    });

    if (!category) {
      throw new BadRequestException(
        `Category with ID ${createProductDto.category_id} not found`,
      );
    }

    const brand = await this.prisma.brands.findUnique({
      where: { id: createProductDto.brand_id },
    });

    if (!brand) {
      throw new BadRequestException(
        `Brand with ID ${createProductDto.brand_id} not found`,
      );
    }

    const product = await this.prisma.products.create({
      data: createProductDto,
      include: {
        categories: true,
        brands: true,
      },
    });

    return product;
  }

  async findAll(query: ProductQueryDto) {
    const {
      search,
      category_id,
      brand_id,
      min_price,
      max_price,
      sort_by,
      sort_direction,
      page = 1,
      limit = 10,
    } = query;

    const where: any = {
      isDeleted: false,
    };

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (category_id) {
      where.category_id = category_id;
    }

    if (brand_id) {
      where.brand_id = brand_id;
    }

    if (min_price !== undefined || max_price !== undefined) {
      where.price = {};
      if (min_price !== undefined) {
        where.price.gte = min_price;
      }

      if (max_price !== undefined) {
        where.price.lte = max_price;
      }
    }

    const orderBy: any = {};

    if (sort_by) {
      orderBy[sort_by] = sort_direction || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const skip = (page - 1) * limit;
    const total = await this.prisma.products.count({ where });

    const products = await this.prisma.products.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        categories: true,
        brands: true,
        product_images: {
          where: { isDeleted: false },
          orderBy: { display_order: 'asc' },
        },
      },
    });

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.products.findUnique({
      where: { id },
      include: {
        categories: true,
        brands: true,
        product_images: {
          where: { isDeleted: false },
          orderBy: { display_order: 'asc' },
        },
        product_variants: {
          where: { isDeleted: false },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    if (updateProductDto.category_id) {
      const category = await this.prisma.categories.findUnique({
        where: { id: updateProductDto.category_id },
      });

      if (!category) {
        throw new BadRequestException(
          `Category with ID ${updateProductDto.category_id} not found`,
        );
      }
    }

    if (updateProductDto.brand_id) {
      const brand = await this.prisma.brands.findUnique({
        where: { id: updateProductDto.brand_id },
      });

      if (!brand) {
        throw new BadRequestException(
          `Brand with ID ${updateProductDto.brand_id} not found`,
        );
      }
    }

    const updatedProduct = await this.prisma.products.update({
      where: { id },
      data: updateProductDto,
      include: {
        categories: true,
        brands: true,
        product_images: {
          where: { isDeleted: false },
          orderBy: { display_order: 'asc' },
        },
        product_variants: {
          where: { isDeleted: false },
        },
      },
    });
    return updatedProduct;
  }

  async remove(id: number) {
    await this.findOne(id); // Check if the product exists
    await this.prisma.products.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return { message: `Product with ID ${id} deleted successfully` };
  }

  async addProductImage(createProductImageDto: CreateProductImageDto) {
    // check if the product exists
    await this.findOne(createProductImageDto.product_id);

    // If is_primary is true, set all other images for false
    if (createProductImageDto.is_primary) {
      await this.prisma.product_images.updateMany({
        where: {
          product_id: createProductImageDto.product_id,
          isDeleted: false,
        },
        data: { is_primary: false },
      });
    }

    // Create product image
    const image = await this.prisma.product_images.create({
      data: createProductImageDto,
    });
    return image;
  }

  async removeProductImage(id: number) {
    // Check if image exists
    const image = await this.prisma.product_images.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    // Soft delete the image
    await this.prisma.product_images.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return { message: `Image with ID ${id} deleted successfully` };
  }

  async addProductVariant(createProductVariantDto: CreateProductVariantDto) {
    // Check if the product exists
    await this.findOne(createProductVariantDto.product_id);

    // Chekc if variant with the same size and color already exists
    const existingVariant = await this.prisma.product_variants.findFirst({
      where: {
        product_id: createProductVariantDto.product_id,
        size: createProductVariantDto.size,
        color: createProductVariantDto.color,
        isDeleted: false,
      },
    });

    if (existingVariant) {
      throw new BadRequestException(
        `Variant with size ${createProductVariantDto.size} and color ${createProductVariantDto.color} already exists`,
      );
    }

    // Create product variant
    const variant = await this.prisma.product_variants.create({
      data: createProductVariantDto,
    });

    return variant;
  }

  async updateProductVariant(
    id: number,
    updateData: Partial<CreateProductVariantDto>,
  ) {
    // Check if variant exists
    const variant = await this.prisma.product_variants.findUnique({
      where: { id },
    });

    if (!variant) {
      throw new NotFoundException(`Variant with ID ${id} not found`);
    }

    // Update variant
    const updatedVariant = await this.prisma.product_variants.update({
      where: { id },
      data: updateData,
    });

    return updatedVariant;
  }

  async removeProductVariant(id: number) {
    // Check if variant exists
    const variant = await this.prisma.product_variants.findUnique({
      where: { id },
    });

    if (!variant) {
      throw new NotFoundException(`Variant with ID ${id} not found`);
    }

    // Soft delete the variant
    await this.prisma.product_variants.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return { message: `Variant with ID ${id} deleted successfully` };
  }
}
