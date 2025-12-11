import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

class CreateOrderDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'Quantity', example: 1 })
  @IsNumber()
  quantity: number;
}
export default CreateOrderDto;
