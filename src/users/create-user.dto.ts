import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  // @ApiPropertyOptional({
  //   example: 'johndoe',
  //   description: 'The username of the user',
  // })
  @IsString()
  @IsOptional()
  username?: string;

  // @ApiPropertyOptional({
  //   example: 'John',
  //   description: 'The first name of the user',
  // })
  @IsString()
  @IsOptional()
  first_name?: string;

  // @ApiPropertyOptional({
  //   example: 'Doe',
  //   description: 'The last name of the user',
  // })
  @IsString()
  @IsOptional()
  last_name?: string;

  // @ApiPropertyOptional({
  //   example: '1234567890',
  //   description: 'The phone number of the user',
  // })
  @IsString()
  @IsOptional()
  phone?: string;
}
