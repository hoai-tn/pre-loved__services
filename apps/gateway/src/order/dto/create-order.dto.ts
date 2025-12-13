import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

export class OrderItemDto {
  @ApiProperty({ description: 'Product ID', example: '1' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Quantity', example: 1 })
  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'Items',
    example: [{ productId: '1', quantity: 1 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
