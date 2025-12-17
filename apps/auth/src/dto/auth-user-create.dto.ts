import { IsNotEmpty, IsString } from 'class-validator';

export class AuthUserCreateDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
