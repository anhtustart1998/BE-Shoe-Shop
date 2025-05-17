import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createAddressDto: CreateAddressDto) {
    if (createAddressDto.is_default) {
      await this.prisma.addresses.updateMany({
        where: {
          user_id: userId,
          isDeleted: false,
        },
        data: {
          is_default: false,
        },
      });
    }

    const address = await this.prisma.addresses.create({
      data: {
        ...createAddressDto,
        user_id: userId,
        is_default:
          createAddressDto.is_default !== undefined
            ? createAddressDto.is_default
            : await this.isFirstAddress(userId),
      },
    });

    return address;
  }

  async findAll(userId: number) {
    return this.prisma.addresses.findMany({
      where: { user_id: userId, isDeleted: false },
      orderBy: [{ is_default: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(userId: number, id: number) {
    const address = await this.prisma.addresses.findFirst({
      where: {
        id,
        user_id: userId,
        isDeleted: false,
      },
    });

    if (!address) {
      throw new NotFoundException(`Address with id of ${id} not found`);
    }

    return address;
  }

  async findDefault(userId: number) {
    return await this.prisma.addresses.findFirst({
      where: {
        user_id: userId,
        is_default: true,
        isDeleted: false,
      },
    });
  }

  async update(userId: number, id: number, updateAddressDto: UpdateAddressDto) {
    await this.findOne(userId, id);

    if (updateAddressDto.is_default) {
      await this.prisma.addresses.updateMany({
        where: {
          user_id: userId,
          id: { not: id },
          isDeleted: false,
        },
        data: {
          is_default: false,
        },
      });
    }

    const updateAddress = await this.prisma.addresses.update({
      where: {
        id,
      },
      data: updateAddressDto,
    });

    return updateAddress;
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);

    const address = await this.prisma.addresses.findUnique({
      where: { id },
    });

    await this.prisma.addresses.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    // If this was the default address, make another address default

    if (address?.is_default) {
      const nextAddress = await this.prisma.addresses.findFirst({
        where: {
          user_id: userId,
          isDeleted: false,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      if (nextAddress) {
        await this.prisma.addresses.update({
          where: { id: nextAddress.id },
          data: { is_default: true },
        });
      }
    }

    return { message: `Address with ID of ${id} update successfully.` };
  }

  async setDefault(userId: number, id: number) {
    // Check if address exist
    await this.findOne(userId, id);

    // Unset all other addresses as default
    await this.prisma.addresses.updateMany({
      where: {
        user_id: userId,
        id: { not: id },
        isDeleted: false,
      },
      data: {
        is_default: false,
      },
    });

    // Set this address as default
    const updateAddress = await this.prisma.addresses.update({
      where: { id },
      data: {
        is_default: true,
      },
    });

    return updateAddress;
  }

  private async isFirstAddress(userId: number): Promise<boolean> {
    const addressCount = await this.prisma.addresses.count({
      where: {
        user_id: userId,
        isDeleted: false,
      },
    });

    return addressCount === 0;
  }
}
