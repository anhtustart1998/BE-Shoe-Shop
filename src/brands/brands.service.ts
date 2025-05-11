import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { isDecimal } from 'class-validator';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBrandDto: CreateBrandDto) {
    // Check if the brand with the same name already exists
    const existingBrand = await this.prisma.brands.findFirst({
      where: {
        name: createBrandDto.name,
        isDeleted: false,
      },
    });

    if (existingBrand) {
      throw new BadRequestException(
        `Brand with name ${createBrandDto.name} already exists`,
      );
    }

    return this.prisma.brands.create({
      data: createBrandDto,
    });
  }

  async findAll() {
    return this.prisma.brands.findMany({
      where: {
        isDeleted: false,
      },
    });
  }

  async findOne(id: number) {
    const brand = await this.prisma.brands.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with id ${id} not found`);
    }
    return brand;
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    await this.findOne(id);

    if (updateBrandDto.name) {
      const existingBrand = await this.prisma.brands.findFirst({
        where: {
          name: updateBrandDto.name,
          isDeleted: false,
          id: { not: id },
        },
      });

      if (existingBrand) {
        throw new BadRequestException(
          `Brand with name ${updateBrandDto.name} already exists`,
        );
      }
    }

    return this.prisma.brands.update({
      where: { id },
      data: updateBrandDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const productCount = await this.prisma.products.count({
      where: {
        brand_id: id,
        isDeleted: false,
      },
    });

    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete brand with id ${id} because it is associated with products`,
      );
    }

    await this.prisma.brands.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
    return { messsge: `Brand with id ${id} deleted successfully` };
  }
}
