import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AUTH_MESSAGE_PATTERNS } from 'libs/constant/message-pattern-auth.constant';
import { AuthService } from './auth.service';
import { AuthUserCreateDto } from './dto/auth-user-create.dto';
import { TokenKeyService } from './token-key/token-key.service';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenKeyService: TokenKeyService,
  ) {}

  @MessagePattern(AUTH_MESSAGE_PATTERNS.CREATE_USER_AUTH_TOKEN)
  async createUserAuthToken(payload: AuthUserCreateDto) {
    const tokenKey = this.tokenKeyService.generateTokenKey(payload);
    // await this.authService.createUserAuthToken({
    //   id: 1,
    //   username: payload.username,
    //   email: payload.email,
    //   password: 'render password',
    //   isActive: true,
    //   name: 'John Doe',
    //   avatar: 'https://example.com/avatar.jpg',
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // });
    return tokenKey;
  }
}
