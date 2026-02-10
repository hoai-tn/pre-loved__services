import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

// ============================================================================
// ADDRESS DTOs
// ============================================================================

export class CreateAddressDto {
  @ApiProperty({ description: 'Province name', example: 'Ho Chi Minh' })
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiProperty({ description: 'District name', example: 'District 1' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiPropertyOptional({ description: 'Ward name', example: 'Ben Nghe' })
  @IsString()
  @IsOptional()
  ward?: string;

  @ApiPropertyOptional({
    description: 'Street address',
    example: '123 Nguyen Hue',
  })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiPropertyOptional({
    description: 'Detail address',
    example: 'Apartment 4B, Floor 10',
  })
  @IsString()
  @IsOptional()
  detail?: string;

  @ApiProperty({ description: 'Phone number', example: '0901234567' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({
    description: 'Full text address',
    example: '123 Nguyen Hue, Ben Nghe, District 1, Ho Chi Minh',
  })
  @IsString()
  @IsOptional()
  full_text?: string;
}

export class UpdateAddressDto {
  @ApiPropertyOptional({ description: 'Province name', example: 'Ho Chi Minh' })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({ description: 'District name', example: 'District 1' })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiPropertyOptional({ description: 'Ward name', example: 'Ben Nghe' })
  @IsString()
  @IsOptional()
  ward?: string;

  @ApiPropertyOptional({
    description: 'Street address',
    example: '123 Nguyen Hue',
  })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiPropertyOptional({
    description: 'Detail address',
    example: 'Apartment 4B, Floor 10',
  })
  @IsString()
  @IsOptional()
  detail?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '0901234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Full text address',
    example: '123 Nguyen Hue, Ben Nghe, District 1, Ho Chi Minh',
  })
  @IsString()
  @IsOptional()
  full_text?: string;
}

// ============================================================================
// SHIPMENT DTOs
// ============================================================================

export class CreateShipmentDto {
  @ApiProperty({
    description: 'Order ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  order_id: string;

  @ApiProperty({
    description: 'Shipping carrier code',
    example: 'GHN',
  })
  @IsString()
  @IsNotEmpty()
  carrier: string;

  @ApiPropertyOptional({
    description: 'Shipping fee',
    example: 30000,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  shipping_fee?: number;

  @ApiPropertyOptional({
    description: 'Cash on delivery amount',
    example: 500000,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  cod_amount?: number;
}
