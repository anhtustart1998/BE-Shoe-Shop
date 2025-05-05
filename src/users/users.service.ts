import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.users.findUnique({ where: { email } });
  }

  async findByUsername(username: string) {
    return this.prisma.users.findUnique({ where: { username } });
  }

  async findById(id: number) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(CreateUserDto: CreateUserDto) {
    // Check if email or username already exists
    const emailExists = await this.findByEmail(CreateUserDto.email);
    if (emailExists) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(CreateUserDto.password, 10);

    const username =
      CreateUserDto.username ||
      `user_${Math.random().toString(36).substring(2, 10)}`;

    return this.prisma.users.create({
      data: {
        email: CreateUserDto.email,
        password: hashedPassword,
        username,
        first_name: CreateUserDto.first_name || '',
        last_name: CreateUserDto.last_name || '',
        phone: CreateUserDto.phone || 'null',
        role: 'customer',
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findById(id); // Check if user exists

    if (updateUserDto.email) {
      const emailExists = await this.findByEmail(updateUserDto.email);
      if (emailExists && emailExists.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    return this.prisma.users.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        username: true,
        first_name: true,
        last_name: true,
        phone: true,
        role: true,
        is_active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.findById(id);

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.users.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async getProfile(id: number) {
    return this.prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        first_name: true,
        last_name: true,
        phone: true,
        role: true,
        is_active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
