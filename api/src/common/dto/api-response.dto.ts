import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Success' })
  message: string;

  @ApiProperty()
  data: T;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp: string;
}

export class PaginatedResponseDto<T> {
  @ApiProperty()
  data: T[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: ['Validation failed'] })
  message: string[];

  @ApiProperty({ example: 'BadRequestException' })
  error: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp: string;
}
