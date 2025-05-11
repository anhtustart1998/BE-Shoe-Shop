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
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { BrandResponseDto } from './dto/brand-response.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('®️ Brands Management')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new brand (Admin Only)' })
  @ApiCreatedResponse({
    description: 'The brand has been successfully created.',
    type: BrandResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request. Invalid input data or brand already exists.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires admin role.' })
  create(@Body() CreateBrandDto: CreateBrandDto) {
    return this.brandsService.create(CreateBrandDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all brands' })
  @ApiOkResponse({
    description: 'Brands retrieved successfully.',
    type: [BrandResponseDto],
  })
  findAll() {
    return this.brandsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a brand by ID' })
  @ApiParam({ name: 'id', description: 'Brand ID' })
  @ApiOkResponse({
    description: 'Brand retrieved successfully.',
    type: BrandResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Brand not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a brand (Admin only)' })
  @ApiParam({ name: 'id', description: 'Brand ID' })
  @ApiOkResponse({
    description: 'Brand updated successfully.',
    type: BrandResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Bad request. Invalid input data or brand name already exists.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires admin role.' })
  @ApiNotFoundResponse({ description: 'Brand not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return this.brandsService.update(id, updateBrandDto);
  }

  @Delete('id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a brand (Admin only)' })
  @ApiParam({ name: 'id', description: 'Brand ID' })
  @ApiOkResponse({
    description: 'Brand deleted successfully.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Brand with ID 1 deleted successfully',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request. Brand has associated products.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires admin role.' })
  @ApiNotFoundResponse({ description: 'Brand not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.remove(id);
  }
}
