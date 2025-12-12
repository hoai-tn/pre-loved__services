import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';

class OrderItemDto {
  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'Quantity', example: 1 })
  @IsNumber()
  quantity: number;
}

class CreateOrderDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'Items',
    example: [{ productId: 1, quantity: 1 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
export default CreateOrderDto;
