import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AuthUserCreateDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;
}
