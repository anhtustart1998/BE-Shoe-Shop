import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({
    description: 'The public ID of the uploaded image',
    example: 'uploads/abc123',
  })
  public_id: string;

  @ApiProperty({
    description: 'The URL of the uploaded image',
    example:
      'https://res.cloudinary.com/demo/image/upload/v1/uploads/abc123.jpg',
  })
  secure_url: string;

  @ApiProperty({
    description: 'The format of the uploaded image',
    example: 'jpg',
  })
  format: string;

  @ApiProperty({ description: 'The width of the uploaded image', example: 800 })
  width: number;

  @ApiProperty({
    description: 'The height of the uploaded image',
    example: 600,
  })
  height: number;

  @ApiProperty({
    description: 'The size of the uploaded image in bytes',
    example: 123456,
  })
  bytes: number;

  @ApiProperty({
    description: 'The creation timestamp',
    example: '2023-01-01T00:00:00Z',
  })
  created_at: string;
}
