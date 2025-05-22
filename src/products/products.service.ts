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
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { AddMultipleProductImagesDto } from './dto/add-multiple-product-images.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateProductWithImagesDto } from './dto/create-product-with-images.dto';
import { ImageMetadata } from './interfaces/image-metadata.interface';
import { product_images } from '@prisma/client';

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
    updateProductVariantDto: UpdateProductVariantDto,
  ) {
    // Check if variant exists
    const variant = await this.prisma.product_variants.findUnique({
      where: { id },
    });

    if (!variant) {
      throw new NotFoundException(`Product variant with ID ${id} not found`);
    }

    // Update variant
    const updatedVariant = await this.prisma.product_variants.update({
      where: { id },
      data: updateProductVariantDto,
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

  async getAllProductImages(productId: number) {
    await this.findOne(productId);

    const images = await this.prisma.product_images.findMany({
      where: {
        product_id: productId,
        isDeleted: false,
      },
      orderBy: {
        display_order: 'asc',
      },
    });
    return images;
  }

  async addMultipleProductImages(
    productId: number,
    imagesDto: AddMultipleProductImagesDto,
  ) {
    // Verify product exists
    await this.findOne(productId);

    // If any image is marked as primary, unset all other primary images
    const hasPrimaryImage = imagesDto.images.some((img) => img.is_primary);
    if (hasPrimaryImage) {
      await this.prisma.product_images.updateMany({
        where: {
          product_id: productId,
          isDeleted: false,
        },
        data: { is_primary: false },
      });
    }

    // For images without a display order, find the current highest display order
    let highestDisplayOrder = 0;
    const existingImages = await this.prisma.product_images.findMany({
      where: {
        product_id: productId,
        isDeleted: false,
      },
      orderBy: {
        display_order: 'desc',
      },
      take: 1,
    });

    if (existingImages.length > 0) {
      highestDisplayOrder = existingImages[0].display_order;
    }

    // Create each image with proper display order if not provided
    const createdImages = await Promise.all(
      imagesDto.images.map(async (image, index) => {
        return this.prisma.product_images.create({
          data: {
            product_id: productId,
            image_url: image.image_url,
            is_primary: image.is_primary || false,
            display_order:
              image.display_order !== undefined
                ? image.display_order
                : highestDisplayOrder + index + 1,
          },
        });
      }),
    );

    return createdImages;
  }

  async createProductWithImages(
    createProductDto: CreateProductWithImagesDto,
    imageFiles: Express.Multer.File[],
  ) {
    // Validate maximum number of images
    if (imageFiles && imageFiles.length > 8) {
      throw new BadRequestException('Maximum 8 images allowed per product');
    }

    // Check if category exists
    const category = await this.prisma.categories.findUnique({
      where: { id: createProductDto.category_id },
    });

    if (!category) {
      throw new BadRequestException(
        `Category with ID ${createProductDto.category_id} not found`,
      );
    }

    // Check if brand exists
    const brand = await this.prisma.brands.findUnique({
      where: { id: createProductDto.brand_id },
    });

    if (!brand) {
      throw new BadRequestException(
        `Brand with ID ${createProductDto.brand_id} not found`,
      );
    }

    // Parse image metadata if provided
    let imageMetadata: ImageMetadata[] = [];
    if (createProductDto.image_metadata) {
      try {
        imageMetadata = JSON.parse(createProductDto.image_metadata);
      } catch (error) {
        throw new BadRequestException('Invalid image_metadata JSON format');
      }
    }

    // Create product and upload images in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create the product first
      const product = await prisma.products.create({
        data: {
          name: createProductDto.name,
          description: createProductDto.description,
          price: createProductDto.price,
          discount_price: createProductDto.discount_price,
          category_id: createProductDto.category_id,
          brand_id: createProductDto.brand_id,
          stock_quantity: createProductDto.stock_quantity || 0,
          is_featured: createProductDto.is_featured || false,
          is_active: createProductDto.is_active !== false,
        },
      });

      // Upload images if provided
      const uploadedImages: product_images[] = [];
      if (imageFiles && imageFiles.length > 0) {
        // Ensure we have a primary image
        let hasPrimaryImage = false;
        if (imageMetadata.length > 0) {
          hasPrimaryImage = imageMetadata.some((meta) => meta.is_primary);
        }

        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const metadata = imageMetadata[i] || {};

          try {
            const uploadResult = await this.cloudinaryService.uploadFile(
              file,
              'products',
            );

            const productImage = await prisma.product_images.create({
              data: {
                product_id: product.id,
                image_url: uploadResult.secure_url,
                is_primary:
                  metadata.is_primary || (!hasPrimaryImage && i === 0),
                display_order: metadata.display_order || i + 1,
              },
            });

            uploadedImages.push(productImage);

            if (metadata.is_primary || (!hasPrimaryImage && i === 0)) {
              hasPrimaryImage = true;
            }
          } catch (error) {
            console.error(`Failed to upload image ${i + 1}:`, error);
          }
        }
      }

      return { product, images: uploadedImages };
    });

    return this.findOne(result.product.id);
  }
}
