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
  ParseBoolPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CategoryResponseDto } from './dto/category-response.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('*️⃣ Categories Management')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category (Admin Only)' })
  @ApiCreatedResponse({
    description: 'The category has been successfully created.',
    type: CategoryResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Bad request. Invalid input data.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires admin role.' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiQuery({
    name: 'includeSubcategories',
    required: false,
    description: 'Include subcategories in the response',
    type: Boolean,
  })
  @ApiOkResponse({
    description: 'Categories retrieved successfully.',
    type: [CategoryResponseDto],
  })
  findAll(
    @Query('includeSubcategories', new ParseBoolPipe({ optional: true }))
    includeSubcategories?: boolean,
  ) {
    return this.categoriesService.findAll(includeSubcategories);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiQuery({
    name: 'includeSubcategories',
    required: false,
    type: Boolean,
    description: 'Whether to include subcategories in the response',
  })
  @ApiOkResponse({
    description: 'Category retrieved successfully.',
    type: CategoryResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Category not found.' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeSubcategories', new ParseBoolPipe({ optional: true }))
    includeSubcategories?: boolean,
  ) {
    return this.categoriesService.findOne(id, includeSubcategories);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category by ID (Admin Only)' })
  @ApiOkResponse({
    description: 'Category updated successfully.',
    type: CategoryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request. Invalid input data or circular reference.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires admin role.' })
  @ApiNotFoundResponse({ description: 'Category not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a category (Admin only)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiOkResponse({
    description: 'Category deleted successfully.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Category with ID 1 deleted successfully',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Bad request. Category has associated products or subcategories.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires admin role.' })
  @ApiNotFoundResponse({ description: 'Category not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
