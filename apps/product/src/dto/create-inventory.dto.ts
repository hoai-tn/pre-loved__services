import { IsInt, IsOptional, IsString, Min, IsNotEmpty } from 'class-validator';

export class CreateInventoryDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsInt()
  @Min(0)
  availableStock: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minimumStock?: number;

  @IsOptional()
  @IsString()
  location?: string;
}
