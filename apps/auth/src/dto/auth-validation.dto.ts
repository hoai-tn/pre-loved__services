import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AuthValidationRequestDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class AuthValidationResponseDto {
  @IsBoolean()
  valid: boolean;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @IsOptional()
  @IsString()
  error?: string;
}

export class UserInfoResponseDto {
  @IsString()
  id: string;

  @IsString()
  email: string;

  @IsArray()
  @IsString({ each: true })
  roles: string[];

  // TODO: Add more user properties as needed
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}

export class RefreshTokenRequestDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class RefreshTokenResponseDto {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;

  @IsOptional()
  @IsString()
  tokenType?: string = 'Bearer';

  @IsOptional()
  expiresIn?: number;
}
