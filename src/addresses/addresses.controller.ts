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
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AddressResponseDto } from './dto/address-response.dto';
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

@ApiTags('🗺️ Addresses  Management')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiCreatedResponse({
    description: 'The address has been successfully created.',
    type: AddressResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Bad request. Invalid input data.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  create(
    @GetUser('id') userId: number,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.addressesService.create(userId, createAddressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user addresses' })
  @ApiOkResponse({
    description: 'Addresses retrieved successfully.',
    type: [AddressResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  findAll(@GetUser('id') userId: number) {
    return this.addressesService.findAll(userId);
  }

  @Get('default')
  @ApiOperation({ summary: 'Get user default address' })
  @ApiOkResponse({
    description: 'Default address retrieved successfully.',
    type: AddressResponseDto,
  })
  @ApiNotFoundResponse({ description: 'No default address found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  findDefault(@GetUser('id') userId: number) {
    return this.addressesService.findDefault(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific address' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiOkResponse({
    description: 'Address retrieved successfully.',
    type: AddressResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Address not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  findOne(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addressesService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiOkResponse({
    description: 'Address updated successfully.',
    type: AddressResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Bad request. Invalid input data.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiNotFoundResponse({ description: 'Address not found.' })
  update(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(userId, id, updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiOkResponse({
    description: 'Address deleted successfully.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Address with ID 1 deleted successfully',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiNotFoundResponse({ description: 'Address not found.' })
  remove(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.addressesService.remove(userId, id);
  }

  @Patch(':id/set-default')
  @ApiOperation({ summary: 'Set an address as default' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiOkResponse({
    description: 'Address set as default successfully.',
    type: AddressResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiNotFoundResponse({ description: 'Address not found.' })
  setDefault(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addressesService.setDefault(userId, id);
  }
}
