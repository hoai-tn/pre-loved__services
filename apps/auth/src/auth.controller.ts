import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AUTH_MESSAGE_PATTERNS } from 'libs/constant/message-pattern-auth.constant';
import { AuthService } from './auth.service';
import { TokenKeyService } from './token-key/token-key.service';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenKeyService: TokenKeyService,
  ) {}

  @MessagePattern(AUTH_MESSAGE_PATTERNS.CREATE_USER_AUTH_TOKEN)
  createUserAuthToken() {
    const tokenKey = this.tokenKeyService.generateTokenKey('1', '2');
    return tokenKey;
  }
}
