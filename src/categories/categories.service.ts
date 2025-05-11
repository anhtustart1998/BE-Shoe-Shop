import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { categories } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Check if parent cateogry exist if provided
    if (createCategoryDto.parent_id) {
      const parentCategory = await this.prisma.categories.findUnique({
        where: { id: createCategoryDto.parent_id },
      });

      if (!parentCategory) {
        throw new BadRequestException(
          `Parent category with ID ${createCategoryDto.parent_id} does not exist`,
        );
      }
    }

    return this.prisma.categories.create({
      data: createCategoryDto,
    });
  }

  async findAll(includeSubcategories = false) {
    const categories = await this.prisma.categories.findMany({
      where: {
        parent_id: null,
        isDeleted: false,
      },
    });

    if (includeSubcategories) {
      return Promise.all(
        categories.map(async (category) => {
          return {
            ...category,
            subcategories: await this.getSubcategories(category.id),
          };
        }),
      );
    }
    return categories;
  }

  async getSubcategories(parentId: number) {
    const subcategories = await this.prisma.categories.findMany({
      where: {
        parent_id: parentId,
        isDeleted: false,
      },
    });

    return Promise.all(
      subcategories.map(async (subcategory) => {
        return {
          ...subcategory,
          subcategories: await this.getSubcategories(subcategory.id),
        };
      }),
    );
  }

  async findOne(id: number, includeSubcategories = false) {
    const category = await this.prisma.categories.findUnique({
      where: { id },
    });

    if (!category || category.isDeleted) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (includeSubcategories) {
      return {
        ...category,
        subcategories: await this.getSubcategories(category.id),
      };
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    // Check if category exists
    await this.findOne(id);

    // Check if parent category exists if provided
    if (updateCategoryDto.parent_id) {
      const parentCategory = await this.prisma.categories.findUnique({
        where: { id: updateCategoryDto.parent_id },
      });

      if (!parentCategory) {
        throw new BadRequestException(
          `Parent category with ID ${updateCategoryDto.parent_id} not found`,
        );
      }

      // Prevent circular references
      if (updateCategoryDto.parent_id === id) {
        throw new BadRequestException(`A category cannot be its own parent`);
      }

      // Check for deeper circular references
      let currentParent: categories | null = parentCategory;
      while (currentParent && currentParent.parent_id) {
        if (currentParent.parent_id === id) {
          throw new BadRequestException(
            `Circular reference detected in category hierarchy`,
          );
        }
        currentParent = await this.prisma.categories.findUnique({
          where: { id: currentParent.parent_id },
        });
      }
    }

    return this.prisma.categories.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number) {
    // check if cateogory exists
    await this.findOne(id);

    // Check if cateogory has products before deleting
    const productCount = await this.prisma.products.count({
      where: {
        category_id: id,
        isDeleted: false,
      },
    });

    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete category with ID ${id} because it has associated products`,
      );
    }

    // Check if category has subcategories before deleting
    const subcategoriesCount = await this.prisma.categories.count({
      where: {
        parent_id: id,
        isDeleted: false,
      },
    });
    if (subcategoriesCount > 0) {
      throw new BadRequestException(
        `Cannot delete category with ID ${id} because it has associated subcategories`,
      );
    }

    await this.prisma.categories.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return { message: `Category with ID ${id} deleted successfully` };
  }
}
