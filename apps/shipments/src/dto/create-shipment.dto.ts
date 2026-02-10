import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateShipmentDto {
  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsString()
  @IsNotEmpty()
  carrier: string;

  @IsNumber()
  @IsOptional()
  shipping_fee?: number;

  @IsNumber()
  @IsOptional()
  cod_amount?: number;
}
